import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductPriceUseCase } from '@src/modules/product/application/use-cases/update-product-price.use-case';
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

describe('UpdateProductPriceUseCase', () => {
  let useCase: UpdateProductPriceUseCase;
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
        provideProductUseCaseWithEventEmitter(UpdateProductPriceUseCase),
        loggerProvider(),
        eventEmitterProvider(),
        { provide: PRODUCT_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get(UpdateProductPriceUseCase);
  });

  it('throws when product not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('no-id', { price: 100 }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('updates price and returns product with float value', async () => {
    const p = createTestProduct({
      name: 'Widget',
      price: Money.fromCents(100),
      stockOnHand: 2,
    });
    repository.findById.mockResolvedValue(p);
    repository.update.mockImplementation(async (_, prod) => prod);

    const result = await useCase.execute(p.id, { price: 25 });

    expect(result.price.toFloat()).toBe(25);
    expect(repository.update).toHaveBeenCalledTimes(1);
  });
});
