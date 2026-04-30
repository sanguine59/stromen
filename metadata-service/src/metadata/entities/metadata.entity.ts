import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ProcessingState } from "../processing-state.enum";
import { Visibility } from "../visibility.enum";

@Entity({name : "metadata"})
@Index('idx_metadata_id', ['id'])
export class Metadata {
    @PrimaryColumn('uuid')
    id!: string;

    @Column({ name: 'upload_id', type: 'uuid', unique: true })
    uploadId!: string;

    @Column({ name: 'owner_id', type: 'uuid', nullable: true })
    ownerId!: string | null;

    @Column({type: "varchar", length: 255})
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ type: 'text', array: true, default: [] })
    tags!: string[];

    @Column({ type: 'enum', enum: Visibility, default: Visibility.PRIVATE })
    visibility!: Visibility;

    @Column({ name: 'processing_state', type: 'enum', enum: ProcessingState, default: ProcessingState.DRAFT })
    processingState!: ProcessingState;

    @Column({ name: 'is_published', type: 'boolean', default: false })
    isPublished!: boolean;

    @Column({ name: 'thumbnail_url', type: 'varchar', length: 1000, nullable: true })
    thumbnailUrl!: string | null;

    @Column({ name: 'hls_stream_url', type: 'varchar', length: 1000, nullable: true })
    hlsStreamUrl!: string | null;

    @Column({ name: 'duration_seconds', type: 'int', nullable: true })
    durationSeconds!: number | null;

    @Column({ type: 'int', default: 0 })
    views!: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}