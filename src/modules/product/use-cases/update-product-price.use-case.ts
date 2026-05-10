import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Money } from '../entities/money.value-object.js';
import { ProductPresenter } from '../presenters/product.presenter.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import type { UpdateProductPriceDto } from '../dtos/update-product-price.dto.js';
import type { ProductResponse } from '../presenters/product.presenter.js';
import { ProductNotFoundError } from '../errors/product.errors.js';

@Injectable()
export class UpdateProductPriceUseCase {
  constructor(
    @InjectPinoLogger(UpdateProductPriceUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string, dto: UpdateProductPriceDto): Promise<ProductResponse> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    product.price = Money.fromCents(dto.price);
    const updated = await this.productRepository.update(id, product);
    this.logger.info({ product: updated }, 'PRODUCT PRICE UPDATED');
    return ProductPresenter.toResponse(updated);
  }
}
