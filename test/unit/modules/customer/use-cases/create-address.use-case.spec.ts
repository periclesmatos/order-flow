import { Test, TestingModule } from '@nestjs/testing';
import { Address } from '@src/modules/customer/domain/entities/address.entity';
import { CreateAddressUseCase } from '@src/modules/customer/application/use-cases/create-address.use-case';
import { CustomerNotFoundError } from '@src/modules/customer/domain/errors/customer.errors';
import {
  addressRepositoryToken,
  createAddressPayload,
  CUSTOMER_ID,
  customerRepositoryToken,
  makeCustomer,
  mockAddressRepositories,
} from '../helpers/address-test.helpers';
import {
  loggerProvider,
  provideAddressUseCase,
  transactionalTestImports,
} from '@test/helpers/testing-module';

describe('CreateAddressUseCase', () => {
  let useCase: CreateAddressUseCase;
  let customerRepository: ReturnType<typeof mockAddressRepositories>['customerRepository'];
  let addressRepository: ReturnType<typeof mockAddressRepositories>['addressRepository'];

  beforeEach(async () => {
    const repos = mockAddressRepositories();
    customerRepository = repos.customerRepository;
    addressRepository = repos.addressRepository;

    const module: TestingModule = await Test.createTestingModule({
      imports: [transactionalTestImports()],
      providers: [
        provideAddressUseCase(CreateAddressUseCase),
        loggerProvider(),
        { provide: customerRepositoryToken, useValue: customerRepository },
        { provide: addressRepositoryToken, useValue: addressRepository },
      ],
    }).compile();

    useCase = module.get(CreateAddressUseCase);
  });

  it('creates address when customer exists', async () => {
    customerRepository.findById.mockResolvedValue(makeCustomer());
    addressRepository.create.mockImplementation(async (customerId, address) => address);

    const result = await useCase.execute(CUSTOMER_ID, createAddressPayload);

    expect(customerRepository.findById).toHaveBeenCalledWith(CUSTOMER_ID);
    expect(addressRepository.create).toHaveBeenCalledWith(
      CUSTOMER_ID,
      expect.any(Address),
    );
    expect(result.street).toBe('Rua A');
    expect(result.customerId).toBe(CUSTOMER_ID);
  });

  it('throws when customer not found', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(CUSTOMER_ID, createAddressPayload)).rejects.toBeInstanceOf(
      CustomerNotFoundError,
    );

    expect(addressRepository.create).not.toHaveBeenCalled();
  });
});
