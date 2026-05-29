import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCategoryUseCase } from '@src/modules/product/application/use-cases/update-category.use-case';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '@src/modules/product/domain/repositories/category.repository.interface';
import {
  CategoryNotFoundError,
  CategoryAlreadyExistsError,
} from '@src/modules/product/domain/errors/category.errors';
import { provideCategoryUseCase, loggerProvider } from '@test/helpers/testing-module';
import { createTestCategory } from '../category-test.helpers';

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase;
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
        provideCategoryUseCase(UpdateCategoryUseCase),
        loggerProvider(),
        { provide: CATEGORY_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(UpdateCategoryUseCase);
  });

  it('updates name when valid and no conflict', async () => {
    const category = createTestCategory();
    repository.findById.mockResolvedValue(category);
    repository.findByName.mockResolvedValue(null);
    repository.update.mockImplementation(async (_, c) => c);

    const result = await useCase.execute(category.id, { name: 'Vestuário' });

    expect(result.name).toBe('Vestuário');
    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('throws CategoryNotFoundError when category does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('non-existent-id', { name: 'Novo' }),
    ).rejects.toBeInstanceOf(CategoryNotFoundError);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('throws CategoryAlreadyExistsError when name belongs to another category', async () => {
    const category = createTestCategory();
    const other = createTestCategory({ name: 'Vestuário' });
    repository.findById.mockResolvedValue(category);
    repository.findByName.mockResolvedValue(other);

    await expect(
      useCase.execute(category.id, { name: 'Vestuário' }),
    ).rejects.toBeInstanceOf(CategoryAlreadyExistsError);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('allows renaming to the same name (same ID)', async () => {
    const category = createTestCategory();
    repository.findById.mockResolvedValue(category);
    repository.findByName.mockResolvedValue(category);
    repository.update.mockImplementation(async (_, c) => c);

    await expect(
      useCase.execute(category.id, { name: category.name }),
    ).resolves.toBeDefined();
  });
});
