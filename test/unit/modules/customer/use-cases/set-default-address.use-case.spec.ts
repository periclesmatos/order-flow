import { Test, TestingModule } from '@nestjs/testing';
import { SetDefaultAddressUseCase } from '@src/modules/customer/application/use-cases/set-default-address.use-case';
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
} from '../helpers/address-test.helpers';
import {
  loggerProvider,
  provideAddressUseCase,
  transactionalTestImports,
} from '@test/helpers/testing-module';

describe('SetDefaultAddressUseCase', () => {
  let useCase: SetDefaultAddressUseCase;
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
        provideAddressUseCase(SetDefaultAddressUseCase),
        loggerProvider(),
        { provide: customerRepositoryToken, useValue: customerRepository },
        { provide: addressRepositoryToken, useValue: addressRepository },
      ],
    }).compile();

    useCase = module.get(SetDefaultAddressUseCase);
  });

  it('returns address without update when already default', async () => {
    const address = makeAddress(CUSTOMER_ID, ADDRESS_ID, { isDefault: true });
    customerRepository.findById.mockResolvedValue(makeCustomer());
    addressRepository.findById.mockResolvedValue(address);

    const result = await useCase.execute(CUSTOMER_ID, ADDRESS_ID);

    expect(result.isDefault).toBe(true);
    expect(addressRepository.update).not.toHaveBeenCalled();
  });

  it('sets default and persists when not default', async () => {
    const address = makeAddress();
    customerRepository.findById.mockResolvedValue(makeCustomer());
    addressRepository.findById.mockResolvedValue(address);
    addressRepository.update.mockImplementation(async (_, __, a) => a);

    const result = await useCase.execute(CUSTOMER_ID, ADDRESS_ID);

    expect(result.isDefault).toBe(true);
    expect(addressRepository.update).toHaveBeenCalledWith(
      CUSTOMER_ID,
      ADDRESS_ID,
      address,
    );
  });

  it('throws when customer not found', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(CUSTOMER_ID, ADDRESS_ID),
    ).rejects.toBeInstanceOf(CustomerNotFoundError);

    expect(addressRepository.update).not.toHaveBeenCalled();
  });

  it('throws when address not found', async () => {
    customerRepository.findById.mockResolvedValue(makeCustomer());
    addressRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(CUSTOMER_ID, ADDRESS_ID),
    ).rejects.toBeInstanceOf(AddressNotFoundError);

    expect(addressRepository.update).not.toHaveBeenCalled();
  });
});
