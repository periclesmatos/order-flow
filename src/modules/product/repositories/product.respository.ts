import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service.js';
import { Product } from '../entities/product.entity.js';
import type { IProductRepository, ProductFilters, PageResult, ProductSortableField } from '../repositories/product.repository.interface.js';

function toDomain(row: { id: string; name: string; price: number; amount: number; isActive: boolean; createdAt: Date; updatedAt: Date }): Product {
  return Product.restore({
    id: row.id,
    name: row.name,
    price: row.price,
    amount: row.amount,
    isActive: row.isActive,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  });
}

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(product: Product): Promise<Product> {
    const created = await this.prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        price: product.price.cents,
        amount: product.amount,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
    return toDomain(created);
  }

  async findByName(name: string): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({ where: { name } });
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findAll(filters: ProductFilters): Promise<PageResult> {
    const where: {
      name?: { contains: string; mode: 'insensitive' };
      isActive?: boolean;
    } = {};

    if (filters.name) {
      where.name = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const orderByMap: Record<ProductSortableField, Record<string, string>> = {
      name: { name: filters.order },
      price: { price: filters.order },
      createdAt: { createdAt: filters.order },
      amount: { amount: filters.order },
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: orderByMap[filters.sortBy],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
    ]);

    return { products: rows.map(toDomain), total };
  }

  async update(id: string, product: Product): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: product.name,
        price: product.price.cents,
        amount: product.amount,
        isActive: product.isActive,
        updatedAt: product.updatedAt,
      },
    });
    return toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}
