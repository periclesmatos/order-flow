import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAddressUseCase } from '@src/modules/customer/application/use-cases/update-address.use-case';
import { AddressNotFoundError } from '@src/modules/customer/domain/errors/address.errors';
import { CustomerNotFoundError } from '@src/modules/customer/domain/errors/customer.errors';
import {
  addressRepositoryToken,
  ADDRESS_ID,
  CUSTOMER_ID,
  customerRepositoryToken,
  makeAddress,
  makeCustomer,
  mockAddressRepositories,
  OTHER_CUSTOMER_ID,
} from '../helpers/address-test.helpers';
import {
  loggerProvider,
  provideAddressUseCase,
  transactionalTestImports,
} from '@test/helpers/testing-module';

describe('UpdateAddressUseCase', () => {
  let useCase: UpdateAddressUseCase;
  let customerRepository: ReturnType<
    typeof mockAddressRepositories
  >['customerRepository'];
  let addressRepository: ReturnType<
    typeof mockAddressRepositories
  >['addressRepository'];

  beforeEach(async () => {
    const repos = mockAddressRepositories();
    customerRepository = repos.customerRepository;
    addressRepository = repos.addressRepository;

    const module: TestingModule = await Test.createTestingModule({
      imports: [transactionalTestImports()],
      providers: [
        provideAddressUseCase(UpdateAddressUseCase),
        loggerProvider(),
        { provide: customerRepositoryToken, useValue: customerRepository },
        { provide: addressRepositoryToken, useValue: addressRepository },
      ],
    }).compile();

    useCase = module.get(UpdateAddressUseCase);
  });

  it('throws when customer not found', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(CUSTOMER_ID, ADDRESS_ID, { street: 'Rua Nova' }),
    ).rejects.toBeInstanceOf(CustomerNotFoundError);

    expect(addressRepository.update).not.toHaveBeenCalled();
  });

  it('throws when address not found', async () => {
    customerRepository.findById.mockResolvedValue(makeCustomer());
    addressRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(CUSTOMER_ID, ADDRESS_ID, { street: 'Rua Nova' }),
    ).rejects.toBeInstanceOf(AddressNotFoundError);

    expect(addressRepository.update).not.toHaveBeenCalled();
  });

  it('throws when address belongs to another customer', async () => {
    customerRepository.findById.mockResolvedValue(makeCustomer());
    addressRepository.findById.mockResolvedValue(
      makeAddress(OTHER_CUSTOMER_ID, ADDRESS_ID),
    );

    await expect(
      useCase.execute(CUSTOMER_ID, ADDRESS_ID, { street: 'Rua Nova' }),
    ).rejects.toBeInstanceOf(AddressNotFoundError);

    expect(addressRepository.update).not.toHaveBeenCalled();
  });

  it('updates only provided fields', async () => {
    const address = makeAddress();
    customerRepository.findById.mockResolvedValue(makeCustomer());
    addressRepository.findById.mockResolvedValue(address);
    addressRepository.update.mockImplementation(async (_, __, a) => a);

    const result = await useCase.execute(CUSTOMER_ID, ADDRESS_ID, {
      street: 'Rua Nova',
      isDefault: true,
    });

    expect(result.street).toBe('Rua Nova');
    expect(result.isDefault).toBe(true);
    expect(result.number).toBe('100');
    expect(addressRepository.update).toHaveBeenCalledWith(
      CUSTOMER_ID,
      ADDRESS_ID,
      address,
    );
  });
});
