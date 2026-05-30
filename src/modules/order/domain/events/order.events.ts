export class OrderMutatedEvent {
  constructor(public readonly orderId: string) {}
}

export const ORDER_MUTATED_EVENT = 'order.mutated';
