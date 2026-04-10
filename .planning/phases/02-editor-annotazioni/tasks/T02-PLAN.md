---
estimated_steps: 24
estimated_files: 3
skills_used: []
---

# T02: Add annotations section to DetailBody with display helpers

Add a getAnnotazioniForElement helper to display-helpers.ts and render an Annotazioni section in DetailBody showing the current user's annotations and a count of others' annotations for the selected element.

## Steps

1. **Add `getAnnotazioniForElement()` to display-helpers.ts**: Function signature: `getAnnotazioniForElement(elementId: string, currentAutore: string): { mie: Elemento[]; altreCount: number }`. Logic: filter ELEMENTI where `tipo === 'annotazione'` AND at least one `link[].targetId === elementId`. Split into mie (autore === currentAutore) and others (autore !== currentAutore). Return `{ mie, altreCount: others.length }`.

2. **Add constant `CURRENT_AUTORE`**: Export `const CURRENT_AUTORE = 'utente-corrente'` from display-helpers.ts. This simulates the current user identity for the mock prototype.

3. **Add unit tests in `__tests__/display-helpers.test.ts`**: Test getAnnotazioniForElement:
   - Abraamo should have 1 mia annotazione ("Riflessione sulla fede di Abraamo", autore=utente-corrente) and 0 altre.
   - Esodo should have 0 mie annotazioni and 1 altra (annotazioneEsodo, autore=utente-altro).
   - profeziaIsaia53 should have 1 mia annotazione (annotazioneIsaia53, autore=utente-corrente) and 0 altre.
   - Isacco should have 0 mie and 0 altre (no annotations linked).

4. **Add AnnotazioniSection to DetailBody in DetailPane.tsx**: After the Fonti section and before Board section, render an Annotazioni section:
   - Call `getAnnotazioniForElement(element.id as string, CURRENT_AUTORE)` to get annotation data.
   - If mie.length === 0 AND altreCount === 0: don't render the section (knowledge base rule: empty sections hidden).
   - If mie.length > 0: render each annotation as a compact row showing titolo (clickable, navigates to annotation element via `selectElement(ann.id as string)`), and first ~80 chars of descrizione as preview text.
   - If altreCount > 0: render a dim line: "{altreCount} annotazione/i altrui" (use singular/plural).
   - If mie.length === 0 but altreCount > 0: still show the altrui count, and add a CTA button "+ Aggiungi annotazione" (disabled, placeholder for now).
   - If mie.length === 0 and altreCount === 0 but tipo !== 'annotazione': optionally show CTA "+ Aggiungi annotazione" — actually no, per knowledge base, if no annotations the section doesn't appear.
   - Style: same Card/heading pattern as other DetailBody sections. Annotation rows use `text-[12px]` for title, `text-[11px] text-ink-dim` for preview.

5. **Verify**: `npx tsc --noEmit` passes. `npx vitest run` passes with new annotation tests.

## Constraints
- Annotations are Elemento of tipo="annotazione" linked to another element via link[].targetId.
- CURRENT_AUTORE is a hardcoded constant for the prototype — no real auth.
- Clicking an annotation title navigates to it via selectElement (same as clicking in the list).
- The section title is "Annotazioni" (per ubiquitous language).
- Don't render the section at all if there are zero annotations of any kind.

## Inputs

- ``src/ui/workspace-home/display-helpers.ts` — add getAnnotazioniForElement helper`
- ``src/ui/workspace-home/__tests__/display-helpers.test.ts` — add tests for annotation helper`
- ``src/ui/workspace-home/DetailPane.tsx` — add Annotazioni section to DetailBody`
- ``src/mock/data.ts` — ELEMENTI with annotazione elements and their links`

## Expected Output

- ``src/ui/workspace-home/display-helpers.ts` — extended with getAnnotazioniForElement and CURRENT_AUTORE`
- ``src/ui/workspace-home/__tests__/display-helpers.test.ts` — extended with annotation helper tests`
- ``src/ui/workspace-home/DetailPane.tsx` — DetailBody now renders Annotazioni section`

## Verification

npx tsc --noEmit && npx vitest run
