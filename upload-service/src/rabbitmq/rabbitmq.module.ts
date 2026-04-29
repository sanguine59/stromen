import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RabbitMqService } from './rabbitmq.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'RABBITMQ_CLIENT',
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [configService.getOrThrow<string>('rabbitmq.url')],
            queue: configService.getOrThrow<string>('rabbitmq.queue'),
            queueOptions: {
              durable: true,
              deadLetterExchange: '',
              deadLetterRoutingKey: configService.getOrThrow<string>('rabbitmq.dlq'),
            },
            exchange: configService.getOrThrow<string>('rabbitmq.exchange'),
            exchangeType: 'topic',
            routingKey: configService.getOrThrow<string>('rabbitmq.routingKey'),
          },
        }),
      inject: [ConfigService],
    },
    RabbitMqService,
  ],
  exports: [RabbitMqService],
})
export class RabbitMqModule {}
