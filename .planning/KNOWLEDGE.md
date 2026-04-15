# Knowledge Base

> Regole di dominio, pattern, e lezioni apprese. Consultare all'inizio di ogni unità di lavoro.

---

## Dominio: Terminologia

- **Era**: si usa `"aev"` (avanti era volgare) e `"ev"` (era volgare). MAI a.C./d.C.
- **Lingua UI**: solo italiano, stringhe hardcoded. No libreria i18n.
- **Ubiquitous language**: identificatori codice in terminologia di dominio. Termini italiani nel model: Elemento, Board, Fonte, Tag, Annotazione, Link, Workspace.

---

## Dominio: Elemento

- Un Elemento ha al massimo una DataTemporale (puntuale o range). Per personaggi, nascita/morte sono campi separati, non DataTemporale.
- Tipi elemento: `personaggio | evento | luogo | profezia | guerra | regno | periodo | annotazione`.
- Campi tipo-specifici: solo `personaggio` ha nascita/morte/tribù/ruoli. `guerra` ha fazioni/esito. `profezia` ha stato. `regno` ha dettagli. `luogo` ha regione. `evento`, `periodo` e `annotazione` nessun campo extra.
- `annotazione` è per-utente (autore), altrui possono leggere/cercare ma non modificare. Assorbe il vecchio concetto di "riflessione" (D021).
- `descrizione` è il testo condiviso fattuale (enciclopedico). Le annotazioni sono pensieri personali per-utente, ma entità autonome collegate via link. Separazione netta: prima i fatti, poi le opinioni.
- La gerarchia informativa nel detail è: titolo+metadata → descrizione → fonti → annotazioni (mie/altrui) → collegamenti → board.
- Sezioni vuote: non mostrate, zero spazio occupato. Mai placeholder illustrati.
- Eliminazione: soft delete con toast "Annulla" (30 secondi). Cascade: rimuove link bidirezionali e fonti associate.

---

## Dominio: DataStorica

```
DataStorica {
  anno: number
  mese?: number        // 1-12
  giorno?: number      // 1-31, richiede mese
  era: "aev" | "ev"
  precisione: "esatta" | "circa"
}
DataTemporale = Puntuale(DataStorica) | Range(inizio: DataStorica, fine: DataStorica)
```

- Il giorno richiede il mese. Il mese è opzionale. L'anno e l'era sono obbligatori.

---

## Dominio: Link bidirezionali

- 8 tipi: `correlato | causa-effetto | successione | parallelo | adempimento | parentela | localizzazione | residenza`.
- Alla creazione di un link, il link inverso DEVE essere creato atomicamente entro 1 secondo.
- Alla rimozione, il link inverso DEVE essere rimosso atomicamente.
- Link a sé stesso: vietato. Link duplicato (stesso tipo + stesso target): vietato.
- Link verso elementi eliminati: ignorati silenziosamente al caricamento.
- **Parentela**: 5 ruoli (`padre | madre | figlio | figlia | coniuge`). Tabella inversi: padre→figlio, madre→figlio, figlio→padre, figlia→padre, coniuge→coniuge. Il ruolo inverso di "figlio" è sempre "padre" indipendentemente dal genere del target.
- Nota opzionale su ogni link (collassata di default nell'editor).

---

## Dominio: Fonti

- Principio **fonte-first**: ogni informazione deve essere tracciabile. "Da dove viene?" in < 2 secondi.
- 5 tipi: `bibbia | articolo-wol | link | video | immagine`.
- Le fonti sono entità condivise (tutti vedono le stesse fonti). Le annotazioni sulle fonti sono per-utente (elementi di tipo annotazione collegati via link).
- Ordine visualizzazione: per tipo (bibbia prima, poi articoli, link, video), poi per inserimento.
- Testo inline opzionale = citazione del contenuto, inserito manualmente. Disponibile offline.
- Rimozione fonte: immediata, no conferma (dato semplice).
- **Bibbia**: parsing automatico di "Genesi 12:1-3" → campi strutturati. Se il parsing fallisce: warning, permetti salvataggio come testo. URL WOL calcolata dal resolver.
- **Articolo WOL**: URL WOL con estrazione range paragrafi dal fragment `#h=`. Copre anche pubblicazioni (titolo+volume+pagine).
- **Link generico**: URL + etichetta.
- **Video**: mediaKey JW.org, sezione da/a in secondi, metadata cached. Vedi sezione "Annotazione Video".
- **Immagine**: allegato immagine (deferred).
- **Overlap detection** (post-MVP): warning, non blocca salvataggio. Per bibbia: stesso libro+capitolo, range versetti si intersecano.

---

## Dominio: Annotazioni (ex Riflessioni)

- **Annotazione = Elemento di tipo `"annotazione"`**. Entità first-class: per-utente, ricercabile, listabile, taggabile, nei board. (D027)
- La contextualità è espressa tramite link bidirezionali: annotazione → elemento, annotazione → fonte.
- Ogni utente può avere più annotazioni sullo stesso elemento (come post-it successivi).
- Mie annotazioni: sempre visibili, in primo piano. Altrui: dietro contatore cliccabile, solo lettura.
- Utente in sola lettura PUÒ creare annotazioni (il permesso "lettura" riguarda solo dati condivisi).
- Se nessuna annotazione collegata: la sezione non appare. Se l'utente non ha annotazioni: CTA discreto "+ Aggiungi annotazione".

---

## Dominio: Board

- Board = raccolta di elementi + vista di presentazione. Come una query salvata.
- Selezione: fissa (lista manuale ID) o dinamica (filtro per tag AND/OR, tipo OR, date range).
- 4 viste: lista (P1), timeline (P1), grafo (P2), genealogia (P2). Vista attiva salvata per board.
- CardConfig è per-board (non per-vista). Tutte le viste di un board condividono la stessa config card.
- Ricerca cross-view: cerca in titolo, tags, descrizione. Lista filtra righe; viste spaziali fanno dimming dei non corrispondenti.
- Eliminazione board: NON rimuove gli elementi dal workspace. Conferma esplicita.

---

## Dominio: Workspace + Auth

- DemoAuth per sviluppo, futuro PasskeyAuth.
- Creazione automatica workspace al primo login, nome "Il mio workspace".
- Dopo login si atterra nel 3-pane con vista Recenti (max 8 elementi recenti). Nessuna pagina Home separata.
- Badge sync: sincronizzato/in sincronizzazione/offline. Banner offline con messaggio informativo.
- Workspace vuoto: CTA "Crea il primo Elemento" nel list/detail pane del 3-pane.

---

## Dominio: Sharing e Permessi

- Permessi a livello workspace (non granulari per elemento/board).
- Ruoli: lettura e scrittura. Jazz groups gestiscono tutto.
- Enforcement: controlli di modifica **disabilitati** (non nascosti) per utenti lettura. Badge "Sola lettura" nell'header.
- Il workspace DEVE avere almeno un membro con scrittura.

---

## Dominio: Action Log

- Registrazione automatica: crea/modifica/elimina elemento, crea/elimina link, crea/elimina board.
- Ogni voce: timestamp + tipo + label target + autore. Riga singola compatta.
- Rollback = azione compensativa (non undo CRDT). Rollback del rollback è permesso.
- Rollback impossibile se target irrecuperabile → errore inline.

---

## Pattern: Layout

- **3-pane** (vista lista): sidebar stretta + list pane fisso + detail pane flex. Sidebar auto-hide alla selezione elemento.
- **Canvas** (viste spaziali): sidebar + canvas piena larghezza. Il list pane scompare.
- **Fullscreen**: overlay `fixed inset-0` con transizione `opacity + translate-y`. Header: indietro + titolo + minimizza.
- **Popup compatto** (viste spaziali): click su card/nodo → popup sovrapposto al canvas (non detail pane). "Apri dettaglio" → fullscreen.
- **Sidebar**: workspace switcher + nav items (Recenti, Tutti) + sezione Board con conteggi + footer (Impostazioni, chiudi).
- **Portrait tablet**: sidebar come overlay slide-in, list pane full width, detail push-navigation con freccia indietro.
- **Mobile**: fuori scope v1, messaggio che invita a usare tablet.
- **Canvas mode trigger**: board con `ultimaVista !== 'lista'` → list pane collassa (`w-0 min-w-0 overflow-hidden`), canvas occupa `flex-1`.
- **Stato attuale**: tutto il layout vive in WorkspacePreviewPage.tsx (monolite). M002 S01 lo decompone in componenti modulari preservando le feature visive.

---

## Pattern: Adapter

```
Jazz CoMap (mutable, CRDT) → Adapter → Domain model (immutable, puro) → React UI
```

- Domain DEVE essere testabile senza IO e senza Jazz runtime.
- Se un test ha bisogno di mockare Jazz, la logica dominio non è pura abbastanza — refactorare.
- Domain NON importa da adapter, schema, o UI. UI dipende da domain.

---

## Pattern: HeroUI

- Usare HeroUI per componenti interattivi (Button, Input, Modal, Dropdown, etc.)
- NON usare HeroUI per layout (sidebar, 3-pane, grid) → div + Tailwind
- Varianti: `flat`/`light` per secondarie, `solid` per CTA, `bordered` per input
- Size: `sm` default, `md` per enfasi, mai `lg`
- Tema integrato con token CSS + Tailwind
- **HeroUI v3 Input è un primitivo RAC** — non accetta `onValueChange`, `isInvalid`, `errorMessage`, `classNames` come props diretti. Per form fields usare composizione: `<TextField value={v} onChange={fn} isInvalid={bool}> <Label/> <Input/> <FieldError/> </TextField>`.
- `Textarea` stessa regola: wrappare in `TextField` per label/validation.
- Se servono `Select` con label/errori, wrappare in RAC `Select` composite (non ancora verificato in v3).

---

## Pattern: Density & Spacing

Scala Tailwind standard (1=4px, 2=8px, 3=12px, 4=16px). Interfaccia compatta stile Notion/Linear — info utile visibile senza scroll su iPad landscape (1024×768).

- **Sezioni**: `gap-4` standard tra blocchi principali.
- **Liste**: `gap-1` / `gap-2` tra item adiacenti.
- **Detail pane**: padding `p-4`.
- **List items**: padding `px-3 py-2`.
- **Sidebar items**: padding `px-2 py-1.5` (più compatti perché chrome).
- **Touch target**: ≥44×44px, gap ≥8px tra target adiacenti. Per elementi custom, usare padding adeguato.
- **Regola negativa**: header su una sola riga con titolo+azioni, mai hero banner multi-riga. Pannelli vuoti nascosti o ridotti a una riga, mai placeholder illustrati.

---

## Pattern: Animation

- **Durate**: 150ms per micro-interazioni (hover, press, toggle); 250-300ms per transizioni layout (overlay, panel switch, fullscreen).
- **Easing**: `ease-out` per entrate, `ease-in` per uscite. Curve custom solo se giustificate.
- **Proprietà animate**: SOLO `opacity` e `transform`. MAI `width`, `height`, `top`, `left` (forzano reflow).
- **prefers-reduced-motion**: tutto disabilitato con `@media (prefers-reduced-motion: reduce)`.
- **Fullscreen entry/exit**: overlay `fixed inset-0` con `opacity` + `translate-y` combinati, non scale.
- **Feedback tap**: risposta visiva entro 100ms dal tap (non una animazione, un cambio di stato immediato).

---

## Pattern: Vite Dev Server

- **Tailwind via PostCSS, MAI via Vite plugin** (D027): usare `@tailwindcss/postcss` in `postcss.config.mjs`. NON usare `@tailwindcss/vite` come plugin — causa loop infinito di reload del dev server. Questa configurazione NON va cambiata per nessun motivo.
- Se si aggiungono altre dipendenze CJS o con molti sub-import, aggiungerle a `optimizeDeps.include`.

---

## Pattern: React Auth + Navigation

- Se `login()` (useState setter) e `navigate()` sono nello stesso event handler, usare `flushSync(() => login(nome))` prima del navigate. Senza flushSync, React 18+ batching ritarda il commit dello state, e il guard (RequireAuth) valuta lo stato vecchio → redirect a /auth.

---

## Pattern: Jazz

- **Jazz Docs First**: prima di implementare data model o auth flow, consultare jazz.tools/docs. Jazz è giovane con training data limitati.
- `co.image()` per media (progressive loading). `co.fileStream()` solo per non-image binaries.
- Schema evolution: `co.account(...).withMigration(...)`, additive-first, campi nuovi opzionali.
- Permessi: Jazz `Group` objects con ruoli read/write ereditati dai CoValues.

---

## Pattern: WOL Link Resolver

Input: `ScriptureReference { bookNumber, chapter, verseStart, verseEnd?, originalLabel }`.
Output: `WolLink { href, label, target: "wol", granularity: "chapter" }`.
URL: `https://wol.jw.org/it/wol/binav/r6/lp-i/nwtsty/{bookNumber}/{chapter}`.
Deterministico e puro. Input invalidi → errore di dominio tipizzato.

---

## Dominio: Annotazione Video

- **Annotazione** è un `TipoElemento` ("annotazione") — entità first-class, appare in liste, board, ricerca come qualsiasi altro elemento.
- Campi specifici: nessun campo tipo-specifico oltre alla fonte video.
- **La fonte video** è una Fonte (non un campo dell'elemento): FonteTipo "video" con `mediaKey` (naturalKey JW), `sezione: { da, a }` in secondi, metadata cached (titoloOriginale, durataSecondi, thumbnail, qualità).
- **Link bidirezionali** collegano annotazione → elementi correlati (es. annotazione → Abraamo, annotazione → Isacco). Standard, nessun tipo link nuovo.
- **JW Mediator API**: `GET b.jw-cdn.org/apis/mediator/v1/media-items/I/{naturalKey}?clientType=www`. Risponde con: titolo, durata, MP4 URLs (240p-720p), VTT sottotitoli, thumbnail.
- **Playback**: HTML5 `<video>` con MP4 diretto + fragment `#t=start,end`. Popup/modal nel detail pane.
- **Offline**: v1 solo online. v2 download full video a qualità scelta (240p default). No partial caching.
- **Flusso creazione**: incolla URL video → riconosci naturalKey → chiama Mediator API → mostra preview con slider sezione da/a → salva.
- **Pattern URL JW.org**: `https://www.jw.org/it/biblioteca-digitale/video/#it/mediaitems/{category}/{naturalKey}` → estrai `naturalKey` (es. `pub-jwbvod26_1_VIDEO`).
- **Scope v1**: solo FonteTipo "video". Articoli (sezione paragrafi da-a) e immagini in iterazioni successive.

---

## Pattern: Legend State in React Components

- **API**: usare `useSelector()` da `@legendapp/state/react` per leggere singoli campi. `use$()` NON esiste in Legend State v2.1.15. NON usare `observer()` HOC.
- **Store pattern**: modulo-level singleton con `observable<T>({...})` da `@legendapp/state`. Azioni come funzioni named export (non metodi sullo store).
- **Scrittura**: `workspaceUi$.fieldName.set(value)` — chiamata diretta sull'observable, anche dentro event handler dei componenti.
- **Esempio lettura**: `const currentView = useSelector(workspaceUi$.currentView);` — sottoscrive solo a quel campo, re-render solo quando cambia.
- **Static data**: se i dati mock sono statici, computare derivati a livello modulo (`const BOARD_ITEMS = getBoardDisplayItems();`) invece che dentro il componente.

---

## Pattern: Monolith Decomposition (3-pane)

- Decomporre il monolite in: NavSidebar, ListPane, DetailPane, FullscreenOverlay + thin composition shell (WorkspacePreviewPage).
- Shared sub-components (DetailBody, ActionToolbar) esportati da DetailPane.tsx per riuso in FullscreenOverlay.
- Display helpers (`display-helpers.ts`) bridgano domain types → UI display shapes. Pure functions, nessun import React.
- Il composition shell è ~24 righe: solo import + layout div con 5 componenti figli.

---

## Pattern: UI/UX Review Gate (Human-in-the-Loop)

Ogni componente UI nuovo o modifica visiva significativa richiede approvazione umana prima di considerarsi "done".

### Modalità interattiva (chat diretta)

1. **Skill obbligatoria**: caricare `ui-ux-pro-max` SKILL.md prima di scrivere codice UI.
2. **Implementa** il componente/pagina.
3. **Avvia dev server** e **mostra nel browser**: navigare alla pagina, fare screenshot con `browser_screenshot`.
4. **Chiedi approvazione** via `ask_user_questions`:
   - Opzione 1: "✅ Approva così com'è"
   - Opzione 2: "🔄 Migliora (indicazioni)"
   - Opzione 3: (free-form "None of the above" aggiunto automaticamente — per varianti o cambio totale)
5. Se l'utente chiede miglioramenti: applicare le indicazioni, ri-mostrare, ri-chiedere. Loop fino ad approvazione.
6. Se l'utente chiede varianti: generare 2-3 varianti (con screenshot di ciascuna), chiedere quale preferisce.
7. La UI NON è "done" fino all'approvazione esplicita.

### Auto-mode: Mockup-First (nessun umano nel loop)

Auto-mode usa un workflow **mockup-first**: prima il look, poi il wiring. Ogni task UI si divide in due fasi:

**Fase 1 — Mockup (task dedicato, veloce)**

1. **Skill obbligatoria**: caricare `ui-ux-pro-max` SKILL.md.
2. Creare un componente `.tsx` reale in `src/ui/mockups/` con:
   - Componenti HeroUI reali (Button, Input, Select, etc.)
   - Token del design system (`text-ink-hi`, `bg-panel`, `font-heading`, etc.)
   - Tailwind del progetto (stessi spacing, sizing, colori)
   - **Dati hardcoded** — nessun import da store, adapter, domain, o mock/data.ts
   - Props inline, nessun wiring, nessuna validazione
3. Montare il mockup in una route dev temporanea: aggiungere a `src/app/routes.tsx` una route `/dev/mockup-<nome>` che renderizza il componente.
4. **Avviare dev server**, navigare alla route, fare screenshot con `browser_screenshot`.
5. Nel task summary:
   - Includere la route del mockup (es. `http://localhost:5173/dev/mockup-editor`)
   - Segnare come "⏳ UI/UX mockup in attesa di review umana"
   - Non fare wiring — il mockup è il deliverable del task
6. L'utente revisiona tra i task con `/gsd steer`:
   - **Approva**: il task successivo wira la logica reale dentro il componente approvato
   - **Corregge**: le indicazioni vengono applicate in un micro-task prima del wiring
   - **Rifiuta e chiede varianti**: l'agente genera 2-3 varianti come mockup separati

**Fase 2 — Wiring (task successivo)**

1. Spostare il componente da `src/ui/mockups/` alla posizione definitiva (es. `src/ui/workspace-home/`)
2. Sostituire dati hardcoded con props/store/adapter reali
3. Aggiungere validazione, event handler, state management
4. Rimuovere la route dev `/dev/mockup-*`
5. Il look visivo NON DEVE cambiare — il wiring è trasparente all'utente

**Regole mockup:**

- Il mockup DEVE usare gli stessi componenti HeroUI e token Tailwind del prodotto finale — niente CDN, niente HTML puro, niente stili diversi.
- I dati hardcoded DEVONO essere realistici (nomi italiani del dominio, date storiche vere, etc.) — non "Lorem ipsum" o "Test".
- La directory `src/ui/mockups/` è temporanea — i file vengono spostati al wiring e la directory resta vuota.
- Le route `/dev/mockup-*` vanno rimosse dopo il wiring. In produzione non devono esistere.
- Per aggiungere una route mockup: importare il componente da `@/ui/mockups/` e aggiungere `{ path: "/dev/mockup-<nome>", element: <Componente /> }` in `src/app/router.tsx` prima della catch-all `*`. Le route dev NON richiedono `RequireAuth`.

---

## Verifiche pendenti

- [ ] Jazz BinaryCoStream: verificare supporto blob per immagini offline
- [ ] Jazz schema migration: verificare come Jazz gestisce migrazione schema CRDT
