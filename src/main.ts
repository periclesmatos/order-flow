import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('App');
  const appVersion = process.env.npm_package_version ?? '0.0.0';
  const appEnv = process.env.NODE_ENV ?? 'development';
  const port = Number(process.env.PORT ?? 3000);
  const appUrl = `http://localhost:${port}`;
  const startupBanner = `
  
 ██████╗ ██████╗ ██████╗ ███████╗██████╗     ███████╗██╗      ██████╗ ██╗    ██╗
██╔═══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗    ██╔════╝██║     ██╔═══██╗██║    ██║
██║   ██║██████╔╝██║  ██║█████╗  ██████╔╝    █████╗  ██║     ██║   ██║██║ █╗ ██║
██║   ██║██╔══██╗██║  ██║██╔══╝  ██╔══██╗    ██╔══╝  ██║     ██║   ██║██║███╗██║
╚██████╔╝██║  ██║██████╔╝███████╗██║  ██║    ██║     ███████╗╚██████╔╝╚███╔███╔╝
 ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝                                                                                                                                                                                                                                                                                                                                                   
Order Flow API by Pericles Matos
Version: ${appVersion} | Env: ${appEnv} | Port: ${port}
URL: ${appUrl}
`;

  await app.listen(port);
  logger.log(`\n${startupBanner}`);
  logger.log(`API rodando em ${appUrl}`);
}

void bootstrap();
