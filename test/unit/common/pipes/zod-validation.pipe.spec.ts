import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '@src/common/pipes/zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    title: z.string().min(1, 'Title required'),
  });

  it('returns parsed value on success', () => {
    const pipe = new ZodValidationPipe(schema);
    expect(pipe.transform({ title: 'Ok' })).toEqual({ title: 'Ok' });
  });

  it('throws BadRequestException with message on failure', () => {
    const pipe = new ZodValidationPipe(schema);

    expect.assertions(3);
    try {
      pipe.transform({ title: '' });
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      const res = (e as BadRequestException).getResponse() as Record<string, unknown>;
      expect(res.message).toBeDefined();
      expect(res).toHaveProperty('errors');
    }
  });
});
