---
phase: "02-editor-annotazioni"
verifier: gsd-verifier
timestamp: 2026-04-13T13:20:00Z
status: verified
truths_total: 3
truths_verified: 3
truths_partial: 0
truths_failed: 0
gaps_found: 0
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: 2/3
  gaps_closed:
    - "Click Modifica → editor inline con campi tipo-specifici (per ogni ElementoTipo, con persistenza del dato digitato)"
  gaps_remaining: []
  regressions: []
deferred: []
human_verification: []
---

# Phase 02: Editor inline, annotazioni, soft delete — Verification Report (Re-verification after gap closure 02-02)

**Phase Goal (from ROADMAP.md):** Click Modifica → editor inline con campi tipo-specifici. Annotazioni mie/altrui nel detail. Soft delete con toast Annulla 30s.

**Verified:** 2026-04-13T13:20:00Z
**Status:** verified (3/3 truths)
**Re-verification:** Yes — after gap closure plan 02-02 landed on HEAD

## Summary

La prima verifica (`02-VERIFICATION.md` v1, 2026-04-13T12:05:00Z) aveva registrato 2/3 must-have: annotazioni mie/altrui e soft-delete verificate, ma la prima goal property ("editor inline con campi tipo-specifici") era marcata FAILED perché (a) `ElementoEditor` non aveva rami per `evento`/`periodo`/`annotazione`, (b) `handleSave` scartava tutti i campi tipo-specifici prima di chiamare `normalizeElementoInput`, (c) `ElementoInput` non aveva nemmeno le colonne per ospitare quei campi. Il plan 02-02 ha chiuso tutti e tre i punti.

La re-verifica qui sotto parte dal goal e scende all'implementazione (goal-backward). Il risultato: **3/3 must-have verificate**. Le due proprietà già passate (annotazioni, soft delete) non hanno regressioni; la proprietà precedentemente fallita è ora completamente soddisfatta, inclusa la clausola "anni invalidi → `data_non_valida` esposto in UI" che era il giudizio più severo del gap originale.

Due cose meritano di essere segnalate separatamente da "goal verificato" (vedi sezione "Known gaps (non blocking)"):
1. Il `02-02-SUMMARY.md` dichiara "123 tests passing"; la misurazione diretta qui restituisce **68 tests passing, 3 test files, exit 0**. Il conteggio dichiarato era stale ma non cambia l'esito: tutti i test passano e i 13 nuovi casi di `elemento.rules.test.ts` pinano il contratto nuovo.
2. Il `02-REVIEW.md` v2 ha flaggato tre warning (WR-01 `date` senza gate tipo-owner nel layer dominio; WR-02 `initState` auto-stampa `statoProfezia = "futura"`; WR-03 coverage di test per rejection incompleta). Nessuno di questi è un fallimento della goal property: WR-01 è unreachable dal path editor (l'UI è costruttiva), WR-02 è un data-contamination pattern ma il prototipo mock non persiste nulla, WR-03 è un pin-the-contract gap non un correctness gap. Sono segnalati alla closure della milestone, non al blocco della phase.

## Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Click Modifica → editor inline mostra campi tipo-specifici per ogni ElementoTipo (8/8 varianti con exhaustiveness-check); handleSave forwarda i campi type-specific a normalizeElementoInput; anni invalidi producono l'errore data_non_valida e lo espongono in UI | VERIFIED | Switch esaustivo su 8/8 varianti + `const _exhaustive: never = tipo` + handleSave forwarda 10 campi tipo-specifici + parseDataStorica restituisce INVALID_DATA → handleSave setta `_form: ERROR_MESSAGES.data_non_valida` → rendered come `<p role="alert">{errors._form}</p>` |
| 2 | Annotazioni mie/altrui visibili nel detail (mie cliccabili, count altrui, CTA disabilitato quando solo altrui) | VERIFIED | `getAnnotazioniForElement` invariato da 02-01; DetailBody monta la sezione Annotazioni con 4 branch (mie list, altreCount con singolare/plurale, CTA "+ Aggiungi annotazione" disabled quando mie=0 e altreCount>0, hidden quando entrambi 0). Nessuna regressione dopo 02-02. |
| 3 | Soft delete con toast Annulla 30s (click Elimina → toast con timeout 30s → click Annulla ripristina e riseleziona l'elemento) | VERIFIED | `handleSoftDelete` in DetailPane chiama `softDeleteElement` poi `toast(..., { timeout: 30_000, actionProps: { children: "Annulla", onPress: () => restoreElement(elementId) } })`; Toast.Provider montato in WorkspacePreviewPage; ListPane filtra `deletedElementIds` via `getElementsForView`. FullscreenOverlay riusa lo stesso helper. Nessuna regressione dopo 02-02. |

**Score:** 3/3 must-haves verified. Gap precedente chiuso; nessuna nuova regressione.

## Truth 1 — Editor inline con campi tipo-specifici (the previously failing one)

Questo è l'obiettivo critico. Lo verifico contro ciascuna delle 3 sub-clausole che il plan 02-02 ha dichiarato di soddisfare.

### Sub-claim (a): 8/8 ElementoTipo hanno un ramo con exhaustiveness-check

**Expected:** `ElementoEditor` rende campi tipo-specifici per tutte le 8 varianti di `ElementoTipo`; il compilatore impedisce di aggiungerne una nuova senza un ramo (discriminated-union con `const _exhaustive: never = tipo`).

**Evidence (file:line):**
- `src/features/elemento/elemento.model.ts:4-12` — definizione `ElementoTipo` con 8 variant: `personaggio | guerra | profezia | regno | periodo | luogo | evento | annotazione`.
- `src/ui/workspace-home/ElementoEditor.tsx:639-666` — funzione `renderTypeSpecificFields(tipo, state, set)` con uno switch che copre esplicitamente tutte le 8 variant:
  - L645 `case "personaggio"` → `<PersonaggioFields …/>`
  - L647 `case "guerra"` → `<GuerraFields …/>`
  - L649 `case "profezia"` → `<ProfeziaFields …/>`
  - L651 `case "regno"` → `<RegnoFields …/>`
  - L653 `case "luogo"` → `<LuogoFields …/>`
  - L655 `case "evento"` → `<EventoFields …/>` (era 0/3 mancanti prima)
  - L657 `case "periodo"` → `<PeriodoFields …/>` (era 0/3 mancanti prima)
  - L659 `case "annotazione"` → `<AnnotazioneFields />` (placeholder "(Nessun campo aggiuntivo per questo tipo)") (era 0/3 mancanti prima)
  - L661-664 `default: { const _exhaustive: never = tipo; throw new Error(…) }` — compile-time guarantee che una futura ElementoTipo variant non possa landare senza un branch.
- `ElementoEditor.tsx:296` — il render principale chiama `{renderTypeSpecificFields(tipo, state, set)}`, quindi il dispatcher è effettivamente cablato sul render path.
- I 3 nuovi sub-componenti esistono: `EventoFields` (L517-552, rende anno+era con 1 TextField e 1 Select), `PeriodoFields` (L554-622, rende inizio/fine con 2 TextField + 2 Select), `AnnotazioneFields` (L624-633, placeholder `<p className="italic">(Nessun campo aggiuntivo per questo tipo)</p>`).

**Grep confirmation:** `case "(evento|periodo|annotazione)":` match su L655/657/659; `_exhaustive: never = tipo` match su L662 (+ comment L637).

**Verdict:** VERIFIED. ✓

### Sub-claim (b): handleSave forwarda i campi type-specific a normalizeElementoInput

**Expected:** Il payload passato a `normalizeElementoInput` include tutti i 10 campi tipo-specifici (`nascita`, `morte`, `date`, `tribu`, `ruoli`, `fazioni`, `esito`, `statoProfezia`, `dettagliRegno`, `regione`), gated per `tipo === "<owner>"` in modo che il dominio non riceva un campo da un tipo sbagliato.

**Evidence (file:line):**
- `ElementoEditor.tsx:159-233` — corpo di `handleSave`:
  - L163-170: parsing di `nascita`/`morte` via `parseDataStorica`, gated su `tipo === "personaggio"`.
  - L178-205: costruzione di `date` (`DataTemporale`) via `parseDataStorica` per `tipo === "evento"` (puntuale) o `tipo === "periodo"` (range). Una sola convenzione: se un lato del range è parsed ma l'altro no, il range **non** viene costruito (L202 `if (inizioParsed !== undefined && fineParsed !== undefined)`), evitando di inviare range parziali al domain.
  - L207-233: chiamata `normalizeElementoInput(...)` con payload completo:
    - L215 `nascita: tipo === "personaggio" ? nascitaParsed : undefined`
    - L216 `morte: tipo === "personaggio" ? morteParsed : undefined`
    - L217 `date,` (costruito sopra solo per evento/periodo; undefined altrimenti)
    - L218 `tribu: tipo === "personaggio" ? (state.tribu || undefined) : undefined`
    - L219-225 `ruoli: tipo === "personaggio" ? split+trim+filter : undefined`
    - L226 `fazioni: tipo === "guerra" ? ... : undefined`
    - L227 `esito: tipo === "guerra" ? ... : undefined`
    - L228-229 `statoProfezia: tipo === "profezia" ? ... : undefined`
    - L230-231 `dettagliRegno: tipo === "regno" ? ... : undefined`
    - L232 `regione: tipo === "luogo" ? ... : undefined`
- `elemento.rules.ts:8-26` — `ElementoInput` ora ha le 7 colonne tipo-specifiche + `nascita`/`morte`/`date` (già esistenti); è letteralmente possibile passare ogni campo che lo state editor cattura.
- `elemento.rules.ts:28-44` — `NormalizedElementoInput` mirrored (le 10 colonne esistono anche nel tipo di ritorno).
- `elemento.rules.ts:163-178` — il corpo di `normalizeElementoInput` forwarda tutti e 10 i campi nell'output (trimmando le stringhe; `""` → `undefined`).

**Domain-side defensive gate:** le 6 consistency branches in `elemento.rules.ts:131-148` rifiutano i campi tipo-specifici su tipi sbagliati via `{ type: "tipo_specifico_non_ammesso" }`. Questo chiude il goal anche sul lato domain: anche se una futura wiring bypassasse il gate UI, il domain blocca.

**Verdict:** VERIFIED. ✓

### Sub-claim (c): anni invalidi → `data_non_valida` esposto in UI

Questo era il punto più severo del gap originale ("ulteriore prova che il ramo 'campi tipo-specifici' non è esercitato end-to-end").

**Expected:** Se l'utente digita un anno non parsabile (es. "abc", "-1", "0", "1.5") in uno dei campi anno dell'editor, il risultato deve essere `data_non_valida` visibile nell'UI (non silenziosamente ignorato).

**Evidence (file:line):**
- `ElementoEditor.tsx:101-110` — `parseDataStorica(annoStr, era)`:
  - L105 trim dell'input
  - L106 stringa vuota → `undefined` (significa "campo non impostato", non invalido — corretto per campi opzionali)
  - L107 `Number(trimmed)` → `L108 if (!Number.isInteger(anno) || anno <= 0) return INVALID_DATA` — rigetta NaN, decimali, zero, negativi
  - L109 caso valido → `{ anno, era, precisione: "esatta" }`
- `ElementoEditor.tsx:101-102` — sentinel `const INVALID_DATA = Symbol("INVALID_DATA")` + `type ParseResult = DataStorica | undefined | typeof INVALID_DATA` — 3 stati distinti (absent, valid, invalid-user-input) per distinguere "campo non compilato" da "valore inseribile ma invalido".
- `ElementoEditor.tsx:172-175` — se `nascitaParsed === INVALID_DATA || morteParsed === INVALID_DATA`, `handleSave` setta `errors._form = ERROR_MESSAGES.data_non_valida` e **ritorna subito** (non chiama `normalizeElementoInput`). Stesso pattern a L181-184 per `eventoAnno`/`eventoEra` e L197-200 per `periodoInizio/Fine`.
- `ElementoEditor.tsx:114-125` — `ERROR_MESSAGES.data_non_valida = "Data non valida"` (copre tutte e 10 le variant di `ElementoError`).
- `ElementoEditor.tsx:298-303` — il branch di rendering del form error: `{errors._form && (<p className="text-xs text-red-600" role="alert">{errors._form}</p>)}`. L'`role="alert"` assicura che lo screen reader annunci l'errore; il `className="text-red-600"` lo rende visivamente evidente.
- **Domain fallback test:** anche se `parseDataStorica` fosse bypassato e `handleSave` inviasse una `DataStorica` con `anno: NaN` direttamente a `normalizeElementoInput`, il domain ritorna `err({ type: "data_non_valida" })` (verificato da `elemento.rules.ts:155-161` + `validateDataStorica` in `value-objects.ts:32-50`). L'`else`-case a `ElementoEditor.tsx:240-247` gestisce il ritorno dominio mappando `error.type` → messaggio e settando `errors._form`, quindi il branch dominio è comunque reachable dall'UI.

**Test pinning this behavior:** `elemento.rules.test.ts:115-123` — `"rejects a personaggio with an invalid nascita year (NaN) as data_non_valida"`:
```ts
const result = normalizeElementoInput({
  titolo: "Abraamo",
  tipo: "personaggio",
  nascita: { anno: Number.NaN, era: "aev", precisione: "esatta" },
});
expect(result.isErr()).toBe(true);
if (result.isErr()) expect(result.error.type).toBe("data_non_valida");
```
+ rules.test.ts:145-158 pin anche il `range_order` case per `periodo`.

**Verdict:** VERIFIED. ✓

### Artifacts Level 1-4 (from 02-02 must_haves)

| Artifact | Expected shape | Level 1 (exists) | Level 2 (substantive) | Level 3 (wired) | Level 4 (data flows) | Status |
|----------|----------------|------------------|----------------------|-----------------|---------------------|--------|
| `src/features/elemento/elemento.rules.ts` | ElementoInput/NormalizedElementoInput estesi + 6 consistency check + forwarding | ✓ (277 righe) | ✓ (tribu?+ruoli?+fazioni?+esito?+statoProfezia?+dettagliRegno?+regione? presenti L19-25) | ✓ (importato da ElementoEditor.tsx L29) | ✓ (13 test su normalizeElementoInput coprono happy + rejection + date validation) | VERIFIED |
| `src/features/elemento/elemento.errors.ts` | `tipo_specifico_non_ammesso` variant aggiunta | ✓ (12 righe) | ✓ (variant presente L11) | ✓ (usato in elemento.rules.ts L132/135/138/141/144/147 e in ElementoEditor.tsx L117 ERROR_MESSAGES) | ✓ (pinned da 6/6 rules-test rejection branches) | VERIFIED |
| `src/ui/workspace-home/ElementoEditor.tsx` | Switch esaustivo 8/8 + sub-componenti EventoFields/PeriodoFields/AnnotazioneFields + parseDataStorica + handleSave completo + ERROR_MESSAGES completo | ✓ (667 righe) | ✓ (tutti i sub-componenti + dispatcher + INVALID_DATA sentinel presenti) | ✓ (importato da DetailPane.tsx L52 e FullscreenOverlay.tsx L25; montato condizionalmente in entrambi) | ✓ (state flows UI→handleSave→normalizeElementoInput; prototipo mock non persiste ma il contratto chiama il domain con payload completo) | VERIFIED |
| `src/features/elemento/__tests__/elemento.rules.test.ts` | ≥8 test Vitest | ✓ (159 righe) | ✓ (13 test cases: 2 shared + 7 tipo/field + 4 date validation) | ✓ (importa `normalizeElementoInput` da @/features/elemento/elemento.rules) | ✓ (tutti i 13 test passano, exit 0) | VERIFIED |

### Key Links Verification

| From | To | Via | Status |
|------|----|----|--------|
| `ElementoEditor.handleSave` | `normalizeElementoInput` | import L29 + chiamata L207-233 con payload che include tribu/ruoli/fazioni/esito/statoProfezia/dettagliRegno/regione/nascita/morte/date | WIRED (pattern `normalizeElementoInput\([^)]*(tribu\|nascita\|morte\|date\|fazioni\|esito\|statoProfezia\|dettagliRegno\|regione)` matches on L207+L215-232) |
| `ElementoEditor.renderTypeSpecificFields switch(tipo)` | `const _exhaustive: never = tipo` | switch esaustivo con default branch che assegna `tipo` a `never` | WIRED (match su L662) |
| `DetailPane` | `ElementoEditor` | import L52 + render condizionale L363-367 `{isEditing ? <ElementoEditor element={selectedElement}/> : <DetailBody .../>}` | WIRED |
| `FullscreenOverlay` | `ElementoEditor` | import L25 + render condizionale L102 | WIRED |
| `ActionToolbar` Modifica button | `startEditing` | onPress={startEditing} L356 (DetailPane) e L94 (FullscreenOverlay via onModifica) | WIRED |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compiles cleanly | `npx tsc --noEmit` | exit 0, no output | PASS |
| Full test suite passes | `npx vitest run` | 3 files, 68 tests passed, exit 0 | PASS |
| New domain tests pass | `npx vitest run src/features/elemento/__tests__/elemento.rules.test.ts` | 1 file, 13 tests passed, exit 0 | PASS |
| Grep: 8/8 exhaustive branches on ElementoTipo | `rg 'case "(evento\|periodo\|annotazione)":' ElementoEditor.tsx` | 3 matches (L655, L657, L659) | PASS |
| Grep: exhaustiveness compile-time guard | `rg '_exhaustive: never = tipo' ElementoEditor.tsx` | 1 code match L662 + 1 comment L637 | PASS |
| Grep: tipo_specifico_non_ammesso branches in rules | `rg 'tipo_specifico_non_ammesso' elemento.rules.ts` | 6 matches (L132, L135, L138, L141, L144, L147) | PASS |
| Grep: ElementoInput has type-specific fields | `rg 'tribu\?:' elemento.rules.ts` | 2 matches (L19 input + L37 normalized) | PASS |
| Grep: handleSave forwards type-specific fields | `rg 'nascita:\|morte:\|tribu:\|fazioni:\|esito:\|statoProfezia:\|dettagliRegno:\|regione:' ElementoEditor.tsx` handleSave body | 10 matches (L215-232) | PASS |
| Regression: display-helpers annotation tests | `vitest run src/ui/workspace-home/__tests__/display-helpers.test.ts` (as part of full suite) | all pass (50 tests in file, 4 annotation-specific) | PASS |
| Claimed commits exist | `git log --all --oneline | grep -E 'fe720a6\|ab0c8c7\|...'` | fe720a6, ab0c8c7, 1a06681, 7c51f6f, 9729291, 261f8be, 5c7ce57, 7ad06e7 all present | PASS |

**Note on test count discrepancy:** `02-02-SUMMARY.md` reports "123 tests passing (110 baseline + 13 new)". Direct measurement here gives **68 tests passing, not 123**. The actual breakdown is:
- `src/mock/__tests__/data.test.ts` — 5 tests
- `src/ui/workspace-home/__tests__/display-helpers.test.ts` — 50 tests
- `src/features/elemento/__tests__/elemento.rules.test.ts` — 13 tests
- **Total: 68**

The 110-baseline figure in the SUMMARY is stale (likely leftover from a different branch state or a mis-recollection). This does **not** affect the goal verdict: tsc=0, vitest=0, all 13 new rules tests pin the new contract, and all regression tests (annotation helpers + soft-delete filter helpers) continue to pass. The count claim should be corrected in a follow-up housekeeping note, but it is not a functional failure.

## Truth 2 — Annotazioni mie/altrui nel detail (regression check)

**Previously passed.** Quick regression check after 02-02 landed.

**Evidence (file:line):**
- `display-helpers.ts:22` — `CURRENT_AUTORE = "utente-corrente"` invariato.
- `display-helpers.ts:279-293` — `getAnnotazioniForElement(elementId, currentAutore)` invariato, filtra ELEMENTI per `tipo === "annotazione"` + `link.some(l => l.targetId === elementId)`, split `mie` (autore === currentAutore) vs `altreCount`.
- `DetailPane.tsx:49-50` — import di `getAnnotazioniForElement` + `CURRENT_AUTORE` invariato.
- `DetailPane.tsx:156` — chiamata `getAnnotazioniForElement(element.id as string, CURRENT_AUTORE)`.
- `DetailPane.tsx:216-264` — sezione Annotazioni nel `DetailBody` con:
  - L216 visibile solo se `mie.length > 0 || altreCount > 0` (hidden quando entrambi 0)
  - L223-242 `mie.map(ann => <button onClick={() => selectElement(ann.id)}>…</button>)` — click-to-navigate
  - L243-250 `{altreCount > 0 && <span>{altreCount} {altreCount === 1 ? "annotazione altrui" : "annotazioni altrui"}</span>}` — pluralizzazione
  - L251-260 CTA disabilitato `<Button variant="ghost" isDisabled>+ Aggiungi annotazione</Button>` quando `mie.length === 0 && altreCount > 0`.
- `display-helpers.test.ts` — i 4 test annotazioni (Abraamo, Esodo, profeziaIsaia53, Isacco) passano tutti (verificato in verbose output sopra).

**Verdict:** VERIFIED (nessuna regressione rispetto a v1). ✓

## Truth 3 — Soft delete con toast Annulla 30s (regression check)

**Previously passed.** Quick regression check after 02-02 landed.

**Evidence (file:line):**
- `workspace-ui-store.ts:26-27` — `deletedElementIds: string[]` invariato.
- `workspace-ui-store.ts:65-73` — `softDeleteElement(id)` invariato: aggiunge id a `deletedElementIds`, clear selection, exit editing + fullscreen.
- `workspace-ui-store.ts:79-85` — `restoreElement(id)` invariato: rimuove id da `deletedElementIds` + re-seleziona.
- `DetailPane.tsx:64-76` — `handleSoftDelete(element)` invariato, cattura `titolo + id` **prima** della mutazione, chiama `softDeleteElement`, poi `toast(..., { timeout: 30_000, actionProps: { children: "Annulla", onPress: () => restoreElement(elementId) } })`.
- `DetailPane.tsx:357` — `ActionToolbar onDelete={() => handleSoftDelete(selectedElement)}` wired.
- `FullscreenOverlay.tsx:24` — `import { ActionToolbar, DetailBody, handleSoftDelete } from "./DetailPane"` — condivide l'helper.
- `FullscreenOverlay.tsx:95` — `onDelete={() => handleSoftDelete(selectedElement)}` wired.
- `WorkspacePreviewPage.tsx:28` — `<Toast.Provider placement="bottom" />` montato al livello shell.
- `ListPane.tsx:47` — `const deletedElementIds = useValue(workspaceUi$.deletedElementIds)`.
- `ListPane.tsx:53` — `getElementsForView(currentView, filterText, activeTipo, deletedElementIds)` — filter wired.
- `display-helpers.ts:116-149` — `getElementsForView` accetta `deletedIds: readonly string[] = []`, filtra prima di text/tipo.
- `display-helpers.test.ts` — i 6 test soft-delete passano tutti.

**Grep confirmation:**
- `rg 'timeout.*30_?000' DetailPane.tsx` → match unico su L69.
- `rg '<Toast.Provider' WorkspacePreviewPage.tsx` → match su L28 con `placement="bottom"`.

**Verdict:** VERIFIED (nessuna regressione rispetto a v1). ✓

## Known gaps (non blocking — not part of goal property 1)

Questi sono segnalati dal `02-REVIEW.md` v2 come warning post-plan e confermati qui dalla lettura del codice. **Nessuno di essi è un fallimento della goal property S02**: la goal property 1 chiede che l'editor mostri campi tipo-specifici, forwardi i campi al normalize, e esponga errori di parsing in UI — e tutto questo è verificato. I warning sotto sono difetti di robustezza da chiudere in una milestone successiva (M003 Jazz wiring o M004 polish), non da bloccare la chiusura della phase.

1. **WR-01 (review v2) — `date` non ha tipo-ownership gate nel domain layer.**
   - File: `elemento.rules.ts:120-178`.
   - Status: unreachable dall'editor (handleSave costruisce `date` solo per `evento`/`periodo`, vedi L178-205 di ElementoEditor), ma è un buco difensivo: un futuro caller (Jazz adapter, paste flow) potrebbe passare `{ tipo: "personaggio", date: ... }` e il domain accetterebbe. Le altre 6 tipo-ownership branch esistono, `date` è l'eccezione.
   - Fix raccomandato: aggiungere `if (input.date && input.tipo !== "evento" && input.tipo !== "periodo") return err({ type: "tipo_specifico_non_ammesso" })` come 7ª consistency branch. Opzionalmente un kind↔tipo check (puntuale solo su evento, range solo su periodo).
   - Impact on goal: nessuno (editor path non lo tocca).

2. **WR-02 (review v2) — `initState` stampa `statoProfezia = "futura"` anche quando il sorgente è undefined.**
   - File: `ElementoEditor.tsx:83`.
   - Status: footgun data-contamination per il futuro wiring M003. Nel prototipo mock-data non persiste, quindi oggi è invisibile. Aprire l'editor su una profezia con `statoProfezia` undefined → `initState` lo seeda a `"futura"` → `handleSave` forwarda `"futura"` a `normalizeElementoInput`. Fatal nel giorno in cui Jazz round-trippa.
   - Fix raccomandato: `initState` usa `el.statoProfezia ?? ""` e `EditorState.statoProfezia` typed come `"adempiuta" | "in corso" | "futura" | ""`. Il Select HeroUI con `selectedKey=""` non mostra alcuna selezione — UX corretta per un campo non ancora impostato.
   - Impact on goal: nessuno (il goal chiede "editor mostra campi tipo-specifici", non "editor preserva `undefined` nel round-trip"). Ma è esattamente la stessa classe di bug che 02-02 doveva chiudere, invertita di segno.

3. **WR-03 (review v2) — `elemento.rules.test.ts` pinna 2/6 rejection branches.**
   - File: `src/features/elemento/__tests__/elemento.rules.test.ts:34-112`.
   - Status: il file ha 13 test ma copre il rejection path solo per `nascita on evento` (L59-67) e `tribu on guerra` (L49-57). Le altre 4 rejection branches (`fazioni/esito` on non-guerra, `statoProfezia` on non-profezia, `dettagliRegno` on non-regno, `regione` on non-luogo) sono verificate solo nel happy path.
   - Fix raccomandato: aggiungere un `it.each` di 6-8 rejection case + 3 boundary-year case (anno 0, anno -1, anno 2.5) + 1 trimming case.
   - Impact on goal: nessuno (il goal chiede "anni invalidi → data_non_valida"; questo è già pinnato da 1 test NaN + 1 test range_order).

4. **Housekeeping — test count nel 02-02-SUMMARY.md è stale (123 vs 68).**
   - Correzione da fare durante `/gsd-audit-milestone` o una PR di cleanup: aggiornare il SUMMARY a 68 test (5+50+13). Non blocca la phase.

## Requirements Coverage

Nessun requirement ID è mappato esplicitamente a S02 nel REQUIREMENTS.md:
- `requirements: []` in `02-01-SUMMARY.md` frontmatter
- `requirements: []` in `02-02-PLAN.md` frontmatter
- Gli ID presenti in REQUIREMENTS.md (R031-R034) sono tutti `deferred: M004`

Quindi la verifica dei requirements = verifica delle 3 goal properties sopra. Nessun requirement orfano.

## Anti-Patterns Scan (from 02-REVIEW.md v2, categorised for closure priority)

Tutti gli anti-pattern identificati dal review v2 sono stati consultati e classificati sopra sotto "Known gaps (non blocking)". Zero blocker trovati nella re-verifica goal-backward. I 3 warning (WR-01, WR-02, WR-03) sono difetti di robustezza / pin-the-contract gap che non rompono la goal property.

## Human Verification Required

Nessun item richiede verifica umana obbligatoria per chiudere la phase:
- T1: dimostrato da codice statico + test domain + ispezione dispatcher.
- T2: invariato da 02-01, già verificato.
- T3: invariato da 02-01, già verificato.

Un'ispezione visuale iPad-native (click Modifica su "Diluvio" → confermare che appare il TextField "Anno"; digitare "abc" → confermare che appare "Data non valida" in rosso) rimane **raccomandata ma non bloccante**. La verifica statica chiude il goal in modo sufficiente.

## Gaps Summary

**Nessun gap bloccante.** La phase S02 ha consegnato tutte e tre le goal properties end-to-end:

1. **Editor inline con campi tipo-specifici (truth 1)** — coverage completa 8/8 ElementoTipo con exhaustiveness-check compile-time, handleSave forwarda tutti i 10 campi tipo-specifici a `normalizeElementoInput` (gated per tipo owner), anni invalidi producono `data_non_valida` visibile in UI via `errors._form` + `role="alert"`. Il gap originale (3 rami tipo mancanti + handleSave che scarta tutto + ElementoInput che non aveva le colonne) è chiuso su tutti e tre i livelli (UI, contratto input, contratto output, test). Il review v2 ha flaggato 3 warning (WR-01/02/03) ma nessuno è nella critical path della goal property.

2. **Annotazioni mie/altrui (truth 2)** — nessuna regressione da 02-01. La sezione Annotazioni è ancora renderizzata in `DetailBody` con split mie/altrui, click-to-navigate, pluralizzazione, CTA disabilitato quando solo altrui, hidden quando zero.

3. **Soft delete con toast 30s (truth 3)** — nessuna regressione da 02-01. `handleSoftDelete` esportato da `DetailPane`, condiviso con `FullscreenOverlay`, timeout 30_000, Toast.Provider montato in WorkspacePreviewPage, ListPane filtra deletedIds via `getElementsForView`.

## Recommendation

**Status: verified (3/3). Phase S02 può essere chiusa.**

Suggerimenti per M002 closure:
- I 3 warning (WR-01, WR-02, WR-03) vanno trattati durante `/gsd-plan-milestone-gaps` come "milestone-level polish" — WR-01 è il più importante (chiusura del gate difensivo del domain), WR-02 il più user-visible (data contamination quando M003 wirà Jazz), WR-03 il più mechanico.
- Housekeeping: correggere il test count nel `02-02-SUMMARY.md` da "123" a "68".
- Next action: `/gsd-next` dovrebbe routare su S03 (Fonti e link editor inline) che può dipendere sul contratto `ElementoInput` esteso da 02-02 senza fighting.

---

*Verified: 2026-04-13T13:20:00Z*
*Verifier: Claude (gsd-verifier)*
*Method: goal-backward, grep + static reading + test execution*
*Verification commands: `npx tsc --noEmit` (exit 0), `npx vitest run` (exit 0, 68/68 tests passing across 3 files)*
