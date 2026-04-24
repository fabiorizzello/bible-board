---
sliceId: S03
uatType: artifact-driven
verdict: PASS
date: 2026-04-24T12:13:00.000Z
---

# UAT Result — S03

## Checks

| Check | Mode | Result | Notes |
|-------|------|--------|-------|
| TC-01: InlineTitle blur without change → no feedback (no-op guard) | artifact | PASS | `useFieldStatus.ts:51` — `if (prev === next) return;` strict equality guard prevents commit and status change |
| TC-02: InlineTitle blur with change → Check fades in/out | artifact | PASS | `ElementoEditor.tsx:1008-1012` — `endContent` renders `<Check>` with `transition-opacity duration-300` and `style={{ opacity: status === "success" ? 1 : 0 }}`; timer resets to idle at 1500ms via `timerRef` + `setTimeout` (useFieldStatus.ts:66-70) |
| TC-03: DescrizioneSection blur without change → no feedback | artifact | PASS | Same `prev === next` guard in `useFieldStatus`; Milkdown container uses `contains(event.relatedTarget)` at `ElementoEditor.tsx:1350` to suppress internal focus-move commits |
| TC-04: DescrizioneSection blur with change → Check overlay appears | artifact | PASS | `ElementoEditor.tsx:1383-1385` — `absolute bottom-2 right-2` Check icon with `pointer-events-none`, `aria-hidden="true"`, `transition-opacity`, opacity driven by `status === 'success'` |
| TC-05: TipoChip re-select same type → no feedback | artifact | PASS | `ElementoEditor.tsx:1105` — `if (option === tipo) { closePopover(); return; }` guard prevents commit and justCommitted state change |
| TC-06: TipoChip select different type → adjacent Check appears | artifact | PASS | `ElementoEditor.tsx:1101,1111,1152-1153` — `justCommitted` state set to true on commit, `<Check>` at `ml-2` adjacent to chip with `transition-opacity` and `style={{ opacity: justCommitted ? 1 : 0 }}` |
| TC-07: prefers-reduced-motion — code path verified | artifact | PASS | `useFieldStatus.ts:64` reads `matchMedia("(prefers-reduced-motion: reduce)").matches` at blur time (not render time); same pattern in `ElementoEditor.tsx:1115` for TipoChip; test scenario at `useFieldStatus.test.ts:83` passes; 141/141 tests pass |
| TC-07: prefers-reduced-motion — OS/browser manual verification | human-follow-up | NEEDS-HUMAN | Enable "Reduce motion" in OS or DevTools, repeat TC-02 — confirm Check icon appears and disappears immediately with no fade |
| TC-08: Rapid blur/re-focus does not stack timers | artifact | PASS | `useFieldStatus.ts:38,53-55` — `timerRef` cleared on `onFocus` (line 38) and before each new timer (lines 53-55), preventing timer accumulation; only one active timer possible at a time |
| Edge: Jazz external update syncs prevRef | artifact | PASS | `useFieldStatus.ts:31-32` — `useEffect([value])` syncs `prevRef.current = value` while unfocused; guarded by `isFocusedRef` to avoid overwriting during active edit |
| No width/height transitions | artifact | PASS | `grep` returns 0 matches for `transition.*width\|transition.*height\|animate.*width\|animate.*height` in ElementoEditor.tsx |
| No Legend State in useFieldStatus | artifact | PASS | `grep` returns 0 matches for `observer(\|use\$(` in useFieldStatus.ts — pure React only |
| Test suite | runtime | PASS | `pnpm test --run` — 141/141 tests pass across 6 test files |
| TypeScript | runtime | PASS | `pnpm tsc --noEmit` exits 0, no errors |

## Overall Verdict

PASS — all automatable artifact and runtime checks pass; one manual follow-up (TC-07 OS reduce-motion) requires human verification.

## Notes

- TC-07 implementation is fully verified by code inspection and unit tests (fake `matchMedia` in test setup, scenario 5 at line 83). Manual OS-level verification is a system integration check only.
- TipoChip uses `local justCommitted + setTimeout` pattern rather than `useFieldStatus` — this is by design (press-commit vs focus/blur API). No timer-stacking risk for TC-08 on TipoChip since each press creates exactly one timer with no re-entry path.
- The `contains(event.relatedTarget)` guard in DescrizioneSection correctly handles TC-03's "internal focus moves within Milkdown don't trigger commit" case.
- Element-switch edge case: `useFieldStatus` resets prevRef via `useEffect([value])` on unmount/remount — no orphaned Check icons expected when switching elements.
