# Requirements

This file is the explicit capability and coverage contract for the project.

## Active

### R006 — Fonti documentabili con link cliccabili raggruppati per FonteTipo
- Class: ui
- Status: active
- Description: Fonti documentabili con link cliccabili raggruppati per FonteTipo
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S03
- Notes: Link cliccabili raggruppati per FonteTipo nel detail.

### R007 — Link bidirezionali tra elementi con editor inline e propagazione automatica inverso
- Class: domain+ui
- Status: active
- Description: Link bidirezionali tra elementi con editor inline e propagazione automatica inverso
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S03
- Notes: Selettore TipoLink + RuoloLink parentela; creazione propaga inverso automatico.

### R008 — Board CRUD: crea da sidebar, rinomina inline, elimina con conferma, vista lista compatta
- Class: ui
- Status: active
- Description: Board CRUD: crea da sidebar, rinomina inline, elimina con conferma, vista lista compatta
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S04
- Notes: Crea da sidebar, rinomina inline, elimina con conferma, vista lista compatta con ordinamento.

### R009 — Ricerca cross-view in titolo, tags e descrizione
- Class: ui
- Status: active
- Description: Ricerca cross-view in titolo, tags e descrizione
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S04

### R010 — Vista timeline D3 SVG: asse verticale, card posizionate, zoom/pan, popup compatto su click
- Class: ui-d3
- Status: active
- Description: Vista timeline D3 SVG: asse verticale, card posizionate, zoom/pan, popup compatto su click
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S05
- Notes: Asse verticale, card posizionate, zoom/pan con drag, popup compatto su click card.

### R011 — Polish iPad-native + scenario UAT end-to-end PASS
- Class: ux
- Status: active
- Description: Polish iPad-native + scenario UAT end-to-end PASS
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S06

## Validated

### R001 — Layout 3-pane consolidato con dark mode e ThemeSwitcher FAB
- Class: ui
- Status: validated
- Description: Layout 3-pane consolidato con dark mode e ThemeSwitcher FAB
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S01
- Validation: UAT PASS 2026-04-03 (S01 summary)
- Notes: S01 summary (UAT PASS 2026-04-03)

### R002 — Editor elementi con 8 TipoElemento e campi type-specific
- Class: domain+ui
- Status: validated
- Description: Editor elementi con 8 TipoElemento e campi type-specific
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S02
- Validation: VERIFIED 3/3 2026-04-13 (S02 plan 02-02 summary)
- Notes: S02 plan 02-02 summary (VERIFIED 3/3 2026-04-13)

### R003 — Annotazioni come Elemento first-class con filtering mie/altrui
- Class: domain+ui
- Status: validated
- Description: Annotazioni come Elemento first-class con filtering mie/altrui
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S02
- Validation: S02 plan 02-01 summary
- Notes: S02 plan 02-01 summary

### R004 — Soft delete con toast Annulla (finestra 30s) e restore
- Class: ui
- Status: validated
- Description: Soft delete con toast Annulla (finestra 30s) e restore
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S02
- Validation: S02 plan 02-01 summary
- Notes: S02 plan 02-01 summary

### R005 — Editor inline per-campo app-native: no mode swap, editingFieldId, Milkdown descrizione, menu aggiungi campo
- Class: ux-ui
- Status: validated
- Description: Editor inline per-campo app-native: no mode swap, editingFieldId, Milkdown descrizione, menu aggiungi campo
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S02
- Validation: S02 plan 02-04 + 02-05: ElementoEditor riscritto su UnifiedEditorMockup con editingFieldId, commit grammar unificato (blur-to-save + toast undo 5s), add-field globale, popover/drawer per flow compositi. Lint + 78 test pass 2026-04-22.
- Notes: No mode swap, editingFieldId sostituisce isEditing, Milkdown per descrizione, data-driven empty fields + menu + aggiungi campo, collegamento picker HeroUI popover.

## Out of Scope

### R031 — Untitled
- Class: core-capability
- Status: out-of-scope
- Source: inferred
- Notes: Voce vuota dalla migrazione .planning — rimossa.

### R032 — Untitled
- Class: core-capability
- Status: out-of-scope
- Source: inferred
- Notes: Voce vuota dalla migrazione .planning — rimossa.

### R033 — Untitled
- Class: core-capability
- Status: out-of-scope
- Source: inferred
- Notes: Voce vuota dalla migrazione .planning — rimossa.

### R034 — Untitled
- Class: core-capability
- Status: out-of-scope
- Source: inferred
- Notes: Voce vuota dalla migrazione .planning — rimossa.

### R035 — Layout 3-pane consolidato con dark mode e ThemeSwitcher FAB
- Class: ui
- Status: out-of-scope
- Description: Layout 3-pane consolidato con dark mode e ThemeSwitcher FAB
- Why it matters: Base navigazionale dell'intera app — senza un layout solido nessuna altra feature ha contesto.
- Source: user
- Primary owning slice: S01
- Validation: UAT PASS 2026-04-03 (S01 summary)
- Notes: Duplicato di R001 — rimosso.

### R036 — Editor elementi con 8 TipoElemento e campi type-specific
- Class: domain+ui
- Status: out-of-scope
- Description: Editor elementi con 8 TipoElemento e campi type-specific
- Why it matters: Il dominio ha 8 tipi di elemento con campi diversi — l'editor deve adattarsi al tipo selezionato.
- Source: user
- Primary owning slice: S02
- Validation: VERIFIED 3/3 2026-04-13 (S02 plan 02-02 summary)
- Notes: Duplicato di R002 — rimosso.

### R037 — Annotazioni come Elemento first-class con filtering mie/altrui
- Class: domain+ui
- Status: out-of-scope
- Description: Annotazioni come Elemento first-class con filtering mie/altrui
- Why it matters: Le annotazioni sono pensieri personali per-utente ma entità di prima classe nel dominio — ricercabili, listabili, taggabili. (D021)
- Source: user
- Primary owning slice: S02
- Validation: S02 plan 02-01 summary
- Notes: Duplicato di R003 — rimosso.

### R038 — Soft delete con toast Annulla (finestra 30s) e restore
- Class: ui
- Status: out-of-scope
- Description: Soft delete con toast Annulla (finestra 30s) e restore
- Why it matters: Eliminazione accidentale è un rischio reale — finestra di undo 30s previene perdita dati senza modal di conferma blocker.
- Source: user
- Primary owning slice: S02
- Validation: S02 plan 02-01 summary
- Notes: Duplicato di R004 — rimosso.

### R039 — Editor inline per-campo app-native: no mode swap, editingFieldId, Milkdown descrizione, menu aggiungi campo
- Class: ux-ui
- Status: out-of-scope
- Description: Editor inline per-campo app-native: no mode swap, editingFieldId, Milkdown descrizione, menu aggiungi campo
- Why it matters: L'editor deve sembrare nativo iPad — edit inline senza switch di modalità è il pattern Apple Notes/Notion.
- Source: user
- Primary owning slice: S02
- Notes: Duplicato di R005 — rimosso.

### R040 — Fonti documentabili con link cliccabili raggruppati per FonteTipo
- Class: ui
- Status: out-of-scope
- Description: Fonti documentabili con link cliccabili raggruppati per FonteTipo
- Why it matters: Principio fonte-first: ogni informazione deve essere tracciabile in meno di 2 secondi.
- Source: user
- Primary owning slice: S03
- Notes: Duplicato di R006 — rimosso.

### R041 — Link bidirezionali tra elementi con editor inline e propagazione automatica inverso
- Class: domain+ui
- Status: out-of-scope
- Description: Link bidirezionali tra elementi con editor inline e propagazione automatica inverso
- Why it matters: Il grafo di relazioni è il cuore del dominio — senza link bidirezionali la navigazione contestuale non funziona.
- Source: user
- Primary owning slice: S03
- Notes: Duplicato di R007 — rimosso.

### R042 — Board CRUD: crea da sidebar, rinomina inline, elimina con conferma, vista lista compatta
- Class: ui
- Status: out-of-scope
- Description: Board CRUD: crea da sidebar, rinomina inline, elimina con conferma, vista lista compatta
- Why it matters: I board sono le query salvate dell'utente — senza CRUD non si possono organizzare le viste.
- Source: user
- Primary owning slice: S04
- Notes: Duplicato di R008 — rimosso.

### R043 — Ricerca cross-view in titolo, tags e descrizione
- Class: ui
- Status: out-of-scope
- Description: Ricerca cross-view in titolo, tags e descrizione
- Why it matters: Con centinaia di elementi, la ricerca è il percorso primario di navigazione.
- Source: user
- Primary owning slice: S04
- Notes: Duplicato di R009 — rimosso.

### R044 — Vista timeline D3 SVG: asse verticale, card posizionate, zoom/pan, popup compatto su click
- Class: ui-d3
- Status: out-of-scope
- Description: Vista timeline D3 SVG: asse verticale, card posizionate, zoom/pan, popup compatto su click
- Why it matters: Timeline è nel nome del prodotto — è la vista primaria per navigare eventi nel tempo.
- Source: user
- Primary owning slice: S05
- Notes: Duplicato di R010 — rimosso.

### R045 — Polish iPad-native + scenario UAT end-to-end PASS
- Class: ux
- Status: out-of-scope
- Description: Polish iPad-native + scenario UAT end-to-end PASS
- Why it matters: L'app deve sembrare nativa iPad — senza il polish finale il prototipo non è validabile con utenti reali.
- Source: user
- Primary owning slice: S06
- Notes: Duplicato di R011 — rimosso.

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | ui | validated | S01 | none | UAT PASS 2026-04-03 (S01 summary) |
| R002 | domain+ui | validated | S02 | none | VERIFIED 3/3 2026-04-13 (S02 plan 02-02 summary) |
| R003 | domain+ui | validated | S02 | none | S02 plan 02-01 summary |
| R004 | ui | validated | S02 | none | S02 plan 02-01 summary |
| R005 | ux-ui | validated | S02 | none | S02 plan 02-04 + 02-05: ElementoEditor riscritto su UnifiedEditorMockup con editingFieldId, commit grammar unificato (blur-to-save + toast undo 5s), add-field globale, popover/drawer per flow compositi. Lint + 78 test pass 2026-04-22. |
| R006 | ui | active | S03 | none | unmapped |
| R007 | domain+ui | active | S03 | none | unmapped |
| R008 | ui | active | S04 | none | unmapped |
| R009 | ui | active | S04 | none | unmapped |
| R010 | ui-d3 | active | S05 | none | unmapped |
| R011 | ux | active | S06 | none | unmapped |
| R031 | core-capability | out-of-scope | none | none | unmapped |
| R032 | core-capability | out-of-scope | none | none | unmapped |
| R033 | core-capability | out-of-scope | none | none | unmapped |
| R034 | core-capability | out-of-scope | none | none | unmapped |
| R035 | ui | out-of-scope | S01 | none | UAT PASS 2026-04-03 (S01 summary) |
| R036 | domain+ui | out-of-scope | S02 | none | VERIFIED 3/3 2026-04-13 (S02 plan 02-02 summary) |
| R037 | domain+ui | out-of-scope | S02 | none | S02 plan 02-01 summary |
| R038 | ui | out-of-scope | S02 | none | S02 plan 02-01 summary |
| R039 | ux-ui | out-of-scope | S02 | none | unmapped |
| R040 | ui | out-of-scope | S03 | none | unmapped |
| R041 | domain+ui | out-of-scope | S03 | none | unmapped |
| R042 | ui | out-of-scope | S04 | none | unmapped |
| R043 | ui | out-of-scope | S04 | none | unmapped |
| R044 | ui-d3 | out-of-scope | S05 | none | unmapped |
| R045 | ux | out-of-scope | S06 | none | unmapped |

## Coverage Summary

- Active requirements: 6
- Mapped to slices: 6
- Validated: 5 (R001, R002, R003, R004, R005)
- Unmapped active requirements: 0
