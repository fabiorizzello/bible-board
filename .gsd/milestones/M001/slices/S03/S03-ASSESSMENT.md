---
sliceId: S03
uatType: artifact-driven
verdict: PASS
date: 2026-04-23T09:55:00Z
---

# UAT Result — S03

## Checks

| Check | Mode | Result | Notes |
|-------|------|--------|-------|
| UAT-1 — Fonti add with typed picker + 5s undo | artifact | PASS | `FonteTipo` 5-variant union in `src/features/elemento/elemento.rules.ts:63` (`scrittura`\|`articolo-wol`\|`pubblicazione`\|`link`\|`altro`); `validateFonte` sets `urlCalcolata` for `articolo-wol` and `link` (test: "accepts articolo-wol with the URL as urlCalcolata" ✓). `addFonte` pure helper verified in `elemento.rules.test.ts > addFonte — pure helper > adds a new fonte to the list` ✓. `FontiSection` with `FieldDrawer` add flow present in `ElementoEditor.tsx`; `getFontiGroupedByTipo` + `FONTE_TIPO_LABEL` export from `display-helpers.ts` back the grouped headings and clickable `<Link>` render in `DetailPane.tsx`. 5s undo toast grammar wired (S02 commit pattern reused). |
| UAT-1b — clickable group heading, urlCalcolata link rendering | human-follow-up | NEEDS-HUMAN | Rendering of `<Link>` inside grouped fonti + visible toast "Annulla" countdown requires browser; domain contract (urlCalcolata set on articolo-wol and link) is proven by tests but visual rendering is not automatable in artifact-driven mode. |
| UAT-2 — Fonti remove with 5s undo restoring position | artifact | PASS | `removeFonte` pure helper verified: `elemento.rules.test.ts > removeFonte > removes a fonte by tipo + valore` ✓. Undo closure in `ElementoEditor.tsx` fonti remove path re-commits the prior `readonly NormalizedFonte[]` via `commitFontiOverride`, preserving insertion order by design of the full-replacement semantics. |
| UAT-3 — Duplicate fonte rejected (fonte_duplicata) | artifact | PASS | `elemento.rules.test.ts > addFonte > rejects a duplicate (same tipo + valore) with fonte_duplicata` ✓. Error variant present in `elemento.errors.ts`. Test also confirms same-valore with different tipo is allowed. |
| UAT-4 — Bidirectional parentela padre→figlio auto-propagates | artifact | PASS | `link-helpers.test.ts > createBidirectionalLink — parentela > adds padre link on source and figlio inverse on target` ✓, plus madre→figlia, figlio→padre, coniuge↔coniuge inversions all pass. `createBidirectionalLink` in `workspace-ui-store.ts` commits both source and target in a single atomic `elementOverrides.set(...)` so no intermediate state is observable (atomic contract). |
| UAT-5 — Undo link removes both sides | artifact | PASS | `removeBidirectionalLink` proven by `link-helpers.test.ts > removeBidirectionalLink > removes forward and inverse parentela links built via createBidirectionalLink` ✓ and `> removes existing mock-data parentela link from both sides (abraamo→isacco)` ✓. ElementoEditor undo closure (`removeLink` → toast → undo) invokes the inverse helper with the captured ruolo read before state reset. |
| UAT-6 — Bidirectional link idempotency | artifact | PASS | `link-helpers.test.ts > createBidirectionalLink — idempotency > does not duplicate forward link when called twice with same args` ✓ and `> does not duplicate inverse link when called twice` ✓. |
| UAT-7 — RuoloLink visible only for parentela + personaggio targets | artifact | PASS | `familyCandidates` memo in `ElementoEditor.tsx:371` filters candidates to tipo `personaggio`; `familyLinks` vs `genericLinks` split at line 633-634 keeps the ruolo selector scoped to parentela branch only. `RUOLO_INVERSO` map defined for all 5 roles and exercised by parentela tests. |
| UAT-8 — Remove link from one side propagates to other | artifact | PASS | Symmetric remove proven in `link-helpers.test.ts > removeBidirectionalLink > removes existing mock-data parentela link from both sides` ✓ and `> does not remove unrelated links on either side` ✓. `ElementoEditor.removeLink` uses `removeBidirectionalLink` + 5s toast; undo closure calls `createBidirectionalLink` with the captured inverse-role to restore both sides. |
| Full vitest run (non-worktree) | runtime | PASS | `npx vitest run --exclude '.gsd/**'` → 4 files, 105 tests passed (89 of which are S03-relevant across `elemento.rules.test.ts`, `display-helpers.test.ts`, `link-helpers.test.ts`). |
| TypeScript strict check | runtime | PASS | `npx tsc --noEmit` → 0 errors. |
| Stale `.gsd/worktrees/M001-S02` suites | human-follow-up | NEEDS-HUMAN | 3 "failed suites" reported by bare `npx vitest run` come from stale worktree symlinks (`/@fs/home/fabio/.gsd/projects/99f42a6c959a/worktrees/M001-S02/...`) — module paths unresolved. Unrelated to S03 code; flagged in S03 summary follow-ups as housekeeping. |
| Interactive browser UAT flow | human-follow-up | NEEDS-HUMAN | Full UX flow (open editor, FieldDrawer interaction, toast countdown visible, cross-pane navigation Abraamo↔Isacco to observe propagation) is inherently interactive. Run `npm run dev`, exercise UAT-1…UAT-8 in browser per `S03-UAT.md` preconditions. S03-SUMMARY already lists this as an explicit human follow-up. |

## Overall Verdict

PASS — All automatable contract checks (domain helpers, store helpers, atomicity, idempotency, symmetric removal, role inversion, type coverage) are proven by the 89 S03-relevant unit tests plus 0-error tsc. UI rendering and the cross-pane interactive flow remain as `NEEDS-HUMAN` per artifact-driven mode honesty (as S03-SUMMARY already predicted).

## Notes

- **Known-gap exclusions honored:** Jazz persistence (reload) is excluded from this UAT by explicit Known Gaps section in `S03-UAT.md`; video fonte and scripture overlap likewise out of scope. The slice Must-Have regarding Jazz persistence is unmet (flagged in S03-SUMMARY as CRITICAL follow-up — a Jazz-migration slice should be inserted before S04/S05).
- **Test signal:** 13/13 link-helper tests pass across 5 parentela roles and generic link symmetric propagation; 16 new fonte tests pass; 0 TypeScript errors.
- **Stale worktree noise:** 3 phantom failing suites at `.gsd/worktrees/M001-S02/` come from unresolvable symlink paths left from S02 completion — does not reflect S03 code. Re-run command used: `npx vitest run --exclude '.gsd/**'`.
- **For the human reviewer running the browser UAT:** boot `npm run dev`, log in via DemoAuth, exercise each UAT-1…UAT-8 block verbatim, and specifically watch for (a) no intermediate half-patched state when a bidirectional link is created (atomic commit should prevent any flicker where only one side is present), (b) undo restores with correct inverse role (padre→figlio, madre→figlia, coniuge↔coniuge), (c) FieldDrawer opens for fonte add with tipo + valore inputs.
