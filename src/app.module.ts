import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { CoreModule } from './core/core.module.js';
import { OrderModule } from './modules/order/order.module.js';
import { ProductModule } from './modules/product/product.module.js';
import { CustomerModule } from './modules/customer/customer.module.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import type { IncomingMessage, ServerResponse } from 'http';

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: isDev ? 'debug' : 'info',
        genReqId: () => crypto.randomUUID(),
        autoLogging: false,
        serializers: {
          req: (req: IncomingMessage) => ({ method: req.method, url: req.url }),
          res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
        },
        ...(isDev && {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: false,
              translateTime: 'SYS:dd:mm:yyyy HH:MM:ss.l',
              ignore: 'pid,hostname',
            },
          },
        }),
      },
    }),
    CoreModule,
    OrderModule,
    ProductModule,
    CustomerModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
