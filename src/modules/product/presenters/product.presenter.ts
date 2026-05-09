import type { Product } from '../entities/product.entity.js';

export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  amount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductPresenter {
  static toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      price: product.price.toFloat(),
      amount: product.amount,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
