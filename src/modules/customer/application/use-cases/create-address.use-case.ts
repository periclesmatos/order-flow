import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { Address } from '../../domain/entities/address.entity';
import { ADDRESS_REPOSITORY } from '../../domain/repositories/address.repository.interface';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import { CustomerNotFoundError } from '../../domain/errors/customer.errors';
import type { ILogger } from '@src/shared/domain/interfaces/logger.interface';
import type { CreateAddressDto } from '../dtos/create-address.dto';
import type { IAddressRepository } from '../../domain/repositories/address.repository.interface';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';

export class CreateAddressUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  @Transactional()
  async execute(customerId: string, dto: CreateAddressDto): Promise<Address> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new CustomerNotFoundError(customerId);

    const address = Address.create(customerId, dto);
    const created = await this.addressRepository.create(customerId, address);

    this.logger.debug({ customerId, addressId: created.id }, 'ADDRESS CREATED');
    return created;
  }
}
