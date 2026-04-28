import { Controller } from '@nestjs/common';
import { MetadataService } from './metadata.service';

@Controller()
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}
}
