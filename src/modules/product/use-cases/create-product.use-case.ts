import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Product } from '../entities/product.entity.js';
import { Money } from '../entities/money.value-object.js';
import { ProductPresenter } from '../presenters/product.presenter.js';
import { ProductUseCase } from './product.use-case.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import type { ProductResponse } from '../presenters/product.presenter.js';
import type { CreateProductDto } from '../dtos/create-product.dto.js';

@Injectable()
export class CreateProductUseCase extends ProductUseCase {
  constructor(
    @InjectPinoLogger(CreateProductUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY) repository: IProductRepository,
  ) {
    super(repository);
  }

  async execute(dto: CreateProductDto): Promise<ProductResponse> {
    await this.assertNameUnique(dto.name);

    const product = Product.create({
      name: dto.name,
      price: Money.fromFloat(dto.price),
      amount: dto.amount,
    });

    const created = await this.productRepository.create(product);
    this.logger.info({ productId: created.id, name: created.name }, 'PRODUCT CREATED');
    return ProductPresenter.toResponse(created);
  }
}
