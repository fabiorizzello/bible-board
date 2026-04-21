---
status: brainstorm-in-progress
created: 2026-04-17
phase: 03-fonti-link-editor
skill_in_use: superpowers:brainstorming
next_step: scrivere design doc definitivo + invocare writing-plans skill
---

# Handoff — Brainstorm Catalogo Fonti

Contesto per riprendere questa sessione di brainstorming in una nuova conversazione.

## Situazione di partenza

L'utente ha sollevato un problema di design sulle fonti del progetto Timeline Board:

> "dobbiamo indagare l'implementazione delle fonti. problemi attuali: non abbiamo un catalogo delle fonti. sono prese da wol.jw.org, articoli online con link che indirizzano a tutto l'articolo oppure a paragrafi specifici. tuttavia deve essere una selezione intelligente, come potremmo fare?"

Il brainstorming è in corso usando la skill `superpowers:brainstorming`. Il design è stato presentato in 6 sezioni e l'utente NON ha ancora dato l'OK finale — manca solo la conferma dell'intero design per procedere a scrivere il design doc definitivo e invocare `writing-plans`.

## Stato del codice vs stato pianificato

**Codice attuale** (`src/features/elemento/`):
- `FonteTipo = "scrittura" | "articolo" | "altro"` (solo 3 varianti, divergente dal plan)
- `Fonte` flat: `{ tipo, valore, urlCalcolata? }`
- `fonti: co.list(FonteSchema)` **embedded** in `ElementoSchema`
- Esiste già `wol-link-resolver.ts` per parsing riferimenti biblici → URL WOL

**Piano originale** in `.planning/DATA-MODEL.md` e `.planning/KNOWLEDGE.md`:
- `FonteTipo = "bibbia" | "articolo-wol" | "link" | "video" | "immagine"`
- Campi variant-specific per tipo
- KNOWLEDGE.md §Fonti dice: _"Le fonti sono entità **condivise** (tutti vedono le stesse fonti). Le annotazioni sulle fonti sono per-utente (elementi di tipo annotazione collegati via link)"_
- Principio fonte-first: "Da dove viene?" in <2s

**Gap principale**: il codice NON implementa fonti condivise — sono embedded per Elemento, duplicate. Il brainstorm corregge questo.

## Requisiti raccolti (Q&A con l'utente)

| # | Domanda | Risposta utente | Implicazione design |
|---|---------|-----------------|---------------------|
| 1 | Modello concettuale: Fonte = documento + citazione, o Fonte = citazione puntuale? | "sono 2 fonti diverse ma comunque che il sistema capisce che sono accomunate" | Fonti flat, parentela derivata via chiave calcolata |
| 2 | A cosa serve capire la parentela? | #2 raggruppamento gerarchico nel catalogo + #3 navigazione trasversale inversa (da docBase → Elementi citanti). NO #1 autocomplete | No autocomplete in v1; catalogo deve essere gerarchico; serve reverse-lookup |
| 3 | Quanti livelli di gerarchia per tipo? | Bibbia: **b** (Libro→Capitolo→versetti); WOL: **b** (Pubblicazione→Articolo→paragrafi); Link: **a** (flat) | `docBaseKey` per tipo |
| 4 | Persistere il contenuto della fonte o solo metadati? | "non farei persist della fonte, basta collegarsi al web... l'unica cosa che salverei sono i metadati" | No campo `testo` inline; consumo via embed `<iframe>` o link esterno |
| 5 | Dove vivono i metadati: embedded o globali? | "salvato globale non su elemento" | Catalogo globale a livello Workspace; Elementi referenziano per ref. Coerente con KNOWLEDGE.md. |
| 6 | Rimuovere `testo` inline? | Sì, rimuovere | Campo eliminato dallo schema |
| 7 | Articolo WOL: input manuale o resolver automatico? | "input manuale, che poi fa scraping per capire di che stiamo parlando (pubblicazione, articolo, paragrafi)" | Scraping wol.jw.org + fallback form manuale se CORS blocca |
| 8 | Fonti orfane (senza ref da Elementi)? | "resta" | Restano nel catalogo come biblioteca riusabile |

## Design proposto (6 sezioni, tutte già presentate all'utente)

### Sezione 1-bis — Modello dati

```ts
// Schema Jazz
Workspace = co.map({
  ...existing,
  fonti: co.list(FonteSchema),   // catalogo globale deduplicato
});

Elemento = co.map({
  ...existing,
  fonti: co.list(co.ref(Fonte)), // ref al catalogo, non embed
});

// Discriminated union (z.discriminatedUnion("tipo", [...]))
type Fonte =
  | FonteBibbia
  | FonteArticoloWol
  | FonteLink
  | FonteVideo
  | FonteImmagine; // deferred v2

interface FonteBibbia {
  tipo: "bibbia";
  libro: string;                 // "Genesi"
  capitolo: number;              // 12
  versettoDa: number;            // 1
  versettoA?: number;            // 3 (assente = singolo versetto)
  urlCalcolata: string;
}

interface FonteArticoloWol {
  tipo: "articolo-wol";
  pubblicazione: string;         // "La Torre di Guardia 2014/6/1"
  titoloArticolo: string;        // "La fede di Abraamo"
  paragrafoDa?: number;
  paragrafoA?: number;
  urlBase: string;               // URL senza fragment #h=
  urlCalcolata: string;          // urlBase + eventuale #h=X-Y
}

interface FonteLink {
  tipo: "link";
  url: string;
  etichetta: string;
}

interface FonteVideo {
  tipo: "video";
  mediaKey: string;
  titolo: string;                // cached Mediator API
  durataSecondi: number;
  thumbnailUrl?: string;
  sezioneDa: number;             // secondi
  sezioneA: number;
}
```

### Sezione 2 — Resolver metadati per tipo

- **Bibbia**: deterministico, riusa `wol-link-resolver.ts` esistente
- **Articolo WOL**: parsing URL locale (urlBase + fragment paragrafi) → scraping HTML remoto per titolo/pubblicazione → **fallback form manuale** se CORS/offline/parse fallisce
- **Video JW**: Mediator API (già pianificato in US-18)
- **Link**: solo input manuale (URL + etichetta)

**⚠ Rischio tecnico aperto**: verificare se `wol.jw.org` espone header CORS permissivi per fetch da browser. Se no, lo scraping è impossibile e il fallback manuale diventa default. Da testare.

### Sezione 3 — Lifecycle

```
AGGIUNTA FONTE a Elemento:
  input normalizzato → fonteIdentityKey(input) → workspace.fonti.find(matching)
  → esiste: push ref esistente
  → non esiste: create in workspace.fonti, push ref

MODIFICA FONTE (dal catalogo):
  edit metadati → propaga globalmente a tutti gli Elementi referenzianti
  (nessuna copia locale)

RIMOZIONE da Elemento:
  elemento.fonti.splice(ref). Fonte resta nel catalogo (biblioteca).
  No conferma, no cascading.

RIMOZIONE dal catalogo:
  no ref: rimozione immediata
  ref presenti: conferma con lista Elementi → cascata rimuovi ref

RACE CRDT su upsert (due utenti aggiungono stessa fonte contemporaneamente):
  mitigazione lazy: GC periodico fonde duplicati per identityKey.
  Accettabile — artefatto dura pochi secondi.
```

**Funzioni pure chiave**:

```ts
// features/fonte/fonte.rules.ts
function fonteIdentityKey(input: FonteInput): string {
  // dedup globale
  switch (input.tipo) {
    case "bibbia": return `bibbia:${libro.toLowerCase()}:${cap}:${da}${a ? `-${a}` : ""}`;
    case "articolo-wol": return `wol:${urlCalcolata}`;
    case "link": return `link:${url}`;
    case "video": return `video:${mediaKey}:${sezioneDa}-${sezioneA}`;
  }
}

function docBaseKey(fonte: Fonte): string {
  // raggruppamento visivo nel catalogo (derivato, non persistito)
  switch (fonte.tipo) {
    case "bibbia": return `bibbia:${libro}:${capitolo}`;
    case "articolo-wol": return `wol:${urlBase}`;
    case "link": return `link:${url}`;
    case "video": return `video:${mediaKey}`;
  }
}
```

### Sezione 4 — UI catalogo (solo architettura)

**Dettagli visivi devono passare per `mockup-first` skill** (obbligatorio da CLAUDE.md per ogni UI nuova).

Scheletro:
- Route `/workspace/:id/fonti` — pagina dedicata top-level, voce in nav principale
- Layout iPad landscape (1180×820): 2 colonne
  - sinistra: albero gerarchico per `docBaseKey`
  - destra: dettaglio Fonte + elenco Elementi referenzianti (navigazione #3)
- Consumo fonte: pulsante "apri" → prima `<iframe>` embed in modal; fallback "nuova tab" se X-Frame-Options blocca
- Inserimento da Elemento editor: drawer laterale con tabs "da catalogo" | "nuova"
- Stack: HeroUI + Tailwind + lucide-react (principio III)

### Sezione 5 — Migrazione

Fonte diventa **bounded context separato** → nuovo `src/features/fonte/` con model/rules/errors/schema/adapter. Non più property di elemento.

Passi:
1. Crea `src/features/fonte/` (model, rules, errors, schema, adapter)
2. `Workspace.fonti: co.list(FonteSchema)` con `z.discriminatedUnion("tipo", [...])`
3. `Elemento.fonti: co.list(co.ref(Fonte))` — embed → ref
4. Nuovo `parseWolArticleUrl` (puro) + `fetchWolArticleMetadata` (async, adapter)
5. Test dominio: identityKey, docBaseKey, parser URL WOL, upsert logic
6. UI: mockup-first per catalogo e drawer selezione

v1 pre-production: nessun dato reale, ok rompere schema senza migration dati.

### Sezione 6 — Decisioni da registrare in `.planning/DECISIONS.md`

- Fonte = entità condivisa Workspace-level, dedup per `fonteIdentityKey`
- Fonte = citazione puntuale (non documento); parentela via `docBaseKey` derivato
- `FonteTipo` finale: 5 varianti (bibbia, articolo-wol, link, video, immagine)
- `testo` inline rimosso
- Articolo WOL: URL input + scraping auto + fallback form manuale
- Fonti orfane: restano nel catalogo
- Race CRDT upsert: mitigato via GC lazy

## Prossimi passi (nell'ordine)

1. **Conferma finale utente** sul design complessivo (al momento l'utente NON ha ancora dato OK esplicito all'intera proposta; sta chiedendo solo questo handoff)
2. **Scrivere design doc definitivo** in `docs/plans/2026-04-17-fonti-catalogo-design.md` (path suggerito da brainstorming skill) — oppure in `.planning/phases/03-fonti-link-editor/DESIGN.md` per allinearsi al GSD workflow del progetto
3. **Git commit** del design doc
4. **Invocare `superpowers:writing-plans`** per produrre plan di implementazione dettagliato
5. **Implementazione UI passerà per `mockup-first`** (mockup in `src/ui/mockups/`, approvazione umana, poi wiring con Jazz reale)

## Istruzioni per riprendere la sessione

In una nuova conversazione, se l'utente chiede di riprendere:

1. Invoca `superpowers:using-superpowers` (come sempre a inizio conversazione)
2. Leggi questo file + `.planning/KNOWLEDGE.md` §Dominio: Fonti + `.planning/DATA-MODEL.md` §Value Object: Fonte + `.planning/phases/03-fonti-link-editor/03-01-PLAN.md`
3. Invoca `superpowers:brainstorming` per rientrare nel flow
4. Chiedi all'utente: "vuoi confermare il design complessivo come riportato in `BRAINSTORM-HANDOFF.md` o rivedere qualche sezione?"
5. Se OK → procedi con i prossimi passi elencati sopra
6. Se rivedere → usa Q&A puntuali sulle sezioni contestate

## File rilevanti nel repo

- `src/features/elemento/elemento.rules.ts` — attuale `FonteTipo`, `validateFonte`, `normalizeFonti` (da migrare)
- `src/features/elemento/elemento.schema.ts` — `FonteSchema` Jazz embedded (da migrare)
- `src/features/elemento/elemento.adapter.ts` — adapter attuale
- `src/features/elemento/wol-link-resolver.ts` — parser biblico, da riusare
- `src/features/shared/value-objects.ts` — dove aggiungere eventuali value objects Fonte
- `.planning/DATA-MODEL.md` §Value Object: Fonte — specifica target (già allineata)
- `.planning/KNOWLEDGE.md` §Dominio: Fonti — principio fonte-first, fonti condivise
- `.planning/DECISIONS.md` — dove aggiungere le 6 decisioni sopra
- `.planning/USER-SCENARIOS.md` US-06 — acceptance scenarios già scritti
