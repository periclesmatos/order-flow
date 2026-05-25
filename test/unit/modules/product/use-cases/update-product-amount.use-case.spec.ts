import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductAmountUseCase } from '@src/modules/product/application/use-cases/update-product-amount.use-case';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '@src/modules/product/domain/repositories/product.repository.interface';
import { Product } from '@src/modules/product/domain/entities/product.entity';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import { ProductNotFoundError } from '@src/modules/product/domain/errors/product.errors';
import { cacheManagerProvider, loggerProvider, provideProductUseCaseWithCache } from '@test/helpers/testing-module';

describe('UpdateProductAmountUseCase', () => {
  let useCase: UpdateProductAmountUseCase;
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
        provideProductUseCaseWithCache(UpdateProductAmountUseCase),
        loggerProvider(),
        cacheManagerProvider(),
        { provide: PRODUCT_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(UpdateProductAmountUseCase);
  });

  it('throws when product not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('no-id', { stockOnHand: 5 })).rejects.toBeInstanceOf(ProductNotFoundError);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('updates amount and returns product', async () => {
    const p = Product.create({ name: 'Box', price: Money.fromCents(200), stockOnHand: 0 });
    repository.findById.mockResolvedValue(p);
    repository.update.mockImplementation(async (_, prod) => prod);

    const result = await useCase.execute(p.id, { stockOnHand: 42 });

    expect(result.stockOnHand).toBe(42);
    expect(repository.update).toHaveBeenCalledTimes(1);
  });
});
