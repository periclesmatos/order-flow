import type { Product } from '../entities/product.entity.js';

export const PRODUCT_REPOSITORY = 'PRODUCT_REPOSITORY';

export type ProductSortableField = 'name' | 'price' | 'createdAt' | 'stockOnHand';

export interface ProductFilters {
  name?: string;
  isActive?: boolean;
  page: number;
  limit: number;
  sortBy: ProductSortableField;
  order: 'asc' | 'desc';
}

export interface PageResult {
  products: Product[];
  total: number;
}

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findByName(name: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  findAll(filters: ProductFilters): Promise<PageResult>;
  update(id: string, product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
