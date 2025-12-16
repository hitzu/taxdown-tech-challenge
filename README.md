# Taxdown

## 1. Deployment model (Lambda)

The Lambda simply hosts the Nest HTTP application as **one cohesive unit**, which is a common and pragmatic pattern for small to medium backends and technical challenges.

---

## 2. Hexagonal architecture and the role of NestJS

At code level, the architecture follows a hexagonal style:

```mermaid
graph TD

subgraph Domain
  D1[Entities & Value Objects<br/>Customer, AvailableCredit, Email, PhoneNumber]
  D2[Domain Services<br/>CustomerDomainService, validation, invariants]
end

subgraph Application
  A1[Use Cases<br/> CreateCustomer, UpdateCustomer,<br/>AddAvailableCredit, ListCustomersByCredit]
end

subgraph Infrastructure
  subgraph HTTP Adapter NestJS
    C1[Controllers<br/>CustomerController, HealthController]
  end

  subgraph Persistence Adapter
    R1[CustomerRepositoryAdapter<br/>implements CustomerRepositoryPort]
    DB[(Supabase Postgres<br/>schema: taxdown_customers)]
  end

  subgraph Cross-cutting
    CFG[ConfigModule<br/>env, DB URL, schema]
    LOG[LoggingModule<br/>Pino logger]
  end
end

UI[Client / API Gateway] --> C1
C1 --> A1
A1 --> D1
A1 --> D2
A1 --> R1
R1 --> DB

CFG --> C1
CFG --> R1
LOG --> C1
LOG --> A1
```

---

## 3. Configuration (env vars)

The app uses a validated configuration module (`src/shared/config`) and reads database settings from environment variables.

- **DB_URL**: primary Postgres connection string (use this for local docker-compose and future deployments)
- **DB_SCHEMA**: optional schema name (defaults to `public` if not set)

See `.env.example` for a working local configuration.
