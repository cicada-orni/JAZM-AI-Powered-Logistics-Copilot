# Webhook Operations Runbook (Week 5)

_Last updated: 2025-09-28_

## 1. Prerequisites

- `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL`, and `DATABASE_URL` set in the environment
- PostgreSQL reachable (Neon/Prisma) unless running in dry-run mode (`WEBHOOKS_REPORT_DRY_RUN=1`)
- Admin API version pinned to `2025-07`

## 2. Quick status commands

```bash
pnpm --filter @jazm/web test:unit
pnpm --filter @jazm/db test
WEBHOOKS_REPORT_DRY_RUN=1 pnpm --filter @jazm/web webhooks:report
pnpm --filter @jazm/web jobs:worker   # Ctrl+C to stop
```

## 3. Manual webhook replay

1. `pnpm shopify webhook trigger APP_UNINSTALLED --topic app/uninstalled --api-version 2025-07`
2. `pnpm shopify webhook trigger GDPR_SHOP_REDACT --topic shop/redact --api-version 2025-07`
3. Confirm console logs (`webhook.delivery` / `webhook.job`) and DB entries (`webhook_jobs`, `webhook_deliveries`)

## 4. Incident response

- **Invalid HMAC:** verify `SHOPIFY_API_SECRET`, confirm raw-body parser intact
- **Version drift:** audit `api version drift` warnings; repin `shopify.app.toml`
- **Queue backlog:** `SELECT * FROM webhook_jobs WHERE status IN ('pending','processing') ORDER BY due_at;`
- **GDPR SLA breach:** `SELECT * FROM webhook_jobs WHERE due_at < now();` and escalate for manual processing

## 5. Deployment checklist

- `pnpm --filter @jazm/web build` (set `WEBHOOKS_REPORT_DRY_RUN=1` if no DATABASE_URL)
- `WEBHOOKS_REPORT_DRY_RUN=1 pnpm --filter @jazm/web webhooks:report` and attach to PR
- Confirm `shopify.app.toml` matches matrix topics/API version
- Capture `/settings/webhooks/health` screenshot for release notes
