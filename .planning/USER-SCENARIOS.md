# User Scenarios

> Documento autoritativo per gli scenari utente di Timeline Board.
> Sostituisce `specs/001-timeline-board-app/spec.md`.
> Aggiornato: 2026-03-30

## User Scenarios & Testing

### US-01 - Autenticazione e Onboarding (Priority: P0)

L'utente accede all'app per la prima volta. Il sistema lo autentica e crea automaticamente un workspace singolo. L'utente atterra sulla home del proprio workspace, pronto a lavorare.

**Why this priority**: Senza autenticazione e workspace, nulla funziona. E il prerequisito di tutto.

**Independent Test**: L'utente apre l'app per la prima volta, si autentica, e atterra sul workspace vuoto con istruzioni per iniziare.

**Acceptance Scenarios**:

1. **Given** un utente non autenticato, **When** apre l'app, **Then** viene presentato il flusso di autenticazione.
2. **Given** un utente autenticato per la prima volta, **When** completa l'autenticazione, **Then** il sistema crea automaticamente un workspace singolo e l'utente vi accede come home.
3. **Given** un utente gia autenticato, **When** riapre l'app, **Then** atterra direttamente sulla home del suo workspace.
4. **Given** un workspace vuoto, **When** l'utente atterra sulla home, **Then** vede un messaggio di benvenuto con indicazioni su come iniziare (creare il primo Elemento).

---

### US-02 - CRUD Elemento Base (Priority: P1)

L'utente crea, visualizza, modifica ed elimina Elementi nel workspace. Ogni Elemento ha un tipo (personaggio, guerra, profezia, regno, periodo, luogo, evento, annotazione) con titolo obbligatorio, note, e attributi specifici del tipo. Ogni Elemento ha al massimo una DataTemporale generale; inoltre gli Elementi di tipo personaggio possono avere due DataStorica dedicate per nascita e morte. Se un concetto richiede piu date autonome di altro tipo viene modellato come piu Elementi collegati. Le modifiche vengono salvate automaticamente.

**Why this priority**: Gli elementi sono il fondamento dell'app. Senza di essi non c'e nulla da visualizzare, collegare o studiare.

**Independent Test**: L'utente crea 5 elementi di tipi diversi, li modifica, ne visualizza il dettaglio completo, ne elimina uno verificando il flusso di conferma e undo.

**Acceptance Scenarios**:

1. **Given** un workspace, **When** l'utente crea un Elemento di tipo "personaggio" con titolo "Abraamo", **Then** l'Elemento viene salvato con il tipo e i suoi attributi specifici (nascita, morte, tribu, ruoli).
2. **Given** un workspace, **When** l'utente crea un Elemento di tipo "profezia" con titolo "Distruzione di Gerusalemme", **Then** l'Elemento viene salvato con attributo stato (attesa/adempiuta/parziale).
3. **Given** un Elemento esistente, **When** l'utente modifica il titolo o le note, **Then** le modifiche vengono salvate immediatamente (auto-save).
4. **Given** un Elemento, **When** l'utente apre il dettaglio, **Then** vede tutti i campi dell'Elemento con i suoi attributi tipo-specifici, link, tag, fonti, media e note.
5. **Given** un Elemento con 5 link verso altri elementi, **When** l'utente preme "Elimina", **Then** appare un dialog di conferma che mostra l'impatto ("Questo elemento ha 5 link che verranno rimossi").
6. **Given** il dialog di conferma eliminazione, **When** l'utente conferma, **Then** l'Elemento e i suoi link vengono rimossi e appare un toast con opzione "Annulla" per undo immediato.
7. **Given** un Elemento di tipo "luogo" con regione, **When** l'utente lo visualizza, **Then** vede gli attributi specifici del tipo (regione) oltre ai campi comuni.

---

### US-03 - Date Storiche (Priority: P1)

L'utente assegna date storiche agli Elementi. Le date supportano ere (a.e.v./e.v.), precisione variabile limitata a esatta o circa, e possono essere puntuali o range (inizio-fine). L'input parte sempre dall'anno e permette di scegliere il livello di dettaglio: solo anno, anno+mese, oppure anno+mese+giorno; il giorno e consentito solo dopo aver selezionato anche il mese. Le date determinano il posizionamento sulla timeline.

**Why this priority**: Le date sono il cuore della timeline. Senza date, gli elementi non possono essere posizionati temporalmente.

**Independent Test**: L'utente crea elementi con date di diversi tipi (puntuale esatta, puntuale circa, range) in entrambe le ere, e verifica che vengano salvate e visualizzate correttamente.

**Acceptance Scenarios**:

1. **Given** un Elemento, **When** l'utente inserisce una data puntuale "2018 a.e.v. circa", **Then** la data viene salvata con anno=2018, era=aev, precisione=circa.
2. **Given** un Elemento, **When** l'utente inserisce un range "1077-1037 a.e.v. esatta", **Then** vengono salvate due DataStorica (inizio e fine) con la precisione corretta.
3. **Given** un Elemento, **When** l'utente seleziona il dettaglio "anno + mese + giorno" e inserisce "14 Nisan 33 e.v.", **Then** la data viene salvata con anno=33, era=ev, mese e giorno popolati.
4. **Given** un Elemento con data range che attraversa ere (es. "100 a.e.v. - 50 e.v."), **Then** il sistema gestisce correttamente il passaggio tra ere.
5. **Given** un Elemento senza date, **Then** l'Elemento e valido ma non apparira sulla vista timeline (solo su lista, grafo, genealogia).

---

### US-04 - Tag Registry e Categorizzazione (Priority: P1)

L'utente organizza gli elementi tramite tag censiti nel workspace. I tag hanno un colore opzionale e possono essere collegati a un Elemento descrittivo (es. il tag "patriarchi" punta all'Elemento che descrive chi sono i patriarchi). I tag sono il meccanismo principale per la selezione dinamica nei Board.

**Why this priority**: I tag sono fondamentali per la selezione dinamica nei board e per il raggruppamento visuale nella timeline. Senza tag, i board dinamici non funzionano.

**Independent Test**: L'utente crea tag nel registry, li assegna a elementi, li modifica (colore, elemento descrittivo), e verifica che la selezione dinamica per tag funzioni.

**Acceptance Scenarios**:

1. **Given** un workspace, **When** l'utente assegna un tag "re" a un Elemento e il tag non esiste ancora, **Then** il tag viene automaticamente aggiunto al Tag Registry del workspace.
2. **Given** un Tag Registry con tag esistenti, **When** l'utente crea un Elemento e inizia a digitare un tag, **Then** il sistema suggerisce tag esistenti con autocompletamento.
3. **Given** un tag nel registry, **When** l'utente assegna un colore e un Elemento descrittivo al tag, **Then** il colore viene usato nella visualizzazione e l'Elemento descrittivo e navigabile dal tag.
4. **Given** un Elemento con 3 tag, **When** l'utente rimuove un tag dall'Elemento, **Then** il tag resta nel registry (non viene eliminato) ma non e piu associato a quell'Elemento.
5. **Given** un tag nel registry non usato da nessun Elemento, **Then** il tag resta nel registry — l'utente lo rimuove manualmente se vuole.

---

### US-05 - Link Bidirezionali tra Elementi (Priority: P1)

L'utente crea relazioni tipizzate tra Elementi. Quando crea un link da A verso B, il sistema crea automaticamente il link inverso da B verso A. I tipi di link disponibili sono: adempimento, causa-effetto, parallelo, successione, parentela, localizzazione, residenza, correlato.

**Why this priority**: I link sono il cuore dell'app come strumento di studio. Permettono di navigare il contesto di un evento, capire cause-effetti, e costruire la rete di conoscenza. Senza link, l'app e solo un database di schede.

**Independent Test**: L'utente crea link tra elementi di diversi tipi e verifica che i link inversi appaiano automaticamente. Naviga tra elementi collegati e verifica la coerenza. Elimina un link e verifica che l'inverso venga rimosso.

**Acceptance Scenarios**:

1. **Given** due Elementi "Abraamo" e "Isacco", **When** l'utente crea un link di tipo "parentela" con ruolo "padre" da Abraamo a Isacco, **Then** il sistema crea automaticamente il link inverso "parentela" con ruolo "figlio" da Isacco ad Abraamo.
2. **Given** un Elemento con link, **When** l'utente visualizza il dettaglio dell'Elemento, **Then** tutti i link sono visibili raggruppati per tipo, e ogni link e navigabile con un tocco.
3. **Given** un link bidirezionale esistente, **When** l'utente elimina il link da A verso B, **Then** anche il link inverso da B verso A viene eliminato automaticamente.
4. **Given** un link di tipo "causa-effetto" da "Esodo" a "Attraversamento Mar Rosso", **When** l'utente visualizza "Attraversamento Mar Rosso", **Then** vede il link inverso con etichetta appropriata (es. "causato da: Esodo").
5. **Given** un Elemento che viene eliminato, **Then** tutti i link che puntano a esso vengono rimossi automaticamente (cascade).

---

### US-06 - Fonti (Priority: P1)

L'utente aggiunge fonti informative agli Elementi. Cinque tipi: "bibbia" (riferimento biblico con URL WOL calcolata automaticamente), "articolo-wol" (URL diretto a wol.jw.org per articoli e pubblicazioni), "link" (URL generico con etichetta), "video" (video JW.org con mediaKey, sezione da/a, e metadata), "immagine" (allegato immagine, deferred). Le fonti documentano da dove proviene l'informazione. Ogni fonte puo avere un testo inline opzionale (citazione manuale) disponibile offline.

**Why this priority**: Le fonti sono essenziali per uno strumento di studio — ogni affermazione deve essere verificabile. Senza fonti, l'app e solo un elenco di opinioni.

**Independent Test**: L'utente aggiunge fonti di tipo bibbia, articolo-wol, link e video a un Elemento, verifica che i link WOL funzionino correttamente, e che le fonti siano visibili nel dettaglio ordinate per tipo.

**Acceptance Scenarios**:

1. **Given** un Elemento, **When** l'utente aggiunge una fonte di tipo "bibbia" con riferimento "Genesi 12:1-3", **Then** la fonte viene salvata e il sistema calcola automaticamente l'URL verso wol.jw.org.
2. **Given** un Elemento con fonte "bibbia", **When** l'utente tocca la fonte, **Then** il sistema apre il link calcolato verso wol.jw.org con il versetto corretto.
3. **Given** un Elemento, **When** l'utente aggiunge una fonte di tipo "articolo-wol" con URL wol.jw.org (articolo o pubblicazione), **Then** la fonte viene salvata con l'URL diretto e l'eventuale fragment `#h=` per range paragrafi.
4. **Given** un Elemento con fonte "articolo-wol", **When** l'utente tocca la fonte, **Then** il sistema apre il link wol.jw.org salvato.
5. **Given** un Elemento, **When** l'utente aggiunge una fonte di tipo "link" con URL e etichetta "Enciclopedia biblica, vol. 2", **Then** la fonte viene salvata con URL e etichetta.
6. **Given** un Elemento, **When** l'utente aggiunge una fonte di tipo "video" incollando un URL JW.org, **Then** il sistema estrae la naturalKey, risolve metadata via Mediator API (titolo, durata, thumbnail), e salva la fonte con i metadata cached.
7. **Given** un Elemento con fonte "video", **When** l'utente imposta la sezione da/a (mm:ss), **Then** la sezione viene salvata in secondi e validata (da < a, entrambi <= durata).
8. **Given** un Elemento con fonti di tipi diversi, **When** l'utente visualizza il dettaglio, **Then** le fonti sono ordinate per tipo (bibbia prima, poi articolo-wol, link, video) e poi per inserimento.

---

### US-07 - Media Immagini Offline (Priority: P2, deferred)

L'utente aggiunge immagini agli Elementi. Le immagini vengono salvate offline come blob nel dispositivo e sono visibili anche senza connessione. L'utente puo visualizzare lo spazio occupato e rimuovere immagini selettivamente. Video supportato come fonte (vedi US-06, US-18).

**Why this priority**: Le immagini arricchiscono lo studio (mappe, illustrazioni, diagrammi) ma non sono bloccanti per il flusso base. Il supporto video come FonteTipo e attivo tramite US-18.

**Independent Test**: L'utente aggiunge 3 immagini a un Elemento, va offline, verifica che siano visibili, rimuove un'immagine e controlla lo spazio liberato.

**Acceptance Scenarios**:

1. **Given** un Elemento, **When** l'utente aggiunge un'immagine, **Then** l'immagine viene salvata offline ed e visibile anche senza connessione.
2. **Given** un Elemento con immagini, **When** l'utente visualizza il dettaglio, **Then** le immagini sono mostrate con possibilita di zoom.
3. **Given** il workspace, **When** l'utente consulta lo spazio media, **Then** vede lo spazio totale occupato dalle immagini offline.
4. **Given** un Elemento con immagini, **When** l'utente rimuove un'immagine, **Then** il blob viene eliminato e lo spazio viene liberato.

---

### US-08 - Gestione Board (Priority: P2)

L'utente crea, rinomina, configura ed elimina Board nel workspace. Un Board seleziona un sottoinsieme di elementi tramite selezione fissa (lista manuale) o dinamica (filtro per date, tag, tipi). La creazione puo essere esplicita (nome + selezione) o implicita (da navigazione tra elementi). Ogni Board puo essere visualizzato in qualsiasi vista.

**Why this priority**: Il Board e l'astrazione di visualizzazione — senza di esso l'utente non puo organizzare viste sui propri dati.

**Independent Test**: L'utente crea un Board esplicito con selezione dinamica, ne crea uno implicito da navigazione, li rinomina, modifica i filtri, e ne elimina uno.

**Acceptance Scenarios**:

1. **Given** un workspace, **When** l'utente crea un Board con nome "Patriarchi" e selezione dinamica (tag: "patriarchi"), **Then** il Board viene creato e mostra gli elementi che matchano.
2. **Given** un Board con selezione dinamica, **When** un nuovo Elemento viene aggiunto al workspace che matcha i criteri del filtro, **Then** l'Elemento appare automaticamente nel Board.
3. **Given** un workspace, **When** l'utente crea un Board con selezione fissa, **Then** il Board nasce vuoto e l'utente puo aggiungere elementi manualmente.
4. **Given** l'utente ha navigato tra 4+ elementi tramite link (breadcrumb attivo), **When** seleziona "Salva come Board", **Then** viene creato un Board con selezione fissa contenente tutti gli elementi nel percorso di navigazione corrente.
5. **Given** un Board, **When** l'utente cambia vista (timeline, lista, grafo, genealogia), **Then** la vista cambia sugli stessi elementi e l'ultima vista usata viene memorizzata.
6. **Given** un Board esistente, **When** l'utente lo rinomina o modifica i criteri di selezione, **Then** le modifiche vengono salvate immediatamente.
7. **Given** un Board dinamico vuoto (filtro senza risultati), **Then** il Board mostra un messaggio informativo con suggerimento di ampliare i criteri.

---

### US-09 - Visualizzazione Timeline (Priority: P2)

L'utente visualizza un Board in modalita timeline: asse temporale verticale con rendering SVG, range bar per elementi con durata, sticky card per mantenere la visibilita durante lo scroll, e minimap rettangolare in basso a sinistra. La timeline puo essere configurata con tagGroups per separazione orizzontale e scala segmentata con densita variabile.

**Why this priority**: La timeline e la visualizzazione primaria dell'app e il motivo per cui l'utente la usa. Tuttavia dipende da elementi con date e tag (US-02, US-03, US-04).

**Independent Test**: L'utente passa alla vista timeline su un board, scrolla, interagisce con le card, usa la minimap, e configura tagGroups e scala.

**Acceptance Scenarios**:

1. **Given** un Board con selezione dinamica (tag: "patriarchi", era: "a.e.v."), **When** l'utente seleziona la vista "timeline", **Then** la timeline mostra solo gli elementi che matchano i criteri, ordinati cronologicamente sull'asse verticale.
2. **Given** un Board in vista timeline, **When** l'utente configura tagGroups (es. "re" a sinistra, "profeti" a destra), **Then** gli elementi vengono separati orizzontalmente per gruppo con i colori dei tag.
3. **Given** un Elemento con data range (es. "Regno di Davide: 1077-1037 a.e.v."), **When** viene visualizzato sulla timeline, **Then** appare come una range bar colorata con card fixed-height (~80px) che scorre lungo la barra durante lo scroll (sticky card).
4. **Given** una timeline con molti elementi, **When** l'utente scrolla, **Then** il rendering mantiene 60fps e la minimap in basso a sinistra mostra la posizione corrente con tempo (Y) e gruppi (X).
5. **Given** una timeline, **When** l'utente tocca un Elemento, **Then** si apre il dettaglio dell'Elemento con possibilita di navigare ai link correlati.
6. **Given** un Board in vista timeline, **When** l'utente configura la scala con segmenti personalizzati (es. densita maggiore per il periodo 1500-1000 a.e.v., tagli per periodi vuoti), **Then** la scala si adatta mostrando piu spazio dove serve e comprimendo i periodi vuoti.
7. **Given** un Elemento con precisione "circa", **When** viene visualizzato sulla timeline, **Then** appare con un indicatore visuale di incertezza.

---

### US-10 - Visualizzazione Lista (Priority: P2)

L'utente visualizza un Board in modalita lista tabellare, con ordinamento configurabile e colonne selezionabili.

**Why this priority**: La lista e la visualizzazione piu semplice e utile per gestione rapida e ordinamento. Complementa la timeline.

**Independent Test**: L'utente passa alla vista lista su un board, ordina per diversi campi, e naviga agli elementi.

**Acceptance Scenarios**:

1. **Given** un Board, **When** l'utente seleziona la vista "lista", **Then** gli elementi appaiono in una tabella con colonne configurabili (titolo, tipo, date, tag).
2. **Given** un Board in vista lista con 100+ elementi, **When** l'utente scrolla, **Then** la lista usa virtualizzazione per mantenere performance fluida.
3. **Given** un Board in vista lista, **When** l'utente tocca l'header di una colonna, **Then** la lista si riordina per quel campo (ascendente/discendente).
4. **Given** un Board in vista lista, **When** l'utente tocca un Elemento, **Then** si apre il dettaglio dell'Elemento.

---

### US-11 - Ricerca nel Board (Priority: P2)

L'utente cerca elementi all'interno del Board corrente. La ricerca e full-text (titolo, tag, note), testuale semplice e case-insensitive; una query vuota equivale a nessun filtro. Il comportamento si adatta alla vista attiva: in lista filtra le righe, in timeline evidenzia/filtra gli elementi, in grafo evidenzia i nodi, in genealogia evidenzia i nodi nell'albero.

**Why this priority**: Con centinaia di elementi, la ricerca e essenziale per l'usabilita quotidiana dello strumento di studio.

**Independent Test**: L'utente cerca "Abraamo" in vista lista (filtra righe), poi switcha a vista grafo (evidenzia nodo) sullo stesso Board, verificando che la ricerca si adatti.

**Acceptance Scenarios**:

1. **Given** un Board in vista lista con molti elementi, **When** l'utente digita "Abraamo" nella ricerca, **Then** la lista filtra mostrando solo gli elementi il cui titolo, tag o note contengono "Abraamo".
2. **Given** un Board in vista timeline, **When** l'utente cerca "profezia", **Then** gli elementi corrispondenti vengono evidenziati sulla timeline e gli altri attenuati.
3. **Given** un Board in vista grafo, **When** l'utente cerca un termine, **Then** i nodi corrispondenti vengono evidenziati e gli altri attenuati.
4. **Given** una ricerca attiva, **When** l'utente cancella il testo di ricerca, **Then** la vista torna allo stato completo senza filtri.
5. **Given** una ricerca con differenze di maiuscole/minuscole, **When** l'utente cerca "abraamo" o "ABRAAMO", **Then** il sistema restituisce gli stessi risultati.

---

### US-12 - Navigazione e Breadcrumbs (Priority: P2)

L'utente naviga tra elementi collegati senza perdere il percorso. Il sistema traccia il percorso di navigazione come breadcrumb. Da qualsiasi Elemento, l'utente puo aggiungere l'Elemento a un Board esistente con long-press.

**Why this priority**: La navigazione e cruciale per lo studio — l'utente deve poter esplorare il contesto di un evento seguendo i link senza perdere dove si trova.

**Independent Test**: L'utente naviga tra 5+ elementi collegati tramite link, usa i breadcrumb per tornare indietro, e aggiunge un elemento a un board via long-press.

**Acceptance Scenarios**:

1. **Given** un Elemento visualizzato, **When** l'utente tocca un link per navigare a un altro Elemento, **Then** il breadcrumb si aggiorna mostrando il percorso (es. "Abraamo > Isacco > Giacobbe").
2. **Given** un breadcrumb con 3+ nodi, **When** l'utente tocca un nodo intermedio, **Then** torna a quell'Elemento e i nodi successivi vengono rimossi dal breadcrumb.
3. **Given** un Elemento visualizzato, **When** l'utente fa long-press sull'Elemento, **Then** appare un menu contestuale con l'opzione "Aggiungi a Board" e la lista dei board disponibili.
4. **Given** l'utente aggiunge un Elemento a un Board con selezione fissa, **Then** l'Elemento appare nella visualizzazione del Board.

---

### US-13 - Visualizzazione Grafo (Priority: P3)

L'utente visualizza un Board in modalita grafo interattivo (force-directed layout). I nodi rappresentano gli elementi, gli archi rappresentano i link tipizzati. L'utente puo filtrare quali tipi di link visualizzare.

**Why this priority**: Il grafo e potente per esplorare relazioni complesse ma e una visualizzazione avanzata che richiede elementi e link gia creati.

**Independent Test**: L'utente passa alla vista grafo su un board con elementi collegati, filtra per tipo di link, e naviga toccando i nodi.

**Acceptance Scenarios**:

1. **Given** un Board con elementi collegati, **When** l'utente seleziona la vista "grafo", **Then** appare un grafo force-directed dove i nodi sono elementi e gli archi sono link, con colori per tipo di link.
2. **Given** un Board in vista grafo, **When** l'utente filtra per tipo link (es. solo "parentela"), **Then** il grafo mostra solo gli archi di quel tipo e riorganizza il layout.
3. **Given** un Board in vista grafo, **When** l'utente tocca un nodo, **Then** si evidenziano i link diretti e si apre un preview dell'Elemento.
4. **Given** un Board in vista grafo, **When** l'utente fa pinch-to-zoom o pan, **Then** il grafo risponde fluidamente a 60fps.

---

### US-14 - Visualizzazione Genealogia (Priority: P3)

L'utente visualizza un Board in modalita albero genealogico partendo da un Elemento radice. L'albero usa i link di tipo "parentela" per costruire la struttura padre-figlio/coniuge.

**Why this priority**: La genealogia e specifica per lo studio biblico (genealogie estese) ma dipende da elementi di tipo personaggio con link parentela.

**Independent Test**: L'utente passa alla vista genealogia su un board, seleziona un personaggio come radice, e naviga toccando i nodi.

**Acceptance Scenarios**:

1. **Given** un Board con personaggi collegati da link "parentela", **When** l'utente seleziona la vista "genealogia" con radice "Abraamo", **Then** appare un albero con i discendenti collegati tramite link "parentela".
2. **Given** un Board in vista genealogia, **When** l'utente configura la profondita massima (es. 5 generazioni), **Then** l'albero si limita a quella profondita.
3. **Given** un nodo nell'albero, **When** l'utente lo tocca, **Then** si apre il dettaglio del personaggio con tutti i suoi link (non solo parentela).

---

### US-15 - Offline e Sincronizzazione (Priority: P2)

L'app funziona completamente offline come PWA installabile. I dati vengono salvati localmente e sincronizzati automaticamente tra dispositivi quando la connessione e disponibile. I conflitti vengono risolti automaticamente dal sistema.

**Why this priority**: L'offline e un requisito core — l'utente studia anche senza connessione (es. in viaggio, in luoghi senza rete).

**Independent Test**: L'utente installa la PWA, crea/modifica elementi offline, riconnette e verifica la sincronizzazione con un secondo dispositivo.

**Acceptance Scenarios**:

1. **Given** l'app, **When** l'utente la installa come PWA, **Then** l'app e accessibile dalla home screen e funziona offline.
2. **Given** un workspace, **When** l'utente e offline e crea/modifica elementi, **Then** i dati vengono salvati localmente.
3. **Given** dati creati offline, **When** la connessione torna disponibile, **Then** i dati vengono sincronizzati automaticamente.
4. **Given** due dispositivi, **When** entrambi modificano dati offline e poi si riconnettono, **Then** il sistema risolve automaticamente i conflitti senza intervento dell'utente.

---

### US-16 - Collaborazione Workspace (Priority: P3)

L'utente condivide il workspace con altri utenti tramite gruppi con permessi. Gli utenti invitati possono visualizzare e/o modificare gli elementi in base ai permessi assegnati. Le modifiche si sincronizzano in tempo reale.

**Why this priority**: La collaborazione arricchisce lo studio ma non e indispensabile per l'uso individuale.

**Independent Test**: Due utenti accedono allo stesso workspace, uno modifica un Elemento, l'altro vede la modifica in tempo reale.

**Acceptance Scenarios**:

1. **Given** un workspace, **When** l'utente invita un altro utente con permessi di scrittura, **Then** l'invitato puo accedere al workspace e creare/modificare elementi.
2. **Given** due utenti sullo stesso workspace, **When** uno modifica un Elemento, **Then** l'altro vede la modifica in tempo reale senza refresh.
3. **Given** un utente invitato con permessi di sola lettura, **When** tenta di modificare qualsiasi contenuto del workspace (elementi, board, tag o log), **Then** il sistema impedisce la modifica e mostra un feedback appropriato.

---

### US-17 - Log Azioni e Rollback (Priority: P3)

Il sistema traccia le azioni effettuate dall'utente (creazione, modifica, eliminazione di elementi e link) in un log consultabile. L'utente puo eseguire il rollback di singole azioni tramite una nuova azione compensativa, senza riavvolgere distruttivamente la cronologia condivisa.

**Why this priority**: Il log e una rete di sicurezza. Utile ma non bloccante per il flusso di lavoro principale.

**Independent Test**: L'utente esegue diverse azioni, consulta il log, e fa rollback di un'azione specifica verificando che lo stato torni corretto.

**Acceptance Scenarios**:

1. **Given** un workspace, **When** l'utente crea un Elemento, **Then** l'azione viene registrata nel log con timestamp, tipo azione, e dettagli.
2. **Given** un log con azioni, **When** l'utente visualizza il log, **Then** vede una lista cronologica delle azioni con filtri per tipo e per utente (in caso di workspace condiviso).
3. **Given** un'azione nel log (es. "eliminato Elemento X"), **When** l'utente preme "Rollback", **Then** il sistema crea una nuova azione compensativa che ripristina l'Elemento con tutti i suoi dati e link.

---

### US-18 - Annotazione Video (Priority: P1)

L'utente crea un'annotazione per documentare una sezione specifica di un video JW.org. L'annotazione e un Elemento first-class (TipoElemento "annotazione") con titolo, tag, note, fonti e link bidirezionali verso elementi correlati. Il video e una fonte dell'annotazione (FonteTipo "video") con mediaKey, sezione da/a, e metadata cached. L'utente puo riprodurre la sezione annotata inline nel detail pane. v1 e online-only; download offline e deferred.

**Why this priority**: Permette di annotare sezioni di video con titolo, tag, nota, e poi cercare/ritrovare senza rivedere il video. Il caso d'uso video e il piu chiaro e impattante per lo studio.

**Independent Test**: L'utente crea un'annotazione, incolla un URL video JW.org, seleziona la sezione da/a con preview, collega l'annotazione a elementi correlati, e riproduce la sezione inline dal detail.

**Acceptance Scenarios**:

1. **Given** un workspace, **When** l'utente crea un Elemento di tipo "annotazione" con titolo "Fede di Abraamo", tag e note, **Then** l'Elemento viene salvato come annotazione first-class, visibile in liste, ricerca e board come qualsiasi altro Elemento.
2. **Given** un'annotazione in creazione, **When** l'utente incolla un URL JW.org video (es. `https://www.jw.org/it/biblioteca-digitale/video/#it/mediaitems/StudioBiblico/pub-jwbvod26_1_VIDEO`), **Then** il sistema estrae la naturalKey (`pub-jwbvod26_1_VIDEO`), chiama la Mediator API (`b.jw-cdn.org/apis/mediator/v1/media-items/I/{naturalKey}`), e popola automaticamente titolo originale, durata, thumbnail e qualita disponibili.
3. **Given** un'annotazione con metadata video risolti, **When** l'utente seleziona la sezione da/a (mm:ss) tramite input o slider visuale, **Then** la sezione viene salvata in secondi, validata (da < a, entrambi <= durata), e il preview player riproduce la sezione selezionata per verifica.
4. **Given** un'annotazione con fonte video, **When** l'utente aggiunge link bidirezionali verso elementi correlati (es. Abraamo, Isacco), **Then** i link e gli inversi vengono creati con i tipi standard (correlato, causa-effetto, ecc.).
5. **Given** un'annotazione con fonte video e sezione da/a, **When** l'utente apre il detail dell'annotazione, **Then** vede la fonte video con thumbnail, titolo, sezione, e un pulsante per riprodurre.
6. **Given** il detail di un'annotazione, **When** l'utente preme il pulsante di riproduzione, **Then** si apre un popup/modal con player HTML5 `<video>` che riproduce la sezione (da timestamp "da" a timestamp "a") con sottotitoli VTT e qualita selezionabile (240p-720p).
7. **Given** una ricerca per tag nel board, **When** l'utente cerca un tag presente su un'annotazione, **Then** l'annotazione appare nei risultati come qualsiasi altro Elemento, e dal detail puo avviare la riproduzione video alla sezione annotata.
8. **Given** l'utente e offline, **When** tenta di riprodurre il video di un'annotazione, **Then** il sistema mostra un messaggio informativo che il playback richiede connessione (v1 online-only).

---

### Edge Cases

- **Date ambigue**: Un Elemento con precisione "circa" (es. "circa 1500 a.e.v.") deve essere posizionabile sulla timeline con un indicatore visuale di incertezza.
- **Elemento senza date**: Elementi senza date (es. un luogo) non appaiono sulla timeline ma appaiono nella lista e nel grafo.
- **Profezia con piu adempimenti**: Una profezia con piu adempimenti non accumula date multiple sullo stesso Elemento; il pronunciamento resta un Elemento e ogni adempimento viene modellato come Elemento separato collegato tramite link "adempimento".
- **Link orfani**: Se un Elemento viene eliminato, tutti i link che puntano a esso devono essere rimossi automaticamente (cascade).
- **Tag orfani**: Se nessun Elemento usa piu un tag, il tag resta nel registry (non viene auto-eliminato) — l'utente lo rimuove manualmente se vuole.
- **Board dinamico vuoto**: Se un filtro dinamico non matcha nessun Elemento, il Board mostra un messaggio informativo con suggerimento di ampliare i criteri.
- **Range che attraversa ere**: Un range che va da a.e.v. a e.v. (es. "100 a.e.v. - 50 e.v.") deve essere gestito correttamente dalla scala temporale.
- **Giorno senza mese**: Una DataStorica non puo salvare il giorno se il mese non e stato selezionato.
- **Conflitti concorrenti**: In caso di modifiche concorrenti allo stesso campo, il sistema di sincronizzazione risolve automaticamente — nessuna logica di merge manuale.
- **Rollback non sicuro**: Se un'azione storica non e piu reversibile in modo sicuro nello stato corrente condiviso, il sistema impedisce il rollback e mostra il motivo.
- **Limite media offline**: Le immagini salvate offline occupano spazio sul dispositivo. Il sistema deve mostrare lo spazio utilizzato e permettere la rimozione selettiva.
- **Eliminazione Board**: L'eliminazione di un Board non elimina gli elementi — rimuove solo la vista/selezione.
- **URL video JW.org invalido**: Se l'URL incollato non e un URL JW.org video riconosciuto o non contiene una naturalKey estraibile, il sistema mostra un errore inline e non procede alla risoluzione metadata.
- **Mediator API non raggiungibile**: Se la chiamata alla Mediator API fallisce (rete assente, timeout, 404), il sistema mostra un errore inline con opzione di riprovare. La fonte video non viene salvata senza metadata risolti.
- **Sezione video oltre durata**: Se l'utente imposta un timestamp "da" o "a" superiore alla durata del video, il sistema mostra un errore di validazione e impedisce il salvataggio della sezione.
- **Sezione video da >= a**: Se il timestamp "da" e uguale o superiore al timestamp "a", il sistema mostra un errore di validazione.
- **Video rimosso da JW.org**: Se un video precedentemente risolto non e piu disponibile (API ritorna 404 su retry), il metadata cached resta visibile ma il playback mostra un messaggio "Video non disponibile".

## Requirements

### Functional Requirements

- **FR-001**: Il sistema DEVE autenticare l'utente e creare automaticamente un workspace singolo al primo accesso. Un utente ha un solo workspace.
- **FR-002**: Il sistema DEVE supportare 8 tipi di Elemento: personaggio, guerra, profezia, regno, periodo, luogo, evento, annotazione — ciascuno con attributi specifici del tipo. L'annotazione non ha campi tipo-specifici; la sua specificita e nella fonte video.
- **FR-003**: Ogni Elemento DEVE avere: id univoco, titolo (non vuoto), date opzionali (puntuale o range), tag multipli, fonti multiple, media multipli, note, link tipizzati. Un singolo Elemento DEVE avere al massimo una DataTemporale generale. Gli Elementi di tipo personaggio POSSONO inoltre avere `nascita` e `morte` come DataStorica dedicate.
- **FR-004**: Le date DEVONO usare il modello DataStorica con: anno (sempre positivo), era ("a.e.v." o "e.v."), mese opzionale, giorno opzionale solo se e presente anche il mese, precisione (`esatta` o `circa`). L'interfaccia DEVE mostrare le ere come "a.e.v." e "e.v.", mai come "a.C." e "d.C.", e DEVE permettere di scegliere il livello di dettaglio tra anno, anno+mese, anno+mese+giorno.
- **FR-005**: Le date range DEVONO supportare un inizio e una fine, ciascuno come DataStorica indipendente.
- **FR-006**: Le fonti DEVONO supportare 5 tipi: "bibbia" (riferimento biblico, URL WOL calcolata automaticamente), "articolo-wol" (URL diretto a wol.jw.org per articoli e pubblicazioni, con supporto fragment `#h=` per range paragrafi), "link" (URL generico + etichetta), "video" (video JW.org con mediaKey, sezione da/a in secondi, metadata cached: titolo, durata, thumbnail, qualita), "immagine" (allegato immagine, deferred). Per le fonti "bibbia" il sistema DEVE salvare il riferimento e calcolare l'URL, senza salvare offline il testo biblico. Per le fonti "articolo-wol" il sistema DEVE salvare l'URL. Per le fonti "video" il sistema DEVE risolvere i metadata via Mediator API al momento della creazione.
- **FR-007**: I media DEVONO supportare immagini salvate offline come blob nel dispositivo (deferred). I video SONO supportati come FonteTipo "video" su annotazioni, con playback online via HTML5 `<video>` e metadata risolti dalla Mediator API JW.org. Il download offline dei video e deferred a v2.
- **FR-008**: I link tra Elementi DEVONO essere bidirezionali — la creazione di un link A->B crea automaticamente il link inverso B->A.
- **FR-009**: L'eliminazione di un Elemento DEVE mostrare un dialog di conferma con preview dell'impatto (numero di link che verranno rimossi). Dopo conferma, DEVE apparire un toast con opzione undo immediato.
- **FR-010**: I tipi di link supportati DEVONO essere: adempimento, causa-effetto, parallelo, successione, parentela (con ruolo: padre/madre/figlio/figlia/coniuge), localizzazione, residenza, correlato.
- **FR-011**: I tag DEVONO essere censiti nel Tag Registry del workspace, con colore opzionale e collegamento opzionale a un Elemento descrittivo.
- **FR-012**: Il Board DEVE essere l'astrazione base di visualizzazione. Ogni Board puo essere visualizzato in qualsiasi delle 4 viste (timeline, lista, grafo, genealogia) — la vista e una scelta momentanea, non un attributo fisso. Il Board memorizza l'ultima vista usata e le configurazioni specifiche per ogni vista.
- **FR-013**: Ogni Board DEVE supportare selezione elementi tramite: selezione fissa (lista manuale di ID) o selezione dinamica (filtro per date, tag, tipi). Nella selezione dinamica, le categorie di filtro si combinano in AND; all'interno della stessa categoria multi-valore (es. tag, tipi) i valori si combinano in OR. La selezione e l'identita del Board.
- **FR-014**: Il sistema DEVE supportare due modalita di creazione Board: (1) esplicita — l'utente crea un Board con nome e tipo di selezione (fissa vuota o dinamica con filtri), configurazione successiva; (2) implicita — durante la navigazione tra elementi, l'utente puo salvare il percorso corrente come Board con selezione fissa contenente gli elementi visitati.
- **FR-015**: La vista timeline DEVE renderizzare elementi su asse verticale con SVG, supportando: scala segmentata con densita variabile, range bar per elementi con durata, sticky card per visibilita durante scroll, minimap rettangolare in basso a sinistra.
- **FR-016**: La vista timeline DEVE supportare tagGroups per separazione orizzontale degli elementi per tag, con colore e ordine configurabili. I gruppi visuali della timeline NON DEVONO esistere come entita persistente autonoma del dominio: sono solo configurazione visuale del Board basata su tag esistenti.
- **FR-017**: La vista lista DEVE mostrare elementi in formato tabellare con ordinamento configurabile, colonne selezionabili, e virtualizzazione per liste lunghe.
- **FR-018**: La vista grafo DEVE renderizzare un grafo force-directed con nodi (elementi) e archi (link), con filtro per tipo di link.
- **FR-019**: La vista genealogia DEVE renderizzare un albero partendo da un Elemento radice, usando link "parentela", con profondita configurabile.
- **FR-020**: Il sistema DEVE tracciare la navigazione tra elementi come breadcrumb, permettendo di tornare a qualsiasi punto del percorso.
- **FR-021**: Il long-press su un Elemento DEVE aprire un menu contestuale per aggiungerlo a un Board esistente.
- **FR-022**: Il sistema DEVE funzionare completamente offline come PWA installabile su tablet.
- **FR-023**: I dati DEVONO sincronizzarsi automaticamente tra dispositivi quando la connessione e disponibile.
- **FR-024**: Il sistema DEVE supportare collaborazione tramite gruppi con permessi di lettura e scrittura. I permessi sono assegnati a livello di workspace e si applicano a tutto il contenuto condiviso del workspace, inclusi elementi, board, tag registry e log azioni.
- **FR-025**: Il sistema DEVE registrare le azioni dell'utente in un log consultabile con possibilita di rollback. Il rollback DEVE essere implementato come nuova azione compensativa; se una azione non e piu reversibile in modo sicuro, il sistema DEVE impedire il rollback con feedback esplicito.
- **FR-026**: L'interfaccia DEVE essere ottimizzata per tablet (768-1024px) con touch target minimo 48x48px e gap 8px.
- **FR-027**: L'interfaccia DEVE essere interamente in italiano.
- **FR-028**: Il sistema DEVE offrire ricerca full-text (titolo, tag, note) adattata alla vista corrente del Board: in lista filtra le righe, in timeline evidenzia/filtra gli elementi sull'asse, in grafo evidenzia i nodi corrispondenti, in genealogia evidenzia i nodi nell'albero. La ricerca DEVE essere testuale semplice, case-insensitive e senza operatori avanzati; una query vuota DEVE equivalere a nessun filtro.
- **FR-029**: Il sistema DEVE risolvere automaticamente i metadata di un video JW.org (titolo, durata, thumbnail, qualita disponibili) dato un URL o naturalKey, tramite la Mediator API (`b.jw-cdn.org/apis/mediator/v1/media-items/I/{naturalKey}`).
- **FR-030**: Il sistema DEVE supportare playback video inline tramite HTML5 `<video>` con MP4 diretto, fragment `#t=start,end` per sezione, sottotitoli VTT, e qualita selezionabile (240p-720p).

### Key Entities

- **Workspace**: Contenitore principale. Raggruppa elementi, board, tag registry e log azioni. Singolo per utente. Unita di condivisione e collaborazione. I permessi sono definiti a livello workspace con soli ruoli lettura/scrittura applicati a tutto il contenuto condiviso.
- **Elemento**: Entita base del dominio — un fatto, persona, luogo o concetto studiato. Ha un tipo discriminato (personaggio, guerra, profezia, regno, periodo, luogo, evento, annotazione) con attributi specifici per tipo e al massimo una DataTemporale generale. Per i personaggi possono esistere anche `nascita` e `morte` come DataStorica dedicate. Una profezia con piu adempimenti viene rappresentata come piu Elementi collegati, non come un singolo Elemento con date multiple. L'annotazione e un Elemento first-class senza campi tipo-specifici; la sua specificita e nella fonte video.
- **Board**: Astrazione di visualizzazione. Seleziona un sottoinsieme di elementi (selezione fissa o dinamica). Puo essere visualizzato in qualsiasi vista (timeline, lista, grafo, genealogia) — la vista non e attributo del Board ma scelta momentanea dell'utente. Le configurazioni specifiche per vista sono persistite separatamente. I `tagGroups` della timeline sono configurazione visuale e non introducono una entita persistente dedicata di raggruppamento visuale nel dominio.
- **DataStorica**: Data storica con supporto ere (a.e.v./e.v.), mese e giorno opzionali, e livello di precisione. In interfaccia si usano sempre le etichette a.e.v./e.v.
- **DataTemporale**: Data puntuale o range di due DataStorica.
- **Tag**: Etichetta censita nel workspace con colore opzionale e collegamento opzionale a un Elemento descrittivo.
- **Fonte**: Sorgente informativa di un Elemento. 5 tipi: bibbia (riferimento + URL WOL calcolata), articolo-wol (URL wol.jw.org con fragment paragrafi), link (URL + etichetta), video (mediaKey + sezione da/a + metadata cached), immagine (allegato, deferred). Testo inline opzionale per citazione.
- **ElementoLink**: Relazione tipizzata bidirezionale tra due Elementi, con tipo, ruolo opzionale e nota opzionale.
- **Azione**: Registro di un'operazione effettuata dall'utente, con dati sufficienti per il rollback.

### Domain Model

```
Workspace (Aggregate Root)
+-- nome: NonEmptyString
+-- membri: Gruppo (permessi r/w a livello workspace)
+-- tagRegistry: TagRegistration[]
|   +-- tag: Tag (univoco nel workspace)
|   +-- elementoDescrittivo?: ElementoId
|   +-- colore?: string
+-- elementi: Elemento[]
+-- board: Board[]
+-- logAzioni: Azione[]
```

```
Elemento (Aggregate Root)
+-- id: ElementoId
+-- titolo: NonEmptyString
+-- date?: DataTemporale
|   +-- Puntuale { data: DataStorica }
|   +-- Range { inizio: DataStorica, fine: DataStorica }
+-- nascita?: DataStorica
+-- morte?: DataStorica
+-- tags: Tag[]
+-- fonti: Fonte[]
|   +-- bibbia       { riferimento, urlWol }
|   +-- articolo-wol { url, fragment? }
|   +-- link         { url, etichetta }
|   +-- video        { mediaKey, sezioneDa, sezioneA, titoloOriginale, durataSecondi, thumbnail, qualita[] }
|   +-- immagine     { blob } (deferred)
+-- media: Media[]
|   +-- immagine { blob, offline } (deferred)
+-- note: string
+-- link: ElementoLink[]
|   +-- { targetId, tipo, ruolo?, nota? }
+-- tipoElemento (discriminated union)
    +-- personaggio  { nascita?, morte?, tribu?, ruoli? }
    +-- guerra       { fazioni?, esito? }
    +-- profezia     { stato: attesa|adempiuta|parziale }
    +-- regno        { dettagli? }
    +-- periodo      { }
    +-- luogo        { regione? }
    +-- evento       { }
    +-- annotazione  { }
```

```
Board (Aggregate Root)
+-- id: BoardId
+-- nome: NonEmptyString
+-- selezione: SelezioneElementi
|   +-- Fissa    { elementiIds[] }
|   +-- Dinamica { dateFrom?, dateTo?, tags?, tipi?, combinazione: AND-tra-categorie + OR-intra-categoria }
+-- ultimaVista?: timeline | lista | grafo | genealogia
+-- configViste (persistite per ogni vista usata)
    +-- Timeline? { scala, tagli[], tagGroups[] }
    |   tagGroup: { tag, colore, ordine }
    +-- Lista? { ordinamento, colonneVisibili }
    +-- Grafo? { layout, filtriLink }
    +-- Genealogia? { radice: ElementoId, profondita }
```

```
DataStorica (Value Object)
+-- anno: number (sempre positivo)
+-- era: "aev" | "ev"
+-- mese?: number
+-- giorno?: number
+-- precisione: esatta | circa
```

```
FonteTipo (Discriminated Union)
+-- bibbia       { libro, capitolo, versettoInizio, versettoFine?, label, urlWol }
+-- articolo-wol { url, fragment? }
+-- link         { url, etichetta }
+-- video        { mediaKey, sezioneDa, sezioneA, titoloOriginale, durataSecondi, thumbnail, qualita[] }
+-- immagine     { blob } (deferred)
```

### Link Types

adempimento, causa-effetto, parallelo, successione,
parentela (con ruolo: padre/madre/figlio/figlia/coniuge),
localizzazione, residenza, correlato.

## Success Criteria

### Measurable Outcomes

- **SC-001**: L'utente puo creare un workspace e aggiungere 10 elementi con date, tag, fonti e link in meno di 15 minuti nella prima sessione.
- **SC-002**: La timeline con 200 elementi renderizza a 60fps durante scroll e zoom su tablet di fascia media.
- **SC-003**: L'app funziona completamente offline dopo la prima installazione — creazione, modifica e navigazione elementi senza connessione.
- **SC-004**: La sincronizzazione tra due dispositivi completa il merge senza conflitti visibili all'utente entro 5 secondi dalla riconnessione.
- **SC-005**: L'utente puo navigare da un Elemento ai suoi correlati tramite link e tornare indietro via breadcrumb in meno di 2 secondi per hop.
- **SC-006**: La creazione di un link bidirezionale (incluso il link inverso automatico) avviene in modo istantaneo e trasparente all'utente.
- **SC-007**: Tutti i touch target sono minimo 48x48px, testabili tramite audit automatico.
- **SC-008**: L'app e installabile come PWA e il service worker cache tutti gli asset per uso offline.
- **SC-009**: La ricerca full-text restituisce risultati in meno di 200ms per workspace con 2000 elementi.
- **SC-010**: L'utente puo creare un'annotazione video, selezionare la sezione da/a, e riprodurre inline in meno di 30 secondi dall'URL incollato.

## Assumptions

- Gli utenti hanno tablet con browser moderno (ultimi 2 major versions di Chrome, Firefox, Safari, iOS Safari).
- Il numero di elementi per workspace tipico e 50-500, con picchi fino a 2000.
- Le immagini media sono di dimensioni ragionevoli (< 5MB ciascuna).
- Il supporto blob offline per media va verificato con le capacita del data layer in fase di plan.
- La migrazione schema dati va verificata con la documentazione del data layer in fase di plan.
- La libreria UI scelta copre i componenti necessari (dialog, select, menu, tabs) — da verificare prima dell'implementazione.
- Il link calcolato per scritture bibliche verso wol.jw.org segue un pattern URL prevedibile basato sul riferimento.
- La ricerca full-text opera client-side sui dati gia in memoria (volume previsto 50-2000 elementi). Non servono indici server-side.
- La Mediator API JW.org (`b.jw-cdn.org`) e pubblica, stabile, e CDN-backed. La lingua API per italiano e "I".
- Il playback video HTML5 con fragment `#t=start,end` e supportato dai browser target.
