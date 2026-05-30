import { Injectable } from '@nestjs/common';
import { Order } from '@src/modules/order/domain/entities/order.entity';
import type {
  IOrderRepository,
  OrderFilters,
  OrderSortableField,
  PageResult,
} from '@src/modules/order/domain/repositories/order.repository.interface';

function sortKey(order: Order, field: OrderSortableField): string | number {
  switch (field) {
    case 'orderNumber':
      return order.orderNumber.value;
    case 'status':
      return order.status;
    case 'createdAt':
      return order.createdAt.getTime();
    case 'updatedAt':
      return order.updatedAt.getTime();
    default:
      return '';
  }
}

@Injectable()
export class InMemoryOrderRepository implements IOrderRepository {
  private readonly byId = new Map<string, Order>();
  private sequence = 0;

  async nextOrderNumber(): Promise<number> {
    this.sequence += 1;
    return this.sequence;
  }

  async create(order: Order): Promise<Order> {
    this.byId.set(order.id, order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.byId.get(id) ?? null;
  }

  async findAll(filters: OrderFilters): Promise<PageResult> {
    let list = [...this.byId.values()];
    if (filters.status) {
      list = list.filter((o) => o.status === filters.status);
    }
    if (filters.customerId) {
      list = list.filter((o) => o.customerId === filters.customerId);
    }

    const mult = filters.order === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const av = sortKey(a, filters.sortBy);
      const bv = sortKey(b, filters.sortBy);
      if (av < bv) return -1 * mult;
      if (av > bv) return 1 * mult;
      return 0;
    });

    const total = list.length;
    const start = (filters.page - 1) * filters.limit;
    const orders = list.slice(start, start + filters.limit);
    return { orders, total };
  }

  async updateStatus(order: Order): Promise<Order> {
    this.byId.set(order.id, order);
    return order;
  }
}
