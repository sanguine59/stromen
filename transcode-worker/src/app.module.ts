import { Module } from '@nestjs/common';
import { TranscodeService } from './transcode.service.js';

@Module({
  providers: [TranscodeService],
})
export class AppModule {}
