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

- [ ] **S04: Fonti e link editor inline** `risk:low` `depends:[S01,S03]`
  > After this: crea board da sidebar, rinomina inline, elimina con conferma, vista lista compatta con ordinamento, ricerca cross-view.

- [ ] **S05: Board CRUD e ricerca** `risk:medium` `depends:[S01,S03]`
  > After this: vista timeline con asse verticale SVG, card posizionate, zoom cambia scala, pan con drag, popup compatto su click card.

- [ ] **S06: Timeline D3 SVG con zoom/pan e popup** `risk:high` `depends:[S01,S05]`
  > After this: app completa che sembra iPad nativa, scenario UAT end-to-end passa.

- [ ] **S07: Polish iPad-native e UAT finale** `risk:low` `depends:[S01,S02,S03,S04,S05,S06]`
  > After this: App completa iPad-native, scenario UAT end-to-end PASS
