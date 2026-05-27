import { Inject } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { Money } from '../../domain/entities/money.value-object';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface';
import type { UpdateProductPriceDto } from '../dtos/update-product-price.dto';
import { ProductNotFoundError } from '../../domain/errors/product.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import type { Product } from '../../domain/entities/product.entity';
import {
  PRODUCT_MUTATED_EVENT,
  ProductMutatedEvent,
} from '../../domain/events/product.events';

export class UpdateProductPriceUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string, dto: UpdateProductPriceDto): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    product.price = Money.fromFloat(dto.price);
    const updated = await this.productRepository.update(id, product);
    await this.eventEmitter.emitAsync(PRODUCT_MUTATED_EVENT, new ProductMutatedEvent(updated.id));
    this.logger.info({ productId: updated.id }, 'PRODUCT PRICE UPDATED');
    return updated;
  }
}
