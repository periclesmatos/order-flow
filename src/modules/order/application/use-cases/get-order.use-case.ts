import { Inject } from '@nestjs/common';
import { CACHE_SERVICE } from '../../../../core/cache/cache.token';
import { Order } from '../../domain/entities/order.entity';
import { ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import { OrderNotFoundError } from '../../domain/errors/order.errors';
import { orderCacheKey, ORDER_CACHE_TTL_MS } from '../cache/order.cache-keys';
import type { ICacheService } from '../../../../core/cache/cache.interface';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import type { OrderPrimitives } from '../../domain/entities/order.entity';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';

export class GetOrderUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
  ) {}

  async execute(id: string): Promise<Order> {
    const key = orderCacheKey(id);

    const cached = await this.cache.get<OrderPrimitives>(key);
    if (cached) {
      this.logger.debug({ orderId: id }, 'ORDER CACHE HIT');
      return Order.restore(cached);
    }

    const order = await this.orderRepository.findById(id);
    if (!order) throw new OrderNotFoundError(id);

    await this.cache.set(key, order.toJSON(), ORDER_CACHE_TTL_MS);
    this.logger.debug({ orderId: id }, 'ORDER FETCHED');
    return order;
  }
}
