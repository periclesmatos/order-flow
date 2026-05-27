import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

const CREATE_CUSTOMER_BODY_EXAMPLE = {
  name: 'João Silva',
  email: 'joao@example.com',
  phone: '+5511999999999',
  addresses: [
    {
      street: 'Rua A',
      number: '100',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000',
      isDefault: true,
    },
  ],
};

const CREATE_ADDRESS_BODY_EXAMPLE = {
  street: 'Rua A',
  number: '100',
  city: 'São Paulo',
  state: 'SP',
  postalCode: '01000-000',
  country: 'Brazil',
  isDefault: true,
};

const UPDATE_ADDRESS_BODY_EXAMPLE = {
  street: 'Rua A',
  number: '100',
  city: 'São Paulo',
  state: 'SP',
  postalCode: '01000-000',
  country: 'Brazil',
  isDefault: true,
};

const UPDATE_CUSTOMER_BODY_EXAMPLE = {
  name: 'João Silva Atualizado',
};

export function ApiCustomerController() {
  return applyDecorators(ApiTags('customers'));
}

export function ApiCreateCustomer() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a customer' }),
    ApiBody({
      schema: {
        example: CREATE_CUSTOMER_BODY_EXAMPLE,
      },
    }),
  );
}

export function ApiGetCustomer() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a customer by id' }),
    ApiParam({ name: 'id', format: 'uuid' }),
  );
}

export function ApiListCustomers() {
  return applyDecorators(ApiOperation({ summary: 'List customers' }));
}

export function ApiUpdateCustomer() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a customer' }),
    ApiParam({ name: 'id', format: 'uuid' }),
    ApiBody({
      schema: {
        example: UPDATE_CUSTOMER_BODY_EXAMPLE,
      },
    }),
  );
}

export function ApiDeleteCustomer() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a customer' }),
    ApiParam({ name: 'id', format: 'uuid' }),
  );
}

export function ApiCreateAddress() {
  return applyDecorators(
    ApiOperation({ summary: 'Create an address for a customer' }),
    ApiParam({ name: 'customerId', format: 'uuid' }),
    ApiBody({
      schema: {
        example: CREATE_ADDRESS_BODY_EXAMPLE,
      },
    }),
  );
}

export function ApiUpdateAddress() {
  return applyDecorators(
    ApiOperation({ summary: 'Update an address for a customer' }),
    ApiParam({ name: 'customerId', format: 'uuid' }),
    ApiParam({ name: 'addressId', format: 'uuid' }),
    ApiBody({
      schema: {
        example: UPDATE_ADDRESS_BODY_EXAMPLE,
      },
    }),
  );
}

export function ApiDeleteAddress() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete an address for a customer' }),
    ApiParam({ name: 'customerId', format: 'uuid' }),
    ApiParam({ name: 'addressId', format: 'uuid' }),
  );
}

export function ApiSetDefaultAddress() {
  return applyDecorators(
    ApiOperation({ summary: 'Set an address as default for a customer' }),
    ApiParam({ name: 'customerId', format: 'uuid' }),
    ApiParam({ name: 'addressId', format: 'uuid' }),
  );
}
