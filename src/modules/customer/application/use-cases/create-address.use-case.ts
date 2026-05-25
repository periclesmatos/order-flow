import { Inject } from "@nestjs/common";
import { Transactional } from '@nestjs-cls/transactional';
import { Address } from "../../domain/entities/address.entity.js";
import { ADDRESS_REPOSITORY } from "../../domain/repositories/address.repository.interface.js";
import { CUSTOMER_REPOSITORY } from "../../domain/repositories/customer.repository.interface.js";
import { CustomerNotFoundError } from "../../domain/errors/customer.errors.js";
import type { ILogger } from "@src/shared/domain/interfaces/logger.interface.js";
import type { CreateAddressDto } from "../dtos/create-address.dto.js";
import type { IAddressRepository } from "../../domain/repositories/address.repository.interface.js";
import type { ICustomerRepository } from "../../domain/repositories/customer.repository.interface.js";

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