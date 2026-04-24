# Requirements

This file is the explicit capability and coverage contract for the project.

## Active

### R049 — Commit feedback no-op: blur di un campo senza modifica effettiva non produce notifica
- Class: quality-attribute
- Status: active
- Description: Commit feedback no-op: blur di un campo senza modifica effettiva non produce notifica
- Why it matters: Notifica su no-op è spam. L'utente perde fiducia nel segnale e lo inizia a ignorare.
- Source: user
- Primary owning slice: M002/S03
- Validation: unmapped

### R050 — Inline success feedback su field con peso (descrizione, titolo, data, fonti) tramite hook useFieldStatus unico + presentazioni per tipo controllo
- Class: primary-user-loop
- Status: active
- Description: Inline success feedback su field con peso (descrizione, titolo, data, fonti) tramite hook useFieldStatus unico + presentazioni per tipo controllo
- Why it matters: Feedback di successo dentro il field è meno invasivo del toast e più chiaro (lega visivamente il conferma al campo che ha appena cambiato).
- Source: user
- Primary owning slice: M002/S03
- Validation: unmapped

### R051 — Notification center iPad-native: bell icon in toolbar con badge pulse, drawer right con lista mutazioni, rollback inline su tutte le operazioni (create/update/delete di elementi/link/board/fonti). In-memory per sessione.
- Class: primary-user-loop
- Status: active
- Description: Notification center iPad-native: bell icon in toolbar con badge pulse, drawer right con lista mutazioni, rollback inline su tutte le operazioni (create/update/delete di elementi/link/board/fonti). In-memory per sessione.
- Why it matters: Sostituisce toast invasivo con pattern iOS Mail/Messages. Offre scorrimento di modifiche recenti e rollback esplicito.
- Source: user
- Primary owning slice: M002/S04
- Validation: unmapped

### R052 — Rimozione completa toast HeroUI — drawer assorbe tutti i casi d'uso (success, info, errori di mutazione, soft-delete-undo)
- Class: constraint
- Status: active
- Description: Rimozione completa toast HeroUI — drawer assorbe tutti i casi d'uso (success, info, errori di mutazione, soft-delete-undo)
- Why it matters: Coerenza: un solo canale di feedback per tutte le mutazioni. Elimina ambiguità "quando esce toast vs drawer".
- Source: user
- Primary owning slice: M002/S04
- Validation: unmapped

### R053 — A11y baseline: focus ring su tutti gli interattivi, keyboard nav sidebar→list→detail, aria-label su icon-only button, prefers-reduced-motion rispettato
- Class: compliance/security
- Status: active
- Description: A11y baseline: focus ring su tutti gli interattivi, keyboard nav sidebar→list→detail, aria-label su icon-only button, prefers-reduced-motion rispettato
- Why it matters: WCAG 2.1 AA è principio fondamentale (Principio III). M001 ha gap a11y lasciati su icon-only controls.
- Source: user
- Primary owning slice: M002/S05
- Validation: unmapped

### R054 — Density/spacing uniforme + feedback tattile &lt;100ms + transizioni solo opacity/transform su tutti i nuovi componenti
- Class: quality-attribute
- Status: active
- Description: Density/spacing uniforme + feedback tattile &lt;100ms + transizioni solo opacity/transform su tutti i nuovi componenti
- Why it matters: Principio IX performance + feel nativo. Previene regressioni future (transition-all su width/height).
- Source: inferred
- Primary owning slice: M002/S05
- Validation: unmapped

### R055 — Audit Jazz reale: 4 scenari browser documentati (reload persistenza, multi-tab CRDT propagation, offline→online resync, conferma intenzionalità sync:never per assenza API key)
- Class: integration
- Status: active
- Description: Audit Jazz reale: 4 scenari browser documentati (reload persistenza, multi-tab CRDT propagation, offline→online resync, conferma intenzionalità sync:never per assenza API key)
- Why it matters: Jazz già integrato in M001 ma mai stress-tested. M003 (cloud sync) partirà da basi note.
- Source: user
- Primary owning slice: M002/S06
- Validation: unmapped

### R056 — Quality gate pre-slice-complete: revisione skill ui-ux-pro-max obbligatoria su ogni slice UI di M002
- Class: quality-attribute
- Status: active
- Description: Quality gate pre-slice-complete: revisione skill ui-ux-pro-max obbligatoria su ogni slice UI di M002
- Why it matters: Polish milestone ha polish come output. Senza audit esterno sistematico i fix sono guidati solo da sensibilità del momento.
- Source: user
- Primary owning slice: M002/S07
- Validation: unmapped

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

### R006 — Fonti documentabili con link cliccabili raggruppati per FonteTipo
- Class: ui
- Status: validated
- Description: Fonti documentabili con link cliccabili raggruppati per FonteTipo
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S03
- Validation: S03 SUMMARY (completed 2026-04-22): FonteTipo union 5-variant, addFonte/removeFonte puri con Result<T,E>, grouped fonti rendering nel detail. 126/126 test.
- Notes: Link cliccabili raggruppati per FonteTipo nel detail.

### R007 — Link bidirezionali tra elementi con editor inline e propagazione automatica inverso
- Class: domain+ui
- Status: validated
- Description: Link bidirezionali tra elementi con editor inline e propagazione automatica inverso
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S03
- Validation: S03 SUMMARY (completed 2026-04-22): createBidirectionalLink/removeBidirectionalLink atomici, selettore TipoLink + RuoloLink parentela, inverso propagato automaticamente. 126/126 test.
- Notes: Selettore TipoLink + RuoloLink parentela; creazione propaga inverso automatico.

### R008 — Board CRUD: crea da sidebar, rinomina inline, elimina con conferma, vista lista compatta
- Class: ui
- Status: validated
- Description: Board CRUD: crea da sidebar, rinomina inline, elimina con conferma, vista lista compatta
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S04
- Validation: S04 T01 PASS: Board CRUD (create, rename, delete) wired from NavSidebar via Jazz CoList. 111/111 tests pass, tsc clean, build OK. Console.debug events board-creato/rinominato/eliminato verified. 2026-04-23.
- Notes: Crea da sidebar, rinomina inline, elimina con conferma, vista lista compatta con ordinamento.

### R009 — Ricerca cross-view in titolo, tags e descrizione
- Class: ui
- Status: validated
- Description: Ricerca cross-view in titolo, tags e descrizione
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S04
- Validation: S04 T02 PASS: isElementMatchingSearch covers titolo+descrizione+tags; getElementsForView delegates to it; sortElementi pure sort (titolo/data/tipo, asc/desc); 126/126 tests pass. 2026-04-23.

### R010 — Vista timeline D3 SVG: asse verticale, card posizionate, zoom/pan, popup compatto su click
- Class: ui-d3
- Status: validated
- Description: Vista timeline D3 SVG: asse verticale, card posizionate, zoom/pan, popup compatto su click
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S06
- Validation: S06 SUMMARY (completed 2026-04-23): timeline D3 SVG verticale con zoom/pan via rescaleY, card collision-free, popup compatto su click. 126/126 test, tsc+build clean.
- Notes: Owner corretto: S06 (non S05 — S05 era un ghost slice duplicato di S04, skippato).

### R011 — Polish iPad-native + scenario UAT end-to-end PASS
- Class: ux
- Status: validated
- Description: Polish iPad-native + scenario UAT end-to-end PASS
- Source: .planning/REQUIREMENTS.md (migrated)
- Primary owning slice: S07
- Validation: S07 T01 PASS: all forbidden width/height animations replaced with transition-[opacity,transform]; touch targets ≥44px across NavSidebar, ListPane, FullscreenOverlay, ElementoEditor, ThemeSwitcher, Timeline popup button; prefers-reduced-motion in tokens.css confirmed. 126/126 tests pass, tsc clean. 2026-04-23.
- Notes: Owner corretto: S07 (il file S06-PLAN.md aveva titolo "Polish" ma contenuto Timeline; R011 Polish+UAT è in S07).

### R046 — Linguaggio UI di dominio — zero termini tecnici esposti (markdown, panel, toast, field)
- Class: quality-attribute
- Status: validated
- Description: Linguaggio UI di dominio — zero termini tecnici esposti (markdown, panel, toast, field)
- Why it matters: Un'app iPad-nativa parla il linguaggio dell'utente, non dello sviluppatore. Termini tecnici rompono l'illusione di app finita.
- Source: user
- Primary owning slice: M002/S01
- Validation: S01 T01 PASS 2026-04-24: All 3 user-visible technical strings in ElementoEditor.tsx replaced with Italian domain language. rg scan confirms 0 user-visible markdown/mockup/detail-pane strings in src/ui/ (excluding mockups/). 126/126 tests pass, tsc clean.

### R047 — Layout fullheight su iPad landscape 1180×820 e portrait — nessuno scroll esterno, content scroll interno
- Class: quality-attribute
- Status: validated
- Description: Layout fullheight su iPad landscape 1180×820 e portrait — nessuno scroll esterno, content scroll interno
- Why it matters: App che non occupa 100% viewport si percepisce come sito web, non app nativa.
- Source: user
- Primary owning slice: M002/S01
- Validation: S01 T02 PASS 2026-04-24: WorkspacePreviewPage root changed to h-dvh; NavSidebar nav and ListPane inner div have h-full. Verified: 0 h-screen hits in root, h-dvh present, h-full on both wrappers. 126/126 tests pass, tsc clean.

### R048 — Warning solo per validità reale (data invalida, referenza rotta). Mai per completezza (manca descrizione/tag/link).
- Class: failure-visibility
- Status: validated
- Description: Warning solo per validità reale (data invalida, referenza rotta). Mai per completezza (manca descrizione/tag/link).
- Why it matters: Warning fasulli creano rumore e allenano l'utente a ignorare i segnali. Solo validità reale preserva la forza del warning.
- Source: user
- Primary owning slice: M002/S02
- Validation: S02 PASS 2026-04-24: computeValidityWarnings checks only real validity (date invalida, referenza rotta). Completeness strings (manca descrizione, nessun ruolo, tag vuoti, nessun collegamento) fully removed from ElementoEditor. 135/135 tests pass, tsc clean. rg scan confirms 0 completeness strings in src/.
- Notes: Implemented in M007/S02 — domain helper computeValidityWarnings in elemento.rules.ts; wired into ElementoEditor replacing local getWarnings.

## Deferred

### R057 — Notifiche persistite cross-sessione (sopravvivono al reload)
- Class: admin/support
- Status: deferred
- Description: Notifiche persistite cross-sessione (sopravvivono al reload)
- Why it matters: Potenzialmente utile per tracking storico mutazioni, ma aggiunge CoMap Notifica e complica schema Jazz. Rimandato.
- Source: user
- Validation: unmapped
- Notes: Oggi in-memory per sessione corrente. Riconsiderare dopo M003 se multi-device sync lo rende più valorioso.

### R058 — Inline success feedback esteso a field leggeri (toggle, switch, chip tag)
- Class: admin/support
- Status: deferred
- Description: Inline success feedback esteso a field leggeri (toggle, switch, chip tag)
- Why it matters: Field leggeri rischiano affollamento visivo. Valutare dopo aver osservato il pattern su field con peso.
- Source: user
- Validation: unmapped

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
| R006 | ui | validated | S03 | none | S03 SUMMARY (completed 2026-04-22): FonteTipo union 5-variant, addFonte/removeFonte puri con Result<T,E>, grouped fonti rendering nel detail. 126/126 test. |
| R007 | domain+ui | validated | S03 | none | S03 SUMMARY (completed 2026-04-22): createBidirectionalLink/removeBidirectionalLink atomici, selettore TipoLink + RuoloLink parentela, inverso propagato automaticamente. 126/126 test. |
| R008 | ui | validated | S04 | none | S04 T01 PASS: Board CRUD (create, rename, delete) wired from NavSidebar via Jazz CoList. 111/111 tests pass, tsc clean, build OK. Console.debug events board-creato/rinominato/eliminato verified. 2026-04-23. |
| R009 | ui | validated | S04 | none | S04 T02 PASS: isElementMatchingSearch covers titolo+descrizione+tags; getElementsForView delegates to it; sortElementi pure sort (titolo/data/tipo, asc/desc); 126/126 tests pass. 2026-04-23. |
| R010 | ui-d3 | validated | S06 | none | S06 SUMMARY (completed 2026-04-23): timeline D3 SVG verticale con zoom/pan via rescaleY, card collision-free, popup compatto su click. 126/126 test, tsc+build clean. |
| R011 | ux | validated | S07 | none | S07 T01 PASS: all forbidden width/height animations replaced with transition-[opacity,transform]; touch targets ≥44px across NavSidebar, ListPane, FullscreenOverlay, ElementoEditor, ThemeSwitcher, Timeline popup button; prefers-reduced-motion in tokens.css confirmed. 126/126 tests pass, tsc clean. 2026-04-23. |
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
| R046 | quality-attribute | validated | M002/S01 | none | S01 T01 PASS 2026-04-24: All 3 user-visible technical strings in ElementoEditor.tsx replaced with Italian domain language. rg scan confirms 0 user-visible markdown/mockup/detail-pane strings in src/ui/ (excluding mockups/). 126/126 tests pass, tsc clean. |
| R047 | quality-attribute | validated | M002/S01 | none | S01 T02 PASS 2026-04-24: WorkspacePreviewPage root changed to h-dvh; NavSidebar nav and ListPane inner div have h-full. Verified: 0 h-screen hits in root, h-dvh present, h-full on both wrappers. 126/126 tests pass, tsc clean. |
| R048 | failure-visibility | validated | M002/S02 | none | S02 PASS 2026-04-24: computeValidityWarnings checks only real validity (date invalida, referenza rotta). Completeness strings (manca descrizione, nessun ruolo, tag vuoti, nessun collegamento) fully removed from ElementoEditor. 135/135 tests pass, tsc clean. rg scan confirms 0 completeness strings in src/. |
| R049 | quality-attribute | active | M002/S03 | none | unmapped |
| R050 | primary-user-loop | active | M002/S03 | none | unmapped |
| R051 | primary-user-loop | active | M002/S04 | none | unmapped |
| R052 | constraint | active | M002/S04 | none | unmapped |
| R053 | compliance/security | active | M002/S05 | none | unmapped |
| R054 | quality-attribute | active | M002/S05 | none | unmapped |
| R055 | integration | active | M002/S06 | none | unmapped |
| R056 | quality-attribute | active | M002/S07 | none | unmapped |
| R057 | admin/support | deferred | none | none | unmapped |
| R058 | admin/support | deferred | none | none | unmapped |

## Coverage Summary

- Active requirements: 8
- Mapped to slices: 8
- Validated: 14 (R001, R002, R003, R004, R005, R006, R007, R008, R009, R010, R011, R046, R047, R048)
- Unmapped active requirements: 0
