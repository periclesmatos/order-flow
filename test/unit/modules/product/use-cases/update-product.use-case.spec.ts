import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductUseCase } from '@src/modules/product/application/use-cases/update-product.use-case';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '@src/modules/product/domain/repositories/product.repository.interface';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '@src/modules/product/domain/repositories/category.repository.interface';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import {
  ProductAlreadyExistsError,
  ProductNotFoundError,
} from '@src/modules/product/domain/errors/product.errors';
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

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let repository: jest.Mocked<IProductRepository>;
  let categoryRepository: jest.Mocked<ICategoryRepository>;

  const makeProduct = (name = 'Original') =>
    createTestProduct({ name, price: Money.fromCents(500), stockOnHand: 3 });

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findByName: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
        provideProductUseCaseWithCategoryAndEvents(UpdateProductUseCase),
        loggerProvider(),
        eventEmitterProvider(),
        { provide: PRODUCT_REPOSITORY, useValue: repository },
        { provide: CATEGORY_REPOSITORY, useValue: categoryRepository },
      ],
    }).compile();

    useCase = module.get(UpdateProductUseCase);
  });

  it('throws when product not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('no-id', { name: 'X' }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('throws when renaming to a name that already exists on another product', async () => {
    const p = makeProduct('Original');
    const other = makeProduct('Taken');
    repository.findById.mockResolvedValue(p);
    repository.findByName.mockResolvedValue(other);

    await expect(
      useCase.execute(p.id, { name: 'Taken' }),
    ).rejects.toBeInstanceOf(ProductAlreadyExistsError);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('does not check name conflict when new name equals current name', async () => {
    const p = makeProduct('Same');
    repository.findById.mockResolvedValue(p);
    repository.update.mockImplementation(async (_, prod) => prod);

    await useCase.execute(p.id, { name: 'Same' });

    expect(repository.findByName).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('activates product when isActive is true', async () => {
    const p = makeProduct('P');
    p.deactivate();
    repository.findById.mockResolvedValue(p);
    repository.update.mockImplementation(async (_, prod) => prod);

    const result = await useCase.execute(p.id, { isActive: true });

    expect(result.isActive).toBe(true);
    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('deactivates product when isActive is false', async () => {
    const p = makeProduct('P');
    repository.findById.mockResolvedValue(p);
    repository.update.mockImplementation(async (_, prod) => prod);

    const result = await useCase.execute(p.id, { isActive: false });

    expect(result.isActive).toBe(false);
  });

  it('updates name and returns product', async () => {
    const p = makeProduct('Old');
    repository.findById.mockResolvedValue(p);
    repository.findByName.mockResolvedValue(null);
    repository.update.mockImplementation(async (_, prod) => prod);

    const result = await useCase.execute(p.id, { name: 'New' });

    expect(result.name).toBe('New');
    expect(result.price.toFloat()).toBe(5);
    expect(result.stockOnHand).toBe(3);
  });

  it('updates description only', async () => {
    const p = makeProduct('Old');
    repository.findById.mockResolvedValue(p);
    repository.update.mockImplementation(async (_, prod) => prod);

    const result = await useCase.execute(p.id, {
      description: 'Updated description',
    });

    expect(result.description).toBe('Updated description');
    expect(repository.findByName).not.toHaveBeenCalled();
  });

  it('does not update description when value is unchanged', async () => {
    const p = makeProduct('Old');
    repository.findById.mockResolvedValue(p);
    repository.update.mockImplementation(async (_, prod) => prod);

    await useCase.execute(p.id, { description: DEFAULT_PRODUCT_DESCRIPTION });

    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('assigns a new active category', async () => {
    const p = makeProduct('Old');
    const category = createTestCategory();
    repository.findById.mockResolvedValue(p);
    repository.update.mockImplementation(async (_, prod) => prod);
    categoryRepository.findById.mockResolvedValue(category);

    const result = await useCase.execute(p.id, { categoryId: category.id });

    expect(categoryRepository.findById).toHaveBeenCalledWith(category.id);
    expect(result.categoryId).toBe(category.id);
  });

  it('throws when assigning a non-existent category', async () => {
    const p = makeProduct('Old');
    repository.findById.mockResolvedValue(p);
    categoryRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(p.id, { categoryId: 'missing-id' }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('throws when assigning an inactive category', async () => {
    const p = makeProduct('Old');
    const category = createTestCategory();
    category.deactivate();
    repository.findById.mockResolvedValue(p);
    categoryRepository.findById.mockResolvedValue(category);

    await expect(
      useCase.execute(p.id, { categoryId: category.id }),
    ).rejects.toBeInstanceOf(CategoryInactiveError);

    expect(repository.update).not.toHaveBeenCalled();
  });
});
