import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5434),
  DATABASE_USER: Joi.string().default('root'),
  DATABASE_PASSWORD: Joi.string().default('root'),
  DATABASE_NAME: Joi.string().default('upload_db'),

  MINIO_ENDPOINT: Joi.string().uri().default('http://localhost:9000'),
  MINIO_PUBLIC_ENDPOINT: Joi.string().uri().optional(),
  MINIO_ACCESS_KEY: Joi.string().default('minioadmin'),
  MINIO_SECRET_KEY: Joi.string().default('minioadmin'),
  MINIO_RAW_UPLOADS_BUCKET: Joi.string().default('raw-uploads'),
  MINIO_STREAMING_ASSETS_BUCKET: Joi.string().default('streaming-assets'),
  MINIO_PRESIGNED_EXPIRY_SECONDS: Joi.number().integer().min(60).default(3600),

  RABBITMQ_URL: Joi.string().default('amqp://guest:guest@localhost:5672'),
  RABBITMQ_EXCHANGE: Joi.string().default('video.events'),
  RABBITMQ_QUEUE: Joi.string().default('video.segmentation.queue'),
  RABBITMQ_ROUTING_KEY: Joi.string().default('video.uploaded'),
  RABBITMQ_DLQ: Joi.string().default('video.segmentation.dlq'),

  JWT_SECRET: Joi.string().min(8).default('dev-secret'),
});
