import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ProductUseCase } from './product.use-case.js';
import { ProductPresenter } from '../presenters/product.presenter.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import type { UpdateProductAmountDto } from '../dtos/update-product-amount.dto.js';
import type { ProductResponse } from '../presenters/product.presenter.js';

@Injectable()
export class UpdateProductAmountUseCase extends ProductUseCase {
  constructor(
    @InjectPinoLogger(UpdateProductAmountUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY) repository: IProductRepository,
  ) {
    super(repository);
  }

  async execute(id: string, dto: UpdateProductAmountDto): Promise<ProductResponse> {
    const product = await this.findOrFail(id);
    product.amount = dto.amount;
    const updated = await this.productRepository.update(id, product);
    this.logger.info({ productId: id, amount: dto.amount }, 'product amount updated');
    return ProductPresenter.toResponse(updated);
  }
}
