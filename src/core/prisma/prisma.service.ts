import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('Conectando ao banco de dados...');
    await this.$connect();
    this.logger.log('Banco de dados conectado.');
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Encerrando conexão com o banco de dados...');
    await this.$disconnect();
    this.logger.log('Conexão com o banco de dados encerrada.');
  }
}
