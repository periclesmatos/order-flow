import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from '@src/common/filters/all-exceptions.filter';
import type { PinoLogger } from 'nestjs-pino';

describe('AllExceptionsFilter', () => {
  const logger = {
    error: jest.fn(),
    warn: jest.fn(),
  } as unknown as PinoLogger;

  const filter = new AllExceptionsFilter(logger);

  function createHost(requestId?: string) {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });

    const request = { id: requestId };
    const response = { status, json };

    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;

    return { host, status, json };
  }

  it('includes correlationId in error response body', () => {
    const { host, status, json } = createHost('corr-123');

    filter.catch(new BadRequestException('Invalid input'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        correlationId: 'corr-123',
        message: 'Invalid input',
      }),
    );
  });

  it('omits correlationId when request id is missing', () => {
    const { host, json } = createHost(undefined);

    filter.catch(new BadRequestException('Invalid input'), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid input',
      }),
    );
    expect(json.mock.calls[0][0]).not.toHaveProperty('correlationId');
  });
});
