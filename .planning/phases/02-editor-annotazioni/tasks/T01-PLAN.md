---
estimated_steps: 27
estimated_files: 4
skills_used: []
---

# T01: Wire edit mode store + ElementoEditor inline component

Add edit mode state to workspace-ui-store and create the ElementoEditor.tsx component that renders an inline form with shared fields (titolo, descrizione, tags) and type-specific fields per ElementoTipo. Wire the "Modifica" button in ActionToolbar to toggle edit mode. The editor uses controlled React state (local useState), not TanStack Form — simpler for a mock-data prototype.

## Steps

1. **Extend workspace-ui-store.ts**: Add `isEditing: boolean` (default false) to WorkspaceUiState. Add `startEditing()` and `stopEditing()` action functions that set the flag. `stopEditing()` also resets `isEditing` to false.

2. **Create ElementoEditor.tsx**: A new component that receives the current `Elemento` and renders an inline edit form:
   - **Shared fields** (all types): titolo (TextField + Input), descrizione (TextField + TextArea), tags (comma-separated TextField for now).
   - **Type-specific fields** rendered conditionally based on `element.tipo`:
     - `personaggio`: nascita anno/era, morte anno/era, tribù (TextField), ruoli (comma-separated TextField).
     - `guerra`: fazioni (TextField), esito (TextField).
     - `profezia`: statoProfezia (Select with options: adempiuta, in corso, futura).
     - `regno`: dettagliRegno (TextArea).
     - `luogo`: regione (TextField).
     - `evento`, `periodo`, `annotazione`: no extra fields.
   - **Local state**: `useState` initialized from the element's current values. Edits update local state only.
   - **Save button**: Calls `normalizeElementoInput()` from elemento.rules.ts on the shared fields. If validation fails, shows errors inline via FieldError. If validation passes, calls `stopEditing()` (no actual persistence in prototype — mock data is immutable).
   - **Cancel button**: Calls `stopEditing()`, discards local state.
   - **HeroUI composition pattern**: `<TextField value={v} onChange={fn} isInvalid={bool}><Label>...</Label><Input/><FieldError>{msg}</FieldError></TextField>`. Same for TextArea.
   - **HeroUI Select**: `<Select selectedKey={v} onSelectionChange={fn}><Label>...</Label><Select.Button/><Select.Popover><Select.ListBox><Select.Item>...</Select.Item></Select.ListBox></Select.Popover></Select>` composition pattern.
   - Layout: vertical stack with `gap-3`, section headings for shared vs type-specific, consistent with DetailBody styling (compact, `text-[13px]`).

3. **Wire DetailPane.tsx**: Import `isEditing` from store via useSelector. Import ElementoEditor. When `isEditing` is true and an element is selected, render `<ElementoEditor element={selectedElement} />` instead of `<DetailBody>`. The ActionToolbar's "Modifica" button gets an `onPress` that calls `startEditing()`. When in edit mode, ActionToolbar should hide (editor has its own Save/Cancel buttons).

4. **Wire FullscreenOverlay.tsx**: Same edit mode logic — when `isEditing`, show ElementoEditor instead of DetailBody. ActionToolbar Modifica calls startEditing.

5. **Verify**: `npx tsc --noEmit` passes. `npx vitest run` passes (no new test logic needed for this task since editor is UI-only and validation is tested in elemento.rules.test.ts).

## Constraints
- HeroUI TextField is RAC composite: value/onChange/isInvalid go on `<TextField>`, NOT on `<Input>`. `<Input>` is just the visual slot.
- HeroUI Select is also RAC composite: selectedKey/onSelectionChange go on `<Select>`, items in `<Select.ListBox><Select.Item>`.
- Editor local state snapshots element data on mount. Cancel discards. Save validates then closes.
- No mutation of ELEMENTI — mock data stays immutable. "Save" just validates and closes edit mode.
- Touch targets 44x44px min. All interactive elements keyboard-navigable.

## Inputs

- ``src/ui/workspace-home/workspace-ui-store.ts` — existing Legend State store to extend with isEditing`
- ``src/ui/workspace-home/DetailPane.tsx` — wire Modifica button and conditional editor rendering`
- ``src/ui/workspace-home/FullscreenOverlay.tsx` — mirror edit mode support`
- ``src/features/elemento/elemento.model.ts` — Elemento type with tipo-specific fields`
- ``src/features/elemento/elemento.rules.ts` — normalizeElementoInput for save validation`
- ``src/features/elemento/elemento.errors.ts` — ElementoError type for validation errors`

## Expected Output

- ``src/ui/workspace-home/workspace-ui-store.ts` — extended with isEditing field and startEditing/stopEditing actions`
- ``src/ui/workspace-home/ElementoEditor.tsx` — new inline editor component with shared + type-specific fields`
- ``src/ui/workspace-home/DetailPane.tsx` — modified to toggle between DetailBody and ElementoEditor based on isEditing`
- ``src/ui/workspace-home/FullscreenOverlay.tsx` — modified to support edit mode same as DetailPane`

## Verification

npx tsc --noEmit && npx vitest run
