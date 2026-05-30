import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from '../../application/use-cases/list-orders.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { ChangeOrderStatusUseCase } from '../../application/use-cases/change-order-status.use-case';
import { CreateOrderSchema } from '../../application/dtos/create-order.dto';
import { ListOrdersSchema } from '../../application/dtos/list-orders.dto';
import { UpdateOrderStatusSchema } from '../../application/dtos/update-order-status.dto';
import { ZodValidationPipe } from '../../../../common/pipes/zod-validation.pipe';
import type { CreateOrderDto } from '../../application/dtos/create-order.dto';
import type { ListOrdersDto } from '../../application/dtos/list-orders.dto';
import type { UpdateOrderStatusDto } from '../../application/dtos/update-order-status.dto';
import { OrderPresenter } from '../presenters/order.presenter';
import {
  ApiCancelOrder,
  ApiCreateOrder,
  ApiGetOrder,
  ApiListOrders,
  ApiOrderController,
  ApiUpdateOrderStatus,
} from '../openapi/order.openapi';

@ApiOrderController()
@Controller('orders')
export class OrderController {
  constructor(
    @InjectPinoLogger(OrderController.name)
    private readonly logger: PinoLogger,
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly changeOrderStatusUseCase: ChangeOrderStatusUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiCreateOrder()
  async createOrder(
    @Body(new ZodValidationPipe(CreateOrderSchema)) body: CreateOrderDto,
  ) {
    this.logger.debug(
      { customerId: body.customerId, items: body.items.length },
      'CREATE ORDER REQUEST',
    );
    const order = await this.createOrderUseCase.execute(body);
    return OrderPresenter.toResponse(order);
  }

  @Get()
  @HttpCode(200)
  @ApiListOrders()
  async listOrders(
    @Query(new ZodValidationPipe(ListOrdersSchema)) query: ListOrdersDto,
  ) {
    this.logger.debug(
      { page: query.page, limit: query.limit },
      'LIST ORDERS REQUEST',
    );
    const result = await this.listOrdersUseCase.execute(query);
    return {
      ...result,
      data: result.data.map((order) => OrderPresenter.toResponse(order)),
    };
  }

  @Get(':id')
  @HttpCode(200)
  @ApiGetOrder()
  async getOrder(@Param('id') id: string) {
    this.logger.debug({ id }, 'GET ORDER REQUEST');
    const order = await this.getOrderUseCase.execute(id);
    return OrderPresenter.toResponse(order);
  }

  @Patch(':id/status')
  @HttpCode(200)
  @ApiUpdateOrderStatus()
  async updateOrderStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateOrderStatusSchema))
    body: UpdateOrderStatusDto,
  ) {
    this.logger.debug({ id, status: body.status }, 'UPDATE ORDER STATUS REQUEST');
    const order = await this.changeOrderStatusUseCase.execute(id, body.status);
    return OrderPresenter.toResponse(order);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiCancelOrder()
  async cancelOrder(@Param('id') id: string) {
    this.logger.debug({ id }, 'CANCEL ORDER REQUEST');
    const order = await this.changeOrderStatusUseCase.execute(id, 'CANCELLED');
    return OrderPresenter.toResponse(order);
  }
}
