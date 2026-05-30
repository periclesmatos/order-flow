import { Module } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { CACHE_SERVICE } from '@src/core/cache/cache.token';
import type { ICacheService } from '@src/core/cache/cache.interface';
import { ProductController } from '@src/modules/product/presentation/controllers/product.controller';
import { CategoryController } from '@src/modules/product/presentation/controllers/category.controller';
import { CreateProductUseCase } from '@src/modules/product/application/use-cases/create-product.use-case';
import { ListProductsUseCase } from '@src/modules/product/application/use-cases/list-products.use-case';
import { GetProductUseCase } from '@src/modules/product/application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from '@src/modules/product/application/use-cases/update-product.use-case';
import { UpdateProductPriceUseCase } from '@src/modules/product/application/use-cases/update-product-price.use-case';
import { UpdateProductAmountUseCase } from '@src/modules/product/application/use-cases/update-product-amount.use-case';
import { DeleteProductUseCase } from '@src/modules/product/application/use-cases/delete-product.use-case';
import { CreateCategoryUseCase } from '@src/modules/product/application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from '@src/modules/product/application/use-cases/list-categories.use-case';
import { GetCategoryUseCase } from '@src/modules/product/application/use-cases/get-category.use-case';
import { UpdateCategoryUseCase } from '@src/modules/product/application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '@src/modules/product/application/use-cases/delete-category.use-case';
import { DeactivateCategoryUseCase } from '@src/modules/product/application/use-cases/deactivate-category.use-case';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import { PinoLoggerAdapter } from '@src/shared/infrastructure/logger/pino-logger.adapter';
import type { ILogger } from '@src/shared/domain/interfaces/logger.interface';
import { InMemoryProductRepository } from './in-memory-product.repository';
import { InMemoryCategoryRepository } from './in-memory-category.repository';

const LOGGER_TOKEN = 'ILogger';

@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: false })],
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
        repo: InMemoryProductRepository,
        categoryRepo: InMemoryCategoryRepository,
        eventEmitter: EventEmitter2,
      ) => new CreateProductUseCase(logger, repo, categoryRepo, eventEmitter),
    },
    {
      provide: ListProductsUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository, cache: ICacheService) =>
        new ListProductsUseCase(logger, repo, cache),
    },
    {
      provide: CACHE_SERVICE,
      useValue: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        delByPattern: jest.fn(),
      } satisfies ICacheService,
    },
    {
      provide: GetProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository, cache: ICacheService) =>
        new GetProductUseCase(logger, repo, cache),
    },
    {
      provide: UpdateProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CATEGORY_REPOSITORY, EventEmitter2],
      useFactory: (
        logger: ILogger,
        repo: InMemoryProductRepository,
        categoryRepo: InMemoryCategoryRepository,
        eventEmitter: EventEmitter2,
      ) => new UpdateProductUseCase(logger, repo, categoryRepo, eventEmitter),
    },
    {
      provide: UpdateProductPriceUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, EventEmitter2],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository, eventEmitter: EventEmitter2) =>
        new UpdateProductPriceUseCase(logger, repo, eventEmitter),
    },
    {
      provide: UpdateProductAmountUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, EventEmitter2],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository, eventEmitter: EventEmitter2) =>
        new UpdateProductAmountUseCase(logger, repo, eventEmitter),
    },
    {
      provide: DeleteProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, EventEmitter2],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository, eventEmitter: EventEmitter2) =>
        new DeleteProductUseCase(logger, repo, eventEmitter),
    },
    { provide: PRODUCT_REPOSITORY, useClass: InMemoryProductRepository },
    { provide: CATEGORY_REPOSITORY, useClass: InMemoryCategoryRepository },
    {
      provide: CreateCategoryUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: InMemoryCategoryRepository) =>
        new CreateCategoryUseCase(logger, repo),
    },
    {
      provide: ListCategoriesUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: InMemoryCategoryRepository) =>
        new ListCategoriesUseCase(logger, repo),
    },
    {
      provide: GetCategoryUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: InMemoryCategoryRepository) =>
        new GetCategoryUseCase(logger, repo),
    },
    {
      provide: UpdateCategoryUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: InMemoryCategoryRepository) =>
        new UpdateCategoryUseCase(logger, repo),
    },
    {
      provide: DeleteCategoryUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: InMemoryCategoryRepository) =>
        new DeleteCategoryUseCase(logger, repo),
    },
    {
      provide: DeactivateCategoryUseCase,
      inject: [LOGGER_TOKEN, CATEGORY_REPOSITORY],
      useFactory: (logger: ILogger, repo: InMemoryCategoryRepository) =>
        new DeactivateCategoryUseCase(logger, repo),
    },
  ],
})
export class ProductE2eModule {}
