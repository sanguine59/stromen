import { Injectable, Logger } from '@nestjs/common';

interface VideoUploadedPayload {
	uploadId: string;
	bucket: string;
	objectKey: string;
	occurredAt?: string;
}

@Injectable()
export class MetadataService {
	private readonly logger = new Logger(MetadataService.name);

	async handleVideoUploaded(payload: VideoUploadedPayload): Promise<void> {
		this.logger.log(`Received upload ${payload.uploadId} from ${payload.bucket}`);
	}
}
