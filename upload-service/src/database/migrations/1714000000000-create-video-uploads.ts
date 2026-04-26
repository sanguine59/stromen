import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVideoUploads1714000000000 implements MigrationInterface {
  name = 'CreateVideoUploads1714000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"public\".\"video_upload_status\" AS ENUM('PENDING', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED')",
    );

    await queryRunner.query(`
      CREATE TABLE \"video_uploads\" (
        \"id\" uuid NOT NULL,
        \"user_id\" character varying(255) NOT NULL,
        \"original_filename\" character varying(500) NOT NULL,
        \"raw_video_key\" character varying(1000) NOT NULL,
        \"hls_playlist_key\" character varying(1000),
        \"status\" \"public\".\"video_upload_status\" NOT NULL DEFAULT 'PENDING',
        \"created_at\" TIMESTAMPTZ NOT NULL DEFAULT now(),
        \"updated_at\" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT \"PK_video_uploads_id\" PRIMARY KEY (\"id\")
      )
    `);

    await queryRunner.query(
      'CREATE INDEX "idx_video_uploads_user_id" ON "video_uploads" ("user_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."idx_video_uploads_user_id"');
    await queryRunner.query('DROP TABLE "video_uploads"');
    await queryRunner.query('DROP TYPE "public"."video_upload_status"');
  }
}
