---
name: review-findings-fixer
description: >
  Guida la risoluzione sistematica dei findings da review-notes.md.
  Ogni finding viene lavorato in un worktree isolato, verificato con review-codebase post-fix,
  poi mergiato. Ordina per effort, parallelizza sugli indipendenti, gestisce ambiguita e spec.
user_invocable: true
---

# Review Findings Fixer

Processo sistematico per risolvere i findings aperti in `docs/review/review-notes.md`.

Ogni finding viene:
1. Analizzato prima di toccare codice
2. Lavorato in un **git worktree isolato**
3. Verificato con `review-codebase` post-fix prima di mergiare
4. Committato granularmente e il worktree pulito

---

## FASE 0 — Lettura e convalida finding

Prima di qualsiasi azione:

1. Leggi `docs/review/review-notes.md` nella sua interezza.
2. Leggi anche il **prompt sorgente della review** (sezione "Prompt sorgente") per capire i criteri con cui i finding furono generati — userai gli stessi criteri per convalidarli.
3. Per ogni finding aperto, **convalida che sia ancora attuale** leggendo il file e la riga citata nelle evidenze:
   - Il problema descritto e ancora presente nel codice?
   - E coerente con i criteri di review (DDD, neverthrow, Jazz boundary, DRY/SOLID, test quality)?
   - Se risolto incidentalmente: spostalo in "Findings risolti" con nota prima di procedere.
   - Se basato su un malinteso architetturale: segnalalo all'utente.
4. Elenca i findings **ancora validi** con:
   - ID / titolo
   - Severita (High / Medium / Low)
   - Stima effort (Low / Medium / High) — quanti file toccano, quanti caller, quanti test
   - Dipendenze da altri finding
5. Ordina per **effort crescente a parita di severita**.
6. Mostra la lista ordinata all'utente e attendi conferma prima di procedere.

### Criteri di invalidazione di un finding

Va rimosso/marcato risolto se:
- Il codice citato e stato riscritto e il pattern problematico non esiste piu.
- Il comportamento era intenzionale e documentato nella spec.
- Il contesto architetturale e cambiato (es. il file e stato eliminato).

Rimane aperto se:
- Il problema esiste ancora ma e in un ramo non ancora mergiato.
- Il fix e noto ma non ancora eseguito.

---

## FASE 1 — Analisi per finding

Per ogni finding, prima di scrivere codice:

### 1a. Causa radice
Rispondi: *perche questo problema esiste?* Non ripetere la descrizione — spiega la causa strutturale.

Esempi:
- "La funzione fu scritta prima che il pattern neverthrow fosse adottato nel codebase."
- "L'adapter contiene logica di business perche originariamente il rules.ts non esisteva."
- "Il throw fu usato come shortcut per uscire da una callback annidata."

### 1b. Soluzione da applicare
Descrivi *cosa cambia* e *perche e la soluzione corretta* nel contesto del progetto (DDD, neverthrow, Jazz boundary, vertical slices). Cita i file e le righe specifiche che saranno toccati.

### 1c. Ambiguita o biforcazioni

Se esistono due o piu approcci validi con trade-off significativi, **non procedere**. Invece:
1. Elenca le opzioni con pro/contro sintetici.
2. Indica quale preferiresti e perche.
3. **Chiedi conferma all'utente** prima di scrivere codice.

Esempi di biforcazioni che richiedono conferma:
- Spostare validazione da adapter a rules (breaking sui caller) vs duplicare temporaneamente.
- Estrarre logica in shared value object vs tenerla locale al dominio.
- Rendere un adapter generico vs mantenerlo specifico.

---

## FASE 2 — Pianificazione parallela e worktree

Prima di eseguire, valuta quali finding sono **indipendenti** e possono essere parallelizzati su agenti distinti, ciascuno nel proprio worktree.

### Criteri di indipendenza (tutti devono essere veri):
- Non toccano lo stesso file (nemmeno per import)
- Non hanno dipendenza logica tra loro (A non introduce un pattern che B deve adottare)
- Producono test in file separati (nessun conflitto di merge)

### Conflitti che forzano sequenzialita:
- Due finding che toccano lo stesso `rules.ts`
- Un finding che modifica un tipo in `model.ts` usato da un altro finding
- Un finding che cambia un adapter chiamato da un altro finding

### Output di questa fase:
Presenta all'utente un piano con batch e motivazioni:

```
Batch 1 (parallelo — worktree separati per ogni agente):
  Agent A / worktree fix/finding-X: Finding X + Finding Y  (stesso modulo)
  Agent B / worktree fix/finding-Z: Finding Z              (modulo separato)

Batch 2 (sequenziale dopo merge Batch 1 — dipende da Finding X):
  worktree fix/finding-W: Finding W
```

### Naming dei worktree:
`fix/finding-<ID-o-slug>` — es. `fix/finding-high-2-adapter-logic`, `fix/finding-42-throw-in-rules`.

---

## FASE 3 — Setup worktree

Per ogni finding (o sotto-batch parallelo), **prima di toccare codice**:

```bash
# Dalla root del repo
git worktree add ../board-fix-<slug> -b fix/finding-<slug>
```

Lavora esclusivamente dentro quel worktree. Non modificare il working tree principale durante il fix.

---

## FASE 4 — Esecuzione nel worktree

### Per ogni finding nel suo worktree:

1. **Leggi i test esistenti** che coprono il codice da modificare.
2. **Scrivi/aggiorna i test** se il fix introduce nuovi comportamenti o altera contratti.
3. **Modifica il codice** secondo la soluzione descritta in Fase 1b.
4. **Controlla i caller**: cerca tutti gli usi del simbolo modificato nel codebase.

### Pre-commit self-check (gate obbligatorio prima di ogni commit)

**Invoca il skill `codebase-patterns`** e rispondi alla checklist pre-commit che trovi li.
Ogni risposta "si" e un blocco: correggi prima di committare.

### Escalation durante il fix

Se scopri che il problema e **piu esteso di quanto documentato**:
1. **Fermati.**
2. Riporta all'utente cosa hai scoperto.
3. Aggiorna il finding in `review-notes.md` con le nuove evidenze.
4. Chiedi se procedere con la scope estesa o fermarsi.

### Spec alignment check

Se il fix cambia un comportamento documentato nelle spec (`/specs/001-timeline-board-app/spec.md`):
1. **Non aggiornare le spec da solo.**
2. Mostra all'utente: quale spec, quale sezione, cosa cambia, se e correzione o cambio intenzionale.
3. **Aspetta conferma esplicita.**
4. Solo dopo conferma, aggiorna la spec atomicamente con il fix.

---

## FASE 5 — Verifica build nel worktree

Dentro il worktree, dopo il fix:

```bash
pnpm exec vitest run
```

- Tutti i test passano: procedi alla Fase 6.
- Fallisce: **non procedere**. Analizza, correggi, riverifica. Non uscire dal worktree con test rossi.

---

## FASE 6 — Review post-fix (review-codebase in modalita mirata)

Dopo che i test sono verdi, invoca il skill `review-codebase` in **modalita post-fix** sul codice modificato.

Indica esplicitamente:
- I file toccati dal fix
- Il finding che si intendeva risolvere
- La soluzione applicata

Il skill `review-codebase` rispondera a:
1. Il fix risolve effettivamente il problema?
2. E consistente con i pattern architetturali?
3. Ha introdotto nuovi finding?
4. I test sono sufficienti?
5. Ci sono caller o dipendenti non aggiornati?

### Esiti possibili:

**"Fix approvato"** -> procedi alla Fase 7.

**"Fix parziale o nuovi finding emersi"** ->

Classifica ogni nuovo finding emerso dalla review:

**Trivial (dead code, import inutilizzato, tipo impreciso):**
- Correggilo **subito nel worktree corrente**, nello stesso commit o in uno aggiuntivo.
- Non aprire un finding in `review-notes.md` — risolverlo ora costa meno che tracciarlo.

**Importante (violazione architetturale, bug potenziale, violazione DDD/neverthrow/Jazz boundary):**
- **Non fixare nel worktree corrente** — potrebbe allargare la scope incontrollatamente.
- Aggiungilo in `review-notes.md` nella sezione "Findings aperti" con severita e evidenze.
- Procedi al merge del worktree attuale come previsto.

**Bloccante (il fix originale non funziona o introduce regressioni):**
- Correggilo nel worktree corrente prima di procedere al merge.
- Se richiede scope molto piu ampia: torna alla Fase 1 con la nuova comprensione.

**Se il fix non risolve il problema originale:**
- Torna alla Fase 1 con la nuova comprensione acquisita.

---

## FASE 7 — Commit nel worktree

Ogni finding ottiene un **commit separato**. Formato:

```
[Finding X] Descrizione sintetica di cosa e stato fatto

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Non raggruppare finding non correlati — rende il log illeggibile e il rollback impossibile.

---

## FASE 8 — Merge e pulizia worktree

```bash
# Dalla root del repo principale
git merge fix/finding-<slug> --no-ff

# Rimozione worktree
git worktree remove ../board-fix-<slug>
git branch -d fix/finding-<slug>
```

Usa `--no-ff` per preservare la storia del branch nel log.

---

## FASE 9 — Aggiornamento review-notes

Dopo merge completato:

1. Sposta i finding risolti da "Findings aperti" a "Findings risolti" in `review-notes.md`.
2. Per ogni finding risolto, aggiungi nota sintetica con commit reference.
3. Aggiorna la sezione "Verifiche eseguite" con data, comando, totale test e failure count.
4. Se sono emersi nuovi finding in Fase 6, aggiungili in "Findings aperti" con severita e evidenze.

---

## Regole generali

- **Effort prima di severita**: risolvi prima cio che e veloce — libera spazio mentale.
- **Un worktree per finding** (o per sotto-batch parallelo): mai mescolare fix di finding diversi nello stesso worktree.
- **Spiega sempre la causa, non solo la soluzione**: aiuta a prevenire la ricorrenza del pattern.
- **Mai silent fix**: se durante il fix cambi qualcosa che non era nel finding, segnalalo esplicitamente.
- **Non rimuovere test**: se un test sembra ridondante, segnalarlo — non eliminarlo senza discussione.
- **Context window**: per finding con molti caller, usa subagenti. Non accumulare troppe modifiche non committate.
