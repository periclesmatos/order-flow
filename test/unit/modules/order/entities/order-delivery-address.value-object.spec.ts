import { OrderDeliveryAddress } from '@src/modules/order/domain/entities/order-delivery-address.value-object';
import { deliveryAddressProps } from '../order-test.helpers';

describe('OrderDeliveryAddress value object', () => {
  it('creates a snapshot from address fields', () => {
    const props = deliveryAddressProps({ city: 'Campinas' });
    const address = OrderDeliveryAddress.createFromAddress(props);
    expect(address.city).toBe('Campinas');
    expect(address.toJSON()).toEqual(props);
  });

  it('restore round-trips through toJSON', () => {
    const props = deliveryAddressProps();
    const restored = OrderDeliveryAddress.restore(props);
    expect(restored.toJSON()).toEqual(props);
  });
});
