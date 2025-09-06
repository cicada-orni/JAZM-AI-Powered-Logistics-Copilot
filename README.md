<div align="center">

# JAZM Monorepo — Shopify Embedded App (AI Logistics Copilot)

Enterprise‑grade Shopify app built with Next.js 15 (App Router), Polaris, and App Bridge in a Turborepo workspace. Implements OAuth session token exchange, app‑level webhooks, and a Prisma‑backed Postgres store for durable offline tokens.

</div>

## Highlights

- Next.js 15 + React 19 (App Router, Turbopack)
- Shopify App Bridge + Polaris UI
- OAuth session token → Offline token exchange
- App‑level webhooks (app/uninstalled) with DB updates
- Prisma + PostgreSQL (shops table, migrations)
- Turborepo + PNPM workspaces, shared ESLint/TS configs
- Strict CSP to allow embedding only in Shopify Admin

---

## Monorepo Structure

```
.
├─ apps/
│  ├─ web/                      # Embedded Shopify Admin app (Next.js)
│  │  ├─ src/
│  │  │  ├─ app/
│  │  │  │  ├─ layout.tsx       # App Bridge script + Polaris provider
│  │  │  │  ├─ page.tsx         # Dashboard (AuthInit triggers token exchange)
│  │  │  │  └─ api/
│  │  │  │     ├─ auth/exchange/route.ts           # Session→offline token exchange
│  │  │  │     └─ webhooks/app-uninstalled/route.ts# Mark shop uninstalled
│  │  │  └─ components/providers/
│  │  │     ├─ PolarisProvider.tsx
│  │  │     └─ AuthInit.client.tsx                 # Calls /api/auth/exchange
│  │  ├─ next.config.ts        # CSP: frame-ancestors Shopify Admin only
│  │  ├─ shopify.app.toml      # App metadata, scopes, webhooks, URLs
│  │  └─ shopify.web.toml      # Shopify CLI web process config
│  └─ api/                      # (placeholder for future backend)
├─ packages/
│  ├─ db/                       # Prisma client + helpers
│  │  ├─ prisma/
│  │  │  ├─ schema.prisma       # shops model + datasource
│  │  │  └─ migrations/         # SQL migrations
│  │  └─ src/
│  │     ├─ client.ts           # PrismaClient singleton (generated output)
│  │     └─ shopTokens.ts       # upsertShopToken, markUninstalled
│  ├─ ui/                       # Shared UI primitives
│  ├─ eslint-config/            # Shared ESLint config
│  └─ typescript-config/        # Shared tsconfig presets
├─ turbo.json                    # Turborepo pipelines
├─ pnpm-workspace.yaml           # Workspace packages
└─ package.json                  # Root scripts (dev, build, lint, types)
```

## End‑to‑End OAuth Flow

1) App Bridge renders inside Shopify Admin with API key exposed in a meta tag.
   - `apps/web/src/app/layout.tsx`: adds `<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js">` and sets `meta name="shopify-api-key"` from `NEXT_PUBLIC_SHOPIFY_API_KEY`.
2) On first load, the client calls Shopify to get a session token and exchanges it server‑side for an offline token:
   - `apps/web/src/components/providers/AuthInit.client.tsx`: calls `window.shopify.idToken()` then POSTs to `/api/auth/exchange`.
   - `apps/web/src/app/api/auth/exchange/route.ts`: decodes the session token, calls `shopify.auth.tokenExchange({ requestedTokenType: OfflineAccessToken })`, extracts `session.accessToken`, and persists it with `@jazm/db/shopTokens.upsertShopToken`.
3) Durable tokens live in Postgres (`shops` table) and are marked uninstalled via webhook.
   - `apps/web/src/app/api/webhooks/app-uninstalled/route.ts`: reads `x-shopify-shop-domain` and calls `markUninstalled`.

## Webhooks

- `app/uninstalled`: configured in `apps/web/shopify.app.toml` and handled by `apps/web/src/app/api/webhooks/app-uninstalled/route.ts`.
- GDPR topics (`customers/data_request`, `customers/redact`, `shop/redact`) are registered in the TOML; add `apps/web/src/app/api/webhooks/gdpr/route.ts` to process them as needed.

## Database (Prisma + Postgres)

- Schema: `packages/db/prisma/schema.prisma`

  ```prisma
  model shops {
    shop_domain          String   @id
    offline_access_token String
    installed_at         DateTime @default(now()) @db.Timestamptz(6)
    uninstalled          Boolean  @default(false)
  }
  ```

- Generated client output: `packages/db/src/generated/prisma` (see generator output in `schema.prisma`).
- Helper API: `packages/db/src/shopTokens.ts`
  - `upsertShopToken({ shopDomain, offlineAccessToken })`
  - `markUninstalled(shopDomain)`

## Environment Configuration

Create `apps/web/.env.local` with Shopify and database settings. Example:

```env
# Public (safe to expose to the browser)
NEXT_PUBLIC_SHOPIFY_API_KEY=<your_app_api_key>

# Server‑side
SHOPIFY_API_KEY=<your_app_api_key>
SHOPIFY_API_SECRET=<your_app_api_secret>
SHOPIFY_APP_URL=https://<your-dev-tunnel-or-domain>
SHOPIFY_SCOPES=read_orders,read_products,read_customers

# Postgres (e.g., Neon/Supabase/Cloud SQL)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
DIRECT_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

Notes:

- `DATABASE_URL` and `DIRECT_URL` are required by Prisma (see `schema.prisma` datasource).
- Keep secrets out of git; `.env.local` is ignored. Only `NEXT_PUBLIC_*` values are exposed to the browser.

## Local Development

Prerequisites

- Node 22.x (enforced via `engines`)
- PNPM 9 (`corepack enable` or `npm i -g pnpm@9`)
- Shopify CLI up‑to‑date (`npm i -g @shopify/cli@latest`), Partner account, and a dev store
- A Postgres database (Neon/Supabase/local)

Install & generate

```bash
pnpm install

# Generate Prisma client and apply migrations
pnpm -F @jazm/db db:gen
pnpm -F @jazm/db db:apply

# Optional: open Prisma Studio
pnpm -F @jazm/db db:studio
```

Run the app via Shopify CLI (recommended)

```bash
cd apps/web
pnpm shopify:dev
# Uses shopify.app.toml (auto‑updates URLs) and shopify.web.toml (dev/build commands).
```

Direct Next.js dev (without CLI tunnel)

```bash
pnpm -w --filter @jazm/web dev
```

Type‑check and lint

```bash
pnpm check-types
pnpm lint
```

## HTTP Interfaces

- `POST /api/auth/exchange` (server)
  - Headers: `Authorization: Bearer <session_token_from_App_Bridge>`
  - Response: `{ ok: true }` on success; error JSON otherwise
  - Code: `apps/web/src/app/api/auth/exchange/route.ts`

- `POST /api/webhooks/app-uninstalled` (Shopify → app)
  - Headers: `x-shopify-shop-domain: <shop.myshopify.com>`
  - Response: `{ ok: true }`
  - Code: `apps/web/src/app/api/webhooks/app-uninstalled/route.ts`

Add GDPR webhook handler at `/api/webhooks/gdpr` to process the configured compliance topics.

## Security & Compliance

- CSP: `frame-ancestors https://admin.shopify.com https://*.myshopify.com` (`apps/web/next.config.ts`)
- OAuth: Exchange transient session tokens for durable offline tokens server‑side only
- Secrets: Keep only safe values under `NEXT_PUBLIC_*`. Everything else must remain server‑side
- Webhooks: Validate HMAC in production (stub not shown here)

## Troubleshooting

- Shopify CLI version error: update with `npm i -g @shopify/cli@latest`
- Module not found `@jazm/db/shopTokens`: ensure `@jazm/db` is a dependency of the web app and `transpilePackages: ['@jazm/db']` is set (`apps/web/next.config.ts`)
- Database connection: ensure `DATABASE_URL` (and `DIRECT_URL`) are present and reachable
- Blank iframe in Admin: confirm `NEXT_PUBLIC_SHOPIFY_API_KEY`, CSP config, app installed to the dev store, and `application_url` is the tunnel URL

## Scripts

Root:

- `pnpm dev` — run all dev servers via Turbo
- `pnpm build` — build all apps/packages
- `pnpm check-types` — TypeScript across workspaces
- `pnpm lint` — ESLint across workspaces
- `pnpm format` — Prettier formatting

Web app:

- `pnpm --filter @jazm/web dev|build|start`
- `pnpm --filter @jazm/web shopify:dev` — start via Shopify CLI

DB package:

- `pnpm -F @jazm/db db:gen|db:apply|db:new|db:pull|db:studio`

## Roadmap

- Add `/api/auth/callback` handler to complement redirect URLs
- Validate webhook HMAC and add GDPR webhook handler
- Extend analytics dashboards and product/customer insights
- CI, tests, and deployment guides (Vercel or custom infra)

---

Maintained by the JAZM team.

