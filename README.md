# Order Flow

API REST para gestão de clientes, produtos e pedidos, construída com **Clean Architecture** modular em NestJS.

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D)](https://redis.io/)
[![Jest](https://img.shields.io/badge/tests-Jest%2030-C21325)](https://jestjs.io/)

## Visão geral

Backend que expõe recursos versionados em `/api/v1`, documentados via Swagger em `/api/docs`.

O código é organizado em camadas (Clean Architecture): a **regra de negócio fica isolada** de frameworks e banco de dados. Na prática, isso significa que trocar Prisma por outro ORM, ou Redis por outro cache, não toca o núcleo do domínio.

**Funcionalidades atuais:**

- CRUD de **clientes** com validação de e-mail e telefone (`libphonenumber-js`)
- **Endereços** por cliente (criar, atualizar, remover, definir padrão)
- CRUD de **produtos** com controle de preço, estoque e quantidade reservada
- **Cache Redis** em leitura de produtos, com invalidação automática por eventos
- **Health checks** (liveness e readiness com checagem do banco)

> **Pedidos (`Order`)** já têm modelo de dados definido no Prisma; os casos de uso e rotas estão no [roadmap](#roadmap).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | NestJS 11 (TypeScript, CommonJS) |
| Banco / ORM | PostgreSQL 16 + Prisma 7 |
| Cache | Redis 7 (`ioredis`) |
| Validação | Zod (pipe por endpoint) |
| Logs | Pino (logs estruturados) |
| Docs | Swagger / OpenAPI |
| Segurança HTTP | Helmet, CORS, rate limit (`@nestjs/throttler`) |
| Transações | `nestjs-cls` + adapter Prisma |
| Testes | Jest 30 + Supertest (e2e) |

## Arquitetura

Cada módulo de negócio segue a mesma separação por responsabilidade:

```
presentation/   → controllers, presenters, docs OpenAPI
application/    → use cases, DTOs (Zod), cache keys, event handlers
domain/         → entidades, value objects, erros, interfaces de repositório
infrastructure/ → implementação Prisma dos repositórios
```

**Regra de ouro:** `domain` não conhece nenhuma outra camada. Infra e apresentação dependem do domínio através de interfaces — nunca o contrário.

Fluxo de uma requisição:

```
HTTP → Controller → Use Case → Repository (Prisma) → PostgreSQL
                       │
                       ├─→ Domain (entidades + regras de negócio)
                       └─→ Cache (Redis) em leitura de produtos
```

Estrutura de pastas:

```
order-flow/
├── prisma/                # schema e migrations
└── src/
    ├── common/            # pipes, filters, interceptors (cross-cutting HTTP)
    ├── core/              # prisma, cache, health, transações
    ├── shared/            # bootstrap, logger, tipos
    └── modules/
        ├── customer/      # ✅ implementado
        ├── product/       # ✅ implementado (+ cache)
        └── order/         # 🚧 planejado
```

## Modelo de dados

| Entidade | Descrição |
|----------|-----------|
| **Customer** | nome, e-mail único, telefone, `isActive` |
| **Address** | vinculado ao cliente, `isDefault`, remoção em cascata |
| **Product** | nome, descrição, `price` (centavos), `stockOnHand`, `reservedQuantity` |
| **Order** *(planejado)** | `Order`, `OrderItem`, `OrderDeliveryAddress` + enum `OrderStatus` |

## Como rodar

**Pré-requisitos:** Node.js 20+, npm e Docker.

```bash
# 1. Sobe PostgreSQL (5432) e Redis (6379)
docker compose up -d

# 2. Variáveis de ambiente
cp .env.example .env

# 3. Dependências, client Prisma e migrations
npm install
npm run prisma:generate
npm run prisma:migrate

# 4. Sobe a API (porta 3000 por padrão)
npm run start:dev
```

Endpoints úteis após subir:

| Recurso | URL |
|---------|-----|
| Swagger UI | http://localhost:3000/api/docs |
| Liveness | http://localhost:3000/health |
| Readiness (banco) | http://localhost:3000/health/ready |

> A API fica sob o prefixo `/api/v1`; `health` e `docs` ficam fora dele.

## Endpoints

**Produtos** — `/api/v1/products`

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/` | Criar produto |
| GET | `/` | Listar (paginação, filtros, ordenação — *com cache*) |
| GET | `/:id` | Buscar por ID (*com cache*) |
| PATCH | `/:id` | Atualizar dados gerais |
| PATCH | `/:id/price` | Atualizar preço |
| PATCH | `/:id/amount` | Atualizar estoque |
| DELETE | `/:id` | Remover |

**Clientes** — `/api/v1/customers`

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/` | Criar cliente |
| GET | `/` · `/:id` | Listar (paginado) · buscar por ID |
| PATCH | `/:id` | Atualizar |
| DELETE | `/:id` | Remover |
| POST | `/:customerId/addresses` | Criar endereço |
| PATCH | `/:customerId/addresses/:addressId` | Atualizar endereço |
| PATCH | `/:customerId/addresses/:addressId/default` | Definir como padrão |
| DELETE | `/:customerId/addresses/:addressId` | Remover endereço |

Payloads e respostas completos no Swagger.

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta HTTP | `3000` |
| `DATABASE_URL` | Connection string PostgreSQL | — |
| `REDIS_URL` | URL do Redis | — |
| `PRODUCT_CACHE_TTL_MS` | TTL do cache de produto | `300000` (5 min) |
| `PRODUCT_LIST_CACHE_TTL_MS` | TTL do cache de listagem | `120000` (2 min) |
| `LOG_LEVEL` | Nível de log (Pino) | `info` |
| `CORS_ORIGIN` | Origens permitidas (separadas por vírgula) | todas em dev |

## Testes

```bash
npm run test       # unitários
npm run test:e2e   # end-to-end (produtos e health)
npm run test:cov   # cobertura
```

Há cobertura unitária ampla em `customer` e `product`. Antes de concluir uma mudança: `npm run typecheck && npm test`.

## Decisões técnicas

Cada decisão abaixo resolve um problema concreto:

- **Camadas isoladas por módulo** — a regra de negócio (entidades, value objects, erros) não depende de NestJS nem Prisma. Resultado: testes rápidos com repositórios in-memory e liberdade para trocar infraestrutura.

- **Use cases explícitos** — cada operação é uma classe com um método `execute()`. Os controllers ficam finos (só validam e respondem), e a intenção de cada fluxo fica fácil de ler.

- **Zod nos DTOs** — a validação é declarativa e vira tipo TypeScript automaticamente. Uma única fonte de verdade para "o que é um payload válido".

- **Dinheiro em centavos (`Int`)** — preço nunca é float. Um value object `Money` encapsula as regras e elimina erros de arredondamento.

- **Cache com invalidação por eventos** — leituras de produto vêm do Redis; qualquer mutação emite um evento que limpa as chaves afetadas. Leitura rápida *sem* servir dados obsoletos.

- **Transações via CLS** — o contexto transacional é propagado automaticamente, sem acoplar os use cases ao `PrismaService`.

- **Erros de domínio** — exceções estendem `DomainError` e são lançadas no núcleo; um filtro global as traduz para a resposta HTTP correta. As camadas internas não conhecem HTTP.

- **Observabilidade e endurecimento** — logs estruturados (Pino) com `correlationId` por requisição, Helmet, CORS configurável e rate limit global.

## Roadmap

- 🚧 **Order Service** — implementar `OrderModule` (use cases, repositórios, rotas) sobre os modelos já definidos
- 🚧 **Categoria de produto** — nova entidade com relacionamento a `Product`
- 🚧 **Autenticação e autorização**
- 🚧 **CI/CD** — pipelines de build, teste e deploy

## Licença

Projeto privado (UNLICENSED).