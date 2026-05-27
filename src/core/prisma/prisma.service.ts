import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import type { PrismaClient as PrismaClientType } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  declare product: InstanceType<typeof PrismaClient>['product'];
  declare customer: InstanceType<typeof PrismaClient>['customer'];
  declare address: InstanceType<typeof PrismaClient>['address'];
  declare $connect: PrismaClientType['$connect'];
  declare $disconnect: PrismaClientType['$disconnect'];
  declare $transaction: PrismaClientType['$transaction'];

  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
