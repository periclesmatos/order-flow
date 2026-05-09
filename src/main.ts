import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module.js';

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

  printBanner(appVersion, appEnv, port);

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  await app.listen(port);
}

void bootstrap();
