# S02 — Editor inline, annotazioni, soft delete — Research

**Date:** 2026-04-03

## Summary

This slice adds three capabilities to the existing 3-pane layout: (1) inline editing of elements triggered by the existing "Modifica" button in the ActionToolbar, (2) an annotations section in the detail pane showing the current user's annotations and a count of others', and (3) soft delete with a 30-second undo toast. All three features build directly on the modular components delivered by S01 and the existing domain layer (elemento.rules.ts, elemento.adapter.ts).

The approach is straightforward: the work is **primarily UI wiring** using established patterns from S01 (Legend State store for edit mode state, display-helpers for data bridging, HeroUI components). The domain layer already has `normalizeElementoInput`, `cascadeRemoveLinks`, `deleteWorkspaceElemento`, and `restoreWorkspaceElemento`. HeroUI v3 provides `TextField`, `TextArea`, `Select`, `Toast` (with `timeout` and `actionProps` for undo), and `Form` — all needed. TanStack Form v1.28.6 is installed but unused; this is the first integration point. However, given the mock-data nature of the current prototype, TanStack Form may be overkill — a simpler controlled-state approach may be more pragmatic for a mock-data prototype.

The riskiest part is getting the type-specific field editor right: `personaggio` has nascita/morte/tribù/ruoli, `guerra` has fazioni/esito, `profezia` has statoProfezia, `regno` has dettagliRegno, `luogo` has regione. These fields exist in `elemento.model.ts` but NOT in `elemento.schema.ts` (Jazz schema) — meaning the mock data has them but the Jazz persistence layer doesn't. For a prototype on mock data, this is fine; the editor can read/write mock data in-memory.

## Recommendation

Build in three clean tasks:

1. **Editor inline component + edit mode state** — Add `isEditing` to the workspace-ui-store. Create an `ElementoEditor.tsx` component that renders type-specific form fields using HeroUI TextField/TextArea/Select, controlled by local React state (not TanStack Form — simpler for mock data, avoid premature abstraction). Wire the "Modifica" button to toggle edit mode. Wire "Salva" to validate via `normalizeElementoInput` and update mock data in-memory (or just close edit mode for now, since real persistence is Jazz which isn't wired yet).

2. **Annotations section in DetailBody** — Add an annotations section to DetailBody that shows: (a) the current user's annotations linked to this element (filtered from mock ELEMENTI where tipo="annotazione" and has a link to this element and autore="utente-corrente"), (b) a count of others' annotations (autore != "utente-corrente"), and (c) a CTA "+ Aggiungi annotazione" when the user has none. This is a display-only feature using existing mock data and display-helpers patterns.

3. **Soft delete with toast undo** — Wire the "Elimina" dropdown item to: remove the element from the current display, show a HeroUI toast with 30s timeout and "Annulla" action button. On undo, restore the element. On timeout expiry, finalize the delete. Add `Toast.Provider` to the composition shell. Domain rules for cascade link removal (`cascadeRemoveLinks`) exist but won't fire on mock data — just wire the UI pattern.

## Implementation Landscape

### Key Files

- `src/ui/workspace-home/workspace-ui-store.ts` — Add `isEditing: boolean` field and `startEditing()`/`stopEditing()` action functions
- `src/ui/workspace-home/DetailPane.tsx` — Wire "Modifica" button to toggle edit mode. Conditionally render `ElementoEditor` vs `DetailBody`. Wire "Elimina" to soft delete + toast.
- `src/ui/workspace-home/ElementoEditor.tsx` — **New file.** Inline editor with type-specific fields. Uses HeroUI TextField, TextArea, Select. Reads element data, renders form, validates on save.
- `src/ui/workspace-home/FullscreenOverlay.tsx` — Mirror edit mode support from DetailPane (reads same isEditing state).
- `src/ui/workspace-home/display-helpers.ts` — Add `getAnnotazioniForElement(elementId, currentAutore)` helper that filters ELEMENTI for annotations linked to the given element, split by mine/others.
- `src/ui/workspace-home/WorkspacePreviewPage.tsx` — Add `<Toast.Provider>` wrapper for toast support.
- `src/features/elemento/elemento.rules.ts` — Already has `normalizeElementoInput`, `validateElementoTitle`. No changes needed.
- `src/features/elemento/elemento.errors.ts` — May need a `"eliminazione_annullata"` error variant if needed, but probably not.
- `src/mock/data.ts` — Already has 3 annotazione elements with `autore` field and links to other elements. No changes needed.

### Build Order

1. **T01: Edit mode store + ElementoEditor component** — This is the core feature and the most complex piece. Add isEditing to store, create ElementoEditor.tsx with shared (titolo, descrizione, tags, date) and type-specific fields, wire Modifica button. This proves the edit flow works inline. ~50% of slice effort.

2. **T02: Annotations section in DetailBody** — Add getAnnotazioniForElement to display-helpers, add Annotazioni section to DetailBody after Fonti. This is a straightforward display-only addition. ~20% of slice effort.

3. **T03: Soft delete with toast undo** — Wire Elimina dropdown item, add Toast.Provider, implement soft delete with 30s toast and undo. This is a self-contained feature. ~30% of slice effort.

### Verification Approach

- `npx tsc --noEmit` — zero type errors after each task
- `npx vitest run` — all existing tests pass + new tests for display-helpers additions
- Browser verification: click Modifica → editor appears with correct fields for type → click Annulla → returns to view mode. Select a personaggio → see nascita/morte/tribù/ruoli fields. Select an evento → no personaggio-specific fields shown.
- Browser verification: select Abraamo → see "Annotazioni" section with "Riflessione sulla fede di Abraamo" (mine) + count "1 altra annotazione" (the Isaia53 one is not linked to Abraamo, so only the Abraamo one is mine). Select Esodo → see "1 annotazione altrui" (annotazioneEsodo by utente-altro).
- Browser verification: click Elimina → element disappears from list, toast appears with "Annulla" button → click Annulla → element reappears. Let toast expire → element stays removed.

## Constraints

- **Mock data only** — The editor will read/write in-memory mock data. Real Jazz persistence is not wired for editing yet. The editor should validate via domain rules but "saving" in this prototype means closing edit mode (the mock data is static; mutation would require making it mutable which adds complexity for no prototype value).
- **HeroUI v3 RAC pattern** — TextField/TextArea are React Aria Composite primitives. Must use `<TextField><Label/><Input/><FieldError/></TextField>` composition pattern, NOT props-based `onValueChange`/`isInvalid` (per KNOWLEDGE.md HeroUI pattern).
- **No TanStack Form yet** — The constitution lists TanStack Form in the stack, but for a mock-data prototype with no real mutation, controlled React state is simpler and sufficient. Decision to defer TanStack Form to when Jazz persistence is wired.
- **Type-specific fields not in Jazz schema** — `tribu`, `ruoli`, `fazioni`, `esito`, `statoProfezia`, `dettagliRegno`, `regione`, `autore` exist in `elemento.model.ts` but NOT in `elemento.schema.ts`. Editor shows them from mock data but cannot persist changes. This is a known gap for the prototype.
- **Toast.Provider needs to be at app root** — Must wrap the workspace page (or higher) with `<Toast.Provider>` for `toast()` imperative calls to work.

## Common Pitfalls

- **HeroUI TextField composition** — Do NOT pass `value`/`onChange` to `<Input>` directly. They go on the wrapping `<TextField>`. `<Input>` is just the visual element inside.
- **Toast timeout 30000ms** — HeroUI default is 4000ms. Must explicitly pass `timeout: 30000` to `toast()` call. Also verify the toast doesn't auto-dismiss on hover.
- **Annotations filter logic** — An annotation is "linked to" an element if any of its `link[]` entries has `targetId === elementId`. The mock data uses `makeLink(ELEMENTO_IDS.abraamo, "correlato")` — so the targetId is a branded ElementoId which is compared as string. Must cast consistently.
- **Legend State + edit mode** — When entering edit mode, the editor should snapshot the current element data into local state. If the user cancels, the snapshot is discarded. Don't mutate the store/mock data on every keystroke.

## Open Risks

- **HeroUI Select composite pattern** — The KNOWLEDGE.md notes "wrapping in RAC Select composite (not yet verified in v3)". The type-specific field for `profezia.statoProfezia` needs a Select. If HeroUI Select v3 doesn't compose well, a simple radio group or custom dropdown may be needed. Low risk — worst case use RadioGroup.
