import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerUseCase } from '@src/modules/customer/application/use-cases/create-customer.use-case';
import { CUSTOMER_REPOSITORY } from '@src/modules/customer/domain/repositories/customer.repository.interface';
import { ADDRESS_REPOSITORY } from '@src/modules/customer/domain/repositories/address.repository.interface';
import type { ICustomerRepository } from '@src/modules/customer/domain/repositories/customer.repository.interface';
import type { IAddressRepository } from '@src/modules/customer/domain/repositories/address.repository.interface';
import { Customer } from '@src/modules/customer/domain/entities/customer.entity';
import { CustomerEmailAlreadyExistsError } from '@src/modules/customer/domain/errors/customer.errors';
import {
  loggerProvider,
  provideCustomerUseCase,
  transactionalTestImports,
} from '@test/helpers/testing-module';

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
  let customerRepository: jest.Mocked<ICustomerRepository>;
  let addressRepository: jest.Mocked<IAddressRepository>;

  beforeEach(async () => {
    customerRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    addressRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAllByCustomerId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [transactionalTestImports()],
      providers: [
        provideCustomerUseCase(CreateCustomerUseCase),
        loggerProvider(),
        { provide: CUSTOMER_REPOSITORY, useValue: customerRepository },
        { provide: ADDRESS_REPOSITORY, useValue: addressRepository },
      ],
    }).compile();

    useCase = module.get(CreateCustomerUseCase);
  });

  it('creates customer without addresses', async () => {
    customerRepository.findByEmail.mockResolvedValue(null);
    customerRepository.create.mockImplementation(async (c) => c);
    customerRepository.findById.mockImplementation(async () =>
      Customer.create({ name: 'Ana', email: 'ana@example.com', phone: '+5511987654321' }),
    );

    const result = await useCase.execute({
      name: 'Ana',
      email: 'ana@example.com',
      phone: '+5511987654321',
    });

    expect(customerRepository.findByEmail).toHaveBeenCalledWith('ana@example.com');
    expect(customerRepository.create).toHaveBeenCalledTimes(1);
    expect(addressRepository.create).not.toHaveBeenCalled();
    expect(customerRepository.findById).toHaveBeenCalledTimes(1);
    expect(result.name).toBe('Ana');
    expect(result.email.value).toBe('ana@example.com');
    expect(result.phone.e164).toBe('+5511987654321');
    expect(result.addresses).toEqual([]);
  });

  it('creates customer with one address and persists it via addressRepository', async () => {
    customerRepository.findByEmail.mockResolvedValue(null);
    customerRepository.create.mockImplementation(async (c) => c);
    customerRepository.findById.mockImplementation(async () => {
      return Customer.create({
        name: 'Bob',
        email: 'bob@example.com',
        phone: '11987654321',
        addresses: [
          {
            street: 'Rua X',
            number: '10',
            complement: '',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            postalCode: '01000-000',
            country: 'BR',
            isDefault: true,
          },
        ],
      });
    });

    const result = await useCase.execute({
      name: 'Bob',
      email: 'bob@example.com',
      phone: '11987654321',
      addresses: [
        {
          street: 'Rua X',
          number: '10',
          complement: '',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          postalCode: '01000-000',
          country: 'BR',
          isDefault: false,
        },
      ],
    });

    expect(addressRepository.create).toHaveBeenCalledTimes(1);
    expect(result.addresses).toHaveLength(1);
    expect(result.addresses[0].street).toBe('Rua X');
    expect(result.addresses[0].isDefault).toBe(true);
  });

  it('throws when email already exists', async () => {
    const existing = Customer.create({
      name: 'X',
      email: 'taken@example.com',
      phone: '+5511987654321',
    });
    customerRepository.findByEmail.mockResolvedValue(existing);

    await expect(
      useCase.execute({
        name: 'Y',
        email: 'taken@example.com',
        phone: '+5511987654321',
      }),
    ).rejects.toBeInstanceOf(CustomerEmailAlreadyExistsError);

    expect(customerRepository.create).not.toHaveBeenCalled();
    expect(addressRepository.create).not.toHaveBeenCalled();
  });
});
