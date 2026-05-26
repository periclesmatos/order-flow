import { Test, TestingModule } from '@nestjs/testing';
import { ListProductsUseCase } from '@src/modules/product/application/use-cases/list-products.use-case';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '@src/modules/product/domain/repositories/product.repository.interface';
import { loggerProvider, provideProductUseCase } from '@test/helpers/testing-module';
import { createTestProduct } from '../product-test.helpers';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
  let repository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideProductUseCase(ListProductsUseCase),
        loggerProvider(),
        { provide: PRODUCT_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(ListProductsUseCase);
  });

  it('maps filters and builds pagination meta', async () => {
    const p = createTestProduct({ name: 'A', stockOnHand: 0 });
    repository.findAll.mockResolvedValue({ products: [p], total: 25 });

    const result = await useCase.execute({
      page: 2,
      limit: 10,
      sortBy: 'name',
      order: 'asc',
    });

    expect(repository.findAll).toHaveBeenCalledWith({
      name: undefined,
      isActive: undefined,
      page: 2,
      limit: 10,
      sortBy: 'name',
      order: 'asc',
    });

    expect(result.data).toHaveLength(1);
    expect(result.meta).toEqual({
      total: 25,
      page: 2,
      limit: 10,
      totalPages: 3,
      hasNextPage: true,
      hasPrevPage: true,
    });
  });
});
