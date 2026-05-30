import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { configureApp } from '@src/shared/infrastructure/bootstrap/configure-app';
import { Product } from '@src/modules/product/domain/entities/product.entity';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import { Customer } from '@src/modules/customer/domain/entities/customer.entity';
import { Address } from '@src/modules/customer/domain/entities/address.entity';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import { CUSTOMER_REPOSITORY } from '@src/modules/customer/domain/repositories/customer.repository.interface';
import { ADDRESS_REPOSITORY } from '@src/modules/customer/domain/repositories/address.repository.interface';
import type { InMemoryProductRepository } from './in-memory-product.repository';
import type { InMemoryCustomerRepository } from './in-memory-customer.repository';
import type { InMemoryAddressRepository } from './in-memory-address.repository';
import { OrderE2eModule } from './order-e2e.module';

export interface OrderE2eSeed {
  customerId: string;
  addressId: string;
  productId: string;
}

export interface OrderE2eContext {
  app: INestApplication;
  seedProduct: (overrides?: {
    name?: string;
    price?: number;
    stockOnHand?: number;
    isActive?: boolean;
  }) => Promise<Product>;
  seedCustomer: (overrides?: { isActive?: boolean }) => Promise<Customer>;
  seedAddress: (customerId: string) => Promise<Address>;
  seedDefault: () => Promise<OrderE2eSeed>;
}

export async function createOrderE2eApp(): Promise<OrderE2eContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [OrderE2eModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  configureApp(app, { swagger: false });
  await app.init();

  const productRepo = app.get<InMemoryProductRepository>(PRODUCT_REPOSITORY);
  const customerRepo = app.get<InMemoryCustomerRepository>(CUSTOMER_REPOSITORY);
  const addressRepo = app.get<InMemoryAddressRepository>(ADDRESS_REPOSITORY);

  let emailSeq = 0;

  const seedProduct: OrderE2eContext['seedProduct'] = async (overrides = {}) => {
    const product = Product.create({
      name: overrides.name ?? 'Produto teste',
      description: 'Descrição do produto para pedido',
      price: Money.fromFloat(overrides.price ?? 10),
      stockOnHand: overrides.stockOnHand ?? 10,
    });
    if (overrides.isActive === false) product.deactivate();
    return productRepo.create(product);
  };

  const seedCustomer: OrderE2eContext['seedCustomer'] = async (
    overrides = {},
  ) => {
    emailSeq += 1;
    const customer = Customer.create({
      name: 'Cliente teste',
      email: `cliente${emailSeq}@example.com`,
      phone: '+5511999990000',
    });
    if (overrides.isActive === false) customer.deactivate();
    return customerRepo.create(customer);
  };

  const seedAddress: OrderE2eContext['seedAddress'] = async (customerId) => {
    const address = Address.create(customerId, {
      street: 'Rua das Flores',
      number: '100',
      complement: 'Apto 1',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      postalCode: '01000-000',
      country: 'BR',
      isDefault: true,
    });
    return addressRepo.create(customerId, address);
  };

  const seedDefault: OrderE2eContext['seedDefault'] = async () => {
    const customer = await seedCustomer();
    const address = await seedAddress(customer.id);
    const product = await seedProduct();
    return {
      customerId: customer.id,
      addressId: address.id,
      productId: product.id,
    };
  };

  return { app, seedProduct, seedCustomer, seedAddress, seedDefault };
}
