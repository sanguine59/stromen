import { Module } from '@nestjs/common';
import { ProxyModule } from './proxy/proxy.module';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [ProxyModule, RabbitMqModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
