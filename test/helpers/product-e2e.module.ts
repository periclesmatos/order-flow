import { Module } from '@nestjs/common';
import { CACHE_SERVICE } from '@src/core/cache/cache.token';
import type { ICacheService } from '@src/core/cache/cache.interface';
import { ProductController } from '@src/modules/product/presentation/controllers/product.controller';
import { CreateProductUseCase } from '@src/modules/product/application/use-cases/create-product.use-case';
import { ListProductsUseCase } from '@src/modules/product/application/use-cases/list-products.use-case';
import { GetProductUseCase } from '@src/modules/product/application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from '@src/modules/product/application/use-cases/update-product.use-case';
import { UpdateProductPriceUseCase } from '@src/modules/product/application/use-cases/update-product-price.use-case';
import { UpdateProductAmountUseCase } from '@src/modules/product/application/use-cases/update-product-amount.use-case';
import { DeleteProductUseCase } from '@src/modules/product/application/use-cases/delete-product.use-case';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import { PinoLoggerAdapter } from '@src/shared/infrastructure/logger/pino-logger.adapter';
import type { ILogger } from '@src/shared/domain/interfaces/logger.interface';
import { InMemoryProductRepository } from './in-memory-product.repository';

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
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository) =>
        new CreateProductUseCase(logger, repo),
    },
    {
      provide: ListProductsUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository) =>
        new ListProductsUseCase(logger, repo),
    },
    {
      provide: CACHE_SERVICE,
      useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } satisfies ICacheService,
    },
    {
      provide: GetProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository, cache: ICacheService) =>
        new GetProductUseCase(logger, repo, cache),
    },
    {
      provide: UpdateProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository, cache: ICacheService) =>
        new UpdateProductUseCase(logger, repo, cache),
    },
    {
      provide: UpdateProductPriceUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository, cache: ICacheService) =>
        new UpdateProductPriceUseCase(logger, repo, cache),
    },
    {
      provide: UpdateProductAmountUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository, cache: ICacheService) =>
        new UpdateProductAmountUseCase(logger, repo, cache),
    },
    {
      provide: DeleteProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: InMemoryProductRepository, cache: ICacheService) =>
        new DeleteProductUseCase(logger, repo, cache),
    },
    { provide: PRODUCT_REPOSITORY, useClass: InMemoryProductRepository },
  ],
})
export class ProductE2eModule {}
