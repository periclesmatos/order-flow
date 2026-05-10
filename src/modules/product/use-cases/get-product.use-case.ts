import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ProductPresenter } from '../presenters/product.presenter.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import type { ProductResponse } from '../presenters/product.presenter.js';
import { ProductNotFoundError } from '../errors/product.errors.js';

@Injectable()
export class GetProductUseCase {
  constructor(
    @InjectPinoLogger(GetProductUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    this.logger.debug({ product }, 'PRODUCT FETCHED');
    return ProductPresenter.toResponse(product);
  }
}
