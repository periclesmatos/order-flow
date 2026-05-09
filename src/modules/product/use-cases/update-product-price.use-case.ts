import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Money } from '../entities/money.value-object.js';
import { ProductUseCase } from './product.use-case.js';
import { ProductPresenter } from '../presenters/product.presenter.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import type { UpdateProductPriceDto } from '../dtos/update-product-price.dto.js';
import type { ProductResponse } from '../presenters/product.presenter.js';

@Injectable()
export class UpdateProductPriceUseCase extends ProductUseCase {
  constructor(
    @InjectPinoLogger(UpdateProductPriceUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY) repository: IProductRepository,
  ) {
    super(repository);
  }

  async execute(id: string, dto: UpdateProductPriceDto): Promise<ProductResponse> {
    const product = await this.findOrFail(id);
    product.price = Money.fromFloat(dto.price);
    const updated = await this.productRepository.update(id, product);
    this.logger.info({ productId: id, price: dto.price }, 'PRODUCT PRICE UPDATED');
    return ProductPresenter.toResponse(updated);
  }
}
