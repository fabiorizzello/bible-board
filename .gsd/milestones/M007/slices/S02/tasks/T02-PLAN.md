---
estimated_steps: 16
estimated_files: 1
skills_used: []
---

# T02: Rewire ElementoEditor al nuovo warning helper di validità

In `src/ui/workspace-home/ElementoEditor.tsx`:

1. **Rimuovere** la funzione locale `getWarnings` (linee ~193–229) inclusa ogni variabile/import rimasto orfano.
2. **Importare** `computeValidityWarnings` e `ValidityWarning` da `@/features/elemento/elemento.rules`.
3. **Costruire un resolver** usando lo store Jazz già in uso nel file (`getJazzElementi()` / `useJazzElementi()` — verificare nomi esatti leggendo la prima parte del file). Il resolver deve ritornare `true` sse esiste un elemento live (non soft-deleted) con quell'ID. Soft-deleted elements sono già esclusi da `getJazzElementi()` (vedi S02-RESEARCH §2), quindi basta `ids.has(targetId)`.
4. **Memoizzare**: `const validityWarnings = useMemo(() => computeValidityWarnings(element, resolveId), [element, resolveId]);` — `resolveId` va memoizzato su un Set di IDs derivato da getJazzElementi per evitare re-render loops.
5. **Mapping a ValidationWarning[]** (tipo locale consumato da `<ReviewDrawer warnings={...} />` linee 661–668): mappare ogni `ValidityWarning` in `ValidationWarning` con:
   - `field`: mapping domain → EditableFieldId:
     - `'date'` → `'vita'` (EditableFieldId include `vita`, che è il field container di date per tutti i tipi)
     - `'nascita'` → `'vita'`
     - `'morte'` → `'vita'`
     - `'link'` → `'collegamenti-generici'`
   - `label`: etichetta user-facing in italiano (es. 'Data', 'Nascita', 'Morte', 'Collegamento')
   - `message`: passare attraverso `ValidityWarning.message` (già localizzato in T01)

   Verificare l'elenco EditableFieldId in `src/ui/workspace-home/workspace-ui-store.ts` linee 34–47 prima di scegliere i target. I valori `'vita'` e `'collegamenti-generici'` sono validi.
6. **Verificare** che `ValidationWarning` tipo locale resti compatibile con `<ReviewDrawer>`; se no, aggiornare conseguentemente.

NOTA: le stringhe utente devono restare in italiano di dominio (S01 convention). Nessun termine tecnico (ID, markdown, ecc) in testi visibili.

## Inputs

- ``src/ui/workspace-home/ElementoEditor.tsx``
- ``src/features/elemento/elemento.rules.ts``
- ``src/ui/workspace-home/workspace-ui-store.ts``

## Expected Output

- ``src/ui/workspace-home/ElementoEditor.tsx``

## Verification

rg -n 'function getWarnings' src/ui/workspace-home/ElementoEditor.tsx | wc -l | grep -q '^0$' && rg -n 'computeValidityWarnings' src/ui/workspace-home/ElementoEditor.tsx && rg -i 'manca una descrizione|nessun ruolo definito|tag sono vuoti|nessun collegamento visibile' src/ui/ | (! grep -q .) && pnpm test --run && pnpm tsc --noEmit
