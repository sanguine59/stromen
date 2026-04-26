import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';
import { VideoUpload } from '../uploads/entities/video-upload.entity';
import { CreateVideoUploads1714000000000 } from './migrations/1714000000000-create-video-uploads';

export function buildTypeOrmOptions(configService: ConfigService): TypeOrmModuleOptions {
  const db = configService.getOrThrow<AppConfig['database']>('database');

  return {
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    entities: [VideoUpload],
    migrations: [CreateVideoUploads1714000000000],
    migrationsRun: true,
    synchronize: false,
  };
}
