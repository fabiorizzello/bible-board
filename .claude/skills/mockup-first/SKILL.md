---
name: mockup-first
description: >
  Protocollo obbligatorio per task UI nel progetto Timeline Board.
  Ogni componente UI nuovo o modifica visiva significativa DEVE passare per una fase
  di sketch/mockup validato dall'umano PRIMA di procedere al wiring con logica reale.
  Garantisce che il look sia approvato prima di spendere tempo su integrazione Jazz,
  neverthrow boundaries, e business logic.
---

# Mockup-First — UI/UX Review Gate operativo

Questa skill è la versione operativa del principio "UI/UX Review Gate (Human-in-the-Loop)" definito nel `CLAUDE.md` (constitution v3.0.0) del progetto. Trasforma la regola in un protocollo eseguibile dagli agenti GSD.

## Filosofia

Il look si valida PRIMA del wiring — zero tempo sprecato su UI non approvata.

Separare "come appare" da "come funziona" ha un costo basso (un file `.tsx` con dati hardcoded) e un valore alto (iterazione visiva rapida senza toccare Jazz schemas, adapter, o regole di dominio). Il bug più costoso da correggere è quello rilevato dopo che il componente è già cablato alla source of truth.

## Quando applicare

Questa skill si attiva quando il task coinvolge UI. **Regola operativa (OR)**: il task è UI se soddisfa almeno uno di questi due criteri:

1. **Path-based**: il task crea o modifica file sotto `src/ui/`.
2. **Keyword-based**: il phase goal o la task description contiene almeno una parola chiave: *pagina, componente, schermata, form, modale, layout, vista, UI*.

Se uno dei due è vero, la skill si applica. In caso di dubbio (es. task che tocca solo `features/<domain>/` ma il phase goal cita "form"), risolvi a favore dell'applicazione della skill — falso positivo ha costo basso (un mockup in più), bypass involontario ha costo alto (wiring su UI non approvata).

Per modifiche puramente cosmetiche su componenti già approvati (es. cambio colore di un bordo, correzione di spacing) il protocollo **non si applica** — va direttamente al wiring con commit normale.

## Protocollo

### Fase 1 — Sketch (mockup)

**Prerequisito obbligatorio**: caricare la skill `ui-ux-pro-max` (path: `.claude/skills/ui-ux-pro-max`) via Skill tool. Questa è la single source of truth per design system, palette, tipografia e anti-pattern del progetto.

**Dove**: `src/ui/mockups/<slug>/` — una cartella per mockup, `<slug>` in kebab-case derivato dal nome del componente.

**Cosa produce**:

1. Un componente React `.tsx` **reale**:
   - Usa **HeroUI** (`@heroui/react`) per primitivi interattivi (Button, Input, Modal, etc.)
   - Usa **Tailwind CSS** + token del progetto (`src/styles/tokens.css`) — mai valori hardcoded fuori dai token
   - Usa **lucide-react** per icone — no emoji
   - Lingua: **italiano** (constitution — no libreria i18n)
   - Dati: hardcoded inline o in un file `mock-data.ts` adiacente (no fetch, no Jazz, no adapter)
   - Stati multipli renderizzati: **empty, loading, error, populated** (se applicabile al componente)

2. Una **route dev** montata su `/dev/mockup-<slug>` in `src/routes/dev/` (o equivalente router setup), che mostra il mockup a pieno viewport tablet (1024x768).

3. Uno **screenshot** del mockup reso nel browser (Chrome DevTools o Playwright MCP), allegato al summary del task.

**Cosa NON fa**:
- NON importa da `features/<domain>/` (niente business logic)
- NON importa da Jazz (`jazz-tools`, `jazz-react`, schemas, adapter)
- NON usa `Result<T, E>` / neverthrow (niente error handling di dominio)
- NON crea test
- NON wiring di eventi a store reali (onClick può essere `console.log` o noop)

**Vincoli di qualità non negoziabili** (derivati dalla constitution):
- Touch target minimo 44×44px, gap ≥8px
- `touch-action: manipulation` su aree interattive
- `prefers-reduced-motion` rispettato (nessuna animazione forzata)
- Animazioni solo su `opacity` e `transform` (mai `width`/`height`/`top`/`left`)
- Contrasto testo ≥ 4.5:1
- Navigabile da tastiera

### Fase 2 — Human Review Gate

**Meccanismo: AskUserQuestion interattivo**.

Quando il mockup è pronto (file `.tsx` creato, route `/dev/mockup-<slug>` montata, dev server in esecuzione, screenshot acquisito), l'agente DEVE:

1. Presentare nel messaggio di output: path del mockup, URL della dev route, screenshot embedded (o link al file locale).
2. Invocare `AskUserQuestion` con header `Mockup Gate` e le seguenti opzioni:
   - **Approvato** — procede a Fase 4 (wiring)
   - **Itera** — torna a Fase 1 con feedback testuale dell'umano (l'umano lo scrive nel turn successivo)
   - **Abbandona** — chiude il task senza wiring; il mockup resta in `src/ui/mockups/` marcato come draft

3. Bloccare il task fino alla risposta. Nessun wiring parte senza scelta esplicita.

**Registrazione approvazione**: al ricevere "Approvato", l'agente registra nel summary del task: meccanismo = `AskUserQuestion`, timestamp ISO, screenshot reference.

**Limitazione nota**: `AskUserQuestion` non funziona in sessioni autonomous/background senza interazione umana. Se la skill viene invocata da `/gsd-autonomous` o `/loop`, il task si blocca in attesa e l'umano deve riprendere manualmente la sessione per rispondere. Questo è voluto — il gate umano è non negoziabile per la constitution del progetto.

### Fase 3 — Iterazione (opzionale)

Se l'umano richiede modifiche al mockup, torna a Fase 1 e aggiorna il `.tsx` del mockup. Itera fino ad approvazione.

**Bound: max 3 iterazioni.** Un'iterazione = un ciclo completo (Fase 1 → Fase 2 → feedback "Itera"). Alla **4ª richiesta di iterazione**, l'agente NON modifica il mockup immediatamente, ma invoca `AskUserQuestion` con header `Gate Escalation` e opzioni:

- **Forza approvazione** — accetta lo stato attuale del mockup e procede a Fase 4 (wiring). Le differenze residue vengono registrate nel summary come "accepted with FLAGs".
- **Abbandona task** — chiude il task senza wiring. Il mockup resta in `src/ui/mockups/` come artefatto.
- **Continua (+3 iter)** — resetta il counter e concede altre 3 iterazioni. L'escalation si ripresenta al 7°, 10°, ecc.

**Razionale**: 3 iterazioni coprono i casi normali (prima bozza + 2 refinement). Il gate dopo 3 costringe a una decisione esplicita invece di loop senza convergenza. Non c'è hard-limit — "Continua" è sempre disponibile se l'umano giudica che la convergenza è vicina.

### Fase 4 — Wiring (post-approvazione)

Solo dopo approvazione esplicita:

1. **Sposta** il componente da `src/ui/mockups/<slug>/` alla sua destinazione finale secondo la struttura DDD del progetto:
   - Pagina → `src/ui/<page-name>/`
   - Componente riusabile → `src/ui/<page-name>/components/` o `src/ui/shared/`

2. **Sostituisci i dati hardcoded** con la logica reale:
   - Jazz hooks (`useCoState`, `useAccount`) per lettura
   - Adapter calls per scrittura
   - `Result<T, E>` + `.match()` per error handling (constitution §VIII)
   - Business logic via import da `features/<domain>/rules.ts`

3. **Rimuovi la route dev**: elimina `/dev/mockup-<slug>` e la cartella `src/ui/mockups/<slug>/`.

4. **Aggiungi test** dove applicabile (domain rules pure, per constitution §VII — la UI in sé non richiede test obbligatori).

5. **Commit atomico**: `feat(<slug>): wire <component> to live data` separato dal commit di mockup.

## Output per il summary del task

Quando il task è completo (wiring incluso), il summary DEVE contenere:

```markdown
### Mockup-First Gate

- Mockup path: src/ui/mockups/<slug>/ (rimosso dopo wiring)
- Dev route: /dev/mockup-<slug> (rimossa dopo wiring)
- Screenshot: [link o embed]
- Iterazioni: <N>
- Approvazione: <meccanismo usato, timestamp>
- Componente finale: <path definitivo>
```

## Anti-pattern (finding bloccanti)

Cerca attivamente questi anti-pattern nei task UI:

| Anti-pattern | Perché è male |
|---|---|
| Wiring a Jazz diretto senza mockup preliminare | Bypassa il gate — bug visivi scoperti solo dopo integrazione costosa |
| Mockup con Tailwind raw senza HeroUI | Viola constitution §III — HeroUI è il primitivo UI del progetto |
| Mockup con emoji al posto di lucide-react | Viola constitution §III |
| Mockup senza stati empty/loading/error | Stato incompleto — il gate valida solo un caso felice |
| Commit del mockup mescolato con commit di wiring | Rompe atomicità — impedisce rollback granulare |
| `src/ui/mockups/` committato senza cleanup finale | Contaminazione permanente del codebase con dead code |

## Relazione con `/gsd-ui-phase`

Se esiste un `UI-SPEC.md` per la phase (prodotto da `/gsd-ui-phase`), il mockup DEVE rispettarlo al 100%: spacing, tipografia, colori, copywriting sono già contratti locked. Il mockup è l'implementazione visiva di quel contratto, non un punto di rinegoziazione.

Se non esiste `UI-SPEC.md`, il mockup segue solo `CLAUDE.md` §"Design System" + `ui-ux-pro-max` + token in `src/styles/tokens.css`.
