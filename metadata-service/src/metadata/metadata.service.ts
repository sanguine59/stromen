import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository, Not } from 'typeorm';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { Metadata } from './entities/metadata.entity';
import { ProcessingState } from './processing-state.enum';
import { Visibility } from './visibility.enum';

interface UploadInitiatedPayload {
	uploadId: string;
	ownerId: string;
	occurredAt?: string;
}

interface VideoReadyPayload {
	uploadId: string;
	hlsStreamUrl: string;
	thumbnailUrl?: string | null;
	durationSeconds?: number | null;
	occurredAt?: string;
}

interface VideoFailedPayload {
	uploadId: string;
	reason?: string;
	occurredAt?: string;
}

@Injectable()
export class MetadataService {
	private readonly logger = new Logger(MetadataService.name);

	constructor(
		@InjectRepository(Metadata)
		private readonly metadataRepository: Repository<Metadata>,
	) {}

	async handleUploadInitiated(payload: UploadInitiatedPayload): Promise<void> {
		this.logger.log(`Received upload init ${payload.uploadId} for ${payload.ownerId}`);

		const existing = await this.metadataRepository.findOne({
			where: { uploadId: payload.uploadId },
		});
		if (existing) {
			this.logger.warn(`Metadata already exists for upload ${payload.uploadId}`);
			return;
		}

		const metadata = this.metadataRepository.create({
			id: randomUUID(),
			uploadId: payload.uploadId,
			ownerId: payload.ownerId,
			title: 'Untitled',
			description: '',
			tags: [],
			visibility: Visibility.PRIVATE,
			processingState: ProcessingState.DRAFT,
			isPublished: false,
			views: 0,
		});

		await this.metadataRepository.save(metadata);
	}

	async createDraft(createMetadataDto: CreateMetadataDto): Promise<Metadata> {
		const existing = await this.metadataRepository.findOne({
			where: { uploadId: createMetadataDto.uploadId },
		});
		if (existing) {
			throw new ConflictException('Metadata already exists for this upload');
		}

		const metadata = this.metadataRepository.create({
			id: randomUUID(),
			uploadId: createMetadataDto.uploadId,
			ownerId: createMetadataDto.ownerId ?? null,
			title: 'Untitled',
			description: '',
			tags: [],
			visibility: Visibility.PRIVATE,
			processingState: ProcessingState.DRAFT,
			isPublished: false,
			views: 0,
		});

		return this.metadataRepository.save(metadata);
	}

	async updateMetadata(id: string, updateMetadataDto: UpdateMetadataDto): Promise<Metadata> {
		const metadata = await this.metadataRepository.findOne({ where: { id } });
		if (!metadata) {
			throw new NotFoundException('Metadata not found');
		}

		Object.assign(metadata, updateMetadataDto);
		return this.metadataRepository.save(metadata);
	}

	async getById(id: string): Promise<Metadata> {
		const metadata = await this.metadataRepository.findOne({ where: { id } });
		if (!metadata) {
			throw new NotFoundException('Metadata not found');
		}

		return metadata;
	}

	async getByUploadId(uploadId: string): Promise<Metadata> {
		const metadata = await this.metadataRepository.findOne({ where: { uploadId } });
		if (!metadata) {
			throw new NotFoundException('Metadata not found for upload');
		}

		return metadata;
	}

	async getFeed(page: number, limit: number) {
		const [items, total] = await this.metadataRepository.findAndCount({
			where: {
				processingState: ProcessingState.READY,
				isPublished: true,
				visibility: Not(Visibility.PRIVATE),
			},
			order: { createdAt: 'DESC' },
			skip: (page - 1) * limit,
			take: limit,
		});

		return { items, page, limit, total };
	}

	async handleVideoReady(payload: VideoReadyPayload): Promise<void> {
		const metadata = await this.metadataRepository.findOne({
			where: { uploadId: payload.uploadId },
		});
		if (!metadata) {
			throw new NotFoundException('Metadata not found for upload');
		}

		metadata.hlsStreamUrl = payload.hlsStreamUrl;
		if (payload.thumbnailUrl !== undefined) {
			metadata.thumbnailUrl = payload.thumbnailUrl ?? null;
		}
		if (payload.durationSeconds !== undefined) {
			metadata.durationSeconds = payload.durationSeconds ?? null;
		}
		metadata.processingState = ProcessingState.READY;

		await this.metadataRepository.save(metadata);
	}

	async handleVideoFailed(payload: VideoFailedPayload): Promise<void> {
		const metadata = await this.metadataRepository.findOne({
			where: { uploadId: payload.uploadId },
		});
		if (!metadata) {
			throw new NotFoundException('Metadata not found for upload');
		}

		metadata.processingState = ProcessingState.FAILED;
		await this.metadataRepository.save(metadata);
	}

	async setPublishState(id: string, isPublished: boolean): Promise<Metadata> {
		const metadata = await this.metadataRepository.findOne({ where: { id } });
		if (!metadata) {
			throw new NotFoundException('Metadata not found');
		}

		metadata.isPublished = isPublished;
		return this.metadataRepository.save(metadata);
	}

	async deleteMetadata(id: string): Promise<void> {
		const metadata = await this.metadataRepository.findOne({ where: { id } });
		if (!metadata) {
			throw new NotFoundException('Metadata not found');
		}

		await this.metadataRepository.remove(metadata);
	}
}
