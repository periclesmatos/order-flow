import { Inject, Injectable } from '@nestjs/common';
import { Product } from '@src/modules/product/domain/entities/product.entity';
import type {
  IProductRepository,
  ProductFilters,
  PageResult,
  ProductSortableField,
} from '@src/modules/product/domain/repositories/product.repository.interface';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import { InMemoryCategoryRepository } from './in-memory-category.repository';

function sortKey(
  product: Product,
  field: ProductSortableField,
): string | number | Date {
  switch (field) {
    case 'name':
      return product.name.toLowerCase();
    case 'price':
      return product.price.cents;
    case 'stockOnHand':
      return product.stockOnHand;
    case 'createdAt':
      return product.createdAt.getTime();
    default:
      return '';
  }
}

@Injectable()
export class InMemoryProductRepository implements IProductRepository {
  private readonly byId = new Map<string, Product>();

  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: InMemoryCategoryRepository,
  ) {}

  private async hydrate(product: Product): Promise<Product> {
    if (!product.categoryId) return product;
    const category = await this.categoryRepository.findById(product.categoryId);
    return Product.restore({
      ...product.toJSON(),
      category: category
        ? { id: category.id, name: category.name, isActive: category.isActive }
        : undefined,
    });
  }

  async create(product: Product): Promise<Product> {
    this.byId.set(product.id, product);
    if (product.categoryId) this.categoryRepository.registerLink(product.categoryId);
    return this.hydrate(product);
  }

  async findByName(name: string): Promise<Product | null> {
    for (const p of this.byId.values()) {
      if (p.name === name) return this.hydrate(p);
    }
    return null;
  }

  async findById(id: string): Promise<Product | null> {
    const p = this.byId.get(id);
    return p ? this.hydrate(p) : null;
  }

  async findAll(filters: ProductFilters): Promise<PageResult> {
    let list = [...this.byId.values()];
    if (filters.name) {
      const q = filters.name.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (filters.isActive !== undefined) {
      list = list.filter((p) => p.isActive === filters.isActive);
    }

    const mult = filters.order === 'asc' ? 1 : -1;
    const field = filters.sortBy;
    list.sort((a, b) => {
      const av = sortKey(a, field);
      const bv = sortKey(b, field);
      if (av < bv) return -1 * mult;
      if (av > bv) return 1 * mult;
      return 0;
    });

    const total = list.length;
    const start = (filters.page - 1) * filters.limit;
    const page = list.slice(start, start + filters.limit);
    const products = await Promise.all(page.map((p) => this.hydrate(p)));
    return { products, total };
  }

  async update(id: string, product: Product): Promise<Product> {
    const previous = this.byId.get(id);
    if (!previous) {
      throw new Error(`Product ${id} not found`);
    }
    if (previous.categoryId !== product.categoryId) {
      if (previous.categoryId) this.categoryRepository.unregisterLink(previous.categoryId);
      if (product.categoryId) this.categoryRepository.registerLink(product.categoryId);
    }
    this.byId.set(id, product);
    return this.hydrate(product);
  }

  async delete(id: string): Promise<void> {
    const previous = this.byId.get(id);
    if (previous?.categoryId) this.categoryRepository.unregisterLink(previous.categoryId);
    this.byId.delete(id);
  }
}
