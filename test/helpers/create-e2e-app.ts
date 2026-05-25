import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { configureApp } from '@src/shared/infrastructure/bootstrap/configure-app';
import { E2eAppModule } from './e2e-app.module';

export async function createE2eApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [E2eAppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  configureApp(app, { swagger: false });
  await app.init();
  return app;
}
