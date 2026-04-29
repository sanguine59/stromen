import { Controller, Logger } from '@nestjs/common';
import { EventPattern, RmqContext } from '@nestjs/microservices';
import { MetadataService } from './metadata.service';

interface VideoUploadedPayload {
  uploadId: string;
  bucket: string;
  objectKey: string;
  occurredAt?: string;
}

@Controller()
export class MetadataController {
  private readonly logger = new Logger(MetadataController.name);

  constructor(private readonly metadataService: MetadataService) {}

  @EventPattern('video.uploaded')
  async handleVideoUploaded(
    payload: VideoUploadedPayload,
    context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    try {
      await this.metadataService.handleVideoUploaded(payload);
      channel.ack(message);
    } catch (error) {
      this.logger.error(
        'Failed handling video.uploaded event',
        error instanceof Error ? error.stack : undefined,
      );
      channel.nack(message, false, false);
    }
  }
}
