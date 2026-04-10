# Timeline Board

## What This Is

PWA tablet-first per studio biblico collaborativo. Permette di creare elementi tipizzati (personaggi, eventi, luoghi, profezie, guerre, regni, periodi, annotazioni), collegarli con link bidirezionali, documentare fonti verificabili, e annotare riflessioni personali. Jazz CRDTs per storage/sync/auth offline-first (futuro). Layout 3-pane iPad-style con visualizzazioni D3.

## Core Value

Il feel dell'app — deve sembrare un'app iPad nativa con navigazione chiara, non un sito web CRUD. Se il layout e la navigazione non funzionano, nessuna feature backend salva il prodotto.

## Current State

**M002 S01 completed** — the 785-line WorkspacePreviewPage.tsx monolith has been decomposed into 6 modular components:

- `WorkspacePreviewPage.tsx` (24 lines) — thin composition shell
- `NavSidebar.tsx` (212 lines) — sidebar nav with workspace switcher, Recenti/Tutti/Board navigation
- `ListPane.tsx` (266 lines) — search, tipo filters, recenti/element lists
- `DetailPane.tsx` (263 lines) — detail header, toolbar, body sections (exports DetailBody + ActionToolbar)
- `FullscreenOverlay.tsx` (97 lines) — fullscreen element view reusing DetailBody + ActionToolbar
- `workspace-ui-store.ts` (48 lines) — Legend State observable store with 7 shared UI state fields
- `display-helpers.ts` (257 lines) — 8 pure display helper functions bridging domain types to UI shapes

All visible features preserved: dark mode, ThemeSwitcher FAB with 8 palettes, sidebar nav, list search/filters, detail with desc+fonti+link+board sections, fullscreen overlay, DemoAuth.

28 unit tests for display helpers + 16 mock data tests = 44 tests passing.

**Ready for**: S02 (editor inline), S03 (fonti/link editor), S04 (board CRUD), which all depend on S01.

## Architecture / Key Patterns

- **Offline-first PWA** — zero server, build statico, service worker via vite-plugin-pwa
- **Jazz CRDTs** — single source of truth per dati, auth, sync, permessi (non usato nel prototipo M002)
- **DDD con vertical slices** — `features/<domain>/` (model, rules, errors, schema, adapter) + `ui/<page>/`
- **Adapter pattern** — Jazz CoMap → Adapter → Domain model puro → React UI
- **D3 su SVG via refs** — per timeline e grafi, separato dal rendering React (D002)
- **neverthrow** — Result<T,E> per error handling tipizzato nel domain layer
- **HeroUI v3 + Tailwind CSS** — componenti RAC touch-first (composizione TextField, non API v2) + utility styling
- **React Compiler** — memoizzazione automatica build-time
- **Legend State** — `useSelector()` da `@legendapp/state/react` per leggere observable fields (NOT `use$()` — D031)
- **Display helpers** — pure functions bridging domain types → UI display shapes, no React imports
- **Annotazione = Elemento** — tipo "annotazione" è un Elemento first-class, non un sub-oggetto (D021)
- **Board = query salvata** — selezione fissa/dinamica + vista lista/timeline (D012)

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [ ] M002: Prototipo completo su layout 3-pane consolidato — ✅ S01 done, remaining: S02 (editor), S03 (fonti/link), S04 (board CRUD), S05 (timeline D3), S06 (polish)
- [ ] M003: Backend Jazz + persistenza reale — CRUD, link bidirezionali automatici, fonti, board persistenti
- [ ] M004: Annotazione video JW.org — FonteTipo video, Mediator API, playback inline, selezione sezione
- [ ] M005: Sharing, permessi, action log — Jazz groups, ruoli, rollback, portrait tablet
- [ ] M006: Media e immagini — upload, gallery, visualizzatore
- [ ] M007: Viste D3 avanzate — grafo force-directed, genealogia

Feature post-prototipo documentate in `.gsd/FUTURE.md`.
