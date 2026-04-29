import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RabbitMqController } from './rabbitmq.controller';
import { RabbitMqService } from './rabbitmq.service';

const getEnv = (key: string, fallback: string): string => {
  return process.env[key] ?? fallback;
};

@Module({
  controllers: [RabbitMqController],
  providers: [
    {
      provide: 'RABBITMQ_CLIENT',
      useFactory: () =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [getEnv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672')],
            queue: getEnv('RABBITMQ_QUEUE', 'api.gateway.queue'),
            queueOptions: {
              durable: true,
              deadLetterExchange: '',
              deadLetterRoutingKey: getEnv('RABBITMQ_DLQ', 'api.gateway.dlq'),
            },
            exchange: getEnv('RABBITMQ_EXCHANGE', 'video.events'),
            exchangeType: 'topic',
            routingKey: getEnv('RABBITMQ_ROUTING_KEY', 'video.*'),
          },
        }),
    },
    RabbitMqService,
  ],
  exports: [RabbitMqService],
})
export class RabbitMqModule {}
