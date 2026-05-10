import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../common/errors/domain.error.js';

export class MoneyNonIntegerCentsError extends DomainError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor() {
    super('Money amount must be an integer number of cents.');
    this.name = 'MoneyNonIntegerCentsError';
  }
}

export class MoneyNegativeCentsError extends DomainError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor() {
    super('Money amount cannot be negative.');
    this.name = 'MoneyNegativeCentsError';
  }
}

export class MoneySubtractWouldGoNegativeError extends DomainError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor() {
    super('Money subtraction cannot result in a negative amount.');
    this.name = 'MoneySubtractWouldGoNegativeError';
  }
}

export class MoneyNegativeFactorError extends DomainError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor() {
    super('Money multiplication factor cannot be negative.');
    this.name = 'MoneyNegativeFactorError';
  }
}
