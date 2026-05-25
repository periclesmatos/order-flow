import { Inject } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface.js';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface.js';
import type { PaginatedResponse } from '../../../../common/types/paginated-response.type.js';
import type { ListProductsDto } from '../dtos/list-products.dto.js';
import type { ProductFilters } from '../../domain/repositories/product.repository.interface.js';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';
import type { Product } from '../../domain/entities/product.entity.js';

export class ListProductsUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: ListProductsDto): Promise<PaginatedResponse<Product>> {
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
    this.logger.debug(
      { total, page: dto.page, limit: dto.limit, totalPages },
      'PRODUCTS LISTED',
    );
    return {
      data: products,
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
