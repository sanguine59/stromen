import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { StreamingController } from './streaming.controller';
import { StreamingService } from './streaming.service';
import { RabbitMqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [HttpModule, JwtModule.register({}), RabbitMqModule],
  controllers: [StreamingController],
  providers: [StreamingService],
})
export class StreamingModule {}
