import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MetadataProxyMiddleware, UploadsProxyMiddleware } from './proxy.middleware';

@Module({})
export class ProxyModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(UploadsProxyMiddleware)
      .forRoutes({ path: 'api/v1/uploads/(.*)', method: RequestMethod.ALL });

    consumer
      .apply(MetadataProxyMiddleware)
      .forRoutes(
        { path: 'api/v1/metadata', method: RequestMethod.ALL },
        { path: 'api/v1/metadata/(.*)', method: RequestMethod.ALL },
      );
  }
}
