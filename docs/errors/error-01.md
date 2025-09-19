11s
Run pnpm --filter @jazm/web build
pnpm --filter @jazm/web build
shell: /usr/bin/bash -e {0}
env:
PNPM_HOME: /home/runner/setup-pnpm/node_modules/.bin

> @jazm/web@0.1.0 build /home/runner/work/JAZM-AI-Powered-Logistics-Copilot/JAZM-AI-Powered-Logistics-Copilot/apps/web
> next build --turbopack
> ⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
> Attention: Next.js now collects completely anonymous telemetry regarding usage.
> This information is used to shape Next.js' roadmap and prioritize features.
> You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
> https://nextjs.org/telemetry
> ▲ Next.js 15.5.2 (Turbopack)
> Creating an optimized production build ...
> ✓ Finished writing to disk in 22ms
> ✓ Compiled successfully in 4.9s
> Linting and checking validity of types ...
> ./src/app/layout.tsx
> 2:1 Warning: Unused eslint-disable directive (no problems were reported from '@next/next/no-html-link-for-pages').
> ./src/components/auth/AuthInit.client.tsx
> 5:10 Warning: 'done' is assigned a value but never used. @typescript-eslint/no-unused-vars
> ./src/lib/shopify-graphql/**tests**/pagination.coerce.test.ts
> 2:38 Warning: 'GraphQLResponse' is defined but never used. @typescript-eslint/no-unused-vars
> ./src/lib/shopify-graphql/bulk.ts
> 77:3 Warning: Unused eslint-disable directive (no problems were reported from 'no-constant-condition').
> ./src/lib/shopify-graphql/pagination.ts
> 46:6 Warning: 'ShopifyGraphQLClientResponse' is defined but never used. @typescript-eslint/no-unused-vars
> ./src/types/app-bridge-web-components.d.ts
> 4:28 Warning: 'T' is defined but never used. @typescript-eslint/no-unused-vars
> info - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
> Collecting page data ...
> Error: Cannot initialize Shopify API Library. Missing values for: apiSecretKey, apiKey

    at n (.next/server/chunks/_a3698243._.js:4:2503)
    at tQ (.next/server/chunks/_a3698243._.js:250:114)
    at __TURBOPACK__module__evaluation__ (.next/server/chunks/[root-of-the-server]__cad84633._.js:1:309999)
    at instantiateModule (.next/server/chunks/[turbopack]_runtime.js:702:9)
    at instantiateRuntimeModule (.next/server/chunks/[turbopack]_runtime.js:730:12)
    at getOrInstantiateRuntimeModule (.next/server/chunks/[turbopack]_runtime.js:743:12)
    at Object.m (.next/server/chunks/[turbopack]_runtime.js:752:18)
    at Object.<anonymous> (.next/server/app/api/auth/exchange/route.js:7:3)

> Build error occurred
> [Error: Failed to collect page data for /api/auth/exchange] {
> type: 'Error'
> }
> /home/runner/work/JAZM-AI-Powered-Logistics-Copilot/JAZM-AI-Powered-Logistics-Copilot/apps/web:
>  ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @jazm/web@0.1.0 build: `next build --turbopack`
> Exit status 1
> Error: Process completed with exit code 1.
