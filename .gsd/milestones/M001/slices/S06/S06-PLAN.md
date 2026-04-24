# S06: Polish iPad-native e UAT finale

**Goal:** Vista timeline con asse verticale SVG via D3, card posizionate temporalmente, zoom cambia scala, pan con drag, popup compatto su click card.
**Demo:** app completa che sembra iPad nativa, scenario UAT end-to-end passa.

## Must-Haves

- Utente apre board in vista timeline, zooma, panna, clicca card e vede popup con info elemento. Transizioni a 60fps su iPad.

## Proof Level

- This slice proves: Not provided.

## Integration Closure

Not provided.

## Verification

- Not provided.

## Tasks

- [x] **T01: Timeline D3 SVG con zoom/pan e popup card** `est:5h`
  Timeline con asse verticale SVG (D3 su ref, React non renderizza SVG). Card posizionate, layout collision-free. Zoom/pan con D3 behavior; transizioni throttled per 60fps su iPad. Popup compatto on click. Consegna R010.
  - Files: `src/ui/timeline/Timeline.tsx`, `src/ui/timeline/timeline-d3.ts`
  - Verify: Timeline renderizza a 60fps su iPad; zoom/pan funzionanti; click card apre popup; R010 coperto

## Files Likely Touched

- src/ui/timeline/Timeline.tsx
- src/ui/timeline/timeline-d3.ts
