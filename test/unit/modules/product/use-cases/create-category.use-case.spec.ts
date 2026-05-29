import { Test, TestingModule } from '@nestjs/testing';
import { CreateCategoryUseCase } from '@src/modules/product/application/use-cases/create-category.use-case';
import { CATEGORY_REPOSITORY } from '@src/modules/product/domain/repositories/category.repository.interface';
import type { ICategoryRepository } from '@src/modules/product/domain/repositories/category.repository.interface';
import { CategoryAlreadyExistsError } from '@src/modules/product/domain/errors/category.errors';
import { provideCategoryUseCase, loggerProvider } from '@test/helpers/testing-module';
import { createTestCategory } from '../category-test.helpers';

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
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
        provideCategoryUseCase(CreateCategoryUseCase),
        loggerProvider(),
        { provide: CATEGORY_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(CreateCategoryUseCase);
  });

  it('creates when name is available', async () => {
    repository.findByName.mockResolvedValue(null);
    repository.create.mockImplementation(async (c) => c);

    const result = await useCase.execute({ name: 'Eletrônicos' });

    expect(repository.findByName).toHaveBeenCalledWith('Eletrônicos');
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Eletrônicos');
    expect(result.isActive).toBe(true);
    expect(result.id).toEqual(expect.any(String));
  });

  it('throws CategoryAlreadyExistsError when name already exists', async () => {
    repository.findByName.mockResolvedValue(createTestCategory({ name: 'Eletrônicos' }));

    await expect(useCase.execute({ name: 'Eletrônicos' })).rejects.toBeInstanceOf(
      CategoryAlreadyExistsError,
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});
