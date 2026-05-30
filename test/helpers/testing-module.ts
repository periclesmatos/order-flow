import { type DynamicModule, type Provider } from '@nestjs/common';
import { CACHE_SERVICE } from '@src/core/cache/cache.token';
import type { ICacheService } from '@src/core/cache/cache.interface';
import {
  ClsPluginTransactional,
  NoOpTransactionalAdapter,
} from '@nestjs-cls/transactional';
import { ClsModule } from 'nestjs-cls';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '@src/modules/product/domain/repositories/product.repository.interface';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '@src/modules/product/domain/repositories/category.repository.interface';
import { CUSTOMER_REPOSITORY } from '@src/modules/customer/domain/repositories/customer.repository.interface';
import { ADDRESS_REPOSITORY } from '@src/modules/customer/domain/repositories/address.repository.interface';
import type { ICustomerRepository } from '@src/modules/customer/domain/repositories/customer.repository.interface';
import type { IAddressRepository } from '@src/modules/customer/domain/repositories/address.repository.interface';
import { ORDER_REPOSITORY } from '@src/modules/order/domain/repositories/order.repository.interface';
import type { IOrderRepository } from '@src/modules/order/domain/repositories/order.repository.interface';
import type { ILogger } from '@src/shared/domain/interfaces/logger.interface';

export const LOGGER_TOKEN = 'ILogger';

export function mockLogger(): ILogger {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

export function provideProductUseCase<T>(
  UseCaseClass: new (logger: ILogger, repository: IProductRepository) => T,
): Provider {
  return {
    provide: UseCaseClass,
    inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY],
    useFactory: (logger: ILogger, repository: IProductRepository) =>
      new UseCaseClass(logger, repository),
  };
}

export function provideProductUseCaseWithCache<T>(
  UseCaseClass: new (
    logger: ILogger,
    repository: IProductRepository,
    cache: ICacheService,
  ) => T,
): Provider {
  return {
    provide: UseCaseClass,
    inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
    useFactory: (
      logger: ILogger,
      repository: IProductRepository,
      cache: ICacheService,
    ) => new UseCaseClass(logger, repository, cache),
  };
}

export function provideProductUseCaseWithEventEmitter<T>(
  UseCaseClass: new (
    logger: ILogger,
    repository: IProductRepository,
    eventEmitter: EventEmitter2,
  ) => T,
): Provider {
  return {
    provide: UseCaseClass,
    inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, 'EventEmitter2'],
    useFactory: (
      logger: ILogger,
      repository: IProductRepository,
      eventEmitter: EventEmitter2,
    ) => new UseCaseClass(logger, repository, eventEmitter),
  };
}

export function provideProductUseCaseWithCategoryAndEvents<T>(
  UseCaseClass: new (
    logger: ILogger,
    repository: IProductRepository,
    categoryRepository: ICategoryRepository,
    eventEmitter: EventEmitter2,
  ) => T,
): Provider {
  return {
    provide: UseCaseClass,
    inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CATEGORY_REPOSITORY, 'EventEmitter2'],
    useFactory: (
      logger: ILogger,
      repository: IProductRepository,
      categoryRepository: ICategoryRepository,
      eventEmitter: EventEmitter2,
    ) => new UseCaseClass(logger, repository, categoryRepository, eventEmitter),
  };
}

export function provideCategoryUseCase<T>(
  UseCaseClass: new (logger: ILogger, repository: ICategoryRepository) => T,
): Provider {
  return {
    provide: UseCaseClass,
    inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
    useFactory: (logger: ILogger, repository: ICategoryRepository) =>
      new UseCaseClass(logger, repository),
  };
}

export function provideCustomerUseCase<T>(
  UseCaseClass: new (
    logger: ILogger,
    customerRepository: ICustomerRepository,
    addressRepository: IAddressRepository,
  ) => T,
): Provider {
  return {
    provide: UseCaseClass,
    inject: [LOGGER_TOKEN, CUSTOMER_REPOSITORY, ADDRESS_REPOSITORY],
    useFactory: (
      logger: ILogger,
      customerRepo: ICustomerRepository,
      addressRepo: IAddressRepository,
    ) => new UseCaseClass(logger, customerRepo, addressRepo),
  };
}

export function provideAddressUseCase<T>(
  UseCaseClass: new (
    logger: ILogger,
    addressRepository: IAddressRepository,
    customerRepository: ICustomerRepository,
  ) => T,
): Provider {
  return {
    provide: UseCaseClass,
    inject: [LOGGER_TOKEN, ADDRESS_REPOSITORY, CUSTOMER_REPOSITORY],
    useFactory: (
      logger: ILogger,
      addressRepo: IAddressRepository,
      customerRepo: ICustomerRepository,
    ) => new UseCaseClass(logger, addressRepo, customerRepo),
  };
}

export function provideCreateOrderUseCase<T>(
  UseCaseClass: new (
    logger: ILogger,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository,
    customerRepository: ICustomerRepository,
    addressRepository: IAddressRepository,
    eventEmitter: EventEmitter2,
  ) => T,
): Provider {
  return {
    provide: UseCaseClass,
    inject: [
      LOGGER_TOKEN,
      ORDER_REPOSITORY,
      PRODUCT_REPOSITORY,
      CUSTOMER_REPOSITORY,
      ADDRESS_REPOSITORY,
      'EventEmitter2',
    ],
    useFactory: (
      logger: ILogger,
      orderRepository: IOrderRepository,
      productRepository: IProductRepository,
      customerRepository: ICustomerRepository,
      addressRepository: IAddressRepository,
      eventEmitter: EventEmitter2,
    ) =>
      new UseCaseClass(
        logger,
        orderRepository,
        productRepository,
        customerRepository,
        addressRepository,
        eventEmitter,
      ),
  };
}

export function provideChangeOrderStatusUseCase<T>(
  UseCaseClass: new (
    logger: ILogger,
    orderRepository: IOrderRepository,
    productRepository: IProductRepository,
    eventEmitter: EventEmitter2,
  ) => T,
): Provider {
  return {
    provide: UseCaseClass,
    inject: [LOGGER_TOKEN, ORDER_REPOSITORY, PRODUCT_REPOSITORY, 'EventEmitter2'],
    useFactory: (
      logger: ILogger,
      orderRepository: IOrderRepository,
      productRepository: IProductRepository,
      eventEmitter: EventEmitter2,
    ) =>
      new UseCaseClass(logger, orderRepository, productRepository, eventEmitter),
  };
}

export function provideOrderUseCaseWithCache<T>(
  UseCaseClass: new (
    logger: ILogger,
    orderRepository: IOrderRepository,
    cache: ICacheService,
  ) => T,
): Provider {
  return {
    provide: UseCaseClass,
    inject: [LOGGER_TOKEN, ORDER_REPOSITORY, CACHE_SERVICE],
    useFactory: (
      logger: ILogger,
      orderRepository: IOrderRepository,
      cache: ICacheService,
    ) => new UseCaseClass(logger, orderRepository, cache),
  };
}

export function transactionalTestImports(): DynamicModule {
  return ClsModule.forRoot({
    global: true,
    middleware: { mount: false },
    plugins: [
      new ClsPluginTransactional({
        adapter: new NoOpTransactionalAdapter({ tx: {}, disableWarning: true }),
      }),
    ],
  });
}

export function loggerProvider(): Provider {
  return { provide: LOGGER_TOKEN, useValue: mockLogger() };
}

export function cacheManagerProvider(): Provider {
  return {
    provide: CACHE_SERVICE,
    useValue: {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delByPattern: jest.fn(),
    } satisfies ICacheService,
  };
}

export function eventEmitterProvider(): Provider {
  return {
    provide: 'EventEmitter2',
    useValue: { emitAsync: jest.fn() } as unknown as EventEmitter2,
  };
}
