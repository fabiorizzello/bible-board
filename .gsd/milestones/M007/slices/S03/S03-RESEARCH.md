# S03 Research — Hook useFieldStatus + inline success + fix toast no-op

## Status Baseline

- Tests: 126/126 passing (`pnpm test --run`)
- `tsc --noEmit`: clean
- S01 completed: domain language + fullheight layout in place
- `useFieldStatus` does NOT yet exist anywhere in the codebase

---

## Files Surveyed

### Primary Target: `src/ui/workspace-home/ElementoEditor.tsx`

This is the only file that needs changes for the S03 deliverable. It is a ~1687-line monolith with all sub-components defined locally. Key findings:

#### Toast trigger points (all inside `commitPatch` → called by every commit function)

| Line | Call site | Label |
|---|---|---|
| 425 | `toast(label, {...})` | central blur-to-save toast inside `commitPatch()` |
| 524 | `toast("Collegamento famiglia aggiunto", {...})` | `addFamilyLink()` |
| 547 | `toast("Collegamento aggiunto", {...})` | `addGenericLink()` |
| 563 | `toast("Collegamento rimosso", {...})` | `removeLink()` |
| 589 | `toast("Fonte aggiunta", {...})` | `commitFonteAdd()` |
| 621 | `toast("Fonte rimossa", {...})` | `commitFonteRemove()` |
| 950 | `toast("Duplicazione rimandata a una fase successiva", {...})` | `HeaderActionsMenu` — info only |
| 1159 | `toast("Usa solo anni interi positivi", {...})` | `VitaChip.submit()` — validation error |

#### The central blur-to-save pattern (lines 407–447, `commitPatch`)

```ts
function commitPatch(patch, label, options?) {
  const prevElement = { ...element };
  const next = { ...element, ...patch };
  const result = normalizeElementoInput(buildElementoInput(next));
  result.match(
    (normalized) => {
      commitNormalizedElement(element.id, normalized);
      setSurfaceError(null);
      if (!options?.keepEditorOpen) closeFieldEditor();
      toast(label, { timeout: 5_000, variant: "default", actionProps: { ... } });
    },
    (error) => setSurfaceError(...)
  );
}
```

**The no-op bug:** Every call to `commitPatch` fires a toast unconditionally on success — even when `patch` is identical to the current value. There is no prev/next comparison before calling `commitPatch`. The hook must gate the toast call, not replace it (links and fonti have their own toast calls outside `commitPatch`).

#### Per-field blur commit sites

- `InlineTitle` (line 1014): `onBlur={() => onCommit(draft)}` — no no-op guard
- `DescrizioneSection` (line 1320): `handleBlur` fires `onCommit(draft)` — no no-op guard
- `ScalarChip` (line 1248): `submit()` has `if (trimmed === original) { onOpenChange(false); return; }` — **already has no-op guard!**
- `TipoChip` (line 1122): popover button `onPress={() => onCommit(option)}` — fires even if same tipo selected

#### Components that need inline success feedback (per AC)

1. **`DescrizioneSection`** — Textarea/Milkdown: check icon as absolute-positioned overlay at bottom-right corner, fade-out 1.5s + entry in notification drawer
2. **`TipoChip`** — Select-like popover: check icon adjacent to trigger chip after commit, 1.5s fade-out
3. Tag chips in `ArraySection` — check inline on the added chip, 1.5s (for individual adds/removes)
4. **`InlineTitle`** — Input `endContent` check icon, fade-out 1.5s + entry in notification drawer

#### Components where toast-on-no-op can still fire

- `InlineTitle.onBlur` → calls `commitTitle(draft)` → calls `commitPatch` with no prev/next check
- `DescrizioneSection.handleBlur` → calls `commitDescrizione(draft)` → `commitPatch` with no prev/next check
- `TipoChip` → `onCommit(option)` even when option === current tipo

---

### `src/ui/workspace-home/workspace-ui-store.ts`

Legend State pattern to replicate (lines 158–172):
```ts
const initialState: WorkspaceUIState = { ... };
export const workspaceUi$ = observable<WorkspaceUIState>(initialState);
// Named setters:
export function openFieldEditor(fieldId: EditableFieldId): void {
  workspaceUi$.editingFieldId.set(fieldId);
}
```

`useSelector` usage pattern for consuming in components:
```ts
import { useSelector } from "@legendapp/state/react";
const editingFieldId = useSelector(workspaceUi$.editingFieldId);
```

**Important**: `use$()` does NOT exist in v2.1.15. Always `useSelector`. No `observer()` HOC.

---

### `.gsd/KNOWLEDGE.md` — Key Extracts

**HeroUI v3 RAC composition** (line 169):
```tsx
<TextField value={v} onChange={fn} isInvalid={bool}>
  <Label />
  <Input />
  <FieldError />
</TextField>
```
`Input` primitivo does NOT accept `onValueChange`, `isInvalid`, `errorMessage`, `classNames` directly.

**Animation rules** (line 192):
- ONLY `opacity` and `transform` — NEVER `width`, `height`, `top`, `left`
- Duration 150ms micro, 250-300ms layout transitions
- `prefers-reduced-motion`: all animations disabled

**Touch targets**: ≥44×44px, gap ≥8px between adjacent targets.

---

## Hook Design

### Signature
```ts
export function useFieldStatus<T>(
  value: T,
  onCommit: (prev: T, next: T) => void,
): {
  status: "idle" | "saving" | "success" | "error";
  onFocus: () => void;
  onBlur: (next: T) => void;
}
```

### State machine
```
idle ──────────────────────────────────────────┐
  │ onFocus()                                  │
  ▼                                            │
focused (captures prev internally)             │
  │ onBlur(next)                               │
  ├── next === prev ──────────────────────────▶│ (no-op: stay idle, no toast, no drawer entry)
  └── next !== prev                            │
       │ invoke onCommit(prev, next)           │
       ▼                                       │
     saving (async if onCommit is async)       │
       │ success                               │
       ▼                                       │
     success ──── after 1500ms ──────────────▶│ (status resets to idle)
       │ or prefers-reduced-motion             │
       └── immediate reset ───────────────────▶│
```

### Implementation notes
- `prevRef = useRef<T>(value)` — capture on `onFocus`
- `useEffect` to sync `prevRef` when `value` changes externally (after Jazz commit re-renders the parent)
- Timer: `useEffect` cleanup to cancel the 1500ms timer on unmount
- `prefers-reduced-motion`: use `window.matchMedia("(prefers-reduced-motion: reduce)").matches` to skip the 1500ms delay and go directly idle
- `onCommit` should remain synchronous for the current codebase (Jazz writes are sync); hook accepts either sync or async
- Generic `T` to handle `string`, `ElementoTipo`, `string[]`, etc.

---

## Integration Strategy

The hook does NOT replace `commitPatch`. Instead, each per-field blur path wraps its commit call:

```
Before: onBlur → commitPatch(patch, label)  [always toasts]
After:  useFieldStatus.onBlur(next) → if prev !== next → onCommit(prev, next) → commitPatch(...) [toasts only on real change]
         └── status becomes "success" → render inline check icon
```

This means:
1. **`InlineTitle`**: add `useFieldStatus<string>(value, onCommit)` inside `InlineTitle`. Replace `onBlur={() => onCommit(draft)}` with `onBlur handler` from hook. Add `endContent` with `<Check>` icon, `opacity-0` → `opacity-100` → `opacity-0` based on status === "success".
2. **`DescrizioneSection`**: same for Milkdown blur handler. Add absolute-positioned check in bottom-right of editor container.
3. **`TipoChip`**: add no-op guard in `onCommit(option)` — if `option === tipo` return without calling. Add `Check` icon adjacent to trigger after commit.
4. **`ScalarChip`**: already has no-op guard; add visual check if needed (lower priority).

### Notification drawer (S01-produced requirement)

Per MEM064: "Notification center iPad-native (bell + drawer right) rimpiazza completamente toast HeroUI." — The S03 hook calls `onCommit(prev, next)` which currently calls `commitPatch` which calls `toast(...)`. The drawer integration is a separate concern (S05 likely). For S03: inline check icons are the deliverable; the toast calls in `commitPatch` remain as the undo mechanism for now. The no-op fix ensures toasts only fire on actual changes.

---

## Natural Seams / Task Decomposition

### T01 — Hook `useFieldStatus` (pure, testable, no UI)
- File: `src/ui/workspace-home/useFieldStatus.ts` (new file, ~50-70 lines)
- Pure React hook: `useState`, `useRef`, `useEffect`, `useCallback`
- No imports from HeroUI, Jazz, Legend State
- State machine: idle → focused → saving → success → idle
- Prev/next comparison: strict equality (works for primitives; for arrays, caller passes pre-serialized value or JSON string)
- `prefers-reduced-motion` support
- **Can be built and tested independently before touching ElementoEditor**

### T02 — Unit tests for `useFieldStatus`
- File: `src/ui/workspace-home/__tests__/useFieldStatus.test.ts`
- Test scenarios:
  1. `onBlur(same)` → no `onCommit` call, status remains `idle`
  2. `onBlur(different)` → `onCommit(prev, next)` called with correct args
  3. `status` transitions: idle → success after commit with change
  4. `status` resets to idle after 1500ms
  5. Focus then blur same → no call (idempotency)
  6. `prefers-reduced-motion` → immediate reset (mock `window.matchMedia`)
- Use `@testing-library/react` `renderHook` (already in stack)

### T03 — Wire `useFieldStatus` into `InlineTitle`
- File: `ElementoEditor.tsx` lines 973–1030 (`InlineTitle`)
- Add `useFieldStatus<string>` inside `InlineTitle`
- Replace `onBlur={() => onCommit(draft)}` with hook's onBlur
- Add `endContent` to `<Input>` with `<Check>` icon + `opacity-0`/`opacity-100` transition

### T04 — Wire `useFieldStatus` into `DescrizioneSection`
- File: `ElementoEditor.tsx` lines 1292–1364 (`DescrizioneSection`)
- Milkdown does not expose a standard input blur; use the container `onBlur` handler at line 1320
- Add absolute-positioned check icon at bottom-right of milkdown-host div
- `@media (prefers-reduced-motion)` CSS class

### T05 — Wire no-op guard into `TipoChip` + adjacent check icon
- File: `ElementoEditor.tsx` lines 1091–1129 (`TipoChip`)
- If `option === tipo`, early return without calling `onCommit`
- Add `Check` icon adjacent to `ChipButton` trigger when status === "success"

---

## What to Build First (Risk Order)

1. **T01 (hook)** — Most blocking. T03/T04/T05 all depend on it. Also enables T02 in parallel.
2. **T02 (tests)** — Run in parallel with T01. Confirms the state machine contract before wiring into UI.
3. **T03 (InlineTitle)** — Simplest integration: standard HeroUI Input with `endContent`.
4. **T05 (TipoChip no-op guard)** — Pure guard, low risk.
5. **T04 (DescrizioneSection)** — Milkdown blur is the trickiest; last.

---

## Verification Commands

```sh
# 1. Hook file exists and has ≥30 lines
wc -l src/ui/workspace-home/useFieldStatus.ts

# 2. Named export exists
grep -n "export function useFieldStatus" src/ui/workspace-home/useFieldStatus.ts

# 3. All prior tests still pass + new tests pass
pnpm test --run

# 4. No-op: onCommit not called when blur with same value
# (covered by unit tests — check test output)

# 5. TypeScript clean
pnpm tsc --noEmit

# 6. No width/height animations introduced
rg "animate.*width|animate.*height|transition.*width|transition.*height" src/ui/workspace-home/ElementoEditor.tsx

# 7. No observer() HOC usage
rg "observer(" src/ui/workspace-home/useFieldStatus.ts

# 8. No use$() usage
rg "use\$(" src/ui/workspace-home/

# 9. Check icon present in InlineTitle endContent area
grep -n "endContent" src/ui/workspace-home/ElementoEditor.tsx

# 10. Status machine test coverage
pnpm test --run --reporter=verbose 2>&1 | grep useFieldStatus
```

---

## Key Gotchas

1. **`ScalarChip` already has a no-op guard** (line 1248–1255) — do not duplicate; may optionally add inline check there but not required by AC.

2. **Milkdown blur is container-level** — `DescrizioneSection` uses `handleBlur` on the wrapper `div`, not on a native input. The `onBlur(next: string)` call must capture the Milkdown `draft` state at blur time (already stored in `useState`).

3. **TipoChip commits on option press**, not on blur — the `onFocus/onBlur` pattern does not apply. Instead, the hook's `onBlur(next)` is called inline: compare `option !== tipo` before calling `onCommit`. Alternatively, skip `useFieldStatus` for TipoChip entirely and just add a local `useState` for success status with a 1500ms timer — simpler for a non-blur control.

4. **`endContent` in HeroUI v3 Input**: `Input` accepts `startContent`/`endContent` as direct props (it's a React Aria primitive), but verify against the version in node_modules if unsure — HeroUI v3 RAC wrappers may differ.

5. **`prefers-reduced-motion` in JS**: use `window.matchMedia("(prefers-reduced-motion: reduce)").matches` at the moment the success timer fires — do not capture at render time (user may change accessibility settings).

6. **ElementoEditor is a monolith** — confirmed by KNOWLEDGE.md note "ElementoEditor rimane in un singolo file con sub-componenti locali — no split in file separati". The hook lives in a separate file; all integration stays in ElementoEditor.tsx.

---

## Files to Create/Modify

| File | Action | Notes |
|---|---|---|
| `src/ui/workspace-home/useFieldStatus.ts` | CREATE | New hook, ~50-70 lines |
| `src/ui/workspace-home/__tests__/useFieldStatus.test.ts` | CREATE | Unit tests for hook |
| `src/ui/workspace-home/ElementoEditor.tsx` | MODIFY | Wire hook into InlineTitle, DescrizioneSection, TipoChip; add Check icon rendering |
