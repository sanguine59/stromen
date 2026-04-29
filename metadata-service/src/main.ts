// metadata-service/src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672'],
      queue: process.env.RABBITMQ_QUEUE ?? 'metadata.queue',
      queueOptions: {
        durable: true,
        deadLetterExchange: '',
        deadLetterRoutingKey: process.env.RABBITMQ_DLQ ?? 'metadata.dlq',
      },
      noAck: false,
      exchange: process.env.RABBITMQ_EXCHANGE ?? 'video.events',
      exchangeType: 'topic',
      routingKey: process.env.RABBITMQ_ROUTING_KEY ?? 'video.*',
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();