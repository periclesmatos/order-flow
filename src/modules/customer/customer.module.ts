import { Module } from '@nestjs/common';
import { AddressRepository } from './infrastructure/repositories/address.repository';
import { CustomerRepository } from './infrastructure/repositories/customer.repository';
import { ADDRESS_REPOSITORY } from './domain/repositories/address.repository.interface';
import { CUSTOMER_REPOSITORY } from './domain/repositories/customer.repository.interface';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { GetCustomerUseCase } from './application/use-cases/get-customer.use-case';
import { ListCustomersUseCase } from './application/use-cases/list-customers.use-case';
import { UpdateCustomerUseCase } from './application/use-cases/update-customer.use-case';
import { DeleteCustomerUseCase } from './application/use-cases/delete-customer.use-case';
import { CreateAddressUseCase } from './application/use-cases/create-address.use-case';
import { UpdateAddressUseCase } from './application/use-cases/update-address.use-case';
import { DeleteAddressUseCase } from './application/use-cases/delete-address.use-case';
import { SetDefaultAddressUseCase } from './application/use-cases/set-default-address.use-case';
import { CustomerController } from './presentation/controllers/customer.controller';
import { PinoLoggerAdapter } from '../../shared/infrastructure/logger/pino-logger.adapter';
import type { ILogger } from '../../shared/domain/interfaces/logger.interface';

const LOGGER_TOKEN = 'ILogger';

@Module({
  controllers: [CustomerController],
  providers: [
    {
      provide: LOGGER_TOKEN,
      useClass: PinoLoggerAdapter,
    },
    {
      provide: CreateCustomerUseCase,
      inject: [LOGGER_TOKEN, CUSTOMER_REPOSITORY, ADDRESS_REPOSITORY],
      useFactory: (logger: ILogger, customerRepo: any, addressRepo: any) =>
        new CreateCustomerUseCase(logger, customerRepo, addressRepo),
    },
    {
      provide: GetCustomerUseCase,
      inject: [LOGGER_TOKEN, CUSTOMER_REPOSITORY],
      useFactory: (logger: ILogger, customerRepo: any) =>
        new GetCustomerUseCase(logger, customerRepo),
    },
    {
      provide: ListCustomersUseCase,
      inject: [LOGGER_TOKEN, CUSTOMER_REPOSITORY],
      useFactory: (logger: ILogger, customerRepo: any) =>
        new ListCustomersUseCase(logger, customerRepo),
    },
    {
      provide: UpdateCustomerUseCase,
      inject: [LOGGER_TOKEN, CUSTOMER_REPOSITORY],
      useFactory: (logger: ILogger, customerRepo: any) =>
        new UpdateCustomerUseCase(logger, customerRepo),
    },
    {
      provide: DeleteCustomerUseCase,
      inject: [LOGGER_TOKEN, CUSTOMER_REPOSITORY],
      useFactory: (logger: ILogger, customerRepo: any) =>
        new DeleteCustomerUseCase(logger, customerRepo),
    },
    {
      provide: CreateAddressUseCase,
      inject: [LOGGER_TOKEN, ADDRESS_REPOSITORY, CUSTOMER_REPOSITORY],
      useFactory: (logger: ILogger, addressRepo: any, customerRepo: any) =>
        new CreateAddressUseCase(logger, addressRepo, customerRepo),
    },
    {
      provide: UpdateAddressUseCase,
      inject: [LOGGER_TOKEN, ADDRESS_REPOSITORY, CUSTOMER_REPOSITORY],
      useFactory: (logger: ILogger, addressRepo: any, customerRepo: any) =>
        new UpdateAddressUseCase(logger, addressRepo, customerRepo),
    },
    {
      provide: DeleteAddressUseCase,
      inject: [LOGGER_TOKEN, ADDRESS_REPOSITORY, CUSTOMER_REPOSITORY],
      useFactory: (logger: ILogger, addressRepo: any, customerRepo: any) =>
        new DeleteAddressUseCase(logger, addressRepo, customerRepo),
    },
    {
      provide: SetDefaultAddressUseCase,
      inject: [LOGGER_TOKEN, ADDRESS_REPOSITORY, CUSTOMER_REPOSITORY],
      useFactory: (logger: ILogger, addressRepo: any, customerRepo: any) =>
        new SetDefaultAddressUseCase(logger, addressRepo, customerRepo),
    },
    { provide: CUSTOMER_REPOSITORY, useClass: CustomerRepository },
    { provide: ADDRESS_REPOSITORY, useClass: AddressRepository },
  ],
  exports: [
    CUSTOMER_REPOSITORY,
    ADDRESS_REPOSITORY,
    CreateCustomerUseCase,
    GetCustomerUseCase,
    ListCustomersUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
  ],
})
export class CustomerModule {}
