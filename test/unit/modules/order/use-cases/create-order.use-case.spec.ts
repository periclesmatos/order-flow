import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '@src/modules/order/application/use-cases/create-order.use-case';
import { ORDER_REPOSITORY } from '@src/modules/order/domain/repositories/order.repository.interface';
import type { IOrderRepository } from '@src/modules/order/domain/repositories/order.repository.interface';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '@src/modules/product/domain/repositories/product.repository.interface';
import { CUSTOMER_REPOSITORY } from '@src/modules/customer/domain/repositories/customer.repository.interface';
import type { ICustomerRepository } from '@src/modules/customer/domain/repositories/customer.repository.interface';
import { ADDRESS_REPOSITORY } from '@src/modules/customer/domain/repositories/address.repository.interface';
import type { IAddressRepository } from '@src/modules/customer/domain/repositories/address.repository.interface';
import { Customer } from '@src/modules/customer/domain/entities/customer.entity';
import { Address } from '@src/modules/customer/domain/entities/address.entity';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import { CustomerNotFoundError } from '@src/modules/customer/domain/errors/customer.errors';
import { AddressNotFoundError } from '@src/modules/customer/domain/errors/address.errors';
import { ProductNotFoundError } from '@src/modules/product/domain/errors/product.errors';
import { InsufficientStockError } from '@src/modules/product/domain/errors/product.errors';
import {
  OrderAddressNotOwnedError,
  OrderCustomerInactiveError,
  OrderProductInactiveError,
} from '@src/modules/order/domain/errors/order.errors';
import {
  loggerProvider,
  provideCreateOrderUseCase,
  transactionalTestImports,
} from '@test/helpers/testing-module';
import { PRODUCT_MUTATED_EVENT } from '@src/modules/product/domain/events/product.events';
import { ORDER_MUTATED_EVENT } from '@src/modules/order/domain/events/order.events';
import { createTestProduct } from '../../product/product-test.helpers';

const addressFields = {
  street: 'Rua A',
  number: '1',
  complement: '',
  neighborhood: 'Centro',
  city: 'São Paulo',
  state: 'SP',
  postalCode: '01000-000',
  country: 'BR',
  isDefault: true,
};

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let addressRepository: jest.Mocked<IAddressRepository>;

  let customer: Customer;
  let address: Address;
  let eventEmitter: { emitAsync: jest.Mock };

  beforeEach(async () => {
    eventEmitter = { emitAsync: jest.fn() };
    orderRepository = {
      nextOrderNumber: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockImplementation(async (o) => o),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    productRepository = {
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn().mockImplementation(async (_id, p) => p),
      delete: jest.fn(),
      lockByIds: jest.fn(),
    };
    customerRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    addressRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAllByCustomerId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    customer = Customer.create({
      name: 'Cliente',
      email: 'cliente@example.com',
      phone: '+5511999990000',
    });
    address = Address.create(customer.id, addressFields);

    customerRepository.findById.mockResolvedValue(customer);
    addressRepository.findById.mockResolvedValue(address);

    const module: TestingModule = await Test.createTestingModule({
      imports: [transactionalTestImports()],
      providers: [
        provideCreateOrderUseCase(CreateOrderUseCase),
        loggerProvider(),
        { provide: 'EventEmitter2', useValue: eventEmitter },
        { provide: ORDER_REPOSITORY, useValue: orderRepository },
        { provide: PRODUCT_REPOSITORY, useValue: productRepository },
        { provide: CUSTOMER_REPOSITORY, useValue: customerRepository },
        { provide: ADDRESS_REPOSITORY, useValue: addressRepository },
      ],
    }).compile();

    useCase = module.get(CreateOrderUseCase);
  });

  const execute = (productId: string, quantity = 2) =>
    useCase.execute({
      customerId: customer.id,
      addressId: address.id,
      items: [{ productId, quantity }],
    });

  it('creates an order, reserves stock and snapshots the item', async () => {
    const product = createTestProduct({
      name: 'Notebook',
      price: Money.fromFloat(10),
      stockOnHand: 5,
    });
    productRepository.findById.mockResolvedValue(product);

    const result = await execute(product.id, 2);

    expect(result.status).toBe('PENDING');
    expect(result.orderNumber.value).toBe('ORD-000001');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].productName).toBe('Notebook');
    expect(result.items[0].quantity).toBe(2);
    expect(result.total.toFloat()).toBe(20);
    expect(product.reservedQuantity).toBe(2);
    expect(productRepository.update).toHaveBeenCalledTimes(1);
    expect(orderRepository.create).toHaveBeenCalledTimes(1);
    // lock pessimista adquirido com os ids ordenados, antes de reservar/persistir
    expect(productRepository.lockByIds).toHaveBeenCalledWith([product.id]);
    expect(
      productRepository.lockByIds.mock.invocationCallOrder[0],
    ).toBeLessThan(productRepository.update.mock.invocationCallOrder[0]);
    expect(
      productRepository.lockByIds.mock.invocationCallOrder[0],
    ).toBeLessThan(orderRepository.create.mock.invocationCallOrder[0]);
    expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
      PRODUCT_MUTATED_EVENT,
      expect.objectContaining({ productId: product.id }),
    );
    expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
      ORDER_MUTATED_EVENT,
      expect.objectContaining({ orderId: result.id }),
    );
  });

  it('throws when customer does not exist', async () => {
    customerRepository.findById.mockResolvedValue(null);
    await expect(execute('any')).rejects.toBeInstanceOf(CustomerNotFoundError);
    expect(orderRepository.create).not.toHaveBeenCalled();
  });

  it('throws when customer is inactive', async () => {
    customer.deactivate();
    await expect(execute('any')).rejects.toBeInstanceOf(
      OrderCustomerInactiveError,
    );
  });

  it('throws when address does not exist', async () => {
    addressRepository.findById.mockResolvedValue(null);
    await expect(execute('any')).rejects.toBeInstanceOf(AddressNotFoundError);
  });

  it('throws when address belongs to another customer', async () => {
    addressRepository.findById.mockResolvedValue(
      Address.create('another-customer', addressFields),
    );
    await expect(execute('any')).rejects.toBeInstanceOf(
      OrderAddressNotOwnedError,
    );
  });

  it('throws when a product does not exist', async () => {
    productRepository.findById.mockResolvedValue(null);
    await expect(execute('missing')).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
    expect(orderRepository.create).not.toHaveBeenCalled();
  });

  it('throws when a product is inactive', async () => {
    const product = createTestProduct({ stockOnHand: 5 });
    product.deactivate();
    productRepository.findById.mockResolvedValue(product);
    await expect(execute(product.id)).rejects.toBeInstanceOf(
      OrderProductInactiveError,
    );
  });

  it('throws when stock is insufficient', async () => {
    const product = createTestProduct({ stockOnHand: 1 });
    productRepository.findById.mockResolvedValue(product);
    await expect(execute(product.id, 2)).rejects.toBeInstanceOf(
      InsufficientStockError,
    );
    expect(orderRepository.create).not.toHaveBeenCalled();
  });
});
