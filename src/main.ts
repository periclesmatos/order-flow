import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

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
  console.log(startupBanner);
}

void bootstrap();
