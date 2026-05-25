import { Injectable } from '@nestjs/common';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '../../../../core/prisma/prisma.service.js';
import { Address } from '../../domain/entities/address.entity.js';
import type { IAddressRepository } from '../../domain/repositories/address.repository.interface.js';

export type AddressRow = {
  id: string;
  customerId: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function addressFromPrismaRow(row: AddressRow): Address {
  return Address.restore({
    id: row.id,
    customerId: row.customerId,
    street: row.street,
    number: row.number,
    complement: row.complement,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

@Injectable()
export class AddressRepository implements IAddressRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  private get db() {
    return this.txHost.tx;
  }

  @Transactional()
  async create(customerId: string, address: Address): Promise<Address> {
    if (address.isDefault) {
      await this.db.address.updateMany({
        where: { customerId },
        data: { isDefault: false },
      });
    }
    const row = await this.db.address.create({
      data: {
        id: address.id,
        customerId,
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      },
    });
    return addressFromPrismaRow(row);
  }

  async findById(id: string): Promise<Address | null> {
    const row = await this.db.address.findUnique({ where: { id } });
    return row ? addressFromPrismaRow(row) : null;
  }

  async findAllByCustomerId(customerId: string): Promise<Address[]> {
    const rows = await this.db.address.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    return rows.map(addressFromPrismaRow);
  }

  @Transactional()
  async update(
    customerId: string,
    id: string,
    address: Address,
  ): Promise<Address> {
    if (address.isDefault) {
      await this.db.address.updateMany({
        where: { customerId, id: { not: id } },
        data: { isDefault: false },
      });
    }
    const row = await this.db.address.update({
      where: { id, customerId },
      data: {
        street: address.street,
        number: address.number,
        complement: address.complement,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
        updatedAt: address.updatedAt,
      },
    });
    return addressFromPrismaRow(row);
  }

  @Transactional()
  async delete(customerId: string, id: string): Promise<void> {
    const existing = await this.db.address.findUnique({
      where: { id, customerId },
    });
    if (!existing) {
      return;
    }
    const wasDefault = existing.isDefault;
    await this.db.address.delete({ where: { id, customerId } });
    if (wasDefault) {
      const next = await this.db.address.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await this.db.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  }
}
