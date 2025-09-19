ranaf@Faisal MINGW64 ~/Desktop/jazm-monorepo (graphql-policy)
$ pnpm --filter @jazm/web test:unit

> @jazm/web@0.1.0 test:unit C:\Users\ranaf\Desktop\jazm-monorepo\apps\web
> vitest run --config vitest.config.ts

RUN v3.2.4 C:/Users/ranaf/Desktop/jazm-monorepo/apps/web

❯ src/lib/shopify-graphql/**tests**/errors.test.ts (6 tests | 1 failed) 11ms
× classifyGraphQLError > returns protected_customer_data with docs link when message matches PCD patterns 8ms
→ expected 'unknown' to be 'protected_customer_data' // Object.is equality
✓ classifyGraphQLError > returns missing_scope when message indicates missing access scope 0ms
✓ classifyGraphQLError > returns throttled when extensions.code includes THROTTLED 0ms
✓ classifyGraphQLError > falls back to unknown when no patterns match 0ms
✓ ShopifyGraphQLRequestError helpers > creates and detects typed errors 0ms
✓ ShopifyGraphQLRequestError helpers > guards against generic errors 0ms
❯ src/lib/shopify-graphql/**tests**/pagination.coerce.test.ts (3 tests | 1 failed) 9ms
✓ coerceGraphQLResponse > returns data when payload contains data without errors 1ms
× coerceGraphQLResponse > throws a typed error when errors are present 6ms
→ expected 'unknown' to be 'protected_customer_data' // Object.is equality
✓ coerceGraphQLResponse > throws for invalid payload shapes 1ms

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 2 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

FAIL e2e/example.spec.ts [ e2e/example.spec.ts ]
Error: Playwright Test did not expect test() to be called here.
Most common reasons include:

- You are calling test() in a configuration file.
- You are calling test() in a file that is imported by the configuration file.
- You have two different versions of @playwright/test. This usually happens
  when one of the dependencies in your package.json depends on @playwright/test.
  ❯ TestTypeImpl.\_currentSuite ../../node_modules/.pnpm/playwright@1.55.0/node_modules/playwright/lib/common/testType.js:74:13
  ❯ TestTypeImpl.\_createTest ../../node_modules/.pnpm/playwright@1.55.0/node_modules/playwright/lib/common/testType.js:87:24
  ❯ ../../node_modules/.pnpm/playwright@1.55.0/node_modules/playwright/lib/transform/transform.js:275:12
  ❯ e2e/example.spec.ts:3:1
  1| import { test, expect } from '@playwright/test';
  2|
  3| test('has title', async ({ page }) => {
  | ^
  4| await page.goto('https://playwright.dev/');
  5|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

FAIL tests-examples/demo-todo-app.spec.ts [ tests-examples/demo-todo-app.spec.ts ]
Error: No test suite found in file C:/Users/ranaf/Desktop/jazm-monorepo/apps/web/tests-examples/demo-todo-app.spec.ts
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

FAIL src/lib/shopify-graphql/**tests**/errors.test.ts > classifyGraphQLError > returns protected_customer_data with docs link when message matches PCD patterns
AssertionError: expected 'unknown' to be 'protected_customer_data' // Object.is equality

Expected: "protected_customer_data"
Received: "unknown"

❯ src/lib/shopify-graphql/**tests**/errors.test.ts:17:29
15| }
16| const classified = classifyGraphQLError(payload)
17| expect(classified.kind).toBe('protected_customer_data')
| ^
18| expect(classified.docsUrl).toBe(
19| 'https://shopify.dev/docs/apps/launch/protected-customer-data'

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

FAIL src/lib/shopify-graphql/**tests**/pagination.coerce.test.ts > coerceGraphQLResponse > throws a typed error when errors are present
AssertionError: expected 'unknown' to be 'protected_customer_data' // Object.is equality

Expected: "protected_customer_data"
Received: "unknown"

❯ src/lib/shopify-graphql/**tests**/pagination.coerce.test.ts:26:26
24| expect(isShopifyGraphQLRequestError(err)).toBe(true)
25| if (isShopifyGraphQLRequestError(err)) {
26| expect(err.kind).toBe('protected_customer_data')
| ^
27| }
28| }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

Test Files 4 failed (4)
Tests 2 failed | 7 passed (9)
Start at 21:34:45
Duration 1.19s (transform 151ms, setup 0ms, collect 383ms, tests 20ms, environment 1ms, prepare 1.17s)

C:\Users\ranaf\Desktop\jazm-monorepo\apps\web:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @jazm/web@0.1.0 test:unit: `vitest run --config vitest.config.ts`
Exit status 1

ranaf@Faisal MINGW64 ~/Desktop/jazm-monorepo (graphql-policy)
$ pnpm --filter @jazm/web test:unit

> @jazm/web@0.1.0 test:unit C:\Users\ranaf\Desktop\jazm-monorepo\apps\web
> vitest run --config vitest.config.ts

RUN v3.2.4 C:/Users/ranaf/Desktop/jazm-monorepo/apps/web

❯ src/lib/shopify-graphql/**tests**/errors.test.ts (6 tests | 1 failed) 11ms
× classifyGraphQLError > returns protected_customer_data with docs link when message matches PCD patterns 8ms
→ expected 'unknown' to be 'protected_customer_data' // Object.is equality
✓ classifyGraphQLError > returns missing_scope when message indicates missing access scope 0ms
✓ classifyGraphQLError > returns throttled when extensions.code includes THROTTLED 0ms
✓ classifyGraphQLError > falls back to unknown when no patterns match 0ms
✓ ShopifyGraphQLRequestError helpers > creates and detects typed errors 0ms
✓ ShopifyGraphQLRequestError helpers > guards against generic errors 0ms
❯ src/lib/shopify-graphql/**tests**/pagination.coerce.test.ts (3 tests | 1 failed) 9ms
✓ coerceGraphQLResponse > returns data when payload contains data without errors 1ms
× coerceGraphQLResponse > throws a typed error when errors are present 6ms
→ expected 'unknown' to be 'protected_customer_data' // Object.is equality
✓ coerceGraphQLResponse > throws for invalid payload shapes 1ms

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 2 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

FAIL e2e/example.spec.ts [ e2e/example.spec.ts ]
Error: Playwright Test did not expect test() to be called here.
Most common reasons include:

- You are calling test() in a configuration file.
- You are calling test() in a file that is imported by the configuration file.
- You have two different versions of @playwright/test. This usually happens
  when one of the dependencies in your package.json depends on @playwright/test.
  ❯ TestTypeImpl.\_currentSuite ../../node_modules/.pnpm/playwright@1.55.0/node_modules/playwright/lib/common/testType.js:74:13
  ❯ TestTypeImpl.\_createTest ../../node_modules/.pnpm/playwright@1.55.0/node_modules/playwright/lib/common/testType.js:87:24
  ❯ ../../node_modules/.pnpm/playwright@1.55.0/node_modules/playwright/lib/transform/transform.js:275:12
  ❯ e2e/example.spec.ts:3:1
  1| import { test, expect } from '@playwright/test';
  2|
  3| test('has title', async ({ page }) => {
  | ^
  4| await page.goto('https://playwright.dev/');
  5|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

FAIL tests-examples/demo-todo-app.spec.ts [ tests-examples/demo-todo-app.spec.ts ]
Error: No test suite found in file C:/Users/ranaf/Desktop/jazm-monorepo/apps/web/tests-examples/demo-todo-app.spec.ts
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

FAIL src/lib/shopify-graphql/**tests**/errors.test.ts > classifyGraphQLError > returns protected_customer_data with docs link when message matches PCD patterns
AssertionError: expected 'unknown' to be 'protected_customer_data' // Object.is equality

Expected: "protected_customer_data"
Received: "unknown"

❯ src/lib/shopify-graphql/**tests**/errors.test.ts:17:29
15| }
16| const classified = classifyGraphQLError(payload)
17| expect(classified.kind).toBe('protected_customer_data')
| ^
18| expect(classified.docsUrl).toBe(
19| 'https://shopify.dev/docs/apps/launch/protected-customer-data'

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

FAIL src/lib/shopify-graphql/**tests**/pagination.coerce.test.ts > coerceGraphQLResponse > throws a typed error when errors are present
AssertionError: expected 'unknown' to be 'protected_customer_data' // Object.is equality

Expected: "protected_customer_data"
Received: "unknown"

❯ src/lib/shopify-graphql/**tests**/pagination.coerce.test.ts:41:26
39| // Because the guard passed, we can safely check the 'kind' property.
40| if (isShopifyGraphQLRequestError(err)) {
41| expect(err.kind).toBe('protected_customer_data')
| ^
42| }
43| }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯

Test Files 4 failed (4)
Tests 2 failed | 7 passed (9)
Start at 21:36:59
Duration 1.12s (transform 150ms, setup 0ms, collect 358ms, tests 19ms, environment 1ms, prepare 1.29s)

C:\Users\ranaf\Desktop\jazm-monorepo\apps\web:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @jazm/web@0.1.0 test:unit: `vitest run --config vitest.config.ts`
Exit status 1
