import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MetadataService } from './metadata.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { PublishMetadataDto } from './dto/publish-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';

@Controller('metadata')
export class MetadataHttpController {
  constructor(private readonly metadataService: MetadataService) {}

  @Post()
  async createDraft(@Body() createMetadataDto: CreateMetadataDto) {
    const metadata = await this.metadataService.createDraft(createMetadataDto);
    return { id: metadata.id };
  }

  @Patch(':id')
  async updateMetadata(
    @Param('id') id: string,
    @Body() updateMetadataDto: UpdateMetadataDto,
  ) {
    return this.metadataService.updateMetadata(id, updateMetadataDto);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/publish')
  async setPublishState(
    @Param('id') id: string,
    @Body() publishMetadataDto: PublishMetadataDto,
  ) {
    return this.metadataService.setPublishState(id, publishMetadataDto.isPublished);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async deleteMetadata(@Param('id') id: string) {
    await this.metadataService.deleteMetadata(id);
    return { success: true };
  }

  @Get('feed')
  async getFeed(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNumber = this.parsePositiveInt(page, 1);
    const limitNumber = this.parsePositiveInt(limit, 20, 100);
    return this.metadataService.getFeed(pageNumber, limitNumber);
  }

  @Get('by-upload/:uploadId')
  async getByUploadId(@Param('uploadId') uploadId: string) {
    return this.metadataService.getByUploadId(uploadId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.metadataService.getById(id);
  }

  private parsePositiveInt(value: string | undefined, fallback: number, max?: number) {
    if (!value) {
      return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return fallback;
    }

    if (max && parsed > max) {
      return max;
    }

    return parsed;
  }
}
