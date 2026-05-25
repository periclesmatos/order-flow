import type { LoggerService } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

const NEST_INTERNAL_CONTEXTS = new Set([
  'NestFactory',
  'InstanceLoader',
  'RoutesResolver',
  'RouterExplorer',
  'NestApplication',
  'ClsModule',
]);

function isInternalContext(optionalParams: unknown[]): boolean {
  const context = optionalParams.at(-1);
  return typeof context === 'string' && NEST_INTERNAL_CONTEXTS.has(context);
}

export function createQuietNestLogger(base: Logger): LoggerService {
  const wrap =
    (method: 'log' | 'debug' | 'verbose') =>
    (message: unknown, ...optionalParams: unknown[]) => {
      if (isInternalContext(optionalParams)) return;
      base[method](message, ...optionalParams);
    };

  return {
    log: wrap('log'),
    debug: wrap('debug'),
    verbose: wrap('verbose'),
    warn: (message, ...params) => base.warn(message, ...params),
    error: (message, ...params) => base.error(message, ...params),
    fatal: (message, ...params) => base.fatal(message, ...params),
  };
}
