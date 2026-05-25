import { Customer } from '@src/modules/customer/domain/entities/customer.entity';

describe('Customer', () => {
  const createdAt = new Date('2021-01-01T00:00:00.000Z');
  const updatedAt = new Date('2021-02-01T00:00:00.000Z');

  const addressPayload = {
    street: 'Rua X',
    number: '10',
    complement: '',
    neighborhood: 'Bairro',
    city: 'SP',
    state: 'SP',
    postalCode: '01310-100',
    country: 'BR',
  };

  it('create builds email, phone and optional addresses', () => {
    const c = Customer.create({
      name: 'Ana',
      email: 'ana@example.com',
      phone: '+5511987654321',
      addresses: [addressPayload],
    });

    expect(c.id).toEqual(expect.any(String));
    expect(c.name).toBe('Ana');
    expect(c.email.value).toBe('ana@example.com');
    expect(c.phone.e164).toBe('+5511987654321');
    expect(c.addresses).toHaveLength(1);
    expect(c.defaultAddress?.city).toBe('SP');
  });

  it('create works without addresses', () => {
    const c = Customer.create({
      name: 'Bob',
      email: 'bob@example.com',
      phone: '11987654321',
    });

    expect(c.addresses).toHaveLength(0);
    expect(c.defaultAddress).toBeUndefined();
  });

  it('restore maps primitives and nested addresses', () => {
    const c = Customer.restore({
      id: 'cust-1',
      name: 'Zed',
      email: 'zed@example.com',
      phone: '+5511987654321',
      isActive: true,
      createdAt,
      updatedAt,
      addresses: [
        {
          id: 'addr-9',
          customerId: 'cust-1',
          street: 'A',
          number: '1',
          complement: '',
          neighborhood: 'N',
          city: 'C',
          state: 'ST',
          postalCode: '00000-000',
          country: 'BR',
          isDefault: true,
          createdAt,
          updatedAt,
        },
      ],
    });

    expect(c.id).toBe('cust-1');
    expect(c.defaultAddress?.id).toBe('addr-9');
    expect(c.email.value).toBe('zed@example.com');
  });

  it('set email and phone re-parses value objects', () => {
    const c = Customer.create({
      name: 'C',
      email: 'c@example.com',
      phone: '+5511987654321',
    });

    c.email = 'new@example.com';
    expect(c.email.value).toBe('new@example.com');

    c.phone = '1133334444';
    expect(c.phone.e164).toContain('55');
  });

  it('toJSON flattens email and phone', () => {
    const c = Customer.create({
      name: 'D',
      email: 'd@example.com',
      phone: '+5511987654321',
    });

    const json = c.toJSON();

    expect(json.email).toBe('d@example.com');
    expect(json.phone).toBe('+5511987654321');
    expect(json.name).toBe('D');
    expect(json.addresses).toEqual([]);
  });
});
