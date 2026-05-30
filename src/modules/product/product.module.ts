import { Module } from '@nestjs/common';
import { CACHE_SERVICE } from '../../core/cache/cache.token';
import type { ICacheService } from '../../core/cache/cache.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductController } from './presentation/controllers/product.controller';
import { CategoryController } from './presentation/controllers/category.controller';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { UpdateProductPriceUseCase } from './application/use-cases/update-product-price.use-case';
import { UpdateProductAmountUseCase } from './application/use-cases/update-product-amount.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { GetCategoryUseCase } from './application/use-cases/get-category.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import { DeactivateCategoryUseCase } from './application/use-cases/deactivate-category.use-case';
import { ProductCacheInvalidationHandler } from './application/event-handlers/product-cache-invalidation.handler';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { CategoryRepository } from './infrastructure/repositories/category.repository';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.interface';
import { CATEGORY_REPOSITORY } from './domain/repositories/category.repository.interface';
import { PinoLoggerAdapter } from '../../shared/infrastructure/logger/pino-logger.adapter';
import type { ILogger } from '../../shared/domain/interfaces/logger.interface';

const LOGGER_TOKEN = 'ILogger';

@Module({
  controllers: [ProductController, CategoryController],
  providers: [
    {
      provide: LOGGER_TOKEN,
      useClass: PinoLoggerAdapter,
    },
    {
      provide: CreateProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CATEGORY_REPOSITORY, EventEmitter2],
      useFactory: (
        logger: ILogger,
        repo: any,
        categoryRepo: any,
        eventEmitter: EventEmitter2,
      ) => new CreateProductUseCase(logger, repo, categoryRepo, eventEmitter),
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
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CATEGORY_REPOSITORY, EventEmitter2],
      useFactory: (
        logger: ILogger,
        repo: any,
        categoryRepo: any,
        eventEmitter: EventEmitter2,
      ) => new UpdateProductUseCase(logger, repo, categoryRepo, eventEmitter),
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
    { provide: CATEGORY_REPOSITORY, useClass: CategoryRepository },
    {
      provide: CreateCategoryUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: any) =>
        new CreateCategoryUseCase(logger, repo),
    },
    {
      provide: ListCategoriesUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: any) =>
        new ListCategoriesUseCase(logger, repo),
    },
    {
      provide: GetCategoryUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: any) =>
        new GetCategoryUseCase(logger, repo),
    },
    {
      provide: UpdateCategoryUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: any) =>
        new UpdateCategoryUseCase(logger, repo),
    },
    {
      provide: DeleteCategoryUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: any) =>
        new DeleteCategoryUseCase(logger, repo),
    },
    {
      provide: DeactivateCategoryUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: any) =>
        new DeactivateCategoryUseCase(logger, repo),
    },
  ],
})
export class ProductModule {}
