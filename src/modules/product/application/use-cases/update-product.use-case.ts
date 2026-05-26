import { Inject } from '@nestjs/common';
import { CACHE_SERVICE } from '../../../../core/cache/cache.token.js';
import type { ICacheService } from '../../../../core/cache/cache.interface.js';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface.js';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface.js';
import type { UpdateProductDto } from '../dtos/update-product.dto.js';
import { ProductNotFoundError, ProductAlreadyExistsError } from '../../domain/errors/product.errors.js';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';
import type { Product } from '../../domain/entities/product.entity.js';
import { productCacheKey } from '../cache/product.cache-keys.js';

export class UpdateProductUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
  ) {}

  async execute(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);

    if (dto.name !== undefined && dto.name !== product.name) {
      const existing = await this.productRepository.findByName(dto.name);
      if (existing) throw new ProductAlreadyExistsError(dto.name);
      product.name = dto.name.trim();
    }

    if (dto.description !== undefined && dto.description !== product.description) {
      product.description = dto.description.trim();
    }

    if (dto.isActive !== undefined) {
      if (dto.isActive) product.activate();
      else product.deactivate();
    }
    
    const updated = await this.productRepository.update(id, product);
    await this.cache.del(productCacheKey(id));
    this.logger.info({ productId: updated.id }, 'PRODUCT UPDATED');
    return updated;
  }
}
