import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case.js';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case.js';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case.js';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case.js';
import { UpdateProductPriceUseCase } from '../../application/use-cases/update-product-price.use-case.js';
import { UpdateProductAmountUseCase } from '../../application/use-cases/update-product-amount.use-case.js';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case.js';
import { CreateProductSchema } from '../../application/dtos/create-product.dto.js';
import { ListProductsSchema } from '../../application/dtos/list-products.dto.js';
import { UpdateProductSchema } from '../../application/dtos/update-product.dto.js';
import { UpdateProductPriceSchema } from '../../application/dtos/update-product-price.dto.js';
import { UpdateProductAmountSchema } from '../../application/dtos/update-product-amount.dto.js';
import { ZodValidationPipe } from '../../../../common/pipes/zod-validation.pipe.js';
import type { CreateProductDto } from '../../application/dtos/create-product.dto.js';
import type { ListProductsDto } from '../../application/dtos/list-products.dto.js';
import type { UpdateProductDto } from '../../application/dtos/update-product.dto.js';
import type { UpdateProductPriceDto } from '../../application/dtos/update-product-price.dto.js';
import type { UpdateProductAmountDto } from '../../application/dtos/update-product-amount.dto.js';
import { ProductPresenter } from '../presenters/product.presenter.js';
import {
  ApiCreateProduct,
  ApiDeleteProduct,
  ApiGetProduct,
  ApiListProducts,
  ApiProductController,
  ApiUpdateProduct,
  ApiUpdateProductAmount,
  ApiUpdateProductPrice,
} from '../openapi/product.openapi.js';

@ApiProductController()
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
  @ApiCreateProduct()
  async createProduct(@Body(new ZodValidationPipe(CreateProductSchema)) body: CreateProductDto) {
    this.logger.debug({ body }, 'CREATE PRODUCT REQUEST');
    const product = await this.createProductUseCase.execute(body);
    return ProductPresenter.toResponse(product);
  }

  @Get()
  @HttpCode(200)
  @ApiListProducts()
  async listProducts(@Query(new ZodValidationPipe(ListProductsSchema)) query: ListProductsDto) {
    this.logger.debug({ page: query.page, limit: query.limit }, 'LIST PRODUCTS REQUEST');
    const result = await this.listProductsUseCase.execute(query);
    return {
      ...result,
      data: result.data.map((product) => ProductPresenter.toResponse(product)),
    };
  }

  @Get(':id')
  @HttpCode(200)
  @ApiGetProduct()
  async getProduct(@Param('id') id: string) {
    this.logger.debug({ id }, 'GET PRODUCT REQUEST');
    const product = await this.getProductUseCase.execute(id);
    return ProductPresenter.toResponse(product);
  }

  @Patch(':id')
  @HttpCode(200)
  @ApiUpdateProduct()
  async updateProduct(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductSchema)) body: UpdateProductDto,
  ) {
    this.logger.debug({ id }, 'UPDATE PRODUCT REQUEST');
    const product = await this.updateProductUseCase.execute(id, body);
    return ProductPresenter.toResponse(product);
  }

  @Patch(':id/price')
  @HttpCode(200)
  @ApiUpdateProductPrice()
  async updateProductPrice(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductPriceSchema)) body: UpdateProductPriceDto,
  ) {
    this.logger.debug({ id, price: body.price }, 'UPDATE PRODUCT PRICE REQUEST');
    const product = await this.updateProductPriceUseCase.execute(id, body);
    return ProductPresenter.toResponse(product);
  }

  @Patch(':id/amount')
  @HttpCode(200)
  @ApiUpdateProductAmount()
  async updateProductAmount(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProductAmountSchema)) body: UpdateProductAmountDto,
  ) {
    this.logger.debug({ id, stockOnHand: body.stockOnHand }, 'UPDATE PRODUCT STOCK REQUEST');
    const product = await this.updateProductAmountUseCase.execute(id, body);
    return ProductPresenter.toResponse(product);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiDeleteProduct()
  deleteProduct(@Param('id') id: string) {
    this.logger.debug({ id }, 'DELETE PRODUCT REQUEST');
    return this.deleteProductUseCase.execute(id);
  }
}
