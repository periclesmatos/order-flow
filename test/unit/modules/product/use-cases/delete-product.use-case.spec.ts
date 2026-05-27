import { Test, TestingModule } from '@nestjs/testing';
import { DeleteProductUseCase } from '@src/modules/product/application/use-cases/delete-product.use-case';
import { PRODUCT_REPOSITORY } from '@src/modules/product/domain/repositories/product.repository.interface';
import type { IProductRepository } from '@src/modules/product/domain/repositories/product.repository.interface';
import { Money } from '@src/modules/product/domain/entities/money.value-object';
import { ProductNotFoundError } from '@src/modules/product/domain/errors/product.errors';
import {
  eventEmitterProvider,
  loggerProvider,
  provideProductUseCaseWithEventEmitter,
} from '@test/helpers/testing-module';
import { createTestProduct } from '../product-test.helpers';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
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
        provideProductUseCaseWithEventEmitter(DeleteProductUseCase),
        loggerProvider(),
        eventEmitterProvider(),
        { provide: PRODUCT_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(DeleteProductUseCase);
  });

  it('deletes product when found', async () => {
    const p = createTestProduct({
      name: 'Temp',
      price: Money.fromCents(100),
      stockOnHand: 1,
    });
    repository.findById.mockResolvedValue(p);
    repository.delete.mockResolvedValue(undefined);

    await useCase.execute(p.id);

    expect(repository.findById).toHaveBeenCalledWith(p.id);
    expect(repository.delete).toHaveBeenCalledWith(p.id);
  });

  it('throws when product not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-id')).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );

    expect(repository.delete).not.toHaveBeenCalled();
  });
});
