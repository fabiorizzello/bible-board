---
phase: 02-editor-annotazioni
goal: "Click Modifica → editor inline con campi tipo-specifici. Annotazioni mie/altrui nel detail. Soft delete con toast Annulla 30s."
verified: 2026-04-13T12:05:00Z
verified_at: 2026-04-13T12:05:00Z
status: gaps_found
score: 2/3 must-haves verified
must_haves_total: 3
must_haves_verified: 2
overrides_applied: 0
re_verification: null
gaps:
  - truth: "Click Modifica → editor inline con campi tipo-specifici (per ogni ElementoTipo, con persistenza del dato digitato)"
    status: partial
    reason: |
      Il pulsante Modifica si aggancia correttamente a startEditing e DetailPane/FullscreenOverlay
      mostrano ElementoEditor inline, ma l'editor (1) non renderizza alcun campo tipo-specifico per
      evento, periodo, annotazione (3 delle 8 varianti di ElementoTipo) e (2) per le 5 varianti che
      hanno campi tipo-specifici, handleSave costruisce l'input di normalizeElementoInput usando solo
      titolo/descrizione/tags/tipo: tutti i campi tipo-specifici presenti nello stato locale
      (nascitaAnno, nascitaEra, morteAnno, morteEra, tribu, ruoli, fazioni, esito, statoProfezia,
      dettagliRegno, regione) vengono silenziosamente scartati alla pressione di Salva. Anche se la
      slice è mock-data e non persiste nulla, normalizeElementoInput è l'unico punto di
      validazione/contratto per questi campi, quindi non riceverli rompe il contratto
      "editor con campi tipo-specifici": il form accetta input che vengono buttati via, senza
      segnalazione all'utente. Per di più le due date (nascitaAnno, morteAnno) non vengono mai
      parsate in DataStorica, quindi un anno invalido come "abc" non produce mai l'errore
      data_non_valida che il registro ERROR_MESSAGES dell'editor registra — ulteriore prova che
      il ramo "campi tipo-specifici" non è esercitato end-to-end.
    artifacts:
      - path: "src/ui/workspace-home/ElementoEditor.tsx"
        issue: "handleSave passa a normalizeElementoInput solo titolo/descrizione/tags/tipo; i rami per evento/periodo/annotazione non esistono (no EventoFields, no PeriodoFields, no AnnotazioneFields)"
    missing:
      - "Branch evento/periodo/annotazione in ElementoEditor con campi data (DataTemporale puntuale o range) o fallback esplicito '(Nessun campo aggiuntivo per questo tipo)' con exhaustiveness-check su ElementoTipo"
      - "handleSave che costruisce e passa a normalizeElementoInput anche nascita/morte (per personaggio) via parser DataStorica, coprendo il ramo data_non_valida"
      - "Decisione esplicita su come rappresentare tribu, ruoli, fazioni, esito, statoProfezia, dettagliRegno, regione nel contratto input dell'editor: o estendere ElementoInput con questi campi, o documentare nel codice che il prototipo volutamente li ignora (commento TODO + link a S-futuro/FUTURE.md) così da non silenziare dati utente senza segnali"
deferred: []
human_verification: []
---

# Phase 02: Editor inline, annotazioni, soft delete — Verification Report

**Phase Goal:** Click Modifica → editor inline con campi tipo-specifici. Annotazioni mie/altrui nel detail. Soft delete con toast Annulla 30s.
**Verified:** 2026-04-13T12:05:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

The phase goal has three independent properties; each is treated as an observable truth to verify against the code.

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Click Modifica → editor inline con campi tipo-specifici per ogni ElementoTipo (con persistenza/validazione del dato digitato) | FAILED (partial) | Editor si monta inline, ma copre solo 5/8 tipi e scarta silenziosamente tutti i campi tipo-specifici al Salva |
| 2 | Annotazioni mie/altrui nel detail | VERIFIED | DetailBody mostra una sezione Annotazioni con le annotazioni dell'utente corrente (click-to-navigate) e il count di annotazioni altrui, con CTA "+ Aggiungi annotazione" disabilitato quando solo altrui |
| 3 | Soft delete con toast Annulla 30s | VERIFIED | Elimina → softDeleteElement + toast con timeout 30_000 + actionProps "Annulla" → restoreElement; Toast.Provider montato in WorkspacePreviewPage; getElementsForView filtra deletedIds; DetailPane e FullscreenOverlay condividono l'helper handleSoftDelete |

**Score:** 2/3 truths verified

### Deferred Items

Nessun item rinviato a una slice successiva: S03 (Fonti e link editor inline) riguarda fonti/link, non completa l'editor tipo-specifico. L'unico punto di chiusura naturale per WR-01/WR-02 resta dentro S02 stesso o una slice di re-planning dedicata.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/ui/workspace-home/ElementoEditor.tsx` | Inline editor con shared + type-specific fields per 8 ElementoTipo, che persiste/valida i campi tipo-specifici tramite normalizeElementoInput | STUB (partial) | File esiste (410 righe, sostanziale), monta shared fields, renderizza 5 gruppi tipo-specifici (PersonaggioFields, GuerraFields, ProfeziaFields, RegnoFields, LuogoFields), ma handleSave passa solo 4 campi a normalizeElementoInput e 3 rami tipo mancano del tutto (evento, periodo, annotazione) |
| `src/ui/workspace-home/workspace-ui-store.ts` | isEditing + startEditing/stopEditing + deletedElementIds + softDeleteElement/restoreElement/finalizeDelete | VERIFIED | Tutti i field + 5 azioni presenti; softDeleteElement esce da edit/fullscreen; restoreElement re-seleziona l'id |
| `src/ui/workspace-home/display-helpers.ts` | CURRENT_AUTORE + getAnnotazioniForElement + getElementsForView con parametro opzionale deletedIds | VERIFIED | Funzione + costante esportate, getElementsForView accetta `deletedIds: readonly string[] = []` e filtra prima di testo/tipo |
| `src/ui/workspace-home/DetailPane.tsx` | Conditional ElementoEditor vs DetailBody, Annotazioni section, ActionToolbar.onDelete, exported handleSoftDelete helper | VERIFIED | DetailPane mostra ElementoEditor quando isEditing, nasconde ActionToolbar in edit mode, aggancia handleSoftDelete a onDelete del dropdown; DetailBody include la sezione Annotazioni tra Fonti e Board |
| `src/ui/workspace-home/FullscreenOverlay.tsx` | Edit mode mirror + shared handleSoftDelete | VERIFIED | Importa handleSoftDelete da DetailPane, mostra ElementoEditor in edit mode, passa onDelete all'ActionToolbar |
| `src/ui/workspace-home/ListPane.tsx` | Filtra deletedElementIds da getElementsForView | VERIFIED | Legge `deletedElementIds` dallo store e lo passa come 4° argomento a getElementsForView |
| `src/ui/workspace-home/WorkspacePreviewPage.tsx` | Toast.Provider montato al livello composition shell | VERIFIED | `<Toast.Provider placement="bottom" />` è l'ultimo figlio della shell — corretto per l'API HeroUI v3 (il plan diceva "bottom-center" ma quel literal non esiste nei tipi HeroUI v3; la deviazione è documentata nel SUMMARY ed è semanticamente equivalente) |
| `src/ui/workspace-home/__tests__/display-helpers.test.ts` | Test per getAnnotazioniForElement + soft-delete filter | VERIFIED | 4 test annotazioni + 6 test soft-delete, tutti passano (55 test totali) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `DetailPane.ActionToolbar` (Modifica button) | `workspace-ui-store.startEditing` | `onPress={startEditing}` in DetailPane.tsx:356 | WIRED | `isEditing` osservato da useValue → conditional render ElementoEditor |
| `FullscreenOverlay.ActionToolbar` (Modifica button) | `workspace-ui-store.startEditing` | `onModifica={startEditing}` in FullscreenOverlay.tsx:94 | WIRED | Mirror identico a DetailPane |
| `ElementoEditor.handleSave` | `normalizeElementoInput` | import + `.match(() => stopEditing(), (error) => setErrors(...))` | WIRED (shared only) | Chiama normalize correttamente ma NON forwarda nascita/morte/tribu/ruoli/fazioni/esito/statoProfezia/dettagliRegno/regione → la wiring è presente ma il payload è incompleto (vedi gap #1) |
| `DetailBody` (Annotazioni section) | `getAnnotazioniForElement` + `selectElement` | import + call + button onClick → selectElement(ann.id) | WIRED | Click su annotazione naviga via selectElement → detail mostra l'annotazione |
| `ActionToolbar` dropdown "delete" | `handleSoftDelete` → `softDeleteElement` + `toast` | Dropdown.Menu onAction → onDelete → handleSoftDelete(element) in DetailPane.tsx:64-76 | WIRED | Cattura titolo+id PRIMA di chiamare softDeleteElement (evita null durante closure) |
| `handleSoftDelete` toast action "Annulla" | `restoreElement` | `actionProps.onPress: () => restoreElement(elementId)` | WIRED | restoreElement rimuove l'id da deletedElementIds e riseleziona l'elemento |
| `ListPane` rendering | `deletedElementIds` filter | `getElementsForView(currentView, filterText, activeTipo, deletedElementIds)` | WIRED | Tests deterministici confermano baseline-minus-1 dopo soft delete |
| `WorkspacePreviewPage` | `Toast.Provider` | `<Toast.Provider placement="bottom" />` ultimo figlio della shell | WIRED | Garantisce che toast() imperative da qualsiasi pane renderizzi nel region condiviso |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| DetailBody Annotazioni section | `annotazioni` (AnnotazioniResult) | `getAnnotazioniForElement(element.id, CURRENT_AUTORE)` → filtra `ELEMENTI` mock | Sì — i dati mock contengono 3 elementi di tipo annotazione con autore utente-corrente/utente-altro e link verso Abraamo/Esodo/profeziaIsaia53 | FLOWING |
| ElementoEditor (shared fields) | `state` (EditorState) | `useState(() => initState(element))` inizializzato dai campi dell'Elemento mock | Sì — initState legge tutti i campi; UI mostra i valori | FLOWING (read-only) |
| ElementoEditor (type-specific fields) | `state.nascitaAnno`, `state.tribu`, `state.fazioni`, … | `useState` iniziale + input onChange che aggiornano lo state locale | Sì in ingresso (UI → state) ma l'output di handleSave ignora tutti questi field — la "presa" esiste ma non porta a nulla | HOLLOW (input raccolto, output scartato) |
| ListPane element list | `currentElements` | `getElementsForView(...)` che legge `ELEMENTI` filtrando deletedIds | Sì — 9 elementi mock, filtri reali | FLOWING |
| Toast "undo" | `elementId` + `titolo` catturati prima di softDeleteElement | closure locale in handleSoftDelete | Sì — il test T03 ha verificato che restoreElement riporta l'elemento nel list | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Typecheck del codice modificato | `npx tsc --noEmit` | exit 0 | PASS |
| Test suite (domain + display helpers) | `npx vitest run` | 2 files, 55 test passati | PASS |
| Grep: timeout toast 30s | pattern `timeout.*30_?000` | match unico in `DetailPane.tsx:69` | PASS |
| Grep: ElementoEditor coverage 8/8 tipi | pattern `tipo === "(evento|periodo|annotazione)"` in ElementoEditor.tsx | 0 match | FAIL → contribuisce al gap #1 |
| Grep: handleSave forwarda nascita/morte | pattern `nascita:` + `morte:` dentro handleSave | 0 match | FAIL → contribuisce al gap #1 |
| Git commits T03 esistono | `git log 1a06681 7c51f6f 9729291 261f8be 5c7ce57` | tutti presenti con messaggi corretti | PASS |

Nota: un'esecuzione visuale nel browser (click Modifica su un evento come "Diluvio" → conferma che l'editor mostra solo titolo/descrizione/tag e nessun date picker, oppure click Modifica su "Abraamo" → digitare una tribù e premere Salva → verificare che il contenuto non è persistito) sarebbe una conferma umana utile, ma WR-01 e WR-02 sono già dimostrati dal codice statico, quindi non sono riportati sotto "Human Verification".

### Requirements Coverage

Nessun requirement ID esplicito è collegato a questa phase (`phase_req_ids: null` e `REQUIREMENTS.md` non mappa nulla a S02 attivamente: i soli ID presenti — R031/032/033/034 — sono tutti `deferred` a M004). Verifica requirement = verifica delle tre goal properties sopra.

### Anti-Patterns Found

| File | Linee | Pattern | Severity | Impatto |
|------|-------|---------|----------|---------|
| `ElementoEditor.tsx` | 114-139 | handleSave costruisce payload parziale, scarta stato tipo-specifico | Blocker (rispetto alla goal property 1) | Dati utente silenziosamente persi su Salva per 9 campi tipo-specifici |
| `ElementoEditor.tsx` | 185-192 | Manca branch discriminated-union per 3/8 varianti di ElementoTipo, niente exhaustiveness-check | Blocker (rispetto alla goal property 1) | Editor per evento/periodo/annotazione non mostra alcun campo tipo-specifico |
| `ElementoEditor.tsx` | 246-280, 346-350 | Cast `as "aev" \| "ev"` / `String(key)` senza guard su null RAC | Warning | Se l'utente cancella la selezione via tastiera, lo store riceve la stringa "null" — bug reale, non bloccante per la goal property ma fragile |
| `ElementoEditor.tsx` | 77-80 | `ERROR_MESSAGES` copre solo 2 variant di ElementoError su 9 | Warning | Messaggi generici "Errore di validazione" per tutte le altre variant — paper-cut UX |
| `ElementoEditor.tsx` | 98-112, 194-198 | Branch `_form` error rimane visibile dopo field edit | Info | Minor UX, non blocca il goal |
| `ElementoEditor.tsx` | 204 | `variant="primary"` non esiste in HeroUI v3 Button variants | Warning | Stile arriva dai className inline (bg-accent); il type-check non lo blocca ma la variant è ignorata |
| `workspace-ui-store.ts` | 92-97, 28 | `finalizeDelete` dichiarata ma chiamata da nessuno; `lastModified` inizializzato ma mai letto/scritto | Info | Dead code/stub; IN-01 e IN-02 in REVIEW |
| `ListPane.tsx` | 167-178 | Composite key parser con split su primo `-` | Warning | Fragile con id Jazz (`co_z…` ok oggi, ma senza garanzia) |
| `display-helpers.ts` | 96-105, 224-237 | OR semantics su tags+tipi nei board dinamici | Warning | Contratto v1 non ancora deciso; fuori scope S02 ma impatta S04 |

### Human Verification Required

Nessun item richiede verifica umana obbligatoria: le due goal property verificate (Annotazioni, Soft delete) sono dimostrate da codice + test, e il gap sulla goal property 1 è determinato da analisi statica (grep + lettura del source). Un'ispezione visuale iPad-native rimane utile ma non cambia l'esito.

### Gaps Summary

Il phase ha consegnato 2 delle 3 goal properties con qualità alta:

- **Annotazioni mie/altrui nel detail** (truth #2) — Completamente consegnato. `getAnnotazioniForElement` è testato con 4 casi (Abraamo = 1 mia, Esodo = 1 altra, profeziaIsaia53 = 1 mia, Isacco = 0/0), DetailBody monta la sezione con click-to-navigate, count singolare/plurale, CTA disabilitato quando solo altrui, sezione nascosta quando zero. Layout coerente con hierarchy Fonti → Annotazioni → Board.

- **Soft delete con toast Annulla 30s** (truth #3) — Completamente consegnato. Lo store ha `deletedElementIds` + 3 azioni (softDelete/restore/finalize), `getElementsForView` filtra con test di regressione deterministici (6 test nuovi), l'helper condiviso `handleSoftDelete` cattura titolo+id prima della mutazione (evita null durante la closure del toast), il toast ha `timeout: 30_000`, actionProps "Annulla" → restoreElement, e `Toast.Provider` è montato al livello shell. `softDeleteElement` correttamente esce da edit-mode + fullscreen, e `restoreElement` riseleziona l'id per l'UX iPad-native. Deviazione `placement="bottom"` vs "bottom-center" è giustificata dal typing HeroUI v3.

Il gap è concentrato sulla goal property 1 (editor inline con campi tipo-specifici), dove due warning già tracciati nel REVIEW (WR-01 e WR-02) convergono su una conclusione unica: **il ramo "campi tipo-specifici" dell'editor è renderizzato solo parzialmente e non esercitato end-to-end**.

- **Coverage incompleta** (WR-02): `ElementoTipo` ha 8 variant (`personaggio | guerra | profezia | regno | periodo | luogo | evento | annotazione`) ma `ElementoEditor` rende gruppi tipo-specifici solo per 5 di queste (personaggio, guerra, profezia, regno, luogo). Selezionare un `evento` (es. "Diluvio" che è visibilmente presente nella list) e premere Modifica produce un editor con solo titolo/descrizione/tag e nessun modo di editare la data — l'utente vede "editabile" un elemento che di fatto non lo è. Stesso per `periodo` e `annotazione`. Il Principio V-bis della Constitution chiede discriminated-union exhaustive invece di if/else, con compile-time guard `const _exhaustive: never = tipo`.

- **Contratto di save dichiarativamente incompleto** (WR-01): anche per le 5 variant che renderizzano campi tipo-specifici, `handleSave` passa a `normalizeElementoInput` solo `titolo`, `descrizione`, `tags`, `tipo`. Tutti gli 11 field aggiuntivi dello `EditorState` (`nascitaAnno`, `nascitaEra`, `morteAnno`, `morteEra`, `tribu`, `ruoli`, `fazioni`, `esito`, `statoProfezia`, `dettagliRegno`, `regione`) sono letti dall'UI ma non passano mai per il normalize. Questo ha due implicazioni:
  1. Il ramo di errore `data_non_valida` registrato in `ERROR_MESSAGES` non è mai raggiungibile, perché le stringhe nascitaAnno/morteAnno non vengono mai convertite in `DataStorica` né validate.
  2. L'editor "dice" all'utente che può modificare la tribù di Abraamo, ma il dato tipo-specifico va perso al Save senza nessun segnale — peggiore di un campo `readonly` perché camuffato da campo scrivibile.

**Valutazione rispetto alla minimum contract del goal**: il ROADMAP parla di "editor inline con campi tipo-specifici", e la slice è esplicitamente mock-data (immutable). Un'interpretazione minima sarebbe *"mostra i campi tipo-specifici"*, e in quell'interpretazione WR-01 potrebbe essere accettato come "persistenza rinviata". Ma WR-02 fa cadere anche quell'interpretazione: per evento/periodo/annotazione non vengono mostrati affatto. L'unione delle due rende la goal property 1 *partial* a qualsiasi soglia ragionevole.

Inoltre, il tipo `ElementoInput` in `elemento.rules.ts` non ha i field `tribu/ruoli/fazioni/esito/statoProfezia/dettagliRegno/regione`: il dominio letteralmente non sa come validare questi dati, quindi la slice avrebbe dovuto o (a) estendere il dominio e il rules layer, o (b) chiudere via override/TODO documentato che il prototipo ignora intenzionalmente questi campi. Nessuna delle due è stata fatta, il che lascia un footgun per la futura wiring con Jazz.

**Consiglio di chiusura**: il gap è meccanicamente piccolo (una patch a `handleSave` + 3 branch tipo mancanti + eventualmente estensione di `ElementoInput` o TODO esplicito con commento) e va chiuso dentro S02 con un plan `--gaps` mirato, oppure documentato in OVERRIDES.md come intentional deviation con motivazione "prototipo mock-data, persistenza type-specific rinviata a S-futuro quando Jazz sarà wired". La scelta è un gate di escalation per l'utente: correggere o accettare esplicitamente.

---

*Verified: 2026-04-13T12:05:00Z*
*Verifier: Claude (gsd-verifier)*
