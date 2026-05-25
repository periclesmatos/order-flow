import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { Customer } from '../../domain/entities/customer.entity.js';
import { addressFromPrismaRow, type AddressRow } from './address.repository.js';
import type {
  ICustomerRepository,
  CustomerFilters,
  PageResult,
  CustomerSortableField,
} from '../../domain/repositories/customer.repository.interface.js';

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  addresses?: AddressRow[];
};

function toDomain(row: CustomerRow): Customer {
  return Customer.restore({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    isActive: row.isActive,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    addresses:
      row.addresses?.map((a) => addressFromPrismaRow(a).toJSON()) ?? [],
  });
}

const customerInclude = { addresses: true as const };

@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  private get db() {
    return this.txHost.tx;
  }

  async create(customer: Customer): Promise<Customer> {
    const row = await this.db.customer.create({
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email.value,
        phone: customer.phone.e164,
        isActive: customer.isActive,
      },
      include: customerInclude,
    });
    return toDomain(row);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const row = await this.db.customer.findFirst({
      where: { email: email.trim().toLowerCase() },
      include: customerInclude,
    });
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.db.customer.findUnique({
      where: { id },
      include: customerInclude,
    });
    return row ? toDomain(row) : null;
  }

  async findAll(filters: CustomerFilters): Promise<PageResult> {
    const { name, email, phone, isActive, page, limit, sortBy, order } =
      filters;

    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (email) where.email = { contains: email, mode: 'insensitive' };
    if (phone) where.phone = { contains: phone, mode: 'insensitive' };
    if (isActive !== undefined) where.isActive = isActive;

    const skip = (page - 1) * limit;

    const [customersRow, total] = await this.db.$transaction([
      this.db.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: customerInclude,
      }),
      this.db.customer.count({ where }),
    ]);

    return {
      customers: customersRow.map((row) => toDomain(row)),
      total,
    };
  }

  async update(id: string, customer: Customer): Promise<Customer> {
    const row = await this.db.customer.update({
      where: { id },
      data: {
        name: customer.name,
        email: customer.email.value,
        phone: customer.phone.e164,
        isActive: customer.isActive,
      },
      include: customerInclude,
    });
    return toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.customer.delete({
      where: { id },
    });
  }
}
