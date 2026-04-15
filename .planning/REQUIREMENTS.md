# Requirements

This file is the explicit capability and coverage contract for the project.

Requirements in `## Active` use the checklist format (`- [x]` / `- [ ]`) so that
`/gsd:stats` can count them. Deferred / post-prototipo requirements stay in
`## Deferred` as structured sections and are excluded from active metrics.

## Active

Capability contract for **M002 — Prototipo completo su layout 3-pane consolidato**.
Ogni requirement è mappato alla slice che lo consegna.

- [x] **R001:** Layout 3-pane consolidato (sidebar + list + detail) con dark mode e ThemeSwitcher FAB a 8 palette — S01
- [x] **R002:** Editor elementi con 8 TipoElemento e campi type-specific via domain contract (`ElementoInput` / `normalizeElementoInput`) — S02
- [x] **R003:** Annotazioni come Elemento first-class con filtering mie/altrui nel detail — S02
- [x] **R004:** Soft delete con toast "Annulla" (finestra 30s) e restore — S02
- [ ] **R005:** Editor inline per-campo app-native (no mode swap, `editingFieldId` sostituisce `isEditing`, Milkdown per descrizione, data-driven empty fields + menu `+ aggiungi campo`, collegamento picker HeroUI popover) — S02
- [ ] **R006:** Fonti documentabili con link cliccabili raggruppati per tipo nel detail — S03
- [ ] **R007:** Link bidirezionali tra elementi con editor inline (selettore TipoLink + RuoloLink parentela) — S03
- [ ] **R008:** Board CRUD (crea da sidebar, rinomina inline, elimina con conferma, vista lista compatta con ordinamento) — S04
- [ ] **R009:** Ricerca cross-view su elementi e board — S04
- [ ] **R010:** Vista timeline D3 SVG con asse verticale, card posizionate, zoom/pan con drag, popup compatto su click card — S05
- [ ] **R011:** Polish iPad-native + scenario UAT end-to-end PASS — S06

## Deferred

### R031 — Untitled
- Status: deferred
- Notes: Post-prototipo. Documentato in .planning/FUTURE.md sotto M004.

### R032 — Untitled
- Status: deferred
- Notes: Post-prototipo. Documentato in .planning/FUTURE.md sotto M004.

### R033 — Untitled
- Status: deferred
- Notes: Post-prototipo. Documentato in .planning/FUTURE.md sotto M004.

### R034 — Untitled
- Status: deferred
- Notes: Post-prototipo. Documentato in .planning/FUTURE.md sotto M004.

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | UI | complete | S01 | — | S01 summary (UAT PASS 2026-04-03) |
| R002 | Domain+UI | complete | S02 | — | S02 02-02 summary (VERIFIED 3/3 2026-04-13) |
| R003 | Domain+UI | complete | S02 | — | S02 02-01 summary |
| R004 | UI | complete | S02 | — | S02 02-01 summary |
| R005 | UX+UI | pending | S02 | — | plan 02-03 (da creare — ex S02.1 folded back) |
| R006 | UI | pending | S03 | — | unmapped |
| R007 | Domain+UI | pending | S03 | — | unmapped |
| R008 | UI | pending | S04 | — | unmapped |
| R009 | UI | pending | S04 | — | unmapped |
| R010 | UI (D3) | pending | S05 | — | unmapped |
| R011 | UX | pending | S06 | — | unmapped |
| R031 | — | deferred | none | none | unmapped |
| R032 | — | deferred | none | none | unmapped |
| R033 | — | deferred | none | none | unmapped |
| R034 | — | deferred | none | none | unmapped |

## Coverage Summary

- Active requirements: 11
- Mapped to slices: 11
- Validated: 4 (R001-R004 via S01-S02)
- Unmapped active requirements: 0
