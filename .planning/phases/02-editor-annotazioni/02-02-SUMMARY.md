---
phase: 02-editor-annotazioni
plan: 02-02
subsystem: ui
tags: [typescript, react, heroui, neverthrow, vitest, exhaustiveness, ddd, editor]

# Dependency graph
requires:
  - phase: 02-editor-annotazioni
    provides: ElementoEditor skeleton + workspace-ui-store isEditing + DetailPane/FullscreenOverlay edit-mode wiring (from 02-01)
provides:
  - Domain contract for all 7 type-specific Elemento fields (tribu, ruoli, fazioni, esito, statoProfezia, dettagliRegno, regione) via extended ElementoInput + NormalizedElementoInput
  - tipo_specifico_non_ammesso ElementoError variant enforcing tipo↔field consistency at the single validation boundary
  - ElementoEditor exhaustive over all 8 ElementoTipo with `const _exhaustive: never = tipo` compile-time guard (Principle V-bis)
  - handleSave now forwards nascita/morte/date/tribu/ruoli/fazioni/esito/statoProfezia/dettagliRegno/regione to normalizeElementoInput (end-to-end contract)
  - EventoFields + PeriodoFields + AnnotazioneFields sub-components
  - parseDataStorica helper with INVALID_DATA sentinel so handleSave distinguishes "field omitted" from "field invalid"
  - 13 new Vitest cases pinning the domain behavior (shared validation + tipo/field consistency + date validation)
affects: [03-fonti-link, 04-board-crud, 05-timeline-d3, 06-polish, M003-jazz-wiring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Discriminated-union exhaustive dispatcher with `const _exhaustive: never = tipo` compile-time guard over ElementoTipo (Constitution V-bis Open/Closed)"
    - "INVALID_DATA sentinel symbol returned by a parse helper so the caller can distinguish 'omit this optional field' from 'user typed invalid input'"
    - "Tipo↔field consistency enforced at the single normalization boundary via a new domain error variant, so the UI cannot smuggle unowned type-specific fields across tipo switches"
    - "Type-specific fields gated by `tipo === \"<owner>\"` in the payload builder — UI is constructive, domain is defensive"

key-files:
  created:
    - src/features/elemento/__tests__/elemento.rules.test.ts
  modified:
    - src/features/elemento/elemento.errors.ts
    - src/features/elemento/elemento.rules.ts
    - src/ui/workspace-home/ElementoEditor.tsx

key-decisions:
  - "Option A from the design hints: extend the domain (ElementoInput + NormalizedElementoInput) to mirror Elemento instead of adding a TODO comment — so the contract matches what the user types and no field is silently swallowed"
  - "tipo_specifico_non_ammesso replaces the previous `nascita/morte on non-personaggio → data_non_valida` rule — cleaner error semantics (the field is not invalid, it's unowned) and reusable across all 6 consistency checks"
  - "INVALID_DATA as a unique symbol (not null, not a throw) so parseDataStorica's return type is DataStorica | undefined | typeof INVALID_DATA — parse errors surface to errors._form without ever reaching normalizeElementoInput"
  - "ElementoEditor stays as a single file with sub-components — no file split. Plan explicitly requested one file so UI authors can see the whole editor shape in one place"
  - "Type-specific scalar fields are gated by `tipo === \"<owner>\"` in handleSave so normalizeElementoInput never receives an unowned field under normal flow — the tipo_specifico_non_ammesso branch becomes unreachable from this editor (correct shape: rules layer is defensive, UI is constructive)"
  - "`throw new Error` in the default case of the exhaustive switch is intentional — it is a compile-time guarantee (the `never` type ensures the throw is unreachable), but provides a clean runtime fallback if a future mismatched branch slips through"

patterns-established:
  - "A module-scope `INVALID_DATA = Symbol(...)` + `ParseResult = T | undefined | typeof INVALID_DATA` shape is the clean way to return three outcomes from a parser: absent, present, present-but-invalid"
  - "Discriminated-union dispatchers in UI layer end with `const _exhaustive: never = discriminant` so the compiler flags any future variant that's added without a branch"
  - "Domain errors should be variant names describing WHY the field was rejected, not generic `invalid` umbrellas — `tipo_specifico_non_ammesso` communicates 'the field does not belong to this tipo' which is different from `data_non_valida` ('the value failed parsing')"

requirements-completed: []

# Metrics
duration: ~25min
completed: 2026-04-13
---

# Phase 02 Plan 02-02: Editor gap closure — type-specific fields exhaustive Summary

**Extended the elemento domain with 7 type-specific optional fields + a new ElementoError variant, refactored ElementoEditor to an exhaustive switch over all 8 ElementoTipo with `const _exhaustive: never = tipo`, rewrote handleSave to forward the complete payload to normalizeElementoInput, and pinned the new contract with 13 Vitest cases.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-13T12:55:00Z
- **Completed:** 2026-04-13T13:02:30Z
- **Tasks:** 3 (T01 domain + tests, T02 editor refactor, T03 verification)
- **Files created:** 1
- **Files modified:** 3

## Accomplishments

- **T01** — Extended `ElementoError` with `tipo_specifico_non_ammesso`. Extended `ElementoInput` and `NormalizedElementoInput` with 7 optional type-specific fields mirroring the `Elemento` read model. Rewrote `normalizeElementoInput` with 6 tipo↔field consistency branches (nascita/morte, tribu/ruoli, fazioni/esito, statoProfezia, dettagliRegno, regione), then forwarded the fields into the normalized output. Created `src/features/elemento/__tests__/elemento.rules.test.ts` with 13 test cases.
- **T02** — Refactored `ElementoEditor.tsx`: extended `EditorState` with 6 new fields for evento/periodo dates, added `parseDataStorica` helper with `INVALID_DATA` sentinel, rewrote `handleSave` to build a complete payload (parsed nascita/morte for personaggio, built `date` of kind puntuale/range for evento/periodo, forwarded all 7 type-specific scalars). Added `renderTypeSpecificFields` exhaustive dispatcher with `const _exhaustive: never = tipo` guard. Added 3 new sub-components (`EventoFields`, `PeriodoFields`, `AnnotazioneFields`). Null-guarded the 3 `Select` `onSelectionChange` callbacks (WR-03) removing all `as "aev" | "ev"` casts and `String(key)` patterns. Extended `ERROR_MESSAGES` to cover all 10 `ElementoError` variants (IN-03).
- **T03** — Final verification pass: `npx tsc --noEmit` exits 0, `npx vitest run` exits 0 with 123 tests passing (110 baseline + 13 new). Grep sanity checks confirm the gap is closed.

## Task Commits

Each task was committed atomically with `--no-verify` (worktree parallel-executor protocol — main branch hooks run once after merge):

1. **Task 1: Extend elemento domain + tests** — `fe720a6` (feat) — `feat(02-02): extend elemento domain with type-specific fields + tests`
2. **Task 2: ElementoEditor exhaustive switch + handleSave rewrite** — `ab0c8c7` (feat) — `feat(02-02): ElementoEditor exhaustive switch + handleSave rewrite`
3. **Task 3: Final verification** — no code commit (verification-only task; results documented here)

## Files Created/Modified

### Created
- `src/features/elemento/__tests__/elemento.rules.test.ts` — 13 Vitest cases: shared validation (empty titolo, annotazione minimal), tipo/field consistency (tribu+ruoli on personaggio, tribu on guerra rejected, nascita on evento rejected, fazioni+esito on guerra, statoProfezia on profezia, dettagliRegno on regno, regione on luogo), date validation (NaN nascita → data_non_valida, evento puntuale, periodo valid range, periodo range_order → data_non_valida).

### Modified
- `src/features/elemento/elemento.errors.ts` — Added `{ type: "tipo_specifico_non_ammesso" }` variant to `ElementoError`.
- `src/features/elemento/elemento.rules.ts` — Extended `ElementoInput` + `NormalizedElementoInput` with 7 optional type-specific fields. Rewrote `normalizeElementoInput`: 6 new tipo↔field consistency checks + field forwarding (trimmed, empty → undefined) into the normalized output.
- `src/ui/workspace-home/ElementoEditor.tsx` — Extended `EditorState` + `initState` with 6 date fields for evento/periodo. Added `parseDataStorica` + `INVALID_DATA` sentinel at module scope. Rewrote `handleSave` to build a complete payload. Replaced inline `{tipo === "..."}` branches with `renderTypeSpecificFields(tipo, state, set)` dispatcher. Added `EventoFields`, `PeriodoFields`, `AnnotazioneFields` sub-components + the exhaustive `renderTypeSpecificFields` function with `const _exhaustive: never = tipo` guard. Null-guarded the 3 `Select` callbacks (nascitaEra, morteEra, statoProfezia). Extended `ERROR_MESSAGES` to cover all 10 `ElementoError` variants.

## Decisions Made

- **Option A (extend the domain)** — The plan flagged two routes for closing WR-01: (a) extend `ElementoInput` to mirror `Elemento`, or (b) add a `TODO` comment saying the prototype ignores type-specific fields. Option A was chosen because it matches the stronger interpretation of "editor con campi tipo-specifici" — the domain layer now validates and forwards the data end-to-end, so Jazz wiring in M003 has a real target.
- **`tipo_specifico_non_ammesso` replaces the old `data_non_valida` rule for unowned dates** — The previous `if (input.tipo !== "personaggio" && (input.nascita || input.morte)) return err({ type: "data_non_valida" })` was semantically wrong: the date isn't invalid, it's on the wrong tipo. The new error variant describes WHY the field is rejected (ownership), which is a different failure mode from "value failed parsing".
- **`INVALID_DATA` sentinel symbol** — `parseDataStorica` needs to return 3 outcomes (absent, valid, invalid). A boolean or null would conflate the first two. A unique `Symbol` gives a type-safe third state (`DataStorica | undefined | typeof INVALID_DATA`) that the caller can match on exhaustively.
- **Editor stays as a single file** — Plan explicitly requested no file split. The sub-components share `FieldGroupProps` and the dispatcher, so splitting would fragment cohesive code for no readability win.
- **UI gates type-specific fields by `tipo === "<owner>"` in the payload builder** — Even though the domain is defensive (rejects unowned fields), the UI is constructive: under normal flow `tipo_specifico_non_ammesso` is unreachable from the editor. The defensive check in the rules layer is a belt-and-braces guarantee if future code forgets the gate.
- **`throw new Error` in the default branch of the exhaustive switch** — The `const _exhaustive: never = tipo` assignment is the compile-time guarantee; the runtime throw is dead code today (the `never` type proves it unreachable). It serves as a clean fallback if a future mismatched branch slips through at runtime, e.g. via tainted data from a future persistence layer that bypasses TypeScript.

## Deviations from Plan

### Auto-fixed Issues

None. The plan was executed exactly as written, including the explicit `const _exhaustive: never = tipo` pattern, the 13 test cases (the plan stipulated ≥9; the plan's literal snippet had 13 and they all made sense, so no trimming), and the file-level organization.

**One minor clarification worth recording:** The plan estimated the baseline at 55 existing tests; the actual baseline is 110 tests across 4 test files. This doesn't change any acceptance criterion — the plan's `≥67` lower bound is still satisfied (123 actual). No action required.

---

**Total deviations:** 0 auto-fixed.
**Impact on plan:** None. The plan was self-consistent and accurate. The baseline test count in the plan text was stale (55 vs. 110) but that's informational, not a blocker.

## Issues Encountered

None. All three tasks executed cleanly:
- T01: TDD-style RED/GREEN pattern wasn't strictly followed (domain changes + test file committed together because the test file was the only RED signal for the new variant, and splitting would have meant committing a file that doesn't compile against the old error type) — but the spirit of TDD was preserved: the test file pins behavior, the new code passes it, and the domain contract is fully exercised by the 13 cases.
- T02: `tsc --noEmit` and the full test suite passed on the first try after the refactor. No iteration required.
- T03: Zero new code. Pure verification via `tsc`, `vitest`, and grep.

## Verification

| # | Command | Exit Code | Verdict | Result |
|---|---------|-----------|---------|--------|
| 1 | `npx tsc --noEmit` | 0 | pass | clean, no output |
| 2 | `npx vitest run` | 0 | pass | 5 files, 123/123 (110 baseline + 13 new) |
| 3 | `npx vitest run src/features/elemento/__tests__/elemento.rules.test.ts` | 0 | pass | 1 file, 13/13 |
| 4 | `npx vitest run src/ui/workspace-home/__tests__/display-helpers.test.ts` (regression guard) | 0 | pass | 2 files, 78/78 (no regression on T02-01 verified goal properties) |

### Grep checks (closing the VERIFICATION.md failures)

| Check | Before | After |
|-------|--------|-------|
| `ripgrep 'case "(evento\|periodo\|annotazione)"' src/ui/workspace-home/ElementoEditor.tsx` | 0 | 3 |
| `ripgrep -n 'nascita:\|morte:' src/ui/workspace-home/ElementoEditor.tsx` (handleSave body) | 0 | 2 (lines 215-216) |
| `ripgrep '_exhaustive: never = tipo' src/ui/workspace-home/ElementoEditor.tsx` | 0 | 2 (1 code + 1 comment) |
| `ripgrep 'tipo_specifico_non_ammesso' src/features/elemento/elemento.rules.ts` | 0 | 6 (6 consistency branches) |
| `ripgrep 'tribu\?:' src/features/elemento/elemento.rules.ts` | 0 | 2 (ElementoInput + NormalizedElementoInput) |
| `ripgrep ' as "aev"' src/ui/workspace-home/ElementoEditor.tsx` | 2 | 0 |
| `ripgrep 'String\(key\)' src/ui/workspace-home/ElementoEditor.tsx` | 1 | 0 |
| `ripgrep 'tipo_specifico_non_ammesso' src/ui/workspace-home/ElementoEditor.tsx` | 0 | 1 (ERROR_MESSAGES) |
| `ripgrep 'data_non_valida' src/ui/workspace-home/ElementoEditor.tsx` | 1 | 4 (ERROR_MESSAGES + handleSave early returns) |

### Goal property status (pre-verification for `/gsd-verify-phase 02` re-run)

| # | Truth | Pre-plan | Post-plan |
|---|-------|----------|-----------|
| 1 | Click Modifica → editor inline con campi tipo-specifici per ogni ElementoTipo | FAILED (5/8 variants + handleSave drops type-specific fields) | VERIFIED (8/8 variants via exhaustive switch + handleSave forwards complete payload via parseDataStorica + type-specific scalars) |
| 2 | Annotazioni mie/altrui nel detail | VERIFIED | VERIFIED (untouched) |
| 3 | Soft delete con toast Annulla 30s | VERIFIED | VERIFIED (untouched) |

## Gap Closure Mapping

| Gap | Fix | Commit |
|-----|-----|--------|
| G-01 / WR-01 (handleSave drops type-specific fields) | handleSave rewritten to build complete ElementoInput with nascita/morte via parseDataStorica + date via DataTemporale branch + 7 type-specific scalars gated by `tipo === "<owner>"` | ab0c8c7 |
| G-02 / WR-02 (3 missing ElementoTipo branches + no exhaustiveness) | renderTypeSpecificFields dispatcher with switch over 8 variants + `const _exhaustive: never = tipo` + EventoFields/PeriodoFields/AnnotazioneFields sub-components | ab0c8c7 |
| G-03 (ElementoInput cannot hold type-specific fields) | ElementoInput + NormalizedElementoInput extended with 7 optional fields + normalizeElementoInput validates tipo↔field consistency via new tipo_specifico_non_ammesso variant | fe720a6 |
| IN-03 collateral (ERROR_MESSAGES covers 2/9 variants) | ERROR_MESSAGES extended to cover all 10 ElementoError variants (9 old + tipo_specifico_non_ammesso new) | ab0c8c7 |
| WR-03 collateral (`as "aev" \| "ev"` casts + `String(key)` without null guard) | Select onSelectionChange callbacks use literal-union checks (`if (key === "aev" \|\| key === "ev")`); zero `as` casts and zero `String(key)` remain | ab0c8c7 |

## User Setup Required

None — no external service configuration required. The plan is a pure-domain + pure-UI refactor with no network, no auth, no persistence changes.

## Next Phase Readiness

- `/gsd-verify-phase 02` can be re-run; goal property #1 should flip from `partial` to `verified`, lifting phase status to `verified` (3/3 truths).
- S03 (Fonti e link editor inline) can depend on the extended `ElementoInput` contract — any new editor field (fonti, link ruoli) will plug into the same `normalizeElementoInput` call in `handleSave` via the same tipo-gate pattern.
- M003 (Jazz wiring) now has a real domain target for the 7 type-specific fields — the schema adapter can map 1:1 with the normalized output instead of fighting an impedance mismatch.
- The exhaustive switch pattern (`const _exhaustive: never = tipo`) is now the template for future UI dispatchers over discriminated unions (M004 TipoLink, TipoFonte, etc.).

## Self-Check

- `src/features/elemento/elemento.errors.ts` — FOUND, contains `tipo_specifico_non_ammesso` variant (grep confirmed).
- `src/features/elemento/elemento.rules.ts` — FOUND, `tribu?:` present (2 hits), `tipo_specifico_non_ammesso` present (6 hits).
- `src/features/elemento/__tests__/elemento.rules.test.ts` — FOUND, 13 test cases passing.
- `src/ui/workspace-home/ElementoEditor.tsx` — FOUND, exhaustive switch + 3 new sub-components + parseDataStorica + extended ERROR_MESSAGES present.
- Commit `fe720a6` — FOUND on HEAD~1 (`feat(02-02): extend elemento domain with type-specific fields + tests`).
- Commit `ab0c8c7` — FOUND on HEAD (`feat(02-02): ElementoEditor exhaustive switch + handleSave rewrite`).

## Self-Check: PASSED

---
*Phase: 02-editor-annotazioni*
*Plan: 02-02*
*Completed: 2026-04-13*
