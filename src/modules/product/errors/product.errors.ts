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
