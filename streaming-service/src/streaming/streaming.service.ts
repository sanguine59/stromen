import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { RabbitMqService } from '../rabbitmq/rabbitmq.service';

interface MetadataRecord {
  id: string;
  uploadId: string;
  ownerId: string | null;
  hlsStreamUrl: string | null;
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
  processingState: 'DRAFT' | 'READY' | 'FAILED';
  isPublished: boolean;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
}

export interface StreamResolution {
  uploadId: string;
  hlsStreamUrl: string;
  visibility: MetadataRecord['visibility'];
  durationSeconds: number | null;
  thumbnailUrl: string | null;
}

@Injectable()
export class StreamingService {
  private readonly logger = new Logger(StreamingService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly rabbitMqService: RabbitMqService,
  ) {}

  async resolveStream(uploadId: string, viewerUserId: string): Promise<StreamResolution> {
    const metadata = await this.fetchMetadata(uploadId);

    if (metadata.processingState !== 'READY' || !metadata.hlsStreamUrl) {
      throw new ConflictException('Video is not ready for streaming');
    }

    if (metadata.visibility === 'PRIVATE' && metadata.ownerId !== viewerUserId) {
      throw new ForbiddenException('You do not have access to this video');
    }

    void this.rabbitMqService.publishVideoWatched({
      uploadId: metadata.uploadId,
      viewerId: viewerUserId,
    });

    return {
      uploadId: metadata.uploadId,
      hlsStreamUrl: metadata.hlsStreamUrl,
      visibility: metadata.visibility,
      durationSeconds: metadata.durationSeconds,
      thumbnailUrl: metadata.thumbnailUrl,
    };
  }

  private async fetchMetadata(uploadId: string): Promise<MetadataRecord> {
    const baseUrl = this.configService.getOrThrow<string>('METADATA_SERVICE_URL');
    const url = `${baseUrl.replace(/\/+$/, '')}/metadata/by-upload/${encodeURIComponent(
      uploadId,
    )}`;

    try {
      const response = await firstValueFrom(this.httpService.get<MetadataRecord>(url));
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new NotFoundException('Video not found');
      }
      this.logger.error(
        `Failed fetching metadata for ${uploadId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException('Failed contacting metadata-service');
    }
  }
}
