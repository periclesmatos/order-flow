import { HttpStatus } from '@nestjs/common';

export abstract class DomainError extends Error {
  abstract readonly statusCode: HttpStatus;
}
