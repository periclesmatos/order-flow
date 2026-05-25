import { Injectable } from '@nestjs/common';
import { Product } from '@src/modules/product/domain/entities/product.entity';
import type {
  IProductRepository,
  ProductFilters,
  PageResult,
  ProductSortableField,
} from '@src/modules/product/domain/repositories/product.repository.interface';

function sortKey(product: Product, field: ProductSortableField): string | number | Date {
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

  async create(product: Product): Promise<Product> {
    this.byId.set(product.id, product);
    return product;
  }

  async findByName(name: string): Promise<Product | null> {
    for (const p of this.byId.values()) {
      if (p.name === name) return p;
    }
    return null;
  }

  async findById(id: string): Promise<Product | null> {
    return this.byId.get(id) ?? null;
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
    const products = list.slice(start, start + filters.limit);
    return { products, total };
  }

  async update(id: string, product: Product): Promise<Product> {
    if (!this.byId.has(id)) {
      throw new Error(`Product ${id} not found`);
    }
    this.byId.set(id, product);
    return product;
  }

  async delete(id: string): Promise<void> {
    this.byId.delete(id);
  }
}
