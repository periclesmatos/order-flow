import { Test, TestingModule } from '@nestjs/testing';
import { DeactivateCategoryUseCase } from '@src/modules/product/application/use-cases/deactivate-category.use-case';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '@src/modules/product/domain/repositories/category.repository.interface';
import {
  CategoryNotFoundError,
  CategoryHasProductsError,
} from '@src/modules/product/domain/errors/category.errors';
import { provideCategoryUseCase, loggerProvider } from '@test/helpers/testing-module';
import { createTestCategory } from '../category-test.helpers';

describe('DeactivateCategoryUseCase', () => {
  let useCase: DeactivateCategoryUseCase;
  let repository: jest.Mocked<ICategoryRepository>;

  beforeEach(async () => {
    repository = {
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
        provideCategoryUseCase(DeactivateCategoryUseCase),
        loggerProvider(),
        { provide: CATEGORY_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(DeactivateCategoryUseCase);
  });

  it('deactivates when category exists and has no linked products', async () => {
    const category = createTestCategory();
    repository.findById.mockResolvedValue(category);
    repository.hasLinkedProducts.mockResolvedValue(false);
    repository.update.mockImplementation(async (_, c) => c);

    const result = await useCase.execute(category.id);

    expect(result.isActive).toBe(false);
    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('throws CategoryNotFoundError when category does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toBeInstanceOf(
      CategoryNotFoundError,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('throws CategoryHasProductsError when category has linked products', async () => {
    const category = createTestCategory();
    repository.findById.mockResolvedValue(category);
    repository.hasLinkedProducts.mockResolvedValue(true);

    await expect(useCase.execute(category.id)).rejects.toBeInstanceOf(
      CategoryHasProductsError,
    );
    expect(repository.update).not.toHaveBeenCalled();
  });
});
