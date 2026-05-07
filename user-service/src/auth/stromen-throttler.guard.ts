import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class StromenThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const xff = req.headers?.['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      return Promise.resolve(xff.split(',')[0].trim());
    }
    if (Array.isArray(xff) && xff.length > 0) {
      return Promise.resolve(String(xff[0]).split(',')[0].trim());
    }
    return Promise.resolve(req.ip ?? 'unknown');
  }
}
