import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from '../helpers/create-e2e-app';

const PRODUCTS = '/api/v1/products';
const DEFAULT_DESCRIPTION = 'Descrição do produto para testes';

const productBody = (overrides: Record<string, unknown> = {}) => ({
  name: 'Notebook',
  description: DEFAULT_DESCRIPTION,
  price: 10.5,
  stockOnHand: 3,
  ...overrides,
});

describe('Products API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createE2eApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/v1/products creates a product and returns X-Request-Id', () => {
    return request(app.getHttpServer())
      .post(PRODUCTS)
      .send(productBody())
      .expect(201)
      .expect((res) => {
        expect(res.headers['x-request-id']).toEqual(expect.any(String));
        expect(res.body).toMatchObject({
          name: 'Notebook',
          description: DEFAULT_DESCRIPTION,
          price: 10.5,
          stockOnHand: 3,
          reservedQuantity: 0,
          availableQuantity: 3,
          isActive: true,
        });
        expect(res.body.id).toEqual(expect.any(String));
      });
  });

  it('POST /api/v1/products returns 400 when body is invalid', () => {
    return request(app.getHttpServer())
      .post(PRODUCTS)
      .send({
        name: '',
        description: DEFAULT_DESCRIPTION,
        price: 10,
        stockOnHand: 1,
      })
      .expect(400)
      .expect((res) => {
        expect(res.body).toMatchObject({ statusCode: 400 });
        expect(res.body.message).toBeDefined();
        expect(res.headers['x-request-id']).toEqual(expect.any(String));
      });
  });

  it('POST /api/v1/products returns 400 when description is missing', () => {
    return request(app.getHttpServer())
      .post(PRODUCTS)
      .send({ name: 'Sem descrição', price: 10, stockOnHand: 1 })
      .expect(400);
  });

  it('POST /api/v1/products returns 409 when name already exists', async () => {
    await request(app.getHttpServer())
      .post(PRODUCTS)
      .send(productBody({ name: 'Duplicado', price: 1, stockOnHand: 1 }))
      .expect(201);

    return request(app.getHttpServer())
      .post(PRODUCTS)
      .send(productBody({ name: 'Duplicado', price: 2, stockOnHand: 2 }))
      .expect(409)
      .expect((res) => {
        expect(res.body.statusCode).toBe(409);
      });
  });

  it('GET /api/v1/products lists created products', async () => {
    await request(app.getHttpServer())
      .post(PRODUCTS)
      .send(productBody({ name: 'Mouse', price: 5, stockOnHand: 10 }))
      .expect(201);

    return request(app.getHttpServer())
      .get(PRODUCTS)
      .query({ page: 1, limit: 10, sortBy: 'name', order: 'asc' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]).toMatchObject({
          name: 'Mouse',
          description: DEFAULT_DESCRIPTION,
          price: 5,
          stockOnHand: 10,
        });
        expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 10 });
      });
  });

  it('GET /api/v1/products/:id returns a product', async () => {
    const createRes = await request(app.getHttpServer())
      .post(PRODUCTS)
      .send(productBody({ name: 'Keyboard', price: 199.99, stockOnHand: 2 }));

    const id = createRes.body.id as string;

    return request(app.getHttpServer())
      .get(`${PRODUCTS}/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({
          id,
          name: 'Keyboard',
          description: DEFAULT_DESCRIPTION,
          price: 199.99,
          stockOnHand: 2,
        });
      });
  });

  it('GET /api/v1/products/:id returns 404 when missing', () => {
    return request(app.getHttpServer())
      .get(`${PRODUCTS}/00000000-0000-4000-8000-000000000000`)
      .expect(404)
      .expect((res) => {
        expect(res.body.statusCode).toBe(404);
      });
  });

  it('PATCH /api/v1/products/:id updates name and isActive', async () => {
    const createRes = await request(app.getHttpServer())
      .post(PRODUCTS)
      .send(productBody({ name: 'Old Name', price: 10, stockOnHand: 1 }));

    const id = createRes.body.id as string;

    return request(app.getHttpServer())
      .patch(`${PRODUCTS}/${id}`)
      .send({ name: 'New Name', isActive: false })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('New Name');
        expect(res.body.isActive).toBe(false);
      });
  });

  it('PATCH /api/v1/products/:id updates description only', async () => {
    const createRes = await request(app.getHttpServer())
      .post(PRODUCTS)
      .send(productBody({ name: 'Described', price: 10, stockOnHand: 1 }));

    const id = createRes.body.id as string;

    return request(app.getHttpServer())
      .patch(`${PRODUCTS}/${id}`)
      .send({ description: 'Nova descrição do produto' })
      .expect(200)
      .expect((res) => {
        expect(res.body.description).toBe('Nova descrição do produto');
        expect(res.body.name).toBe('Described');
      });
  });

  it('PATCH /api/v1/products/:id/price updates the price', async () => {
    const createRes = await request(app.getHttpServer())
      .post(PRODUCTS)
      .send(productBody({ name: 'Priced', price: 10, stockOnHand: 1 }));

    const id = createRes.body.id as string;

    return request(app.getHttpServer())
      .patch(`${PRODUCTS}/${id}/price`)
      .send({ price: 25 })
      .expect(200)
      .expect((res) => {
        expect(res.body.price).toBe(25);
      });
  });

  it('PATCH /api/v1/products/:id/amount updates the stock on hand', async () => {
    const createRes = await request(app.getHttpServer())
      .post(PRODUCTS)
      .send(productBody({ name: 'Counted', price: 1, stockOnHand: 0 }));

    const id = createRes.body.id as string;

    return request(app.getHttpServer())
      .patch(`${PRODUCTS}/${id}/amount`)
      .send({ stockOnHand: 50 })
      .expect(200)
      .expect((res) => {
        expect(res.body.stockOnHand).toBe(50);
        expect(res.body.availableQuantity).toBe(50);
      });
  });

  it('DELETE /api/v1/products/:id removes the product', async () => {
    const createRes = await request(app.getHttpServer())
      .post(PRODUCTS)
      .send(productBody({ name: 'ToDelete', price: 1, stockOnHand: 1 }));

    const id = createRes.body.id as string;

    await request(app.getHttpServer()).delete(`${PRODUCTS}/${id}`).expect(204);

    return request(app.getHttpServer()).get(`${PRODUCTS}/${id}`).expect(404);
  });
});
