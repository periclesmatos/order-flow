import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../../domain/entities/order.entity';
import { ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { PRODUCT_REPOSITORY } from '../../../product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../../product/domain/repositories/product.repository.interface';
import {
  PRODUCT_MUTATED_EVENT,
  ProductMutatedEvent,
} from '../../../product/domain/events/product.events';
import { OrderNotFoundError } from '../../domain/errors/order.errors';
import {
  ORDER_MUTATED_EVENT,
  OrderMutatedEvent,
} from '../../domain/events/order.events';
import type { OrderStatus } from '../../domain/entities/order.entity';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';

export class ChangeOrderStatusUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(id: string, next: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new OrderNotFoundError(id);

    const previous = order.status;
    order.changeStatus(next);

    if (Order.consumesStock(previous, next)) {
      await this.applyStockChange(order, id, 'fulfill');
    } else if (Order.releasesStock(previous, next)) {
      await this.applyStockChange(order, id, 'release');
    }

    const updated = await this.orderRepository.updateStatus(order);
    await this.eventEmitter.emitAsync(
      ORDER_MUTATED_EVENT,
      new OrderMutatedEvent(updated.id),
    );
    this.logger.info(
      { orderId: id, from: previous, to: next },
      'ORDER STATUS CHANGED',
    );
    return updated;
  }

  private async applyStockChange(
    order: Order,
    orderId: string,
    operation: 'fulfill' | 'release',
  ): Promise<void> {
    // Lock pessimista (ordenado) antes de baixar/liberar estoque.
    const productIds = [...new Set(order.items.map((i) => i.productId))].sort();
    await this.productRepository.lockByIds(productIds);

    for (const item of order.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        this.logger.warn(
          { productId: item.productId, orderId, operation },
          'PRODUCT MISSING ON STOCK CHANGE',
        );
        continue;
      }
      if (operation === 'fulfill') product.fulfill(item.quantity);
      else product.release(item.quantity);
      await this.productRepository.update(product.id, product);
      await this.eventEmitter.emitAsync(
        PRODUCT_MUTATED_EVENT,
        new ProductMutatedEvent(product.id),
      );
    }
  }
}
