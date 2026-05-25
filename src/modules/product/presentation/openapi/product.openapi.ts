import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

const CREATE_PRODUCT_BODY_EXAMPLE = {
  name: 'Notebook',
  price: 10.5,
  stockOnHand: 3,
};

const UPDATE_PRODUCT_BODY_EXAMPLE = {
  name: 'New Name',
  isActive: false,
};

const UPDATE_PRODUCT_PRICE_BODY_EXAMPLE = {
  price: 25,
};

const UPDATE_PRODUCT_AMOUNT_BODY_EXAMPLE = {
  stockOnHand: 50,
};

export function ApiProductController() {
  return applyDecorators(ApiTags('products'));
}

export function ApiCreateProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a product' }),
    ApiBody({
      schema: {
        example: CREATE_PRODUCT_BODY_EXAMPLE,
      },
    }),
  );
}

export function ApiListProducts() {
  return applyDecorators(ApiOperation({ summary: 'List products' }));
}

export function ApiGetProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a product by id' }),
    ApiParam({ name: 'id', format: 'uuid' }),
  );
}

export function ApiUpdateProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a product' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({
      schema: {
        example: UPDATE_PRODUCT_BODY_EXAMPLE,
      },
    }),
  );
}

export function ApiUpdateProductPrice() {
  return applyDecorators(
    ApiOperation({ summary: 'Update product price' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ schema: { example: UPDATE_PRODUCT_PRICE_BODY_EXAMPLE } }),
  );
}

export function ApiUpdateProductAmount() {
  return applyDecorators(
    ApiOperation({ summary: 'Update product stock amount' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({ schema: { example: UPDATE_PRODUCT_AMOUNT_BODY_EXAMPLE } }),
  );
}

export function ApiDeleteProduct() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a product' }),
    ApiParam({ name: 'id', format: 'uuid' }),
  );
}
