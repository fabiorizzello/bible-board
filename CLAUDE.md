# Timeline Board — Project Constitution

> v3.0.0 | Ratificata 2026-03-23 | Ultima modifica 2026-04-15

## Principi fondamentali

### I. Offline-First & Zero Server
PWA offline-first. Dati salvati localmente, sincronizzati in rete. Zero backend — il build produce statici deployabili ovunque. No SSR/API server. Service worker via `vite-plugin-pwa` (Workbox). Installabile come PWA su tablet.

### II. Real-Time Collaboration via CRDTs
Jazz (`jazz-tools`, `jazz-react`) è single source of truth per tutto lo stato persistente: storage, sync, auth, groups, permessi read/write. Conflict resolution via CRDT — mai logica di merge manuale.

### III. Tablet-First Accessible UI
HeroUI + Tailwind + lucide-react. WCAG 2.1 AA. Touch-first.

- **HeroUI** (React Aria) per primitivi accessibili; Tailwind per layout; CSS custom solo in `src/styles/` (tokens + reset).
- **lucide-react** per tutte le icone. Mai emojis come icona UI.
- Touch target ≥44x44px, gap ≥8px. `touch-action: manipulation` su aree interattive.
- `prefers-reduced-motion` DEVE essere rispettato.
- Navigabilità da tastiera. Form: label + stati d'errore obbligatori.

### IV. D3-Driven SVG Rendering
Timeline e grafi: **D3 su SVG via refs**. React NON renderizza elementi SVG per queste viste.

- D3 gestisce scale, assi, zoom, pan, posizionamento, transizioni, DOM SVG.
- React gestisce layout, routing, form, dialog, lifecycle.
- Comunicazione via refs/callbacks. Callback D3→React durante zoom/pan throttled per 60fps.

### V. TypeScript Strict & Functional React
`tsconfig.json` con `"strict": true`. Solo componenti funzionali + hooks. No class components. No `any` senza commento giustificativo. Named exports e return types espliciti sulle API pubbliche. Componenti focalizzati — estrarre hooks per logica complessa.

### V-bis. DRY & SOLID (Pragmatico)
Applicare dove riduce complessità reale, NON dogmaticamente.

- **DRY**: una business rule in un solo posto (tipicamente `rules.ts`). NON DRY-are boilerplate imports, test setup, varianti UI simili.
- **SRP**: ogni `rules.ts` un aspetto del dominio. >150 righe → valutare split.
- **OCP**: discriminated unions (`TipoElemento`, `TipoLink`, `TipoFonte`) invece di if/else su stringhe.
- **LSP**: funzioni su `Elemento` DEVONO funzionare per tutti i `TipoElemento`.
- **ISP**: parametri specifici, non oggetti monolitici.
- **DIP**: UI → domain (mai viceversa). Domain NON importa da adapter/schema/UI.

### VI. Domain-Driven Design & Vertical Slices
`features/<domain>/` per dominio+infrastruttura. `ui/<page>/` per pagine.

- **`features/<domain>/`**: model, rules, errors, schema, adapter. Domain = funzioni pure su interfacce TS — no import Jazz nei file dominio.
- **`ui/<page>/`**: componenti React + hooks. Le pagine compongono features. Nessuna business logic nella UI.
- **NewTypes (Parse, Don't Validate)**: branded types con Zod `.brand()` da `jazz-tools` (`z`) + `safeParse()`. No `as` cast — il branded type è prova del parsing. Branded schemas in `shared/newtypes.ts`; parsing al confine adapter.
- **Value Objects**: immutabili, confrontati per valore (`DataStorica`, `Fonte`, `ElementoLink`).
- **Aggregates**: `Elemento` e `Board` sono Aggregate Root. `Workspace` è top-level.
- **Bounded contexts**: workspace, elemento, board. Cross-domain via interfacce esplicite.
- **Ubiquitous language**: identificatori in italiano di dominio (`Elemento`, `Board`, `Fonte`).
- **Link bidirezionali**: creare un link crea automaticamente l'inverso (Abraamo →padre→ Isacco ⇒ Isacco →figlio→ Abraamo).

```
src/
  features/
    {workspace,elemento,board}/{model,rules,errors,schema,adapter}.ts
    shared/{newtypes,value-objects}.ts
  ui/<page>/
```

### VII. Testing Strategy
Vitest. Test dominio puri — no IO, no Jazz runtime, no React rendering.

- Import solo da `features/<domain>/` — mai Jazz schemas o React components.
- **No mocking Jazz**: se un test deve mockare Jazz, la logica dominio non è abbastanza pura → refactor.
- React Testing Library solo per interazioni UI critiche, non come default.
- Domain rules e validation DEVONO avere test. UI POSSONO.

### VIII. Error Handling
`Result<T, E>` da neverthrow per tutte le operazioni dominio. Eccezioni solo per casi veramente eccezionali.

- Import diretto da `"neverthrow"` — no wrapper re-export.
- **Domain errors**: discriminated unions per feature (`ElementoError`, `BoardError`).
- **React boundary**: `.match()` a livello componente per render success/error.
- **Form validation**: `combineWithAllErrors()` per raccogliere tutti gli errori.
- **No try/catch nel dominio** — funzioni ritornano `Result`, non lanciano.

### IX. Performance
Timeline DEVE renderizzare a 60fps su tablet fascia bassa. Minimizzare re-render React.

- **React Compiler** abilitato (memoizzazione build-time, zero config con Vite).
- **Legend State** opzionale (`<Memo>`) se profiling mostra colli di bottiglia.
- **D3** già bypassa React (Principio IV). Transizioni via `requestAnimationFrame`.
- **Virtualizzazione**: `content-visibility` CSS o windowing manuale se serve. No libreria dedicata in v1.

## Technology Stack

Scelte fisse — modifiche richiedono emendamento costituzionale.

| Layer | Tech |
|---|---|
| Build | Vite + React Compiler |
| UI | React functional + HeroUI (React Aria) + Tailwind + lucide-react |
| Language | TypeScript strict |
| Routing | React Router (client-side) |
| Visualization | D3 (SVG via refs) |
| Data / Sync / Auth | Jazz (`jazz-tools`, `jazz-react`) |
| Errors | neverthrow |
| Branded Types | Zod `.brand()` via jazz-tools `z` |
| Forms | TanStack Form (headless, type-safe) |
| Validation | Zod |
| UI State | Legend State (`@legendapp/state`) |
| Testing | Vitest |
| PWA | vite-plugin-pwa (Workbox) |
| Deploy | Static build, zero server |

Nuove dipendenze richiedono giustificazione e NON DEVONO duplicare funzionalità già nello stack.

## Design System

Palette teal-based con accent orange per CTA. Typography: Fira Code headings, Fira Sans body. Valori concreti in `src/styles/tokens.css` (CSS custom properties + Tailwind theme extension) — **quello è il SoT, non questo documento**.

## iPad-Native Feel

App nativa iPad, non sito responsive. Riferimenti: Apple Notes/Mail, Things 3, Notion iPad.

- **Densità**: interfaccia compatta stile Notion/Linear. Info utile senza scroll su iPad landscape. Contenuto primario domina; sidebar/toolbar sono chrome. Niente spazio vuoto decorativo.
- **Zero page reload visibile**: transizioni istantanee via Jazz CRDT in memoria. Loading → skeleton/spinner inline.
- **Stato persistente**: sidebar, scroll, selezione sopravvivono alla navigazione.
- **Feedback tattile <100ms** per ogni tap.
- **Gesti nativi rispettati** (swipe back, pull-to-refresh). L'app non combatte i gesti.
- **No chrome superfluo**: no breadcrumb se profondità ≤2, no footer, no decorazioni.
- **Animare solo `opacity` e `transform`**. MAI `width`, `height`, `top`, `left` (forzano reflow).
- **HeroUI per primitivi interattivi, NON per layout** (sidebar, grid, 3-pane → Tailwind puro).

## Convenzioni

- **Target**: solo tablet. **Device di riferimento: iPad 10.9" (iPad Air)** — viewport CSS **1180×820 landscape**, **820×1180 portrait** (DPR 2x). Design baseline = iPad 10.9". Supersets supportati senza extra effort: iPad Pro 11" (1194×834), iPad Pro 13" (1366×1024), iPad standard 10.2" (1080×810). No mobile, no desktop. Ultime 2 major di Chrome, Firefox, Safari, iOS Safari.
- **i18n**: solo italiano, stringhe hardcoded, no librerie i18n.
- **Git**: Conventional commits (`feat`/`fix`/`docs`/`refactor`/`test`/`chore`). Feature branches da `main`, squash merge.
- **Naming**: files `kebab-case.ts` con dot-separated concerns (`elemento.rules.ts`); components `PascalCase.tsx`; hooks `useX.ts`; types PascalCase; const `SCREAMING_SNAKE_CASE`; folders `kebab-case`.
- **Security**: trusted users, vincoli minimi. Sanitizzazione input base prima di rendering SVG. Nessun hardening oltre i default Jazz.

## Workflow

- **GSD-driven**: requisiti in `.gsd/REQUIREMENTS.md`, decisioni in `.gsd/DECISIONS.md`, pattern in `.gsd/KNOWLEDGE.md`. Consultare SEMPRE prima di implementare.
- **Jazz docs first**: prima di toccare data model o auth, consultare jazz.tools/docs. Jazz è giovane — training data limitati, verificare contro docs correnti.
- **Incremental delivery**: ogni user story testabile e consegnabile indipendentemente.
- **Reuse-first**: se esiste già codice che fa il lavoro, riusalo. Prima di creare nuovo componente/funzione/pattern, grep il codebase per simili — estrarre base condivisa batte duplicazione.
- **YAGNI**: non implementare feature non richieste. Iniziare semplice, aggiungere complessità solo quando giustificata.

## Verifiche pendenti

- [ ] **Jazz BinaryCoStream**: verificare supporto blob per immagini offline
- [ ] **Jazz schema migration**: verificare gestione migrazione schema CRDT

## Governance

Questa constitution è il documento di massima autorità per il progetto Timeline Board.

- **Emendamenti**: modifiche a principi/stack richiedono version bump + rationale + sync impact report.
- **Versioning**: MAJOR per rimozione/ridefinizione principi, MINOR per aggiunte, PATCH per chiarimenti.
- **Compliance**: ogni PR verifica compliance. Violazioni DEVONO essere risolte prima del merge.
- **Source of Truth**: per valori concreti (colori, spacing, durate, catalogo componenti), il codice è autoritativo — non questo documento. Questa costituzione dice *come pensare*, non *quali valori*.
