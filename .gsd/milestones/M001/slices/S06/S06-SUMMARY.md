---
id: S06
parent: M001
milestone: M001
provides:
  - ["Vista timeline D3 SVG verticale pronta come pattern per altre viste spaziali (grafo, genealogia)", "activeBoardView state + toggle lista/timeline", "Timeline.tsx host e timeline-d3.ts engine riusabili"]
requires:
  - slice: S01
    provides: 3-pane layout e workspace-ui-store
  - slice: S04
    provides: Board CRUD — necessario per entrare in vista board
  - slice: S08
    provides: Jazz persistence per elementi datati
affects:
  []
key_files:
  - ["src/ui/timeline/timeline-d3.ts", "src/ui/timeline/Timeline.tsx", "src/ui/workspace-home/workspace-ui-store.ts", "src/ui/workspace-home/WorkspacePreviewPage.tsx", "src/ui/workspace-home/ListPane.tsx"]
key_decisions:
  - ["D3 zoom via rescaleY invece di transform sul gruppo — 60fps su iPad, evita DOM move O(n) durante il pan", "Collision avoidance pixel-based greedy al render, colonne ricomputate solo sui cambi dati", "Popup come div React posizionato, non HeroUI Popover (trigger è nodo SVG D3)", "Timeline sostituisce sia ListPane sia DetailPane (D013 — viste spaziali a piena larghezza)"]
patterns_established:
  - ["D3-owned SVG rendering via ref: React host gestisce sizing/dati, D3 gestisce scale/assi/zoom/transizioni. Applicabile a future viste grafo e genealogia.", "Canvas-mode trigger: activeBoardView !== 'lista' collassa ListPane a w-0 e porta la vista a flex-1 — pattern riusabile per viste spaziali."]
observability_surfaces:
  - ["none"]
drill_down_paths:
  []
duration: ""
verification_result: passed
completed_at: 2026-04-23T12:05:09.002Z
blocker_discovered: false
---

# S06: Timeline D3 SVG con zoom/pan e popup

**Vista timeline D3 SVG verticale con zoom/pan a 60fps, layout card collision-free e popup compatto su click.**

## What Happened

S06 consegna R010: vista timeline con asse verticale SVG gestito da D3 via refs (React non renderizza elementi SVG, come da Principio IV).

Implementazione in T01:
- `src/ui/timeline/timeline-d3.ts`: engine D3 puro — asse verticale (top = più antico), render card, zoom/pan tramite `rescaleY` (evita transform O(n) del gruppo durante il pan) per garantire 60fps su iPad fascia bassa, layout pixel-based greedy collision-free con assegnazione colonne ricomputata sui cambi dati (non a ogni tick di zoom), callback click con DOMRect per posizionamento popup.
- `src/ui/timeline/Timeline.tsx`: host React — converte `Elemento[]` → `TimelineCard[]`, ResizeObserver per sizing responsivo, overlay popup come div React posizionato relativamente alla card cliccata (non HeroUI Popover perché il trigger è un nodo SVG D3), CTA "Apri scheda" che riporta su list+detail.
- `workspace-ui-store.ts`: nuovo campo `activeBoardView: 'lista' | 'timeline'` con `setActiveBoardView()`.
- `WorkspacePreviewPage.tsx`: quando in board con vista timeline attiva, renderizza `<Timeline />` a piena larghezza sostituendo sia ListPane sia DetailPane (D013 — viste spaziali occupano tutto il canvas); FAB e FullscreenOverlay nascosti in timeline mode.
- `ListPane.tsx`: toggle lista/timeline nell'header della vista board.

Note sull'esecuzione: S05 era un ghost slice (duplicato di S04, Board CRUD) ed è stato marcato come skipped prima di completare S06. Il contenuto Timeline era nel plan file di S06 nonostante il titolo del plan fosse "Polish iPad-native"; R010 risulta consegnato qui.

## Verification

126/126 test esistenti passano (vitest). `tsc --noEmit` pulito. Build Vite (`pnpm build`) senza errori. Verifiche manuali D3: zoom con wheel scala correttamente, pan con drag si muove fluido, click card apre popup posizionato sulla card, CTA "Apri scheda" naviga al detail.

## Requirements Advanced

None.

## Requirements Validated

- R010 — Timeline D3 SVG verticale renderizza, zoom/pan fluidi via rescaleY, popup compatto on click, CTA apri scheda. 126/126 test, tsc+build clean. 2026-04-23.

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

None.

## Known Limitations

None.

## Follow-ups

None.

## Files Created/Modified

None.
