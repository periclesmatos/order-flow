import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { ADDRESS_REPOSITORY } from '../../domain/repositories/address.repository.interface';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import { AddressNotFoundError } from '../../domain/errors/address.errors';
import { CustomerNotFoundError } from '../../domain/errors/customer.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import type { IAddressRepository } from '../../domain/repositories/address.repository.interface';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';

export class DeleteAddressUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  @Transactional()
  async execute(customerId: string, addressId: string): Promise<void> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new CustomerNotFoundError(customerId);

    const address = await this.addressRepository.findById(addressId);
    if (!address || address.customerId !== customerId) {
      throw new AddressNotFoundError(addressId);
    }

    await this.addressRepository.delete(customerId, addressId);
    this.logger.debug({ customerId, addressId }, 'ADDRESS DELETED');
  }
}
