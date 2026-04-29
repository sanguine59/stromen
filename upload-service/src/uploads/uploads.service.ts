import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinioService } from '../minio/minio.service';
import { RabbitMqService } from '../rabbitmq/rabbitmq.service';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { InitUploadDto } from './dto/init-upload.dto';
import { VideoUpload } from './entities/video-upload.entity';
import { VideoStatus } from './video-status.enum';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(VideoUpload)
    private readonly videoUploadsRepository: Repository<VideoUpload>,
    private readonly minioService: MinioService,
    private readonly rabbitMqService: RabbitMqService,
  ) {}

  async initUpload(userId: string, payload: InitUploadDto): Promise<{
    uploadId: string;
    presignedUrl: string;
  }> {
    const uploadId = randomUUID();
    const objectKey = this.buildObjectKey(userId, uploadId, payload.filename);

    const upload = this.videoUploadsRepository.create({
      id: uploadId,
      userId,
      originalFilename: payload.filename,
      rawVideoKey: objectKey,
      hlsPlaylistKey: null,
      status: VideoStatus.PENDING,
    });

    await this.videoUploadsRepository.save(upload);

    await this.rabbitMqService.publishUploadInitiated({
      uploadId,
      ownerId: userId,
    });

    const presignedUrl = await this.minioService.generatePresignedUploadUrl(
      objectKey,
      payload.mimeType,
    );

    return {
      uploadId,
      presignedUrl,
    };
  }

  async completeUpload(userId: string, payload: CompleteUploadDto): Promise<{
    success: boolean;
    message: string;
  }> {
    const upload = await this.videoUploadsRepository.findOne({
      where: {
        id: payload.uploadId,
        userId,
      },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    if (upload.status !== VideoStatus.PENDING) {
      throw new BadRequestException(
        `Upload cannot be completed from status ${upload.status}`,
      );
    }

    upload.status = VideoStatus.UPLOADED;
    await this.videoUploadsRepository.save(upload);

    await this.rabbitMqService.publishVideoUploaded({
      uploadId: upload.id,
      bucket: this.minioService.getRawUploadsBucket(),
      objectKey: upload.rawVideoKey,
    });

    return {
      success: true,
      message: 'Video queued for processing.',
    };
  }

  async getStatus(userId: string, uploadId: string): Promise<{
    status: VideoStatus;
    streamUrl: string | null;
  }> {
    const upload = await this.videoUploadsRepository.findOne({
      where: {
        id: uploadId,
        userId,
      },
    });

    if (!upload) {
      throw new NotFoundException('Upload not found');
    }

    return {
      status: upload.status,
      streamUrl:
        upload.status === VideoStatus.READY && upload.hlsPlaylistKey
          ? this.minioService.buildStreamingUrl(upload.hlsPlaylistKey)
          : null,
    };
  }

  private buildObjectKey(userId: string, uploadId: string, filename: string): string {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${userId}/${uploadId}/${sanitized}`;
  }
}
