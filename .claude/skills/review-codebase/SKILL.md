---
name: review-codebase
description: >
  Esegue una review architetturale del codebase su DDD vertical slices, neverthrow,
  Jazz boundary, DRY/SOLID pragmatico, e qualita test.
  Produce findings ordinati per severita. Usato sia come review standalone
  che come verifica post-fix da review-findings-fixer.
user_invocable: true
---

# Review Codebase

Review architetturale del progetto Timeline Board App.

## Modalita di utilizzo

Questo skill puo essere invocato in due modi:

**A) Review completa** — analisi dell'intero codebase o di zone non ancora esplorate.
**B) Review mirata post-fix** — analisi del solo codice modificato da un fixing, per verificare che il fix sia corretto e non abbia introdotto nuovi problemi. In questo caso l'utente o il fixer specifica i file toccati.

---

## Preparazione

1. Leggi `docs/review/review-notes.md` (se esiste) per conoscere i findings gia trattati — non ripetere cio che e gia risolto.
2. Verifica i findings aperti: se un finding non e piu valido (codice cambiato, problema risolto incidentalmente), rimuovilo e spostalo in "Findings risolti" con nota.
3. **Solo per review completa**: identifica le zone "oscure" del codebase — feature o file poco esplorati, moduli senza test, aree mai reviewate. Dai priorita a queste zone.
4. **Solo per review post-fix**: concentrati esclusivamente sui file modificati e sui loro caller/dipendenti diretti. Non espandere l'analisi ad aree non toccate.

---

## Criteri di valutazione

### Architettura DDD — Vertical Slices

- **Struttura**: `features/<domain>/` contiene model, rules, errors, schema, adapter. `ui/<page>/` contiene componenti e hooks.
- **Purezza domain**: model e rules non importano da Jazz, React, o infrastruttura. Operano su plain TS interfaces.
- **Adapter boundary**: `.schema.ts` e `.adapter.ts` sono l'unico punto di contatto con Jazz. Nessuna logica di business negli adapter.
- **Direzione dipendenze**: domain <- UI (mai il contrario). domain <- adapter (mai il contrario).
- **Shared**: `features/shared/` contiene solo primitivi (newtypes, value objects, result helpers). Nessuna logica di dominio specifica.

### Modello funzionale — neverthrow

- `Result<T, E>` usato per tutte le operazioni di dominio che possono fallire.
- Nessun `throw` in features/ per control flow. `throw` ammesso solo per stati davvero impossibili (con commento).
- Nessun `try/catch` in domain o rules — i Result si propagano con `.andThen()`, `.map()`, `.match()`.
- UI consuma Result con `.match()` — nessun unwrap insicuro.
- Discriminated unions per errori (`ElementoError`, `BoardError`, `WorkspaceError`).

### Jazz CRDT Boundary

- Jazz e la single source of truth per persistenza e sync.
- Le CoMap/CoList vivono solo in `.schema.ts`.
- Gli adapter (`*.adapter.ts`) mappano Jazz <-> domain in modo puro.
- Nessun test unitario importa da `jazz-tools` o `jazz-react`.
- Auth e permessi gestiti solo tramite Jazz groups — nessun workaround custom.

### DRY / SOLID / YAGNI (pragmatici)

- **DRY**: una regola di business in un solo posto. Duplicazione = stesso concetto logico espresso due volte, non codice che si assomiglia.
  **Non segnalare**: boilerplate strutturale, setup test ripetitivo, varianti UI visivamente simili ma semanticamente diverse.
- **SOLID-S**: un file rules.ts > 150 righe potrebbe avere responsabilita miste. Valuta, non dogmatizzare.
- **SOLID-O**: discriminated unions per tipi extensibili (TipoElemento, TipoLink). If/else chains su tipi = finding.
- **SOLID-D**: UI dipende da domain, mai il contrario. Domain non importa da adapter/schema.
- **YAGNI**: codice o astrazioni non richieste dalla spec = finding low. Campi "per il futuro" = finding.

### Test

- **Coverage sulla logica pura**: rules e value objects devono avere test unitari.
- **Purezza test**: unit test importano solo da `features/`. Nessun Jazz, nessun React rendering.
- **Qualita dei test esistenti**: per ogni test valuta —
  - Testa un comportamento distinto o e ridondante?
  - Puo essere rafforzato (asserzione piu specifica)?
  - Da falsa sicurezza (passa sempre)?
- **Contract test**: route e WOL resolver devono avere test allineati ai contratti in `specs/`.

### Allineamento Spec

- Verifica che il codice implementi cio che la spec richiede — non di piu, non di meno.
- In caso di disallineamento: **segnala senza correggere**. Potrebbe essere un cambio voluto.

---

## Contesto produzione

- PWA statica offline-first, zero backend.
- Tablet-first (768-1024px), italiano-only.
- Jazz CRDTs per persistenza e sync. Collaborazione read/write su workspace condivisi.
- D3 per timeline/graph SVG. React per UI. HeroUI + Tailwind per componenti.
- Vitest per test. TypeScript strict.

---

## Output atteso

### Per review completa

Findings ordinati per severita (High -> Medium -> Low), ciascuno con:
- Titolo sintetico
- Descrizione del problema e causa strutturale
- Evidenze (file:riga)
- Severita e effort stimato (Low/Medium/High)

### Per review post-fix

Rispondi alle seguenti domande per il codice modificato:

1. **Il fix risolve effettivamente il problema documentato nel finding?** Si / No / Parzialmente — spiega.
2. **Il fix e consistente con i pattern architetturali del codebase?** Verifica DDD, neverthrow, Jazz boundary.
3. **Il fix ha introdotto nuovi problemi?** Elenca qualsiasi nuovo finding emerso dai file toccati.
4. **I test aggiornati/aggiunti sono sufficienti?** Valuta qualita e copertura.
5. **Ci sono caller o dipendenti non aggiornati?** Verifica coerenza.

#### Anti-pattern noti — cerca attivamente nei file toccati

**Invoca il skill `codebase-patterns`** per la tabella completa degli anti-pattern da cercare.
Ogni occorrenza e un finding bloccante se non giustificata.

Se il fix supera tutti i punti senza nuovi finding: **"Fix approvato."**
Se emergono problemi: elencali come finding con severita, e indica se bloccano il merge o sono separabili.

---

## Parallelizzazione

Se i task di analisi sono indipendenti (moduli diversi, file diversi), usa agenti paralleli per ridurre i tempi.
