import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pipeline } from 'node:stream/promises';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  EventPattern,
  RmqContext,
  Transport,
} from '@nestjs/microservices';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Pool } from 'pg';
import { lastValueFrom } from 'rxjs';

interface UploadEvent {
  uploadId: string;
  bucket: string;
  objectKey: string;
  occurredAt?: string;
}

interface TranscodeConfig {
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  minio: {
    endpoint: string;
    publicEndpoint: string;
    accessKey: string;
    secretKey: string;
    rawBucket: string;
    streamingBucket: string;
  };
  rabbitmq: {
    url: string;
    exchange: string;
    queue: string;
    dlq: string;
  };
}

@Injectable()
export class TranscodeService implements OnModuleDestroy {
  private readonly logger = new Logger(TranscodeService.name);
  private readonly config: TranscodeConfig;
  private readonly db: Pool;
  private readonly s3: S3Client;
  private readonly publisher: ClientProxy;

  constructor() {
    this.config = {
      db: {
        host: process.env.DATABASE_HOST ?? 'upload-db',
        port: Number(process.env.DATABASE_PORT ?? 5432),
        user: process.env.DATABASE_USER ?? 'root',
        password: process.env.DATABASE_PASSWORD ?? 'root',
        database: process.env.DATABASE_NAME ?? 'upload_db',
      },
      minio: {
        endpoint: process.env.MINIO_ENDPOINT ?? 'http://minio:9000',
        publicEndpoint:
          process.env.MINIO_PUBLIC_ENDPOINT ?? process.env.MINIO_ENDPOINT ?? 'http://minio:9000',
        accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
        secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
        rawBucket: process.env.MINIO_RAW_UPLOADS_BUCKET ?? 'raw-uploads',
        streamingBucket: process.env.MINIO_STREAMING_ASSETS_BUCKET ?? 'streaming-assets',
      },
      rabbitmq: {
        url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672',
        exchange: process.env.RABBITMQ_EXCHANGE ?? 'video.events',
        queue: process.env.RABBITMQ_QUEUE ?? 'video.segmentation.queue',
        dlq: process.env.RABBITMQ_DLQ ?? 'video.segmentation.dlq',
      },
    };

    this.db = new Pool(this.config.db);
    this.s3 = new S3Client({
      endpoint: this.config.minio.endpoint,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.config.minio.accessKey,
        secretAccessKey: this.config.minio.secretKey,
      },
    });

    this.publisher = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.config.rabbitmq.url],
        queue: this.config.rabbitmq.queue,
        queueOptions: {
          durable: true,
          deadLetterExchange: '',
          deadLetterRoutingKey: this.config.rabbitmq.dlq,
        },
        exchange: this.config.rabbitmq.exchange,
        exchangeType: 'topic',
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    this.publisher.close();
    await this.db.end();
  }

  @EventPattern('video.uploaded')
  async handleVideoUploaded(payload: UploadEvent, context: RmqContext): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    if (!payload?.uploadId || !payload?.bucket || !payload?.objectKey) {
      this.logger.warn('Received invalid video.uploaded payload');
      channel.nack(message, false, false);
      return;
    }

    try {
      await this.processUpload(payload);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        'Failed processing upload event',
        error instanceof Error ? error.stack : undefined,
      );
      channel.nack(message, false, false);
    }
  }

  private async setStatus(
    uploadId: string,
    status: string,
    hlsPlaylistKey?: string,
  ): Promise<void> {
    if (hlsPlaylistKey) {
      await this.db.query(
        'UPDATE video_uploads SET status = $2, hls_playlist_key = $3, updated_at = now() WHERE id = $1',
        [uploadId, status, hlsPlaylistKey],
      );
      return;
    }

    await this.db.query('UPDATE video_uploads SET status = $2, updated_at = now() WHERE id = $1', [
      uploadId,
      status,
    ]);
  }

  private async downloadRawVideo(
    bucket: string,
    objectKey: string,
    outputPath: string,
  ): Promise<void> {
    const response = await this.s3.send(
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

  private runFfmpeg(inputPath: string, outputDir: string): Promise<void> {
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

  private async uploadHlsDirectory(uploadId: string, outputDir: string): Promise<string> {
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

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.config.minio.streamingBucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    }

    return `${hlsPrefix}master.m3u8`;
  }

  private async processUpload(event: UploadEvent): Promise<void> {
    const tempDir = await mkdtemp(join(tmpdir(), 'stromen-transcode-'));
    const sourceExt = extname(event.objectKey) || '.mp4';
    const sourceFilename = `${basename(event.objectKey, sourceExt)}${sourceExt}`;
    const sourcePath = join(tempDir, sourceFilename);
    const hlsOutputDir = join(tempDir, 'hls');

    await this.setStatus(event.uploadId, 'PROCESSING');

    try {
      await mkdir(hlsOutputDir, { recursive: true });
      await this.downloadRawVideo(event.bucket, event.objectKey, sourcePath);

      await this.runFfmpeg(sourcePath, hlsOutputDir);

      const playlistKey = await this.uploadHlsDirectory(event.uploadId, hlsOutputDir);

      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: event.bucket,
          Key: event.objectKey,
        }),
      );

      await this.setStatus(event.uploadId, 'READY', playlistKey);

      await this.publishVideoReady(event.uploadId, playlistKey);
    } catch (error) {
      await this.setStatus(event.uploadId, 'FAILED');

      await this.publishVideoFailed(event.uploadId, error);
      throw error;
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }

  private async publishVideoReady(uploadId: string, playlistKey: string): Promise<void> {
    const hlsStreamUrl = this.buildStreamingUrl(playlistKey);

    try {
      await lastValueFrom(
        this.publisher.emit('video.ready', {
          uploadId,
          hlsStreamUrl,
          thumbnailUrl: null,
          durationSeconds: null,
          occurredAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed publishing video.ready for ${uploadId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async publishVideoFailed(uploadId: string, error: unknown): Promise<void> {
    const reason = error instanceof Error ? error.message : 'Transcode failed';

    try {
      await lastValueFrom(
        this.publisher.emit('video.failed', {
          uploadId,
          reason,
          occurredAt: new Date().toISOString(),
        }),
      );
    } catch (publishError) {
      this.logger.error(
        `Failed publishing video.failed for ${uploadId}`,
        publishError instanceof Error ? publishError.stack : undefined,
      );
    }
  }

  private buildStreamingUrl(playlistKey: string): string {
    return `${this.config.minio.publicEndpoint}/${this.config.minio.streamingBucket}/${playlistKey}`;
  }
}
