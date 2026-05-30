import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { Order } from '../../domain/entities/order.entity';
import type { OrderStatus } from '../../domain/entities/order.entity';
import type {
  IOrderRepository,
  OrderFilters,
  OrderSortableField,
  PageResult,
} from '../../domain/repositories/order.repository.interface';

const ORDER_INCLUDE = {
  orderItems: true,
  deliveryAdress: true,
} as const;

function toDomain(row: {
  id: string;
  OrderNumber: string;
  customerId: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  orderItems: Array<{
    id: string;
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
  }>;
  deliveryAdress: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
}): Order {
  const address = row.deliveryAdress;
  return Order.restore({
    id: row.id,
    orderNumber: row.OrderNumber,
    customerId: row.customerId,
    status: row.status,
    items: row.orderItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    })),
    deliveryAddress: {
      street: address?.street ?? '',
      number: address?.number ?? '',
      complement: address?.complement ?? '',
      neighborhood: address?.neighborhood ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
      postalCode: address?.postalCode ?? '',
      country: address?.country ?? '',
    },
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  });
}

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  private get db() {
    return this.txHost.tx;
  }

  async nextOrderNumber(): Promise<number> {
    const rows = await this.db.$queryRaw<
      Array<{ seq: bigint | number | string }>
    >`SELECT nextval('order_number_seq') AS seq`;
    return Number(rows[0].seq);
  }

  async create(order: Order): Promise<Order> {
    const json = order.toJSON();
    const created = await this.db.order.create({
      data: {
        id: json.id,
        OrderNumber: json.orderNumber,
        customerId: json.customerId,
        status: json.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        orderItems: {
          create: json.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
        },
        deliveryAdress: {
          create: {
            street: json.deliveryAddress.street,
            number: json.deliveryAddress.number,
            complement: json.deliveryAddress.complement,
            neighborhood: json.deliveryAddress.neighborhood,
            city: json.deliveryAddress.city,
            state: json.deliveryAddress.state,
            postalCode: json.deliveryAddress.postalCode,
            country: json.deliveryAddress.country,
          },
        },
      },
      include: ORDER_INCLUDE,
    });
    return toDomain(created);
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.db.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
    return row ? toDomain(row) : null;
  }

  async findAll(filters: OrderFilters): Promise<PageResult> {
    const where: { status?: OrderStatus; customerId?: string } = {};
    if (filters.status) where.status = filters.status;
    if (filters.customerId) where.customerId = filters.customerId;

    const orderByMap: Record<OrderSortableField, Record<string, string>> = {
      orderNumber: { OrderNumber: filters.order },
      status: { status: filters.order },
      createdAt: { createdAt: filters.order },
      updatedAt: { updatedAt: filters.order },
    };

    const [total, rows] = await this.db.$transaction([
      this.db.order.count({ where }),
      this.db.order.findMany({
        where,
        orderBy: orderByMap[filters.sortBy],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: ORDER_INCLUDE,
      }),
    ]);

    return { orders: rows.map(toDomain), total };
  }

  async updateStatus(order: Order): Promise<Order> {
    const updated = await this.db.order.update({
      where: { id: order.id },
      data: {
        status: order.status,
        updatedAt: order.updatedAt,
      },
      include: ORDER_INCLUDE,
    });
    return toDomain(updated);
  }
}
