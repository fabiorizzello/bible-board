# Knowledge Base

> Regole di dominio, pattern, e lezioni apprese.
> Append-only — consultare all'inizio di ogni unità di lavoro.

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

- **Annotazione = Elemento di tipo `"annotazione"`**. Entità first-class: per-utente, ricercabile, listabile, taggabile, nei board. (D021)
- La contextualità è espressa tramite link bidirezionali: annotazione → elemento, annotazione → fonte.
- Ogni utente può avere più annotazioni sullo stesso elemento (come post-it successivi).
- Mie annotazioni: sempre visibili, in primo piano. Altrui: dietro contatore cliccabile, solo lettura.
- Utente in sola lettura PUÒ creare annotazioni (il permesso "lettura" riguarda solo dati condivisi).
- Se nessuna annotazione collegata: la sezione non appare. Se l'utente non ha annotazioni: CTA discreto "+ Aggiungi annotazione".

---

## Dominio: Board

- Board = raccolta di elementi + vista di presentazione. Come una query salvata (D012).
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

## Dominio: Annotazione Video

- **Annotazione** è un `TipoElemento` ("annotazione") — entità first-class, appare in liste, board, ricerca come qualsiasi altro elemento.
- **La fonte video** è una Fonte: FonteTipo "video" con `mediaKey` (naturalKey JW), `sezione: { da, a }` in secondi, metadata cached (titoloOriginale, durataSecondi, thumbnail, qualità).
- **Link bidirezionali** collegano annotazione → elementi correlati. Standard, nessun tipo link nuovo.
- **JW Mediator API**: `GET b.jw-cdn.org/apis/mediator/v1/media-items/I/{naturalKey}?clientType=www`. Risponde con: titolo, durata, MP4 URLs (240p-720p), VTT sottotitoli, thumbnail.
- **Playback**: HTML5 `<video>` con MP4 diretto + fragment `#t=start,end`. Popup/modal nel detail pane.
- **Offline**: v1 solo online. v2 download full video a qualità scelta (240p default).
- **Pattern URL JW.org**: `https://www.jw.org/it/biblioteca-digitale/video/#it/mediaitems/{category}/{naturalKey}` → estrai `naturalKey` (es. `pub-jwbvod26_1_VIDEO`).
- **Scope v1**: solo FonteTipo "video". Articoli e immagini in iterazioni successive.

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

---

## Pattern: Adapter

```
Jazz CoMap (mutable, CRDT) → Adapter → Domain model (immutable, puro) → React UI
```

- Domain DEVE essere testabile senza IO e senza Jazz runtime.
- Se un test ha bisogno di mockare Jazz, la logica dominio non è pura abbastanza — refactorare.
- Domain NON importa da adapter, schema, o UI. UI dipende da domain.

---

## Pattern: HeroUI v3

- Usare HeroUI per componenti interattivi (Button, Input, Modal, Dropdown, etc.)
- NON usare HeroUI per layout (sidebar, 3-pane, grid) → div + Tailwind
- Varianti: `flat`/`light` per secondarie, `solid` per CTA, `bordered` per input
- Size: `sm` default, `md` per enfasi, mai `lg`
- **HeroUI v3 Input è un primitivo RAC** — non accetta `onValueChange`, `isInvalid`, `errorMessage`, `classNames` come props diretti. Per form fields usare composizione: `<TextField value={v} onChange={fn} isInvalid={bool}> <Label/> <Input/> <FieldError/> </TextField>`.
- `Textarea` stessa regola: wrappare in `TextField` per label/validation.
- Select composite: `Select.Trigger > Select.Value`, `Select.Popover > ListBox > ListBox.Item` (non API v2).

---

## Pattern: Density & Spacing

Scala Tailwind standard (1=4px, 2=8px, 3=12px, 4=16px). Interfaccia compatta stile Notion/Linear.

- **Sezioni**: `gap-4` standard tra blocchi principali.
- **Liste**: `gap-1` / `gap-2` tra item adiacenti.
- **Detail pane**: padding `p-4`.
- **List items**: padding `px-3 py-2`.
- **Sidebar items**: padding `px-2 py-1.5`.
- **Touch target**: ≥44×44px, gap ≥8px tra target adiacenti.
- **Regola negativa**: header su una sola riga con titolo+azioni, mai hero banner multi-riga. Pannelli vuoti nascosti o ridotti a una riga, mai placeholder illustrati.

---

## Pattern: Animation

- **Durate**: 150ms per micro-interazioni; 250-300ms per transizioni layout.
- **Easing**: `ease-out` per entrate, `ease-in` per uscite.
- **Proprietà animate**: SOLO `opacity` e `transform`. MAI `width`, `height`, `top`, `left`.
- **prefers-reduced-motion**: tutto disabilitato con `@media (prefers-reduced-motion: reduce)`.
- **Feedback tap**: risposta visiva entro 100ms dal tap.

---

## Pattern: Vite Dev Server

- **Tailwind via PostCSS, MAI via Vite plugin** (D027): usare `@tailwindcss/postcss` in `postcss.config.mjs`. NON usare `@tailwindcss/vite` — causa loop infinito di reload. Non cambiare mai questa configurazione.
- Se si aggiungono altre dipendenze CJS o con molti sub-import, aggiungerle a `optimizeDeps.include`.

---

## Pattern: React Auth + Navigation

- Se `login()` e `navigate()` sono nello stesso event handler, usare `flushSync(() => login(nome))` prima del navigate. Senza flushSync, React 18+ batching ritarda il commit, e il guard (RequireAuth) valuta lo stato vecchio → redirect a /auth.

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

## Pattern: Legend State in React Components

- **API**: usare `useSelector()` da `@legendapp/state/react`. `use$()` NON esiste in v2.1.15. NON usare `observer()` HOC. (D031)
- **Store pattern**: modulo-level singleton con `observable<T>({...})` da `@legendapp/state`. Azioni come funzioni named export.
- **Scrittura**: `workspaceUi$.fieldName.set(value)` — chiamata diretta sull'observable.
- **Esempio lettura**: `const currentView = useSelector(workspaceUi$.currentView);`
- **Static data**: se i dati mock sono statici, computare derivati a livello modulo invece che dentro il componente.

---

## Pattern: Monolith Decomposition (3-pane)

- Decomporre il monolite in: NavSidebar, ListPane, DetailPane, FullscreenOverlay + thin composition shell (WorkspacePreviewPage).
- Shared sub-components (DetailBody, ActionToolbar) esportati da DetailPane.tsx per riuso in FullscreenOverlay.
- Display helpers (`display-helpers.ts`) bridgano domain types → UI display shapes. Pure functions, nessun import React.
- Il composition shell è ~24 righe: solo import + layout div con 5 componenti figli.

---

## Pattern: Contratto visivo approvato — Unified Editor Mockup (R005 / S02)

Quando il riferimento è `src/ui/mockups/UnifiedEditorMockup.tsx`, le aspettative visive minime sono:

- header integrato con titolo inline-editable, badge review/warning e menu azioni; niente toolbar separata
- prima fascia operativa composta da metadata chips, non da form stacked save/cancel
- `tipo` via popover, `vita` e flow complessi via right drawer, edit semplici via popover o inline field
- body ordinato come `descrizione` full-width prima, poi sezioni array leggere con chip rimovibili e add localized
- `+ Aggiungi campo` globale coerente col body
- validazione soft e passiva: warning inline + badge header + review drawer; niente modal bloccanti
- touch target primari almeno 44px

---

## Pattern: ElementoEditor — note implementative

- HeroUI Select composite API v3: `Select.Trigger > Select.Value`, `Select.Popover > ListBox > ListBox.Item` (non API v2)
- Type-specific editor field groups estratti come subcomponenti React separati per leggibilità
- Sezione Annotazioni posizionata tra Fonti e Board, rispettando la gerarchia informativa del dominio
- Toast placement: `"bottom"` — HeroUI v3 `ToastVariants` accetta solo `bottom/bottom-end/bottom-start/top`
- `handleSoftDelete` esportato da DetailPane così DetailPane e FullscreenOverlay condividono la stessa logica toast
- `softDeleteElement`: esce da fullscreen + edit mode; `restoreElement`: ri-seleziona l'id così undo torna sull'elemento
- `tipo_specifico_non_ammesso` sostituisce `data_non_valida` per nascita/morte su non-personaggio — semantica più precisa
- `INVALID_DATA` come unique symbol (non null, non throw) così `parseDataStorica` ritorna `DataStorica | undefined | typeof INVALID_DATA`
- ElementoEditor rimane in un singolo file con sub-componenti locali — no split in file separati
- Inline edits patchano la session state (Legend State overrides); `src/mock/data.ts` rimane immutabile
- DetailPane e FullscreenOverlay condividono lo stesso unified editor shell
- Toolbar standalone rimossa — azioni distruttive/secondarie redistribuite nel menu header unificato
- Navigazione fullscreen mantenuta fuori dal content shell così pane e fullscreen condividono la stessa gerarchia editor

---

## Verifiche pendenti

- [ ] Jazz BinaryCoStream: verificare supporto blob per immagini offline
- [ ] Jazz schema migration: verificare gestione migrazione schema CRDT
