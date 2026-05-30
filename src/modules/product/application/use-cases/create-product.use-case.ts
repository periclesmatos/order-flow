import { Inject } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { Product } from '../../domain/entities/product.entity';
import { Money } from '../../domain/entities/money.value-object';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import type { CreateProductDto } from '../dtos/create-product.dto';
import { ProductAlreadyExistsError } from '../../domain/errors/product.errors';
import {
  CategoryNotFoundError,
  CategoryInactiveError,
} from '../../domain/errors/category.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import {
  PRODUCT_MUTATED_EVENT,
  ProductMutatedEvent,
} from '../../domain/events/product.events';

export class CreateProductUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findByName(dto.name);
    if (existing) throw new ProductAlreadyExistsError(dto.name);
    if (dto.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) throw new CategoryNotFoundError(dto.categoryId);
      if (!category.isActive) throw new CategoryInactiveError(dto.categoryId);
    }
    const product = Product.create({
      name: dto.name,
      description: dto.description,
      price: Money.fromFloat(dto.price),
      stockOnHand: dto.stockOnHand,
      categoryId: dto.categoryId,
    });
    const created = await this.productRepository.create(product);
    await this.eventEmitter.emitAsync(
      PRODUCT_MUTATED_EVENT,
      new ProductMutatedEvent(created.id),
    );
    this.logger.debug({ productId: created.id }, 'PRODUCT CREATED');
    return created;
  }
}
