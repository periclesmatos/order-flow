import type { Order, OrderStatus } from '../entities/order.entity';

export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

export type OrderSortableField =
  | 'orderNumber'
  | 'status'
  | 'createdAt'
  | 'updatedAt';

export interface OrderFilters {
  status?: OrderStatus;
  customerId?: string;
  page: number;
  limit: number;
  sortBy: OrderSortableField;
  order: 'asc' | 'desc';
}

export interface PageResult {
  orders: Order[];
  total: number;
}

export interface IOrderRepository {
  nextOrderNumber(): Promise<number>;
  create(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findAll(filters: OrderFilters): Promise<PageResult>;
  updateStatus(order: Order): Promise<Order>;
}
