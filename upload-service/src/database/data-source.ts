import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { VideoUpload } from '../uploads/entities/video-upload.entity';
import { CreateVideoUploads1714000000000 } from './migrations/1714000000000-create-video-uploads';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5434),
  username: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? 'root',
  database: process.env.DATABASE_NAME ?? 'upload_db',
  entities: [VideoUpload],
  migrations: [CreateVideoUploads1714000000000],
  synchronize: false,
});

export default dataSource;
