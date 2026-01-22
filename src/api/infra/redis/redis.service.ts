import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  readonly client: Redis;

  constructor() {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = new Redis(url, { maxRetriesPerRequest: null });
  }
}
