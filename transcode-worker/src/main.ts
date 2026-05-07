import 'reflect-metadata';
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module.js';

dotenv.config();

function startHealthServer(): void {
  const port = Number(process.env.HEALTH_PORT ?? 3010);
  const server = createServer((req, res) => {
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'ok',
          service: 'transcode-worker',
          timestamp: new Date().toISOString(),
        }),
      );
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(port, () => {
    console.log(`Transcode worker health endpoint listening on :${port}`);
  });
}

async function main(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL ?? 'amqp://guest:guest@rabbitmq:5672'],
        queue: process.env.RABBITMQ_QUEUE ?? 'video.segmentation.queue',
        queueOptions: {
          durable: true,
          deadLetterExchange: '',
          deadLetterRoutingKey: process.env.RABBITMQ_DLQ ?? 'video.segmentation.dlq',
        },
        noAck: false,
        prefetchCount: 1,
        socketOptions: {
          heartbeatIntervalInSeconds: 30,
          reconnectTimeInSeconds: 5,
        },
        exchange: process.env.RABBITMQ_EXCHANGE ?? 'video.events',
        exchangeType: 'topic',
        routingKey: process.env.RABBITMQ_ROUTING_KEY ?? 'video.uploaded',
      },
    },
  );

  startHealthServer();
  await app.listen();
}

main().catch((error) => {
  console.error('Transcode worker crashed:', error);
  process.exit(1);
});
