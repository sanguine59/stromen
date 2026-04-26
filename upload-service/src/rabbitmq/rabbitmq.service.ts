import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import type { AppConfig } from '../config/configuration';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private readonly config: AppConfig['rabbitmq'];
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.getOrThrow<AppConfig['rabbitmq']>('rabbitmq');
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  async publishVideoUploaded(payload: {
    uploadId: string;
    bucket: string;
    objectKey: string;
  }): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    const channel = this.channel;

    if (!channel) {
      throw new Error('RabbitMQ channel is not available');
    }

    channel.publish(
      this.config.exchange,
      this.config.routingKey,
      Buffer.from(
        JSON.stringify({
          ...payload,
          occurredAt: new Date().toISOString(),
        }),
      ),
      { persistent: true },
    );
  }

  private async connect(): Promise<void> {
    if (this.connection && this.channel) {
      return;
    }

    this.connection = await amqp.connect(this.config.url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(this.config.exchange, 'direct', {
      durable: true,
    });

    await this.channel.assertQueue(this.config.dlq, {
      durable: true,
    });

    await this.channel.assertQueue(this.config.queue, {
      durable: true,
      deadLetterExchange: '',
      deadLetterRoutingKey: this.config.dlq,
    });

    await this.channel.bindQueue(
      this.config.queue,
      this.config.exchange,
      this.config.routingKey,
    );

    this.logger.log('RabbitMQ connected and topology asserted');
  }

  private async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}
