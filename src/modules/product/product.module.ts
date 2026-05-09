import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller.js';
import { CreateProductUseCase } from './use-cases/create-product.use-case.js';
import { ListProductsUseCase } from './use-cases/list-products.use-case.js';
import { GetProductUseCase } from './use-cases/get-product.use-case.js';
import { UpdateProductUseCase } from './use-cases/update-product.use-case.js';
import { UpdateProductPriceUseCase } from './use-cases/update-product-price.use-case.js';
import { UpdateProductAmountUseCase } from './use-cases/update-product-amount.use-case.js';
import { DeleteProductUseCase } from './use-cases/delete-product.use-case.js';
import { ProductRepository } from './repositories/product.respository.js';
import { PRODUCT_REPOSITORY } from './repositories/product.repository.interface.js';

@Module({
  controllers: [ProductController],
  providers: [
    CreateProductUseCase,
    ListProductsUseCase,
    GetProductUseCase,
    UpdateProductUseCase,
    UpdateProductPriceUseCase,
    UpdateProductAmountUseCase,
    DeleteProductUseCase,
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepository },
  ],
})
export class ProductModule {}
