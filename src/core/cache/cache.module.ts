import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        stores: [new KeyvRedis(config.get<string>('REDIS_URL', 'redis://localhost:6379'))],
      }),
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
