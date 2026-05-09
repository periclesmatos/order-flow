import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ProductUseCase } from './product.use-case.js';
import { ProductPresenter } from '../presenters/product.presenter.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import type { UpdateProductDto } from '../dtos/update-product.dto.js';
import type { ProductResponse } from '../presenters/product.presenter.js';

@Injectable()
export class UpdateProductUseCase extends ProductUseCase {
  constructor(
    @InjectPinoLogger(UpdateProductUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY) repository: IProductRepository,
  ) {
    super(repository);
  }

  async execute(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    const product = await this.findOrFail(id);

    if (dto.name !== undefined && dto.name !== product.name) {
      await this.assertNameUnique(dto.name);
      product.name = dto.name;
    }
    if (dto.isActive !== undefined) {
      product[dto.isActive ? 'activate' : 'deactivate']();
    }

    const updated = await this.productRepository.update(id, product);
    this.logger.info({ productId: id }, 'product updated');
    return ProductPresenter.toResponse(updated);
  }
}
