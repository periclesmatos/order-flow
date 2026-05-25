import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Product } from '../../domain/entities/product.entity.js';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface.js';
import { ProductNotFoundError } from '../../domain/errors/product.errors.js';
import { productCacheKey, PRODUCT_CACHE_TTL_MS } from '../cache/product.cache-keys.js';
import type { Cache } from 'cache-manager';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';
import type { ProductPrimitives } from '../../domain/entities/product.entity.js';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface.js';

export class GetProductUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
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
