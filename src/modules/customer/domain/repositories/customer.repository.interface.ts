import type { Customer } from '../entities/customer.entity';

export const CUSTOMER_REPOSITORY = 'CUSTOMER_REPOSITORY';

export type CustomerSortableField =
  | 'name'
  | 'email'
  | 'phone'
  | 'createdAt'
  | 'updatedAt';

export interface CustomerFilters {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  page: number;
  limit: number;
  sortBy: CustomerSortableField;
  order: 'asc' | 'desc';
}

export interface PageResult {
  customers: Customer[];
  total: number;
}

export interface ICustomerRepository {
  create(customer: Customer): Promise<Customer>;
  findByEmail(email: string): Promise<Customer | null>;
  findById(id: string): Promise<Customer | null>;
  findAll(filters: CustomerFilters): Promise<PageResult>;
  update(id: string, customer: Customer): Promise<Customer>;
  delete(id: string): Promise<void>;
}
