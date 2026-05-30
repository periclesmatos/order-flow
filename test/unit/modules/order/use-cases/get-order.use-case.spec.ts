import { GetOrderUseCase } from '@src/modules/order/application/use-cases/get-order.use-case';
import type { IOrderRepository } from '@src/modules/order/domain/repositories/order.repository.interface';
import type { ICacheService } from '@src/core/cache/cache.interface';
import { OrderNotFoundError } from '@src/modules/order/domain/errors/order.errors';
import { mockLogger } from '@test/helpers/testing-module';
import { createTestOrder } from '../order-test.helpers';

describe('GetOrderUseCase', () => {
  let useCase: GetOrderUseCase;
  let orderRepository: jest.Mocked<IOrderRepository>;
  let cache: jest.Mocked<ICacheService>;

  beforeEach(() => {
    orderRepository = {
      nextOrderNumber: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delByPattern: jest.fn(),
    };
    useCase = new GetOrderUseCase(mockLogger(), orderRepository, cache);
  });

  it('returns the cached order without hitting the repository', async () => {
    const order = createTestOrder();
    cache.get.mockResolvedValue(order.toJSON());

    const result = await useCase.execute(order.id);

    expect(result.toJSON()).toEqual(order.toJSON());
    expect(orderRepository.findById).not.toHaveBeenCalled();
  });

  it('fetches from repository and caches on miss', async () => {
    const order = createTestOrder();
    cache.get.mockResolvedValue(null);
    orderRepository.findById.mockResolvedValue(order);

    const result = await useCase.execute(order.id);

    expect(result).toBe(order);
    expect(cache.set).toHaveBeenCalledTimes(1);
  });

  it('throws when order is not found', async () => {
    cache.get.mockResolvedValue(null);
    orderRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      OrderNotFoundError,
    );
  });
});
