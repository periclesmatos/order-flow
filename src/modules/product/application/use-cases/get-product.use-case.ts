import { Inject } from '@nestjs/common';
import { CACHE_SERVICE } from '../../../../core/cache/cache.token';
import { Product } from '../../domain/entities/product.entity';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface';
import { ProductNotFoundError } from '../../domain/errors/product.errors';
import {
  productCacheKey,
  PRODUCT_CACHE_TTL_MS,
} from '../cache/product.cache-keys';
import type { ICacheService } from '../../../../core/cache/cache.interface';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import type { ProductPrimitives } from '../../domain/entities/product.entity';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface';

export class GetProductUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
  ) {}

  async execute(id: string): Promise<Product> {
    const key = productCacheKey(id);

    const cached = await this.cache.get<ProductPrimitives>(key);
    if (cached) {
      this.logger.debug({ productId: id }, 'PRODUCT CACHE HIT');
      return Product.restore(cached);
    }

    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);

    await this.cache.set(key, product.toJSON(), PRODUCT_CACHE_TTL_MS);
    this.logger.debug({ productId: id }, 'PRODUCT FETCHED');
    return product;
  }
}
