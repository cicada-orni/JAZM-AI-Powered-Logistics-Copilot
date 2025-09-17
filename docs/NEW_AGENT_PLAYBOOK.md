# JAZM New Agent Playbook (Week 4 Context)

This playbook bootstraps a brand‑new chat/agent so it can work in this repo with the same rules and workflow we established. It explains where to read, how to ground with local RAG, how to follow weekly plans, and how to avoid deprecated patterns.

---

## Objectives

- Operate with the same non‑negotiable standards (no deprecated patterns, GraphQL‑only Admin, version pinning, tests/observability).
- Ground answers in this repo’s documents via local RAG before proposing changes.
- Follow the weekly plan (Week 4 in progress) and produce daily implementation docs instead of dumping plans in chat.

---

## Read First (Single Source Docs)

- `AGENTS.md` (repo root)
  - Global system preamble and operating rules.
  - Addendum A — Mentor Operating Protocol: When the user requests teaching/step‑by‑step, use Why → How → What with verification first, small units, and no deprecated code.
- `docs/rag/plan/week_04_guidlines.md`
  - Week‑4 anti‑deprecation brief: GraphQL Admin only, version pinned, Relay pagination ≤ 250, cost/throttleStatus based rate‑limit handling, Bulk Ops for large datasets, scopes discipline, runtime scope checks.

---

## Grounding With Local RAG

- Index content (fast):
  - `pnpm rag:index` → creates `docs/rag/.index/rag_index.json`
- Search (pretty):
  - `pnpm rag:search -- "your query here"`
  - JSON output: `pnpm rag:search --json -- "your query here"`
- What’s indexed:
  - `docs/rag/knowledge/**` and `docs/rag/plan/**` (including Week‑4 guidelines and the product dossier).
- Use: Cite files/anchors (e.g., `docs/rag/plan/week_04_guidlines.md#non-negotiables`) when grounding decisions.

---

## Weekly Plan (Week 4) — Files to Read

- `weekly/week-04/PLAN.md`: goals, phases, deliverables.
- `weekly/week-04/SCOPE.md`: scopes policy (SSOT is `.env.local` → `SHOPIFY_SCOPES`, mirror in `apps/web/shopify.app.toml`), runtime check with `currentAppInstallation.accessScopes`.
- `weekly/week-04/PAGINATION.md`: Relay connections, page size ≤ 250, cost handling, bulk thresholds.
- `weekly/week-04/LAYOUT.md`: file layout, helpers, bulk/health/logging modules.
- `weekly/week-04/TESTING.md`: unit/integration plans; page size and throttle guardrails.
- `weekly/week-04/ACCEPTANCE.md`: what “done this week” means.
- Day implementations live under `weekly/week-04/implementation/` (day‑1.md, day‑2.md, …): these are the only places where new daily plans should be written.

---

## Current Code Map (Shopify GraphQL)

- `apps/web/src/lib/shopify-graphql/pagination.ts`
  - Async generator `iterateConnection` for Relay pagination with hard cap ≤ 250 and cost‑aware backoff (uses `extensions.cost.throttleStatus`).
  - Unknown→narrowing helpers; surfaces first GraphQL error message when present.
- `apps/web/src/lib/shopify-graphql/orders.ts`
  - Reader for recent paid orders; narrow fields; uses iterator.
- `apps/web/src/lib/shopify-graphql/customers.ts`
  - Reader for customers using modern fields (no deprecated `email`/`phone`). Uses `defaultEmailAddress { emailAddress }` and `defaultPhoneNumber { phoneNumber }`.
- `apps/web/src/lib/shopify-graphql/products.ts`
  - Reader for products (id, title, handle, status, updatedAt) with iterator.
- `apps/web/src/lib/shopify-graphql/health.ts`
  - Runtime scope check via `currentAppInstallation { accessScopes { handle } }`.
- `apps/web/src/lib/shopify-graphql/logging.ts`
  - On‑page structured logger for cost/throttle telemetry.
- `apps/web/src/lib/shopify-graphql/bulk.ts`
  - Start/poll Bulk read (strictly typed; no `any`),

---

## Non‑Deprecation Mandate (Essentials)

- GraphQL Admin only; no new REST Admin calls.
- Version pinned (current: `ApiVersion.July25`, maps to `2025‑07`).
- Relay pagination only; page size ≤ 250; avoid offset pagination; minimize field selections.
- Rate limits by query cost and `throttleStatus`; never hardcode bucket math.
- Use Bulk Operations for large reads/writes; JSONL download for reads.
- Scopes:
  - SSOT: `.env.local` → `SHOPIFY_SCOPES` (mirror string in `apps/web/shopify.app.toml`).
  - Verify at runtime via `currentAppInstallation.accessScopes`.
  - `read_all_orders` only if >60‑day orders are required (approval needed).
- Customers API fields: use `defaultEmailAddress` / `defaultPhoneNumber` (not deprecated `email`/`phone`).
- Security: no secrets client‑side; server‑side keys only; never print secrets.

---

## Daily Workflow (What New Agent Must Do)

1. Align and ground

- Read `AGENTS.md` and Addendum A (Mentor Mode) — follow Why → How → What with verification first.
- Run `pnpm rag:index` and search `pnpm rag:search -- "week 4 pagination"` or similar to recap.
- Read `weekly/week-04/*` (PLAN/SCOPE/PAGINATION/LAYOUT/TESTING/ACCEPTANCE) and the previous `implementation/day-*.md` before writing today’s plan.

2. Produce today’s implementation plan as a doc (not in chat)

- Create `weekly/week-04/implementation/day-N.md`.
- Include: goals, exact file paths to add/update, full code blocks, and run/verify steps.
- Verify against official docs (network is enabled). Add minimal links at the top of the day file.

3. Scope & configuration

- Keep scopes minimal; update `.env.local` `SHOPIFY_SCOPES` (SSOT) and mirror in `shopify.app.toml`.
- Do not add write scopes unless a concrete workflow is approved.

4. Implement with safe patterns only

- Readers: use `iterateConnection` with ≤ 250 page size; small field selections; handle `extensions.cost`.
- Bulk: prefer for large jobs; use run → poll → JSONL stream.
- No deprecated fields (e.g., customers’ email/phone); confirm current schema.

5. Test & validate

- Build web app: `pnpm -w --filter @jazm/web build`.
- Optional dev probe: set `DEV_GRAPHQL_PROBE_ENABLED=true`, then `GET /api/dev/graphql-probe?shop=<domain>`; check returned scopes and first‑page counts.
- If errors: read returned JSON `{ error, message }` and fix scopes/token/install/query shape accordingly.

6. Observability

- Use `createOnPageLogger(resource)` to log `{ page, items, requestedQueryCost, actualQueryCost, currentlyAvailable, restoreRate }` per page.
- Keep logs small and structured.

---

## Quick Commands

- Index RAG: `pnpm rag:index`
- Search RAG: `pnpm rag:search -- "makani whatsapp risk score"`
- Build web: `pnpm -w --filter @jazm/web build`
- Dev‑only probe: `.env.local → DEV_GRAPHQL_PROBE_ENABLED=true`, then `GET /api/dev/graphql-probe?shop=<domain>`

---

## Acceptance for the New Agent

- Reads and respects `AGENTS.md` + Addendum A and Week‑4 guidelines.
- Always grounds with local RAG and official docs before proposing code.
- Writes daily implementation plans as files under `weekly/week-04/implementation/` with full code and verify steps.
- Uses GraphQL Admin only, version pin, Relay pagination ≤ 250, cost‑aware throttle, Bulk for large sets, modern Customer fields, and runtime scope checks.
- Avoids deprecated patterns and avoids `any` in new TypeScript code; narrow `unknown` safely.

---

If you need an example, open `weekly/week-04/implementation/day-1.md` through `day-4.md` for style and content. This playbook should accompany any new chat so they follow the exact workflow without re‑negotiation.
