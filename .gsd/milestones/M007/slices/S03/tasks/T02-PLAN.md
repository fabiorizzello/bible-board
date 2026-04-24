---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T02: Wire useFieldStatus in InlineTitle con check icon in endContent

Modificare `InlineTitle` (attualmente intorno alla riga 959 di `src/ui/workspace-home/ElementoEditor.tsx` — verificare la posizione attuale con rg/grep prima di editare, non affidarsi ai numeri di riga statici). Dentro InlineTitle: (1) importare `useFieldStatus` da `./useFieldStatus`; (2) importare `Check` da `lucide-react` (già usato altrove nel file — verificare import esistente); (3) istanziare `const { status, onFocus, onBlur } = useFieldStatus<string>(value, (prev, next) => onCommit(next));` — adattare la firma al contratto corrente di `InlineTitle` (il callback parent si aspetta un solo argomento `next`); (4) sostituire `onBlur={() => onCommit(draft)}` del `<Input>` con `onBlur={() => onBlur(draft)}` e aggiungere `onFocus={onFocus}`; (5) aggiungere al `<Input>` la prop `endContent` che renderizza `<Check className='h-4 w-4 transition-opacity duration-300 opacity-0' aria-hidden='true' style={{ opacity: status === 'success' ? 1 : 0 }} />` — usare SOLO opacity, mai width/height. NON modificare `commitPatch` né rimuovere toast esistenti: il contratto no-op nasce dal fatto che `onCommit` non viene più chiamato su valori identici. Verificare che, se draft === value al blur, il parent onCommit non venga invocato (test manuale rapido o test di snapshot opzionale).

## Inputs

- ``src/ui/workspace-home/useFieldStatus.ts``
- ``src/ui/workspace-home/ElementoEditor.tsx``
- ``.gsd/milestones/M007/slices/S03/S03-RESEARCH.md``

## Expected Output

- ``src/ui/workspace-home/ElementoEditor.tsx``

## Verification

pnpm test --run (126+ pass); pnpm tsc --noEmit (clean); rg -n 'useFieldStatus' src/ui/workspace-home/ElementoEditor.tsx (≥1 hit per T02, crescerà nei task successivi); rg -n 'endContent.*Check|Check.*endContent' src/ui/workspace-home/ElementoEditor.tsx | head (match nella zona InlineTitle); rg 'transition.*width|transition.*height|animate.*width|animate.*height' src/ui/workspace-home/ElementoEditor.tsx (0 match — solo opacity/transform ammessi).
