import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case';
import { GetCategoryUseCase } from '../../application/use-cases/get-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { DeactivateCategoryUseCase } from '../../application/use-cases/deactivate-category.use-case';
import { CreateCategorySchema } from '../../application/dtos/create-category.dto';
import { ListCategoriesSchema } from '../../application/dtos/list-categories.dto';
import { UpdateCategorySchema } from '../../application/dtos/update-category.dto';
import { ZodValidationPipe } from '../../../../common/pipes/zod-validation.pipe';
import type { CreateCategoryDto } from '../../application/dtos/create-category.dto';
import type { ListCategoriesDto } from '../../application/dtos/list-categories.dto';
import type { UpdateCategoryDto } from '../../application/dtos/update-category.dto';
import { CategoryPresenter } from '../presenters/category.presenter';
import {
  ApiCategoryController,
  ApiCreateCategory,
  ApiListCategories,
  ApiGetCategory,
  ApiUpdateCategory,
  ApiDeactivateCategory,
  ApiDeleteCategory,
} from '../openapi/category.openapi';

@ApiCategoryController()
@Controller('categories')
export class CategoryController {
  constructor(
    @InjectPinoLogger(CategoryController.name)
    private readonly logger: PinoLogger,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly deactivateCategoryUseCase: DeactivateCategoryUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiCreateCategory()
  async createCategory(
    @Body(new ZodValidationPipe(CreateCategorySchema)) body: CreateCategoryDto,
  ) {
    this.logger.debug({ body }, 'CREATE CATEGORY REQUEST');
    const category = await this.createCategoryUseCase.execute(body);
    return CategoryPresenter.toResponse(category);
  }

  @Get()
  @HttpCode(200)
  @ApiListCategories()
  async listCategories(
    @Query(new ZodValidationPipe(ListCategoriesSchema)) query: ListCategoriesDto,
  ) {
    this.logger.debug({ page: query.page, limit: query.limit }, 'LIST CATEGORIES REQUEST');
    const result = await this.listCategoriesUseCase.execute(query);
    return {
      ...result,
      data: result.data.map((c) => CategoryPresenter.toResponse(c)),
    };
  }

  @Get(':id')
  @HttpCode(200)
  @ApiGetCategory()
  async getCategory(@Param('id') id: string) {
    this.logger.debug({ id }, 'GET CATEGORY REQUEST');
    const category = await this.getCategoryUseCase.execute(id);
    return CategoryPresenter.toResponse(category);
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiUpdateCategory()
  async updateCategory(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCategorySchema)) body: UpdateCategoryDto,
  ) {
    this.logger.debug({ id }, 'UPDATE CATEGORY REQUEST');
    const category = await this.updateCategoryUseCase.execute(id, body);
    return CategoryPresenter.toResponse(category);
  }

  @Patch(':id/deactivate')
  @HttpCode(200)
  @ApiDeactivateCategory()
  async deactivateCategory(@Param('id') id: string) {
    this.logger.debug({ id }, 'DEACTIVATE CATEGORY REQUEST');
    const category = await this.deactivateCategoryUseCase.execute(id);
    return CategoryPresenter.toResponse(category);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiDeleteCategory()
  deleteCategory(@Param('id') id: string) {
    this.logger.debug({ id }, 'DELETE CATEGORY REQUEST');
    return this.deleteCategoryUseCase.execute(id);
  }
}
