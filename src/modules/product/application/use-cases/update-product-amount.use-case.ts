import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface.js';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface.js';
import type { UpdateProductAmountDto } from '../dtos/update-product-amount.dto.js';
import { ProductNotFoundError } from '../../domain/errors/product.errors.js';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';
import type { Product } from '../../domain/entities/product.entity.js';
import { productCacheKey } from '../cache/product.cache-keys.js';

export class UpdateProductAmountUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  async execute(id: string, dto: UpdateProductAmountDto): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    product.stockOnHand = dto.stockOnHand;
    const updated = await this.productRepository.update(id, product);
    await this.cache.del(productCacheKey(id));
    this.logger.info({ productId: updated.id }, 'PRODUCT STOCK UPDATED');
    return updated;
  }
}
