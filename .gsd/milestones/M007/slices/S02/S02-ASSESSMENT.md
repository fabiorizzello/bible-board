---
sliceId: S02
uatType: artifact-driven
verdict: PASS
date: 2026-04-24T11:54:30.000Z
---

# UAT Result — S02

## Checks

| Check | Mode | Result | Notes |
|-------|------|--------|-------|
| TC-01: Elemento minimale (solo titolo, annotazione) → 0 warning | artifact | PASS | Unit test "elemento minimale (solo titolo, annotazione) → nessun warning" passes. `computeValidityWarnings({titolo:"Test", tipo:"annotazione", link:[], ...}, resolveAll)` → `[]` (length 0). |
| TC-02: Data elemento malformata → 1 warning field='date', label='Data', message="La data dell'elemento non è valida." | artifact | PASS | Unit test "elemento con date malformata → 1 warning field='date'" passes. Message confirmed in `elemento.rules.ts:344`. VALIDITY_LABEL_MAP maps `date` → `"Data"`. |
| TC-03: Data di nascita malformata (tipo Personaggio) → 1 warning field='nascita', label='Nascita', message="La data di nascita non è valida." | artifact | PASS | Unit test "personaggio con nascita invalida → warning field='nascita'" passes. Message confirmed in `elemento.rules.ts:348`. VALIDITY_LABEL_MAP maps `nascita` → `"Nascita"`. |
| TC-04: Data di morte malformata (tipo Personaggio) → 1 warning field='morte', label='Morte', message="La data di morte non è valida." | artifact | PASS | Unit test "personaggio con morte invalida → warning field='morte'" passes. Message confirmed in `elemento.rules.ts:352`. VALIDITY_LABEL_MAP maps `morte` → `"Morte"`. |
| TC-05: Link a elemento soft-deleted → 1 warning field='link', targetId incluso | artifact | PASS | Unit test "elemento con link a targetId non risolto → 1 warning field='link' con targetId" passes. `warnings[0].targetId === "missing-id"` confirmed. Message "Collegamento a elemento non trovato (potrebbe essere stato eliminato)." at `elemento.rules.ts:360`. |
| TC-06: Link a elemento esistente → 0 warning | artifact | PASS | Unit test "elemento con link a targetId risolto → 0 warning" passes. `computeValidityWarnings(el, resolveAll)` → length 0. |
| TC-07: Mix link (1 valido + 1 rotto) → esattamente 1 warning per link rotto | artifact | PASS | Unit test "elemento con 2 link misti (1 ok, 1 broken) → esattamente 1 warning con targetId del broken link" passes. `warnings.length === 1`, `warnings[0].targetId === "bad-id"`. |
| TC-08: Regressione completezza — descrizione/tag/ruoli/link vuoti → 0 warning | artifact | PASS | Unit test "descrizione vuota, tags vuoti, ruoli vuoti, link vuoti NON producono warning (regression anti-completeness)" passes. `rg -i 'manca una descrizione\|nessun ruolo definito\|tag sono vuoti\|nessun collegamento visibile' src/` → 0 matches. `getWarnings` function fully removed (0 matches in ElementoEditor.tsx). |
| Full test suite (135 tests) | runtime | PASS | `pnpm test --run` → 5 test files, 135/135 passed. |
| TypeScript strict check | runtime | PASS | `pnpm tsc --noEmit` → clean, no errors. |

## Overall Verdict

PASS — All 8 TC checks and both runtime checks pass; completeness strings fully absent from codebase, validity-only warnings wired correctly through domain → UI mapping.

## Notes

- `VALIDITY_FIELD_MAP` correctly maps `date`/`nascita`/`morte` → `"vita"` (EditableFieldId) and `link` → `"collegamenti-generici"`.
- `VALIDITY_LABEL_MAP` produces the exact labels expected by each TC: `"Data"`, `"Nascita"`, `"Morte"`, `"Collegamento"`.
- `ValidityWarning.targetId` is `readonly string | undefined` — present on link warnings, absent on date warnings, matching TC-05 expectation.
- Live browser verification (ReviewDrawer rendering) is not automatable in artifact-driven mode; the domain+UI wiring is fully covered by unit tests and static analysis.
