import { Inject } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import { CategoryNotFoundError } from '../../domain/errors/category.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import { Category } from '../../domain/entities/category.entity';

export class GetCategoryUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new CategoryNotFoundError(id);
    this.logger.debug({ categoryId: id }, 'CATEGORY FETCHED');
    return category;
  }
}
