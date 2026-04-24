# Timeline Board

## What This Is

PWA tablet-first per studio biblico collaborativo. Permette di creare elementi tipizzati (personaggi, eventi, luoghi, profezie, guerre, regni, periodi, annotazioni), collegarli con link bidirezionali, documentare fonti verificabili, e annotare riflessioni personali. Jazz CRDTs per storage/sync/auth offline-first. Layout 3-pane iPad-style con visualizzazioni D3.

## Core Value

Il feel dell'app — deve sembrare un'app iPad nativa con navigazione chiara, non un sito web CRUD. Se il layout e la navigazione non funzionano, nessuna feature backend salva il prodotto.

## Current State

**M001 completato 2026-04-23 — S01–S08 tutti consegnati.** Il prototipo completo è live: layout 3-pane con dark mode, editor inline per-campo su 8 ElementoTipo, fonti/link bidirezionali, board CRUD, timeline D3 SVG, Jazz CRDT persistence, e polish iPad-native. R001–R007 tutti validati. 126/126 test. tsc clean.

**S01–S08 completati:**
- S01: Layout 3-pane + dark mode (ThemeSwitcher FAB) + DemoAuth — UAT PASS 2026-04-03
- S02: Editor inline per-campo (`editingFieldId`, blur-to-save + 5s undo), 8 TipoElemento esaustivi, annotazioni, soft-delete toast 30s
- S03: Fonti inline (FonteTipo 5-variant, grouped by tipo, clickable link) + link bidirezionali atomici con inverse propagation
- S04: Board CRUD da sidebar (crea/rinomina/elimina) + ricerca cross-view + Jazz CoMaps
- S05: Timeline D3 SVG — asse verticale, card posizionate per DataStorica, zoom (wheel/pinch), pan (drag), popup compatto su click card
- S06: Polish iPad-native — eliminated forbidden width/height animations, opacity/transform only, touch target compliance
- S07: UAT end-to-end PASS — scenario completo verificato su tablet viewport
- S08: Migrazione completa mock → Jazz CRDTs (elemento CRUD, link bidirezionali, fonti, soft-delete, DemoAuth wired)

**Tests:** 126/126 pass. `npx tsc --noEmit` clean.

**Jazz integration architecture:**
- `elemento.schema.ts`: CoMap schemas completi (Elemento, Link, Fonte, Board, Workspace) con tutti i campi tipo-specifici
- `elemento.adapter.ts`: `coMapToElementoDomain()` (pure), `addBidirectionalLink()` (atomico), `softDeleteWorkspaceElemento()`, fonte CRUD
- `workspace-ui-store.ts`: module-level Jazz refs + `syncJazzState()` bridge verso Legend State
- `main.tsx`: `JazzProvider` con `sync={{ when: 'never' }}` e `withMigration` che crea workspace "Il mio workspace"

## Architecture / Key Patterns

- **Offline-first PWA** — zero server, build statico, service worker via vite-plugin-pwa
- **Jazz CRDTs** — single source of truth per dati, auth, sync (local-only per M001 demo)
- **DDD con vertical slices** — `features/<domain>/` (model, rules, errors, schema, adapter) + `ui/<page>/`
- **Adapter pattern** — Jazz CoMap → `coMapToElementoDomain()` → Domain model puro → React UI
- **D3 su SVG via refs** — per timeline e grafi, separato dal rendering React (Principio IV)
- **neverthrow** — Result<T,E> per error handling tipizzato nel domain layer
- **HeroUI v3 + Tailwind CSS** — componenti RAC touch-first (composizione TextField, non API v2)
- **React Compiler** — memoizzazione automatica build-time
- **Legend State** — `useSelector()` da `@legendapp/state/react` per leggere observable fields
- **Commit grammar** — blur-to-save + 5s Annulla toast su ogni mutazione di campo (nessun bottone Save/Cancel)
- **Atomic bidirectional links** — single `observable.set(...)` che patcha source + target in un'unica operazione
- **ruoliStr CSV** — campi lista opzionali nei CoMap serializzati come CSV invece di `co.list()` opzionale
- **Animate only opacity/transform** — mai animare width/height direttamente (forzano reflow)
- **Compound control exemption** — sub-controls (chip X-remove h-6) dentro parent ≥44px exempt da touch-target individuale
- **Annotazione = Elemento** — tipo "annotazione" è un Elemento first-class
- **Board = CoMap in co.list()** — non string ID list, per inline resolution e CRDT ownership

## Requirements

See [`.gsd/REQUIREMENTS.md`](.gsd/REQUIREMENTS.md) for the explicit capability contract and coverage mapping.

**All M001 requirements validated:** R001–R007.

## Milestone Sequence

- [x] M001: Prototipo completo su layout 3-pane consolidato — **COMPLETATO 2026-04-23** — S01✅ S02✅ S03✅ S04✅ S05✅ S06✅ S07✅ S08✅
- [ ] M007: Polish & Refinement — linguaggio dominio, fullheight, warning reali, notification center iPad-native, inline success, a11y, audit Jazz (esegue prima di M002 via depends_on)
- [ ] M002: Backend Jazz cloud sync — sync server, auth reale, gruppi, permessi (depends: M007)
- [ ] M003: Annotazione video JW.org — FonteTipo video, Mediator API, playback inline
- [ ] M004: Sharing, permessi, action log — Jazz groups, ruoli, rollback, portrait tablet
- [ ] M005: Media e immagini — upload, gallery, visualizzatore
- [ ] M006: Viste D3 avanzate — grafo force-directed, genealogia

Feature post-prototipo documentate in `.gsd/REQUIREMENTS.md` sezione Deferred.

## Known Limitations (post-M001)

- Milkdown rich editor per `descrizione` non ancora wired (mockup esiste, wiring deferred)
- Video FonteTipo deferred a M004
- `sync: { when: 'never' }` — Jazz locale only, nessun cloud sync (M002)
- Edge case non testato: bidirectional link undo quando target è stato soft-deleted nel frattempo
