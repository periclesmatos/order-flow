import { Inject } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderNumber } from '../../domain/entities/order-number.value-object';
import { OrderDeliveryAddress } from '../../domain/entities/order-delivery-address.value-object';
import { ORDER_REPOSITORY } from '../../domain/repositories/order.repository.interface';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { PRODUCT_REPOSITORY } from '../../../product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '../../../product/domain/repositories/product.repository.interface';
import { CUSTOMER_REPOSITORY } from '../../../customer/domain/repositories/customer.repository.interface';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface';
import { ADDRESS_REPOSITORY } from '../../../customer/domain/repositories/address.repository.interface';
import type { IAddressRepository } from '../../../customer/domain/repositories/address.repository.interface';
import { CustomerNotFoundError } from '../../../customer/domain/errors/customer.errors';
import { AddressNotFoundError } from '../../../customer/domain/errors/address.errors';
import { ProductNotFoundError } from '../../../product/domain/errors/product.errors';
import {
  PRODUCT_MUTATED_EVENT,
  ProductMutatedEvent,
} from '../../../product/domain/events/product.events';
import {
  OrderAddressNotOwnedError,
  OrderCustomerInactiveError,
  OrderProductInactiveError,
} from '../../domain/errors/order.errors';
import {
  ORDER_MUTATED_EVENT,
  OrderMutatedEvent,
} from '../../domain/events/order.events';
import type { CreateOrderDto } from '../dtos/create-order.dto';
import type { ILogger } from '../../../../shared/domain/interfaces/logger.interface';

export class CreateOrderUseCase {
  constructor(
    private readonly logger: ILogger,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(ADDRESS_REPOSITORY)
    private readonly addressRepository: IAddressRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Transactional()
  async execute(dto: CreateOrderDto): Promise<Order> {
    const customer = await this.customerRepository.findById(dto.customerId);
    if (!customer) throw new CustomerNotFoundError(dto.customerId);
    if (!customer.isActive) {
      throw new OrderCustomerInactiveError(dto.customerId);
    }

    const address = await this.addressRepository.findById(dto.addressId);
    if (!address) throw new AddressNotFoundError(dto.addressId);
    if (address.customerId !== dto.customerId) {
      throw new OrderAddressNotOwnedError(dto.addressId, dto.customerId);
    }

    // Lock pessimista nos produtos (ordenado) antes de ler/reservar estoque:
    // serializa pedidos concorrentes do mesmo produto e evita oversell.
    const productIds = [...new Set(dto.items.map((i) => i.productId))].sort();
    await this.productRepository.lockByIds(productIds);

    const items: OrderItem[] = [];
    for (const itemDto of dto.items) {
      const product = await this.productRepository.findById(itemDto.productId);
      if (!product) throw new ProductNotFoundError(itemDto.productId);
      if (!product.isActive) {
        throw new OrderProductInactiveError(itemDto.productId);
      }

      product.reserve(itemDto.quantity);
      await this.productRepository.update(product.id, product);
      await this.eventEmitter.emitAsync(
        PRODUCT_MUTATED_EVENT,
        new ProductMutatedEvent(product.id),
      );

      items.push(
        OrderItem.create({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: itemDto.quantity,
        }),
      );
    }

    const sequence = await this.orderRepository.nextOrderNumber();
    const order = Order.create({
      orderNumber: OrderNumber.generate(sequence),
      customerId: dto.customerId,
      items,
      deliveryAddress: OrderDeliveryAddress.createFromAddress({
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      }),
    });

    const created = await this.orderRepository.create(order);
    await this.eventEmitter.emitAsync(
      ORDER_MUTATED_EVENT,
      new OrderMutatedEvent(created.id),
    );
    this.logger.debug({ orderId: created.id }, 'ORDER CREATED');
    return created;
  }
}
