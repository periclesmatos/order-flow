import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_SERVICE } from '../../core/cache/cache.token';
import type { ICacheService } from '../../core/cache/cache.interface';
import { ProductModule } from '../product/product.module';
import { CustomerModule } from '../customer/customer.module';
import { PRODUCT_REPOSITORY } from '../product/domain/repositories/product.repository.interface';
import { CUSTOMER_REPOSITORY } from '../customer/domain/repositories/customer.repository.interface';
import { ADDRESS_REPOSITORY } from '../customer/domain/repositories/address.repository.interface';
import { OrderController } from './presentation/controllers/order.controller';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from './application/use-cases/list-orders.use-case';
import { GetOrderUseCase } from './application/use-cases/get-order.use-case';
import { ChangeOrderStatusUseCase } from './application/use-cases/change-order-status.use-case';
import { OrderCacheInvalidationHandler } from './application/event-handlers/order-cache-invalidation.handler';
import { OrderRepository } from './infrastructure/repositories/order.repository';
import { ORDER_REPOSITORY } from './domain/repositories/order.repository.interface';
import { PinoLoggerAdapter } from '../../shared/infrastructure/logger/pino-logger.adapter';
import type { ILogger } from '../../shared/domain/interfaces/logger.interface';

const LOGGER_TOKEN = 'ILogger';

@Module({
  imports: [ProductModule, CustomerModule],
  controllers: [OrderController],
  providers: [
    {
      provide: LOGGER_TOKEN,
      useClass: PinoLoggerAdapter,
    },
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
        orderRepo: any,
        productRepo: any,
        customerRepo: any,
        addressRepo: any,
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
        orderRepo: any,
        productRepo: any,
        eventEmitter: EventEmitter2,
      ) =>
        new ChangeOrderStatusUseCase(
          logger,
          orderRepo,
          productRepo,
          eventEmitter,
        ),
    },
    {
      provide: GetOrderUseCase,
      inject: [LOGGER_TOKEN, ORDER_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, orderRepo: any, cache: ICacheService) =>
        new GetOrderUseCase(logger, orderRepo, cache),
    },
    {
      provide: ListOrdersUseCase,
      inject: [LOGGER_TOKEN, ORDER_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, orderRepo: any, cache: ICacheService) =>
        new ListOrdersUseCase(logger, orderRepo, cache),
    },
    OrderCacheInvalidationHandler,
    { provide: ORDER_REPOSITORY, useClass: OrderRepository },
  ],
})
export class OrderModule {}
