# Order Flow

API REST para gestão de clientes, produtos e pedidos, com arquitetura modular em camadas (domínio, aplicação, infraestrutura e apresentação).

[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D)](https://redis.io/)
[![Zod](https://img.shields.io/badge/Zod-4-3E67B1)](https://zod.dev/)
[![Swagger](https://img.shields.io/badge/Swagger-11.4-brightgreen)](https://swagger.io/)
[![Jest](https://img.shields.io/badge/Jest-30-C21325)](https://jestjs.io/)
[![Supertest](https://img.shields.io/badge/Supertest-7-lightgrey)](https://www.npmjs.com/package/supertest)
[![Pino](https://img.shields.io/badge/Pino-4.6-black)](https://getpino.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-UNLICENSED-lightgrey)](#licença)

## Visão geral

O **Order Flow** é um backend em NestJS que expõe recursos versionados em `/api/v1`. Hoje o foco está em **Customer** e **Product**, com modelo de dados de **Order** já definido no Prisma, mas sem casos de uso nem rotas de pedidos implementados.

Principais capacidades atuais:

- CRUD de clientes com validação de e-mail e telefone (`libphonenumber-js`)
- Gestão de endereços por cliente (criar, atualizar, remover, definir padrão)
- CRUD de produtos com nome, descrição, preço em centavos, estoque e quantidade reservada
- Cache Redis em consulta de produto por ID
- Health checks (liveness e readiness com Prisma)
- Documentação OpenAPI em `/api/docs`

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js 20+ |
| Framework | NestJS 11 |
| Linguagem | TypeScript 5.7 (ESM) |
| ORM | Prisma 7 + PostgreSQL 16 |
| Cache | Redis 7 (`ioredis`) |
| Validação HTTP | Zod + `ZodValidationPipe` |
| Logs | Pino (`nestjs-pino`) |
| API docs | Swagger (`@nestjs/swagger`) |
| Segurança HTTP | Helmet, CORS configurável, rate limit (`@nestjs/throttler`) |
| Transações | `nestjs-cls` + `@nestjs-cls/transactional` (adapter Prisma) |
| Testes | Jest 30 + Supertest (e2e) |

## Arquitetura

Cada módulo de negócio segue separação por responsabilidade:

```
presentation/   → controllers, presenters, decorators OpenAPI
application/    → use cases, DTOs (Zod), cache keys
domain/         → entidades, value objects, erros de domínio, interfaces de repositório
infrastructure/ → implementações Prisma dos repositórios
```

Fluxo de uma requisição:

```
HTTP → Controller → Use Case → Repository (Prisma) → PostgreSQL
                      ↓
                 Domain (entidades / regras)
                      ↓
                 Cache (Redis) — apenas em Get Product hoje
```

Módulos registrados em `AppModule`:

| Módulo | Estado |
|--------|--------|
| `CustomerModule` | Implementado (API + domínio + Prisma) |
| `ProductModule` | Implementado (API + domínio + Prisma + cache) |
| `OrderModule` | Registrado, módulo vazio `[planejado]` |
| `CoreModule` | Prisma global, health, cache, transações CLS |

```
order-flow/
├── prisma/                 # schema e migrations
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/             # pipes, filters, interceptors, middleware
│   ├── core/               # prisma, cache, health
│   ├── modules/
│   │   ├── customer/
│   │   ├── product/
│   │   └── order/          # [planejado]
│   ├── shared/             # bootstrap, logger, interfaces
│   └── generated/prisma/   # client gerado
└── test/                   # unit + e2e
```

## Modelo de dados (Prisma)

Entidades persistidas:

- **Customer** — nome, e-mail único, telefone, `isActive`
- **Address** — vinculado ao cliente, `isDefault`, cascade on delete
- **Product** — nome, `description` (até 255 caracteres na API), `price` (inteiro, centavos), `stockOnHand`, `reservedQuantity`, `isActive`
- **Order**, **OrderItem**, **OrderDeliveryAddress** — schema e enum `OrderStatus` existem; API de pedidos `[planejado]`

## Pré-requisitos

- Node.js 20 ou superior
- npm
- Docker e Docker Compose (para Postgres e Redis locais)

## Como rodar

### 1. Infraestrutura

```bash
docker compose up -d
```

Sobe PostgreSQL (`5432`) e Redis (`6379`) conforme `docker-compose.yml`.

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

### 3. Banco e client Prisma

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 4. API

```bash
npm run start:dev
```

A aplicação sobe na porta definida em `PORT` (padrão `3000`).

### Endpoints úteis

| Recurso | URL |
|---------|-----|
| Swagger UI | http://localhost:3000/api/docs |
| OpenAPI JSON | http://localhost:3000/api/docs-json |
| Liveness | http://localhost:3000/health |
| Readiness (DB) | http://localhost:3000/health/ready |

Prefixo global da API: `/api/v1` (health e docs ficam fora do prefixo).

### Recursos REST (resumo)

**Produtos** (`/api/v1/products`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/` | Criar produto |
| GET | `/` | Listar (paginação, filtros, ordenação) |
| GET | `/:id` | Buscar por ID (com cache) |
| PATCH | `/:id` | Atualizar dados gerais |
| PATCH | `/:id/price` | Atualizar preço |
| PATCH | `/:id/amount` | Atualizar estoque |
| DELETE | `/:id` | Remover |

**Clientes** (`/api/v1/customers`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/` | Criar cliente |
| GET | `/` | Listar (paginado) |
| GET | `/:id` | Buscar por ID |
| PATCH | `/:id` | Atualizar |
| DELETE | `/:id` | Remover |
| POST | `/:customerId/addresses` | Criar endereço |
| PATCH | `/:customerId/addresses/:addressId` | Atualizar endereço |
| PATCH | `/:customerId/addresses/:addressId/default` | Definir endereço padrão |
| DELETE | `/:customerId/addresses/:addressId` | Remover endereço |

Detalhes de payloads e respostas: Swagger.

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente de execução | `development` |
| `PORT` | Porta HTTP | `3000` |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://postgres:postgres@localhost:5432/order_flow` |
| `REDIS_URL` | URL do Redis para cache | `redis://localhost:6379` |
| `PRODUCT_CACHE_TTL_MS` | TTL do cache de produto (ms) | `300000` (opcional; padrão 5 min) |
| `LOG_LEVEL` | Nível do Pino | `debug` |
| `CORS_ORIGIN` | Origens permitidas (vírgula) | omitir = todas em dev |

## Scripts npm

| Script | Uso |
|--------|-----|
| `npm run start:dev` | Desenvolvimento com watch |
| `npm run build` | Build de produção |
| `npm run start:prod` | Executar `dist/main` |
| `npm run test` | Testes unitários |
| `npm run test:e2e` | Testes e2e |
| `npm run test:cov` | Cobertura |
| `npm run typecheck` | Verificação TypeScript |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Gerar client Prisma (ESM) |
| `npm run prisma:migrate` | Migrations em dev |
| `npm run prisma:migrate:deploy` | Migrations em produção |
| `npm run prisma:studio` | UI do Prisma |

## Testes

```bash
# unitários
npm run test

# e2e (produtos e health)
npm run test:e2e
```

Há cobertura unitária ampla em customer e product; e2e inclui `products.e2e-spec.ts` e `health.e2e-spec.ts`.

## Decisões técnicas

- **Arquitetura em camadas por módulo** — isola regras de negócio (entidades, VOs, erros `DomainError`) da infraestrutura Nest/Prisma e facilita testes com repositórios in-memory.
- **Use cases explícitos** — cada operação de aplicação é uma classe injetável; controllers permanecem finos (validação + apresentação).
- **Zod nos DTOs** — validação declarativa reutilizável em pipe global por endpoint, alinhada ao TypeScript.
- **Prisma com client em `src/generated/prisma`** — ESM nativo (`"type": "module"`) com script de patch pós-generate.
- **Preço em centavos (`Int`)** — evita ponto flutuante; `Money` no domínio encapsula regras de valor.
- **Cache só em `GetProduct`** — reduz carga em leitura frequente; TTL configurável; listagem não cacheada para consistência de filtros.
- **Transações via CLS + Prisma adapter** — propaga contexto transacional sem acoplar use cases ao `PrismaService` diretamente em todos os fluxos.
- **Observabilidade com Pino** — logs estruturados; `LoggingInterceptor` e `AllExceptionsFilter` com `correlationId` (request id).
- **Throttler global** — 100 req/min por padrão; health checks isentos (`@SkipThrottle`).
- **Helmet + CORS + shutdown hooks** — endurecimento HTTP e encerramento gracioso em produção.
- **Swagger na raiz `/api/docs`** — contrato vivo para integração frontend ou QA.

## Roadmap

Itens alinhados a `projeto.md` e lacunas do código:

1. **[planejado] Order Service** — implementar `OrderModule` (use cases, repositórios, controller) sobre modelos `Order`, `OrderItem` e `OrderDeliveryAddress`.
2. **[planejado] Categoria de produto** — nova entidade e relacionamento com `Product`.
3. **[planejado] Autenticação e autorização** — camada de segurança de alto nível ainda não presente.
4. **[planejado] CI/CD** — não há workflows em `.github/workflows/` hoje.

