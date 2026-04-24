# M007: Polish & Refinement

**Vision:** Rifinire il prototipo M001 a qualità iPad-native prima di investire nel cloud sync (M002). Sostituire linguaggio tecnico con italiano di dominio, layout fullheight, warning solo per validità reale, notification center iPad-native con rollback (sostituisce completamente il toast invasivo), inline success feedback su field con peso, a11y baseline, audit Jazz reale. M007 viene eseguito prima di M002 via depends_on di M002.

## Success Criteria

- App senza termini tecnici (markdown, panel, toast, field) nella UI visibile
- Layout occupa 100% viewport su iPad 1180x820 e 820x1180
- Warning solo per validità reale
- Blur senza modifica non emette notifica
- Inline success feedback su field con peso
- Bell+drawer sostituisce il toast; rollback su tutte le mutazioni
- Keyboard nav 3-pane con focus ring WCAG AA
- Audit Jazz 4 scenari documentati
- ui-ux-pro-max finale passata

## Slices

- [x] **S01: S01** `risk:low` `depends:[]`
  > After this: App su iPad 1180x820 e 820x1180 non mostra più markdown/panel/toast/field; root/FullscreenOverlay/DetailPane 100% viewport senza scroll esterno

- [x] **S02: S02** `risk:low` `depends:[]`
  > After this: Elemento minimale (solo titolo) non genera warning; data malformata o link a elemento soft-deleted genera warning inline

- [x] **S03: S03** `risk:medium` `depends:[]`
  > After this: Blur descrizione senza cambio non emette nulla; con cambio check fade-out 1.5s; chip tag check inline; select check accanto trigger

- [x] **S04: S04** `risk:high` `depends:[]`
  > After this: Click bell apre drawer da destra con lista create/update/delete di elementi/link/board/fonti; rollback funzionante; badge pulse+bell bounce su nuova entry; nessun toast residuo

- [ ] **S05: S05** `risk:medium` `depends:[]`
  > After this: Tab-nav sidebar->list->detail con focus ring visibile; ogni icon-only etichettato; prefers-reduced-motion disabilita animazioni; rg 'transition-all' zero

- [ ] **S06: Audit Jazz reale con 4 scenari browser** `risk:high` `depends:[S04]`
  > After this: S06-RESEARCH.md con 4 scenari + verdict + evidenza: reload dopo 5 mutazioni, 2 tab propagano, offline+modifica+online resync, sync:'never' confermato

- [ ] **S07: Revisione ui-ux-pro-max finale + integrated proof** `risk:medium` `depends:[S02,S03,S04,S05,S06]`
  > After this: Skill eseguita, report salvato; blocker risolti, non-blocker in KNOWLEDGE.md; screenshot prima/dopo (linguaggio, fullheight, notification center, inline success, a11y) in S07-SUMMARY.md

## Boundary Map

## Boundary Map

### S01 → S02, S03, S05
Produces:
- UI senza termini tecnici (stringhe italiane di dominio)
- Root layout fullheight (h-screen/dvh) propagato a FullscreenOverlay e DetailPane
- Classi Tailwind uniformi per altezza container

Consumes: nothing (leaf)

### S02 → S07
Produces:
- `elemento.rules.ts` warning policy: solo validità reale
- Helper `computeValidityWarnings(elemento)` (data malformata, referenze rotte)

Consumes from S01: stringhe dominio per testi warning

### S03 → S04
Produces:
- `src/ui/workspace-home/useFieldStatus.ts` — hook `useFieldStatus(value, onCommit): { status, onFocus, onBlur }` con confronto prev/next
- Convenzione inline success: Input/Textarea endContent, Chip inline replace, Select accanto trigger, Date inline
- Callback `onCommit(prev, next)` invocata SOLO se prev !== next

Consumes from S01: stringhe dominio per messaggi status

### S04 → S06, S07
Produces:
- `src/ui/workspace-home/notifications-store.ts` — Legend State observable con API:
  - `notifyMutation(type, target, undoFn): NotificaId`
  - `rollback(id): Result<void, RollbackError>`
  - `markRead(id)`, `clearAll()`
- Tipo `Notifica` discriminated union `{ type: 'create'|'update'|'delete', target, ts, undone, undoFn }`
- `<NotificationBell />` per toolbar
- `<NotificationDrawer />` HeroUI placement=right
- Hook `useNotifications(): { unreadCount, entries, rollback }`
- Rimozione di ogni Toast; soft-delete chiama `notifyMutation('delete', ..., restoreFn)`

Consumes from S03: `useFieldStatus` onCommit per emettere `notifyMutation` su update reale

### S05 → S07
Produces:
- Pattern keyboard nav e focus management nel 3-pane
- Convenzione aria-label su icon-only button
- Pattern animazioni opacity/transform con reset per prefers-reduced-motion

Consumes from S01: layout fullheight stabile come base per focus management

### S06 → S07, M002
Produces:
- `S06-RESEARCH.md` con 4 scenari Jazz documentati + verdict + evidenza
- Fix in-scope applicati a schema/adapter Jazz
- Lista blocker propagata al CONTEXT M002

Consumes from S04: notification center come canale per errori sync/persistence emersi

### S07 (integrated proof)
Consumes da tutti gli upstream.
Produces:
- Report `ui-ux-pro-max`
- Screenshot comparativo prima/dopo
- M002 CONTEXT frontmatter con `depends_on: [M007]`
