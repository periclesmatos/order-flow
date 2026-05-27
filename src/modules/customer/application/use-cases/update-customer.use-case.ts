import { Inject } from '@nestjs/common';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import type { Customer } from '../../domain/entities/customer.entity';
import type { UpdateCustomerDto } from '../dtos/update-customer.dto';
import {
  CustomerEmailAlreadyExistsError,
  CustomerNotFoundError,
} from '../../domain/errors/customer.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';

export class UpdateCustomerUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new CustomerNotFoundError(id);
    }

    if (dto.email && dto.email !== customer.email.value) {
      const existingCustomer = await this.customerRepository.findByEmail(
        dto.email,
      );
      if (existingCustomer)
        throw new CustomerEmailAlreadyExistsError(dto.email);
      customer.email = dto.email;
    }

    if (dto.name) {
      customer.name = dto.name;
    }

    if (dto.phone) {
      customer.phone = dto.phone;
    }

    const updated = await this.customerRepository.update(id, customer);
    this.logger.debug({ customerId: updated.id }, 'CUSTOMER UPDATED');
    return updated;
  }
}
