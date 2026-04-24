# Timeline Board

## What This Is

PWA tablet-first per studio biblico collaborativo. Permette di creare elementi tipizzati (personaggi, eventi, luoghi, profezie, guerre, regni, periodi, annotazioni), collegarli con link bidirezionali, documentare fonti verificabili, e annotare riflessioni personali. Jazz CRDTs per storage/sync/auth offline-first. Layout 3-pane iPad-style con visualizzazioni D3.

## Core Value

Il feel dell'app — deve sembrare un'app iPad nativa con navigazione chiara, non un sito web CRUD. Se il layout e la navigazione non funzionano, nessuna feature backend salva il prodotto.

## Current State

**M001 completato 2026-04-23.** Il prototipo completo è live: layout 3-pane con dark mode, editor inline per-campo su 8 ElementoTipo, fonti/link bidirezionali, board CRUD, timeline D3 SVG, Jazz CRDT persistence, e polish iPad-native. R001–R011 tutti validati. 141/141 test. tsc clean.

**M007 (Polish & Refinement) in corso — S01✅ S02✅ S03✅ S04–S07 pending:**
- S01: Linguaggio UI di dominio (zero markdown/panel/toast/field) + layout fullheight h-dvh — R046, R047 validati
- S02: Warning solo per validità reale (data invalida, referenza rotta) — computeValidityWarnings in elemento.rules.ts — R048 validato
- S03: Hook useFieldStatus + inline success feedback + no-op guard su InlineTitle, DescrizioneSection, TipoChip — R049, R050 validati
- S04: Notification center iPad-native (bell + drawer + rollback) — pending
- S05: A11y baseline + density uniforme + animation polish — pending
- S06: Audit Jazz reale (4 scenari browser) — pending
- S07: Revisione ui-ux-pro-max finale + integrated proof — pending

**Tests:** 141/141 pass. `pnpm tsc --noEmit` clean.

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
- **Commit grammar** — blur-to-save su ogni mutazione di campo (nessun bottone Save/Cancel)
- **Atomic bidirectional links** — single `observable.set(...)` che patcha source + target in un'unica operazione
- **ruoliStr CSV** — campi lista opzionali nei CoMap serializzati come CSV invece di `co.list()` opzionale
- **Animate only opacity/transform** — mai animare width/height direttamente (forzano reflow)
- **Compound control exemption** — sub-controls (chip X-remove h-6) dentro parent ≥44px exempt da touch-target individuale
- **Annotazione = Elemento** — tipo "annotazione" è un Elemento first-class
- **Board = CoMap in co.list()** — non string ID list, per inline resolution e CRDT ownership
- **useFieldStatus hook** — `useFieldStatus<T>(value, onCommit)` state machine shared per tutti i text field; onFocus cattura prev, onBlur(next) confronta con ===, chiama onCommit solo se diversi; prefers-reduced-motion letto a fire time non render time
- **Inline success feedback** — Check icon con transition-opacity; 3 varianti presentazione: endContent (Input), absolute overlay (Milkdown), adjacent ml-2 (popover trigger)
- **press-commit widgets** (popover, toggle) usano local `justCommitted` + setTimeout anziché useFieldStatus — il contratto onFocus/onBlur non si applica
- **computeValidityWarnings** — domain helper in `elemento.rules.ts`; warning solo per validità reale (data invalida, referenza rotta); completeness checks rimossi

## Requirements

See [`.gsd/REQUIREMENTS.md`](.gsd/REQUIREMENTS.md) for the explicit capability contract and coverage mapping.

**Validati:** R001–R011 (M001), R046–R050 (M007 S01–S03).

## Milestone Sequence

- [x] M001: Prototipo completo su layout 3-pane consolidato — **COMPLETATO 2026-04-23**
- [ ] M007: Polish & Refinement — S01✅ S02✅ S03✅ S04–S07 pending (esegue prima di M002)
- [ ] M002: Backend Jazz cloud sync — sync server, auth reale, gruppi, permessi (depends: M007)
- [ ] M003: Annotazione video JW.org — FonteTipo video, Mediator API, playback inline
- [ ] M004: Sharing, permessi, action log — Jazz groups, ruoli, rollback, portrait tablet
- [ ] M005: Media e immagini — upload, gallery, visualizzatore
- [ ] M006: Viste D3 avanzate — grafo force-directed, genealogia

Feature post-prototipo documentate in `.gsd/REQUIREMENTS.md` sezione Deferred.

## Known Limitations

- Milkdown rich editor per `descrizione` non ancora wired (mockup esiste, wiring deferred)
- Video FonteTipo deferred a M003
- `sync: { when: 'never' }` — Jazz locale only, nessun cloud sync (M002)
- Edge case non testato: bidirectional link undo quando target è stato soft-deleted nel frattempo
- Toast su mutazione ancora presente (verrà rimosso da S04 quando il drawer assorbirà il canale)
