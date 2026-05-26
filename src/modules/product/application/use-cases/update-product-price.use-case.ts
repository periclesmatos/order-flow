import { Inject } from '@nestjs/common';
import { CACHE_SERVICE } from '../../../../core/cache/cache.token.js';
import type { ICacheService } from '../../../../core/cache/cache.interface.js';
import { Money } from '../../domain/entities/money.value-object.js';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface.js';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface.js';
import type { UpdateProductPriceDto } from '../dtos/update-product-price.dto.js';
import { ProductNotFoundError } from '../../domain/errors/product.errors.js';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';
import type { Product } from '../../domain/entities/product.entity.js';
import { productCacheKey } from '../cache/product.cache-keys.js';

export class UpdateProductPriceUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
  ) {}

  async execute(id: string, dto: UpdateProductPriceDto): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    product.price = Money.fromFloat(dto.price);
    const updated = await this.productRepository.update(id, product);
    await this.cache.del(productCacheKey(id));
    this.logger.info({ productId: updated.id }, 'PRODUCT PRICE UPDATED');
    return updated;
  }
}
