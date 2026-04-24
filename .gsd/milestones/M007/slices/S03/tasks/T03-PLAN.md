---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T03: Wire useFieldStatus in DescrizioneSection con check icon overlay assoluto

Modificare `DescrizioneSection` (attualmente intorno alla riga 1278 di `src/ui/workspace-home/ElementoEditor.tsx` — verificare posizione corrente). La descrizione usa Milkdown che non espone un input nativo; il blur è gestito a livello container div. Dentro DescrizioneSection: (1) istanziare `const { status, onFocus, onBlur } = useFieldStatus<string>(value, (prev, next) => onCommit(next));` (adattare al callback esistente); (2) sostituire `handleBlur` (che chiama `onCommit(draft)`) con `handleBlur = () => onBlur(draft)` e aggiungere un `onFocus={onFocus}` sul container wrapper del milkdown-host; (3) posizionare il container editor in `relative` (se non lo è già) e aggiungere un `<Check className='absolute bottom-2 right-2 h-4 w-4 pointer-events-none transition-opacity duration-300' aria-hidden='true' style={{ opacity: status === 'success' ? 1 : 0 }} />`. Nessun cambio al comportamento di submit del Milkdown. Il valore `draft` catturato allo stato del componente al momento del blur è già sufficiente per il confronto prev/next.

## Inputs

- ``src/ui/workspace-home/useFieldStatus.ts``
- ``src/ui/workspace-home/ElementoEditor.tsx``

## Expected Output

- ``src/ui/workspace-home/ElementoEditor.tsx``

## Verification

pnpm test --run (126+ pass); pnpm tsc --noEmit (clean); rg -c 'useFieldStatus' src/ui/workspace-home/ElementoEditor.tsx (≥2 hit dopo T02+T03); rg -n 'absolute.*bottom.*right|bottom.*right.*absolute' src/ui/workspace-home/ElementoEditor.tsx (≥1 hit in zona DescrizioneSection); rg 'transition.*width|transition.*height' src/ui/workspace-home/ElementoEditor.tsx (0 match).
