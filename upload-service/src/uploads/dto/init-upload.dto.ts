import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';

export class InitUploadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  filename!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  mimeType!: string;

  @IsInt()
  @IsPositive()
  sizeBytes!: number;
}
