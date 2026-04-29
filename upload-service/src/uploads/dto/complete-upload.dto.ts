import { IsNotEmpty, IsUUID } from 'class-validator';

export class CompleteUploadDto {
  @IsUUID(4)
  @IsNotEmpty()
  uploadId!: string;
}
