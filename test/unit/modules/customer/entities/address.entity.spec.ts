import { CustomerAddressesDefaultCountError } from '@src/modules/customer/domain/errors/address.errors';
import { Address } from '@src/modules/customer/domain/entities/address.entity';
import { Customer } from '@src/modules/customer/domain/entities/customer.entity';

describe('Address', () => {
  const baseFields = {
    street: 'Rua A',
    number: '100',
    complement: 'ap 1',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01000-000',
    country: 'BR',
  };

  it('create assigns id, customerId and timestamps', () => {
    const a = Address.create('cust-1', baseFields);

    expect(a.id).toEqual(expect.any(String));
    expect(a.customerId).toBe('cust-1');
    expect(a.isDefault).toBe(false);
    expect(a.street).toBe('Rua A');
    expect(a.createdAt).toBeInstanceOf(Date);
    expect(a.updatedAt).toBeInstanceOf(Date);
  });

  it('restore maps props and normalizes dates', () => {
    const createdAt = '2020-03-01T12:00:00.000Z';
    const updatedAt = '2020-04-01T12:00:00.000Z';

    const a = Address.restore({
      id: 'addr-1',
      customerId: 'c-1',
      ...baseFields,
      isDefault: true,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    });

    expect(a.id).toBe('addr-1');
    expect(a.customerId).toBe('c-1');
    expect(a.isDefault).toBe(true);
    expect(a.createdAt.toISOString()).toBe(createdAt);
  });

  it('setter updates street and bumps updatedAt', () => {
    jest.useFakeTimers({ now: new Date('2025-01-01T00:00:00.000Z') });
    const a = Address.create('cust-1', baseFields);
    const before = a.updatedAt.getTime();

    jest.advanceTimersByTime(5000);
    a.street = 'Rua B';

    expect(a.street).toBe('Rua B');
    expect(a.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    jest.useRealTimers();
  });

  it('isDefault setter updates flag and bumps updatedAt', () => {
    const a = Address.create('cust-1', { ...baseFields, isDefault: false });
    const before = a.updatedAt.getTime();

    a.isDefault = true;

    expect(a.isDefault).toBe(true);
    expect(a.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('toJSON returns full props', () => {
    const a = Address.create('cust-1', baseFields);
    const json = a.toJSON();

    expect(json).toMatchObject({
      ...baseFields,
      id: a.id,
      customerId: 'cust-1',
      isDefault: false,
    });
    expect(json.createdAt).toBeInstanceOf(Date);
  });

  it('exposes all fields via getters and setters', () => {
    const a = Address.create('cust-1', baseFields);

    expect(a.number).toBe('100');
    expect(a.complement).toBe('ap 1');
    expect(a.neighborhood).toBe('Centro');
    expect(a.city).toBe('São Paulo');
    expect(a.state).toBe('SP');
    expect(a.postalCode).toBe('01000-000');
    expect(a.country).toBe('BR');

    a.number = '200';
    a.complement = 'ap 2';
    a.neighborhood = 'Jardins';
    a.city = 'Campinas';
    a.state = 'RJ';
    a.postalCode = '13000-000';
    a.country = 'BR';

    expect(a.number).toBe('200');
    expect(a.complement).toBe('ap 2');
    expect(a.neighborhood).toBe('Jardins');
    expect(a.city).toBe('Campinas');
    expect(a.state).toBe('RJ');
    expect(a.postalCode).toBe('13000-000');
    expect(a.country).toBe('BR');
  });
});

describe('Customer addresses default rule', () => {
  it('throws when multiple addresses and not exactly one default', () => {
    const base = {
      street: 'Rua A',
      number: '1',
      complement: '',
      neighborhood: 'N',
      city: 'C',
      state: 'SP',
      postalCode: '01000-000',
      country: 'BR',
    };

    expect(() =>
      Customer.create({
        name: 'A',
        email: 'a@example.com',
        phone: '+5511987654321',
        addresses: [
          { ...base, street: 'Rua 1', isDefault: true },
          { ...base, street: 'Rua 2', isDefault: true },
        ],
      }),
    ).toThrow(CustomerAddressesDefaultCountError);

    expect(() =>
      Customer.create({
        name: 'B',
        email: 'b@example.com',
        phone: '+5511987654321',
        addresses: [
          { ...base, street: 'Rua 1', isDefault: false },
          { ...base, street: 'Rua 2', isDefault: false },
        ],
      }),
    ).toThrow(CustomerAddressesDefaultCountError);
  });

  it('sets single address as default when omitted', () => {
    const c = Customer.create({
      name: 'C',
      email: 'c@example.com',
      phone: '+5511987654321',
      addresses: [
        {
          street: 'Rua A',
          number: '1',
          complement: '',
          neighborhood: 'N',
          city: 'C',
          state: 'SP',
          postalCode: '01000-000',
          country: 'BR',
        },
      ],
    });

    expect(c.addresses).toHaveLength(1);
    expect(c.defaultAddress?.street).toBe('Rua A');
    expect(c.defaultAddress?.isDefault).toBe(true);
  });
});
