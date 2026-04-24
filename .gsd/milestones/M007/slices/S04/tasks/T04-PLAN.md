---
estimated_steps: 18
estimated_files: 3
skills_used: []
---

# T04: Migrare DetailPane soft-delete; convertire errori ListPane in inline; rimuovere Toast.Provider

Completare la rimozione di tutti i toast. Tre siti distinti:

**DetailPane.tsx (~linea 58)** — soft-delete toast:
- Sostituire `toast("<...> eliminato", { action: { onPress: () => restoreElement(id) }, timeout: 30000 })` con `notifyMutation('delete', `"${titolo}" eliminato`, () => restoreElement(elementId))`.
- Rimuovere import `toast` da `@heroui/react`.
- Aggiungere `import { notifyMutation } from './notifications-store'`.
- Nota timeout 30s originale: non serve più. Il drawer mantiene l'entry finché la sessione è attiva (coerente con R051 "in-memory per sessione").

**ListPane.tsx (linee 120, 140)** — errori sistema:
- Linea 120 `toast("Account non disponibile", ...)`: NON diventa notifyMutation (non è una mutazione). Convertire in inline error vicino al punto di azione (top della lista o dentro il creation button area). Pattern: aggiungere uno state locale `const [systemError, setSystemError] = useState<string | null>(null)`, settare in setSystemError('Account non disponibile') al posto del toast, renderizzare `{systemError && <p className="text-danger text-sm px-3 py-2">{systemError}</p>}` sopra la lista. Auto-dismiss dopo 5s via setTimeout se desiderato — accettabile anche persistente finché l'utente non agisce.
- Linea 140 `toast(`Errore creazione: ${error.type}`, ...)`: stessa strategia — setSystemError(`Errore creazione: ${error.type}`).
- Rimuovere import `toast`.

**WorkspacePreviewPage.tsx** — rimozione provider:
- Rimuovere `<Toast.Provider placement="bottom end" />` (~linea 142) e aggiornare/rimuovere il commento doc (~linee 11-12) che lo descrive.
- Rimuovere `Toast` dall'import `@heroui/react`.

**Verifica finale cross-file:**
- `rg 'toast\(' src/ui/` → 0 hit
- `rg 'Toast\.Provider' src/ui/` → 0 hit
- `rg '\btoast\b|\bToast\b' src/ui/ --glob='*.tsx' --glob='*.ts' | rg -v 'notifications-store|Annotazioni'` → 0 hit import dagli hero
- `rg 'notifyMutation' src/ui/` → 7+ hit totali (6 ElementoEditor + 1 DetailPane)

## Inputs

- ``src/ui/workspace-home/DetailPane.tsx``
- ``src/ui/workspace-home/ListPane.tsx``
- ``src/ui/workspace-home/WorkspacePreviewPage.tsx``
- ``src/ui/workspace-home/notifications-store.ts``

## Expected Output

- ``src/ui/workspace-home/DetailPane.tsx``
- ``src/ui/workspace-home/ListPane.tsx``
- ``src/ui/workspace-home/WorkspacePreviewPage.tsx``

## Verification

rg 'toast\(' src/ui/ → 0 hit. rg 'Toast\.Provider' src/ui/ → 0 hit. rg -n 'notifyMutation' src/ui/workspace-home/DetailPane.tsx → 1 hit. pnpm tsc --noEmit → clean. pnpm test --run → 141+ verdi. pnpm build → clean. Manual smoke: soft-delete un Elemento dal DetailPane → drawer mostra entry delete con Annulla; click Annulla → elemento ripristinato. Triggerare errore creazione senza account → inline error in ListPane.

## Observability Impact

Soft-delete ora passa per notification center (canale unificato). Gli errori di sistema di ListPane restano inline (visibili nel contesto dell'azione) — decisione intenzionale: il drawer è per mutazioni utente, non per errori di sistema. Questo preserva la chiarezza del canale.
