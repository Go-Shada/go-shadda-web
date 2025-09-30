# CampusThreads Monorepo

CampusThreads is a multivendor e-commerce platform empowering student entrepreneurs to sell apparel. This monorepo contains:

- apps/web – Web frontend (Next.js + TypeScript)
- apps/mobile – Mobile app (Expo React Native + TypeScript)
- services/api – Backend API (Node.js/Express + TypeScript)
- packages/shared – Shared types and utilities

## Quick Start

1. Prereqs
   - Node.js 18+ and npm 9+
   - Docker Desktop (for MongoDB/Redis via docker-compose)
   - Git

2. Clone and install

   ```bash
   git clone https://github.com/Go-Shada/go-shadda-web.git
   cd go-shadda-web
   npm install
   ```

3. Environment
   - Copy the example env to `.env` at the repo root (used by both API and Web where applicable):

   ```bash
   cp .env.example .env
   ```
   - Update values as needed (e.g., DEMO_PASSWORD, JWT_SECRET). If you don’t set them, defaults are used where supported.

4. Start dependencies (MongoDB, Redis) with Docker

   ```bash
   docker compose up -d --build
   ```

5. Run the API (dev)

   ```bash
   npm run dev:api
   ```

   API will run on: http://localhost:4000

MongoDB on mongodb://localhost:27017/campusthreads
Redis on redis://localhost:6379

6. Run the Web app (Next.js)

   ```bash
   npm run dev:web
   ```

   Web will run on: http://localhost:3000

7. Seeding admin (optional)

   You can run the admin bootstrap script to create an admin user if required:

   ```bash
   npm run api:bootstrap-admin
   ```

8. Building (optional)

   ```bash
   npm run build
   ```

## Workspaces

This repo uses npm workspaces. Install dependencies at the root.

## Demo accounts

Vendors: vendor1@mail.com   password123
Customers: customer8@example.com    password123
Admin: admin@example.com   Admin!12345

## Common scripts

- `npm run dev:api` – start API in watch mode
- `npm run dev:web` – start Next.js web app
- `npm run build` – build all workspaces
- `npm run lint` – lint
- `npm run test` – test (if configured)

## Directory overview

- `apps/web/` – Next.js app. Key pages:
  - `app/products/page.tsx` – product listing
  - `app/cart/page.tsx` – cart & checkout (creates orders and redirects to details)
  - `app/orders/page.tsx` – customer orders list (fetches `/orders/mine`)
  - `app/orders/[id]/page.tsx` – order detail with status timeline
  - `app/vendor/products/page.tsx` – vendor product management (categories, variants)
  - `app/vendor/inventory/page.tsx` – vendor inventory with per-variant adjustments
  - `app/vendor/orders/page.tsx` – vendor orders with status updates

- `services/api/` – Express API. Key routes:
  - `src/routes/products.ts` – public list/detail
  - `src/routes/orders.ts` – order creation and secure retrieval
  - `src/routes/vendor.ts` – vendor product & order endpoints

## Running end-to-end locally

1. Start Docker services: `docker compose up -d`
2. In one terminal: `npm run dev:api`
3. In another terminal: `npm run dev:web`
4. Visit http://localhost:3000
5. Login with a demo account or sign up (if enabled)
6. Add products as Vendor. As Customer, add to cart and Checkout.
7. Vendor updates order status. Customer sees updates under Orders.

## Troubleshooting

- If `/orders` shows a sign-in prompt, ensure you’re logged in and have a valid token.
- If images fail to upload, verify any vendor upload endpoints and storage configs.
- If API isn’t reachable, confirm it is on http://localhost:4000 and Docker services are up.

## Contributing

1. Create a feature branch from `main`
2. Commit with clear messages
3. Open a PR; include steps to test

## License
MIT

