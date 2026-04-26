import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { AppConfig } from '../config/configuration';

@Injectable()
export class MinioService {
  private readonly client: S3Client;
  private readonly config: AppConfig['minio'];

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.getOrThrow<AppConfig['minio']>('minio');

    this.client = new S3Client({
      endpoint: this.config.endpoint,
      region: 'us-east-1',
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
      forcePathStyle: true,
    });
  }

  async generatePresignedUploadUrl(objectKey: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.config.rawUploadsBucket,
      Key: objectKey,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: this.config.presignedExpirySeconds,
    });
  }

  getRawUploadsBucket(): string {
    return this.config.rawUploadsBucket;
  }

  buildStreamingUrl(playlistKey: string): string {
    return `${this.config.publicEndpoint}/${this.config.streamingAssetsBucket}/${playlistKey}`;
  }
}
