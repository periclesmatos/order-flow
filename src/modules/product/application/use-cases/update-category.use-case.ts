import { Inject } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import type { UpdateCategoryDto } from '../dtos/update-category.dto';
import { CategoryNotFoundError, CategoryAlreadyExistsError } from '../../domain/errors/category.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import { Category } from '../../domain/entities/category.entity';

export class UpdateCategoryUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new CategoryNotFoundError(id);
    const existing = await this.categoryRepository.findByName(dto.name);
    if (existing && existing.id !== id) throw new CategoryAlreadyExistsError(dto.name);
    category.name = dto.name;
    const updated = await this.categoryRepository.update(id, category);
    this.logger.debug({ categoryId: id }, 'CATEGORY UPDATED');
    return updated;
  }
}
