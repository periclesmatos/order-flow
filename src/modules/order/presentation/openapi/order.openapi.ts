import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

const CREATE_ORDER_BODY_EXAMPLE = {
  customerId: '550e8400-e29b-41d4-a716-446655440000',
  addressId: '550e8400-e29b-41d4-a716-446655440001',
  items: [
    { productId: '550e8400-e29b-41d4-a716-446655440002', quantity: 2 },
  ],
};

const UPDATE_ORDER_STATUS_BODY_EXAMPLE = {
  status: 'PROCESSING',
};

export function ApiOrderController() {
  return applyDecorators(ApiTags('orders'));
}

export function ApiCreateOrder() {
  return applyDecorators(
    ApiOperation({ summary: 'Create an order' }),
    ApiBody({ schema: { example: CREATE_ORDER_BODY_EXAMPLE } }),
  );
}

export function ApiListOrders() {
  return applyDecorators(ApiOperation({ summary: 'List orders' }));
}

export function ApiGetOrder() {
  return applyDecorators(
    ApiOperation({ summary: 'Get an order by id' }),
    ApiParam({ name: 'id', format: 'uuid' }),
  );
}

export function ApiUpdateOrderStatus() {
  return applyDecorators(
    ApiOperation({ summary: 'Change order status' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ schema: { example: UPDATE_ORDER_STATUS_BODY_EXAMPLE } }),
  );
}

export function ApiCancelOrder() {
  return applyDecorators(
    ApiOperation({ summary: 'Cancel an order' }),
    ApiParam({ name: 'id', format: 'uuid' }),
  );
}
