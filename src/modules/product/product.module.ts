import { Module } from '@nestjs/common';
import { CACHE_SERVICE } from '../../core/cache/cache.token';
import type { ICacheService } from '../../core/cache/cache.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductController } from './presentation/controllers/product.controller';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { UpdateProductPriceUseCase } from './application/use-cases/update-product-price.use-case';
import { UpdateProductAmountUseCase } from './application/use-cases/update-product-amount.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { ProductCacheInvalidationHandler } from './application/event-handlers/product-cache-invalidation.handler';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.interface';
import { PinoLoggerAdapter } from '../../shared/infrastructure/logger/pino-logger.adapter';
import type { ILogger } from '../../shared/domain/interfaces/logger.interface';

const LOGGER_TOKEN = 'ILogger';

@Module({
  controllers: [ProductController],
  providers: [
    {
      provide: LOGGER_TOKEN,
      useClass: PinoLoggerAdapter,
    },
    {
      provide: CreateProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, EventEmitter2],
      useFactory: (logger: ILogger, repo: any, eventEmitter: EventEmitter2) =>
        new CreateProductUseCase(logger, repo, eventEmitter),
    },
    {
      provide: ListProductsUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: any, cache: ICacheService) =>
        new ListProductsUseCase(logger, repo, cache),
    },
    {
      provide: GetProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: any, cache: ICacheService) =>
        new GetProductUseCase(logger, repo, cache),
    },
    {
      provide: UpdateProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, EventEmitter2],
      useFactory: (logger: ILogger, repo: any, eventEmitter: EventEmitter2) =>
        new UpdateProductUseCase(logger, repo, eventEmitter),
    },
    {
      provide: UpdateProductPriceUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, EventEmitter2],
      useFactory: (logger: ILogger, repo: any, eventEmitter: EventEmitter2) =>
        new UpdateProductPriceUseCase(logger, repo, eventEmitter),
    },
    {
      provide: UpdateProductAmountUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, EventEmitter2],
      useFactory: (logger: ILogger, repo: any, eventEmitter: EventEmitter2) =>
        new UpdateProductAmountUseCase(logger, repo, eventEmitter),
    },
    {
      provide: DeleteProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, EventEmitter2],
      useFactory: (logger: ILogger, repo: any, eventEmitter: EventEmitter2) =>
        new DeleteProductUseCase(logger, repo, eventEmitter),
    },
    ProductCacheInvalidationHandler,
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepository },
  ],
})
export class ProductModule {}
