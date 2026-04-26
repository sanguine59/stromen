import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { buildTypeOrmOptions } from './database/typeorm.config';
import { RabbitMqModule } from './rabbitmq/rabbitmq.module';
import { UploadsModule } from './uploads/uploads.module';

const infraModules =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        TypeOrmModule.forRootAsync({
          useFactory: buildTypeOrmOptions,
          inject: [ConfigService],
        }),
        RabbitMqModule,
        UploadsModule,
      ];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validationSchema,
    }),
    JwtModule.register({}),
    ...infraModules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
