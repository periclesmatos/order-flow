import { Injectable } from '@nestjs/common';
import { Address } from '@src/modules/customer/domain/entities/address.entity';
import type { IAddressRepository } from '@src/modules/customer/domain/repositories/address.repository.interface';

@Injectable()
export class InMemoryAddressRepository implements IAddressRepository {
  private readonly byId = new Map<string, Address>();

  async create(_customerId: string, address: Address): Promise<Address> {
    this.byId.set(address.id, address);
    return address;
  }

  async findById(id: string): Promise<Address | null> {
    return this.byId.get(id) ?? null;
  }

  async findAllByCustomerId(customerId: string): Promise<Address[]> {
    return [...this.byId.values()].filter((a) => a.customerId === customerId);
  }

  async update(
    _customerId: string,
    id: string,
    address: Address,
  ): Promise<Address> {
    this.byId.set(id, address);
    return address;
  }

  async delete(_customerId: string, id: string): Promise<void> {
    this.byId.delete(id);
  }
}
