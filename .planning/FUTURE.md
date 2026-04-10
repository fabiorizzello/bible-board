# Feature Post-Prototipo (M002)

> Funzionalità fuori scope dal prototipo iniziale M002, da implementare in milestone successivi.
> Documentate qui per non perderle. Ogni voce ha il requirement ID di riferimento.

---

## M003 — Backend Jazz + Persistenza reale

Tutte le feature che oggi sono mock e richiedono Jazz come backend reale.

| Feature | Req | Note |
|---|---|---|
| Autosave reale con Jazz CRDT | R026 | Oggi è un setTimeout mock |
| Elemento CRUD persistente | R026-R032 | Create/Update/Delete con Jazz CoMaps |
| Validazione completa (cambio tipo, rimozione campi) | R027 | Oggi si può cambiare tipo senza conseguenze |
| Link bidirezionali automatici | R033-R048 | Inversi atomici, validazione no-self/no-duplicate |
| Fonti persistenti + parsing biblico reale | R049-R061 | WOL resolver già implementato, serve wiring Jazz |
| Board persistenti con selezione dinamica reale | R062-R075 | Oggi selezione è mock, serve Jazz query |
| Annotazioni per-utente reali | R101-R109 | Oggi autore è una stringa mock |
| Stato persistente (sidebar, scroll, selezione) | R110-R120 | localStorage o Jazz per stato UI |
| Workspace switcher reale | R114 | Oggi è un dropdown non funzionale |

---

## M004 — Annotazione Video JW.org

Il sistema completo per ancorare annotazioni a sezioni di video JW.org.

| Feature | Req | Note |
|---|---|---|
| FonteTipo "video" con mediaKey e sezione da/a | R031 | Estende discriminated union FonteTipo |
| Risoluzione automatica URL video JW.org | R032 | Mediator API: b.jw-cdn.org/apis/mediator/v1/media-items/I/{key} |
| Playback video inline con sezione | R033 | HTML5 `<video>` + MP4 diretto + fragment #t=start,end |
| Selezione sezione video da/a | R034 | Input mm:ss o slider, preview player |
| Download video offline | R035 | Cache API, qualità selezionabile, v2 feature (deferred) |

### Design Notes (da KNOWLEDGE.md)
- Pattern URL JW.org: `https://www.jw.org/it/biblioteca-digitale/video/#it/mediaitems/{category}/{naturalKey}`
- API: `GET b.jw-cdn.org/apis/mediator/v1/media-items/I/{naturalKey}?clientType=www`
- Risposta: titolo, durata, MP4 URLs (240p-720p), VTT sottotitoli, thumbnail
- v1 solo online, v2 download full video

---

## M005 — Sharing, Permessi, Action Log

| Feature | Req | Note |
|---|---|---|
| Inviti workspace | R085-R092 | Jazz groups |
| Ruoli lettura/scrittura | R085-R092 | Enforcement: controlli disabilitati per lettura |
| Badge sola lettura | R085-R092 | Header workspace |
| Action Log automatico | R093-R100 | Registra crea/modifica/elimina |
| Rollback compensativo | R093-R100 | Azione inversa, non undo CRDT |
| Portrait tablet layout | R116 | Sidebar overlay, list pane full width |
| Mobile: messaggio "usa tablet" | — | Constitution: mobile fuori scope v1 |

---

## M006 — Media e Immagini

| Feature | Req | Note |
|---|---|---|
| Upload immagini | R076-R084 | Jazz co.image() |
| Gallery con progressive loading | R076-R084 | Jazz progressive image loading |
| Visualizzatore overlay | R076-R084 | Pinch-to-zoom |
| FonteTipo "immagine" | R010 | Attualmente deferred |
| Storage info | R076-R084 | Quanto spazio occupa il workspace |

---

## M007 — Vista Grafo e Genealogia

| Feature | Req | Note |
|---|---|---|
| Vista grafo relazioni | — | D3 force-directed graph |
| Vista genealogia | — | Albero genealogico con parentela |
| CardConfig per-board | — | Configurazione visuale card condivisa tra viste |
| Overlap detection fonti | R010 | Warning, non blocca (post-MVP) |
| Vista aggregata annotazioni | R109 | Tutte le annotazioni dell'utente in un'unica vista |
