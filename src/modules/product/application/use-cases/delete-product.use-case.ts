import { Inject } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ProductNotFoundError } from '../../domain/errors/product.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import {
  PRODUCT_MUTATED_EVENT,
  ProductMutatedEvent,
} from '../../domain/events/product.events';

export class DeleteProductUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    await this.productRepository.delete(product.id);
    await this.eventEmitter.emitAsync(
      PRODUCT_MUTATED_EVENT,
      new ProductMutatedEvent(product.id),
    );
    this.logger.info({ productId: id }, 'PRODUCT DELETED');
  }
}
