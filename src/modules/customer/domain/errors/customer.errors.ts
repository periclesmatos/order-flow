import { DomainError } from '../../../../shared/domain/errors/domain.error.js';

export class CustomerEmailAlreadyExistsError extends DomainError {
  readonly statusCode = 409;
  constructor(email: string) {
    super(`Já existe um cliente com o e-mail "${email}".`);
    this.name = 'CustomerEmailAlreadyExistsError';
  }
}

export class CustomerNotFoundError extends DomainError {
  readonly statusCode = 404;
  constructor(id: string) {
    super(`Cliente com ID "${id}" não foi encontrado.`);
    this.name = 'CustomerNotFoundError';
  }
}
