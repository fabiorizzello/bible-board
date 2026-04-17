# Phase 02: editor-annotazioni - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Chiudere R005 dentro S02 rifattorizzando l'editor elemento da mode-swap a inline per-campo app-native, preservando il contract già consegnato in `ElementoInput` / `normalizeElementoInput`, mantenendo annotazioni e soft delete esistenti, e usando il mockup unificato come fonte primaria delle decisioni UX/UI del plan `02-03`.

</domain>

<decisions>
## Implementation Decisions

### Canonical design source
- **D-01:** `src/ui/mockups/UnifiedEditorMockup.tsx` è il riferimento primario per il replan e l'implementazione di R005.
- **D-02:** Gli sketch/mockup precedenti restano riferimenti di supporto e rationale storico; non sono più fonti concorrenti quando divergono dal mockup unificato.

### Plan 02-03 scope
- **D-03:** Il plan `02-03` deve mappare direttamente tutto ciò che il mockup unificato copre per R005: paradigma inline per-campo, struttura detail non tabellare, primitive di edit coerenti, drawer per edit complessi, Milkdown per descrizione, add-field flow unificato, soft validation e review flow collegato.
- **D-04:** Il plan `02-03` deve escludere esplicitamente ciò che il mockup unificato marca fuori scope per S03+; in particolare fonti/catalogo fonti non vanno assorbite dentro R005.

### Realignment delta after first implementation pass
- **D-07:** Se l'implementazione reale diverge dal `UnifiedEditorMockup.tsx`, il mockup vince. Non basta conservare il comportamento funzionale: gerarchia visiva, shell del detail e interaction model devono riallinearsi 1:1 al riferimento canonico.
- **D-08:** Il riallineamento deve rimuovere la toolbar separata e riportare le azioni al layout del mockup: header integrato, warning/review badge, metadata chips come primo layer operativo, sezioni array leggere e `+ Aggiungi campo` nello stesso linguaggio del body canonico.
- **D-09:** Il riallineamento non riapre il perimetro di S03. Fonti/catalogo fonti e qualsiasi editor avanzato oltre il mockup unificato restano fuori scope anche durante il fix-up visuale/comportamentale.

### Dev-only mockups lifecycle
- **D-05:** I mockup dev-only restano disponibili fino a fine milestone M002 come riferimento e supporto review.
- **D-06:** Il cleanup delle route/mockup non è parte obbligatoria di `02-03`; potrà essere pianificato dopo che l'editor reale avrà assorbito il comportamento necessario.

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
- Il replan deve rendere esplicita la mappatura tra decisioni consolidate degli sketch precedenti e pezzi implementativi del codice reale.
- I mockup restano consultabili fino a fine milestone, quindi il plan può trattarli come supporto review durante l'implementazione.
- Il nuovo plan di riallineamento deve esplicitare che i problemi osservati sono: toolbar separata non presente nel mockup, shell troppo form-like, sezioni array troppo pesanti, e `+ Aggiungi campo` non abbastanza integrato nel body canonico.

</specifics>

<deferred>
## Deferred Ideas

- Cleanup/retirement delle route mockup dev-only dopo assorbimento completo nell'editor reale — da valutare a fine M002 o in fase successiva.
- Qualsiasi estensione delle fonti oltre il placeholder/out-of-scope già marcato nel mockup unificato resta in S03 e non rientra in `02-03`.

</deferred>

---

*Phase: 02-editor-annotazioni*
*Context gathered: 2026-04-17*
