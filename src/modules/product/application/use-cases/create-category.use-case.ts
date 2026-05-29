import { Inject } from '@nestjs/common';
import { Category } from '../../domain/entities/category.entity';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import type { CreateCategoryDto } from '../dtos/create-category.dto';
import { CategoryAlreadyExistsError } from '../../domain/errors/category.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';

export class CreateCategoryUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findByName(dto.name);
    if (existing) throw new CategoryAlreadyExistsError(dto.name);
    const category = Category.create({ name: dto.name });
    const created = await this.categoryRepository.create(category);
    this.logger.debug({ categoryId: created.id }, 'CATEGORY CREATED');
    return created;
  }
}
