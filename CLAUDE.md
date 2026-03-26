# CLAUDE.md

Instructions for AI agents working in this repository.

## Stack

- Bun `1.3.9` monorepo with hoisted installs.
- Next.js `16.0.7` + React `19` (app router, RSC, server actions).
- tRPC v11 (route handler + React Query client).
- Supabase auth/session (`@supabase/ssr`).
- PostgreSQL + Drizzle ORM `0.44.7`.
- Tailwind CSS v4 + Radix UI + Sonner toasts via `@mino/ui`.
- Zod `4.3.5` + `@t3-oss/env-nextjs` for validation.
- TypeScript `5.8.2`, ESLint, Prettier configs in `tooling/`.

## Packages

| Package | Purpose |
|---------|---------|
| `apps/web/client` | Next.js web app (routes, tRPC API, auth) |
| `apps/web/preload` | DOM processing & style extraction for the editor (runs in iframe) |
| `apps/backend/supabase` | Supabase config + SQL migrations |
| `packages/db` | Drizzle schema, client, defaults, migrations |
| `packages/models` | Shared domain types/enums (`Project`, `SignInMethod`, `SandboxProvider`, `SandboxFile`) |
| `packages/code-provider` | Abstract sandbox provider (CodeSandbox + NodeFs implementations) |
| `packages/ui` | Shared UI components (Radix, icons, select, skeleton) |
| `packages/utility` | Helpers (date, file, folder, id, token, name parsing) |
| `tooling/eslint` | Shared ESLint presets |
| `tooling/typescript` | Shared TS configs (base, next-react, vite-react) |
| `tooling/prettier` | Shared Prettier config |

## Key App Paths

- `src/proxy.ts` — Next.js 16 request proxy (session refresh, auth redirects). **Not** `middleware.ts`.
- `src/app/login/` — Login page + server actions (OAuth/dev).
- `src/app/auth/callback/` — OAuth code exchange + user upsert.
- `src/app/projects/` — Protected projects list (CRUD, filtering, sandbox creation).
- `src/app/project/[id]/` — Project editor page.
- `src/server/api/trpc.ts` — tRPC context (`db`, `supabase`, `user`), `publicProcedure`, `protectedProcedure`.
- `src/server/api/routers/` — `user/`, `project/` (project, branch, sandbox, github).
- `src/utils/supabase/` — Browser/server/middleware Supabase clients.

All paths relative to `apps/web/client/`.

## Auth Flow

`proxy.ts` refreshes session → login via server actions (OAuth/dev) → Supabase redirects to `/auth/callback` → callback exchanges code, upserts user via tRPC server caller → redirect to `/projects`. `protectedProcedure` enforces authenticated user with email. Ownership checks are server-side.

## Scripts

Root:
```bash
bun install / bun run dev / bun run build
bun run lint / bun run format / bun run typecheck / bun run test
bun run db:gen / bun run db:push
```

Web client (`apps/web/client`):
```bash
bun run dev          # next dev --turbo
bun run test         # unit tests (Bun + Happy DOM)
bun run test:e2e     # Playwright e2e (Chrome)
```

Database (`packages/db`):
```bash
bun run db:gen / db:push / db:migrate / db:studio
```

## Testing

- **Unit**: Bun test runner + Happy DOM preload + Testing Library. Tests in `apps/web/client/tests/unit/`.
- **E2E**: Playwright (Chrome, single worker). Tests in `apps/web/client/tests/e2e/`. Requires `MINO_ENV=test` and test Supabase env vars.

## CI

GitHub Actions runs on push/PR: **format → lint → typecheck → test → playwright**. All five must pass.

## Environment

Validated at import-time via `apps/web/client/src/env.ts`. Required: `SUPABASE_DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `NODE_ENV`. Use `SKIP_ENV_VALIDATION` only when truly needed (e.g. tests without env).

## Rules

- Use Bun workspace commands (`--filter`) consistently. No other package managers.
- Do not edit generated output (`.next`, caches, migrations output).
- Keep tRPC auth at procedure level. Enforce ownership server-side.
- Next.js redirects throw special errors — do not log/toast them as failures. Filter via `isRedirectError(...)`.
- `publicProcedure` context must tolerate logged-out users. `AuthSessionMissingError` is normal.
- Keep `onConflictDoUpdate.set` fields explicit — never mutate immutable identity fields.
- `proxy.ts` is the Next.js 16 convention. Do not rename to `middleware.ts`.
- Favor minimal changes. Avoid broad refactors. Keep server/client boundaries explicit.
- Before changing auth/data flow, read: `proxy.ts`, `login/actions.ts`, `auth/callback/route.ts`, `server/api/trpc.ts`, and relevant routers.
- Verify import paths against real file tree before refactors.
- Ensure changed code passes lint/typecheck/tests for touched scope.
