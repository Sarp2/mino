# mino

A re-write of [Onlook](https://github.com/onlook-dev/onlook) — a visual editor for building modern web applications. mino reorganizes the original idea around a Bun monorepo on Next.js 16, tRPC v11, Supabase, and Drizzle.

> **Status: Work in progress.** Active development. Expect breaking changes, unfinished routes, commented-out flows (e.g. parts of `proxy.ts`), and APIs that may shift before any stable release.

---

## Stack

- **Runtime / package manager:** Bun `1.3.9` (hoisted workspace installs)
- **Framework:** Next.js `16.0.7` — App Router, React `19`, Server Components, Server Actions
- **API layer:** tRPC v11 (Next route handler + React Query client)
- **Database:** PostgreSQL + Drizzle ORM `0.44.7`
- **Auth / session:** Supabase (`@supabase/ssr`)
- **UI:** Tailwind CSS v4, Radix UI, Sonner, internal `@mino/ui`
- **Editor runtime:** Penpal-based iframe RPC, css-tree, ProseMirror
- **Validation / config:** Zod `4.3.5` + `@t3-oss/env-nextjs`
- **Tooling:** TypeScript `5.8.2`, ESLint, Prettier (shared in `tooling/`)

---

## Architecture

mino is split into two runtime surfaces and a set of supporting packages.

### The two surfaces

**Host (`apps/web/client`)** — the Next.js app the user signs into. It owns auth, persistence, the editor UI, and the canvas that hosts user iframes. All editor state (selection, history, style edits, drag operations) lives here as MobX stores under `src/components/store/editor/`.

**Guest (`apps/web/preload`)** — a small script bundled into a single JS file (`mino-preload-script.js`) and injected into every iframe rendering user code. It exposes a typed RPC surface to the host: read/write DOM, extract computed styles, listen for mutations, perform inline text edits, drag/move/group elements, and apply style changes through a managed `<style>` element.

The host and guest never share a JS context. They communicate over **Penpal** (`packages/penpal`) — a typed `postMessage` wrapper. This is what keeps user code from running alongside the editor shell.

```
                 ┌────────────────────────────────────────┐
   Browser  ───► │  apps/web/client (Next.js 16)          │
                 │  ─ Editor UI + MobX stores             │
                 │  ─ tRPC route handler                  │
                 │  ─ proxy.ts (session refresh)          │
                 │  ─ <iframe> hosts user code ──┐        │
                 └───────────────────────┬───────│────────┘
                                         │       │
              ┌──────────────────────────┘       │ Penpal RPC
              ▼                                  ▼
   ┌─────────────────────┐         ┌────────────────────────┐
   │ Supabase + Postgres │         │ apps/web/preload       │
   │ (auth, data,        │         │ (injected into iframe) │
   │  Drizzle schema)    │         │ DOM + style + events   │
   └─────────────────────┘         └────────────────────────┘
```

### Request lifecycle (host)

1. Request hits Next.js → `src/proxy.ts` runs (Next 16's renamed middleware) and calls `updateSession()` to refresh Supabase auth cookies.
2. Page renders as a Server Component. Protected pages depend on the Supabase user and on tRPC's `protectedProcedure`.
3. Client components reach the server through the tRPC React Query client. The server caller is also used inside server actions and route handlers (e.g. the OAuth callback).
4. DB access goes through `packages/db`. **Ownership checks live in tRPC procedures, never on the client.**

### Editor lifecycle (guest)

1. Host loads user code in an iframe and injects the preload script.
2. Preload boots: polls for `document.body`, then starts DOM mutation listeners and a `<style>` element managed by `CSSManager`.
3. Penpal handshake completes; preload exposes its API to the host.
4. The host calls preload methods (`getElementByDomId`, `editText`, `groupElements`, `updateStyle`, etc.) from MobX managers in response to user interaction.
5. Style edits are written as CSS rules in the managed `<style>` element using a css-tree AST — never as inline `style="..."` attributes — so they participate in the cascade alongside the user's stylesheet.

---

## Folder Structure

```
mino/
├─ apps/
│  ├─ web/
│  │  ├─ client/             # Next.js host app — main runtime
│  │  └─ preload/            # Iframe guest script (DOM/style/events)
│  └─ backend/
│     └─ supabase/           # Supabase config + SQL migrations
├─ packages/
│  ├─ db/                    # Drizzle schema, client, defaults, migrations
│  ├─ models/                # Shared domain types (Project, Frame, Action, …)
│  ├─ code-provider/         # Sandbox provider abstraction (CodeSandbox, NodeFs)
│  ├─ penpal/                # Iframe ↔ host RPC types
│  ├─ ui/                    # Shared UI primitives (Radix, icons, …)
│  └─ utility/               # Helpers (id, color, font, frame layout, …)
├─ tooling/
│  ├─ eslint/                # Shared ESLint presets
│  ├─ typescript/            # Shared TS configs
│  └─ prettier/              # Shared Prettier config
├─ bun.lock
├─ bunfig.toml
└─ package.json              # Workspace root
```

### Inside `apps/web/client/src/`

```
src/
├─ app/                      # Next.js App Router
│  ├─ api/                   # tRPC route handler
│  ├─ auth/callback/         # OAuth code exchange + user upsert
│  ├─ login/                 # Login page + server actions
│  ├─ projects/              # Protected projects list
│  └─ project/[id]/          # Project editor page
├─ components/
│  └─ store/editor/          # MobX managers (canvas, frames, elements,
│                            #   overlay, action, history, style, move,
│                            #   text, copy, frame-events, state)
├─ server/api/
│  ├─ trpc.ts                # Context, publicProcedure, protectedProcedure
│  └─ routers/               # user, canvas, project (+ branch, frame, …)
├─ utils/supabase/           # Browser/server/middleware Supabase clients
├─ trpc/                     # tRPC client wiring
├─ env.ts                    # Import-time env validation
└─ proxy.ts                  # Next 16 proxy (NOT middleware.ts)
```

### Inside `apps/web/preload/src/`

```
src/
├─ index.ts                  # Penpal bootstrap, parent resolution
├─ api/
│  ├─ index.ts               # Method registry exposed to the host
│  ├─ ready.ts               # Body poller + DOM update interval
│  ├─ dom.ts                 # processDom + layer tree builder
│  ├─ events/                # MutationObserver + resize wiring
│  ├─ style/css-manager.ts   # css-tree-backed managed stylesheet
│  ├─ elements/              # DOM element lookup, insert/remove,
│  │                         #   group/ungroup, drag/move, text edit
│  └─ theme/                 # System theme resolution
├─ constants/                # Editor data-attribute names
└─ helpers/                  # ID helpers, asserts, DOM utils
```

---

## Authentication

Built on **Supabase Auth** with the `@supabase/ssr` adapter so sessions work seamlessly across server components, server actions, route handlers, and the browser.

### Flow

1. **Session refresh** — Every request passes through `src/proxy.ts`, which calls `updateSession()` (`src/utils/supabase/middleware.ts`). This rotates auth cookies on the response.
2. **Login** — User lands on `/login`. Sign-in via server actions in `src/app/login/actions.ts`:
   - **OAuth** providers configured in Supabase
   - **Dev sign-in** — local-only path
3. **OAuth callback** — Supabase redirects to `/auth/callback`. The route handler exchanges the code for a session, then **upserts the user** in our `users` table by invoking the tRPC server caller directly. `onConflictDoUpdate.set` is kept narrow — identity fields like `id` / `created_at` are never overwritten.
4. **Redirect** — On success the user lands on `/projects`.
5. **Protected data** — Every authenticated tRPC call goes through `protectedProcedure` (`src/server/api/trpc.ts`), which requires a Supabase user with an email. Ownership checks happen inside each procedure, server-side.

### Things to know

- `publicProcedure` must tolerate logged-out callers. `AuthSessionMissingError` is **expected** for anonymous users, not an error condition.
- Next.js redirects throw a special internal error. Server actions filter these via `isRedirectError(...)` rather than logging them.
- Required env vars are validated at import time in `src/env.ts`:
  - `SUPABASE_DATABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_SITE_URL`
  - `NODE_ENV`
- Use `SKIP_ENV_VALIDATION=1` only when truly necessary (e.g. tests without a real env).

### Files to read before changing auth

1. `apps/web/client/src/proxy.ts`
2. `apps/web/client/src/utils/supabase/{client,server,middleware}.ts`
3. `apps/web/client/src/app/login/actions.ts`
4. `apps/web/client/src/app/auth/callback/route.ts`
5. `apps/web/client/src/server/api/trpc.ts` (and the relevant router)

---

## Scripts

From the repo root:

```bash
bun install            # Install all workspaces
bun run dev            # Start the web client (Next.js, Turbo)
bun run build          # Production build of the web client

bun run lint
bun run format
bun run typecheck
bun run test

bun run db:gen         # Drizzle: generate migrations
bun run db:push        # Drizzle: push schema to the database
```

Web client only (`apps/web/client`):

```bash
bun run dev            # next dev --turbo
bun run test           # Bun test runner + Happy DOM
bun run test:e2e       # Playwright (Chrome, single worker) — requires MINO_ENV=test
```

Preload (`apps/web/preload`):

```bash
bun run dev            # Watch-build the preload script + serve
bun run build          # Bundle to apps/web/client/public/mino-preload-script.js
bun run typecheck
```

Database (`packages/db`):

```bash
bun run db:gen
bun run db:push
bun run db:migrate
bun run db:studio
```

---

## Testing

- **Unit** — Bun test runner with Happy DOM and Testing Library. Tests in `apps/web/client/tests/unit/{hooks,components}/`. Hooks and components run in **separate processes** so module-level mocks from one suite cannot bleed into the other.
- **E2E** — Playwright (Chrome, single worker) in `apps/web/client/tests/e2e/`. Needs `MINO_ENV=test` and the test Supabase env vars.

---

## CI / CD

A production-grade GitHub Actions pipeline runs on every push and pull request. Defined in `.github/workflows/ci.yml`, it enforces a five-stage gate that blocks merges until everything is green:

```
format ──► lint ──► typecheck ──► test ──► playwright
```

### What makes it production-grade

- **Strict workspace-wide enforcement.** Each stage runs against every package via `bun run --filter '*' <step>`. There is no per-package opt-out — formatting, lint, types, and tests are gated for the whole monorepo.
- **Sequenced gates.** `lint` depends on `format` so a formatting drift fails fast and cheap before the more expensive jobs run. `typecheck` and `test` run independently in parallel; `playwright` runs last because it owns shared resources.
- **Concurrency control on two axes:**
  - The whole workflow uses a `${{ github.workflow }}-${{ github.ref }}` group with `cancel-in-progress` for feature branches. Force-push or rapid pushes auto-cancel stale runs — but **never on `main`**, where every commit must complete a full run for an auditable history.
  - Playwright has its own `playwright-shared-supabase` concurrency group with `cancel-in-progress: false`. Only one E2E job touches the shared test Supabase project at a time, queued not killed, so concurrent PRs cannot corrupt each other's test data.
- **Composite action for setup.** `.github/actions/setup-bun-workspace` centralizes Bun install + dependency cache. Pinned to Bun `1.3.9`, lockfile-keyed cache (`hashFiles('**/bun.lock')`), and `bun install --frozen-lockfile` so a drifted lockfile fails CI rather than silently resolving new versions.
- **Realistic E2E environment.** Playwright runs against a real Supabase project with applied migrations (`bun run --filter '@mino/db' db:migrate` runs first), real OAuth-style auth flows, and a real CodeSandbox API key — not mocks. This catches schema drift, RLS regressions, and integration failures that unit tests miss.
- **Failure artifacts.** On Playwright failure, the `playwright-report/` and `test-results/` directories upload as artifacts so the trace, screenshots, and DOM snapshots are inspectable directly from the failed run — no local repro needed.
- **Per-job timeouts.** Every job has an explicit `timeout-minutes` so a hung process can't burn an hour of CI budget.
- **Secret hygiene.** All credentials (Supabase URLs, service keys, CSB API key) flow through GitHub Actions secrets and are scoped only to the jobs that need them.

The result: a five-minute fast feedback loop on most PRs, real-environment E2E coverage on every change, and a `main` branch where every commit has passed format, lint, types, unit tests, and Playwright against a live database.

---

## Conventions

- Use **Bun workspace commands** (`bun run --filter ...`) consistently. No other package managers.
- Do not edit generated output (`.next`, caches, generated migrations).
- Keep tRPC auth at the **procedure** level. Enforce ownership server-side.
- Keep `onConflictDoUpdate.set` fields explicit — never overwrite immutable identity fields.
- `src/proxy.ts` is intentional. Do not rename to `middleware.ts`.
- Style edits in the editor go through `CSSManager`, never inline styles. Inline declarations outrank stylesheet rules and break the cascade contract.
- Favor minimal, scoped changes. Keep server / client / iframe boundaries explicit.
- Verify import paths against the real file tree before refactoring.
- Make sure changed code passes lint / typecheck / tests for the touched scope.

---

## Project Status

mino is an in-progress re-write of Onlook. Several pieces are intentionally incomplete:

- Parts of the auth redirect logic in `proxy.ts` are commented out while the flow is being finalized.
- The project editor (`/project/[id]`) and sandbox provider integrations are evolving.
- ActionManager dispatching is wired to the iframe, but `CodeManager` (writing changes back to source files) is still scaffolded.
- Schemas, routes, and package boundaries may change without notice.

Issues, observations, and contributions targeted at stabilizing the rewrite are welcome.

---

## Credits

Originally inspired by and re-written from [Onlook](https://github.com/onlook-dev/onlook).
