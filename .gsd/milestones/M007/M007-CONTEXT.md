# M007: Polish & Refinement

**Gathered:** 2026-04-24
**Status:** Ready for planning

## Project Description

Milestone di rifinitura qualitativa del prototipo consegnato in M001. Zero nuove feature: il lavoro è far sembrare l'app un'app iPad nativa degna di essere propagata su cloud sync. Polish eseguito **prima** di M002 (Jazz backend cloud sync) perché iterare su mock/Jazz locale è più economico che iterare su CRDT sincronizzato.

## Why This Milestone

Il prototipo M001 funziona end-to-end ma espone attrito visibile: termini tecnici ("markdown", "panel") nella UI, layout non fullheight, warning fasulli su completezza invece che validità, toast emessi anche su no-op (blur senza modifica), toast invasivo come unico canale di feedback. Tutto ciò va chiuso **prima** di investire nel cloud sync perché rilavorare polish dopo la sincronizzazione multi-client costa molto di più (conflitti CRDT, stato multi-tab, latenza offline→online).

Inoltre Jazz è già integrato (S08) ma non è mai stato validato in profondità — reload persistence, multi-tab CRDT, offline→online resync restano da provare.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Usare l'app senza incontrare termini tecnici (markdown, panel, toast, field) nella UI
- Vedere il layout occupare tutta l'altezza del viewport iPad (landscape e portrait) senza scroll esterno
- Modificare un campo e vedere conferma inline (icona check nell'angolo) senza toast invasivo
- Cliccare una bell icon in toolbar per aprire un drawer stile iPad con la lista delle modifiche recenti e fare rollback inline
- Navigare il 3-pane con la tastiera (Tab sidebar→list→detail) con focus ring visibile
- Fare blur su un campo descrizione senza modifiche e non vedere alcuna notifica
- Non vedere più warning tipo "manca descrizione" su elementi minimali validi

### Entry point / environment

- Entry point: `pnpm dev` → `http://localhost:5173`
- Environment: browser iPad viewport (1180×820 landscape, 820×1180 portrait)
- Live dependencies involved: Jazz locale (`sync: { when: 'never' }` intenzionale — no API key ancora)

## Completion Class

- Contract complete means: tests unit passano (126 esistenti + nuovi su `useFieldStatus` e notification store), `pnpm build` verde, grep finale su termini tecnici a zero
- Integration complete means: drawer + inline success funzionano end-to-end su tutti gli editor dell'app; notification center assorbe soft-delete-undo esistente; audit Jazz produce 4 scenari browser documentati
- Operational complete means: revisione `ui-ux-pro-max` skill passata come quality gate pre-slice-complete

## Final Integrated Acceptance

Per chiamare M007 completo:

- Sessione reale in browser: creare elemento, modificare descrizione, aggiungere fonte, creare link bidirezionale, eliminare elemento → ogni mutazione appare nel drawer con rollback funzionante, nessun toast sovrapposto alla UI
- Blur descrizione senza modificare → nessuna entry nel drawer, nessuna icona success
- Reload pagina dopo 5 mutazioni → stato persistito correttamente su Jazz (audit scenario)
- Keyboard-only navigation: dalla sidebar raggiungere un campo editor e modificarlo → funziona con focus visibile in ogni step
- Revisione `ui-ux-pro-max` finale non solleva blocker
- Screenshot prima/dopo salvati nei summary slice

## Architectural Decisions

### Notification center: Legend State store singleton

**Decision:** Store modulo-level `notifications-store.ts` con `observable<{notifications: Notifica[]}>()`, consumato via `useSelector`. Drawer HeroUI placement right, bell icon in toolbar con badge count. In-memory only per M007 (persistenza cross-sessione deferred, R048).

**Rationale:** Coerente con pattern D031 (Legend State + `useSelector`, no `observer()` HOC, no `use$`). Evita schema CoMap nuovo per qualcosa ancora in iterazione.

**Alternatives Considered:**
- Persistere notifiche in Jazz CoMap — rinviato: complessità schema per beneficio marginale in sessione singola
- Mantenere toast per errori bloccanti — scartato: l'utente vuole drawer che assorba tutto; errori bloccanti restano inline nel field

### Toast rimosso completamente, sostituito da drawer

**Decision:** Nessun componente `Toast` rimane nella UI. Soft-delete-undo esistente viene assorbita dal drawer (entry con rollback, timer 30s opzionale gestito dal notification store).

**Rationale:** Utente esplicito: "troppo invasivo". Il pattern iPad-native (Mail, Messages) usa badge + container consultabile on-demand, non overlay che si impongono.

**Alternatives Considered:**
- Drawer per success + toast per errori → scartato (doppia grammatica)
- Mantenere toast per rollback rapido → scartato (il drawer supporta rollback immediato)

### Inline success: hook unico + presentazioni per tipo controllo

**Decision:** Hook condiviso `useFieldStatus(value, onCommit)` con status `idle|saving|success|error` e confronto prev/next al commit. Presentazioni diverse per tipo controllo: Input/Textarea (check in `endContent`/angolo absolute), Chip (check verde inline per 1.5s), Select (check accanto al trigger), Date picker (check inline), Toggle (nessuna icona extra, il toggle stesso è conferma).

**Rationale:** Un hook risolve sia inline-success sia toast-no-op fix. Gli adapter visivi rispettano la forma naturale di ogni controllo (chip non può avere endContent come Input).

**Alternatives Considered:**
- Wrapper monolitico `<FieldWithStatus>` → scartato: non si adatta a Chip/Select/Date con gracefulness
- Due meccanismi separati (success + no-op) → scartato: stessa logica prev/next, duplicazione inutile

### Audit Jazz dentro M007 come slice con proof browser

**Decision:** Slice dedicato (S06) con 4 scenari testati in browser: (a) reload persistence, (b) multi-tab CRDT propagation, (c) offline→online resync, (d) conferma intenzionalità `sync: 'never'` (no API key). Findings documentati in `S06-RESEARCH.md`. Fix nello stesso slice se small; blocker escalati.

**Rationale:** Jazz integrato in S08 M001 ma mai validato end-to-end. Farlo prima di M002 (cloud sync) elimina sorprese quando si attiva il sync server.

**Alternatives Considered:**
- Rinviare audit a M002 → scartato: se emergono problemi di architettura Jazz, meglio scoprirli ora
- Spike separato → scartato: overhead coordinamento

### Riscritture componenti permesse

**Decision:** Se un polish superficiale non basta, è permesso riscrivere un componente (es. ElementoEditor per field particolare). M007 non è cosmetica pura.

**Rationale:** Utente esplicito. Il debt tecnico scoperto durante polish va affrontato, non aggirato.

---

> Vedi `.gsd/DECISIONS.md` per il registro completo delle decisioni di progetto.

## Error Handling Strategy

Strategia a 4 livelli, coerente con l'architettura notification center:

1. **Errori di validazione form** (data invalida, anno non intero, campo richiesto): inline near-field in rosso via `useFieldStatus` status=`error`. **Nessuna entry nel drawer** — restano locali al field.
2. **Errori di mutazione Jazz** (save fallito, conflict non risolvibile, offline senza cache): entry nel drawer con type=`error`, icona alert, **non auto-dismiss**, richiede ack esplicito. Il field relativo mantiene status=`error` finché non si ritenta.
3. **Warning reali** (link a elemento eliminato, referenza rotta, data incongruente): badge warning inline nell'editor + entry opzionale nel drawer. Non bloccanti.
4. **Rollback fallito** (elemento modificato nel frattempo): entry error nel drawer con messaggio chiaro. Nessun silent fail.

**Offline:** banner sottile sopra la toolbar (già previsto). Mutazioni continuano su Jazz locale. Drawer mostra pending sync count.

**React error boundary:** a livello pagina, fallback minimale "Ricarica". Fuori ambito polish approfondito.

## Risks and Unknowns

- **Granularità rollback su update successivi** — 3 blur sulla descrizione generano 3 entry o una sola? Da decidere nello slice S04 (notification center)
- **Retrofit `useFieldStatus` su editor esistente** — rischio di rompere form validation attuale; mitigato con test incrementali
- **Audit Jazz può emergere blocker** — scenari multi-tab o offline→online potrebbero scoprire bug architetturali che non sono polish; in quel caso escalation
- **Mapping field "con peso" vs "leggeri"** — decisione esatta dentro slice S03

## Existing Codebase / Prior Art

- `src/ui/workspace-home/ElementoEditor.tsx` — editor principale con blur-to-save + 5s undo toast; target primario per inline success e warning cleanup
- `src/ui/workspace-home/DetailPane.tsx` — handleSoftDelete con toast 30s, da assorbire nel drawer
- `src/ui/workspace-home/workspace-ui-store.ts` — pattern Legend State da replicare per notification store
- `src/ui/workspace-home/FullscreenOverlay.tsx` — layout da rendere fullheight
- `src/ui/workspace-home/NavSidebar.tsx` — keyboard nav + aria-label target
- `src/ui/mockups/` — mockup unified editor approvato, riferimento visivo
- `src/features/elemento/elemento.adapter.ts` — mutazioni Jazz (addBidirectionalLink, softDelete) da wrappare con rollback
- `src/main.tsx` — JazzProvider con `sync: { when: 'never' }`, da verificare comportamento reload/multi-tab
- `.gsd/KNOWLEDGE.md` — pattern HeroUI v3 RAC (composizione TextField, Select composite API), Legend State API v2.1.15

## Relevant Requirements

- R046 Linguaggio UI di dominio — owner M007/S01
- R047 Layout fullheight iPad — owner M007/S01
- R048 Warning solo per validità reale — owner M007/S02
- R049 Toast no-op fix — owner M007/S03
- R050 Inline success feedback — owner M007/S03
- R051 Notification center iPad-native con rollback — owner M007/S04
- R052 Rimozione toast invasivo — owner M007/S04
- R053 A11y baseline — owner M007/S05
- R054 Density/spacing uniforme + transizioni corrette — owner M007/S05
- R055 Audit Jazz reale — owner M007/S06
- R056 Quality gate `ui-ux-pro-max` — cross-slice

## Scope

### In Scope

- Sostituzione termini tecnici ("markdown", "panel", "toast", "field") con italiano di dominio
- Layout fullheight su iPad 1180×820 e 820×1180
- Rimozione warning di completezza; mantenimento warning di validità
- Fix toast no-op (blur senza cambio non emette notifica)
- Hook `useFieldStatus` + inline success su field con peso (Input, Textarea, Chip, Select, Date)
- Notification center: bell icon toolbar, drawer HeroUI right, badge pulse, rollback su tutte le mutazioni (create/update/delete di elementi/link/board/fonti), in-memory
- A11y: focus ring, keyboard nav 3-pane, aria-label su icon-only
- Density uniforme, transizioni `opacity/transform` only, feedback tattile <100ms
- Errori form inline (non drawer)
- Audit Jazz: 4 scenari browser documentati + fix in-scope
- Riscritture componenti permesse se polish superficiale insufficiente
- Revisione `ui-ux-pro-max` come gate pre-slice-complete

### Out of Scope / Non-Goals

- Nuove feature (timeline interattiva, grafo, genealogia, video, sharing reale)
- Persistenza notifiche cross-sessione (R048 → deferred)
- Inline success su field "leggeri" (toggle, switch) — R049 deferred
- Cloud sync Jazz (M002)
- Refactor domain/adapter senza motivo UX diretto

## Technical Constraints

- **HeroUI v3 RAC**: composizione `TextField > Label + Input + FieldError`, NON props dirette
- **Animare solo `opacity` e `transform`** — mai width/height (constitution IX)
- **Touch target ≥44×44px**, eccetto compound controls (chip X-remove OK se parent ≥44px)
- **Legend State v2.1.15**: `useSelector` da `@legendapp/state/react`; NO `observer()` HOC, NO `use$`
- **Jazz `sync: { when: 'never' }`**: confermato intenzionale (no API key) — non rimuovere
- **`prefers-reduced-motion`** rispettato su tutte le animazioni nuove (bell bounce, badge pulse, check fade-out)
- **126/126 test esistenti** devono continuare a passare

## Integration Points

- **Jazz** — audit comportamento reload/multi-tab/offline, no modifica schema (in M007)
- **HeroUI Drawer** — primitivo esistente in stack, nuovo uso per notification center
- **Legend State store** — nuovo `notifications-store.ts` accanto a `workspace-ui-store.ts`
- **Soft-delete esistente** — assorbita dal notification center, pattern `handleSoftDelete` wired al nuovo store

## Testing Requirements

- **Unit test**:
  - `useFieldStatus` hook: prev/next comparison, stato transitions, idempotenza
  - Notification store: add, rollback, mark read, ordering
- **Domain test esistenti**: 126/126 continuano a passare
- **UAT manuale browser**: flussi end-to-end (notification center, inline success, a11y keyboard, audit Jazz scenari)
- **Quality gate skill `ui-ux-pro-max`**: obbligatoria pre-slice-complete su ogni slice UI, findings risolti o tracciati come blocker
- **No E2E/Playwright** (YAGNI per polish milestone, stack non ce l'ha)

## Acceptance Criteria

**S01 (Linguaggio e fullheight):**
- `rg -i '(markdown|panel|toast|field)' src/ui/` → zero hit su stringhe visibili all'utente
- Layout root, FullscreenOverlay, DetailPane occupano 100% viewport senza scroll esterno su 1180×820 e 820×1180

**S02 (Warning reali):**
- Elemento minimale (solo titolo) → zero warning
- Data malformata → warning visibile inline
- Link a elemento soft-deleted → warning visibile

**S03 (`useFieldStatus` + inline success + toast no-op):**
- Hook `useFieldStatus` esiste in `src/ui/workspace-home/` (min 30 righe, export named)
- Blur descrizione senza cambio → niente icona, niente entry drawer
- Blur con cambio → check icon fade-out 1.5s + entry drawer
- Chip tag modificato → check verde inline 1.5s
- Select tipo modificato → check accanto trigger

**S04 (Notification center):**
- Bell icon in toolbar con badge count
- Badge pulse 300ms + bell bounce 150ms su nuova entry
- Drawer slide-in da destra, HeroUI Drawer placement=`right`
- Lista mutazioni con target label, timestamp, bottone rollback
- Rollback funziona su create/update/delete di elemento, link, board, fonte
- Soft-delete esistente assorbita (nessun toast separato)

**S05 (A11y + density + animation):**
- Tab-nav sidebar→list→detail funziona
- Ogni icon-only button ha `aria-label`
- Focus ring visibile e conforme WCAG 2.1 AA
- `rg 'transition-all' src/ui/` → zero hit (solo `transition-[opacity,transform]`)
- `prefers-reduced-motion` disabilita tutte le nuove animazioni

**S06 (Audit Jazz):**
- `S06-RESEARCH.md` documenta 4 scenari con verdict:
  1. Reload persistence: pass/fail + evidenza
  2. Multi-tab CRDT: pass/fail + evidenza
  3. Offline→online resync: pass/fail + evidenza
  4. `sync: 'never'` intent: confermato intenzionale
- Fix in-scope applicati; blocker escalati

**S07 (Revisione ui-ux-pro-max + integrated proof):**
- Skill `ui-ux-pro-max` eseguita su UI polished
- Findings risolti o tracciati
- Screenshot comparativo prima/dopo in `S07-SUMMARY.md`

## Open Questions

- Granularità rollback su update successivi stesso campo — 3 entry o 1 consolidata? → Decisione in S04
- Quali field esatti sono "con peso" per inline success → Decisione in S03 (probabile: titolo, descrizione, data, tipo, fonti)
