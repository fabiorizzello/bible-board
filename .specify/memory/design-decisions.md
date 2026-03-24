# Design Decisions & Rationale

Decisioni di design emerse dalla fase di brainstorming.
Questo documento contiene soprattutto il **perche** dietro le scelte, utile per evitare di rivisitare decisioni gia prese.
Quando una decisione diventa una regola di prodotto o di dominio, la versione normativa va formalizzata nella spec o nella constitution; qui resta la motivazione.

## Technology Decision Rationale

### Jolly UI over shadcn/ui
shadcn/ui usa Radix UI che ha bug touch su tablet: Dialog pointer-events rotto, Select richiede double-tap su Android. Jolly UI offre lo stesso look (shadcn styling) ma usa React Aria sotto, che ha supporto touch nativo. **Motivo:** tablet-only target rende i bug touch bloccanti, non accettabili.

### neverthrow over Effect (ts-effect)
Effect e troppo pesante per questo progetto — e un intero runtime con fibers, scheduler, layers. neverthrow e leggero: solo Result<T,E> e ResultAsync, si integra con codice esistente senza lock-in. **Motivo:** il progetto ha bisogno di error handling tipizzato nel domain layer, non di un framework runtime.

### @tanstack/form + Legend State (separati)
@tanstack/form gestisce i form (field-level isolation, ogni form.Field e un subscriber indipendente). Legend State gestisce lo stato UI reattivo (liste, filtri, stato effimero). Non si sovrappongono. **Motivo:** evita re-render di tutto il form quando cambia un campo — critico su tablet con tastiera virtuale.

### D3 diretto su SVG via refs (no React SVG)
D3 manipola direttamente il DOM SVG tramite React refs. React non gestisce i nodi SVG della timeline/grafo. I callback D3->React (es. click su un nodo) sono throttled. **Motivo:** React e lento per SVG pesanti (centinaia di nodi). D3 gestisce il rendering, React gestisce il chrome UI attorno.

### React Compiler per auto-memoizzazione
React Compiler (build-time) sostituisce useMemo/useCallback manuali. Combinato con Legend State per liste reattive e @tanstack/virtual per virtualizzazione >50 elementi. **Motivo:** tablet di fascia media richiedono performance senza micro-ottimizzazioni manuali.

## Adapter Pattern: Jazz <-> Domain <-> React

Jazz CoMap (mutable, CRDT) -> Adapter -> Domain model (immutable, puro) -> React UI.
Il domain model e testabile senza IO. L'adapter converte tra il formato CRDT mutabile di Jazz e i value objects immutabili del dominio. **Motivo:** DDD richiede modelli puri; Jazz richiede mutabilita per CRDTs. L'adapter isola i due mondi.

## Decisioni di Design Specifiche

### Profezia con date multiple
Regola formalizzata nella spec: una profezia ha una data di pronunciamento ma puo avere piu adempimenti; si modella quindi come un Elemento per il pronunciamento e uno o piu Elementi separati collegati via link "adempimento". **Motivo:** evita date multiple per singolo Elemento — un Elemento ha al massimo una DataTemporale.

### Tag vs Gruppo
Regola formalizzata nella spec: "Tag" e un concetto data (vive sull'Elemento). Il gruppo visuale della timeline e solo un concetto di vista: tagGroups nella config timeline del Board raggruppano elementi per tag sull'asse orizzontale e non introducono una entita persistente dedicata. **Motivo:** un elemento puo avere piu tag ma nella timeline puoi raggruppare per un tag alla volta.

### Terminologia ere
Regola formalizzata nella spec: si usa **a.e.v.** (avanti era volgare) e **e.v.** (era volgare), NON a.C./d.C. Il campo era nel modello usa `"aev" | "ev"`.

### Minimap timeline
Rettangolare, posizionata in basso a sinistra, semi-trasparente. Mostra tempo sull'asse Y e gruppi sull'asse X. Serve per navigazione rapida su timeline lunghe.

### Sticky card + Range bar
Elementi con data range: range bar colorata per tutta la durata, card a altezza fissa (~80px) che "scorre" lungo la barra rimanendo nel viewport durante lo scroll. **Motivo:** se l'altezza fosse proporzionale alla durata, un regno di 400 anni occuperebbe troppo spazio.

### Scala timeline segmentata (piecewise)
La timeline supporta scala non-lineare: segmenti con densita variabile e tagli per periodi vuoti. Preset uniform/auto-adaptive per casi semplici, configurazione manuale per casi avanzati. **Motivo:** lo studio biblico copre migliaia di anni con densita molto variabile — i patriarchi (2000+ anni) vs il I secolo (100 anni densissimi).

### Media: cosa si salva offline e cosa no
Regola formalizzata nella spec:
- **Immagini**: salvate offline come blob (Jazz BinaryCoStream da verificare)
- **Scritture bibliche**: solo il riferimento (es. "Genesi 12:1-3"), il link a wol.jw.org e calcolato dal sistema
- **Articoli**: solo l'URL a wol.jw.org, non salvato offline
- **Video**: non supportati per ora

### Board come "query salvata"
Il Board e come una query salvata in un database — la selezione (fissa/dinamica) definisce QUALI elementi, la vista (timeline/lista/grafo/genealogia) e solo COME li vedi. L'utente puo cambiare vista in qualsiasi momento. Le configViste sono persistite per ciascuna vista usata.

## Verifiche Pendenti (fase plan)

- [ ] **Jazz BinaryCoStream**: verificare che supporti blob per immagini offline
- [ ] **Jazz schema migration**: verificare come Jazz gestisce la migrazione degli schema CRDT
- [ ] **Jolly UI component coverage**: verificare che copra dialog, select, menu, tabs, combobox
- [ ] **wol.jw.org URL pattern**: capire il pattern URL per calcolare link da riferimenti biblici
