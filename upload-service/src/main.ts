import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.getOrThrow<string>('rabbitmq.url')],
      queue: config.getOrThrow<string>('rabbitmq.queue'),
      queueOptions: {
        durable: true,
        deadLetterExchange: '',
        deadLetterRoutingKey: config.getOrThrow<string>('rabbitmq.dlq'),
      },
      exchange: config.getOrThrow<string>('rabbitmq.exchange'),
      exchangeType: 'direct',
      routingKey: config.getOrThrow<string>('rabbitmq.routingKey'),
    },
  });

  await app.startAllMicroservices();
  await app.listen(config.get<number>('PORT') ?? 3000);
}
bootstrap();
