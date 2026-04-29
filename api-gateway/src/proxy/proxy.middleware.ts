import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

@Injectable()
export class UploadsProxyMiddleware implements NestMiddleware {
  private readonly proxy = createProxyMiddleware({
    target: getRequiredEnv('UPLOAD_SERVICE_URL'),
    changeOrigin: true,
    on: {
        proxyReq: (proxyReq, req, res) => {fixRequestBody(proxyReq, req);}
    }
  });
  use(req: Request, res: Response, next: NextFunction): void {
    this.proxy(req, res, next);
  }
}

@Injectable()
export class MetadataProxyMiddleware implements NestMiddleware {
  private readonly proxy = createProxyMiddleware({
    target: getRequiredEnv('METADATA_SERVICE_URL'),
    changeOrigin: true,
    pathRewrite: { '^/api/v1/metadata': '/metadata' },
    on: {
        proxyReq: (proxyReq, req, res) => {fixRequestBody(proxyReq, req);}
    }
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.proxy(req, res, next);
  }
}
