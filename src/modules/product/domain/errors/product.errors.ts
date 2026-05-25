import { DomainError } from '../../../../common/errors/domain.error.js';

export class ProductAlreadyExistsError extends DomainError {
  readonly statusCode = 409;
  constructor(name: string) {
    super(`Já existe um produto com o nome "${name}".`);
    this.name = 'ProductAlreadyExistsError';
  }
}

export class ProductNotFoundError extends DomainError {
  readonly statusCode = 404;
  constructor(id: string) {
    super(`Produto com ID "${id}" não foi encontrado.`);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductEmptyNameError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O nome do produto não pode estar vazio.');
    this.name = 'ProductEmptyNameError';
  }
}

export class ProductNegativePriceError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O preço do produto não pode ser negativo.');
    this.name = 'ProductNegativePriceError';
  }
}

export class ProductNegativeAmountError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('A quantidade do produto não pode ser negativa.');
    this.name = 'ProductNegativeAmountError';
  }
}

export class InsufficientStockError extends DomainError {
  readonly statusCode = 422;
  constructor(requested: number, available: number) {
    super(`Estoque insuficiente: solicitado ${requested}, disponível ${available}.`);
    this.name = 'InsufficientStockError';
  }
}
