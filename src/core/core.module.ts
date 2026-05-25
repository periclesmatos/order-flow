import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaModule } from './prisma/prisma.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { HealthModule } from './health/health.module.js';
import { AppCacheModule } from './cache/cache.module.js';

@Global()
@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AppCacheModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false },
      guard: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma<PrismaService>({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
    }),
  ],
  exports: [PrismaModule, AppCacheModule],
})
export class CoreModule {}
