// metadata-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
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
          deadLetterRoutingKey:
            process.env.RABBITMQ_DLQ ?? 'video.segmentation.dlq',
        },
        noAck: false,
        exchange: process.env.RABBITMQ_EXCHANGE ?? 'video.events',
        exchangeType: 'direct',
        routingKey: process.env.RABBITMQ_ROUTING_KEY ?? 'video.uploaded',
      },
    },
  );
  await app.listen();
}
bootstrap();