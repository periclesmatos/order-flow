import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Product } from '../entities/product.entity.js';
import { Money } from '../entities/money.value-object.js';
import { ProductPresenter } from '../presenters/product.presenter.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import type { ProductResponse } from '../presenters/product.presenter.js';
import type { CreateProductDto } from '../dtos/create-product.dto.js';
import { ProductAlreadyExistsError } from '../errors/product.errors.js';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @InjectPinoLogger(CreateProductUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: CreateProductDto): Promise<ProductResponse> {
    const existing = await this.productRepository.findByName(dto.name);
    if (existing) throw new ProductAlreadyExistsError(dto.name);
    const product = Product.create({
      name: dto.name,
      price: Money.fromFloat(dto.price),
      amount: dto.amount,
    });
    const created = await this.productRepository.create(product);
    this.logger.debug({ product: created }, 'PRODUCT CREATED');
    return ProductPresenter.toResponse(created);
  }
}
