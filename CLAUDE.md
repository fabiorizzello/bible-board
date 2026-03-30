# Timeline Board — Project Constitution

> Versione: 3.0.0 | Ratificata: 2026-03-23 | Ultima modifica: 2026-03-25

## Principi fondamentali

### I. Offline-First & Zero Server

L'applicazione DEVE funzionare completamente offline come PWA.
Tutti i dati DEVONO essere salvati localmente e sincronizzati quando c'è connettività.
NESSUN componente server — il build produce file statici deployabili ovunque.

- No SSR, no API server, no backend.
- Service worker via vite-plugin-pwa (Workbox) per cache asset offline.
- L'app DEVE essere installabile come PWA su tablet.

### II. Real-Time Collaboration via CRDTs

Tutti i dati persistenti DEVONO usare Jazz (jazz-tools, jazz-react) CRDTs per storage, sincronizzazione, autenticazione, gruppi e permessi.

- Jazz è la single source of truth per tutto lo stato persistente.
- Autenticazione tramite Jazz built-in auth.
- Sharing e permessi tramite Jazz groups con controllo accesso read/write.
- Conflict resolution gestita dai CRDTs — nessuna logica di merge manuale.

### III. Tablet-First Accessible UI

UI con HeroUI + Tailwind CSS + lucide-react. Componenti WCAG 2.1 AA, ottimizzati per touch tablet.

- **HeroUI**: React Aria-based per primitivi accessibili touch-first (buttons, inputs, modals, dropdowns). Fallback a HTML nativo + Tailwind per layout custom.
- **Tailwind CSS** per tutto lo styling. CSS custom solo in `src/styles/` per tokens e reset globali.
- **lucide-react** per tutte le icone — no emojis come icone UI.
- Tutti gli elementi interattivi DEVONO essere navigabili da tastiera.
- Form inputs DEVONO avere label e stati di errore.
- Touch target minimo 48x48px con gap 8px.
- `prefers-reduced-motion` DEVE essere rispettato.
- `touch-action: manipulation` su tutte le aree interattive.

### IV. D3-Driven SVG Rendering

Timeline e visualizzazioni grafo DEVONO usare D3 su SVG via React refs. React NON DEVE renderizzare elementi SVG per queste viste.

- D3 gestisce: scale, assi, zoom, pan, posizionamento, transizioni, manipolazione DOM SVG.
- React gestisce: layout, routing, form, dialog, lifecycle componenti.
- Comunicazione: React passa dati e dimensioni a D3 via refs e callbacks. D3 riporta interazioni via callbacks.
- Confine netto tra React UI e D3 visualization layer.
- D3 → React callbacks durante zoom/pan DEVONO essere throttled per 60fps.

### V. TypeScript Strict & Functional React

Tutto il codice in TypeScript strict mode. Tutti i componenti React funzionali con hooks.

- `tsconfig.json` con `"strict": true`.
- No class components. No `any` senza giustificazione con commento.
- Preferire named exports e return types espliciti su funzioni pubbliche.
- Componenti focalizzati — estrarre hooks per logica complessa.

### V-bis. DRY & SOLID (Pragmatico)

Applicare DRY e SOLID dove riducono complessità reale. NON dogmaticamente.

- **DRY**: Una business rule DEVE esistere in un solo posto (tipicamente `rules.ts`). Estrarre duplicazione solo quando rappresenta lo stesso concetto logico. NON DRY-are: boilerplate imports, test setup, varianti UI simili.
- **Single Responsibility**: Ogni `rules.ts` gestisce un aspetto del dominio. Se supera ~150 righe, valutare se mescola concern.
- **Open/Closed**: Discriminated unions (`TipoElemento`, `TipoLink`, `TipoFonte`) invece di if/else su stringhe.
- **Liskov**: Funzioni che accettano `Elemento` DEVONO funzionare per tutti i `TipoElemento`.
- **Interface Segregation**: Adapter e funzioni dominio accettano parametri specifici, non oggetti monolitici.
- **Dependency Inversion**: UI dipende da domain (rules, model), mai viceversa. Domain NON DEVE importare da adapter, schema, o UI.

### VI. Domain-Driven Design & Vertical Slices

Codebase organizzata in: `features/` per logica dominio e infrastruttura, `ui/` per pagine e componenti visuali.

- **`features/<domain>/`**: Modelli dominio, business rules, error types, Jazz schemas, adapter insieme. Logica dominio = funzioni pure su interfacce TypeScript — no import Jazz nei file dominio.
- **`ui/<page>/`**: Ogni pagina con componenti React e hooks. Le pagine compongono più features. Nessuna business logic nella UI.
- **Rich domain models**: Funzioni dominio incapsulano validazione, proprietà computed, transizioni di stato con NewTypes, Value Objects, Aggregates.
- **NewTypes (Parse, Don't Validate)**: Branded types per ID e primitivi dominio (ElementoId, BoardId, Tag) con Zod `.brand()` da jazz-tools (`z`) e `safeParse()`. No `as` cast — il branded type è prova del parsing. Branded schemas in `shared/newtypes.ts`; parsing al confine adapter.
- **Value Objects**: Immutabili, confrontati per valore (DataStorica, Fonte, ElementoLink).
- **Aggregates**: Elemento e Board sono Aggregate Root. Workspace è l'Aggregate top-level.
- **Bounded contexts**: workspace, elemento, board sono domini distinti. Dipendenze cross-domain tramite interfacce esplicite.
- **Ubiquitous language**: Identificatori in codice DEVONO usare terminologia di dominio. Termini italiani nel model (Elemento, Board, Fonte, etc.).
- **Link bidirezionali**: Quando si crea un link (es. Abraamo →padre→ Isacco), l'inverso DEVE essere creato automaticamente (Isacco →figlio→ Abraamo).

**Struttura cartelle:**

```
src/
  features/
    workspace/
      workspace.model.ts
      workspace.rules.ts
      workspace.errors.ts
      workspace.schema.ts
      workspace.adapter.ts
    elemento/
      elemento.model.ts
      elemento.rules.ts
      elemento.errors.ts
      elemento.schema.ts
      elemento.adapter.ts
    board/
      board.model.ts
      board.rules.ts
      board.schema.ts
      board.adapter.ts
    shared/
      newtypes.ts
      value-objects.ts
  ui/
    workspace-home/
    board-view/
    elemento-editor/
    elemento-detail/
```

### VII. Testing Strategy

Test prioritizzano logica dominio pura. Test DEVONO girare senza IO, senza Jazz runtime, senza React rendering.

- **Framework**: Vitest (Vite-native, zero config).
- **Domain tests**: Unit test puri su funzioni dominio. Import solo da `features/<domain>/` — mai da Jazz schemas o React components.
- **No mocking Jazz**: Se un test ha bisogno di mockare Jazz, la logica dominio non è pura abbastanza — refactorare.
- **React Testing Library**: Solo per interazioni UI critiche, non come default.
- **Coverage**: Domain rules e validation DEVONO avere test. Componenti UI POSSONO avere test.

### VIII. Error Handling

Funzioni dominio DEVONO usare `Result<T, E>` da neverthrow. Eccezioni solo per casi veramente eccezionali.

- **neverthrow**: `ok()`, `err()`, `.map()`, `.andThen()`, `.match()` per tutte le operazioni dominio. Import diretto da `"neverthrow"` — no file wrapper re-export.
- **Domain errors**: Discriminated unions per feature (es. `ElementoError`, `BoardError`).
- **React boundary**: `.match()` a livello componente per renderizzare success o error UI.
- **Form validation**: `combineWithAllErrors()` per raccogliere tutti gli errori di validazione.
- **No try/catch nel dominio**: Funzioni dominio ritornano `Result`, non lanciano.

### IX. Performance

Timeline DEVE renderizzare a 60fps su tablet di fascia bassa. Minimizzare re-render React.

- **React Compiler**: DEVE essere abilitato (memoizzazione automatica build-time, zero config con Vite).
- **Legend State**: PUÒ essere aggiunto per reattività fine-grained (`<Memo>`) se profiling mostra colli di bottiglia.
- **D3 rendering**: Già bypassa React virtual DOM (Principio IV). Transizioni D3 DEVONO usare `requestAnimationFrame`.
- **Touch**: `touch-action: manipulation` su SVG container.
- **Virtualizzazione**: CSS `content-visibility` nativo o windowing manuale se profiling lo richiede. No libreria dedicata in v1.

## Technology Stack

Scelte fisse, NON sostituibili senza emendamento alla constitution:

| Layer | Technology |
|---|---|
| Build | Vite + React Compiler |
| UI Framework | React (functional components) |
| Language | TypeScript (strict mode) |
| Routing | React Router (client-side) |
| UI Components | HeroUI (React Aria) + Tailwind |
| Icons | lucide-react (SVG, no emojis) |
| Visualization | D3 (direct SVG via refs) |
| Data / Sync | Jazz (jazz-tools, jazz-react) |
| Auth | Jazz built-in auth |
| Error Handling | neverthrow |
| Branded Types | Zod `.brand()` via jazz-tools `z` |
| Validation | Zod (schema validation) |
| State (UI) | Legend State (if needed) |
| Testing | Vitest |
| PWA | vite-plugin-pwa (Workbox) |
| Deployment | Static build, zero server |

Aggiungere dipendenze DEVE essere giustificato e NON DEVE duplicare funzionalità già fornite dallo stack.

## Design System

Token in `src/styles/tokens.css`, esposti come CSS custom properties e estensioni tema Tailwind.

| Token | Valore |
|---|---|
| Primary | #0D9488 (Teal) |
| Secondary | #14B8A6 (Teal light) |
| CTA / Accent | #F97316 (Orange) |
| Background | #F0FDFA (Teal wash) |
| Text | #134E4A (Teal dark) |
| Heading font | Fira Code |
| Body font | Fira Sans |
| Style | Micro-interactions |
| Transitions | 150-300ms, ease-out enter, ease-in exit |

## App-Like Feeling: iPad Native

L'app deve sembrare un'app nativa iPad, non un sito web responsive. Riferimenti: Apple Notes, Apple Mail, Things 3, Notion su iPad.

### Density e gerarchia visiva

Interfaccia densa e compatta, stile Notion/Linear. Info utile visibile senza scroll su iPad landscape (1024x768 viewport utile).

- **Header compatti**: una riga con titolo + azioni. Mai hero banner multi-riga.
- **Lista come contenuto primario**: righe compatte con titolo + badge tipo + data. Non card decorative.
- **Pannelli vuoti**: nascosti o ridotti a una riga. Mai placeholder illustrati.
- **Gerarchia per peso visivo**: contenuto primario domina. Sidebar e toolbar sono cromo.
- **Niente spazio vuoto decorativo**: ogni pixel serve a contenuto o respiro funzionale.

### Comportamento app-native

- **Nessun page reload visibile**: transizioni istantanee (dati in memoria via Jazz CRDT). Loading: skeleton o spinner inline.
- **Stato persistente**: sidebar aperta/chiusa, scroll position, ultimo elemento selezionato sopravvivono alla navigazione.
- **Feedback tattile immediato**: ogni tap ha risposta visiva entro 100ms.
- **Gesti naturali**: swipe per indietro, pull-to-refresh. L'app non combatte i gesti nativi.
- **No chrome superfluo**: niente breadcrumb se profondità ≤2, niente footer, niente decorazioni.

### Transizioni e animazioni

- **Durata**: 150ms per micro-interazioni, 250-300ms per transizioni layout.
- **Easing**: ease-out per entrate, ease-in per uscite.
- **Proprietà animate**: solo `opacity` e `transform`. Mai `width`, `height`, `top`, `left`.
- **Ridotto movimento**: tutto disabilitato con `prefers-reduced-motion: reduce`.
- **Fullscreen**: overlay `fixed inset-0` con transizione `opacity` + `translate-y`.

### HeroUI: come usarli

- **Usare HeroUI per**: Button, Input, Textarea, Select, Modal, Dropdown, Popover, Tooltip, Tabs, Switch, Checkbox, Badge, Spinner, Skeleton.
- **Non usare HeroUI per**: layout (sidebar, 3-pane, grid) — div + Tailwind.
- **Varianti**: `flat`/`light` per azioni secondarie, `solid` per CTA. `bordered` per input/select.
- **Size**: `sm` come default. `md` solo dove serve enfasi. Mai `lg`.

### Touch target e spacing

- Touch target minimo: 44x44px. Per elementi custom, padding adeguato.
- Gap tra target: minimo 8px.
- Spacing scale Tailwind (1=4px, 2=8px, 3=12px, 4=16px). Gap standard tra sezioni: `gap-4`. Tra elementi lista: `gap-1`/`gap-2`.
- Padding: detail pane `p-4`, list items `px-3 py-2`, sidebar items `px-2 py-1.5`.

## Convenzioni progetto

### Target Device

- **Solo tablet** (768px — 1024px). No mobile, no desktop.
- **Browser**: ultime 2 major di Chrome, Firefox, Safari, iOS Safari.

### Internazionalizzazione

- **Solo italiano**. Stringhe hardcoded. No libreria i18n.

### Git

- **Conventional commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- **Feature branches** da `main`. **Squash merge** a main.

### Naming

- **Files**: `kebab-case.ts` con dot-separated concerns (es. `elemento.rules.ts`)
- **Components**: `PascalCase.tsx` (es. `BoardViewPage.tsx`)
- **Hooks**: `camelCase.ts` con `use` prefix (es. `useElemento.ts`)
- **Types/Interfaces**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Folders**: `kebab-case`

### Security

- **Trusted users** — vincoli security minimi.
- Sanitizzazione input base prima di rendering SVG.
- No hardening auth oltre i default Jazz.

## Workflow di sviluppo

- **GSD-Driven**: Requisiti in `.gsd/REQUIREMENTS.md`, regole dominio in `.gsd/KNOWLEDGE.md`, decisioni in `.gsd/DECISIONS.md`. Consultare SEMPRE prima di implementare.
- **Jazz Docs First**: Prima di implementare data model o auth flow, consultare jazz.tools/docs. Jazz è una libreria giovane con training data limitati — sempre verificare contro docs correnti.
- **Incremental Delivery**: Ogni user story DEVE essere testabile e consegnabile indipendentemente.
- **YAGNI**: Non implementare feature non richieste. Iniziare semplice, aggiungere complessità solo quando giustificata.

## Verifiche pendenti

- [ ] **Jazz BinaryCoStream**: verificare supporto blob per immagini offline
- [ ] **Jazz schema migration**: verificare come Jazz gestisce migrazione schema CRDT

## Governance

Questa constitution è il documento di massima autorità per il progetto Timeline Board.

- **Emendamenti**: Ogni modifica a principi o stack richiede aggiornamento con version bump, rationale, e sync impact report.
- **Versioning**: MAJOR per rimozione/ridefinizione principi, MINOR per aggiunte, PATCH per chiarimenti.
- **Compliance**: Ogni PR verifica compliance con questi principi. Violazioni DEVONO essere risolte prima del merge.
