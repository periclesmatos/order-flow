import { Test, TestingModule } from '@nestjs/testing';
import { DeleteCategoryUseCase } from '@src/modules/product/application/use-cases/delete-category.use-case';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '@src/modules/product/domain/repositories/category.repository.interface';
import {
  CategoryNotFoundError,
  CategoryHasProductsError,
} from '@src/modules/product/domain/errors/category.errors';
import { provideCategoryUseCase, loggerProvider } from '@test/helpers/testing-module';
import { createTestCategory } from '../category-test.helpers';

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
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
        provideCategoryUseCase(DeleteCategoryUseCase),
        loggerProvider(),
        { provide: CATEGORY_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(DeleteCategoryUseCase);
  });

  it('deletes when category exists and has no linked products', async () => {
    const category = createTestCategory();
    repository.findById.mockResolvedValue(category);
    repository.hasLinkedProducts.mockResolvedValue(false);
    repository.delete.mockResolvedValue();

    await useCase.execute(category.id);

    expect(repository.delete).toHaveBeenCalledWith(category.id);
  });

  it('throws CategoryNotFoundError when category does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toBeInstanceOf(
      CategoryNotFoundError,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('throws CategoryHasProductsError when category has linked products', async () => {
    const category = createTestCategory();
    repository.findById.mockResolvedValue(category);
    repository.hasLinkedProducts.mockResolvedValue(true);

    await expect(useCase.execute(category.id)).rejects.toBeInstanceOf(
      CategoryHasProductsError,
    );
    expect(repository.delete).not.toHaveBeenCalled();
  });
});
