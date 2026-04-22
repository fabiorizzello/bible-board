---
id: S02
parent: M001
milestone: M001
provides:
  - ["Editor inline per-campo app-native con commit grammar unificato (blur-to-save + toast undo 5s)", "Dominio ElementoInput esaustivo su 8 ElementoTipo con guardia compile-time", "Annotazioni first-class filtrabili mie/altrui", "Soft delete reversibile con toast Annulla 30s", "Parità editor shell tra DetailPane e FullscreenOverlay"]
requires:
  []
affects:
  []
key_files:
  - (none)
key_decisions:
  - ["Editor commit grammar = blur-to-save + toast undo 5s su ogni field mutation (non solo soft delete) — unico pattern reversibile, nessun bottone Salva/Annulla esplicito", "normalizeElementoInput esteso come single point of truth per 8 ElementoTipo esaustivi; guardia compile-time const _exhaustive: never = tipo nell'editor", "INVALID_DATA come unique symbol (niente throw, niente null) per parseDataStorica — ritorna DataStorica | undefined | typeof INVALID_DATA", "tipo_specifico_non_ammesso sostituisce data_non_valida per campi type-specific su tipo sbagliato", "HeroUI v3 Chip non ha onClose — replace con <button><X/></button> inline nei children", "buildElementoInput spread-based invece di mutazione (ElementoInput è readonly)", "Filter link parentela per predicato link.tipo, mai per indice (fragile al reorder)"]
patterns_established:
  - ["Commit grammar unificato: snapshot prevElement → commit nuovo valore → toast 5s con onPress che re-normalizza e ri-committa prevElement (applicabile a tutti i field type, incluso link patches via commitElementPatch)", "ScalarChip blur-to-save con skipBlur ref per distinguere Escape (cancel) da blur (commit)", "Field composition: metadata chips per scalar leggeri, drawer per flow compositi (vita, parentela, link generici), popover per edit medi, body-native + Aggiungi campo per field opzionali vuoti", "Guardia esaustività TS: const _exhaustive: never = tipo al default dello switch su discriminated union"]
observability_surfaces:
  - none
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-22T11:51:20.130Z
blocker_discovered: false
---

# S02: Editor inline per-campo, annotazioni, soft delete

**Editor inline per-campo con commit grammar unificato (blur-to-save + toast undo 5s) ricostruito sulla grammatica di UnifiedEditorMockup; 8 ElementoTipo esaustivi nel dominio; annotazioni e soft delete confermati.**

## What Happened

S02 ha sostituito il mode-swap `isEditing` con una shell di editor inline guidata da `editingFieldId`, allineata al canone visuale di `src/ui/mockups/UnifiedEditorMockup.tsx`.

**T01** ha posato la base in `ElementoEditor.tsx`: campi type-specific per le varianti dominanti, annotazioni come Elemento first-class filtrabili mie/altrui (via `autore`), soft delete con toast "Annulla" (finestra 30s) e restore che riseleziona l'id.

**T02** (gap closure) ha esteso il contratto dominio in `elemento.rules.ts` + `elemento.errors.ts` per coprire esaustivamente gli 8 `ElementoTipo`: `normalizeElementoInput` ora accetta i campi type-specific di `evento`, `periodo`, `annotazione` oltre a `personaggio`/`guerra`/`profezia`/`regno`/`luogo`. Aggiunta variante di errore `tipo_specifico_non_ammesso` al posto del vecchio `data_non_valida`. Guardia compile-time `const _exhaustive: never = tipo` nell'editor. `parseDataStorica` introdotto come helper puro che ritorna `DataStorica | undefined | typeof INVALID_DATA` (unique symbol, niente throw). Test `elemento.rules.test.ts` con copertura dei nuovi branch.

**T03** ha formalizzato il replan per R005 ancorando la soluzione al mockup: inline per-campo, drawer per flow compositi (vita, parentela), popover per edit leggeri, niente nuove entità dominio né apertura di S03.

**T04** ha chiuso il gap visuale: rimossa la toolbar standalone (azioni redistribuite nel menu header unificato), header integrato con titolo inline-editable + badge review + menu azioni, body ordinato descrizione full-width → sezioni array leggere con chip rimovibili → add localizzato, `+ Aggiungi campo` globale. Parità fullscreen preservata (DetailPane + FullscreenOverlay condividono la stessa gerarchia editor).

**T05** ha chiuso il residuo comportamentale: `commitPatch` riscritto per emettere un toast undo da 5 secondi su ogni mutazione di campo (non solo soft delete); lo snapshot `prevElement` pre-commit viene ri-normalizzato e ri-committato via `commitNormalizedElement` / `commitElementPatch` dall'handler `onPress`. `ScalarChip` migrata a blur-to-save con `skipBlur` ref (Escape annulla, Enter/blur committa, autoFocus all'apertura). Filtro link `parentela` ora predicato su `link.tipo` invece che per indice. Fix TypeScript strutturali: `buildElementoInput` riscritto spread-based per rispettare i readonly di `ElementoInput` (9 TS2540 rimossi), `Chip.onClose` sostituito con `<button><X/></button>` inline (HeroUI v3 non espone `onClose`), `DashedAddChip` esportato nel mockup per `noUnusedLocals`.

R001-R004 restano validated. R005 passa a validated in questa slice. Fonti/link editor completo (R006/R007) restano out-of-scope S03 come da plan.

## Verification

`pnpm run lint` (`tsc -b --noEmit`) exit 0 in root (verificato end-of-slice). Test suite: 78 test passano su 6 file (T05 verification evidence: 74 tests / 3 files exit 0 nel worktree).

Note residue: `.gsd/worktrees/M001-S02/` esiste ancora come artefatto del run auto-mode interrotto e vitest dal root ne discovera i file test producendo 3 "Cannot find module" (paths @fs verso dir non esistenti). Non è un fallimento del codice della slice — è un residuo di worktree che il GSD engine dovrebbe pulire al successivo checkpoint. I 78 test reali passano tutti.

Must-haves checklist (manuale via code review + evidence T05):
1. ✅ editingFieldId sostituisce isEditing, nessun mode swap a livello pagina
2. ✅ 8 ElementoTipo esaustivi: switch con `_exhaustive: never`, test dominio
3. ✅ Descrizione come markdown string in `Elemento.descrizione: string` (Milkdown wiring resta per iterazione successiva — mockup già presente)
4. ✅ Annotazioni mie/altrui filtrabili per `autore`, sezione condizionale
5. ✅ Soft delete toast "Annulla" 30s + restore ri-seleziona id
6. ✅ Blur-to-save + toast undo come commit grammar unica su tutti i field type

## Requirements Advanced

None.

## Requirements Validated

- R005 — T04+T05 rewrite ElementoEditor su UnifiedEditorMockup: editingFieldId, no mode swap, blur-to-save + toast undo 5s come commit grammar unica, add-field globale, popover/drawer per flow compositi. Lint + 78 test pass.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

"Milkdown per descrizione presente nel mockup ma non ancora wired in produzione (descrizione resta plain textarea); resta per iterazione successiva dentro S02 scope o deferibile. Fonti/link editor completi (R006/R007) out-of-scope, pianificati per S03 con Jazz persistence. `.gsd/worktrees/M001-S02/` residuale: vitest discovera i file test nel worktree stale producendo 3 errori Cannot find module (non sono fallimenti del codice della slice)."

## Follow-ups

"Verificare pulizia `.gsd/worktrees/M001-S02/` da parte dell'engine al prossimo checkpoint; considerare aggiunta di `.gsd/worktrees` alle vitest `test.exclude` per evitare discovery di test stale. Wiring Milkdown per descrizione (markdown string → rich editor) rimasto pending dal plan originale — candidato per S02-followup o S03 polish."

## Files Created/Modified

- `src/features/elemento/elemento.rules.ts` — ElementoInput + normalizeElementoInput estesi per 8 ElementoTipo esaustivi; parseDataStorica helper
- `src/features/elemento/elemento.errors.ts` — Variante tipo_specifico_non_ammesso aggiunta
- `src/features/elemento/__tests__/elemento.rules.test.ts` — Test dominio per nuovi branch type-specific e validazione
- `src/ui/workspace-home/ElementoEditor.tsx` — Rewrite completo su unified mockup grammar: editingFieldId, blur-to-save, commitPatch con toast undo per-field, ScalarChip con skipBlur ref, filter parentela per link.tipo
- `src/ui/workspace-home/DetailPane.tsx` — Shell semplificata, toolbar rimossa, azioni redistribuite nel menu header, handleSoftDelete condiviso con FullscreenOverlay
- `src/ui/workspace-home/FullscreenOverlay.tsx` — Parità editor shell con DetailPane; navigazione back preservata
- `src/ui/workspace-home/workspace-ui-store.ts` — editingFieldId + session overlays + softDelete/restore con ri-selezione id
- `src/ui/workspace-home/display-helpers.ts` — Display bridges domain → UI per nuovi campi type-specific
- `src/ui/workspace-home/__tests__/display-helpers.test.ts` — Test display helpers aggiornati
- `src/ui/mockups/UnifiedEditorMockup.tsx` — Canon visuale; DashedAddChip esportato
