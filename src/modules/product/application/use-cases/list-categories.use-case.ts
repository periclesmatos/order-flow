import { Inject } from '@nestjs/common';
import { CATEGORY_REPOSITORY } from '../../domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '../../domain/repositories/category.repository.interface';
import type { ListCategoriesDto } from '../dtos/list-categories.dto';
import type { PaginatedResponse } from '../../../../shared/application/paginated-response.type';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import { Category } from '../../domain/entities/category.entity';

export class ListCategoriesUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(dto: ListCategoriesDto): Promise<PaginatedResponse<Category>> {
    const { categories, total } = await this.categoryRepository.findAll({
      name: dto.name,
      isActive: dto.isActive,
      page: dto.page,
      limit: dto.limit,
    });
    const totalPages = Math.ceil(total / dto.limit);
    this.logger.debug({ total, page: dto.page }, 'CATEGORIES LISTED');
    return {
      data: categories,
      meta: {
        total,
        page: dto.page,
        limit: dto.limit,
        totalPages,
        hasNextPage: dto.page < totalPages,
        hasPrevPage: dto.page > 1,
      },
    };
  }
}
