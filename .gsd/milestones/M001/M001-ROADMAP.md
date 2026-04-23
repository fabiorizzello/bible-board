# M001: M001: Prototipo completo su layout 3-pane consolidato

**Vision:** Costruire il prototipo completo partendo dal codice attuale: monolite WorkspacePreviewPage decomposto in componenti modulari, poi editor inline per-campo, fonti/link, board CRUD, timeline D3, polish iPad-native. Ogni slice consegna capacità user-visible con test.

## Success Criteria

- Layout 3-pane identico agli screenshot con dark mode e DemoAuth funzionante.
- Editor inline per-campo (no mode swap) sui 8 TipoElemento, annotazioni, soft delete.
- Fonti documentabili e link bidirezionali editabili inline.
- Board CRUD con ricerca cross-view.
- Timeline D3 SVG con zoom/pan e popup.
- Scenario UAT end-to-end PASS e app iPad-native.

## Slices

- [x] **S01: Recupero layout 3-pane consolidato con dark mode** `risk:medium` `depends:[]`
  > After this: sidebar + list pane con filtri tipo + detail con desc/fonti/link/board, dark mode con ThemeSwitcher FAB, DemoAuth funzionante. UAT PASS 2026-04-03.

- [x] **S02: S02** `risk:medium` `depends:[]`
  > After this: editor inline per-campo (editingFieldId sostituisce isEditing), 8 ElementoTipo con campi type-specific, Milkdown per descrizione, annotazioni mie/altrui, soft delete con toast Annulla 30s. R001-R004 verificati; R005 in corso via T05.

- [x] **S03: S03** `risk:high` `depends:[]`
  > After this: detail mostra fonti come link cliccabili raggruppati per tipo; editor link inline con selettore tipo e ruolo parentela.

- [x] **S04: S04** `risk:medium` `depends:[]`
  > After this: crea board da sidebar, rinomina inline, elimina con conferma, vista lista compatta con ordinamento, ricerca cross-view

- [x] **S05: S05** `risk:high` `depends:[]`
  > After this: vista timeline con asse verticale SVG, card posizionate, zoom cambia scala, pan con drag, popup compatto su click card

- [x] **S06: S06** `risk:high` `depends:[]`
  > After this: 

- [x] **S07: S07** `risk:low` `depends:[]`
  > After this: App completa iPad-native, scenario UAT end-to-end PASS

- [x] **S08: S08** `risk:high` `depends:[]`
  > After this: crea elemento, ricarica pagina, persiste; crea link padre A to B, inverso figlio appare su B senza intervento; fonti persistite per tipo sopravvivono al reload; DemoAuth con account Jazz locale
