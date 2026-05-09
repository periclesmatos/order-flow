import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ProductUseCase } from './product.use-case.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';

@Injectable()
export class DeleteProductUseCase extends ProductUseCase {
  constructor(
    @InjectPinoLogger(DeleteProductUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY) repository: IProductRepository,
  ) {
    super(repository);
  }

  async execute(id: string): Promise<void> {
    const product = await this.findOrFail(id);
    await this.productRepository.delete(product.id);
    this.logger.info({ productId: id }, 'product deleted');
  }
}
