# CampusThreads Backend (API)

Node.js/Express + TypeScript API that powers the CampusThreads multi‑vendor commerce platform.

- Language: TypeScript
- Framework: Express
- DB: MongoDB (Mongoose)
- Cache/Queue: Redis (optional, future use)
- Auth: JWT (Bearer)
- Validation: Zod

## 1) Prerequisites

- Node.js 18+ and npm 9+
- Docker Desktop (recommended) to run MongoDB and Redis via docker-compose
- Git

## 2) Environment

Copy the example env to your root `.env` (consumed by API and Web):

```bash
cp .env.example .env
```

Relevant API variables (from `.env.example`):

```
# API
PORT=4000
MONGO_URI=mongodb://mongo:27017/campusthreads
MONGO_URI_LOCAL=mongodb://localhost:27017/campusthreads
JWT_SECRET=please-change-me
CORS_ORIGIN=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
REDIS_URL=redis://redis:6379
NODE_ENV=development

# Web
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Notes:
- When running API locally without docker-compose services, use `MONGO_URI_LOCAL` or set `MONGO_URI` to a local URI.
- Update `JWT_SECRET` to a strong secret.
- `CORS_ORIGIN` should allow your web front-end origin(s).

## 3) Install & Run (from repo root)

Install dependencies at the root (npm workspaces):

```bash
npm install
```

Start MongoDB and Redis via Docker:

```bash
docker compose up -d --build
```

Run the API in dev mode:

```bash
npm run dev:api
```

- API will listen on: http://localhost:4000
- Health check: hit any GET route like `/products` to verify JSON response

Build & start (production):

```bash
npm run build:api
npm run start:api
```

Useful direct scripts (inside `services/api/`):

```bash
# from repo root
npm run dev:api         # ts-node-dev watch
npm run build:api       # tsc build
npm run start:api       # run dist

# seeding/admin helpers
npm run -w services/api bootstrap-admin   # creates an admin user (see script)
npm run -w services/api seed              # optional seed script if present
```

## 4) Project Structure

```
services/api/
  ├─ src/
  │  ├─ index.ts            # Express app bootstrap
  │  ├─ middleware/
  │  │   └─ auth.ts         # JWT auth guard, roles
  │  ├─ models/
  │  │   ├─ Order.ts        # Order schema
  │  │   └─ Product.ts      # Product schema (vendor, variants, images, etc.)
  │  └─ routes/
  │      ├─ products.ts     # Public product browse
  │      ├─ orders.ts       # Order create + secure fetch
  │      └─ vendor.ts       # Vendor products/orders management
  ├─ scripts/
  │  ├─ bootstrap-admin.ts  # Create admin user helper
  │  └─ seed.ts             # Optional data seeding
  ├─ package.json
  └─ tsconfig.json
```

## 5) Data Models (high level)

### Product (simplified)
- `vendorId`: ObjectId (ref Vendor)
- `name`: string
- `description?`: string
- `price`: number
- `images`: string[]
- `categories?`: string[]
- `variants?`: Array<{ size?: string; color?: string; stock: number }>
- timestamps

### Order
Defined in `src/models/Order.ts`:
- `customerId`: ObjectId (ref User)
- `vendorId`: ObjectId (ref Vendor)
- `items`: Array<{
  - `productId`: ObjectId (ref Product)
  - `quantity`: number
  - `price`: number
  - `variant?`: { size?: string; color?: string }
}>
- `status`: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
- `tracking?`: string
- timestamps

Stock notes:
- When a vendor updates an order status to `delivered`, the API decrements product variant stock once during the transition (idempotent).

## 6) Authentication

- JWT-based. Clients send `Authorization: Bearer <token>`.
- `requireAuth` middleware attaches `req.user` (with fields like `sub`, `role`, `vendorId?`).
- Access controls:
  - Customers can only access their own orders.
  - Vendors can access products and orders tied to their `vendorId`.
  - Admin can access broader sets depending on route.

## 7) REST API Overview

Base URL: `http://localhost:4000`

### Public Products
- GET `/products`
  - Query params supported: `q, category, minPrice, maxPrice, color, size, inStock, sort, page, limit`
  - Returns: `{ items, total, page, limit }`
- GET `/products/:id`
  - Returns a single product

### Orders (Customer, requires auth)
- GET `/orders/mine`
  - Returns orders for the authenticated customer
- GET `/orders/:id`
  - Returns a single order if requester is admin, the owning customer, or the matching vendor
- POST `/orders`
  - Body:
    ```json
    {
      "vendorId": "<vendor ObjectId>",
      "items": [
        { "productId": "<productId>", "quantity": 1, "price": 29.99, "variant": { "size": "M", "color": "Red" } }
      ]
    }
    ```
  - Creates an order for the authenticated customer

### Vendor (requires auth with vendor role)
- GET `/vendor/products`
  - Lists products for the vendor
- POST `/vendor/products`
  - Create product; accepts `name, price, description?, images?, categories?, variants?`
- PATCH `/vendor/products/:id`
  - Update a vendor product (including `variants` array for stock edits)
- POST `/vendor/products/:id/inventory`
  - Bulk adjust or clear inventory (all variants); body example: `{ "action": "add", "amount": 5 }` or `{ "action": "clear" }`
- GET `/vendor/orders`
  - Lists vendor’s orders; includes populated product data for items
- PATCH `/vendor/orders/:id/status`
  - Body: `{ "status": "pending|paid|shipped|delivered|cancelled" }`
  - On transition to `delivered`, decrements variant stock accordingly

> Note: Some projects also add `/vendor/uploads` for images. If present, it accepts multipart/form-data and returns `{ url }`.

## 8) Local Development Flow

1. `docker compose up -d` (MongoDB/Redis)
2. `npm run dev:api`
3. Hit `GET /products` to verify API
4. Use the web app (`npm run dev:web`) to browse, add to cart, checkout, and verify orders.

## 9) Testing API Quickly

Using curl or a REST client (e.g., Thunder Client, Postman):

```bash
# Products
curl http://localhost:4000/products

# Create order (replace TOKEN and IDs)
curl -X POST http://localhost:4000/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "vendorId": "<vendorId>",
        "items": [{ "productId": "<productId>", "quantity": 1, "price": 10 }]
      }'

# My orders
curl -H "Authorization: Bearer TOKEN" http://localhost:4000/orders/mine

# Vendor orders
curl -H "Authorization: Bearer VENDOR_TOKEN" http://localhost:4000/vendor/orders

# Update vendor order status
curl -X PATCH http://localhost:4000/vendor/orders/<orderId>/status \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "delivered" }'
```

## 10) Seeding & Admin

- `npm run -w services/api bootstrap-admin`
  - Creates an admin user using current `.env` configuration.
- `npm run -w services/api seed`
  - Optional: populate sample data if the script is implemented.

## 11) Troubleshooting

- "ECONNREFUSED" to MongoDB
  - Ensure Docker is running and `docker compose ps` shows Mongo up
  - Verify `MONGO_URI`/`MONGO_URI_LOCAL`
- CORS errors
  - Set `CORS_ORIGIN` to your web URL (e.g., `http://localhost:3000`)
- 401 Unauthorized
  - Ensure Bearer token is present and not expired; verify `JWT_SECRET`
- Order stock not changing
  - Only decremented on transition into `delivered`. Verify vendor status update call.
- Images not appearing
  - Check `images` field on product; ensure UI is sending URLs or your upload endpoint is configured.

## 12) Contribution

- Branch from `main`
- Use clear commit messages
- Open PR with testing steps

---

If anything is unclear or you want additional endpoints documented (e.g., users/auth), open an issue or PR in the repo.
