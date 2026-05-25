import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request & { id?: string }, res: Response, next: NextFunction): void {
    if (!req.id) {
      const incoming = req.headers['x-request-id'];
      req.id =
        typeof incoming === 'string' && incoming.length > 0
          ? incoming
          : crypto.randomUUID();
    }
    res.setHeader('X-Request-Id', req.id);
    next();
  }
}
