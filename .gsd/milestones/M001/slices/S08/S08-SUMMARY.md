---
id: S08
parent: M001
milestone: M001
provides:
  - (none)
requires:
  []
affects:
  []
key_files:
  - (none)
key_decisions:
  - ["ruoliStr CSV string for optional co.list fields in CoMap schemas to avoid creation-time initialization complexity", "sync: { when: 'never' } for local-only Jazz operation — no cloud sync server needed for M001", "Jazz CoMap refs stored module-level outside Legend State to prevent proxy-of-proxy conflicts", "syncJazzState() called during React render phase, not useEffect, to prevent stale data flash", "addBidirectionalLink() writes forward + inverse in single function — Jazz CRDT causal ordering ensures atomicity", "DemoAuth: logIn() for known users, signUp() for new — determined by existingUsers check at submit time", "Boards remain on mock data pending S04 (no board CoMap wired to UI yet)"]
patterns_established:
  - ["Jazz CoMap refs → module-level mutable → syncJazzState() bridges to Legend State on render", "Pure adapter boundary: coMapToElementoDomain() never throws, logs console.warn on invalid data", "Atomic bidirectional links: single addBidirectionalLink() call, no manual transaction", "Soft delete via deletedAt flag on CoMap, filtered at WorkspacePreviewPage render boundary", "vitest.config.ts scoped to src/ to exclude stale GSD worktree test copies"]
observability_surfaces:
  - ["console.warn on coMapToElementoDomain — logs malformed CoMap or Zod branded-type rejection with element ID", "Jazz sync badge in header (sincronizzato/in sincronizzazione/offline) — wired to Jazz connection state", "Toast errors in Italian for user-facing Jazz mutation failures"]
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-23T10:43:25.072Z
blocker_discovered: false
---

# S08: Jazz persistence - migrazione mock a CRDT

**Migrated all app state from mock/session-overrides to Jazz CRDTs — elements, links, fonti, soft-delete, and DemoAuth all persist across page reloads with local-only Jazz storage.**

## What Happened

S08 replaced the entire mock + session-override architecture with Jazz-backed persistence across 15 files in two tasks.

**T01 — Jazz schema layer + adapter + DemoAuth (completed 2026-04-23):**

The schema layer (`elemento.schema.ts`) was completed with full CoMap definitions for Elemento, Link, Fonte, Board, and Workspace. Key schema decisions: `LinkSchema` as co.map with `targetId`, `tipo`, `ruolo?`, `nota?` fields; optional list fields like `ruoli` serialized as `ruoliStr` CSV string to avoid co.list initialization complexity; `deletedAt` field for soft-delete; all 8 TipoElemento-specific fields present at creation time.

The adapter layer (`elemento.adapter.ts`) gained: `coMapToElementoDomain()` — pure CoMap→domain converter with `console.warn` on malformed data or invalid branded types; `addFonteToElemento()` / `removeFonteFromElemento()` for fonte CRUD; `addBidirectionalLink()` / `removeBidirectionalLink()` — both write forward and inverse links in a single call, relying on Jazz CRDT causal ordering for atomicity; `createElementoInWorkspace()` initializes all fields including `links: co.list(LinkSchema).create([], account)`.

DemoAuth was wired end-to-end: `JazzProvider` added to `main.tsx` with `AccountSchema={TimelineBoardAccount}` and `sync={{ when: "never" }}` (local-only, no server); `withMigration` creates the workspace root with name "Il mio workspace" on first login; `auth-context.tsx` now delegates to Jazz's `useDemoAuth()` + `useAccount()` + `useIsAuthenticated()`; `DemoAuthPage.tsx` updated to async `await login(name)` with loading state.

13 pure adapter tests written and passing.

**T02 — UI migration to Jazz (completed 2026-04-23):**

`workspace-ui-store.ts` was gutted of all session-override state. Module-level mutable refs (`_jazzMe`, `_jazzElementi`, `_fontiBacking`) hold Jazz CoMaps outside Legend State to avoid proxy-of-proxy conflicts. `syncJazzState()` bridges Jazz reactive data into Legend State observables and is called during render (not useEffect) to prevent stale data flash. All mutations (create, update, soft-delete, addFonte, removeFont, addBidirectionalLink) now call Jazz adapters directly.

`display-helpers.ts` reads use `getJazzElementi()` and `getJazzFontiForElement()`. `WorkspacePreviewPage.tsx` calls `useWorkspaceElementiState()` and `syncJazzState()` on every render and filters `deletedAt` elements. `ElementoEditor.tsx` fonte add/remove call Jazz adapter with 5s undo toast. `ListPane.tsx` element creation calls `createElementoInWorkspace`. `DetailPane.tsx` cleaned of stale observers.

Tests updated: display-helpers seeded via `syncJazzElementiForTest`; 6 stale session-override tests removed; link-helpers replaced with pure `getInverseLink` domain tests. `vitest.config.ts` scoped to `src/` to exclude stale GSD worktree copies.

**Post-task fix:** `WorkspacePreviewPage.tsx` imported `findElementById` from `./workspace-ui-store` (which no longer exports it) instead of the correct `./display-helpers`. Fixed the import. Additionally, Jazz bundle pushed the main chunk to ~2.001 MiB, just over Workbox's 2 MiB default; fixed by setting `workbox.maximumFileSizeToCacheInBytes: 3 * 1024 * 1024` in `vite.config.ts`.

**Architecture established:** Jazz CoMap refs live at module level, `syncJazzState()` bridges to Legend State on render, bidirectional links are atomic via single function call, boards remain on mock data pending S04.

## Verification

1. `npx tsc --noEmit` → clean (exit 0, no output)
2. `npx vitest run` → 5 test files, 111 tests, 0 failures
3. `npx vite build` → ✓ built in 2.56s (after fixing Workbox maximumFileSizeToCacheInBytes and wrong findElementById import)

## Requirements Advanced

None.

## Requirements Validated

None.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

WorkspacePreviewPage.tsx had findElementById imported from workspace-ui-store (wrong) instead of display-helpers (correct) — fixed post-task. vite.config.ts required maximumFileSizeToCacheInBytes increase to 3 MiB due to Jazz bundle pushing main chunk to ~2.001 MiB. vitest.config.ts scoped to src/ to fix test discovery (stale GSD worktree copies were polluting test runs). DemoAuthPage.tsx and auth-guards.tsx required changes beyond T01's file list as direct consequences of async Jazz auth hooks.

## Known Limitations

Boards remain on mock data — board CoMaps are defined in schema but not wired to UI (S04 handles this). _fontiBacking populated from raw CoMaps since NormalizedFonte is not in the Elemento domain model — this bridging code should be reviewed when S03 fonte editor is extended. vitest.config.ts worktree exclusion is a workaround for stale GSD checkout paths.

## Follow-ups

S04 (Board CRUD) can now wire to real Jazz CoMaps using the established board.schema.ts + board.adapter.ts stubs. S05 (Timeline) reads from getJazzElementi() which now returns live data. S07 UAT will exercise the full end-to-end flow on real Jazz data. Board mock data removal is deferred to S04.

## Files Created/Modified

- `src/features/elemento/elemento.schema.ts` — Full CoMap schema: Elemento, Link, Fonte with correct tipo enum and all tipo-specific fields
- `src/features/elemento/elemento.adapter.ts` — coMapToElementoDomain, addBidirectionalLink, removeBidirectionalLink, addFonteToElemento, softDeleteWorkspaceElemento, restoreSoftDeletedElemento
- `src/features/elemento/__tests__/elemento.adapter.test.ts` — 13 pure adapter tests covering coMapToElementoDomain and deserializeDataTemporale
- `src/features/workspace/workspace.adapter.ts` — Eager link loading; workspace adapter resolve strategy
- `src/features/board/board.adapter.ts` — useBoardIdList returning board IDs from workspace (stub unblocked)
- `src/main.tsx` — JazzProvider with AccountSchema=TimelineBoardAccount, sync: { when: 'never' }
- `src/app/auth-context.tsx` — Delegated to Jazz useDemoAuth + useAccount + useIsAuthenticated
- `src/ui/auth/DemoAuthPage.tsx` — Async login with loading state; await login(name) then navigate
- `src/ui/workspace-home/workspace-ui-store.ts` — Removed all session-overrides; module-level Jazz refs; syncJazzState; all mutations wired to Jazz adapters
- `src/ui/workspace-home/display-helpers.ts` — All reads use getJazzElementi() and getJazzFontiForElement()
- `src/ui/workspace-home/WorkspacePreviewPage.tsx` — useWorkspaceElementiState hook; syncJazzState on render; deletedAt filter; fixed findElementById import
- `src/ui/workspace-home/ElementoEditor.tsx` — Fonte add/remove via Jazz adapter with 5s undo toast
- `src/ui/workspace-home/ListPane.tsx` — Element creation via createElementoInWorkspace; recenti from live Jazz data
- `src/ui/workspace-home/DetailPane.tsx` — Removed stale lastModified observer
- `src/ui/workspace-home/__tests__/display-helpers.test.ts` — Seeded with syncJazzElementiForTest; removed stale session-override tests
- `src/ui/workspace-home/__tests__/link-helpers.test.ts` — Replaced with pure getInverseLink domain tests
- `vitest.config.ts` — Scoped include to src/ to exclude stale GSD worktree test copies
- `vite.config.ts` — maximumFileSizeToCacheInBytes: 3 * 1024 * 1024 to handle Jazz bundle size
