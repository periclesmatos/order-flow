import { Address } from '@src/modules/customer/domain/entities/address.entity';
import { Customer } from '@src/modules/customer/domain/entities/customer.entity';
import { ADDRESS_REPOSITORY } from '@src/modules/customer/domain/repositories/address.repository.interface';
import { CUSTOMER_REPOSITORY } from '@src/modules/customer/domain/repositories/customer.repository.interface';
import type { IAddressRepository } from '@src/modules/customer/domain/repositories/address.repository.interface';
import type { ICustomerRepository } from '@src/modules/customer/domain/repositories/customer.repository.interface';

export const CUSTOMER_ID = '11111111-1111-4111-8111-111111111111';
export const ADDRESS_ID = '22222222-2222-4222-8222-222222222222';
export const OTHER_CUSTOMER_ID = '33333333-3333-4333-8333-333333333333';

export const baseAddressFields = {
  street: 'Rua A',
  number: '100',
  complement: 'ap 1',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  postalCode: '01000-000',
  country: 'BR',
};

export const createAddressPayload = {
  ...baseAddressFields,
  isDefault: false,
};

export function makeCustomer() {
  return Customer.create({
    name: 'Ana',
    email: 'ana@example.com',
    phone: '+5511987654321',
  });
}

export function makeAddress(
  customerId = CUSTOMER_ID,
  id = ADDRESS_ID,
  overrides: Partial<{
    isDefault: boolean;
    street: string;
    customerId: string;
  }> = {},
) {
  return Address.restore({
    id,
    customerId: overrides.customerId ?? customerId,
    ...baseAddressFields,
    isDefault: overrides.isDefault ?? false,
    street: overrides.street ?? baseAddressFields.street,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  });
}

export function mockAddressRepositories() {
  const customerRepository: jest.Mocked<ICustomerRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const addressRepository: jest.Mocked<IAddressRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findAllByCustomerId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  return { customerRepository, addressRepository };
}

export const addressRepositoryToken = ADDRESS_REPOSITORY;
export const customerRepositoryToken = CUSTOMER_REPOSITORY;
