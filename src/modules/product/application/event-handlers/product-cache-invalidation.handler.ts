import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CACHE_SERVICE } from '../../../../core/cache/cache.token';
import type { ICacheService } from '../../../../core/cache/cache.interface';
import {
  PRODUCT_LIST_CACHE_PATTERN,
  productCacheKey,
} from '../cache/product.cache-keys';
import {
  PRODUCT_MUTATED_EVENT,
  type ProductMutatedEvent,
} from '../../domain/events/product.events';

@Injectable()
export class ProductCacheInvalidationHandler {
  constructor(
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
  ) {}

  @OnEvent(PRODUCT_MUTATED_EVENT)
  async handle(event: ProductMutatedEvent): Promise<void> {
    await Promise.all([
      this.cache.del(productCacheKey(event.productId)),
      this.cache.delByPattern(PRODUCT_LIST_CACHE_PATTERN),
    ]);
  }
}
