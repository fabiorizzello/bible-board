# S07: Polish iPad-native e UAT finale — UAT

**Milestone:** M001
**Written:** 2026-04-23T12:24:50.465Z

# S07 UAT — Polish iPad-native e UAT finale

## Preconditions
- App in esecuzione su iPad 10.9" (o Chrome DevTools a 1180×820) con DemoAuth
- Dark mode e light mode entrambi testati
- Workspace con almeno 3 elementi (uno con fonti, uno con link, uno timeline-posizionabile)

## Scenario 1 — Sidebar collapse/expand (animazione)

1. Apri l'app, la sidebar è visibile (220px)
2. Tappa il bottone "chiudi sidebar"
3. **Atteso**: la sidebar scompare SENZA scorrere/animare il width — il contenuto semplicemente fades out (opacity), il layout collassa istantaneamente
4. Tappa per riaprire
5. **Atteso**: sidebar riappare con fade-in opacity, nessun reflow visible
6. Ripeti con `prefers-reduced-motion: reduce` attivo nelle preferenze accessibilità
7. **Atteso**: nessuna animazione — la sidebar appare/scompare istantaneamente

## Scenario 2 — List pane collapse/expand (fullscreen)

1. Seleziona un elemento dalla lista
2. Tappa "espandi" per aprire il fullscreen overlay
3. **Atteso**: fullscreen appare con slide-up + fade (opacity + translateY) — nessun width/height animato
4. Tappa "indietro" o "minimizza"
5. **Atteso**: overlay scompare con fade-out, nessun jank

## Scenario 3 — Touch target audit manuale

Per ogni elemento interattivo sotto, tap singolo e verifica risposta:
- **Sidebar**: bottone "+" nuova board, bottone settings in footer, bottone chiudi sidebar, ogni board row, ogni nav item (Recenti / Tutti)
  - **Atteso**: ogni tap registrato a prima toccata, nessun "miss"
- **List pane**: toggle lista/timeline, bottone filtro tag, bottone ordinamento, bottone "+" nuovo elemento, bottone riapri sidebar
  - **Atteso**: tutti responsivi al primo tap
- **ThemeSwitcher**: bottone palette (trigger), bottone sole/luna nel popover
  - **Atteso**: entrambi rispondono al primo tap
- **Timeline popup**: bottone "Apri scheda"
  - **Atteso**: tap registrato, apre il fullscreen detail

## Scenario 4 — Nessun chrome superfluo

1. Naviga nell'app senza selezionare un elemento
2. **Atteso**: nessun breadcrumb (profondità ≤2), nessun footer decorativo, nessun placeholder illustrato
3. Seleziona un elemento con solo titolo (nessuna fonte, nessun link, nessuna annotazione)
4. **Atteso**: le sezioni vuote (Fonti, Link, Annotazioni) NON appaiono — sezione non renderizzata, zero spazio occupato

## Scenario 5 — UAT end-to-end (scenario completo)

1. Login con DemoAuth
2. Crea un nuovo elemento di tipo "personaggio" → titolo "Abraamo test"
3. Aggiungi una descrizione inline (click sul campo, tasta, blur-to-save)
4. Aggiungi una fonte di tipo "bibbia" → Genesi 12:1
5. Crea un link verso un altro elemento (tipo "correlato")
6. **Atteso**: link inverso appare automaticamente sull'elemento target
7. Crea una board dal sidebar → rinominala → aggiungila agli elementi filtrati
8. Apri la vista timeline → verifica card posizionata, popup su click, "Apri scheda" funzionante
9. Soft delete dell'elemento "Abraamo test" → toast "Annulla" appare → tappa Annulla
10. **Atteso**: elemento ripristinato, nessuna perdita dati
11. Ricarica la pagina (F5)
12. **Atteso**: tutti i dati persistiti (fonte, link, board) presenti dopo reload

## Edge cases

- **Gesto swipe back** (iOS Safari): naviga dal detail al list pane con swipe da bordo sinistro → l'app non combatte il gesto
- **Orientamento portrait**: sidebar diventa overlay slide-in, list pane full width
- **Connessione offline**: badge sync mostra "Offline", banner informativo appare, dati già caricati restano accessibili
