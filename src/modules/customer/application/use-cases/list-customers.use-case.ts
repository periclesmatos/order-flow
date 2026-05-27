import { Inject } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import type { ListCustomersDto } from '../dtos/list-customers.dto';
import type { PaginatedResponse } from '../../../../shared/application/paginated-response.type';
import type { Customer } from '../../domain/entities/customer.entity';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';

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
