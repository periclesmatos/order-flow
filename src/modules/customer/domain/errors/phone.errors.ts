import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class PhoneEmptyError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O telefone é obrigatório.');
    this.name = 'PhoneEmptyError';
  }
}

export class PhoneInvalidFormatError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O telefone tem um formato inválido e não pôde ser processado.');
    this.name = 'PhoneInvalidFormatError';
  }
}

export class PhoneInvalidNumberError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O número de telefone não é válido para a região informada.');
    this.name = 'PhoneInvalidNumberError';
  }
}
