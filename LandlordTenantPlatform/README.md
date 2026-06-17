# LandlordTenantPlatform

A **microservices** backend for the Nigerian rental market, connecting landlords and tenants with property listings, rental applications, real-time messaging, and payment processing.

---

## Architecture

```
Internet
    │
    ▼
┌───────────────────────────────────────┐
│         API Gateway  :5000            │  ← YARP reverse proxy + JWT validation
└──────────────┬────────────────────────┘
               │ routes to ↓
    ┌──────────┼──────────────────────────────────────────────┐
    │          │                                              │
    ▼          ▼          ▼           ▼           ▼           ▼
UserSvc   PropertySvc  AppSvc   MessagingSvc  PaymentSvc  (NotificationSvc)
 :5001      :5002       :5003     :5004         :5006       [worker, no HTTP]
    │          │          │           │           │               │
    ▼          ▼          ▼           ▼           ▼               ▼
 PG:5432   PG:5433    PG:5434     PG:5435     PG:5436         PG (shared Notification DB)
    │                                              │
    └──────────────────┬───────────────────────────┘
                       ▼
              RabbitMQ :5672  (MassTransit events)
              Redis    :6379  (shared cache)
```

### Clean Architecture per service
```
*.Api           → DI bootstrap, controllers / minimal endpoints, Dockerfiles
*.Application   → MediatR commands/queries, FluentValidation, AutoMapper
*.Domain        → Aggregates, domain events, repository interfaces (pure)
*.Infrastructure→ EF Core DbContext, Npgsql, event-bus publishers, repositories
```

### Shared Building Blocks
| Library | Purpose |
|---|---|
| `BuildingBlocks.Common` | `BaseEntity`, `Result<T>`, `PagedResult<T>`, exceptions, `PaginationParams` |
| `BuildingBlocks.EventBus` | `IntegrationEvent` base record, MassTransit + RabbitMQ DI helper |
| `BuildingBlocks.Auth` | JWT bearer auth extension, `JwtSettings` POCO |

---

## Services

| Service | Responsibility |
|---|---|
| **UserService** | Registration, login, JWT issuance, profile management |
| **PropertyService** | Property listings (CRUD), search, availability |
| **ApplicationService** | Tenant rental applications, landlord approval workflow |
| **MessagingService** | In-platform direct messages between landlord ↔ tenant |
| **NotificationService** | Email / SMS / push delivery (Worker Service, event-driven) |
| **PaymentService** | Rent payments, transaction history (Paystack/Flutterwave planned) |
| **ApiGateway** | YARP reverse proxy — single ingress, JWT validation, rate limiting |

---

## Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 8.0+ |
| Docker Desktop | 4.x+ |
| Docker Compose | v2 plugin |

---

## Quick Start

### 1. Clone & configure

```bash
git clone <repo-url>
cd LandlordTenantPlatform

# Create your local env file and fill in ALL values
cp .env.example .env
$EDITOR .env
```

**Minimum values to set in `.env`:**
- One `*_DB_NAME`, `*_DB_USER`, `*_DB_PASSWORD` per service
- `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_SECRET_KEY` (min 32 chars)
- `RABBITMQ_USER`, `RABBITMQ_PASSWORD`

### 2. Build and start

```bash
docker compose up --build
```

All services, databases, Redis, and RabbitMQ start in dependency order.

### 3. Verify

| Endpoint | URL |
|---|---|
| API Gateway | http://localhost:5000 |
| UserService (direct) | http://localhost:5001 |
| PropertyService | http://localhost:5002 |
| ApplicationService | http://localhost:5003 |
| MessagingService | http://localhost:5004 |
| PaymentService | http://localhost:5006 |
| RabbitMQ UI | http://localhost:15672 |

### 4. Local (non-Docker) development

```bash
# Restore and build entire solution
dotnet build LandlordTenantPlatform.sln

# Run a specific service
dotnet run --project src/Services/UserService/UserService.Api
```

Create `appsettings.Development.json` alongside each service's `appsettings.json` to override placeholders for local development (this file is gitignored).

---

## Database Migrations

Each service manages its own migrations. Example for UserService:

```bash
dotnet ef migrations add InitialCreate \
  --project src/Services/UserService/UserService.Infrastructure \
  --startup-project src/Services/UserService/UserService.Api \
  --output-dir Persistence/Migrations

dotnet ef database update \
  --project src/Services/UserService/UserService.Infrastructure \
  --startup-project src/Services/UserService/UserService.Api
```

Repeat for `PropertyService`, `ApplicationService`, `MessagingService`, `PaymentService`, `NotificationService`.

---

## Project Reference Rules

```
*.Domain        ← (no references — pure domain)
*.Application   ← *.Domain  +  BuildingBlocks.Common
*.Infrastructure← *.Application  +  *.Domain  +  Common  +  EventBus
*.Api           ← *.Application  +  *.Infrastructure  +  Common  +  EventBus  +  Auth
ApiGateway      ← BuildingBlocks.Auth
```

---

## Stopping

```bash
docker compose down          # stop containers
docker compose down -v       # stop + wipe all volumes (destructive!)
```
