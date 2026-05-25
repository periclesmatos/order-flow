import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductUseCase } from '@src/modules/product/application/use-cases/create-product.use-case';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '@src/modules/product/domain/repositories/product.repository.interface';
import { Product } from '@src/modules/product/domain/entities/product.entity';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import { ProductAlreadyExistsError } from '@src/modules/product/domain/errors/product.errors';
import { loggerProvider, provideProductUseCase } from '@test/helpers/testing-module';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
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
        provideProductUseCase(CreateProductUseCase),
        loggerProvider(),
        { provide: PRODUCT_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(CreateProductUseCase);
  });

  it('creates when name is available', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.create.mockImplementation(async (p) => p);

    const result = await useCase.execute({ name: 'Pen', price: 2, stockOnHand: 4 });

    expect(repository.findByName).toHaveBeenCalledWith('Pen');
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Pen');
    expect(result.price.toFloat()).toBe(2);
    expect(result.stockOnHand).toBe(4);
    expect(result.id).toEqual(expect.any(String));
  });

  it('throws when product name already exists', async () => {
    const existing = Product.create({ name: 'Pen', price: Money.fromFloat(1), stockOnHand: 0 });
    repository.findByName.mockResolvedValue(existing);

    await expect(useCase.execute({ name: 'Pen', price: 2, stockOnHand: 1 })).rejects.toBeInstanceOf(ProductAlreadyExistsError);

    expect(repository.create).not.toHaveBeenCalled();
  });
});
