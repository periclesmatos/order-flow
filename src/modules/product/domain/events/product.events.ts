export class ProductMutatedEvent {
  constructor(public readonly productId: string) {}
}

export const PRODUCT_MUTATED_EVENT = 'product.mutated';
