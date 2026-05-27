import type { Address } from '../../domain/entities/address.entity';
import type { Customer } from '../../domain/entities/customer.entity';

export interface AddressResponse {
  id: string;
  customerId: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addresses?: AddressResponse[];
}

export class CustomerPresenter {
  static addressToResponse(address: Address): AddressResponse {
    const json = address.toJSON();
    return {
      id: json.id,
      customerId: json.customerId,
      street: json.street,
      number: json.number,
      complement: json.complement,
      neighborhood: json.neighborhood,
      city: json.city,
      state: json.state,
      postalCode: json.postalCode,
      country: json.country,
      isDefault: json.isDefault,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    };
  }

  static toResponse(customer: Customer): CustomerResponse {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email.value,
      phone: customer.phone.e164,
      isActive: customer.isActive,
      addresses: customer.addresses.map((a) =>
        CustomerPresenter.addressToResponse(a),
      ),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
