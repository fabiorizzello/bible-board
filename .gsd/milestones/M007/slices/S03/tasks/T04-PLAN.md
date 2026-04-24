---
estimated_steps: 1
estimated_files: 1
skills_used: []
---

# T04: Wire no-op guard + check icon adjacent in TipoChip

Modificare `TipoChip` (attualmente intorno alla riga 1077 di `src/ui/workspace-home/ElementoEditor.tsx`). TipoChip commette su press di un option del popover, non su blur — il pattern onFocus/onBlur del hook non si applica direttamente. Due strade possibili documentate nella research; scegliere la più semplice: (1) aggiungere un guard inline: `const handleSelect = (option: ElementoTipo) => { if (option === tipo) { closePopover(); return; } onCommit(option); }` — questo fixa R049 per il tipo; (2) per il feedback inline success usare un local state `const [justCommitted, setJustCommitted] = useState(false)` impostato a true subito dopo onCommit, e resettato via setTimeout 1500ms (con rispetto di prefers-reduced-motion tramite `window.matchMedia` al fire del timer — stessa logica del hook). Renderizzare `<Check className='ml-2 h-4 w-4 transition-opacity duration-300' aria-hidden='true' style={{ opacity: justCommitted ? 1 : 0 }} />` adiacente al `<ChipButton>` trigger. Se la scelta è di usare `useFieldStatus` anche qui, documentare come value si passa `tipo` (prop corrente) e onFocus viene chiamato alla popover-open; ma l'approccio con local state è più diretto e produce lo stesso UX. Decidere in base a quale produce meno codice — il contratto R050 richiede il check inline, non specifica l'implementazione.

## Inputs

- ``src/ui/workspace-home/useFieldStatus.ts``
- ``src/ui/workspace-home/ElementoEditor.tsx``

## Expected Output

- ``src/ui/workspace-home/ElementoEditor.tsx``

## Verification

pnpm test --run (126+ pass); pnpm tsc --noEmit (clean); rg -n 'option === tipo|option !== tipo' src/ui/workspace-home/ElementoEditor.tsx (≥1 hit — guard no-op presente); grep in zona TipoChip di `<Check` e `justCommitted` oppure `status === 'success'`; rg 'transition.*width|transition.*height' src/ui/workspace-home/ElementoEditor.tsx (0 match). Smoke manuale: selezionare lo stesso tipo già attivo non deve chiamare commitPatch (non appare toast).
