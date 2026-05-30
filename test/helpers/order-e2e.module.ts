import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { CACHE_SERVICE } from '@src/core/cache/cache.token';
import type { ICacheService } from '@src/core/cache/cache.interface';
import { OrderController } from '@src/modules/order/presentation/controllers/order.controller';
import { CreateOrderUseCase } from '@src/modules/order/application/use-cases/create-order.use-case';
import { GetOrderUseCase } from '@src/modules/order/application/use-cases/get-order.use-case';
import { ListOrdersUseCase } from '@src/modules/order/application/use-cases/list-orders.use-case';
import { ChangeOrderStatusUseCase } from '@src/modules/order/application/use-cases/change-order-status.use-case';
import { ORDER_REPOSITORY } from '@src/modules/order/domain/repositories/order.repository.interface';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import { CUSTOMER_REPOSITORY } from '@src/modules/customer/domain/repositories/customer.repository.interface';
import { ADDRESS_REPOSITORY } from '@src/modules/customer/domain/repositories/address.repository.interface';
import { LoggingInterceptor } from '@src/common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from '@src/common/filters/all-exceptions.filter';
import { getLoggerModuleParams } from '@src/shared/infrastructure/config/pino.config';
import { PinoLoggerAdapter } from '@src/shared/infrastructure/logger/pino-logger.adapter';
import type { ILogger } from '@src/shared/domain/interfaces/logger.interface';
import { InMemoryOrderRepository } from './in-memory-order.repository';
import { InMemoryProductRepository } from './in-memory-product.repository';
import { InMemoryCategoryRepository } from './in-memory-category.repository';
import { InMemoryCustomerRepository } from './in-memory-customer.repository';
import { InMemoryAddressRepository } from './in-memory-address.repository';
import { transactionalTestImports } from './testing-module';

const LOGGER_TOKEN = 'ILogger';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(getLoggerModuleParams()),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    EventEmitterModule.forRoot({ wildcard: false }),
    transactionalTestImports(),
  ],
  controllers: [OrderController],
  providers: [
    { provide: LOGGER_TOKEN, useClass: PinoLoggerAdapter },
    {
      provide: CACHE_SERVICE,
      useValue: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        delByPattern: jest.fn(),
      } satisfies ICacheService,
    },
    { provide: ORDER_REPOSITORY, useClass: InMemoryOrderRepository },
    { provide: PRODUCT_REPOSITORY, useClass: InMemoryProductRepository },
    { provide: CATEGORY_REPOSITORY, useClass: InMemoryCategoryRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: InMemoryCustomerRepository },
    { provide: ADDRESS_REPOSITORY, useClass: InMemoryAddressRepository },
    {
      provide: CreateOrderUseCase,
      inject: [
        LOGGER_TOKEN,
        ORDER_REPOSITORY,
        PRODUCT_REPOSITORY,
        CUSTOMER_REPOSITORY,
        ADDRESS_REPOSITORY,
        EventEmitter2,
      ],
      useFactory: (
        logger: ILogger,
        orderRepo: InMemoryOrderRepository,
        productRepo: InMemoryProductRepository,
        customerRepo: InMemoryCustomerRepository,
        addressRepo: InMemoryAddressRepository,
        eventEmitter: EventEmitter2,
      ) =>
        new CreateOrderUseCase(
          logger,
          orderRepo,
          productRepo,
          customerRepo,
          addressRepo,
          eventEmitter,
        ),
    },
    {
      provide: ChangeOrderStatusUseCase,
      inject: [LOGGER_TOKEN, ORDER_REPOSITORY, PRODUCT_REPOSITORY, EventEmitter2],
      useFactory: (
        logger: ILogger,
        orderRepo: InMemoryOrderRepository,
        productRepo: InMemoryProductRepository,
        eventEmitter: EventEmitter2,
      ) =>
        new ChangeOrderStatusUseCase(logger, orderRepo, productRepo, eventEmitter),
    },
    {
      provide: GetOrderUseCase,
      inject: [LOGGER_TOKEN, ORDER_REPOSITORY, CACHE_SERVICE],
      useFactory: (
        logger: ILogger,
        orderRepo: InMemoryOrderRepository,
        cache: ICacheService,
      ) => new GetOrderUseCase(logger, orderRepo, cache),
    },
    {
      provide: ListOrdersUseCase,
      inject: [LOGGER_TOKEN, ORDER_REPOSITORY, CACHE_SERVICE],
      useFactory: (
        logger: ILogger,
        orderRepo: InMemoryOrderRepository,
        cache: ICacheService,
      ) => new ListOrdersUseCase(logger, orderRepo, cache),
    },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class OrderE2eModule {}
