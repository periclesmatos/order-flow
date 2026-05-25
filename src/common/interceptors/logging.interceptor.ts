import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Observable, tap, catchError, throwError } from 'rxjs';
import type { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@InjectPinoLogger(LoggingInterceptor.name) private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { id?: string; user?: { id?: string } }>();
    const { method, url, id: correlationId } = req;
    const userId = req.user?.id ?? undefined;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        this.logger.info(
          {
            method,
            path: url,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
            correlationId,
            ...(userId !== undefined ? { userId } : {}),
          },
          'REQUEST COMPLETED',
        );
      }),
      catchError((error: Error) => {
        this.logger.error(
          {
            method,
            path: url,
            correlationId,
            durationMs: Date.now() - startedAt,
            message: error.message,
            stack: error.stack,
          },
          'REQUEST FAILED',
        );
        return throwError(() => error);
      }),
    );
  }
}
