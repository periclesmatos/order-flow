import { Injectable } from '@nestjs/common';
import { Category } from '@src/modules/product/domain/entities/category.entity';
import type {
  ICategoryRepository,
  CategoryFilters,
  CategoryPageResult,
} from '@src/modules/product/domain/repositories/category.repository.interface';

@Injectable()
export class InMemoryCategoryRepository implements ICategoryRepository {
  private readonly byId = new Map<string, Category>();
  private readonly linkCounts = new Map<string, number>();

  registerLink(categoryId: string): void {
    this.linkCounts.set(categoryId, (this.linkCounts.get(categoryId) ?? 0) + 1);
  }

  unregisterLink(categoryId: string): void {
    const next = (this.linkCounts.get(categoryId) ?? 0) - 1;
    if (next > 0) this.linkCounts.set(categoryId, next);
    else this.linkCounts.delete(categoryId);
  }

  async create(category: Category): Promise<Category> {
    this.byId.set(category.id, category);
    return category;
  }

  async findByName(name: string): Promise<Category | null> {
    for (const c of this.byId.values()) {
      if (c.name === name) return c;
    }
    return null;
  }

  async findById(id: string): Promise<Category | null> {
    return this.byId.get(id) ?? null;
  }

  async findAll(filters: CategoryFilters): Promise<CategoryPageResult> {
    let list = [...this.byId.values()];
    if (filters.name) {
      const q = filters.name.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (filters.isActive !== undefined) {
      list = list.filter((c) => c.isActive === filters.isActive);
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    const total = list.length;
    const start = (filters.page - 1) * filters.limit;
    return { categories: list.slice(start, start + filters.limit), total };
  }

  async hasLinkedProducts(id: string): Promise<boolean> {
    return (this.linkCounts.get(id) ?? 0) > 0;
  }

  async update(id: string, category: Category): Promise<Category> {
    this.byId.set(id, category);
    return category;
  }

  async delete(id: string): Promise<void> {
    this.byId.delete(id);
  }
}
