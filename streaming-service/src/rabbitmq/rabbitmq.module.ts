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
            urls: [
              configService.get<string>('RABBITMQ_URL') ??
                'amqp://guest:guest@rabbitmq:5672',
            ],
            queue: 'streaming.publisher.queue',
            queueOptions: { durable: true },
            exchange: configService.get<string>('RABBITMQ_EXCHANGE') ?? 'video.events',
            exchangeType: 'topic',
            socketOptions: {
              heartbeatIntervalInSeconds: 30,
              reconnectTimeInSeconds: 5,
            },
          },
        }),
      inject: [ConfigService],
    },
    RabbitMqService,
  ],
  exports: [RabbitMqService],
})
export class RabbitMqModule {}
