import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';
import { createQuietNestLogger } from './shared/infrastructure/logger/quiet-nest.logger.js';
import { configureApp } from './shared/infrastructure/bootstrap/configure-app.js';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
} as const;

function printBanner(version: string, env: string, port: number): void {
  const url = `http://localhost:${port}`;
  const line = `${C.dim}${'─'.repeat(50)}${C.reset}`;

  process.stdout.write(`
 ██████╗ ██████╗ ██████╗ ███████╗██████╗     ███████╗██╗      ██████╗ ██╗    ██╗
██╔═══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗    ██╔════╝██║     ██╔═══██╗██║    ██║
██║   ██║██████╔╝██║  ██║█████╗  ██████╔╝    █████╗  ██║     ██║   ██║██║ █╗ ██║
██║   ██║██╔══██╗██║  ██║██╔══╝  ██╔══██╗    ██╔══╝  ██║     ██║   ██║██║███╗██║
╚██████╔╝██║  ██║██████╔╝███████╗██║  ██║    ██║     ███████╗╚██████╔╝╚███╔███╔╝
 ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝

 ${C.bold}Order Flow API${C.reset}  ${C.dim}by Pericles Matos${C.reset}
 ${line}
 ${C.yellow}Versão   ${C.reset} ${version}
 ${C.yellow}Ambiente ${C.reset} ${env}
 ${C.yellow}URL      ${C.reset} ${C.green}${url}${C.reset}
 ${C.yellow}Node     ${C.reset} ${process.version}
 ${C.yellow}PID      ${C.reset} ${process.pid}
 ${line}

`);
}

async function bootstrap() {
  const appVersion = process.env.npm_package_version ?? '0.0.0';
  const appEnv = process.env.NODE_ENV ?? 'development';
  const port = Number(process.env.PORT ?? 3000);
  const isProduction = appEnv === 'production';

  if (!isProduction) {
    printBanner(appVersion, appEnv, port);
  }

  const app = await NestFactory.create(AppModule, { logger: false });
  const logger = createQuietNestLogger(app.get(Logger));
  app.useLogger(logger);

  configureApp(app);

  await app.listen(port);

  if (isProduction) {
    logger.log(
      { event: 'server_started', port, version: appVersion, env: appEnv },
      'Server started',
    );
  }
}

void bootstrap();
