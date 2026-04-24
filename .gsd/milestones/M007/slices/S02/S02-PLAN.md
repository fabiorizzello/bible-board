# S02: Warning reali (rimozione check di completezza)

**Goal:** Sostituire i check di completezza nel warning system con check di validità reale. Un elemento minimale (solo titolo) non produce più warning; un elemento con data malformata o con link a elemento inesistente/soft-deleted produce warning inline nel ReviewDrawer.
**Demo:** Elemento minimale (solo titolo) non genera warning; data malformata o link a elemento soft-deleted genera warning inline

## Must-Haves

- `computeValidityWarnings(elemento, resolveId)` esportato da `src/features/elemento/elemento.rules.ts` come funzione pura
- Checks coperti: `date` invalida, `nascita` invalida, `morte` invalida, `link.targetId` non risolvibile
- Nessun check di completezza (descrizione vuota, ruoli vuoti, tag vuoti, link vuoti) rimane nel warning pipeline
- `ElementoEditor.tsx` usa `computeValidityWarnings` con resolver costruito su `getJazzElementi()`; `getWarnings` locale rimosso
- Test unitari del dominio coprono: elemento minimale → 0 warning; date invalide per i 3 campi → warning corretti; link a ID inesistente → warning; link a ID esistente → nessun warning
- `pnpm test --run` → tutti i test passano (≥126); `pnpm tsc --noEmit` clean
- `rg "manca una descrizione|nessun ruolo definito|tag sono vuoti|nessun collegamento visibile" src/ -i` → 0 hit user-visible

## Proof Level

- This slice proves: Not provided.

## Integration Closure

Not provided.

## Verification

- Not provided.

## Tasks

- [x] **T01: Aggiungere computeValidityWarnings nel dominio elemento + test** `est:30m`
  Creare il helper puro `computeValidityWarnings(elemento, resolveId)` in `src/features/elemento/elemento.rules.ts` e l'interfaccia `ValidityWarning`. Il helper deve restare nel layer dominio — zero import Jazz/React. Aggiungere test unitari esaustivi in `src/features/elemento/__tests__/elemento.rules.test.ts`.

Contratto:
```ts
export interface ValidityWarning {
  readonly field: 'date' | 'nascita' | 'morte' | 'link';
  readonly targetId?: string;
  readonly message: string;
}

export function computeValidityWarnings(
  elemento: Elemento,
  resolveId: (id: string) => boolean
): readonly ValidityWarning[]
```

Regole:
1. Se `elemento.date` definito e `validateDataTemporale(elemento.date).isErr()` → warning `{ field: 'date', message: "La data dell'elemento non è valida." }`
2. Se `elemento.nascita` definito e `validateDataStorica(elemento.nascita).isErr()` → warning `{ field: 'nascita', message: 'La data di nascita non è valida.' }`
3. Se `elemento.morte` definito e `validateDataStorica(elemento.morte).isErr()` → warning `{ field: 'morte', message: 'La data di morte non è valida.' }`
4. Per ogni `elemento.link`: se `!resolveId(link.targetId)` → warning `{ field: 'link', targetId: link.targetId, message: 'Collegamento a elemento non trovato (potrebbe essere stato eliminato).' }`

NOTA: il tipo `Elemento` va importato da `./elemento.model`; `validateDataTemporale`/`validateDataStorica` sono già importati in `elemento.rules.ts` (linee 5–6), nessun nuovo import necessario oltre a `Elemento`.

Test da aggiungere (tutti in `describe('computeValidityWarnings', ...)`):
- elemento minimale (solo titolo, tipo annotazione) → array vuoto
- elemento con `date` valida → 0 warning
- elemento con `date` malformata (es. `{ anno: -999999, meseRef: 99 }` o equivalente che fa fallire `validateDataTemporale`) → 1 warning field='date'
- personaggio con `nascita` invalida → warning field='nascita'
- personaggio con `morte` invalida → warning field='morte'
- elemento con link a targetId che `resolveId` ritorna true → 0 warning
- elemento con link a targetId che `resolveId` ritorna false → 1 warning field='link', targetId popolato
- elemento con 2 link misti (1 risolvibile, 1 no) → esattamente 1 warning con targetId del broken link
- check che descrizione vuota, tags vuoti, ruoli vuoti, link vuoti NON producano warning (regression test anti-completeness)
  - Files: `src/features/elemento/elemento.rules.ts`, `src/features/elemento/__tests__/elemento.rules.test.ts`
  - Verify: pnpm test --run src/features/elemento/__tests__/elemento.rules.test.ts && pnpm tsc --noEmit && rg -n 'export function computeValidityWarnings' src/features/elemento/elemento.rules.ts

- [x] **T02: Rewire ElementoEditor al nuovo warning helper di validità** `est:45m`
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
  - Files: `src/ui/workspace-home/ElementoEditor.tsx`
  - Verify: rg -n 'function getWarnings' src/ui/workspace-home/ElementoEditor.tsx | wc -l | grep -q '^0$' && rg -n 'computeValidityWarnings' src/ui/workspace-home/ElementoEditor.tsx && rg -i 'manca una descrizione|nessun ruolo definito|tag sono vuoti|nessun collegamento visibile' src/ui/ | (! grep -q .) && pnpm test --run && pnpm tsc --noEmit

## Files Likely Touched

- src/features/elemento/elemento.rules.ts
- src/features/elemento/__tests__/elemento.rules.test.ts
- src/ui/workspace-home/ElementoEditor.tsx
