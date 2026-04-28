import { Entity, Column, PrimaryColumn, Index, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Visibility } from "../visibility.enum";
import { PublishState } from "../publish-state.enum";

@Entity({name : "metadata"})
@Index('idx_metadata_metadata_id', ['metadataId'])
export class Metadata {
    @PrimaryColumn('uuid')
    id!: string;

    @Column({type: "varchar", length: 255})
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ type: 'text', array: true, default: [] })
    tags!: string[];

    @Column({ type: 'enum', enum: Visibility, default: Visibility.PRIVATE })
    visibility!: Visibility;

    @Column({ type: 'enum', enum: PublishState, default: PublishState.DRAFT })
    publishState!: PublishState;

    @Column({ name: 'thumbnail_url', type: 'varchar', length: 1000, nullable: true })
    thumbnailUrl!: string;

    @Column({ name: 'hls_stream_url', type: 'varchar', length: 1000, nullable: true })
    hlsStreamUrl!: string;

    @Column({ name: 'duration_seconds', type: 'int', nullable: true })
    durationSeconds!: number;

    @Column({ type: 'int', default: 0 })
    views!: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}