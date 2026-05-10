import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ProductPresenter } from '../presenters/product.presenter.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import type { UpdateProductDto } from '../dtos/update-product.dto.js';
import type { ProductResponse } from '../presenters/product.presenter.js';
import { ProductNotFoundError } from '../errors/product.errors.js';
import { ProductAlreadyExistsError } from '../errors/product.errors.js';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @InjectPinoLogger(UpdateProductUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    if (dto.name !== undefined && dto.name !== product.name) {
      const existing = await this.productRepository.findByName(dto.name);
      if (existing) throw new ProductAlreadyExistsError(dto.name);
      product.name = dto.name.trim();
    }
    if (dto.isActive !== undefined) {
      if (dto.isActive) product.activate();
      else product.deactivate();
    }
    const updated = await this.productRepository.update(id, product);
    this.logger.info({ product: updated }, 'PRODUCT UPDATED');
    return ProductPresenter.toResponse(updated);
  }
}
