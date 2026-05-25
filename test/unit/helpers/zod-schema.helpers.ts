import type { ZodType } from 'zod';

export function parseMessages(schema: ZodType, input: unknown): string[] {
  const result = schema.safeParse(input);
  if (result.success) {
    throw new Error('expected parse to fail');
  }
  return result.error.issues.map((issue) => issue.message);
}

export function expectParseMessages(
  schema: ZodType,
  input: unknown,
  ...expected: string[]
): void {
  const messages = parseMessages(schema, input);
  for (const message of expected) {
    expect(messages).toContain(message);
  }
}
