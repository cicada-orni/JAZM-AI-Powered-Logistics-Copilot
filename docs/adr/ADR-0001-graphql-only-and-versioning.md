# ADR-0001: GraphQL-only Admin API & Versioning Cadence

Date: 2025-09-11
Status: Accepted

## Context

- Shopify marks the REST Admin API as **Legacy** as of 2024-10-01. New apps should use the GraphQL Admin API.  
  Sources: https://shopify.dev/docs/apps/build/graphql/migrate/learn-how , https://shopify.dev/docs/apps/build/graphql/migrate/libraries
- Shopify requires **explicit API versioning**. We must pin a stable Admin API version and roll quarterly.  
  Source: https://shopify.dev/docs/api/usage/versioning

## Decision

1. **GraphQL-only** for all Admin operations. No REST usage in new code.
2. A single constant `SHOPIFY_ADMIN_API_VERSION` (initially `2025-07`) is the only place the version string may appear.
3. All Admin GraphQL calls must use the official client initialized with domain + version + token.
4. CI enforces:
   - No REST Admin API references.
   - No hard-coded Admin API versions outside the config.

## Consequences

- Reduced breakage releases; clear quarterly upgrade motion.
- Faster access to new features (GraphQL-first).
- Easier auditing of API usage and costs (GraphQL `extensions.cost`).

## Roll-forward plan

- Review Shopify release notes monthly; evaluate upgrading to the next stable each quarter.
- When upgrading, change the single constant and run smoke + integration tests.
