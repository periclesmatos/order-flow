import type { Product } from '../../domain/entities/product.entity.js';

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stockOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductPresenter {
  static toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toFloat(),
      stockOnHand: product.stockOnHand,
      reservedQuantity: product.reservedQuantity,
      availableQuantity: product.availableQuantity,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
