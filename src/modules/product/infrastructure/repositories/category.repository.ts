import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { Category } from '../../domain/entities/category.entity';
import type { ICategoryRepository, CategoryFilters, CategoryPageResult } from '../../domain/repositories/category.repository.interface';

function toDomain(row: {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): Category {
  return Category.restore({
    id: row.id,
    name: row.name,
    isActive: row.isActive,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  });
}

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
  ) {}

  private get db() {
    return this.txHost.tx;
  }

  async create(category: Category): Promise<Category> {
    const created = await this.db.category.create({
      data: {
        id: category.id,
        name: category.name,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
    return toDomain(created);
  }

  async findByName(name: string): Promise<Category | null> {
    const row = await this.db.category.findFirst({ where: { name } });
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<Category | null> {
    const row = await this.db.category.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findAll(filters: CategoryFilters): Promise<CategoryPageResult> {
    const where = {
      ...(filters.name ? { name: { contains: filters.name, mode: 'insensitive' as const } } : {}),
      ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {}),
    };
    const skip = (filters.page - 1) * filters.limit;
    const [rows, total] = await Promise.all([
      this.db.category.findMany({ where, orderBy: { name: 'asc' }, skip, take: filters.limit }),
      this.db.category.count({ where }),
    ]);
    return { categories: rows.map(toDomain), total };
  }

  async hasLinkedProducts(id: string): Promise<boolean> {
    const count = await this.db.product.count({ where: { categoryId: id } });
    return count > 0;
  }

  async update(id: string, category: Category): Promise<Category> {
    const updated = await this.db.category.update({
      where: { id },
      data: {
        name: category.name,
        isActive: category.isActive,
        updatedAt: category.updatedAt,
      },
    });
    return toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.db.category.delete({ where: { id } });
  }
}
