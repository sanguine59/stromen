import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export interface VideoWatchedPayload {
  uploadId: string;
  viewerId: string;
  occurredAt: string;
}

@Injectable()
export class RabbitMqService {
  private readonly logger = new Logger(RabbitMqService.name);

  constructor(@Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy) {}

  async publishVideoWatched(payload: Omit<VideoWatchedPayload, 'occurredAt'>): Promise<void> {
    try {
      await lastValueFrom(
        this.client.emit<unknown, VideoWatchedPayload>('video.watched', {
          ...payload,
          occurredAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      this.logger.warn(
        `Failed publishing video.watched for ${payload.uploadId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
