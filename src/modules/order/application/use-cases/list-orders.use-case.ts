import { Inject } from '@nestjs/common';
import { CACHE_SERVICE } from '../../../../core/cache/cache.token';
import { ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import type { PaginatedResponse } from '../../../../shared/application/paginated-response.type';
import type { ListOrdersDto } from '../dtos/list-orders.dto';
import type { OrderFilters } from '../../domain/repositories/order.repository.interface';
import type { ICacheService } from '../../../../core/cache/cache.interface';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import { Order } from '../../domain/entities/order.entity';
import type { OrderPrimitives } from '../../domain/entities/order.entity';
import {
  orderListCacheKey,
  ORDER_LIST_CACHE_TTL_MS,
} from '../cache/order.cache-keys';

export class ListOrdersUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
  ) {}

  async execute(dto: ListOrdersDto): Promise<PaginatedResponse<Order>> {
    const key = orderListCacheKey(dto);
    const cached =
      await this.cache.get<PaginatedResponse<OrderPrimitives>>(key);
    if (cached) {
      this.logger.debug({ key }, 'ORDERS LIST CACHE HIT');
      return {
        ...cached,
        data: cached.data.map((o) => Order.restore(o)),
      };
    }

    const filters: OrderFilters = {
      status: dto.status,
      customerId: dto.customerId,
      page: dto.page,
      limit: dto.limit,
      sortBy: dto.sortBy,
      order: dto.order,
    };
    const { orders, total } = await this.orderRepository.findAll(filters);
    const totalPages = Math.ceil(total / dto.limit);
    this.logger.debug(
      { total, page: dto.page, limit: dto.limit, totalPages },
      'ORDERS LISTED',
    );

    const result: PaginatedResponse<Order> = {
      data: orders,
      meta: {
        total,
        page: dto.page,
        limit: dto.limit,
        totalPages,
        hasNextPage: dto.page < totalPages,
        hasPrevPage: dto.page > 1,
      },
    };
    await this.cache.set(
      key,
      { ...result, data: result.data.map((o) => o.toJSON()) },
      ORDER_LIST_CACHE_TTL_MS,
    );
    return result;
  }
}
