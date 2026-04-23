# M001 Context

## Why

Progetto Timeline Board: PWA tablet-first per studio biblico collaborativo (elementi tipizzati, link bidirezionali, fonti, annotazioni). Questo milestone costruisce il prototipo completo sopra un layout 3-pane consolidato, prima di passare a persistenza Jazz reale (M002 futuro) e feature successive.

## Starting state

- Monolite `WorkspacePreviewPage.tsx` (785 righe) già decomposto in 6 componenti modulari (S01 completata, UAT PASS 2026-04-03).
- Dominio completo in `src/features/elemento` con 8 `ElementoTipo`, `ElementoInput`/`normalizeElementoInput`, `ElementoError`.
- Mock data e display helpers puri (`src/ui/workspace-home/display-helpers.ts`) — 44 test passanti al termine di S01.
- S02 in corso: R001-R004 verificati via plan 02-01/02-02; R005 (inline per-campo refactor) pending via plan 02-05.

## Upstream dependencies

Nessuna dipendenza upstream — M001 è il primo milestone del prototipo. Precede M002 (backend Jazz), M003 (annotazione video JW.org), M004 (sharing/permessi).

## Constraints

- **Offline-first, zero server** (vedi CLAUDE.md § I).
- **Jazz CRDTs** non usati nel prototipo M001 — Jazz schema/adapter resta out of scope fino a M002.
- **iPad-first** — design baseline iPad 10.9" landscape 1180×820.
- **HeroUI v3 + Tailwind + lucide-react** per UI; D3 su SVG via refs per timeline.
