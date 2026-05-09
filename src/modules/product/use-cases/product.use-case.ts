import { Inject } from '@nestjs/common';
import type { Product } from '../entities/product.entity.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import { ProductNotFoundError, ProductAlreadyExistsError } from '../errors/product.errors.js';

export abstract class ProductUseCase {
  constructor(@Inject(PRODUCT_REPOSITORY) protected readonly productRepository: IProductRepository) {}

  protected async findOrFail(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    return product;
  }

  protected async assertNameUnique(name: string): Promise<void> {
    const existing = await this.productRepository.findByName(name);
    if (existing) throw new ProductAlreadyExistsError(name);
  }
}
