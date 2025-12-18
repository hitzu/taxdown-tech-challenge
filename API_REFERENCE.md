# API_REFERENCE

All routes are prefixed with `/api` (see `src/main.ts` / `src/lambda.ts`).

Swagger UI (local): `/api-docs`

## Bruno collection (recommended for manual testing)

This repo includes a ready-to-use [Bruno](https://www.usebruno.com/) collection under `collection-taxdown/` with the same endpoints documented here.

- **Location**: `collection-taxdown/`
- **Environments**:
  - `collection-taxdown/environments/dev.bru` → `base_url=http://localhost:3000`
  - `collection-taxdown/environments/prod.bru` → `base_url=<api-gateway-url>`

## cURL quickstart

All examples below assume:

```bash
export BASE_URL="http://localhost:3000"
```

## Common behaviors

- **Validation**: Nest global `ValidationPipe` is enabled with `whitelist: true` and `transform: true`.
  - Invalid request bodies or query params typically return **400**.
- **IDs**: `:id` path params are parsed with `Number(id)` in the controller.

## Health

### GET `/api/health`

- **Purpose**: basic liveness check.
- **Response**: `200 OK`

Example response:

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 12.345
}
```

Example cURL:

```bash
curl -i "$BASE_URL/api/health"
```

## Customers

Controller: `src/customer/infrastructure/http/customer.controller.ts`

### POST `/api/customers`

- **Purpose**: create a customer.
- **Request body** (`CreateCustomerRequestDto`):
  - `name`: string, required, not empty
  - `email`: string, required, valid email
  - `phoneNumber`: string, required, not empty
  - `availableCredit`: number, required, **positive**
- **Success**: `201 Created` (empty body)
- **Errors**:
  - `400 Bad Request`: validation error
  - `409 Conflict`: if a customer already exists with the same `(email, phoneNumber)`

Example cURL (from Bruno collection):

```bash
curl -i -X POST "$BASE_URL/api/customers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "hola",
    "email": "hola+1@gmcio.com",
    "phoneNumber": "+512221101001",
    "availableCredit": 100
  }'
```

### GET `/api/customers/:id`

- **Purpose**: fetch a customer by id.
- **Path params**:
  - `id`: number
- **Success**: `200 OK` with `CustomerDto`
- **Errors**:
  - `404 Not Found`: if the customer does not exist

`CustomerDto` fields:

- `id: number`
- `name: string`
- `email: string`
- `phoneNumber: string`
- `availableCredit: number`
- `createdAt: string (ISO date)`
- `updatedAt: string (ISO date)`
- `deletedAt: string (ISO date) | null`

Example cURL (from Bruno collection):

```bash
curl -i "$BASE_URL/api/customers/1"
```

### GET `/api/customers`

- **Purpose**: list customers with pagination and sorting.
- **Query params** (`FindAllCustomerRequestDto`):
  - `sortBy` (optional): `availableCredit | name | createdAt`
  - `sortOrder` (optional): `asc | desc`
  - `page` (optional): integer >= 1
  - `pageSize` (optional): integer >= 1
- **Defaults** (in controller):
  - `sortBy=createdAt`
  - `sortOrder=asc`
  - `page=1`
  - `pageSize=10`
- **Success**: `200 OK` with:
  - `{ customers: CustomerDto[], total: number }`

Example cURL (valid pagination/sorting):

```bash
curl -i "$BASE_URL/api/customers?sortBy=availableCredit&sortOrder=desc&page=1&pageSize=10"
```

### PUT `/api/customers/:id`

- **Purpose**: update customer fields (patch-style: only provided fields are updated).
- **Path params**:
  - `id`: number
- **Request body** (`UpdateCustomerRequestDto`, all optional):
  - `name`: string, not empty
  - `email`: string, valid email
  - `phoneNumber`: string, not empty
  - `availableCredit`: number, **positive**
- **Success**: `204 No Content`
- **Errors**:
  - `400 Bad Request`: validation error
  - `404 Not Found`: if the customer does not exist

Example cURL (from Bruno collection):

```bash
curl -i -X PUT "$BASE_URL/api/customers/2" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "juan",
    "email": "juan@email.com"
  }'
```

### PATCH `/api/customers/:id/available-credit`

- **Purpose**: increment (add) available credit for a customer.
- **Path params**:
  - `id`: number
- **Request body** (`UpdateCustomerAvailableCreditRequestDto`):
  - `availableCredit`: number, required, **positive**
    - This field is treated as the **amount to add**.
- **Success**: `204 No Content`
- **Errors**:
  - `400 Bad Request`: validation error (non-positive amounts rejected)
  - `404 Not Found`: if the customer does not exist

Example cURL (from Bruno collection):

```bash
curl -i -X PATCH "$BASE_URL/api/customers/2/available-credit" \
  -H "Content-Type: application/json" \
  -d '{
    "availableCredit": 400
  }'
```

### DELETE `/api/customers/:id`

- **Purpose**: delete a customer (soft delete in the database).
- **Path params**:
  - `id`: number
- **Success**: `204 No Content`
- **Errors**:
  - `404 Not Found`: if the customer does not exist

Example cURL (from Bruno collection):

```bash
curl -i -X DELETE "$BASE_URL/api/customers/1"
```