import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { Customer } from '../../domain/entities/customer.entity.js';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';
import { ADDRESS_REPOSITORY } from '../../domain/repositories/address.repository.interface.js';
import {
  CustomerEmailAlreadyExistsError,
  CustomerNotFoundError,
} from '../../domain/errors/customer.errors.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import type { CreateCustomerDto } from '../dtos/create-customer.dto.js';
import type { IAddressRepository } from '../../domain/repositories/address.repository.interface.js';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';

export class CreateCustomerUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
  ) {}

  @Transactional()
  async execute(dto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerRepository.findByEmail(dto.email);
    if (existing) throw new CustomerEmailAlreadyExistsError(dto.email);

    const customer = Customer.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      addresses: dto.addresses,
    });

    const created = await this.customerRepository.create(customer);
    for (const address of customer.addresses) {
      await this.addressRepository.create(created.id, address);
    }

    const response = await this.customerRepository.findById(created.id);
    if (!response) throw new CustomerNotFoundError(created.id);

    this.logger.debug({ customerId: response.id }, 'CUSTOMER CREATED');
    return response;
  }
}
