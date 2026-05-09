import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ProductPresenter } from '../presenters/product.presenter.js';
import { ProductUseCase } from './product.use-case.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import type { ProductResponse } from '../presenters/product.presenter.js';

@Injectable()
export class GetProductUseCase extends ProductUseCase {
  constructor(
    @InjectPinoLogger(GetProductUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY) repository: IProductRepository,
  ) {
    super(repository);
  }

  async execute(id: string): Promise<ProductResponse> {
    const product = await this.findOrFail(id);
    this.logger.debug({ productId: id }, 'product fetched');
    return ProductPresenter.toResponse(product);
  }
}
