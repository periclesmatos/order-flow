export abstract class DomainError extends Error {
  public abstract readonly statusCode: number;
  public name: string = 'DomainError';
}
