---
id: T02
parent: S03
milestone: M001
key_files:
  - src/ui/workspace-home/workspace-ui-store.ts
  - src/ui/workspace-home/ElementoEditor.tsx
  - src/ui/workspace-home/__tests__/link-helpers.test.ts
key_decisions:
  - Bidirectional helpers placed in workspace-ui-store.ts (same pattern as commitFontiOverride from T01) — write-side operations belong in the store module
  - Atomic single-store-update for both source+target patches avoids reactive glitches between two separate commits
  - createBidirectionalLink is idempotent: skips if forward link exists, skips inverse if target already has the link back
  - removeLink closure captures ruolo before resetting state so undo can restore the correct parentela role
  - commitPatch dead link branch left in place — removing it is out of scope and harmless
duration: 
verification_result: passed
completed_at: 2026-04-22T12:26:09.033Z
blocker_discovered: false
---

# T02: Added createBidirectionalLink/removeBidirectionalLink store helpers and wired them into ElementoEditor link add/remove with atomic inverse propagation and 5s toast undo

**Added createBidirectionalLink/removeBidirectionalLink store helpers and wired them into ElementoEditor link add/remove with atomic inverse propagation and 5s toast undo**

## What Happened

Implemented bidirectional link semantics on top of the existing mock-data store, zero Jazz imports throughout.

**workspace-ui-store.ts**: Added two new exported functions — `createBidirectionalLink(sourceId, targetId, tipo, ruolo?)` and `removeBidirectionalLink(sourceId, targetId, tipo)`. Both operate atomically: a single `workspaceUi$.elementOverrides.set(...)` call patches both source and target in one store update, then bumps `lastModified` to trigger reactive re-renders. `createBidirectionalLink` is idempotent (early-returns if the forward link already exists) and skips the inverse write if the target already has the symmetric link. `removeBidirectionalLink` uses array `.filter()` on both sides — no-op when the link is absent. Inverse roles are computed via the existing `getInverseLink` from `elemento.rules`, preserving the domain's RUOLO_INVERSO mapping (padre↔figlio, madre↔figlia, coniuge↔coniuge).

**ElementoEditor.tsx**: Replaced `addFamilyLink`, `addGenericLink`, and `removeLink` to bypass `commitPatch` for link mutations and use the new helpers directly. Each function captures the target ID and tipo/ruolo in closure variables before resetting picker state, fires the bidirectional helper, then shows a 5-second toast with an "Annulla" action that calls the inverse helper (remove ↔ create). The `removeLink` function reads the source link's ruolo before removal so the undo closure can restore the correct role.

**Tests**: 13 unit tests in `link-helpers.test.ts` covering: parentela role inversion for all 5 roles (padre/madre/figlio/figlia/coniuge), generic link symmetric propagation, idempotency on double-create (no duplicates), remove from both sides for both session-created and base mock-data links, no-op remove, and unrelated link preservation.

## Verification

tsc --noEmit: clean (no output). `npx vitest run src/ui/workspace-home/__tests__/link-helpers.test.ts`: 13/13 tests passed. Full suite `npx vitest run`: 105/105 tests passed (3 suite-level errors are stale .gsd/worktrees symlinks from a prior S02 worktree, unrelated to this task). RuoloLink selector already constrained to personaggio targets by the existing familyCandidates filter (`candidate.tipo === "personaggio"`) — requirement satisfied without new code.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `npm run lint (tsc -b --noEmit)` | 0 | ✅ pass | 4200ms |
| 2 | `npx vitest run src/ui/workspace-home/__tests__/link-helpers.test.ts` | 0 | ✅ pass — 13/13 tests | 504ms |
| 3 | `npx vitest run (full suite)` | 0 | ✅ pass — 105/105 tests | 688ms |

## Deviations

none — the RuoloLink visibility constraint (visible only for parentela + personaggio target) was already enforced by the existing familyCandidates filter; no new code required for that verification item.

## Known Issues

none

## Files Created/Modified

- `src/ui/workspace-home/workspace-ui-store.ts`
- `src/ui/workspace-home/ElementoEditor.tsx`
- `src/ui/workspace-home/__tests__/link-helpers.test.ts`
