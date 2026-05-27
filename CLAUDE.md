# CLAUDE.md

API NestJS 11 (TypeScript, CommonJS) com Clean Architecture modular. Prisma 7 + Postgres, Redis (ioredis), Zod, Pino, Swagger.

## Comandos

```bash
npm run start:dev      # dev com watch
npm run build          # nest build
npm test               # jest (unit)
npm run test:e2e       # supertest
npm run lint           # eslint --fix
npm run typecheck      # tsc --noEmit (src + jest)
npm run prisma:migrate # migration dev
npm run prisma:generate
```

Antes de concluir uma mudança: `npm run typecheck` e `npm test`.

## Regras críticas

- **Módulo CommonJS** (`tsconfig`: `module: CommonJS`, `moduleResolution: Node10`): imports relativos **sem extensão** (ex.: `from './product.entity'`). Não adicione `.js`/`.ts`.
- O client Prisma é gerado em CJS (`moduleFormat = "cjs"` no `schema.prisma`); regenere com `npm run prisma:generate`.
- **Importe tipos com `import type`** para interfaces/DTOs (DI por token, `isolatedModules`).
- Mensagens voltadas ao usuário (erros, validação) em **português**; código/identificadores em inglês.

## Arquitetura (por módulo em `src/modules/<x>/`)

```
domain/         entidades, value objects, erros, interfaces de repositório (+ token)
application/    use cases, DTOs (Zod), cache keys, event handlers
infrastructure/ implementação Prisma dos repositórios
presentation/   controllers, presenters, decorators OpenAPI
```

Regra de dependência: `domain` não importa nada das outras camadas. `infrastructure`/`presentation` dependem de `domain` via interfaces.

Infra compartilhada em `src/core/` (prisma, cache, health) e `src/shared/` (logger, bootstrap, tipos). Cross-cutting HTTP em `src/common/` (pipes, filters, interceptors, middleware).

## Padrões

**Entidade** — construtor privado; `static create(props)` gera novo (UUID, defaults); `static restore(primitives)` reconstrói do banco; getters expõem estado; setters/métodos de comportamento validam e atualizam `updatedAt`; `toJSON()` retorna primitivos. Dinheiro sempre como `Money` (inteiro em centavos), nunca float.

**Use case** — classe simples (NÃO `@Injectable`), um método `execute()`. Recebe `ILogger`, repositório (via token) e `EventEmitter2` no construtor. Registrado no módulo com `useFactory` + `inject` (ver `product.module.ts`).

**Repositório** — interface `IXxxRepository` + token `XXX_REPOSITORY` em `domain/repositories/`. Implementação `@Injectable` em `infrastructure/`, acessa o banco via `this.txHost.tx` (`TransactionHost`, suporta transações CLS). Função `toDomain(row)` mapeia linha → entidade; sempre retorna entidades de domínio, nunca linhas Prisma.

**DTO** — schema Zod `XxxSchema` + `type XxxDto = z.infer<typeof XxxSchema>` no mesmo arquivo. Validado no controller com `@Body(new ZodValidationPipe(XxxSchema))`.

**Controller** — fino: valida (Zod pipe) → chama use case → `ProductPresenter.toResponse(...)`. Decorators de doc ficam em `presentation/openapi/*.openapi.ts`, fora do controller.

**Erros** — estender `DomainError` (abstract, define `statusCode`) em `domain/errors/`. Lançar no domínio/use case; `AllExceptionsFilter` mapeia para a resposta HTTP. Não lançar `HttpException` nas camadas internas.

**Eventos** — mutações emitem evento (`emitAsync`) consumido por handlers em `application/event-handlers/` (ex.: invalidação de cache de produto).

**Cache** — via token `CACHE_SERVICE` / `ICacheService` (Redis). Chaves centralizadas em `application/cache/*.cache-keys.ts`.

## API

Rotas versionadas em `/api/v1`; docs Swagger em `/api/docs`. Preço trafega como inteiro em centavos.
