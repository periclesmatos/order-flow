import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import { ProductNotFoundError } from '../errors/product.errors.js';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @InjectPinoLogger(DeleteProductUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundError(id);
    await this.productRepository.delete(product.id);
    this.logger.info({ productId: id }, 'PRODUCT DELETED');
  }
}
