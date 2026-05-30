import type {
  Product,
  ProductCategorySnapshot,
} from '../../domain/entities/product.entity';

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stockOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  isActive: boolean;
  category: ProductCategorySnapshot | null;
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
      category: product.category ?? null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
