import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodType, flattenError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(flattenError(result.error).fieldErrors);
    }
    return result.data;
  }
}
