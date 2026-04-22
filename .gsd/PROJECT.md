# Timeline Board

## What This Is

PWA tablet-first per studio biblico collaborativo. Permette di creare elementi tipizzati (personaggi, eventi, luoghi, profezie, guerre, regni, periodi, annotazioni), collegarli con link bidirezionali, documentare fonti verificabili, e annotare riflessioni personali. Jazz CRDTs per storage/sync/auth offline-first (pianificato). Layout 3-pane iPad-style con visualizzazioni D3.

## Core Value

Il feel dell'app — deve sembrare un'app iPad nativa con navigazione chiara, non un sito web CRUD. Se il layout e la navigazione non funzionano, nessuna feature backend salva il prodotto.

## Current State

**M001 S03 completed (demo-level; Jazz persistence deferred)** — fonti editor inline e link bidirezionali sono funzionanti a livello di demo sul mock `workspace-ui-store`, ma la migrazione a Jazz CRDTs prevista dal piano NON è stata eseguita.

Delivered in S03:
- `FonteTipo` unione a 5 varianti (`scrittura | articolo-wol | pubblicazione | link | altro`) — video deferred a M004
- Pure helpers `addFonte` / `removeFonte` in `elemento.rules.ts` con errori tipizzati `fonte_duplicata` / `fonte_non_trovata`
- Session-scoped `fontiOverrides` + `commitFontiOverride` su `workspace-ui-store`
- Helpers atomici `createBidirectionalLink` / `removeBidirectionalLink` con propagazione inverso single-commit e idempotenza
- `getFontiGroupedByTipo` + costanti `FONTE_TIPO_LABEL` / `FONTE_TIPI_IN_SCOPE` condivise
- `FontiSection` inline in `ElementoEditor` con grammar add/remove + 5s undo
- DetailPane rendering grouped-by-tipo con `<Link>` cliccabili quando `urlCalcolata` è presente

**Blocker per S04–S07:** persistenza su Jazz assente. `fontiOverrides` ed `elementOverrides` vivono solo in memoria sul Legend State observable e vengono persi al reload. Tutti i must-have di M001 che richiedono persistenza (CRUD reale, Board salvati, Timeline su dati reali) dipendono da un nuovo slice di migrazione Jazz da inserire prima di S04.

Tests: 105/105 pass su codebase (`npx tsc --noEmit` clean, `npx vitest run` verde). 3 "failed suites" sono symlink stantii verso `.gsd/worktrees/M001-S02/` — follow-up di housekeeping.

## Architecture / Key Patterns

- **Offline-first PWA** — zero server, build statico, service worker via vite-plugin-pwa
- **Jazz CRDTs** — pianificato come single source of truth per dati, auth, sync, permessi (non ancora integrato)
- **DDD con vertical slices** — `features/<domain>/` (model, rules, errors, schema, adapter) + `ui/<page>/`
- **Adapter pattern** — Jazz CoMap → Adapter → Domain model puro → React UI (domain lato pronto, adapter layer non ancora implementato)
- **D3 su SVG via refs** — per timeline e grafi, separato dal rendering React (D002)
- **neverthrow** — Result<T,E> per error handling tipizzato nel domain layer
- **HeroUI v3 + Tailwind CSS** — componenti RAC touch-first (composizione TextField, non API v2) + utility styling
- **React Compiler** — memoizzazione automatica build-time
- **Legend State** — `useSelector()` da `@legendapp/state/react` per leggere observable fields (NOT `use$()` — D031)
- **Display helpers** — pure functions bridging domain types → UI display shapes, no React imports
- **Commit grammar (S02/S03)** — pure helper su readonly array → atomic `observable.set(...)` → 5s Annulla toast la cui closure chiama l'helper inverso
- **Atomic bidirectional writes** — un solo `observable.set(...)` che patcha entrambi i lati del link per evitare stati reattivi intermedi
- **Annotazione = Elemento** — tipo "annotazione" è un Elemento first-class, non un sub-oggetto (D021)
- **Board = query salvata** — selezione fissa/dinamica + vista lista/timeline (D012)

## Requirements

See [`.gsd/REQUIREMENTS.md`](.gsd/REQUIREMENTS.md) for the explicit capability contract and coverage mapping.

**M001 active:** 6 requirements (R006–R011), 5 validated (R001–R005 via S01–S02). R006 e R007 advanced a livello demo da S03 ma non validati end-to-end fino alla migrazione Jazz.

## Milestone Sequence

- [ ] M001: Prototipo completo su layout 3-pane consolidato — ✅ S01, S02, S03 (demo-only) completati; remaining: **Jazz-migration slice (da inserire)**, S04 (Board CRUD), S05 (timeline D3), S06 (polish + UAT finale)
- [ ] M002: Backend Jazz + persistenza reale — CRUD, link bidirezionali automatici, fonti, board persistenti (potrebbe essere parzialmente assorbito dal nuovo slice di migrazione in M001)
- [ ] M003: Annotazione video JW.org — FonteTipo video, Mediator API, playback inline, selezione sezione
- [ ] M004: Sharing, permessi, action log — Jazz groups, ruoli, rollback, portrait tablet
- [ ] M005: Media e immagini — upload, gallery, visualizzatore
- [ ] M006: Viste D3 avanzate — grafo force-directed, genealogia

Feature post-prototipo documentate in `.gsd/REQUIREMENTS.md` sezione Deferred.
