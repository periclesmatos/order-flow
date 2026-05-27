import { Inject } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { Product } from '../../domain/entities/product.entity';
import { Money } from '../../domain/entities/money.value-object';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface';
import type { CreateProductDto } from '../dtos/create-product.dto';
import { ProductAlreadyExistsError } from '../../domain/errors/product.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import {
  PRODUCT_MUTATED_EVENT,
  ProductMutatedEvent,
} from '../../domain/events/product.events';

export class CreateProductUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findByName(dto.name);
    if (existing) throw new ProductAlreadyExistsError(dto.name);
    const product = Product.create({
      name: dto.name,
      description: dto.description,
      price: Money.fromFloat(dto.price),
      stockOnHand: dto.stockOnHand,
    });
    const created = await this.productRepository.create(product);
    await this.eventEmitter.emitAsync(
      PRODUCT_MUTATED_EVENT,
      new ProductMutatedEvent(created.id),
    );
    this.logger.debug({ productId: created.id }, 'PRODUCT CREATED');
    return created;
  }
}
