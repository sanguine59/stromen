import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUserPayload } from '../auth/jwt-user-payload.interface';
import { StreamingService } from './streaming.service';

interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}

@Controller('stream')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':uploadId')
  async resolve(@Param('uploadId') uploadId: string, @Req() req: AuthenticatedRequest) {
    const viewerId = req.user!.userId;
    return this.streamingService.resolveStream(uploadId, viewerId);
  }
}
