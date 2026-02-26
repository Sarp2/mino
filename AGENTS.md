# AGENTS.md

This document is for code agents working in this repository. It summarizes how the codebase is organized, how to run it safely, and what to prioritize when making changes.

## Stack

- Monorepo workspace managed by Bun (`bun@1.3.1`), with hoisted installs.
- Frontend app: Next.js `16.0.7` + React `19`.
- API layer: tRPC v11 (Next route handler + React/RSC clients).
- Auth/session: Supabase (`@supabase/ssr`, `@supabase/supabase-js`).
- Database: PostgreSQL + Drizzle ORM + Drizzle Kit.
- Styling/UI: Tailwind CSS v4 + shared `@mino/ui` package + Sonner toasts.
- Validation/env: Zod + `@t3-oss/env-nextjs`.
- Testing: Bun test runner, Happy DOM preload, Testing Library.
- Lint/format/type safety: ESLint, TypeScript shared configs in `tooling/`.

## Folder Structure

Top-level:

- `apps/web/client`: Main Next.js web app (app router).
- `apps/backend/supabase`: Local Supabase config + SQL migrations output.
- `packages/db`: Drizzle schema, DB client, seed constants, migration config.
- `packages/models`: Shared domain enums/types (e.g. sign-in methods).
- `packages/utility`: Shared helpers (e.g. name parsing).
- `packages/ui`: Shared UI components and utilities.
- `tooling/eslint`: Shared ESLint presets.
- `tooling/typescript`: Shared TypeScript presets.

Important app paths:

- `apps/web/client/src/app/*`: Routes, pages, server actions, auth callback.
- `apps/web/client/src/server/api/*`: tRPC context/router/procedures.
- `apps/web/client/src/utils/supabase/*`: Browser/server/middleware clients.
- `apps/web/client/src/proxy.ts`: Next.js 16 proxy file (auth gating).
- `apps/web/client/tests/unit/*`: Current UI/context unit tests.

## Architecture

High-level request flow:

1. `src/proxy.ts` runs on requests, refreshes Supabase session, redirects for auth/public/protected paths.
2. UI uses server actions (`src/app/login/actions.ts`) for OAuth/dev login start.
3. Supabase callback route (`src/app/auth/callback/route.ts`) exchanges code for session and upserts app user via tRPC server caller.
4. tRPC API is served from `src/app/api/trpc/[trpc]/route.ts`.
5. tRPC context (`src/server/api/trpc.ts`) builds per-request context with:
   - `db` from `@mino/db/src/client`
   - Supabase server client
   - `user` from `supabase.auth.getUser()`
6. `protectedProcedure` enforces authenticated user with email.
7. Data layer writes through Drizzle schemas in `packages/db/src/schema/*`.

Auth-specific notes:

- Redirect control flow is exception-based in Next.js. Client-side catch blocks intentionally filter redirect errors via `isRedirectError(...)`.
- `user.upsert` in `src/server/api/routers/user/user.ts` includes an ownership check (`input.id !== authUser.id` => `FORBIDDEN`) and explicit conflict update fields.

## Necessary Scripts

Workspace root (`/`):

- `bun install`
- `bun run dev` (starts `@mino/web` dev)
- `bun run build`
- `bun run lint`
- `bun run format`
- `bun run typecheck`
- `bun run test`

Web client (`apps/web/client`):

- `bun run dev` (`next dev --turbo`)
- `bun run build`
- `bun run lint`
- `bun run format`
- `bun run typecheck`
- `bun run test` (Bun test with Happy DOM preload)

## Environment Setup

Main env vars live in `apps/web/client/src/env.ts` and `.env.example`.

Required:

- `SUPABASE_DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NODE_ENV`

Notes:

- Env validation runs at import-time in many server modules.
- For tests/tools where env is intentionally missing, use `SKIP_ENV_VALIDATION` only when truly needed.

## Agent Priorities

1. Preserve auth correctness and access control.
2. Keep API contracts and shared package exports stable.
3. Favor minimal, high-signal changes over broad refactors.
4. Ensure changed code passes lint/typecheck/tests for touched scope.
5. Keep server/client boundaries explicit (no accidental server-only code in client paths).

## Rules for Agents

- Prefer Bun workspace commands and `--filter` where possible.
- Do not add new package managers or lockfiles.
- Do not edit generated build output (`.next`, caches, temp files).
- Avoid touching unrelated packages for feature-local changes.
- Keep tRPC auth checks at procedure level (`protectedProcedure` and route-specific authorization).
- For user-owned resources, enforce ownership server-side even if UI already constrains input.
- In client auth handlers, do not treat Next redirect exceptions as normal errors.
- Keep changes consistent with existing style and config packages in `tooling/`.

## Context Discipline (for Agents)

- Read only what is needed to complete the task:
  - Start from touched feature folder.
  - Then expand to shared package(s) it imports.
- Ignore `node_modules`, `.next`, and other generated directories.
- Verify import paths against real file tree before refactors.
- Before changing auth/data flow, inspect:
  - `src/proxy.ts`
  - `src/app/login/actions.ts`
  - `src/app/auth/callback/route.ts`
  - `src/server/api/trpc.ts`
  - `src/server/api/routers/*`
- When testing, isolate to smallest relevant command first (single file/package), then widen if needed.

## Common Pitfalls

- Next.js 16 uses `proxy.ts` convention; do not rename to `middleware.ts` unless intentionally migrating.
- Redirects in server actions throw special errors; logging/toasting them as failures causes false-positive UX errors.
- Env validation can fail tests early if required vars are absent.
- `publicProcedure` still creates context; context creation should tolerate logged-out users.
- `AuthSessionMissingError` is a normal logged-out state in many flows, not always a fatal auth outage.
- Keep `onConflictDoUpdate.set` explicit; avoid accidentally mutating immutable identity fields.
- `userInsertSchema` includes many fields; avoid trusting client-controlled identity fields for authorization decisions.
- The root has `bun.lock`; use Bun workflow consistently.

## Current CI Expectations

GitHub Actions runs:

1. format
2. lint
3. typecheck
4. test

Agents should aim to keep all four green for touched scope before finalizing significant changes.
