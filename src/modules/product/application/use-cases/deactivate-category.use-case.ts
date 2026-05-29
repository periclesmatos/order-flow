import { Inject } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { CategoryNotFoundError, CategoryHasProductsError } from '../../domain/errors/category.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import { Category } from '../../domain/entities/category.entity';

export class DeactivateCategoryUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new CategoryNotFoundError(id);
    const hasProducts = await this.categoryRepository.hasLinkedProducts(id);
    if (hasProducts) throw new CategoryHasProductsError();
    category.deactivate();
    const updated = await this.categoryRepository.update(id, category);
    this.logger.debug({ categoryId: id }, 'CATEGORY DEACTIVATED');
    return updated;
  }
}
