<div align="center">

# JAZM Monorepo — Shopify App (AI Logistics Copilot)

AI‑powered logistics copilot for Shopify merchants. Built as an embedded Shopify app with Next.js 15, Polaris, and App Bridge, organized in a Turborepo monorepo.

</div>

## At a Glance

- Monorepo managed by Turborepo and PNPM workspaces
- Embedded Shopify Admin UI using App Bridge and Polaris
- Next.js App Router, React 19, Turbopack dev/build
- Strict TypeScript, shared ESLint/TS configs, internal UI package
- CSP hardened to allow embedding only inside Shopify Admin

---

## Repository Structure

```
.
├─ apps/
│  ├─ web/                     # Embedded Shopify Admin app (Next.js)
│  │  ├─ src/app/              # Next.js App Router routes
│  │  │  ├─ layout.tsx         # App Bridge + Polaris provider, CSP relies on next.config
│  │  │  ├─ page.tsx           # Home
│  │  │  ├─ dashboard/page.tsx # Dashboard
│  │  │  ├─ analytics/page.tsx # Analytics
│  │  │  ├─ products/page.tsx  # Products
│  │  │  ├─ customers/page.tsx # Customers
│  │  │  ├─ notifications/page.tsx # Notifications
│  │  │  └─ settings/page.tsx  # Settings
│  │  ├─ next.config.ts        # CSP header (frame-ancestors Shopify Admin)
│  │  ├─ shopify.app.toml      # Shopify CLI app metadata
│  │  └─ shopify.web.toml      # Shopify CLI web process config
│  └─ api/                     # Placeholder for future backend/API
├─ packages/
│  ├─ ui/                      # Shared React UI primitives
│  ├─ eslint-config/           # Shared ESLint config
│  └─ typescript-config/       # Shared tsconfig presets
├─ turbo.json                  # Turborepo task pipeline
├─ pnpm-workspace.yaml         # Workspace packages
└─ package.json                # Root scripts (dev, build, lint, types)
```

## Tech Stack

- Next.js: 15.x (App Router) with Turbopack for dev/build
- React: 19.x
- Shopify: App Bridge React 4.x, Polaris 13.x
- Tooling: Turborepo, PNPM 9, TypeScript 5, ESLint 9, Prettier 3

## Shopify Embedding

- App Bridge script is loaded in the global layout and the Shopify API key is exposed via a meta tag for App Bridge initialization.
  - See: `apps/web/src/app/layout.tsx`
- CSP limits embedding to Shopify Admin domains to prevent click‑jacking.
  - See: `apps/web/next.config.ts`

## App Routes (UI)

- `/` Home
- `/dashboard` Dashboard
- `/analytics` Analytics
- `/products` Products
- `/customers` Customers
- `/notifications` Notifications
- `/settings` Settings

All pages use Shopify Polaris components and are currently scaffolded with placeholders for upcoming analytics and operations.

## Packages

- `@repo/ui`: Small shared UI primitives (`Button`, `Card`, `Code`).
- `@repo/eslint-config`: Centralized ESLint config (TypeScript, Next.js, Prettier compatible).
- `@repo/typescript-config`: Shared tsconfig presets for apps and libraries.

## Getting Started

Prerequisites:

- Node.js >= 18
- PNPM 9 (`corepack enable` or `npm i -g pnpm@9`)
- Shopify Partner account + dev store (for embedding/testing)
- Shopify CLI (optional but recommended): `npm i -g @shopify/cli` and `shopify login`

Install dependencies (root):

```bash
pnpm install
```

Run all apps in dev (Turbo orchestrates):

```bash
pnpm dev
```

Run only the web app:

```bash
pnpm --filter @jazm/web dev
# or
turbo run dev --filter=@jazm/web
```

Type checking, linting, formatting:

```bash
pnpm check-types
pnpm lint
pnpm format
```

Build & run:

```bash
pnpm build
pnpm --filter @jazm/web start
```

## Shopify Dev Workflow

The repository contains Shopify CLI configuration for the embedded app in `apps/web/`.

- `apps/web/shopify.app.toml` sets metadata: app name, `client_id` (API key), `application_url` (dev tunnel), scopes, and OAuth redirect URLs.
- `apps/web/shopify.web.toml` defines the frontend role and maps the OAuth callback to `/api/auth/callback` (route to be implemented).

Recommended dev flow (with Shopify CLI):

```bash
cd apps/web
shopify app dev
# CLI will start a tunnel, update URLs (automatically_update_urls_on_dev = true),
# and run `pnpm dev` as defined in shopify.web.toml
```

Notes:

- Ensure your Shopify app’s API key is available to the client as `NEXT_PUBLIC_SHOPIFY_APP_KEY`.
- The OAuth callback path `/api/auth/callback` is referenced by `shopify.web.toml` but not implemented yet in the Next.js app; add it before enabling OAuth flows.
- When deploying, update `application_url` and `redirect_urls` in `shopify.app.toml` to match production.

## Configuration & Environment

Environment variables used by the web app:

- `NEXT_PUBLIC_SHOPIFY_APP_KEY`: Public Shopify App API key exposed to the client for App Bridge. Place in `apps/web/.env.local` during development.

Other configuration files:

- `apps/web/next.config.ts`: Adds CSP header to allow framing only inside Shopify Admin (`frame-ancestors https://admin.shopify.com https://*.myshopify.com`).
- `apps/web/tsconfig.json`: Path alias `@/*` → `apps/web/src/*`.
- `turbo.json`: Defines pipelines for `build`, `dev`, `lint`, `check-types`.

## Architecture Overview

```
           ┌───────────────────────────── Monorepo (Turborepo) ─────────────────────────────┐
           │                                                                                │
           │  apps/web (Next.js App Router)                                                 │
           │   ├─ layout.tsx → App Bridge <script> + <meta shopify-api-key> + Polaris       │
           │   ├─ pages (Dashboard, Analytics, Products, Customers, Notifications, Settings)│
           │   └─ next.config.ts → CSP frame-ancestors (Shopify Admin only)                 │
           │                                                                                │
           │  apps/api (placeholder)                                                        │
           │                                                                                │
           │  packages/ui → shared React primitives (Button, Card, Code)                    │
           │  packages/eslint-config → shared lint rules                                    │
           │  packages/typescript-config → shared tsconfig presets                          │
           └────────────────────────────────────────────────────────────────────────────────┘
```

## Security Hardening

- Embedding restricted via CSP `frame-ancestors` to Shopify Admin domains.
- Avoid committing secrets. Keep secrets in `.env.local` (ignored) and use `NEXT_PUBLIC_` only for safe public values.
- App Bridge key is public by design; do not expose API secrets to the browser.

## Common Scripts

Root-level scripts (orchestrated with Turbo):

- `pnpm dev` — Run all dev servers
- `pnpm build` — Build all apps/packages
- `pnpm lint` — Lint all workspaces
- `pnpm check-types` — Type-check across workspaces
- `pnpm format` — Prettier formatting

Web app scripts:

- `pnpm --filter @jazm/web dev` — Next.js dev (Turbopack)
- `pnpm --filter @jazm/web build` — Next.js build
- `pnpm --filter @jazm/web start` — Next.js start

## Roadmap

- Implement OAuth flow and `/api/auth/callback` endpoint
- Add server-side app/backend in `apps/api` for secure Shopify calls & webhooks
- RTO analytics, dashboards, notifications, and product/customer insights
- Tests, CI, and deployment guides (Vercel or custom infra)

## Troubleshooting

- Blank iframe in Shopify Admin: confirm `NEXT_PUBLIC_SHOPIFY_APP_KEY` and CSP header; ensure the app is installed in the dev store and `application_url` is reachable.
- Navigation issues: App Bridge `NavMenu` requires valid relative links; verify routes exist under `src/app`.
- Styling: Polaris styles are imported globally in `layout.tsx`.

---

Maintained by the JAZM team. Contributions and issues are welcome.
