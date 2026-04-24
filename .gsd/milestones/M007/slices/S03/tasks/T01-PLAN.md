---
estimated_steps: 1
estimated_files: 2
skills_used: []
---

# T01: Creare hook useFieldStatus con state machine e test unitari

Creare il nuovo file `src/ui/workspace-home/useFieldStatus.ts` con un hook React puro e generico `useFieldStatus<T>(value: T, onCommit: (prev: T, next: T) => void)` che ritorna `{ status: 'idle'|'saving'|'success'|'error', onFocus, onBlur }`. Implementare la state machine descritta in S03-RESEARCH: onFocus cattura prev in un ref; onBlur(next) confronta prev vs next con uguaglianza stretta (===); se uguali non chiama onCommit e lo status resta idle (FIX no-op R049); se diversi chiama onCommit(prev, next) e transita a 'saving' → 'success'; dopo 1500ms lo status torna a idle via setTimeout (cancellabile). Rispettare `prefers-reduced-motion: reduce` via `window.matchMedia` letto al momento del fire del timer (non a render time) — se attivo, reset immediato. Sincronizzare prev con value esterno via useEffect quando il parent aggiorna value (Jazz re-render). Export nominato. Nessun import da HeroUI, Jazz, Legend State. Contestualmente creare `src/ui/workspace-home/__tests__/useFieldStatus.test.ts` con @testing-library/react `renderHook` + `act` + `vi.useFakeTimers()` che copra: (1) onBlur con stesso valore non chiama onCommit e status resta idle; (2) onBlur con valore diverso chiama onCommit(prev, next) una sola volta; (3) status transita idle→success dopo change; (4) status torna a idle dopo 1500ms; (5) prefers-reduced-motion mockato (window.matchMedia mock) → reset immediato senza attendere 1500ms; (6) focus senza blur non chiama onCommit (idempotency). Il hook è puro — no dipendenze con il resto del codice, testabile in isolamento.

## Inputs

- ``.gsd/milestones/M007/slices/S03/S03-RESEARCH.md``
- ``src/ui/workspace-home/workspace-ui-store.ts``

## Expected Output

- ``src/ui/workspace-home/useFieldStatus.ts``
- ``src/ui/workspace-home/__tests__/useFieldStatus.test.ts``

## Verification

pnpm test --run src/ui/workspace-home/__tests__/useFieldStatus.test.ts (tutti i 5-6 scenari pass); pnpm tsc --noEmit (clean); wc -l src/ui/workspace-home/useFieldStatus.ts ≥30; grep -n 'export function useFieldStatus' src/ui/workspace-home/useFieldStatus.ts (1 match); rg 'observer\(|use\$\(' src/ui/workspace-home/useFieldStatus.ts (0 match).

## Observability Impact

Nessun logging — hook React puro. Il comportamento osservabile è esclusivamente via status di ritorno.
