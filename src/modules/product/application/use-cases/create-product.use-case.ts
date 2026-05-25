import { Inject } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity.js';
import { Money } from '../../domain/entities/money.value-object.js';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface.js';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface.js';
import type { CreateProductDto } from '../dtos/create-product.dto.js';
import { ProductAlreadyExistsError } from '../../domain/errors/product.errors.js';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';

export class CreateProductUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findByName(dto.name);
    if (existing) throw new ProductAlreadyExistsError(dto.name);
    const product = Product.create({
      name: dto.name,
      price: Money.fromFloat(dto.price),
      stockOnHand: dto.stockOnHand,
    });
    const created = await this.productRepository.create(product);
    this.logger.debug({ productId: created.id }, 'PRODUCT CREATED');
    return created;
  }
}
