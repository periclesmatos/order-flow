import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CACHE_SERVICE } from '../../../../core/cache/cache.token';
import type { ICacheService } from '../../../../core/cache/cache.interface';
import {
  ORDER_LIST_CACHE_PATTERN,
  orderCacheKey,
} from '../cache/order.cache-keys';
import {
  ORDER_MUTATED_EVENT,
  type OrderMutatedEvent,
} from '../../domain/events/order.events';

@Injectable()
export class OrderCacheInvalidationHandler {
  constructor(
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
  ) {}

  @OnEvent(ORDER_MUTATED_EVENT)
  async handle(event: OrderMutatedEvent): Promise<void> {
    await Promise.all([
      this.cache.del(orderCacheKey(event.orderId)),
      this.cache.delByPattern(ORDER_LIST_CACHE_PATTERN),
    ]);
  }
}
