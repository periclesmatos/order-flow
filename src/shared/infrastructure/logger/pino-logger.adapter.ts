import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import type { ILogger } from '../../domain/interfaces/logger.interface';

@Injectable()
export class PinoLoggerAdapter implements ILogger {
  constructor(private readonly logger: PinoLogger) {}

  debug(payload: Record<string, unknown>, message: string): void {
    this.logger.debug(payload, message);
  }

  error(payload: Record<string, unknown>, message: string): void {
    this.logger.error(payload, message);
  }

  info(payload: Record<string, unknown>, message: string): void {
    this.logger.info(payload, message);
  }

  warn(payload: Record<string, unknown>, message: string): void {
    this.logger.warn(payload, message);
  }
}
