import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VideoStatus } from '../video-status.enum';

@Entity({ name: 'video_uploads' })
@Index('idx_video_uploads_user_id', ['userId'])
export class VideoUpload {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  userId!: string;

  @Column({ name: 'original_filename', type: 'varchar', length: 500 })
  originalFilename!: string;

  @Column({ name: 'raw_video_key', type: 'varchar', length: 1000 })
  rawVideoKey!: string;

  @Column({ name: 'hls_playlist_key', type: 'varchar', length: 1000, nullable: true })
  hlsPlaylistKey!: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: VideoStatus,
    enumName: 'video_upload_status',
    default: VideoStatus.PENDING,
  })
  status!: VideoStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
