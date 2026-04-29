import 'reflect-metadata';
import dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module.js';

dotenv.config();

async function main(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672'],
        queue: process.env.RABBITMQ_QUEUE ?? 'video.segmentation.queue',
        queueOptions: {
          durable: true,
          deadLetterExchange: '',
          deadLetterRoutingKey: process.env.RABBITMQ_DLQ ?? 'video.segmentation.dlq',
        },
        noAck: false,
        prefetchCount: 1,
        exchange: process.env.RABBITMQ_EXCHANGE ?? 'video.events',
        exchangeType: 'direct',
        routingKey: process.env.RABBITMQ_ROUTING_KEY ?? 'video.uploaded',
      },
    },
  );

  await app.listen();
}

main().catch((error) => {
  console.error('Transcode worker crashed:', error);
  process.exit(1);
});
