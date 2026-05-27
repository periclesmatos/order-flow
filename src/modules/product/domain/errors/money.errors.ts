import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class MoneyNonIntegerCentsError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O valor monetário deve ser um número inteiro de centavos.');
    this.name = 'MoneyNonIntegerCentsError';
  }
}

export class MoneyNegativeCentsError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O valor monetário não pode ser negativo.');
    this.name = 'MoneyNegativeCentsError';
  }
}

export class MoneySubtractWouldGoNegativeError extends DomainError {
  readonly statusCode = 422;
  constructor() {
    super('A subtração resultaria em um valor monetário negativo.');
    this.name = 'MoneySubtractWouldGoNegativeError';
  }
}

export class MoneyNegativeFactorError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O fator de multiplicação monetária não pode ser negativo.');
    this.name = 'MoneyNegativeFactorError';
  }
}
