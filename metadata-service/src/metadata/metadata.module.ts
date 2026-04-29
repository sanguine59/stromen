import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';
import { MetadataHttpController } from './metadata.http.controller';
import { Metadata } from './entities/metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Metadata])],
  controllers: [MetadataController, MetadataHttpController],
  providers: [MetadataService],
})
export class MetadataModule {}
