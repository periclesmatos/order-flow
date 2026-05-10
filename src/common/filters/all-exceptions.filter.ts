import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import type { Request, Response } from 'express';
import { DomainError } from '../errors/domain.error.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(@InjectPinoLogger(AllExceptionsFilter.name) private readonly logger: PinoLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request & { id?: string }>();
    const response = ctx.getResponse<Response>();

    const correlationId = request.id;

    let statusCode: number;
    let message: string | string[] | Record<string, unknown>;
    let validationErrors: unknown;

    if (exception instanceof DomainError) {
      statusCode = exception.statusCode;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else {
        const body = res as Record<string, unknown>;
        message = (body.message as string | string[] | undefined) ?? (Object.keys(body).length > 0 ? body : exception.message);
        validationErrors = body.errors;
      }
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    const stack = exception instanceof Error ? exception.stack : undefined;

    const logMessage = typeof message === 'string' ? message : Array.isArray(message) ? message.join('; ') : JSON.stringify(message);

    if (statusCode >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error({ statusCode, correlationId, stack }, logMessage);
    } else {
      this.logger.warn({ statusCode, correlationId }, logMessage);
    }

    response.status(statusCode).json({
      statusCode,
      message,
      ...(validationErrors !== undefined ? { errors: validationErrors } : {}),
    });
  }
}
