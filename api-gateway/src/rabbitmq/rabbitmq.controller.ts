import { Controller, Logger } from '@nestjs/common';
import { EventPattern, RmqContext } from '@nestjs/microservices';

interface UploadInitiatedPayload {
  uploadId: string;
  ownerId: string;
  occurredAt?: string;
}

interface VideoUploadedPayload {
  uploadId: string;
  bucket: string;
  objectKey: string;
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
export class RabbitMqController {
  private readonly logger = new Logger(RabbitMqController.name);

  @EventPattern('video.upload.initiated')
  async handleUploadInitiated(
    payload: UploadInitiatedPayload,
    context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      this.logger.log(`Received video.upload.initiated for ${payload.uploadId}`);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        'Failed handling video.upload.initiated event',
        error instanceof Error ? error.stack : undefined,
      );
      channel.nack(message, false, false);
    }
  }

  @EventPattern('video.uploaded')
  async handleVideoUploaded(
    payload: VideoUploadedPayload,
    context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      this.logger.log(`Received video.uploaded for ${payload.uploadId}`);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        'Failed handling video.uploaded event',
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
      this.logger.log(`Received video.ready for ${payload.uploadId}`);
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
      this.logger.log(`Received video.failed for ${payload.uploadId}`);
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
