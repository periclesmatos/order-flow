import { Inject } from '@nestjs/common';
import { CACHE_SERVICE } from '../../../../core/cache/cache.token';
import { PRODUCT_REPOSITORY } from '../../domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../domain/repositories/product.repository.interface';
import type { PaginatedResponse } from '../../../../shared/application/paginated-response.type';
import type { ListProductsDto } from '../dtos/list-products.dto';
import type { ProductFilters } from '../../domain/repositories/product.repository.interface';
import type { ICacheService } from '../../../../core/cache/cache.interface';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import { Product } from '../../domain/entities/product.entity';
import type { ProductPrimitives } from '../../domain/entities/product.entity';
import {
  productListCacheKey,
  PRODUCT_LIST_CACHE_TTL_MS,
} from '../cache/product.cache-keys';

export class ListProductsUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CACHE_SERVICE)
    private readonly cache: ICacheService,
  ) {}

  async execute(dto: ListProductsDto): Promise<PaginatedResponse<Product>> {
    const key = productListCacheKey(dto);
    const cached = await this.cache.get<PaginatedResponse<ProductPrimitives>>(key);
    if (cached) {
      this.logger.debug({ key }, 'PRODUCTS LIST CACHE HIT');
      return {
        ...cached,
        data: cached.data.map((p) => Product.restore(p)),
      };
    }
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
    this.logger.debug({ total, page: dto.page, limit: dto.limit, totalPages }, 'PRODUCTS LISTED');
    const result: PaginatedResponse<Product> = {
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
    await this.cache.set(key, { ...result, data: result.data.map((p) => p.toJSON()) }, PRODUCT_LIST_CACHE_TTL_MS);
    return result;
  }
}
