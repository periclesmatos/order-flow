import { Inject } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import type { ListCustomersDto } from '../dtos/list-customers.dto.js';
import type { PaginatedResponse } from '../../../../common/types/paginated-response.type.js';
import type { Customer } from '../../domain/entities/customer.entity.js';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';

export class ListCustomersUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(dto: ListCustomersDto): Promise<PaginatedResponse<Customer>> {
    const filters = {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      isActive: dto.isActive,
      page: dto.page,
      limit: dto.limit,
      sortBy: dto.sortBy,
      order: dto.order,
    };

    const { customers, total } = await this.customerRepository.findAll(filters);
    const totalPages = Math.ceil(total / dto.limit);

    this.logger.debug(
      { total, page: dto.page, limit: dto.limit, totalPages },
      'CUSTOMERS LISTED',
    );

    return {
      data: customers,
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
