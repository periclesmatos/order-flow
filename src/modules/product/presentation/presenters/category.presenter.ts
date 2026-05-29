import type { Category } from '../../domain/entities/category.entity';

export interface CategoryResponse {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CategoryPresenter {
  static toResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
