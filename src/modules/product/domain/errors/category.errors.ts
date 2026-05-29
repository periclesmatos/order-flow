import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CategoryEmptyNameError extends DomainError {
  readonly statusCode = 400;
  constructor() {
    super('O nome da categoria não pode estar vazio.');
    this.name = 'CategoryEmptyNameError';
  }
}

export class CategoryAlreadyExistsError extends DomainError {
  readonly statusCode = 409;
  constructor(name: string) {
    super(`Já existe uma categoria com o nome "${name}".`);
    this.name = 'CategoryAlreadyExistsError';
  }
}

export class CategoryNotFoundError extends DomainError {
  readonly statusCode = 404;
  constructor(id: string) {
    super(`Categoria com ID "${id}" não foi encontrada.`);
    this.name = 'CategoryNotFoundError';
  }
}

export class CategoryHasProductsError extends DomainError {
  readonly statusCode = 409;
  constructor() {
    super('Não é possível remover uma categoria com produtos vinculados.');
    this.name = 'CategoryHasProductsError';
  }
}