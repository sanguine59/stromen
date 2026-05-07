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

const forwardAuthHeader = (proxyReq: any, req: Request): void => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    proxyReq.setHeader('Authorization', authHeader);
  }
};

@Injectable()
export class UploadsProxyMiddleware implements NestMiddleware {
  private readonly proxy = createProxyMiddleware({
    target: getRequiredEnv('UPLOAD_SERVICE_URL'),
    changeOrigin: true,
    on: {
      proxyReq: (proxyReq, req) => {
        forwardAuthHeader(proxyReq, req as Request);
        fixRequestBody(proxyReq, req);
      },
    },
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
      proxyReq: (proxyReq, req) => {
        forwardAuthHeader(proxyReq, req as Request);
        fixRequestBody(proxyReq, req);
      },
    },
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.proxy(req, res, next);
  }
}

@Injectable()
export class UserProxyMiddleware implements NestMiddleware {
  private readonly proxy = createProxyMiddleware({
    target: getRequiredEnv('USER_SERVICE_URL'),
    changeOrigin: true,
    pathRewrite: { '^/api/v1/auth': '/auth' },
    on: {
      proxyReq: (proxyReq, req) => {
        forwardAuthHeader(proxyReq, req as Request);
        fixRequestBody(proxyReq, req);
      },
    },
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.proxy(req, res, next);
  }
}

@Injectable()
export class StreamingProxyMiddleware implements NestMiddleware {
  private readonly proxy = createProxyMiddleware({
    target: getRequiredEnv('STREAMING_SERVICE_URL'),
    changeOrigin: true,
    pathRewrite: { '^/api/v1/stream': '/stream' },
    on: {
      proxyReq: (proxyReq, req) => {
        forwardAuthHeader(proxyReq, req as Request);
        fixRequestBody(proxyReq, req);
      },
    },
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.proxy(req, res, next);
  }
}
