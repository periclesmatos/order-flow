import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../common/errors/domain.error.js';

export class ProductAlreadyExistsError extends DomainError {
  readonly statusCode = HttpStatus.CONFLICT;

  constructor(name: string) {
    super(`Product with name "${name}" already exists.`);
    this.name = 'ProductAlreadyExistsError';
  }
}

export class ProductNotFoundError extends DomainError {
  readonly statusCode = HttpStatus.NOT_FOUND;

  constructor(id: string) {
    super(`Product with id "${id}" not found.`);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductEmptyNameError extends DomainError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor() {
    super('Product name cannot be empty.');
    this.name = 'ProductEmptyNameError';
  }
}

export class ProductNegativePriceError extends DomainError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor() {
    super('Product price cannot be negative.');
    this.name = 'ProductNegativePriceError';
  }
}

export class ProductNegativeAmountError extends DomainError {
  readonly statusCode = HttpStatus.BAD_REQUEST;

  constructor() {
    super('Product amount cannot be negative.');
    this.name = 'ProductNegativeAmountError';
  }
}
