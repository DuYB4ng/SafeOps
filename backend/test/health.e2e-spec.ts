import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';

describe('Base backend HTTP (requires PostgreSQL from .env)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    dataSource = app.get(DataSource);
  });
  afterAll(async () => {
    if (app) await app.close();
  });

  it('returns 200 after a real PostgreSQL query', async () => {
    const response = await request(app.getHttpServer() as import('node:http').Server)
      .get('/api/v1/health')
      .expect(200);
    expect(response.body).toEqual({
      statusCode: 200,
      data: { status: 'ok', database: 'connected' },
    });
  });

  it('exposes Swagger with bearer authentication', async () => {
    await request(app.getHttpServer() as import('node:http').Server)
      .get('/api/')
      .expect(200);
    const response = await request(app.getHttpServer() as import('node:http').Server)
      .get('/api-json')
      .expect(200);
    expect(response.text).toContain('bearer');
    expect(response.text).toContain('/api/v1/health');
  });

  it('returns the error contract when the database query fails', async () => {
    const query = jest
      .spyOn(dataSource, 'query')
      .mockRejectedValueOnce(new Error('private DB credentials'));
    try {
      const response = await request(app.getHttpServer() as import('node:http').Server)
        .get('/api/v1/health')
        .expect(503);
      expect(response.body).toMatchObject({
        statusCode: 503,
        code: 'SERVICE_UNAVAILABLE',
        details: { database: 'disconnected' },
        path: '/api/v1/health',
      });
      expect(response.text).not.toContain('private DB credentials');
      expect(response.text).not.toContain('stack');
    } finally {
      query.mockRestore();
    }
  });

  it('returns the error contract for unknown routes', async () => {
    const response = await request(app.getHttpServer() as import('node:http').Server)
      .get('/api/v1/missing')
      .expect(404);
    expect(response.body).toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
      path: '/api/v1/missing',
    });
  });
});
