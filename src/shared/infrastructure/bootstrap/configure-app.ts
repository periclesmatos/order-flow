import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { RequestIdMiddleware } from '../../../common/middleware/request-id.middleware';

export interface ConfigureAppOptions {
  swagger?: boolean;
}

export function configureApp(
  app: INestApplication,
  options: ConfigureAppOptions = {},
): void {
  const { swagger = true } = options;

  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'health/ready', 'api/docs', 'api/docs-json'],
  });

  app.enableShutdownHooks();
  app.use(helmet());

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((origin) => origin.trim())
      : true,
  });

  const requestIdMiddleware = new RequestIdMiddleware();
  app.use((req, res, next) => requestIdMiddleware.use(req, res, next));

  if (swagger) {
    const config = new DocumentBuilder()
      .setTitle('Order Flow API')
      .setDescription('Order Flow REST API')
      .setVersion(process.env.npm_package_version ?? '0.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      jsonDocumentUrl: 'api/docs-json',
    });
  }
}
