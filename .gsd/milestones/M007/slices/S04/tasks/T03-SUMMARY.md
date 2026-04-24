---
id: T03
parent: S04
milestone: M007
key_files:
  - src/ui/workspace-home/ElementoEditor.tsx
key_decisions:
  - Validation toast ('Usa solo anni interi positivi') removed entirely rather than converted to setFieldError — the early return is sufficient and the form's FieldError handles presentation via Zod
  - Duplicate-stub if-block retained with comment rather than removed to preserve the key handler structure
duration: 
verification_result: passed
completed_at: 2026-04-24T10:32:31.274Z
blocker_discovered: false
---

# T03: Migrated all 6 toast mutation calls in ElementoEditor to notifyMutation and removed 2 non-mutation toasts

**Migrated all 6 toast mutation calls in ElementoEditor to notifyMutation and removed 2 non-mutation toasts**

## What Happened

Replaced all 8 `toast(...)` calls in `src/ui/workspace-home/ElementoEditor.tsx`:

**6 mutation sites migrated to `notifyMutation`:**
- `commitPatch` (line 412): `notifyMutation('update', label, undoFn)` — undo closure captures prevElement snapshot and re-normalizes/commits it
- `addFamilyLink` (line 504): `notifyMutation('create', 'Collegamento famiglia aggiunto', undoFn)` — undo calls `removeBidirectionalLink`
- `addGenericLink` (line 521): `notifyMutation('create', 'Collegamento aggiunto', undoFn)` — undo calls `removeBidirectionalLink`
- `removeLink` (line 530): `notifyMutation('delete', 'Collegamento rimosso', undoFn)` — undo calls `createBidirectionalLink`
- `commitFonteAdd` (line 550): `notifyMutation('create', 'Fonte aggiunta', undoFn)` — undo calls `removeFonteFromElemento`
- `commitFonteRemove` (line 573): `notifyMutation('delete', 'Fonte rimossa', undoFn)` — undo calls `addFonteToElemento`

**2 non-mutation toasts removed:**
- Duplicate stub (`key === 'duplicate'`): call removed, if-block left with comment `// not yet implemented`
- VitaChip validation (`'Usa solo anni interi positivi'`): call removed; early return retained so invalid date input is silently rejected (form FieldError already handles presentation)

**Import cleanup:**
- Removed `toast` from `@heroui/react` import
- Added `import { notifyMutation } from './notifications-store'`

All undo functions are verbatim closures from the previous `actionProps.onPress` bodies — no logic was changed, only the wrapping API changed.

## Verification

rg -n 'toast(' ElementoEditor.tsx → 0 hits. rg -n 'notifyMutation' ElementoEditor.tsx → 7 lines (1 import + 6 call sites). rg -n 'from "./notifications-store"' ElementoEditor.tsx → 1 hit. pnpm tsc --noEmit → clean (no output). pnpm test --run → 150/150 green.

## Verification Evidence

| # | Command | Exit Code | Verdict | Duration |
|---|---------|-----------|---------|----------|
| 1 | `rg -n 'toast\(' src/ui/workspace-home/ElementoEditor.tsx` | 1 | ✅ pass — 0 toast( calls remain | 50ms |
| 2 | `rg -n 'notifyMutation' src/ui/workspace-home/ElementoEditor.tsx | wc -l` | 0 | ✅ pass — 7 lines (1 import + 6 call sites) | 40ms |
| 3 | `rg -n 'from "./notifications-store"' src/ui/workspace-home/ElementoEditor.tsx` | 0 | ✅ pass — 1 import line | 30ms |
| 4 | `pnpm tsc --noEmit` | 0 | ✅ pass — no type errors | 8200ms |
| 5 | `pnpm test --run` | 0 | ✅ pass — 150/150 tests green | 712ms |

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/ui/workspace-home/ElementoEditor.tsx`
