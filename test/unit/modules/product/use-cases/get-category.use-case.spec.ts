import { Test, TestingModule } from '@nestjs/testing';
import { GetCategoryUseCase } from '@src/modules/product/application/use-cases/get-category.use-case';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '@src/modules/product/domain/repositories/category.repository.interface';
import { CategoryNotFoundError } from '@src/modules/product/domain/errors/category.errors';
import { provideCategoryUseCase, loggerProvider } from '@test/helpers/testing-module';
import { createTestCategory } from '../category-test.helpers';

describe('GetCategoryUseCase', () => {
  let useCase: GetCategoryUseCase;
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
        provideCategoryUseCase(GetCategoryUseCase),
        loggerProvider(),
        { provide: CATEGORY_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(GetCategoryUseCase);
  });

  it('returns category when found', async () => {
    const category = createTestCategory();
    repository.findById.mockResolvedValue(category);

    const result = await useCase.execute(category.id);

    expect(repository.findById).toHaveBeenCalledWith(category.id);
    expect(result).toBe(category);
  });

  it('throws CategoryNotFoundError when not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toBeInstanceOf(
      CategoryNotFoundError,
    );
  });
});
