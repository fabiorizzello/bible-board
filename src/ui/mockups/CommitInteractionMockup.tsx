import { useState } from "react";
import { Button, Input, TextField } from "@heroui/react";
import { Check, X } from "lucide-react";
import {
  Alternative,
  Code,
  Divider,
  ElementoHeader,
  MockupFooter,
  MockupHeader,
  SimpleField,
} from "./_atoms";

/**
 * Mockup S02/R005 — Sketch 1: Commit & touch interaction
 *
 * Tap nel campo "Nascita" di Abraamo, modifichi il valore. Come si committa?
 *
 *   A. Blur-to-save (Apple Notes / Things 3)        ⭐ RECOMMENDED
 *   B. Inline ✓/✕ buttons (HeroUI Button next to Input)
 *   C. Auto-save con toast (debounce + "Salvato" silente)
 */

export function CommitInteractionMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="1"
          title="Commit & touch interaction"
          subtitle={
            <>
              Tap nel campo <strong>Nascita</strong> di Abraamo, modifichi il valore. Come e
              quando si committa?
            </>
          }
        />

        <Alternative
          letter="A"
          recommended
          title="Blur-to-save (Apple Notes pattern)"
          subtitle="tap fuori salva, ESC annulla, niente bottoni espliciti"
          mock={<BlurToSaveMock />}
          grammatica={
            <>
              Tap nel value → diventa <Code>{`<TextField><Input/>`}</Code> HeroUI con focus
              ring teal. Modifichi liberamente.
              <br />
              <strong>Tap fuori dal campo</strong> (qualunque punto del detail pane o sidebar) →
              commit silenzioso. <strong>ESC</strong> → annulla e ripristina valore precedente.
              <br />
              Niente chrome aggiunto, niente bottoni: il campo torna a sembrare testo subito
              dopo il blur.
            </>
          }
          items={[
            ["pro", "Zero chrome — coerente con inline per-campo"],
            ["pro", "Pattern iPad-native: identico ad Apple Notes, Things 3, Notion iPad"],
            ["pro", "Funziona senza tastiera fisica (Pencil + touch)"],
            ["pro", "Massima densità — tutti i campi appaiono uguali in idle"],
            ["con", "Discoverability del commit: serve toast onboarding al primo edit"],
            ["con", "Richiede undo globale (⌘Z / shake-to-undo) come safety net"],
          ]}
        />

        <Divider />

        <Alternative
          letter="B"
          title="Inline ✓/✕ buttons"
          subtitle="due bottoni HeroUI 44×44 a destra dell'Input — commit/cancel espliciti"
          mock={<InlineButtonsMock />}
          grammatica={
            <>
              Tap nel value → diventa Input + due <Code>{`<Button>`}</Code> HeroUI 44×44 (✓
              accent, ✕ default).
              <br />
              Tap ✓ → commit. Tap ✕ → annulla. Tap fuori → annulla (safety, no save accidentale).
              <br />
              Bottoni allineati a destra dell'input nel field-row.
            </>
          }
          items={[
            ["pro", "Affordance massima — l'utente vede ESATTAMENTE come committare"],
            ["pro", "Pattern enterprise (Salesforce inline edit, JIRA)"],
            ["pro", "Touch target enormi e dedicati"],
            ["con", "<strong>Chrome heavy</strong> — il field IN EDIT diventa visivamente un form widget"],
            ["con", "Su campi corti (data, tribù) i 2 bottoni occupano più spazio del valore"],
            ["con", "Anti-Notion / anti-Apple Notes feel — sembra una webapp"],
          ]}
        />

        <Divider />

        <Alternative
          letter="C"
          title="Auto-save con toast"
          subtitle="ogni keystroke → debounce 500ms → save · toast 'Salvato' bottom 1.5s"
          mock={<AutoSaveMock />}
          grammatica={
            <>
              Tap nel value → Input HeroUI. Mentre digiti, debounce 500ms → commit.
              <br />
              Toast HeroUI bottom-right "Salvato ·  10:42:31" appare brevemente (1.5s) poi
              dissolve. Niente blur, niente bottoni.
              <br />
              Tap fuori → l'Input torna a essere testo (last value committato).
            </>
          }
          items={[
            ["pro", "Zero friction — tutto si salva da solo"],
            ["pro", "Pattern Google Docs / Apple iWork — familiare"],
            ["pro", "Toast conferma silenzioso non interrompe"],
            ["con", "<strong>No undo finestra</strong> — ogni keystroke è committato → CRDT history rumorosa"],
            ["con", "Su sync Jazz, peer remoti vedono ogni intermediate state"],
            ["con", "Per data invalida (es. '2x00 a.E.V.') quando salva? Validation timing tricky"],
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Decisione propagata:</strong> qualsiasi alternativa scelta determina il
              commit pattern usato anche negli altri mockup (popover collegamento, editor
              markdown, composite Vita, ecc.).
            </li>
            <li>
              <strong>Compatibilità Pencil:</strong> tutte e 3 le alternative funzionano con
              Apple Pencil come puntatore. Solo B/C sono Pencil-friendly se la softkeyboard
              non si apre auto (iPadOS Scribble).
            </li>
            <li>
              <strong>Undo globale:</strong> indipendente dalla scelta, l'app DEVE avere{" "}
              <Code>⌘Z</Code> e (idealmente) shake-to-undo come safety net.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

function BlurToSaveMock() {
  const [nascita, setNascita] = useState("2000 a.E.V.");
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Descrizione" value="Patriarca dei tre monoteismi." />
      <div className="flex items-center gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Nascita
        </span>
        <div className="flex-1">
          <TextField value={nascita} onChange={setNascita} aria-label="Nascita">
            <Input className="min-h-[48px]" />
          </TextField>
        </div>
      </div>
      <SimpleField label="Morte" value="1825 a.E.V." />
      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}

function InlineButtonsMock() {
  const [nascita, setNascita] = useState("2000 a.E.V.");
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Descrizione" value="Patriarca dei tre monoteismi." />
      <div className="flex items-center gap-3 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Nascita
        </span>
        <div className="flex-1">
          <TextField value={nascita} onChange={setNascita} aria-label="Nascita">
            <Input className="min-h-[48px]" />
          </TextField>
        </div>
        <Button isIconOnly size="sm" variant="primary" aria-label="Salva" className="min-w-11 min-h-11">
          <Check size={18} />
        </Button>
        <Button isIconOnly size="sm" variant="ghost" aria-label="Annulla" className="min-w-11 min-h-11">
          <X size={18} />
        </Button>
      </div>
      <SimpleField label="Morte" value="1825 a.E.V." />
      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}

function AutoSaveMock() {
  const [nascita, setNascita] = useState("2000 a.E.V.");
  return (
    <div className="relative">
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Descrizione" value="Patriarca dei tre monoteismi." />
      <div className="flex items-center gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Nascita
        </span>
        <div className="flex-1">
          <TextField value={nascita} onChange={setNascita} aria-label="Nascita">
            <Input className="min-h-[48px]" />
          </TextField>
        </div>
      </div>
      <SimpleField label="Morte" value="1825 a.E.V." />
      <SimpleField label="Tribù" value="Ebrei" />
      {/* Toast mock */}
      <div className="absolute -bottom-2 right-0 inline-flex items-center gap-2 px-3 h-8 bg-slate-900 text-white text-xs rounded-md shadow-lg">
        <Check size={14} className="text-emerald-400" />
        Salvato · 10:42:31
      </div>
    </div>
  );
}
