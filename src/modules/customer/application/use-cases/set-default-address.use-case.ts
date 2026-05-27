import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { Address } from '../../domain/entities/address.entity';
import { ADDRESS_REPOSITORY } from '../../domain/repositories/address.repository.interface';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface';
import { AddressNotFoundError } from '../../domain/errors/address.errors';
import { CustomerNotFoundError } from '../../domain/errors/customer.errors';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';
import type { IAddressRepository } from '../../domain/repositories/address.repository.interface';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';

export class SetDefaultAddressUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  @Transactional()
  async execute(customerId: string, addressId: string): Promise<Address> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new CustomerNotFoundError(customerId);

    const address = await this.addressRepository.findById(addressId);
    if (!address || address.customerId !== customerId) {
      throw new AddressNotFoundError(addressId);
    }

    if (address.isDefault) {
      return address;
    }

    address.isDefault = true;
    const updated = await this.addressRepository.update(
      customerId,
      addressId,
      address,
    );

    this.logger.debug(
      { customerId, addressId: updated.id },
      'ADDRESS SET AS DEFAULT',
    );
    return updated;
  }
}
