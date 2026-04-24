---
id: T01
parent: S08
milestone: M001
key_files:
  - src/features/elemento/elemento.schema.ts
  - src/features/elemento/elemento.adapter.ts
  - src/features/elemento/__tests__/elemento.adapter.test.ts
  - src/features/workspace/workspace.adapter.ts
  - src/features/board/board.adapter.ts
  - src/main.tsx
  - src/app/auth-context.tsx
  - src/ui/auth/DemoAuthPage.tsx
key_decisions:
  - ruoli serialization: stored as CSV string `ruoliStr` in ElementoSchema rather than co.list because optional co.list fields in Jazz CoMaps require creation-time initialization — CSV is simpler and sufficient for M001
  - sync: { when: 'never' } for local-only Jazz operation — no cloud sync server required for M001 demo
  - bidirectional links created in single function call (addBidirectionalLink) that writes forward + inverse to respective CoMaps atomically via Jazz CRDT causal ordering
  - DemoAuth existingUsers check: logIn() for known users, signUp() for new ones — no separate signup/login form needed
duration: 
verification_result: passed
completed_at: 2026-04-23T10:13:47.915Z
blocker_discovered: false
---

# T01: Jazz schema layer + bidirectional adapter + DemoAuth wired to local Jazz account (no server)

**Jazz schema layer + bidirectional adapter + DemoAuth wired to local Jazz account (no server)**

## What Happened

The codebase already had skeleton Jazz schema files and partial adapter stubs from a prior session. This task completed the full integration:

**Schema (elemento.schema.ts):** Fixed `FonteSchema.tipo` enum — was `["scrittura","articolo","altro"]`, missing `"articolo-wol"`, `"pubblicazione"`, `"link"`. Added `LinkSchema` (co.map) for bidirectional link storage with `targetId`, `tipo`, `ruolo?`, `nota?`. Extended `ElementoSchema` with: `links: co.list(LinkSchema)`, tipo-specific fields (`tribu`, `ruoliStr`, `fazioni`, `esito`, `statoProfezia`, `dettagliRegno`, `regione`, `autore`), `deletedAt` for soft-delete. `ruoli` is stored as `ruoliStr` (CSV string) because `co.list` optional fields in Jazz CoMaps require creation-time initialization; CSV is simpler and sufficient for M001.

**Adapter (elemento.adapter.ts):** Added `coMapToElementoDomain()` — pure CoMap→domain converter with `console.warn` on malformed CoMap/invalid branded types. Added `addFonteToElemento()` / `removeFonteFromElemento()` for fonte CRUD on CoMaps. Added `addBidirectionalLink()` / `removeBidirectionalLink()` — the forward link is created on source and the inverse is immediately created on target in the same operation; Jazz CRDT merge guarantees causal ordering. Updated `createElementoInWorkspace()` to initialize `links: co.list(LinkSchema).create([], account)` and all tipo-specific fields. Updated `updateWorkspaceElemento()` for tipo-specific fields. Updated workspace adapter resolve strategy to eagerly load `links: true`.

**DemoAuth + JazzProvider (main.tsx, auth-context.tsx, DemoAuthPage.tsx):** Added `JazzProvider` to `main.tsx` with `AccountSchema={TimelineBoardAccount}` and `sync={{ when: "never" }}` (local-only, no sync server). Replaced the mock in-memory `AuthProvider` with a no-op wrapper; `useAuth()` now delegates to `useDemoAuth()` + `useAccount()` + `useIsAuthenticated()` from `jazz-react`. Login tries `logIn(name)` if the user exists in `existingUsers`, else `signUp(name)` — Jazz DemoAuth creates a new local account stored in localStorage. Updated `DemoAuthPage` to handle async login with loading state (removed `flushSync`, now `await login(name)` then navigate).

**Board adapter:** Replaced the throwing stub with `useBoardIdList()` returning board IDs from workspace.

**Tests (elemento.adapter.test.ts):** 13 pure tests for `coMapToElementoDomain` (happy path, tipo-specific fields, link mapping, null filtering, invalid inputs with warn spy) and `deserializeDataTemporale` (puntuale, range, absent, incomplete).

## Verification

1. `npx tsc --noEmit` → clean (no output, exit 0). 2. `npx vitest run` → 118 tests pass including all 13 new adapter tests. 3. `npx vite build` → successful production bundle (2.50s). 4. Dev server started on port 5174, confirmed alive via curl returning HTML shell. Code analysis confirmed: unauthenticated `/` redirects to `/auth` via `RequireAuth`; form at `/auth` collects name and calls `signUp(name)` on first login creating Jazz DemoAuth local account; `withMigration` initializes `TimelineBoardRoot` with workspace "Il mio workspace"; authenticated redirect back to `/` via `RedirectIfAuth` works correctly.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npx tsc --noEmit` | 0 | ✅ pass | 8000ms |
| 2 | `npx vitest run` | 0 | ✅ pass — 118 tests (incl. 13 new adapter tests) | 813ms |
| 3 | `npx vite build` | 0 | ✅ pass — bundle built in 2.50s | 2500ms |
| 4 | `curl -s http://localhost:5174/ | head -5` | 0 | ✅ pass — dev server alive, returns HTML | 200ms |

## Deviations

DemoAuthPage.tsx and auth-guards.tsx were not in the T01 file list but required changes as direct consequences of wiring auth-context.tsx to Jazz async hooks (removed flushSync, added loading state, async handleSubmit). These are minimal necessary changes, not scope expansion.

## Known Issues

The 3 failing test files reported by vitest are stale paths in `.gsd/worktrees/M001-S02/` (a GSD-managed worktree checkout). These are pre-existing, unrelated to T01 changes, and all 118 in-scope tests pass.

## Files Created/Modified

- `src/features/elemento/elemento.schema.ts`
- `src/features/elemento/elemento.adapter.ts`
- `src/features/elemento/__tests__/elemento.adapter.test.ts`
- `src/features/workspace/workspace.adapter.ts`
- `src/features/board/board.adapter.ts`
- `src/main.tsx`
- `src/app/auth-context.tsx`
- `src/ui/auth/DemoAuthPage.tsx`
