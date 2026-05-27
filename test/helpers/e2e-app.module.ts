import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';

import { ProductE2eModule } from './product-e2e.module';
import { LoggingInterceptor } from '@src/common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from '@src/common/filters/all-exceptions.filter';
import { getLoggerModuleParams } from '@src/shared/infrastructure/config/pino.config';
import {
  E2E_PRISMA_HEALTH,
  E2eHealthController,
} from './e2e-health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot(getLoggerModuleParams()),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    TerminusModule,
    ProductE2eModule,
  ],
  controllers: [E2eHealthController],
  providers: [
    {
      provide: E2E_PRISMA_HEALTH,
      useValue: {
        isHealthy: async (key: string) => ({
          [key]: { status: 'up' as const },
        }),
      },
    },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class E2eAppModule {}
