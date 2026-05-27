import type { Address } from '../entities/address.entity';

export const ADDRESS_REPOSITORY = 'ADDRESS_REPOSITORY';

export interface IAddressRepository {
  create(customerId: string, address: Address): Promise<Address>;
  findById(id: string): Promise<Address | null>;
  findAllByCustomerId(customerId: string): Promise<Address[]>;
  update(customerId: string, id: string, address: Address): Promise<Address>;
  delete(customerId: string, id: string): Promise<void>;
}
