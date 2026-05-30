import type { Order, OrderStatus } from '../../domain/entities/order.entity';

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderDeliveryAddressResponse {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  items: OrderItemResponse[];
  deliveryAddress: OrderDeliveryAddressResponse;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderPresenter {
  static toResponse(order: Order): OrderResponse {
    return {
      id: order.id,
      orderNumber: order.orderNumber.value,
      customerId: order.customerId,
      status: order.status,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        price: item.price.toFloat(),
        quantity: item.quantity,
        subtotal: item.subtotal.toFloat(),
      })),
      deliveryAddress: {
        street: order.deliveryAddress.street,
        number: order.deliveryAddress.number,
        complement: order.deliveryAddress.complement,
        neighborhood: order.deliveryAddress.neighborhood,
        city: order.deliveryAddress.city,
        state: order.deliveryAddress.state,
        postalCode: order.deliveryAddress.postalCode,
        country: order.deliveryAddress.country,
      },
      total: order.total.toFloat(),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
