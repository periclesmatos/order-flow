import { ListOrdersUseCase } from '@src/modules/order/application/use-cases/list-orders.use-case';
import type { IOrderRepository } from '@src/modules/order/domain/repositories/order.repository.interface';
import type { ICacheService } from '@src/core/cache/cache.interface';
import { mockLogger } from '@test/helpers/testing-module';
import { createTestOrder } from '../order-test.helpers';
import type { ListOrdersDto } from '@src/modules/order/application/dtos/list-orders.dto';

const baseQuery: ListOrdersDto = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  order: 'desc',
};

describe('ListOrdersUseCase', () => {
  let useCase: ListOrdersUseCase;
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
    useCase = new ListOrdersUseCase(mockLogger(), orderRepository, cache);
  });

  it('queries the repository and builds pagination meta on cache miss', async () => {
    const order = createTestOrder();
    cache.get.mockResolvedValue(null);
    orderRepository.findAll.mockResolvedValue({ orders: [order], total: 1 });

    const result = await useCase.execute(baseQuery);

    expect(result.data).toHaveLength(1);
    expect(result.meta).toMatchObject({
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });
    expect(cache.set).toHaveBeenCalledTimes(1);
  });

  it('restores orders from cache on hit', async () => {
    const order = createTestOrder();
    cache.get.mockResolvedValue({
      data: [order.toJSON()],
      meta: {
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });

    const result = await useCase.execute(baseQuery);

    expect(result.data[0].toJSON()).toEqual(order.toJSON());
    expect(orderRepository.findAll).not.toHaveBeenCalled();
  });
});
