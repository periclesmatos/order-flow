import { Body, Controller, Delete, Get, HttpCode, Patch, Param, Post, Query } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateCustomerUseCase } from "../../application/use-cases/create-customer.use-case.js";
import { GetCustomerUseCase } from "../../application/use-cases/get-customer.use-case.js";
import { ListCustomersUseCase } from "../../application/use-cases/list-customers.use-case.js";
import { UpdateCustomerUseCase } from "../../application/use-cases/update-customer.use-case.js";
import { DeleteCustomerUseCase } from "../../application/use-cases/delete-customer.use-case.js";
import { CreateAddressUseCase } from "../../application/use-cases/create-address.use-case.js";
import { UpdateAddressUseCase } from "../../application/use-cases/update-address.use-case.js";
import { DeleteAddressUseCase } from "../../application/use-cases/delete-address.use-case.js";
import { SetDefaultAddressUseCase } from "../../application/use-cases/set-default-address.use-case.js";
import { ZodValidationPipe } from "../../../../common/pipes/zod-validation.pipe.js";
import { CreateCustomerSchema } from "../../application/dtos/create-customer.dto.js";
import { ListCustomersSchema } from "../../application/dtos/list-customers.dto.js";
import { UpdateCustomerSchema } from "../../application/dtos/update-customer.dto.js";
import type { CreateCustomerDto } from "../../application/dtos/create-customer.dto.js";
import type { ListCustomersDto } from "../../application/dtos/list-customers.dto.js";
import type { UpdateCustomerDto } from "../../application/dtos/update-customer.dto.js";
import { CustomerPresenter } from "../presenters/customer.presenter.js";
import {
  ApiCreateAddress,
  ApiCreateCustomer,
  ApiCustomerController,
  ApiDeleteAddress,
  ApiDeleteCustomer,
  ApiGetCustomer,
  ApiListCustomers,
  ApiSetDefaultAddress,
  ApiUpdateAddress,
  ApiUpdateCustomer,
} from '../openapi/customer.openapi.js';
import { CreateAddressSchema } from '../../application/dtos/create-address.dto.js';
import type { CreateAddressDto } from '../../application/dtos/create-address.dto.js';
import { UpdateAddressSchema } from '../../application/dtos/update-address.dto.js';
import type { UpdateAddressDto } from '../../application/dtos/update-address.dto.js';

@ApiCustomerController()
@Controller('customers')
export class CustomerController {
  constructor(
    @InjectPinoLogger(CustomerController.name)
    private readonly logger: PinoLogger,
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerUseCase: GetCustomerUseCase,
    private readonly listCustomersUseCase: ListCustomersUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly updateAddressUseCase: UpdateAddressUseCase,
    private readonly deleteAddressUseCase: DeleteAddressUseCase,
    private readonly setDefaultAddressUseCase: SetDefaultAddressUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiCreateCustomer()
  async createCustomer(@Body(new ZodValidationPipe(CreateCustomerSchema)) body: CreateCustomerDto) {
    this.logger.debug({ body }, 'CREATE CUSTOMER REQUEST');
    const customer = await this.createCustomerUseCase.execute(body);
    return CustomerPresenter.toResponse(customer);
  }

  @Get()
  @ApiListCustomers()
  async listCustomers(@Query(new ZodValidationPipe(ListCustomersSchema)) query: ListCustomersDto) {
    this.logger.debug({ query }, 'LIST CUSTOMERS REQUEST');
    const result = await this.listCustomersUseCase.execute(query);
    return {
      ...result,
      data: result.data.map((customer) => CustomerPresenter.toResponse(customer)),
    };
  }

  @Get(':id')
  @ApiGetCustomer()
  async getCustomer(@Param('id') id: string) {
    const customer = await this.getCustomerUseCase.execute(id);
    return CustomerPresenter.toResponse(customer);
  }

  @Patch(':id')
  @ApiUpdateCustomer()
  async updateCustomer(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateCustomerSchema)) body: UpdateCustomerDto) {
    this.logger.debug({ id, body }, 'UPDATE CUSTOMER REQUEST');
    const customer = await this.updateCustomerUseCase.execute(id, body);
    return CustomerPresenter.toResponse(customer);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiDeleteCustomer()
  async deleteCustomer(@Param('id') id: string) {
    this.logger.debug({ id }, 'DELETE CUSTOMER REQUEST');
    await this.deleteCustomerUseCase.execute(id);
  }

  @Post(':customerId/addresses')
  @HttpCode(201)
  @ApiCreateAddress()
  async createAddress(@Param('customerId') customerId: string, @Body(new ZodValidationPipe(CreateAddressSchema)) body: CreateAddressDto) {
    this.logger.debug({ customerId, body }, 'CREATE ADDRESS REQUEST');
    const address = await this.createAddressUseCase.execute(customerId, body);
    return CustomerPresenter.addressToResponse(address);
  }

  @Patch(':customerId/addresses/:addressId/default')
  @ApiSetDefaultAddress()
  async setDefaultAddress(@Param('customerId') customerId: string, @Param('addressId') addressId: string) {
    this.logger.debug({ customerId, addressId }, 'SET DEFAULT ADDRESS REQUEST');
    const address = await this.setDefaultAddressUseCase.execute(customerId, addressId);
    return CustomerPresenter.addressToResponse(address);
  }

  @Patch(':customerId/addresses/:addressId')
  @ApiUpdateAddress()
  async updateAddress(@Param('customerId') customerId: string, @Param('addressId') addressId: string, @Body(new ZodValidationPipe(UpdateAddressSchema)) body: UpdateAddressDto) {
    this.logger.debug({ customerId, addressId, body }, 'UPDATE ADDRESS REQUEST');
    const address = await this.updateAddressUseCase.execute(customerId, addressId, body);
    return CustomerPresenter.addressToResponse(address);
  }

  @Delete(':customerId/addresses/:addressId')
  @HttpCode(204)
  @ApiDeleteAddress()
  async deleteAddress(@Param('customerId') customerId: string, @Param('addressId') addressId: string) {
    this.logger.debug({ customerId, addressId }, 'DELETE ADDRESS REQUEST');
    await this.deleteAddressUseCase.execute(customerId, addressId);
  }
}
