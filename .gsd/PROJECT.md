# Timeline Board

## What This Is

PWA tablet-first per studio biblico collaborativo. Permette di creare elementi tipizzati (personaggi, eventi, luoghi, profezie, guerre, regni, periodi, annotazioni), collegarli con link bidirezionali, documentare fonti verificabili, e annotare riflessioni personali. Jazz CRDTs per storage/sync/auth offline-first. Layout 3-pane iPad-style con visualizzazioni D3.

## Core Value

Il feel dell'app — deve sembrare un'app iPad nativa con navigazione chiara, non un sito web CRUD. Se il layout e la navigazione non funzionano, nessuna feature backend salva il prodotto.

## Current State

**M007 (Polish & Refinement) completato 2026-04-24.** Il prototipo M001 è stato rifinito a qualità iPad-native: linguaggio di dominio italiano, layout fullheight h-dvh, warning solo per validità reale, inline success feedback su tutti i field con peso, notification center con rollback (sostituisce i toast), a11y baseline WCAG AA, audit Jazz 4 scenari documentati. R046–R050 tutti validati. 150/150 test. tsc clean.

**Pronto per M002 (cloud sync Jazz).**

**Tests:** 150/150 pass. `pnpm tsc --noEmit` clean.

**Jazz integration architecture:**
- `elemento.schema.ts`: CoMap schemas completi (Elemento, Link, Fonte, Board, Workspace) con tutti i campi tipo-specifici
- `elemento.adapter.ts`: `coMapToElementoDomain()` (pure), `addBidirectionalLink()` (atomico), `softDeleteWorkspaceElemento()`, fonte CRUD
- `workspace-ui-store.ts`: module-level Jazz refs + `syncJazzState()` bridge verso Legend State
- `main.tsx`: `JazzProvider` con `sync={{ when: 'never' }}` e `withMigration` che crea workspace "Il mio workspace"

## Architecture / Key Patterns

- **Offline-first PWA** — zero server, build statico, service worker via vite-plugin-pwa
- **Jazz CRDTs** — single source of truth per dati, auth, sync (local-only per M001/M007 demo)
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
- **notifications-store** — Legend State observable + parallel Map (non observable) per function closures (undoFn); notifyMutation(tipo, label, undoFn) al boundary di ogni mutazione; 0 toast() in src/ui/
- **h-dvh on root container** — non h-screen; gestisce Safari iPadOS dynamic toolbar; h-full su ogni wrapper flex intermedio che contiene un'area scroll flex-1

## Requirements

See [`.gsd/REQUIREMENTS.md`](.gsd/REQUIREMENTS.md) for the explicit capability contract and coverage mapping.

**Validati:** R001–R011 (M001), R046–R050 (M007).

## Milestone Sequence

- [x] M001: Prototipo completo su layout 3-pane consolidato — **COMPLETATO 2026-04-23**
- [x] M007: Polish & Refinement — linguaggio dominio, layout, warning, inline success, notification center, a11y, Jazz audit — **COMPLETATO 2026-04-24**
- [ ] M002: Backend Jazz cloud sync — sync server, auth reale, gruppi, permessi (depends: M007) — **PRONTO PER AVVIO**
- [ ] M003: Annotazione video JW.org — FonteTipo video, Mediator API, playback inline
- [ ] M004: Sharing, permessi, action log — Jazz groups, ruoli, rollback, portrait tablet
- [ ] M005: Media e immagini — upload, gallery, visualizzatore
- [ ] M006: Viste D3 avanzate — grafo force-directed, genealogia

Feature post-prototipo documentate in `.gsd/REQUIREMENTS.md` sezione Deferred.

## Known Limitations

- Milkdown rich editor per `descrizione` non ancora wired (mockup esiste, wiring deferred)
- Video FonteTipo deferred a M003
- `sync: { when: 'never' }` — Jazz locale only, nessun cloud sync (M002 scope)
- 5 touch-target secondari (size=sm in drawer/dialog footers) senza min-h-[44px] esplicito — logged in KNOWLEDGE.md, prossimo a11y pass
- Jazz A/B/C live scenario confirmation deferred — auto-mode non ha browser interattivo; richiesta verifica manuale pre-M002
- Edge case non testato: bidirectional link undo quando target è stato soft-deleted nel frattempo
