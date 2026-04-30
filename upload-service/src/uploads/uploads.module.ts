import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioModule } from '../minio/minio.module';
import { VideoUpload } from './entities/video-upload.entity';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [TypeOrmModule.forFeature([VideoUpload]), MinioModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
