import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateProductUseCase } from '../use-cases/create-product.use-case.js';
import { ListProductsUseCase } from '../use-cases/list-products.use-case.js';
import { GetProductUseCase } from '../use-cases/get-product.use-case.js';
import { UpdateProductUseCase } from '../use-cases/update-product.use-case.js';
import { UpdateProductPriceUseCase } from '../use-cases/update-product-price.use-case.js';
import { UpdateProductAmountUseCase } from '../use-cases/update-product-amount.use-case.js';
import { DeleteProductUseCase } from '../use-cases/delete-product.use-case.js';
import { CreateProductSchema } from '../dtos/create-product.dto.js';
import { ListProductsSchema } from '../dtos/list-products.dto.js';
import { UpdateProductSchema } from '../dtos/update-product.dto.js';
import { UpdateProductPriceSchema } from '../dtos/update-product-price.dto.js';
import { UpdateProductAmountSchema } from '../dtos/update-product-amount.dto.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import type { CreateProductDto } from '../dtos/create-product.dto.js';
import type { ListProductsDto } from '../dtos/list-products.dto.js';
import type { UpdateProductDto } from '../dtos/update-product.dto.js';
import type { UpdateProductPriceDto } from '../dtos/update-product-price.dto.js';
import type { UpdateProductAmountDto } from '../dtos/update-product-amount.dto.js';

@Controller('products')
export class ProductController {
  constructor(
    @InjectPinoLogger(ProductController.name)
    private readonly logger: PinoLogger,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly updateProductPriceUseCase: UpdateProductPriceUseCase,
    private readonly updateProductAmountUseCase: UpdateProductAmountUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  createProduct(@Body(new ZodValidationPipe(CreateProductSchema)) body: CreateProductDto) {
    this.logger.debug({ body }, 'createProduct request');
    return this.createProductUseCase.execute(body);
  }

  @Get()
  @HttpCode(200)
  listProducts(@Query(new ZodValidationPipe(ListProductsSchema)) query: ListProductsDto) {
    this.logger.debug({ page: query.page, limit: query.limit }, 'listProducts request');
    return this.listProductsUseCase.execute(query);
  }

  @Get(':id')
  @HttpCode(200)
  getProduct(@Param('id') id: string) {
    this.logger.debug({ id }, 'getProduct request');
    return this.getProductUseCase.execute(id);
  }

  @Patch(':id')
  @HttpCode(200)
  updateProduct(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateProductSchema)) body: UpdateProductDto) {
    this.logger.debug({ id }, 'updateProduct request');
    return this.updateProductUseCase.execute(id, body);
  }

  @Patch(':id/price')
  @HttpCode(200)
  updateProductPrice(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateProductPriceSchema)) body: UpdateProductPriceDto) {
    this.logger.debug({ id, price: body.price }, 'updateProductPrice request');
    return this.updateProductPriceUseCase.execute(id, body);
  }

  @Patch(':id/amount')
  @HttpCode(200)
  updateProductAmount(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateProductAmountSchema)) body: UpdateProductAmountDto) {
    this.logger.debug({ id, amount: body.amount }, 'updateProductAmount request');
    return this.updateProductAmountUseCase.execute(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteProduct(@Param('id') id: string) {
    this.logger.debug({ id }, 'deleteProduct request');
    return this.deleteProductUseCase.execute(id);
  }
}
