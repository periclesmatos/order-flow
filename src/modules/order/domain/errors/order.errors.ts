import { DomainError } from '../../../../shared/domain/errors/domain.error';
import type { OrderStatus } from '../entities/order.entity';

export class OrderNotFoundError extends DomainError {
  readonly statusCode = 404;
  constructor(id: string) {
    super(`Pedido com ID "${id}" não foi encontrado.`);
    this.name = 'OrderNotFoundError';
  }
}

export class EmptyOrderError extends DomainError {
  readonly statusCode = 422;
  constructor() {
    super('O pedido deve conter pelo menos um item.');
    this.name = 'EmptyOrderError';
  }
}

export class OrderItemInvalidQuantityError extends DomainError {
  readonly statusCode = 422;
  constructor() {
    super('A quantidade de cada item deve ser um inteiro positivo.');
    this.name = 'OrderItemInvalidQuantityError';
  }
}

export class InvalidStatusTransitionError extends DomainError {
  readonly statusCode = 422;
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Transição de status inválida: de "${from}" para "${to}".`);
    this.name = 'InvalidStatusTransitionError';
  }
}

export class OrderCustomerInactiveError extends DomainError {
  readonly statusCode = 422;
  constructor(customerId: string) {
    super(`Cliente com ID "${customerId}" está inativo.`);
    this.name = 'OrderCustomerInactiveError';
  }
}

export class OrderProductInactiveError extends DomainError {
  readonly statusCode = 422;
  constructor(productId: string) {
    super(`Produto com ID "${productId}" está inativo.`);
    this.name = 'OrderProductInactiveError';
  }
}

export class OrderAddressNotOwnedError extends DomainError {
  readonly statusCode = 422;
  constructor(addressId: string, customerId: string) {
    super(
      `Endereço com ID "${addressId}" não pertence ao cliente "${customerId}".`,
    );
    this.name = 'OrderAddressNotOwnedError';
  }
}
