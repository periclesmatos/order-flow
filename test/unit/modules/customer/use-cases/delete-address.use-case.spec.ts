import { Test, TestingModule } from '@nestjs/testing';
import { DeleteAddressUseCase } from '@src/modules/customer/application/use-cases/delete-address.use-case';
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

describe('DeleteAddressUseCase', () => {
  let useCase: DeleteAddressUseCase;
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
        provideAddressUseCase(DeleteAddressUseCase),
        loggerProvider(),
        { provide: customerRepositoryToken, useValue: customerRepository },
        { provide: addressRepositoryToken, useValue: addressRepository },
      ],
    }).compile();

    useCase = module.get(DeleteAddressUseCase);
  });

  it('deletes address when customer and address match', async () => {
    customerRepository.findById.mockResolvedValue(makeCustomer());
    addressRepository.findById.mockResolvedValue(makeAddress());
    addressRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(CUSTOMER_ID, ADDRESS_ID);

    expect(addressRepository.delete).toHaveBeenCalledWith(
      CUSTOMER_ID,
      ADDRESS_ID,
    );
  });

  it('throws when customer not found', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(CUSTOMER_ID, ADDRESS_ID),
    ).rejects.toBeInstanceOf(CustomerNotFoundError);

    expect(addressRepository.delete).not.toHaveBeenCalled();
  });

  it('throws when address not found', async () => {
    customerRepository.findById.mockResolvedValue(makeCustomer());
    addressRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(CUSTOMER_ID, ADDRESS_ID),
    ).rejects.toBeInstanceOf(AddressNotFoundError);

    expect(addressRepository.delete).not.toHaveBeenCalled();
  });

  it('throws when address belongs to another customer', async () => {
    customerRepository.findById.mockResolvedValue(makeCustomer());
    addressRepository.findById.mockResolvedValue(
      makeAddress(OTHER_CUSTOMER_ID, ADDRESS_ID),
    );

    await expect(
      useCase.execute(CUSTOMER_ID, ADDRESS_ID),
    ).rejects.toBeInstanceOf(AddressNotFoundError);

    expect(addressRepository.delete).not.toHaveBeenCalled();
  });
});
