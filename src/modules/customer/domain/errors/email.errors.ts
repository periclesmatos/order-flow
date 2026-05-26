import { DomainError } from '../../../../shared/domain/errors/domain.error.js';

export class EmailEmptyError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O e-mail é obrigatório.');
    this.name = 'EmailEmptyError';
  }
}

export class EmailInvalidFormatError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O e-mail fornecido tem um formato inválido.');
    this.name = 'EmailInvalidFormatError';
  }
}
