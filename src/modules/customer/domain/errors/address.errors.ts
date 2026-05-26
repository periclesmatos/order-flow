import { DomainError } from '../../../../shared/domain/errors/domain.error.js';

export class AddressNotFoundError extends DomainError {
  readonly statusCode = 404;
  constructor(id: string) {
    super(`Endereço com ID "${id}" não foi encontrado.`);
    this.name = 'AddressNotFoundError';
  }
}

export class CustomerAddressesDefaultCountError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('Com múltiplos endereços, exatamente um deve ser o padrão.');
    this.name = 'CustomerAddressesDefaultCountError';
  }
}
