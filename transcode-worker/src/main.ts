import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pipeline } from 'node:stream/promises';
import process from 'node:process';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const config = {
  db: {
    host: process.env.DATABASE_HOST ?? 'upload-db',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? 'root',
    database: process.env.DATABASE_NAME ?? 'upload_db',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'http://minio:9000',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    rawBucket: process.env.MINIO_RAW_UPLOADS_BUCKET ?? 'raw-uploads',
    streamingBucket: process.env.MINIO_STREAMING_ASSETS_BUCKET ?? 'streaming-assets',
  },
  rabbit: {
    url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672',
    exchange: process.env.RABBITMQ_EXCHANGE ?? 'video.events',
    queue: process.env.RABBITMQ_QUEUE ?? 'video.segmentation.queue',
    routingKey: process.env.RABBITMQ_ROUTING_KEY ?? 'video.uploaded',
  },
};

interface UploadEvent {
  uploadId: string;
  bucket: string;
  objectKey: string;
}

const db = new Pool(config.db);
const s3 = new S3Client({
  endpoint: config.minio.endpoint,
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.minio.accessKey,
    secretAccessKey: config.minio.secretKey,
  },
});

async function setStatus(uploadId: string, status: string, hlsPlaylistKey?: string): Promise<void> {
  if (hlsPlaylistKey) {
    await db.query(
      'UPDATE video_uploads SET status = $2, hls_playlist_key = $3, updated_at = now() WHERE id = $1',
      [uploadId, status, hlsPlaylistKey],
    );
    return;
  }

  await db.query('UPDATE video_uploads SET status = $2, updated_at = now() WHERE id = $1', [
    uploadId,
    status,
  ]);
}

async function downloadRawVideo(bucket: string, objectKey: string, outputPath: string): Promise<void> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    }),
  );

  if (!response.Body) {
    throw new Error('Could not read object body from MinIO');
  }

  await pipeline(response.Body as NodeJS.ReadableStream, createWriteStream(outputPath));
}

function runFfmpeg(inputPath: string, outputDir: string): Promise<void> {
  const outputPlaylist = join(outputDir, 'master.m3u8');

  const args = [
    '-i',
    inputPath,
    '-codec:v',
    'libx264',
    '-codec:a',
    'aac',
    '-hls_time',
    '6',
    '-hls_playlist_type',
    'vod',
    '-hls_segment_filename',
    join(outputDir, 'segment_%03d.ts'),
    outputPlaylist,
  ];

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';

    ffmpeg.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    ffmpeg.on('error', reject);
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
      }
    });
  });
}

async function uploadHlsDirectory(uploadId: string, outputDir: string): Promise<string> {
  const entries = await readdir(outputDir);
  const hlsPrefix = `${uploadId}/`;

  for (const entry of entries) {
    const filePath = join(outputDir, entry);
    const info = await stat(filePath);

    if (!info.isFile()) {
      continue;
    }

    const key = `${hlsPrefix}${entry}`;
    const body = await readFile(filePath);
    const contentType = entry.endsWith('.m3u8')
      ? 'application/vnd.apple.mpegurl'
      : 'video/mp2t';

    await s3.send(
      new PutObjectCommand({
        Bucket: config.minio.streamingBucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  return `${hlsPrefix}master.m3u8`;
}

async function processUpload(event: UploadEvent): Promise<void> {
  const tempDir = await mkdtemp(join(tmpdir(), 'stromen-transcode-'));
  const sourceExt = extname(event.objectKey) || '.mp4';
  const sourceFilename = `${basename(event.objectKey, sourceExt)}${sourceExt}`;
  const sourcePath = join(tempDir, sourceFilename);
  const hlsOutputDir = join(tempDir, 'hls');

  await setStatus(event.uploadId, 'PROCESSING');

  try {
    await mkdir(hlsOutputDir, { recursive: true });
    await downloadRawVideo(event.bucket, event.objectKey, sourcePath);

    await runFfmpeg(sourcePath, hlsOutputDir);

    const playlistKey = await uploadHlsDirectory(event.uploadId, hlsOutputDir);

    await s3.send(
      new DeleteObjectCommand({
        Bucket: event.bucket,
        Key: event.objectKey,
      }),
    );

    await setStatus(event.uploadId, 'READY', playlistKey);
  } catch (error) {
    await setStatus(event.uploadId, 'FAILED');
    throw error;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  const connection = await amqp.connect(config.rabbit.url);
  const channel = await connection.createChannel();

  const shutdown = async (): Promise<void> => {
    await channel.close();
    await connection.close();
    await db.end();
    process.exit(0);
  };

  process.on('SIGTERM', () => {
    void shutdown();
  });

  process.on('SIGINT', () => {
    void shutdown();
  });

  await channel.assertExchange(config.rabbit.exchange, 'direct', { durable: true });
  await channel.assertQueue(config.rabbit.queue, {
    durable: true,
    deadLetterExchange: '',
    deadLetterRoutingKey: process.env.RABBITMQ_DLQ ?? 'video.segmentation.dlq',
  });
  await channel.assertQueue(process.env.RABBITMQ_DLQ ?? 'video.segmentation.dlq', {
    durable: true,
  });
  await channel.bindQueue(
    config.rabbit.queue,
    config.rabbit.exchange,
    config.rabbit.routingKey,
  );

  channel.prefetch(1);

  console.log('Transcode worker listening for uploads');

  await channel.consume(config.rabbit.queue, async (msg) => {
    if (!msg) {
      return;
    }

    try {
      const event = JSON.parse(msg.content.toString()) as UploadEvent;
      await processUpload(event);
      channel.ack(msg);
    } catch (error) {
      console.error('Failed processing upload event:', error);
      channel.reject(msg, false);
    }
  });
}

main().catch((error) => {
  console.error('Transcode worker crashed:', error);
  process.exit(1);
});
