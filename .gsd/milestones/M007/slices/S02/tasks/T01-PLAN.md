---
estimated_steps: 29
estimated_files: 2
skills_used: []
---

# T01: Aggiungere computeValidityWarnings nel dominio elemento + test

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

## Inputs

- ``src/features/elemento/elemento.rules.ts``
- ``src/features/elemento/elemento.model.ts``
- ``src/features/shared/value-objects.ts``
- ``src/features/elemento/__tests__/elemento.rules.test.ts``

## Expected Output

- ``src/features/elemento/elemento.rules.ts``
- ``src/features/elemento/__tests__/elemento.rules.test.ts``

## Verification

pnpm test --run src/features/elemento/__tests__/elemento.rules.test.ts && pnpm tsc --noEmit && rg -n 'export function computeValidityWarnings' src/features/elemento/elemento.rules.ts
