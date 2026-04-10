# Design Decisions & Rationale

> Decisioni di design emerse dalla fase di brainstorming.
> Contiene il **perché** dietro le scelte, per evitare di rivisitare decisioni già prese.
> Quando una decisione diventa regola di prodotto/dominio, la versione normativa va in CLAUDE.md o nella spec; qui resta la motivazione.

---

## D001 — neverthrow over Effect (ts-effect)

**Scope**: library | **Made by**: human | **Revisable**: No

**Choice**: neverthrow (Result<T,E> + ResultAsync)

**Rationale**: Effect è troppo pesante — è un intero runtime con fibers, scheduler, layers. neverthrow è leggero: solo Result<T,E> e ResultAsync, si integra con codice esistente senza lock-in. Il progetto ha bisogno di error handling tipizzato nel domain layer, non di un framework runtime.

---

## D002 — D3 diretto su SVG via refs (no React SVG)

**Scope**: architecture | **Made by**: human | **Revisable**: No

**Choice**: D3 manipola direttamente il DOM SVG tramite React refs

**Rationale**: React è lento per SVG pesanti (centinaia di nodi). D3 gestisce il rendering, React gestisce il chrome UI. I callback D3→React (es. click su nodo) sono throttled.

---

## D003 — React Compiler per auto-memoizzazione

**Scope**: architecture | **Made by**: human | **Revisable**: No

**Choice**: React Compiler (build-time) sostituisce useMemo/useCallback manuali

**Rationale**: Tablet di fascia media richiedono performance senza micro-ottimizzazioni manuali.

---

## D004 — HeroUI + Tailwind CSS (no Jolly UI)

**Scope**: library | **Made by**: human | **Revisable**: No

**Choice**: HeroUI (React Aria) + Tailwind CSS + lucide-react

**Rationale**: HeroUI offre primitivi touch-first accessibili (buttons, inputs, modals, dropdowns) senza costruire tutto da zero. Jolly UI scartato. Tailwind CSS gestisce layout, spacing, colori.

---

## D005 — Adapter Pattern: Jazz ↔ Domain ↔ React

**Scope**: architecture | **Made by**: human | **Revisable**: No

**Choice**: Jazz CoMap (mutable, CRDT) → Adapter → Domain model (immutable, puro) → React UI

**Rationale**: DDD richiede modelli puri; Jazz richiede mutabilità per CRDTs. L'adapter isola i due mondi. Il domain model è testabile senza IO.

---

## D006 — Profezia con date multiple

**Scope**: domain | **Made by**: human | **Revisable**: Yes

**Choice**: Una profezia ha una data di pronunciamento ma può avere più adempimenti; si modella come un Elemento per il pronunciamento e uno o più Elementi separati collegati via link "adempimento"

**Rationale**: Evita date multiple per singolo Elemento — un Elemento ha al massimo una DataTemporale.

---

## D007 — Tag vs Gruppo

**Scope**: domain | **Made by**: human | **Revisable**: Yes

**Choice**: "Tag" è un concetto data (vive sull'Elemento). Il gruppo visuale della timeline è solo un concetto di vista: tagGroups nella config timeline del Board raggruppano per tag sull'asse orizzontale, senza entità persistente dedicata.

**Rationale**: Un elemento può avere più tag ma nella timeline puoi raggruppare per un tag alla volta.

---

## D008 — Terminologia ere

**Scope**: domain | **Made by**: human | **Revisable**: No

**Choice**: Si usa **a.e.v.** (avanti era volgare) e **e.v.** (era volgare), NON a.C./d.C. Il campo era nel modello usa `"aev" | "ev"`.

**Rationale**: Coerenza terminologica con la tradizione di studio.

---

## D009 — Fonti: principio "fonte-first"

**Scope**: domain | **Made by**: human | **Revisable**: No

**Choice**: Le fonti hanno priorità visiva sopra le riflessioni personali nel detail dell'elemento

**Rationale**: "Non farina del proprio sacco" — lo studio biblico richiede attendibilità. Il principio guida è la tracciabilità: ogni informazione deve essere riconducibile a una fonte verificabile.

---

## D010 — Descrizione vs Riflessioni

**Scope**: domain | **Made by**: human | **Revisable**: No

**Choice**: `descrizione` è il testo condiviso fattuale (enciclopedico). Le `riflessioni` sono pensieri personali per-utente. Separazione netta.

**Rationale**: In un workspace condiviso, l'utente deve capire a colpo d'occhio cosa è fatto e cosa è pensiero personale.

---

## D011 — Riflessione su citazione, non su fonte

**Scope**: domain | **Made by**: human | **Revisable**: No

**Choice**: La riflessione è contestuale: vive sul legame (elemento + fonte), non sulla fonte globale.

**Rationale**: "La fede di Abraamo" annotata su Gen 12:1-3 nel contesto di Abraamo non ha senso se appare nel contesto di Sara. Modello ispirato a JW Library che àncora le note al punto di lettura.

---

## D012 — Board come "query salvata"

**Scope**: architecture | **Made by**: human | **Revisable**: Yes

**Choice**: Il Board è come una query salvata — la selezione (fissa/dinamica) definisce QUALI elementi, la vista (timeline/lista/grafo/genealogia) è solo COME li vedi. L'utente può cambiare vista in qualsiasi momento. Le configViste sono persistite per ciascuna vista usata.

**Rationale**: Separazione tra selezione dati e presentazione. Massima flessibilità per l'utente.

---

## D013 — Layout 3-pane iPad-style

**Scope**: architecture | **Made by**: human | **Revisable**: No

**Choice**: Sidebar + List + Detail, ispirato a Apple Notes/Mail su iPad. La sidebar si nasconde automaticamente alla selezione. Le viste spaziali sostituiscono il list pane con canvas a piena larghezza.

**Rationale**: Ottimizzato per landscape tablet, non per mobile.

---

## D014 — Jazz media con co.image()

**Scope**: architecture | **Made by**: agent | **Revisable**: Yes

**Choice**: Modellare image attachments con `co.image()` e upload con `createImage()`. `co.fileStream()` come fallback per non-image binaries (fuori v1).

**Rationale**: Jazz documentation espone image handling first-class con progressive loading e placeholder. Evita subsystem blob hand-rolled.

---

## D015 — Jazz schema evolution additive-first

**Scope**: architecture | **Made by**: agent | **Revisable**: Yes

**Choice**: Definire account/root/profile schemas con `co.account(...).withMigration(...)`, mantenere cambiamenti additivi, campi nuovi opzionali, migration esplicita solo per backfill strutturali.

**Rationale**: `withMigration()` è il path supportato. Evolution additive-first minimizza breakage per client local-first sincronizzati.

---

## D016 — Jazz groups come permission boundary

**Scope**: architecture | **Made by**: agent | **Revisable**: Yes

**Choice**: Persistere ownership e sharing workspace tramite Jazz `Group` objects con ruoli read/write a livello workspace, ereditati dai CoValues contenuti.

**Rationale**: Jazz groups sono il meccanismo permessi documentato e supportano collaborazione local-first senza ACL parallelo.

---

## D021 — Annotazione video come TipoElemento

**Scope**: domain | **Made by**: human | **Revisable**: Yes

**Choice**: Annotazione è un nuovo TipoElemento ("annotazione") — entità first-class come personaggio/evento/luogo. Appare nella lista elementi, nelle board, nella ricerca. Collegamento ad altri elementi tramite link bidirezionali standard.

**Rationale**: Riusa tutta l'infrastruttura esistente (lista, ricerca, tag, board, link). L'unica parte speciale è il player video nel detail pane. Zero viste nuove necessarie.

---

## D022 — Video come Fonte dell'annotazione, link per relazioni

**Scope**: domain | **Made by**: human | **Revisable**: No

**Choice**: Il video è una Fonte dell'annotazione (FonteTipo "video" con mediaKey + sezione da/a). I link bidirezionali collegano l'annotazione agli elementi correlati. Fonte = "da dove viene l'informazione", Link = "a chi si collega".

**Rationale**: L'utente ha definito la struttura: `Annotazione.fonte = [video, da-a]` e `Annotazione.link = [Abraamo, Isacco]`. Separazione semantica pulita tra provenienza e relazione.

---

## D023 — FonteTipo esteso con "video"

**Scope**: domain | **Made by**: human | **Revisable**: No

**Choice**: `FonteTipo: "scrittura" | "articolo" | "video" | "altro"`. La variante "video" aggiunge: `mediaKey` (naturalKey JW.org), `sezione: { da: number, a: number }` (secondi), metadata cached (titoloOriginale, durataSecondi, thumbnail, qualità disponibili).

**Rationale**: Estensione naturale del discriminated union Fonte. Open/Closed principle — nuovo tipo senza toccare i tipi esistenti.

---

## D024 — JW Mediator API per metadata e playback

**Scope**: architecture | **Made by**: collaborative | **Revisable**: Yes (se API cambia)

**Choice**: API pubblica `b.jw-cdn.org/apis/mediator/v1/media-items/{lang}/{naturalKey}`. Restituisce: MP4 diretti (240p-720p), VTT sottotitoli, thumbnail, durata. Playback inline con HTML5 `<video>` + fragment `#t=start,end`.

**Rationale**: API pubblica CDN-backed, stabile, con progressive download URLs. Nessun iframe — la SPA jw.org non è embeddabile. Compatibile con offline-first futuro.

---

## D025 — Online-first, download video deferred

**Scope**: architecture | **Made by**: human | **Revisable**: Yes

**Choice**: v1: playback online via `<video src="...mp4#t=start,end">`. Download offline deferred a v2. Quando implementato: full video a qualità scelta (240p default ≈ 26MB/17min). No partial caching.

**Rationale**: MP4 trimming client-side richiede ffmpeg.wasm (~25MB) o parser MP4 custom. Full download a 240p è accettabile per tablet. YAGNI — ship fast, poi iterare.

---

## D026 — Annotazione: solo video per ora

**Scope**: scope | **Made by**: human | **Revisable**: Yes

**Choice**: Primo scope: solo FonteTipo "video". Estensione ad articoli (sezione paragrafi da-a) e immagini in iterazioni successive.

**Rationale**: Il caso d'uso video è il più chiaro e impattante. Evita over-engineering upfront.

---

## D034 — Reuse existing code instead of rewriting from scratch

**Scope**: workflow | **Made by**: human | **Revisable**: No

**Choice**: When code already exists that meets the task requirements, reuse it directly instead of extracting/rewriting. Verify existing implementation meets all task constraints and document reuse in task plan.

**Rationale**: During M002/S01, all component decomposition code (NavSidebar, ListPane, DetailPane, FullscreenOverlay, WorkspacePreviewPage, workspace-ui-store, display-helpers) already existed with full feature parity including dark mode, ThemeSwitcher, filters, collegamenti, fonti, ElementoEditor integration. Rewriting would waste time and risk breaking working features. The override "se c'è già codice, riusalo" was issued during T01 to prevent unnecessary rework.

---

## D035 — UI/UX Review Gate applies even when reusing existing code

**Scope**: workflow | **Made by**: human | **Revisable**: No

**Choice**: When reusing existing code that contains UI/UX work (new components, significant visual modifications, or user-facing interactions), the UI/UX Review Gate (CLAUDE.md workflow) MUST still be applied. This means: (1) load ui-ux-pro-max skill, (2) verify the reused code meets project UI/UX standards, (3) capture screenshots of all key interactions, (4) request human approval before marking the task complete.

**Rationale**: During M002/S01/T02, the agent planned to reuse existing NavSidebar and ListPane components without requesting UI/UX approval. The user clarified via override "si ma anche se c'è, se comprende nuova ui/ux dovresti richiedere mia validazione come specificato" that the Review Gate is mandatory regardless of whether code is written from scratch or reused. The gate exists to validate visual quality and user experience, not just code correctness. Supersedes the interpretation that D034 (code reuse) exempts from UI review.

---

## Decisions Table

| # | When | Scope | Decision | Choice | Rationale | Revisable? | Made By |
|---|------|-------|----------|--------|-----------|------------|---------|
| D001 |  | library | Error handling library for domain layer | neverthrow (Result<T,E> + ResultAsync) | Effect (ts-effect) è troppo pesante — un intero runtime con fibers, scheduler, layers. neverthrow è leggero: solo Result<T,E> e ResultAsync, si integra con codice esistente senza lock-in. Il progetto ha bisogno di error handling tipizzato nel domain layer, non di un framework runtime. | No | human |
| D002 |  | architecture | Data flow architecture between Jazz CRDTs and domain layer | Jazz CoMap (mutable, CRDT) → Adapter → Domain model (immutable, puro) → React UI | DDD richiede modelli puri; Jazz richiede mutabilità per CRDTs. L'adapter isola i due mondi. Il domain model è testabile senza IO e senza Jazz runtime. Se un test deve mockare Jazz, la logica dominio non è pura abbastanza. | No | human |
| D003 |  | architecture | Rendering approach for timeline and graph visualizations | D3 manipola direttamente il DOM SVG tramite React refs | React è lento per SVG pesanti (centinaia di nodi). D3 gestisce il rendering, React il chrome UI. Callback D3→React throttled. Confine netto tra i due layer. | No | human |
| D004 |  | architecture | Memoization strategy for React performance | React Compiler (build-time automatic memoization, zero config Vite) | Tablet fascia media richiedono performance senza micro-ottimizzazioni manuali. Sostituisce useMemo/useCallback manuali. | No | human |
| D005 |  | library | UI component library and styling approach | HeroUI (React Aria) + Tailwind CSS + lucide-react. Jolly UI scartato. | HeroUI offre primitivi touch-first accessibili senza costruire da zero. Tailwind CSS gestisce layout, spacing, colori. | No | human |
| D006 |  | domain | Modeling prophecies with multiple fulfillment dates | Profezia = Elemento pronunciamento + Elementi adempimento collegati via link "adempimento" | Evita date multiple per singolo Elemento — un Elemento ha al massimo una DataTemporale. | Yes | human |
| D007 |  | domain | Tag vs Gruppo: entity model for categorization | Tag è un concetto data sull'Elemento. Il raggruppamento timeline è solo un concetto di vista (tagGroups nella config board). | Un elemento può avere più tag ma nella timeline puoi raggruppare per un tag alla volta. No entità persistente dedicata. | Yes | human |
| D008 |  | domain | Terminology for historical eras | "aev" (avanti era volgare) e "ev" (era volgare). MAI a.C./d.C. | Coerenza terminologica con la tradizione di studio. | No | human |
| D009 |  | domain | Information hierarchy: sources vs personal reflections | Fonti hanno priorità visiva sopra le riflessioni personali nel detail | Principio "fonte-first": ogni informazione deve essere tracciabile. Lo studio biblico richiede attendibilità — prima i fatti verificabili, poi i pensieri personali. | No | human |
| D010 |  | domain | Shared factual content vs personal annotations | descrizione = testo condiviso fattuale (enciclopedico). riflessioni = pensieri personali per-utente. Separazione netta. | In un workspace condiviso, l'utente deve capire a colpo d'occhio cosa è fatto e cosa è pensiero personale. | No | human |
| D011 |  | domain | Reflection anchoring model: per-citation vs per-source | Riflessione contestuale: vive sul legame (elemento + fonte), non sulla fonte globale | "La fede di Abraamo" su Gen 12:1-3 nel contesto di Abraamo non ha senso nel contesto di Sara. Modello JW Library: note ancorate al punto di lettura. | No | human |
| D012 |  | architecture | Board conceptual model | Board = query salvata. Selezione (fissa/dinamica) = QUALI elementi. Vista (lista/timeline/grafo/genealogia) = COME li vedi. | Separazione tra selezione dati e presentazione. Massima flessibilità — l'utente cambia vista in qualsiasi momento. | Yes | human |
| D013 |  | architecture | Layout pattern for tablet-first app | Sidebar + List + Detail (Apple Notes/Mail iPad). Sidebar auto-hide alla selezione. Viste spaziali: canvas piena larghezza. | Ottimizzato per landscape tablet. Massimizza spazio detail pane. Riferimenti: Apple Notes, Things 3, Notion su iPad. | No | human |
| D014 |  | architecture | Jazz media storage approach | co.image() per media con progressive loading. co.fileStream() solo per non-image (fuori v1). | Jazz ha image handling first-class con progressive loading e placeholder. Blob in IndexedDB fuori Jazz spezzerebbe persistence e sync. | Yes | agent |
| D015 |  | architecture | Jazz schema evolution strategy | co.account(...).withMigration(...), additive-first, campi nuovi opzionali, migration esplicita solo per backfill strutturali. | withMigration() è il path supportato da Jazz. Hard-reset perderebbe dati. Migration ad hoc nella UI spargerebbe concern di persistenza. | Yes | agent |
| D016 |  | architecture | Permission boundary mechanism | Jazz Group objects con ruoli read/write a livello workspace, ereditati dai CoValues contenuti. No ACL custom. | Jazz groups sono il meccanismo permessi documentato, supportano collaborazione local-first senza sistema ACL parallelo. | Yes | agent |
| D017 | M001 | architecture | Milestone sequence: UI/UX sketch before MVP functional | M001 = prototipo navigabile full flow con dati mock (zero Jazz). M002 = MVP funzionale con Jazz reale. | Il timore più grande è "non sembra app nativa" + "navigazione confusa". Validare feel e navigazione prima di investire nel backend previene rework costoso. Il codice esistente è sketch esplorativo, non fondazione. | No | collaborative |
| D018 | M001 | convention | Design system generation and verification approach | Usare skill ui-ux-pro-max (.claude/skills/ui-ux-pro-max/) per generare design system, verificare scelte visive, e applicare checklist pre-delivery su ogni slice UI. | L'utente ha richiesto esplicitamente questa skill. Garantisce coerenza visiva, accessibilità, e quality gate su ogni componente. | Yes — se la skill non produce risultati utili | human |
| D019 | M001 | architecture | Timeline axis orientation | Timeline verticale con scroll naturale, card a destra dell'asse, zoom cambia scala temporale. | Più naturale su tablet — scroll verticale è il gesto primario. Card affiancate sfruttano la larghezza landscape. | Yes — se test su tablet mostra problemi | collaborative |
| D020 | M001 | scope | MVP scope boundaries | MVP include tutti e 4 i tipi fonte (bibbia, articolo-wol, pubblicazione, link), selezione dinamica board, timeline D3, riflessioni su citazione, link con ruoli parentela. Esclusi: action log/rollback, grafo, genealogia, media, sharing, portrait. | L'utente ha ampliato lo scope MVP per includere feature che ritiene core (timeline è nel nome, articoli WOL sono fonte primaria, riflessioni su citazione è il differenziatore). Action log tagliato esplicitamente. | Yes — dopo validazione UI/UX in M001 | human |
| D021 | M001 | domain | Merge riflessione e annotazione in un unico concetto | Riflessione e annotazione diventano lo stesso concetto: un Elemento di tipo "annotazione", first-class, per-utente, ricercabile, listabile, collegato a elementi/fonti tramite link bidirezionali standard. Sparisce il sub-oggetto riflessione. La contextualità (ex riflessione su citazione) è espressa dai link. Sezione "Riflessioni" nel detail diventa "Annotazioni" con filtro mie/altrui per autore. Supersede D011. | Riflessione su citazione e annotazione sono lo stesso pattern: un pensiero personale ancorato a qualcosa di specifico. L'unica differenza era il livello di cittadinanza (sub-oggetto vs entità). Unificarli elimina una slice intera (S05), semplifica il modello (un solo concetto invece di due), e dà alle riflessioni le stesse capability delle annotazioni (tag, ricerca, board). | No | collaborative |
| D022 |  | architecture | HeroUI semantic variable override approach | Override HeroUI's CSS custom properties (--accent, --background, --foreground, --focus, --link, --surface, --border, --separator) statically in tokens.css using CSS cascade — tokens.css is imported after @heroui/styles in index.css, so project values win. | HeroUI v3 uses oklch-based semantic CSS variables that default to blue. The project constitution requires teal (#0D9488) primary and orange (#F97316) accent. Static overrides in tokens.css are simpler and more maintainable than runtime patching (which ThemeSwitcher.tsx does as a dev tool). The import order in index.css already guarantees cascade priority. | Yes — if HeroUI changes variable naming in a major version | agent |
| D023 |  | architecture | DemoAuth state management approach | Simple React context (AuthProvider + useAuth hook) stores user name in memory. No persistence, no token, no session. AuthProvider wraps RouterProvider in main.tsx. Unauthenticated users redirect to /auth. | M001 is a UI prototype with zero backend. A React context is the lightest possible auth mock — no external deps, trivially replaceable when Jazz auth arrives in M002. Redirect-based guard keeps routing clean. | No — will be replaced entirely by Jazz auth in M002 | agent |
| D024 |  | architecture | Routing architecture for /workspace layout | Nested routes with null child elements — /workspace parent renders WorkspaceLayout, child routes (/workspace/tutti, /workspace/elemento/:elementoId, /workspace/board/:boardId) exist only for URL pattern matching. WorkspaceLayout reads useParams() directly. No Outlet content rendering. | Deep links (R022) require path-based params. The layout shell needs to know elementoId/boardId to control sidebar auto-hide, canvas mode, and element selection — all layout concerns. Child routes with null elements are the simplest way to register URL patterns while keeping all rendering logic in the parent. Avoids over-nesting with Outlet and keeps state management centralized. | Yes — if S03+ needs route-level code splitting via Outlet children | agent |
| D025 |  | library | How to use HeroUI v3 Input component correctly | TextField composition pattern: TextField > Label + Input + FieldError. NOT v2 props (onValueChange, isInvalid, classNames, errorMessage) directly on Input. | HeroUI v3 is built on React Aria Components (RAC). The Input component is a thin RAC primitive that renders a native input. All the form field features (label, validation, error messages) come from the TextField wrapper, not from Input props. Using v2 API causes props to pass through to DOM, creating read-only inputs and React warnings. | Yes | agent |
| D026 |  | architecture | Ripartire dal layout consolidato 3-pane (commit e18cb09) invece di continuare con i componenti M001 | M002 decompone il monolite WorkspacePreviewPage originale preservando tutte le feature visive (dark mode, theme switcher, filtri, collegamenti, fonti), invece di riscrivere da zero | M001 ha riscritto i componenti da zero perdendo dark mode, theme switcher, filtri tipo, collegamenti renderizzati, fonti linkate. Il layout originale (commit e18cb09) è il riferimento visivo approvato dall'utente (screenshots). Ripartire da lì evita di ricostruire feature già funzionanti. | Yes | human |
| D027 |  | architecture | Tailwind CSS integration method: PostCSS vs Vite plugin | Usare @tailwindcss/postcss via postcss.config.mjs. NON usare @tailwindcss/vite come plugin Vite. | Il plugin @tailwindcss/vite causa un loop infinito di reload del dev server — triggera la re-ottimizzazione delle dipendenze a ogni cambio, producendo un full page reload ogni ~2 secondi. L'approccio PostCSS è stabile e non interferisce con il dependency optimization di Vite. Questa configurazione NON va cambiata per nessun motivo. | Yes | human |
| D028 |  | library | Form management library | TanStack Form per gestione form. Headless, type-safe, si integra con HeroUI senza conflitto. | L'editor elemento ha campi progressivi tipo-specifici, validazione complessa (DataStorica, ruoli parentela), autosave. TanStack Form è headless (nessun conflitto con HeroUI RAC), type-safe, e leggero. Evita form state management con useState sparsi. | Yes | human |
| D029 |  | library | UI state management library | Legend State (@legendapp/state + @legendapp/state/react) per stato condiviso UI e fine-grained reactivity. | La decomposizione del monolite in NavSidebar/ListPane/DetailPane richiede stato condiviso (vista corrente, elemento selezionato, sidebar aperta, filtri). Legend State offre observable stores senza re-render cascata, Memo component per fine-grained updates su liste, e si integra con React Compiler. Evita prop drilling profondo e context re-render. | Yes | human |
| D030 | M002/S01 | architecture | Legend State reading pattern in React components | Use `use$()` hook from `@legendapp/state/react` to read individual observable fields, not `observer()` HOC | `use$()` is simpler for reading individual fields from a module-level observable store. Each `use$(workspaceUI$.fieldName)` call subscribes only to that field, giving fine-grained reactivity without wrapping the entire component in `observer()`. This matches the component structure where each pane reads a small subset of the shared state. | Yes | agent |
| D031 | M002/S01 | library | Legend State reading pattern in React components — corrected API | Use `useSelector()` from `@legendapp/state/react` to read individual observable fields. NOT `use$()` (which does not exist in Legend State v2.1.15) and NOT `observer()` HOC. | D030 incorrectly specified `use$()` which does not exist in Legend State v2.1.15. The actual API is `useSelector(workspaceUi$.fieldName)` which subscribes to a single observable field and triggers re-render only when that specific field changes. Discovered during T02 implementation. Supersedes D030. | Yes | agent |
| D032 | M002/S02 | library | Whether to use TanStack Form for the inline editor in S02 | Defer TanStack Form. Use controlled React useState for the inline editor in the mock-data prototype. | The constitution lists TanStack Form in the tech stack, but for a mock-data prototype with no real mutation/persistence, controlled React state is simpler and sufficient. TanStack Form adds complexity (field registration, validation adapters, form state management) that provides no benefit when "save" just validates and closes edit mode. Will adopt TanStack Form when Jazz persistence is wired and real form mutation matters. | Yes — revisit when Jazz persistence is wired for editing | agent |
| D033 | M002 onwards | workflow | Come gestire la review UI/UX in auto-mode | Mockup-first con route dev: auto-mode produce un .tsx reale con dati hardcoded in src/ui/mockups/, montato su route /dev/mockup-*. L'utente revisiona tra i task. Solo dopo approvazione si wira la logica reale. No Storybook. | Auto-mode produceva UI completa (store + wiring + componente) in un task intero, ma il risultato visivo spesso non piaceva — tempo sprecato. Invertendo l'ordine (prima il look con componente HeroUI reale + token del tema, poi il wiring) si valida il visual in minuti invece che ore, con zero translation gap. Storybook scartato: setup non banale (doppia configurazione tema/token), dipendenza in più, due dev server — la route dev nella stessa app Vite dà lo stesso risultato a zero overhead. | Yes | collaborative |
| D034 | M002/S01 | workflow | Reuse existing code instead of rewriting from scratch | When code already exists that meets the task requirements, reuse it directly instead of extracting/rewriting. Verify existing implementation meets all task constraints and document reuse in task plan. | During M002/S01, all component decomposition code (NavSidebar, ListPane, DetailPane, FullscreenOverlay, WorkspacePreviewPage, workspace-ui-store, display-helpers) already existed with full feature parity including dark mode, ThemeSwitcher, filters, collegamenti, fonti, ElementoEditor integration. Rewriting would waste time and risk breaking working features. The override "se c'è già codice, riusalo" was issued during T01 to prevent unnecessary rework. | No | human |
| D035 | M002/S01 | workflow | UI/UX Review Gate applies even when reusing existing code | When reusing existing code that contains UI/UX work (new components, significant visual modifications, or user-facing interactions), the UI/UX Review Gate (CLAUDE.md workflow) MUST still be applied. This means: (1) load ui-ux-pro-max skill, (2) verify the reused code meets project UI/UX standards, (3) capture screenshots of all key interactions, (4) request human approval before marking the task complete. | During M002/S01/T02, the agent planned to reuse existing NavSidebar and ListPane components without requesting UI/UX approval. The user clarified via override "si ma anche se c'è, se comprende nuova ui/ux dovresti richiedere mia validazione come specificato" that the Review Gate is mandatory regardless of whether code is written from scratch or reused. The gate exists to validate visual quality and user experience, not just code correctness. Supersedes the interpretation that D034 (code reuse) exempts from UI review. | No | human |
