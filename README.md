# jazm-monorepo

Monorepo managed with Turborepo and pnpm. Contains a Next.js (TypeScript) app in `apps/web` and shared packages under `packages/`.

## Requirements

- Node.js >= 18
- pnpm (repo uses `pnpm@9`)

## Getting Started

```bash
# Install dependencies at the workspace root
pnpm -w install

# Start all apps in dev mode via Turbo
pnpm -w dev

# Alternatively, start just the web app
pnpm -C apps/web dev
```

## Workspace Structure

- `apps/web`: Next.js app (TypeScript)
- `packages/ui`: Shared UI library (if present)
- `packages/eslint-config`: Shared ESLint config
- `packages/typescript-config`: Shared TS configs

## Scripts (root)

- `dev`: Runs `turbo run dev` across the workspace
- `build`: Runs `turbo run build`
- `lint`: Runs `turbo run lint`
- `check-types`: Runs `turbo run check-types`
- `format`: Formats the entire repo with Prettier (`prettier --write .`)

## Linting & Formatting

- **ESLint**: The web app uses Next.js ESLint rules and extends `prettier` to disable stylistic conflicts. See `apps/web/.eslintrc.json`.
- **Prettier**: A single config at the repo root (`.prettierrc.json`).
  - `semi: false`
  - `singleQuote: true`
  - `trailingComma: "es5"`
  - `tabWidth: 2`
  - `printWidth: 80`
- **Ignore**: Files and folders excluded from formatting are listed in `.prettierignore` (e.g., `node_modules`, `.next`, `.turbo`, lockfiles).

Run formatting from the root:

```bash
pnpm -w run format
```

## Turborepo

This repository uses Turborepo for task running and caching. Common commands:

```bash
# Run a script in a single project
pnpm -C apps/web build

# Filtered turbo tasks
pnpm exec turbo run build --filter=@jazm/web
```

## Contributing

1. Create a branch
2. Make your changes
3. Run `pnpm -w lint` and `pnpm -w run format`
4. Open a PR

## License

MIT
