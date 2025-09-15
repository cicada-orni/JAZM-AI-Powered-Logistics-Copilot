<div align="center">

# JAZM Monorepo — Shopify Embedded App (AI Logistics Copilot)

Enterprise-grade Shopify app built with Next.js 15 (App Router), Polaris, and App Bridge in a Turborepo workspace. Implements OAuth session token exchange, app-level webhooks, and a Prisma‑backed Postgres store for durable offline tokens.

</div>

## Highlights

- Next.js 15 + React 19 (App Router, Turbopack)
- Shopify App Bridge + Polaris UI
- Session token → Offline token exchange (server-side)
- App-level webhooks (app/uninstalled) with dedupe + DB updates
- Prisma + PostgreSQL (shops + webhook deliveries)
- Turborepo + PNPM workspaces
- Strict CSP for embedded runtime (per‑shop via middleware)
- CI: GraphQL‑only policy, Lighthouse CI on PRs + nightly

---

## Monorepo Structure

```
.
├─ apps/
│  └─ web/                      # Embedded Shopify Admin app (Next.js)
│     ├─ next.config.ts         # Transpiles @jazm/db; base CSP header
│     ├─ middleware.ts          # Per‑shop CSP: frame‑ancestors shop + admin
│     ├─ shopify.app.toml       # App metadata, scopes, webhooks, URLs
│     ├─ src/
│     │  ├─ app/
│     │  │  ├─ page.tsx         # Dashboard
│     │  │  └─ api/
│     │  │     ├─ auth/exchange/route.ts            # Session→offline exchange
│     │  │     └─ webhooks/app-uninstalled/route.ts  # Mark shop uninstalled
│     │  ├─ components/
│     │  │  ├─ app/PageTitleBar.tsx                 # App Bridge TitleBar
│     │  │  └─ providers/WebVitalsReporterAB.client.tsx  # AB web vitals hook
│     │  └─ lib/
│     │     ├─ shopify.ts                           # shopifyApi() client
│     │     ├─ verifyShopifyHmac.ts                 # HMAC verification
│     │     ├─ admin-graphql.ts                     # Admin GraphQL client
│     │     └─ host.ts + HostGuard.client.tsx       # Persist/append host/shop
│     └─ playwright.config.ts + e2e/                # Optional e2e harness
├─ packages/
│  └─ db/                       # Prisma client + helpers
│     ├─ prisma/
│     │  └─ schema.prisma       # shops, webhook_deliveries
│     └─ src/
│        ├─ client.ts           # PrismaClient singleton
│        ├─ shopTokens.ts       # upsertShopToken, markUninstalled
│        ├─ webhooks.ts         # recordWebhookOnce (dedupe)
│       └─ getUniqueShop.ts    # getShopByDomain/requireActiveShop
├─ .github/workflows/
│  ├─ graphql-only.yml          # Guard against REST; enforce version const
│  ├─ performance.yml           # PR Lighthouse CI
│  └─ performance-nightly.yml   # Nightly multi‑route Lighthouse CI
├─ .lighthouserc.json           # PR LHCI thresholds (desktop preset)
├─ .lighthouserc.nightly.json   # Nightly LHCI thresholds (stricter)
├─ docs/
│  ├─ adr/ADR-0001-graphql-only-and-versioning.md
│  └─ navigation/top-level-policy.md
└─ turbo.json, pnpm-workspace.yaml, package.json
```

## End‑to‑End OAuth Flow

1. App Bridge renders inside Shopify Admin and the client obtains a session token.
   - `apps/web/src/components/auth/AuthInit.client.tsx` calls `shopify.idToken()` then POSTs to `/api/auth/exchange`.
2. Server exchanges the session token for an offline token and persists it.
   - `apps/web/src/app/api/auth/exchange/route.ts` decodes and exchanges the token using `shopifyApi`, then calls `@jazm/db/shopTokens.upsertShopToken`.
3. Durable tokens live in Postgres (`shops` table). Uninstalls are tracked via webhook.
   - `apps/web/src/app/api/webhooks/app-uninstalled/route.ts` verifies HMAC, dedupes with `recordWebhookOnce`, then calls `markUninstalled`.

## Webhooks

- `app/uninstalled`: configured in `apps/web/shopify.app.toml` → handled by `apps/web/src/app/api/webhooks/app-uninstalled/route.ts`.
- GDPR topics (`customers/data_request`, `customers/redact`, `shop/redact`) are declared; create `apps/web/src/app/api/webhooks/gdpr/route.ts` to process them.
- HMAC verification: `apps/web/src/lib/verifyShopifyHmac.ts`.
- Delivery dedupe: `packages/db/src/webhooks.ts#recordWebhookOnce` returns false for duplicate IDs.

## Database (Prisma + Postgres)

- Schema: `packages/db/prisma/schema.prisma`

  ```prisma
  model shops {
    shop_domain          String    @id
    offline_access_token String
    installed_at         DateTime  @default(now()) @db.Timestamptz(6)
    uninstalled          Boolean   @default(false)
    redacted_at          DateTime? @db.Timestamptz(6)
  }

  model webhook_deliveries {
    webhook_id   String    @id
    topic        String
    shop_domain  String
    triggered_at DateTime? @db.Timestamptz(6)
    received_at  DateTime  @default(now()) @db.Timestamptz(6)
    payload      Json
  }
  ```

- Generated client output: `packages/db/src/generated/prisma`.
- Helpers: `shopTokens.ts`, `webhooks.ts`, `getUniqueShop.ts`.

## CI/CD

- GraphQL‑only policy: `.github/workflows/graphql-only.yml`
  - Blocks REST Admin API usage in source files.
  - Enforces a single Admin API version constant `SHOPIFY_ADMIN_API_VERSION` in `apps/web/src/config/shopifyApiVersion.ts`.

- Performance on PRs: `.github/workflows/performance.yml`
  - Builds `@jazm/web`, starts the server, waits for port 3000, then runs Lighthouse CI using `.lighthouserc.json`.
  - Uploads results to temporary public storage and attaches artifacts.

- Nightly performance: `.github/workflows/performance-nightly.yml`
  - Nightly cron + manual dispatch. Tests multiple embedded routes with `.lighthouserc.nightly.json` (stricter thresholds).

## Lighthouse Configuration

- `.lighthouserc.json`: desktop preset, asserts performance category ≥ 0.8, LCP ≤ 3s, CLS ≤ 0.1, INP ≤ 200ms.
- `.lighthouserc.nightly.json`: tightened thresholds (performance ≥ 0.9, LCP ≤ 2.5s).

## App Bridge & UI

- Hook: `useAB` wraps common App Bridge calls (toast.show, loading, modal.show/hide).
- Title bar: `PageTitleBar` composes App Bridge `<TitleBar>` with actions (uses App‑Bridge‑types JSX augmentation for button variants and breadcrumbs).
- Host guard: `HostGuard.client.tsx` ensures `host`/`shop` query params persist across navigation and stores them in `sessionStorage` via `lib/host.ts`.
- Web Vitals: `WebVitalsReporterAB.client.tsx` listens to App Bridge `webVitals.onReport` in development.

## Environment Configuration

Create `apps/web/.env.local` with Shopify and database settings. Example:

```env
# Public (safe to expose to the browser)
NEXT_PUBLIC_SHOPIFY_API_KEY=<your_app_api_key>

# Server-side
SHOPIFY_API_KEY=<your_app_api_key>
SHOPIFY_API_SECRET=<your_app_api_secret>
SHOPIFY_APP_URL=https://<your-dev-tunnel-or-domain>
SHOPIFY_SCOPES=read_orders,read_products,read_customers

# Postgres (e.g., Neon/Supabase/Cloud SQL)
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
DIRECT_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

Notes:

- `DATABASE_URL` and `DIRECT_URL` are required by Prisma (datasource in `schema.prisma`).
- Only `NEXT_PUBLIC_*` values are exposed to the browser.

## Local Development

Prerequisites

- Node 22.x (enforced via `engines`)
- PNPM 9 (`corepack enable` or `npm i -g pnpm@9`)
- Shopify CLI (`npm i -g @shopify/cli@latest`), Partner account, dev store
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
# Uses shopify.app.toml (auto-updates URLs) and shopify.web.toml (dev/build commands)
```

Direct Next.js dev (without CLI tunnel)

```bash
pnpm -w --filter @jazm/web dev
```

Type-check and lint

```bash
pnpm check-types
pnpm lint
```

## HTTP Interfaces

- `POST /api/auth/exchange`
  - Headers: `Authorization: Bearer <session_token_from_App_Bridge>`
  - Response: `{ ok: true }` on success
  - Code: `apps/web/src/app/api/auth/exchange/route.ts`

- `POST /api/webhooks/app-uninstalled`
  - Headers: `x-shopify-shop-domain`, `x-shopify-hmac-sha256`, etc.
  - Response: `{ ok: true }`
  - Code: `apps/web/src/app/api/webhooks/app-uninstalled/route.ts`

GDPR topics are configured; add `/api/webhooks/gdpr` to process compliance events.

## Security

- CSP: dynamic per‑shop `frame-ancestors` via `apps/web/middleware.ts` (falls back to `'none'` if no valid shop).
- OAuth: exchange transient session tokens for durable offline tokens server‑side only.
- Secrets: keep only safe values under `NEXT_PUBLIC_*`.
- Webhooks: validate HMAC (`verifyShopifyHmac.ts`).

## Scripts

Root:

- `pnpm dev` — run all dev servers via Turbo
- `pnpm build` — build all apps/packages
- `pnpm check-types` — TypeScript across workspaces
- `pnpm lint` — ESLint across workspaces
- `pnpm format` — Prettier formatting

Web app:

- `pnpm --filter @jazm/web dev|build|start`
- `pnpm --filter @jazm/web shopify:dev`

DB package:

- `pnpm -F @jazm/db db:gen|db:apply|db:new|db:pull|db:studio`

## Documentation & Policies

- ADR: `docs/adr/ADR-0001-graphql-only-and-versioning.md` (GraphQL‑only, quarterly versioning).
- Navigation: `docs/navigation/top-level-policy.md` (use `shopify://` top‑level navigation when leaving the iframe).

## Troubleshooting

- Shopify CLI version: `npm i -g @shopify/cli@latest`.
- Module not found `@jazm/db/...`: ensure `@jazm/db` is depended by the web app and `transpilePackages: ['@jazm/db']` is set.
- Database connection: ensure `DATABASE_URL`/`DIRECT_URL` are present and reachable.
- Blank iframe in Admin: confirm `NEXT_PUBLIC_SHOPIFY_API_KEY`, CSP config, app install, and `application_url`.

---

Maintained by the JAZM team.
