import { Inject } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import type { UpdateProductDto } from '../dtos/update-product.dto';
import { ProductNotFoundError, ProductAlreadyExistsError } from '../../domain/errors/product.errors';
import { CategoryNotFoundError, CategoryInactiveError } from '../../domain/errors/category.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import type { Product } from '../../domain/entities/product.entity';
import { PRODUCT_MUTATED_EVENT, ProductMutatedEvent } from '../../domain/events/product.events';

export class UpdateProductUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
    private readonly eventEmitter: EventEmitter2,
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

    if (dto.categoryId !== undefined && dto.categoryId !== product.categoryId) {
      const category = await this.categoryRepository.findById(dto.categoryId);
      if (!category) throw new CategoryNotFoundError(dto.categoryId);
      if (!category.isActive) throw new CategoryInactiveError(dto.categoryId);
      product.assignCategory(dto.categoryId);
    }

    const updated = await this.productRepository.update(id, product);
    await this.eventEmitter.emitAsync(PRODUCT_MUTATED_EVENT, new ProductMutatedEvent(updated.id));
    this.logger.info({ productId: updated.id }, 'PRODUCT UPDATED');
    return updated;
  }
}
