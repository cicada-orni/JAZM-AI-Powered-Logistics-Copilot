<div align="center">

# JAZM Monorepo — Shopify AI Logistics Copilot

Production-ready Shopify embedded app built with Next.js 15, React 19, App Bridge, and Polaris inside a Turborepo workspace. Week 4 is complete: GraphQL-only foundation, cost-aware pagination, bulk operations scaffolding, protected customer data handling, and automated lint/build/unit-test CI.

</div>

---

## At a Glance

- **Frameworks:** Next.js 15 (App Router), React 19, TypeScript strict mode
- **Shopify stack:** App Bridge v4, Polaris 13, Admin GraphQL (2025-07), OAuth session → offline exchange
- **Data layer:** Prisma + Postgres (offline tokens & webhook dedupe)
- **GraphQL helpers:** typed admin client, relay paginator with throttle backoff, bulk operation runner, error classifiers
- **Dev tooling:** Turborepo + PNPM 9, Vitest unit harness, Playwright examples, GitHub Actions CI

---

## Repository Layout

`.
├─ apps/
│  └─ web/                       # Embedded Shopify Admin app (Next.js)
│     ├─ next.config.ts          # Transpiles @jazm/db; sets base CSP
│     ├─ middleware.ts           # Per-shop CSP (frame-ancestors)
│     ├─ shopify.app.toml        # App metadata, scopes, webhooks
│     ├─ src/
│     │  ├─ app/
│     │  │  ├─ api/
│     │  │  │  ├─ auth/exchange/route.ts           # Session → offline exchange
│     │  │  │  ├─ dev/graphql-probe/route.ts       # Dev-only scopes + sample data
│     │  │  │  └─ webhooks/app-uninstalled/route.ts
│     │  │  └─ page.tsx                            # Dashboard placeholder
│     │  ├─ components/...
│     │  └─ lib/
│     │     ├─ admin-graphql.ts                    # createAdminApiClient wrapper
│     │     ├─ shopify-graphql/
│     │     │  ├─ pagination.ts                    # iterateConnection + backoff
│     │     │  ├─ orders.ts / customers.ts / products.ts
│     │     │  ├─ bulk.ts                          # startBulkQuery / pollCurrentBulk
│     │     │  ├─ errors.ts                        # classifyGraphQLError helpers
│     │     │  └─ __tests__/… (Vitest specs)
│     │     ├─ host.ts / HostGuard.client.tsx      # Persist host/shop query params
│     │     └─ verifyShopifyHmac.ts                # Webhook signature guard
│     ├─ vitest.config.ts                          # Vitest config (Node + coverage)
│     └─ tests-examples/, e2e/                     # Playwright samples (excluded from Vitest)
├─ packages/
│  └─ db/                         # Prisma client + helpers
│     ├─ prisma/schema.prisma
│     └─ src/
│        ├─ client.ts             # PrismaClient singleton
│        ├─ shopTokens.ts         # upsertShopToken, markUninstalled
│        └─ webhooks.ts           # recordWebhookOnce dedupe
├─ docs/
│  └─ rag/plan/week_04_guidlines.md, knowledge/…
├─ weekly/week-04/implementation/day-1.md … day-7.md
├─ .github/workflows/
│  ├─ graphql-only.yml            # Guard: no REST Admin, single version constant
│  └─ ci-weekly-graphql.yml       # Lint + build + unit tests on PRs (Week 4 close)
└─ package.json, pnpm-workspace.yaml, turbo.json`

---

## Week 4 Deliverables

| Area             | Outcome                                                                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GraphQL client   | getAdminGraphQLClient centralizes createAdminApiClient with ApiVersion.July25.                                                                                                    |
| Pagination       | iterateConnection enforces ≤ 250 nodes, reads extensions.cost.throttleStatus, applies jittered backoff, and exposes onPage telemetry.                                             |
| Resource readers | orders.ts, customers.ts, products.ts compose the iterator with minimal field selections.                                                                                          |
| Bulk operations  | startBulkQuery / pollCurrentBulk provide typed wrappers around Shopify bulk queries.                                                                                              |
| Error handling   | classifyGraphQLError, createShopifyGraphQLRequestError, isShopifyGraphQLRequestError, and coerceGraphQLResponse surface PCD/missing scope/throttle errors with remediation links. |
| Dev probe        | /api/dev/graphql-probe (guarded) returns granted scopes & first-page counts; degrades gracefully when PCD approval is missing.                                                    |
| Testing          | Vitest harness (pnpm --filter @jazm/web test:unit) covers error classifiers & response coercion; coverage stored in pps/web/coverage/unit/.                                       |
| CI               | .github/workflows/ci-weekly-graphql.yml runs lint/build/unit tests on relevant PRs.                                                                                               |

See weekly/week-04/implementation/README.md for the day-by-day log and Week 5 launchpad.

---

## Shopify OAuth & Webhooks

1. **Embedded runtime** – AuthInit.client.tsx requests a session token via App Bridge and POSTs it to /api/auth/exchange.
2. **Session exchange** – pi/auth/exchange/route.ts verifies the token, exchanges for a durable offline token using shopifyApi, and persists it with Prisma.
3. **Durability** – offline tokens live in shops table. The pp/uninstalled webhook (verified by erifyShopifyHmac.ts and deduped via
   ecordWebhookOnce) marks shops uninstalled to prevent stale credentials.
4. **Protected data** – runtime scopes are checked via getGrantedAccessScopes. The dev probe (and future UI) alert when Protected Customer Data approval is missing.

---

## Environment Setup

Create pps/web/.env.local:

`ini
NEXT_PUBLIC_SHOPIFY_API_KEY=xxx
SHOPIFY_API_KEY=xxx
SHOPIFY_API_SECRET=xxx
SHOPIFY_APP_URL=https://<dev-tunnel>
SHOPIFY_SCOPES=read_orders,read_products,read_customers
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
DIRECT_URL=
`

- SHOPIFY_SCOPES is the source of truth (mirrored in shopify.app.toml).
- Only NEXT*PUBLIC*\* variables are exposed to the browser.

---

## Development Workflow

`ash

# Install deps & generate Prisma client

pnpm install
pnpm -F @jazm/db db:gen
pnpm -F @jazm/db db:apply

# Dev server (Shopify CLI recommended)

cd apps/web
pnpm shopify:dev

# or without CLI tunnelling

pnpm --filter @jazm/web dev

# Quality gates

pnpm --filter @jazm/web lint
pnpm --filter @jazm/web build
pnpm --filter @jazm/web test:unit # Vitest
`

Playwright examples live in pps/web/tests-examples and pps/web/e2e; they are excluded from the Vitest run until E2E automation is scheduled.

---

## CI & Governance

- **GraphQL-only guard:** .github/workflows/graphql-only.yml blocks Admin REST usage and enforces a single version constant.
- **Weekly CI:** .github/workflows/ci-weekly-graphql.yml runs lint → build → unit tests on PRs touching Week 4 assets.
- **Legacy Lighthouse audits:** performance.yml / performance-nightly.yml remain for reference; update or disable when front-end UI ships.

---

Maintained by the JAZM team — contributions welcome (run lint/build/test before opening a PR).
