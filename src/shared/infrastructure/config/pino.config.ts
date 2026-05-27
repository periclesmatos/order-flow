import { RequestMethod } from '@nestjs/common';
import type { Params } from 'nestjs-pino';
import type { Options } from 'pino-http';
import type { IncomingMessage, ServerResponse } from 'http';

const isDev = process.env.NODE_ENV !== 'production';

/** path-to-regexp v8 / Nest 11 — evita `*` legado que vira `/api/v1/*` com global prefix */
const PINO_FOR_ROUTES = [
  { path: '{*path}', method: RequestMethod.ALL },
] as const;

export function getLoggerModuleParams(): Params {
  return {
    pinoHttp: getPinoHttpConfig(),
    forRoutes: [...PINO_FOR_ROUTES],
  };
}

export function getPinoHttpConfig(): Options {
  return {
    level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
    genReqId: (req: IncomingMessage) => {
      const incoming = req.headers['x-request-id'];
      if (typeof incoming === 'string' && incoming.length > 0) {
        return incoming;
      }
      if (Array.isArray(incoming) && incoming[0]) {
        return incoming[0];
      }
      return crypto.randomUUID();
    },
    autoLogging: false,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      censor: '[REDACTED]',
    },
    serializers: {
      req: (req: IncomingMessage) => ({ method: req.method, url: req.url }),
      res: (res: ServerResponse) => ({ statusCode: res.statusCode }),
    },
    ...(isDev && {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: false,
          translateTime: 'SYS:dd:mm:yyyy HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      },
    }),
  };
}
