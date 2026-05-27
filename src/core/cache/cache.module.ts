import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheService } from './redis-cache.service';
import { CACHE_SERVICE } from './cache.token';

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
