import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import type { ICacheService } from './cache.interface.js';

@Injectable()
export class RedisCacheService implements ICacheService, OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(this.config.get<string>('REDIS_URL', 'redis://localhost:6379'), {
      lazyConnect: true,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttlMs: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'PX', ttlMs);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
