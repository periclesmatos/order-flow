import { PipeTransform, BadRequestException } from '@nestjs/common';
import { z, ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const flat = z.flattenError(result.error);
      const errors: Record<string, string[]> = { ...flat.fieldErrors };

      if (flat.formErrors.length > 0) {
        errors['_errors'] = flat.formErrors;
      }

      const messages = result.error.issues.map((issue) => issue.message);

      throw new BadRequestException({
        message: messages.length === 1 ? messages[0] : messages,
        ...(Object.keys(errors).length > 0 ? { errors } : {}),
      });
    }
    return result.data;
  }
}
