---
estimated_steps: 14
estimated_files: 3
skills_used: []
---

# T04: Eliminare le 4 occorrenze di `transition-all` nei mockup (compliance AC slice)

L'AC S05 richiede `rg 'transition-all' src/ui/` → zero hit. Il research ha identificato 4 occorrenze residue nei file mockup:
- `src/ui/mockups/CommitInteractionMockup.tsx:274` — `transition-all duration-200`
- `src/ui/mockups/UnifiedEditorMockup.tsx:1895` — `transition-all duration-200`
- `src/ui/mockups/MockupsIndex.tsx:175` — `transition-all`
- `src/ui/mockups/MockupsIndex.tsx:243` — `transition-all`

Sostituire con `transition-[opacity,transform]` (pattern KNOWLEDGE.md: animare solo opacity/transform, mai width/height/top/left). Mantenere duration-200 dove presente. Non modificare altro nei file.

Steps:
1. Per ciascuno dei 4 siti, sostituire esattamente `transition-all` con `transition-[opacity,transform]` (conservando eventuali modificatori duration-*).
2. Eseguire il gate finale: `rg 'transition-all' src/ui/` → zero hit atteso.
3. Eseguire `pnpm tsc --noEmit` e `pnpm test --run`.

Must-haves:
- Zero occorrenze di `transition-all` in `src/ui/`
- Nessuna modifica a logica dei mockup (solo class rename)
- Tsc clean, 126/126 test green

## Inputs

- ``src/ui/mockups/CommitInteractionMockup.tsx``
- ``src/ui/mockups/UnifiedEditorMockup.tsx``
- ``src/ui/mockups/MockupsIndex.tsx``

## Expected Output

- ``src/ui/mockups/CommitInteractionMockup.tsx``
- ``src/ui/mockups/UnifiedEditorMockup.tsx``
- ``src/ui/mockups/MockupsIndex.tsx``

## Verification

test -z "$(rg -l 'transition-all' src/ui/ 2>/dev/null)" && pnpm tsc --noEmit && pnpm test --run

## Observability Impact

none — solo Tailwind class rename.
