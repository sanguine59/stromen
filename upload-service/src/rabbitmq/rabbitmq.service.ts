import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type { AppConfig } from '../config/configuration';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private readonly config: AppConfig['rabbitmq'];

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.config = this.configService.getOrThrow<AppConfig['rabbitmq']>('rabbitmq');
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
    this.logger.log('RabbitMQ client connected');
  }

  async onModuleDestroy(): Promise<void> {
    this.client.close();
  }

  async publishVideoUploaded(payload: {
    uploadId: string;
    bucket: string;
    objectKey: string;
  }): Promise<void> {
    await lastValueFrom(
      this.client.emit(this.config.routingKey, {
        ...payload,
        occurredAt: new Date().toISOString(),
      }),
    );
  }
}
