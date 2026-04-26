import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUserPayload } from '../auth/jwt-user-payload.interface';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { InitUploadDto } from './dto/init-upload.dto';
import { UploadsService } from './uploads.service';

interface AuthenticatedRequest extends Request {
  user: JwtUserPayload;
}

@UseGuards(JwtAuthGuard)
@Controller('api/v1/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('init')
  initUpload(
    @Req() req: AuthenticatedRequest,
    @Body() payload: InitUploadDto,
  ): Promise<{ uploadId: string; presignedUrl: string }> {
    return this.uploadsService.initUpload(req.user.userId, payload);
  }

  @Post('complete')
  completeUpload(
    @Req() req: AuthenticatedRequest,
    @Body() payload: CompleteUploadDto,
  ): Promise<{ success: boolean; message: string }> {
    return this.uploadsService.completeUpload(req.user.userId, payload);
  }

  @Get(':uploadId/status')
  getStatus(
    @Req() req: AuthenticatedRequest,
    @Param('uploadId') uploadId: string,
  ): Promise<{ status: string; streamUrl: string | null }> {
    return this.uploadsService.getStatus(req.user.userId, uploadId);
  }
}
