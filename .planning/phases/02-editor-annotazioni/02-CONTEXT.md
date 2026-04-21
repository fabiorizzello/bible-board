# Phase 02: editor-annotazioni - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Chiudere R005 dentro S02 riallineando l'editor reale al `UnifiedEditorMockup`: da mode-swap a inline per-campo app-native, con la stessa gerarchia del detail, le stesse superfici di edit e lo stesso commit model visibile. Il refactor deve preservare il contract già consegnato in `ElementoInput` / `normalizeElementoInput`, mantenere annotazioni e soft delete esistenti, e trattare il mockup unificato come fonte primaria delle decisioni UX/UI del replan di Phase 02.

</domain>

<decisions>
## Implementation Decisions

### Canonical design source
- **D-01:** `src/ui/mockups/UnifiedEditorMockup.tsx` è il riferimento primario per il replan e l'implementazione di R005.
- **D-02:** Gli sketch/mockup precedenti restano riferimenti di supporto e rationale storico; non sono più fonti concorrenti quando divergono dal mockup unificato.

### Phase 02 realignment scope
- **D-03:** La fase 02 va rieseguita partendo dal delta tra implementazione reale e `UnifiedEditorMockup.tsx`, non dal vecchio `02-03` come se fosse gia sufficiente. Il mockup definisce il risultato atteso di R005.
- **D-04:** Il replan di Phase 02 deve mappare direttamente tutto cio che il mockup unificato copre per R005: paradigma inline per-campo, struttura detail non tabellare, primitive di edit coerenti, drawer per edit complessi, Milkdown per descrizione, add-field flow unificato, soft validation e review flow collegato.
- **D-05:** Il replan deve escludere esplicitamente cio che il mockup unificato marca fuori scope per S03+; in particolare fonti/catalogo fonti non vanno assorbite dentro R005.
- **D-05b:** `src/ui/workspace-home/ElementoEditor.tsx` nella sua forma attuale non va rifinito incrementalmente. Va tolto come editor mode-swap corrente e riscritto sulla base del `UnifiedEditorMockup`, estraendo solo le primitive e i behavior che servono al nuovo detail inline.

### Interaction contract extracted from the unified mockup
- **D-06:** Se l'implementazione reale diverge dal `UnifiedEditorMockup.tsx`, il mockup vince. Non basta conservare il comportamento funzionale: gerarchia visiva, shell del detail e interaction model devono riallinearsi 1:1 al riferimento canonico.
- **D-07:** Il commit model di R005 e `blur-to-save + toast undo` per field edit. Il rollback deve ripristinare solo il campo toccato, non resettare l'intero elemento o riaprire un form globale.
- **D-08:** Le superfici di edit sono bloccate dal mockup: titolo inline; `tipo`, `origine` e `tribu` tramite `Popover`; `vita`, review warnings, aggiunta collegamenti e `+ Aggiungi campo` tramite right `Drawer`; `descrizione` con Milkdown lazy-mount nel body.
- **D-09:** La soft validation e passiva e non bloccante: warning inline sui chip, badge nel header e review drawer. `Origine` e `Tribu` restano stringhe rapide in S02 ma devono segnalare chiaramente la possibile promozione futura a elementi collegati.
- **D-10:** L'header reale deve essere compatto e integrato: titolo editable a sinistra, review/warning badge e overflow actions a destra, senza toolbar separata ne save/cancel mode a livello pagina.
- **D-11:** La prima riga operativa del body e la metadata chip row (`tipo`, `vita`, `origine`, `tribu`). Subito sotto: `descrizione` full-width come blocco principale; poi sezioni leggere per `ruoli`, `tags`, collegamenti familiari e collegamenti generici.
- **D-12:** L'add flow e duplice ma unificato: ingressi locali nelle sezioni array (`+ ruolo`, `+ tag`, `+ familiare`, `+ collegamento`) e `+ Aggiungi campo` globale che apre categorie/azioni compatibili con S02. Le entry locali devono saltare la selezione categoria se il contesto la rende ovvia.
- **D-13:** La densita visuale deve seguire il linguaggio Linear/Notion del mockup: chip compatti e body leggero, ma i trigger primari devono mantenere target touch `>= 44px`.
- **D-14:** Il riallineamento non riapre il perimetro di S03. Fonti/catalogo fonti e qualsiasi editor avanzato oltre il mockup unificato restano fuori scope anche durante il fix-up visuale/comportamentale.

### Dev-only mockups lifecycle
- **D-15:** I mockup dev-only restano disponibili fino a fine milestone M002 come riferimento e supporto review.
- **D-16:** Il cleanup delle route/mockup non e parte obbligatoria del replan di Phase 02; potra essere pianificato dopo che l'editor reale avra assorbito il comportamento necessario.

### the agent's Discretion
- Tradurre il mockup unificato in task implementativi concreti, purché il comportamento visibile resti allineato alle decisioni sopra.
- Scegliere l'ordine di assorbimento dei sotto-pattern nel codice reale, purché il plan mantenga una traccia esplicita mockup → implementazione.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase contract
- `.planning/ROADMAP.md` — goal canonico di Phase 02 / S02 e boundary del lavoro.
- `.planning/REQUIREMENTS.md` — requirement `R005` e sua collocazione dentro S02.
- `.planning/STATE.md` — stato milestone corrente, fold-back di S02.1 dentro S02 e aspettativa di creare `02-03`.

### R005 design canon
- `src/ui/mockups/UnifiedEditorMockup.tsx` — integrazione canonica finale di tutte le decisioni UX/UI per R005.
- `src/ui/mockups/MockupsIndex.tsx` — indice del set R005 e dichiarazione esplicita dello sketch 9 come synthesis/integration.
- `.planning/phases/02-editor-annotazioni/sketches/index.html` — archivio sketch originale e overview delle decisioni consolidate.

### Current implementation to refactor
- `src/ui/workspace-home/ElementoEditor.tsx` — editor attuale mode-swap da sostituire con paradigma inline per-campo.
- `src/ui/workspace-home/workspace-ui-store.ts` — stato UI corrente (`isEditing`, soft delete, fullscreen) da evolvere coerentemente con il nuovo flow.
- `src/ui/workspace-home/DetailPane.tsx` — entrypoint principale del detail pane, toolbar e body sections da riallineare al nuovo layout/editor.
- `src/ui/workspace-home/FullscreenOverlay.tsx` — variante fullscreen che oggi riusa `ElementoEditor` e deve restare coerente col refactor.
- `src/app/router.tsx` — route dev-only dei mockup, utile per mantenere disponibile il riferimento durante M002.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/ui/mockups/UnifiedEditorMockup.tsx`: contiene già la sintesi comportamentale da cui derivare il breakdown del plan `02-03`.
- `src/ui/workspace-home/DetailPane.tsx` / `FullscreenOverlay.tsx`: shell detail/fullscreen già integrate con toolbar, sezioni e soft delete.
- `src/ui/workspace-home/workspace-ui-store.ts`: store condiviso per selection, fullscreen, edit state e soft-delete undo flow.
- `src/features/elemento/elemento.rules.ts` e model correlati: contract dominio già esteso in `02-02` e da preservare durante il refactor UX.

### Established Patterns
- HeroUI v3 compositional APIs e Tailwind tokens di progetto sono il linguaggio UI stabilito.
- Il dominio `Elemento` e `normalizeElementoInput` sono il boundary difensivo; il refactor R005 non deve riaprire il contratto già verificato in `02-02`.
- I mockup React under `src/ui/mockups/` sono artefatti dev-only ma già allineati al design language reale del progetto.

### Integration Points
- L'implementazione reale di R005 entra principalmente da `DetailPane`, `FullscreenOverlay`, `ElementoEditor` e `workspace-ui-store`.
- Il routing dev-only dei mockup passa da `src/app/router.tsx`; va preservato per tutta M002 secondo la decisione di lifecycle sopra.
- Dopo `02-03`, il nuovo punto di integrazione critico è il delta tra `src/ui/workspace-home/ElementoEditor.tsx` e il blocco `UnifiedDetailPane` del mockup: eventuali fix successivi devono trattare quel confronto come checklist primaria.

</code_context>

<specifics>
## Specific Ideas

- Il mockup unificato non è una variante da confrontare ma la sintesi canonica da seguire.
- Il replan di Phase 02 deve rendere esplicita la mappatura tra decisioni consolidate degli sketch precedenti, `UnifiedEditorMockup.tsx` e pezzi implementativi del codice reale.
- I mockup restano consultabili fino a fine milestone, quindi il plan può trattarli come supporto review durante l'implementazione.
- Il nuovo plan di riallineamento deve esplicitare che i problemi osservati sono: toolbar separata non presente nel mockup, shell troppo form-like, sezioni array troppo pesanti, e `+ Aggiungi campo` non abbastanza integrato nel body canonico.
- `ElementoEditor.tsx` non va considerato una base affidabile da rifinire schermata per schermata: il plan deve assumere sostituzione/riscrittura guidata dal mockup unificato, conservando solo il contract di dominio e le integrazioni ancora utili.

### Visual contract extracted from the unified mockup

- Header compatto e integrato: titolo inline-editable a sinistra, review/warning badge e overflow actions a destra, senza barra strumenti separata.
- Prima riga di contenuto = metadata chips operativi (`tipo`, `vita`, `origine`, `tribù`) con affordance già visibili, non una form section collapsata o save/cancel mode.
- Gerarchia del body: `descrizione` come blocco principale full-width; sotto, sezioni leggere per `ruoli`, `tags`, collegamenti familiari e collegamenti generici.
- Primitive di edit coerenti: `Popover` per edit rapidi/scalari, right `Drawer` per edit composti o multi-step, Milkdown lazy-mount per `descrizione`.
- Add flow duplice ma unificato: piccoli ingressi locali nelle sezioni array + un `+ Aggiungi campo` globale nello stesso linguaggio visivo del body.
- Soft validation passiva: segnali inline sui chip, badge nel header e drawer review; il feedback non deve bloccare il commit.
- Densità iPad-native: chips compatti in stile Linear/Notion, ma i trigger primari devono conservare touch target `>= 44px`.
- Ogni modifica visibile passa dal medesimo commit pattern e condivide il toast undo; il sistema non deve avere percorsi speciali con save/cancel globali.
- `Blur`, click outside, `Esc`, `X` e close-on-outside per `Drawer`/`Popover` fanno parte del comportamento contrattuale del mockup, non di una scelta accessoria.
- `Origine` e `Tribù` sono volutamente stringhe veloci con warning soft e hint di promozione futura a collegamenti di workspace.
- La descrizione non è una textarea di form: quando inattiva è prose markdown, quando attiva monta Milkdown in lazy mode e torna subito al body normale al commit.
- I collegamenti vanno presentati in due gruppi distinti, `famiglia` e `generico`, con affordance e label coerenti al gruppo.
- Il `+ Aggiungi campo` globale è una porta di discovery per i campi supportati da S02; non deve aprire il perimetro di S03 né nascondere le entry locali.

</specifics>

<deferred>
## Deferred Ideas

- Cleanup/retirement delle route mockup dev-only dopo assorbimento completo nell'editor reale — da valutare a fine M002 o in fase successiva.
- Qualsiasi estensione delle fonti oltre il placeholder/out-of-scope già marcato nel mockup unificato resta in S03 e non rientra in `02-03`.

</deferred>

---

*Phase: 02-editor-annotazioni*
*Context gathered: 2026-04-18*
