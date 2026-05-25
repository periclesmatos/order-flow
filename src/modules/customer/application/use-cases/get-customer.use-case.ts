import { Inject } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import { CustomerNotFoundError } from '../../domain/errors/customer.errors.js';
import type { Customer } from '../../domain/entities/customer.entity.js';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';

export class GetCustomerUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new CustomerNotFoundError(id);
    }
    this.logger.debug({ customerId: id }, 'CUSTOMER RETRIEVED');
    return customer;
  }
}
