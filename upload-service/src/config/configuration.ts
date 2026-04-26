export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface MinioConfig {
  endpoint: string;
  publicEndpoint: string;
  accessKey: string;
  secretKey: string;
  rawUploadsBucket: string;
  streamingAssetsBucket: string;
  presignedExpirySeconds: number;
}

export interface RabbitMqConfig {
  url: string;
  exchange: string;
  queue: string;
  routingKey: string;
  dlq: string;
}

export interface AuthConfig {
  jwtSecret: string;
}

export interface AppConfig {
  database: DatabaseConfig;
  minio: MinioConfig;
  rabbitmq: RabbitMqConfig;
  auth: AuthConfig;
}

export default (): AppConfig => ({
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5434),
    username: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? 'root',
    database: process.env.DATABASE_NAME ?? 'upload_db',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
    publicEndpoint:
      process.env.MINIO_PUBLIC_ENDPOINT ?? process.env.MINIO_ENDPOINT ?? 'http://localhost:9000',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
    rawUploadsBucket: process.env.MINIO_RAW_UPLOADS_BUCKET ?? 'raw-uploads',
    streamingAssetsBucket: process.env.MINIO_STREAMING_ASSETS_BUCKET ?? 'streaming-assets',
    presignedExpirySeconds: Number(process.env.MINIO_PRESIGNED_EXPIRY_SECONDS ?? 3600),
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE ?? 'video.events',
    queue: process.env.RABBITMQ_QUEUE ?? 'video.segmentation.queue',
    routingKey: process.env.RABBITMQ_ROUTING_KEY ?? 'video.uploaded',
    dlq: process.env.RABBITMQ_DLQ ?? 'video.segmentation.dlq',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  },
});
