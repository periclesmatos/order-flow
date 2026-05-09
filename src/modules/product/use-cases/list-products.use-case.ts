import { Injectable, Inject } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ProductPresenter } from '../presenters/product.presenter.js';
import { ProductUseCase } from './product.use-case.js';
import { PRODUCT_REPOSITORY } from '../repositories/product.repository.interface.js';
import type { IProductRepository } from '../repositories/product.repository.interface.js';
import type { ProductResponse } from '../presenters/product.presenter.js';
import type { PaginatedResponse } from '../../../common/types/paginated-response.type.js';
import type { ListProductsDto } from '../dtos/list-products.dto.js';
import type { ProductFilters } from '../repositories/product.repository.interface.js';

@Injectable()
export class ListProductsUseCase extends ProductUseCase {
  constructor(
    @InjectPinoLogger(ListProductsUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(PRODUCT_REPOSITORY) repository: IProductRepository,
  ) {
    super(repository);
  }

  async execute(dto: ListProductsDto): Promise<PaginatedResponse<ProductResponse>> {
    const filters: ProductFilters = {
      name: dto.name,
      isActive: dto.isActive,
      page: dto.page,
      limit: dto.limit,
      sortBy: dto.sortBy,
      order: dto.order,
    };

    const { products, total } = await this.productRepository.findAll(filters);
    const totalPages = Math.ceil(total / dto.limit);

    this.logger.debug({ products, total, page: dto.page, limit: dto.limit }, 'PRODUCTS LISTED');

    return {
      data: products.map((product) => ProductPresenter.toResponse(product)),
      meta: {
        total,
        page: dto.page,
        limit: dto.limit,
        totalPages,
        hasNextPage: dto.page < totalPages,
        hasPrevPage: dto.page > 1,
      },
    };
  }
}
