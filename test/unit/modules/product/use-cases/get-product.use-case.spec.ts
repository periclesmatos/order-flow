import { Test, TestingModule } from '@nestjs/testing';
import { GetProductUseCase } from '@src/modules/product/application/use-cases/get-product.use-case';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '@src/modules/product/domain/repositories/product.repository.interface';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import { ProductNotFoundError } from '@src/modules/product/domain/errors/product.errors';
import { cacheManagerProvider, loggerProvider, provideProductUseCaseWithCache } from '@test/helpers/testing-module';
import { createTestProduct } from '../product-test.helpers';

describe('GetProductUseCase', () => {
  let useCase: GetProductUseCase;
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
        provideProductUseCaseWithCache(GetProductUseCase),
        loggerProvider(),
        cacheManagerProvider(),
        { provide: PRODUCT_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(GetProductUseCase);
  });

  it('returns product when found', async () => {
    const p = createTestProduct({ name: 'X', price: Money.fromCents(10), stockOnHand: 2 });
    repository.findById.mockResolvedValue(p);

    const result = await useCase.execute(p.id);

    expect(repository.findById).toHaveBeenCalledWith(p.id);
    expect(result.id).toBe(p.id);
    expect(result.name).toBe('X');
  });

  it('throws when not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing-id')).rejects.toBeInstanceOf(ProductNotFoundError);
  });
});
