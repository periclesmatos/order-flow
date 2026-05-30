import { Test, TestingModule } from '@nestjs/testing';
import { ChangeOrderStatusUseCase } from '@src/modules/order/application/use-cases/change-order-status.use-case';
import { ORDER_REPOSITORY } from '@src/modules/order/domain/repositories/order.repository.interface';
import type { IOrderRepository } from '@src/modules/order/domain/repositories/order.repository.interface';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '@src/modules/product/domain/repositories/product.repository.interface';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import {
  InvalidStatusTransitionError,
  OrderNotFoundError,
} from '@src/modules/order/domain/errors/order.errors';
import {
  loggerProvider,
  provideChangeOrderStatusUseCase,
  transactionalTestImports,
} from '@test/helpers/testing-module';
import { PRODUCT_MUTATED_EVENT } from '@src/modules/product/domain/events/product.events';
import { createTestProduct } from '../../product/product-test.helpers';
import { createTestOrder, createTestOrderItem } from '../order-test.helpers';

describe('ChangeOrderStatusUseCase', () => {
  let useCase: ChangeOrderStatusUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let productRepository: jest.Mocked<IProductRepository>;
  let eventEmitter: { emitAsync: jest.Mock };

  beforeEach(async () => {
    eventEmitter = { emitAsync: jest.fn() };
    orderRepository = {
      nextOrderNumber: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn().mockImplementation(async (o) => o),
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

    const module: TestingModule = await Test.createTestingModule({
      imports: [transactionalTestImports()],
      providers: [
        provideChangeOrderStatusUseCase(ChangeOrderStatusUseCase),
        loggerProvider(),
        { provide: 'EventEmitter2', useValue: eventEmitter },
        { provide: ORDER_REPOSITORY, useValue: orderRepository },
        { provide: PRODUCT_REPOSITORY, useValue: productRepository },
      ],
    }).compile();

    useCase = module.get(ChangeOrderStatusUseCase);
  });

  it('throws when order is missing', async () => {
    orderRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('missing', 'PROCESSING')).rejects.toBeInstanceOf(
      OrderNotFoundError,
    );
  });

  it('moves PENDING -> PROCESSING without touching stock', async () => {
    const order = createTestOrder();
    orderRepository.findById.mockResolvedValue(order);

    const result = await useCase.execute(order.id, 'PROCESSING');

    expect(result.status).toBe('PROCESSING');
    expect(productRepository.findById).not.toHaveBeenCalled();
    expect(productRepository.update).not.toHaveBeenCalled();
  });

  it('fulfills stock on PROCESSING -> SHIPPED', async () => {
    const product = createTestProduct({
      price: Money.fromFloat(10),
      stockOnHand: 5,
    });
    product.reserve(2);
    const order = createTestOrder({
      items: [createTestOrderItem({ productId: product.id, quantity: 2 })],
    });
    order.changeStatus('PROCESSING');
    orderRepository.findById.mockResolvedValue(order);
    productRepository.findById.mockResolvedValue(product);

    const result = await useCase.execute(order.id, 'SHIPPED');

    expect(result.status).toBe('SHIPPED');
    expect(product.stockOnHand).toBe(3);
    expect(product.reservedQuantity).toBe(0);
    expect(productRepository.update).toHaveBeenCalledTimes(1);
    expect(productRepository.lockByIds).toHaveBeenCalledWith([product.id]);
    expect(
      productRepository.lockByIds.mock.invocationCallOrder[0],
    ).toBeLessThan(productRepository.update.mock.invocationCallOrder[0]);
    expect(eventEmitter.emitAsync).toHaveBeenCalledWith(
      PRODUCT_MUTATED_EVENT,
      expect.objectContaining({ productId: product.id }),
    );
  });

  it('releases reserved stock on cancellation', async () => {
    const product = createTestProduct({ stockOnHand: 5 });
    product.reserve(2);
    const order = createTestOrder({
      items: [createTestOrderItem({ productId: product.id, quantity: 2 })],
    });
    orderRepository.findById.mockResolvedValue(order);
    productRepository.findById.mockResolvedValue(product);

    const result = await useCase.execute(order.id, 'CANCELLED');

    expect(result.status).toBe('CANCELLED');
    expect(product.reservedQuantity).toBe(0);
    expect(product.stockOnHand).toBe(5);
    expect(productRepository.update).toHaveBeenCalledTimes(1);
    expect(productRepository.lockByIds).toHaveBeenCalledWith([product.id]);
    expect(
      productRepository.lockByIds.mock.invocationCallOrder[0],
    ).toBeLessThan(productRepository.update.mock.invocationCallOrder[0]);
  });

  it('rejects an invalid transition', async () => {
    const order = createTestOrder();
    orderRepository.findById.mockResolvedValue(order);
    await expect(useCase.execute(order.id, 'SHIPPED')).rejects.toBeInstanceOf(
      InvalidStatusTransitionError,
    );
    expect(orderRepository.updateStatus).not.toHaveBeenCalled();
  });
});
