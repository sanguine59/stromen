import { Controller, Logger } from '@nestjs/common';
import { EventPattern, RmqContext } from '@nestjs/microservices';
import { MetadataService } from './metadata.service';

interface UploadInitiatedPayload {
  uploadId: string;
  ownerId: string;
  occurredAt?: string;
}

interface VideoReadyPayload {
  uploadId: string;
  hlsStreamUrl: string;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  occurredAt?: string;
}

interface VideoFailedPayload {
  uploadId: string;
  reason?: string;
  occurredAt?: string;
}

@Controller()
export class MetadataController {
  private readonly logger = new Logger(MetadataController.name);

  constructor(private readonly metadataService: MetadataService) {}

  @EventPattern('video.upload.initiated')
  async handleUploadInitiated(
    payload: UploadInitiatedPayload,
    context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await this.metadataService.handleUploadInitiated(payload);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        'Failed handling video.upload.initiated event',
        error instanceof Error ? error.stack : undefined,
      );
      channel.nack(message, false, false);
    }
  }

  @EventPattern('video.ready')
  async handleVideoReady(
    payload: VideoReadyPayload,
    context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await this.metadataService.handleVideoReady(payload);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        'Failed handling video.ready event',
        error instanceof Error ? error.stack : undefined,
      );
      channel.nack(message, false, false);
    }
  }

  @EventPattern('video.failed')
  async handleVideoFailed(
    payload: VideoFailedPayload,
    context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await this.metadataService.handleVideoFailed(payload);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        'Failed handling video.failed event',
        error instanceof Error ? error.stack : undefined,
      );
      channel.nack(message, false, false);
    }
  }
}
