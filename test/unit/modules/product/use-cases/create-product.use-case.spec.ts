import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductUseCase } from '@src/modules/product/application/use-cases/create-product.use-case';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '@src/modules/product/domain/repositories/product.repository.interface';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '@src/modules/product/domain/repositories/category.repository.interface';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import { ProductAlreadyExistsError } from '@src/modules/product/domain/errors/product.errors';
import {
  CategoryNotFoundError,
  CategoryInactiveError,
} from '@src/modules/product/domain/errors/category.errors';
import {
  eventEmitterProvider,
  loggerProvider,
  provideProductUseCaseWithCategoryAndEvents,
} from '@test/helpers/testing-module';
import {
  createTestProduct,
  DEFAULT_PRODUCT_DESCRIPTION,
} from '../product-test.helpers';
import { createTestCategory } from '../category-test.helpers';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let repository: jest.Mocked<IProductRepository>;
  let categoryRepository: jest.Mocked<ICategoryRepository>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      lockByIds: jest.fn(),
    };
    categoryRepository = {
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      hasLinkedProducts: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideProductUseCaseWithCategoryAndEvents(CreateProductUseCase),
        loggerProvider(),
        eventEmitterProvider(),
        { provide: PRODUCT_REPOSITORY, useValue: repository },
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
      ],
    }).compile();

    useCase = module.get(CreateProductUseCase);
  });

  it('creates when name is available', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.create.mockImplementation(async (p) => p);

    const result = await useCase.execute({
      name: 'Pen',
      description: DEFAULT_PRODUCT_DESCRIPTION,
      price: 2,
      stockOnHand: 4,
    });

    expect(repository.findByName).toHaveBeenCalledWith('Pen');
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Pen');
    expect(result.description).toBe(DEFAULT_PRODUCT_DESCRIPTION);
    expect(result.price.toFloat()).toBe(2);
    expect(result.stockOnHand).toBe(4);
    expect(result.id).toEqual(expect.any(String));
  });

  it('throws when product name already exists', async () => {
    const existing = createTestProduct({
      name: 'Pen',
      price: Money.fromFloat(1),
      stockOnHand: 0,
    });
    repository.findByName.mockResolvedValue(existing);

    await expect(
      useCase.execute({
        name: 'Pen',
        description: DEFAULT_PRODUCT_DESCRIPTION,
        price: 2,
        stockOnHand: 1,
      }),
    ).rejects.toBeInstanceOf(ProductAlreadyExistsError);

    expect(repository.create).not.toHaveBeenCalled();
  });

  it('associates an active category when categoryId is valid', async () => {
    const category = createTestCategory();
    repository.findByName.mockResolvedValue(null);
    repository.create.mockImplementation(async (p) => p);
    categoryRepository.findById.mockResolvedValue(category);

    const result = await useCase.execute({
      name: 'Pen',
      description: DEFAULT_PRODUCT_DESCRIPTION,
      price: 2,
      stockOnHand: 4,
      categoryId: category.id,
    });

    expect(categoryRepository.findById).toHaveBeenCalledWith(category.id);
    expect(result.categoryId).toBe(category.id);
  });

  it('throws when categoryId does not exist', async () => {
    repository.findByName.mockResolvedValue(null);
    categoryRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        name: 'Pen',
        description: DEFAULT_PRODUCT_DESCRIPTION,
        price: 2,
        stockOnHand: 4,
        categoryId: 'missing-id',
      }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);

    expect(repository.create).not.toHaveBeenCalled();
  });

  it('throws when category is inactive', async () => {
    const category = createTestCategory();
    category.deactivate();
    repository.findByName.mockResolvedValue(null);
    categoryRepository.findById.mockResolvedValue(category);

    await expect(
      useCase.execute({
        name: 'Pen',
        description: DEFAULT_PRODUCT_DESCRIPTION,
        price: 2,
        stockOnHand: 4,
        categoryId: category.id,
      }),
    ).rejects.toBeInstanceOf(CategoryInactiveError);

    expect(repository.create).not.toHaveBeenCalled();
  });
});
