import { Module } from '@nestjs/common';
import { CACHE_SERVICE } from '../../core/cache/cache.token.js';
import type { ICacheService } from '../../core/cache/cache.interface.js';
import { ProductController } from './presentation/controllers/product.controller.js';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case.js';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case.js';
import { GetProductUseCase } from './application/use-cases/get-product.use-case.js';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case.js';
import { UpdateProductPriceUseCase } from './application/use-cases/update-product-price.use-case.js';
import { UpdateProductAmountUseCase } from './application/use-cases/update-product-amount.use-case.js';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case.js';
import { ProductRepository } from './infrastructure/repositories/product.repository.js';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.interface.js';
import { PinoLoggerAdapter } from '../../shared/infrastructure/logger/pino-logger.adapter.js';
import type { ILogger } from '../../shared/domain/interfaces/logger.interface.js';

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
      useFactory: (logger: ILogger, repo: any) => new CreateProductUseCase(logger, repo),
    },
    {
      provide: ListProductsUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY],
      useFactory: (logger: ILogger, repo: any) => new ListProductsUseCase(logger, repo),
    },
    {
      provide: GetProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: any, cache: ICacheService) =>
        new GetProductUseCase(logger, repo, cache),
    },
    {
      provide: UpdateProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: any, cache: ICacheService) =>
        new UpdateProductUseCase(logger, repo, cache),
    },
    {
      provide: UpdateProductPriceUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: any, cache: ICacheService) =>
        new UpdateProductPriceUseCase(logger, repo, cache),
    },
    {
      provide: UpdateProductAmountUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: any, cache: ICacheService) =>
        new UpdateProductAmountUseCase(logger, repo, cache),
    },
    {
      provide: DeleteProductUseCase,
      inject: [LOGGER_TOKEN, PRODUCT_REPOSITORY, CACHE_SERVICE],
      useFactory: (logger: ILogger, repo: any, cache: ICacheService) =>
        new DeleteProductUseCase(logger, repo, cache),
    },
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepository },
  ],
})
export class ProductModule {}
