import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Visibility } from '../visibility.enum';

export class UpdateMetadataDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Visibility)
  visibility?: Visibility;
}
