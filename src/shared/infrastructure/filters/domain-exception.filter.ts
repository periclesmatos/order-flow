import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../common/errors/domain.error.js';

export class DomainExceptionFilter implements ExceptionFilter {
  private readonly errorMap = new Map<string, number>([
    ['ProductAlreadyExistsError', HttpStatus.CONFLICT],
    ['ProductNotFoundError', HttpStatus.NOT_FOUND],
    ['CustomerAlreadyExistsError', HttpStatus.CONFLICT],
    ['CustomerNotFoundError', HttpStatus.NOT_FOUND],
    ['AddressNotFoundError', HttpStatus.NOT_FOUND],
  ]);

  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = this.errorMap.get(exception.name) || HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: exception.name,
    });
  }
}
