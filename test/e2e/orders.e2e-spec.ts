import request from 'supertest';
import {
  createOrderE2eApp,
  type OrderE2eContext,
} from '../helpers/create-order-e2e-app';

const ORDERS = '/api/v1/orders';
const MISSING_UUID = '00000000-0000-4000-8000-000000000000';

describe('Orders API (e2e)', () => {
  let ctx: OrderE2eContext;

  beforeEach(async () => {
    ctx = await createOrderE2eApp();
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  const server = () => ctx.app.getHttpServer();

  const placeOrder = async (quantity = 2) => {
    const seed = await ctx.seedDefault();
    const res = await request(server())
      .post(ORDERS)
      .send({
        customerId: seed.customerId,
        addressId: seed.addressId,
        items: [{ productId: seed.productId, quantity }],
      })
      .expect(201);
    return { seed, id: res.body.id as string, body: res.body };
  };

  it('POST /api/v1/orders creates an order and returns X-Request-Id', async () => {
    const { body, headers } = await (async () => {
      const seed = await ctx.seedDefault();
      const res = await request(server())
        .post(ORDERS)
        .send({
          customerId: seed.customerId,
          addressId: seed.addressId,
          items: [{ productId: seed.productId, quantity: 2 }],
        })
        .expect(201);
      return { body: res.body, headers: res.headers };
    })();

    expect(headers['x-request-id']).toEqual(expect.any(String));
    expect(body).toMatchObject({ status: 'PENDING', total: 20 });
    expect(body.orderNumber).toMatch(/^ORD-\d{6}$/);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({ quantity: 2, subtotal: 20 });
    expect(body.deliveryAddress.city).toBe('São Paulo');
  });

  it('POST /api/v1/orders returns 400 when items is empty', async () => {
    const seed = await ctx.seedDefault();
    return request(server())
      .post(ORDERS)
      .send({
        customerId: seed.customerId,
        addressId: seed.addressId,
        items: [],
      })
      .expect(400);
  });

  it('POST /api/v1/orders returns 422 when stock is insufficient', async () => {
    const customer = await ctx.seedCustomer();
    const address = await ctx.seedAddress(customer.id);
    const product = await ctx.seedProduct({ stockOnHand: 1 });
    return request(server())
      .post(ORDERS)
      .send({
        customerId: customer.id,
        addressId: address.id,
        items: [{ productId: product.id, quantity: 5 }],
      })
      .expect(422);
  });

  it('GET /api/v1/orders/:id returns the order', async () => {
    const { id } = await placeOrder();
    return request(server())
      .get(`${ORDERS}/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(id);
        expect(res.body.status).toBe('PENDING');
      });
  });

  it('GET /api/v1/orders/:id returns 404 when missing', () => {
    return request(server()).get(`${ORDERS}/${MISSING_UUID}`).expect(404);
  });

  it('GET /api/v1/orders lists created orders', async () => {
    await placeOrder();
    return request(server())
      .get(ORDERS)
      .query({ page: 1, limit: 10 })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(1);
        expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 10 });
      });
  });

  it('PATCH /api/v1/orders/:id/status advances the status', async () => {
    const { id } = await placeOrder();
    return request(server())
      .patch(`${ORDERS}/${id}/status`)
      .send({ status: 'PROCESSING' })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('PROCESSING');
      });
  });

  it('PATCH /api/v1/orders/:id/status rejects an invalid transition', async () => {
    const { id } = await placeOrder();
    return request(server())
      .patch(`${ORDERS}/${id}/status`)
      .send({ status: 'SHIPPED' })
      .expect(422)
      .expect((res) => {
        expect(res.body.statusCode).toBe(422);
      });
  });

  it('POST /api/v1/orders/:id/cancel cancels the order', async () => {
    const { id } = await placeOrder();
    return request(server())
      .post(`${ORDERS}/${id}/cancel`)
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('CANCELLED');
      });
  });
});
