# Phase 02: editor-annotazioni - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17T22:11:18+02:00
**Phase:** 02-editor-annotazioni
**Areas discussed:** Gerarchia dei riferimenti, Perimetro del plan 02-03, Lifecycle dei mockup dev-only

---

## Gerarchia dei riferimenti

| Option | Description | Selected |
|--------|-------------|----------|
| Unified primary | `UnifiedEditorMockup.tsx` diventa il riferimento primario, gli altri sketch restano supporto storico | ✓ |
| Equal-weight refs | Tutti gli sketch restano riferimenti equivalenti durante il plan | |

**User's choice:** Come suggerito: usare il mockup unificato come riferimento primario.
**Notes:** La discussione precedente aveva già preparato questa opzione come raccomandata per il replan di R005.

---

## Perimetro del plan 02-03

| Option | Description | Selected |
|--------|-------------|----------|
| Direct mockup mapping | Il plan implementa tutto ciò che il mockup unificato copre per R005 ed esclude ciò che il mockup marca fuori scope | ✓ |
| Partial adoption | Il plan recepisce solo una parte del mockup unificato e rinvia altre decisioni | |

**User's choice:** Come suggerito: adottare il perimetro completo del mockup unificato per R005.
**Notes:** Va mantenuta la separazione con S03, soprattutto per fonti/catalogo fonti.

---

## Lifecycle dei mockup dev-only

| Option | Description | Selected |
|--------|-------------|----------|
| Keep through milestone | Tenere i mockup dev-only fino a fine milestone M002 | ✓ |
| Cleanup in 02-03 | Includere nel plan `02-03` anche il cleanup delle route/mockup assorbiti | |

**User's choice:** Come suggerito: tenerli fino a fine milestone.
**Notes:** Il cleanup potrà essere affrontato dopo che l'editor reale avrà assorbito il comportamento necessario.

---

## the agent's Discretion

- Organizzare il plan `02-03` in modo che la mappatura mockup unificato → task implementativi sia esplicita e verificabile.

---

**Date:** 2026-04-18T12:00:00+02:00
**Phase:** 02-editor-annotazioni
**Areas discussed:** Riallineamento completo di S02 al unified mockup, contratto di interazione, specifiche da bloccare nel contesto

## Riallineamento della fase 02 al mockup unificato

**User's direction:** La fase 02 non e ancora allineata al mockup; bisogna raccogliere le specifiche definite nel unified mockup, elencarle nella fase 02 come contratto esplicito e poi rieseguire la fase.

**Captured outcome:** `02-CONTEXT.md` aggiornato per trattare `src/ui/mockups/UnifiedEditorMockup.tsx` come contratto operativo completo di R005, non solo come riferimento visivo generico.

## Specifiche bloccate nel contesto

- `blur-to-save + toast undo` come commit model unico per ogni field edit.
- Boundary delle superfici di edit bloccato: inline title, `Popover` per scalar/meta rapidi, right `Drawer` per Vita/review/add flows, Milkdown lazy nel body.
- Gerarchia reale del detail bloccata: header integrato, metadata chip row, descrizione prose-first, sezioni array leggere, add-flow locale + globale.
- Warning non bloccanti per `Origine` e `Tribu`, con review drawer dedicato.
- Collegamenti distinti in `famiglia` e `generico`.
- L'`ElementoEditor` attuale va rimosso come base del flusso corrente e riscritto sulla base del `UnifiedEditorMockup`, non raffinato incrementalmente.
- Scope S03 escluso esplicitamente anche durante il riallineamento.

## Deferred Ideas

- Cleanup delle route/mockup dev-only dopo M002.
- Qualsiasi lavoro sulle fonti oltre i placeholder R005 resta in S03.
