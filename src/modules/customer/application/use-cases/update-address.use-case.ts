import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { Address } from '../../domain/entities/address.entity.js';
import { ADDRESS_REPOSITORY } from '../../domain/repositories/address.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';
import { AddressNotFoundError } from '../../domain/errors/address.errors.js';
import { CustomerNotFoundError } from '../../domain/errors/customer.errors.js';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface.js';
import type { UpdateAddressDto } from '../dtos/update-address.dto.js';
import type { IAddressRepository } from '../../domain/repositories/address.repository.interface.js';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';

export class UpdateAddressUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  @Transactional()
  async execute(
    customerId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) throw new CustomerNotFoundError(customerId);

    const address = await this.addressRepository.findById(addressId);
    if (!address || address.customerId !== customerId) {
      throw new AddressNotFoundError(addressId);
    }

    if (dto.street !== undefined) address.street = dto.street;
    if (dto.number !== undefined) address.number = dto.number;
    if (dto.complement !== undefined) address.complement = dto.complement;
    if (dto.neighborhood !== undefined) address.neighborhood = dto.neighborhood;
    if (dto.city !== undefined) address.city = dto.city;
    if (dto.state !== undefined) address.state = dto.state;
    if (dto.postalCode !== undefined) address.postalCode = dto.postalCode;
    if (dto.country !== undefined) address.country = dto.country;
    if (dto.isDefault !== undefined) address.isDefault = dto.isDefault;

    const updated = await this.addressRepository.update(
      customerId,
      addressId,
      address,
    );

    this.logger.debug(
      { customerId, addressId: updated.id },
      'ADDRESS UPDATED',
    );
    return updated;
  }
}
