import { Module } from '@nestjs/common';
import { ProxyModule } from './proxy/proxy.module';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ProxyModule, RabbitMqModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
