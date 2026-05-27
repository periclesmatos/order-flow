import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { Product } from '../../domain/entities/product.entity';
import type {
  IProductRepository,
  ProductFilters,
  PageResult,
  ProductSortableField,
} from '../../domain/repositories/product.repository.interface';

function toDomain(row: {
  id: string;
  name: string;
  description: string;
  price: number;
  stockOnHand: number;
  reservedQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Product {
  return Product.restore({
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    stockOnHand: row.stockOnHand,
    reservedQuantity: row.reservedQuantity,
    isActive: row.isActive,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  });
}

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  private get db() {
    return this.txHost.tx;
  }

  async create(product: Product): Promise<Product> {
    const created = await this.db.product.create({
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.cents,
        stockOnHand: product.stockOnHand,
        reservedQuantity: product.reservedQuantity,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
    return toDomain(created);
  }

  async findByName(name: string): Promise<Product | null> {
    const row = await this.db.product.findFirst({ where: { name } });
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<Product | null> {
    const row = await this.db.product.findUnique({ where: { id } });
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
      stockOnHand: { stockOnHand: filters.order },
    };

    const [total, rows] = await this.db.$transaction([
      this.db.product.count({ where }),
      this.db.product.findMany({
        where,
        orderBy: orderByMap[filters.sortBy],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
    ]);

    return { products: rows.map(toDomain), total };
  }

  async update(id: string, product: Product): Promise<Product> {
    const updated = await this.db.product.update({
      where: { id },
      data: {
        name: product.name,
        description: product.description,
        price: product.price.cents,
        stockOnHand: product.stockOnHand,
        reservedQuantity: product.reservedQuantity,
        isActive: product.isActive,
        updatedAt: product.updatedAt,
      },
    });
    return toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.db.product.delete({ where: { id } });
  }
}
