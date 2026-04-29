import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);

  constructor(@Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy) {}

  async onModuleInit(): Promise<void> {
    await this.client.connect();
    this.logger.log('RabbitMQ client connected');
  }

  async onModuleDestroy(): Promise<void> {
    this.client.close();
  }

  async publishUploadInitiated(payload: {
    uploadId: string;
    ownerId: string;
  }): Promise<void> {
    await lastValueFrom(
      this.client.emit('video.upload.initiated', {
        ...payload,
        occurredAt: new Date().toISOString(),
      }),
    );
  }

  async publishVideoUploaded(payload: {
    uploadId: string;
    bucket: string;
    objectKey: string;
  }): Promise<void> {
    await lastValueFrom(
      this.client.emit('video.uploaded', {
        ...payload,
        occurredAt: new Date().toISOString(),
      }),
    );
  }

  async publishVideoReady(payload: {
    uploadId: string;
    hlsStreamUrl: string;
    thumbnailUrl?: string | null;
    durationSeconds?: number | null;
  }): Promise<void> {
    await lastValueFrom(
      this.client.emit('video.ready', {
        ...payload,
        occurredAt: new Date().toISOString(),
      }),
    );
  }

  async publishVideoFailed(payload: {
    uploadId: string;
    reason?: string;
  }): Promise<void> {
    await lastValueFrom(
      this.client.emit('video.failed', {
        ...payload,
        occurredAt: new Date().toISOString(),
      }),
    );
  }
}
