import { IsOptional, IsUUID } from 'class-validator';

export class CreateMetadataDto {
  @IsUUID()
  uploadId!: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
