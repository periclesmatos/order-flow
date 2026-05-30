import { Injectable } from '@nestjs/common';
import { Customer } from '@src/modules/customer/domain/entities/customer.entity';
import type {
  CustomerFilters,
  ICustomerRepository,
  PageResult,
} from '@src/modules/customer/domain/repositories/customer.repository.interface';

@Injectable()
export class InMemoryCustomerRepository implements ICustomerRepository {
  private readonly byId = new Map<string, Customer>();

  async create(customer: Customer): Promise<Customer> {
    this.byId.set(customer.id, customer);
    return customer;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    for (const c of this.byId.values()) {
      if (c.email.value === email.toLowerCase()) return c;
    }
    return null;
  }

  async findById(id: string): Promise<Customer | null> {
    return this.byId.get(id) ?? null;
  }

  async findAll(filters: CustomerFilters): Promise<PageResult> {
    let list = [...this.byId.values()];
    if (filters.isActive !== undefined) {
      list = list.filter((c) => c.isActive === filters.isActive);
    }
    const total = list.length;
    const start = (filters.page - 1) * filters.limit;
    const customers = list.slice(start, start + filters.limit);
    return { customers, total };
  }

  async update(id: string, customer: Customer): Promise<Customer> {
    this.byId.set(id, customer);
    return customer;
  }

  async delete(id: string): Promise<void> {
    this.byId.delete(id);
  }
}
