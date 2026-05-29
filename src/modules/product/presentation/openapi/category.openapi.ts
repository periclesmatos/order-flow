import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

const CREATE_CATEGORY_BODY_EXAMPLE = { name: 'Eletrônicos' };
const UPDATE_CATEGORY_BODY_EXAMPLE = { name: 'Novo Nome' };

export function ApiCategoryController() {
  return applyDecorators(ApiTags('categories'));
}

export function ApiCreateCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a category' }),
    ApiBody({ schema: { example: CREATE_CATEGORY_BODY_EXAMPLE } }),
  );
}

export function ApiListCategories() {
  return applyDecorators(
    ApiOperation({ summary: 'List categories with pagination' }),
    ApiQuery({ name: 'name', required: false, type: String }),
    ApiQuery({ name: 'isActive', required: false, type: Boolean }),
    ApiQuery({ name: 'page', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
  );
}

export function ApiGetCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a category by ID' }),
    ApiParam({ name: 'id', type: String }),
  );
}

export function ApiUpdateCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a category name' }),
    ApiParam({ name: 'id', type: String }),
    ApiBody({ schema: { example: UPDATE_CATEGORY_BODY_EXAMPLE } }),
  );
}

export function ApiDeactivateCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Deactivate a category' }),
    ApiParam({ name: 'id', type: String }),
  );
}

export function ApiDeleteCategory() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a category' }),
    ApiParam({ name: 'id', type: String }),
  );
}
