import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createE2eApp } from '../helpers/create-e2e-app';

const CATEGORIES = '/api/v1/categories';

describe('Categories API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createE2eApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/v1/categories creates a category and returns x-request-id', () => {
    return request(app.getHttpServer())
      .post(CATEGORIES)
      .send({ name: 'Eletrônicos' })
      .expect(201)
      .expect((res) => {
        expect(res.headers['x-request-id']).toEqual(expect.any(String));
        expect(res.body).toMatchObject({
          name: 'Eletrônicos',
          isActive: true,
        });
        expect(res.body.id).toEqual(expect.any(String));
        expect(res.body.createdAt).toBeDefined();
      });
  });

  it('POST /api/v1/categories returns 400 when name is empty', () => {
    return request(app.getHttpServer())
      .post(CATEGORIES)
      .send({ name: '' })
      .expect(400)
      .expect((res) => {
        expect(res.body.statusCode).toBe(400);
        expect(res.headers['x-request-id']).toEqual(expect.any(String));
      });
  });

  it('POST /api/v1/categories returns 409 when name already exists', async () => {
    await request(app.getHttpServer())
      .post(CATEGORIES)
      .send({ name: 'Duplicado' })
      .expect(201);

    return request(app.getHttpServer())
      .post(CATEGORIES)
      .send({ name: 'Duplicado' })
      .expect(409)
      .expect((res) => {
        expect(res.body.statusCode).toBe(409);
      });
  });

  it('GET /api/v1/categories lists categories with pagination', async () => {
    await request(app.getHttpServer())
      .post(CATEGORIES)
      .send({ name: 'Móveis' })
      .expect(201);

    return request(app.getHttpServer())
      .get(CATEGORIES)
      .query({ page: 1, limit: 10 })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]).toMatchObject({ name: 'Móveis', isActive: true });
        expect(res.body.meta).toMatchObject({ total: 1, page: 1, limit: 10 });
      });
  });

  it('GET /api/v1/categories?name= filters by partial name', async () => {
    await request(app.getHttpServer()).post(CATEGORIES).send({ name: 'Alimentos' }).expect(201);
    await request(app.getHttpServer()).post(CATEGORIES).send({ name: 'Ferramentas' }).expect(201);

    return request(app.getHttpServer())
      .get(CATEGORIES)
      .query({ name: 'alim' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].name).toBe('Alimentos');
      });
  });

  it('GET /api/v1/categories/:id returns a category', async () => {
    const createRes = await request(app.getHttpServer())
      .post(CATEGORIES)
      .send({ name: 'Vestuário' });

    const id = createRes.body.id as string;

    return request(app.getHttpServer())
      .get(`${CATEGORIES}/${id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ id, name: 'Vestuário', isActive: true });
      });
  });

  it('GET /api/v1/categories/:id returns 404 when not found', () => {
    return request(app.getHttpServer())
      .get(`${CATEGORIES}/00000000-0000-4000-8000-000000000000`)
      .expect(404)
      .expect((res) => {
        expect(res.body.statusCode).toBe(404);
      });
  });

  it('PATCH /api/v1/categories/:id updates the name', async () => {
    const createRes = await request(app.getHttpServer())
      .post(CATEGORIES)
      .send({ name: 'Nome Antigo' });

    const id = createRes.body.id as string;

    return request(app.getHttpServer())
      .patch(`${CATEGORIES}/${id}`)
      .send({ name: 'Nome Novo' })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Nome Novo');
      });
  });

  it('PATCH /api/v1/categories/:id/deactivate deactivates the category', async () => {
    const createRes = await request(app.getHttpServer())
      .post(CATEGORIES)
      .send({ name: 'Para Desativar' });

    const id = createRes.body.id as string;

    return request(app.getHttpServer())
      .patch(`${CATEGORIES}/${id}/deactivate`)
      .expect(200)
      .expect((res) => {
        expect(res.body.isActive).toBe(false);
      });
  });

  it('DELETE /api/v1/categories/:id removes the category', async () => {
    const createRes = await request(app.getHttpServer())
      .post(CATEGORIES)
      .send({ name: 'Para Deletar' });

    const id = createRes.body.id as string;

    await request(app.getHttpServer()).delete(`${CATEGORIES}/${id}`).expect(204);

    return request(app.getHttpServer()).get(`${CATEGORIES}/${id}`).expect(404);
  });
});
