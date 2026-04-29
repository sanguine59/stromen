import { IsBoolean } from 'class-validator';

export class PublishMetadataDto {
  @IsBoolean()
  isPublished!: boolean;
}
