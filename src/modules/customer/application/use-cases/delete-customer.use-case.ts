import { Inject } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import { CustomerNotFoundError } from '../../domain/errors/customer.errors.js';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';

export class DeleteCustomerUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new CustomerNotFoundError(id);
    }

    await this.customerRepository.delete(id);
    this.logger.debug({ customerId: id }, 'CUSTOMER DELETED');
  }
}
