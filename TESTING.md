# TESTING

This repo uses **Jest** and follows a layered testing strategy aligned with the architecture:

- **Domain tests**: pure unit tests for entity/value-object invariants
- **Application tests**: use-case tests (often via an in-memory repository)
- **Integration tests**: TypeORM + Postgres interaction
- **E2E tests**: full Nest app over HTTP using `supertest`

## Test commands

Defined in `package.json`:

- `pnpm test`
  - Runs unit + integration tests
  - Excludes `*.e2e.spec.ts`
- `pnpm test:e2e`
  - Runs only `*.e2e.spec.ts`
- `pnpm test:all`
  - Runs the full suite (unit + integration + e2e)

## Environment variables for tests

Jest runs with `NODE_ENV=test` in CI, and typically in local test runs too.

At minimum, tests require:

- `DB_URL` (Postgres connection string)
- `DB_SCHEMA` (optional; defaults to `public` in some paths)

Example (using the Docker test DB):

```bash
export NODE_ENV=test
export DB_URL="postgresql://postgres:postgres@localhost:5433/taxdown_test"
export DB_SCHEMA="public"
pnpm test
```

## Jest setup & DB cleanup strategy

Global setup file: `test/jest.setup.ts`

What it does:

- Initializes the TypeORM `AppDataSource` once for the whole test run
- After each test:
  - Truncates all tables (`TRUNCATE ... RESTART IDENTITY CASCADE`)
  - This keeps tests isolated without requiring manual cleanup in each spec

Test DataSource behavior: `src/shared/persistence/data-source.ts`

- In `NODE_ENV=test`, TypeORM runs with:
  - `synchronize: true`
  - `dropSchema: true`
  - migrations disabled

## Where tests live

- **Domain**: `src/customer/domain/tests/**`
- **Application**: `src/customer/application/tests/**`
- **Integration**: `src/customer/infrastructure/test/**`
- **E2E**: `test/e2e/**` (e.g. `test/e2e/customers.e2e.spec.ts`)

## Husky hooks (local enforcement)

Hooks live under `.husky/**`.

### pre-push

File: `.husky/pre-push`

It runs:

- `pnpm test:all`

Meaning:

- Before you can push, **unit + integration + E2E** must pass locally.

## CI vs local

### GitHub Actions (CI)

Workflow: `.github/workflows/ci-cd.yml`  
Actions UI: `https://github.com/hitzu/taxdown-tech-challenge/actions`

On **push** and **pull_request** to `main`/`master`, CI:

- checks out the repo
- installs deps via pnpm
- runs `pnpm test` (unit + integration only)
- builds the project

E2E tests are intentionally **not** run in CI yet (no dedicated AWS test environment); they’re enforced locally via **Husky pre-push**.

### Deploy job (CI/CD)

On pushes to `main`/`master`, the workflow additionally:

- checks migration status
- runs migrations
- deploys using Serverless

Required secrets (as referenced by the workflow):

- `secrets.DB_URL`
- `secrets.DB_SCHEMA` (used by tests and deploy)
- `secrets.DB_SCHEMA` (used by the migration steps in the current workflow)
- AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)
