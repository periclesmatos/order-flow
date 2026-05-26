import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheService } from './redis-cache.service.js';
import { CACHE_SERVICE } from './cache.token.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisCacheService,
    { provide: CACHE_SERVICE, useExisting: RedisCacheService },
  ],
  exports: [RedisCacheService, CACHE_SERVICE],
})
export class AppCacheModule {}
