import { useEffect, useRef, useState } from "react";
import { Input, TextField } from "@heroui/react";
import { Check, Pencil, Undo2, X } from "lucide-react";
import {
  Alternative,
  Code,
  ConsideredAlternatives,
  ElementoHeader,
  MockupFooter,
  MockupHeader,
  SimpleField,
} from "./_atoms";

/**
 * Mockup S02/R005 — Sketch 1: Commit & touch interaction
 *
 * Decisione lockata: A. Blur-to-save + toast undo non-invasivo
 * (pattern iOS Mail/Photos). Le alternative B/C sono elencate in fondo
 * come storico per conoscenza, non implementate.
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
              Tap nel campo <strong>Nascita</strong> di Abraamo, modifichi il valore. Commit
              al blur + toast undo non-invasivo.
            </>
          }
        />

        <Alternative
          letter="A"
          recommended
          title="Blur-to-save + toast undo non-invasivo"
          subtitle="tap fuori salva · toast 'Salvato' bottom 5s con bottone Annulla · ESC annulla pre-commit"
          mock={<BlurToSaveMock />}
          grammatica={
            <>
              Tap nel value → diventa <Code>{`<TextField><Input/>`}</Code> HeroUI con focus
              ring teal. Modifichi liberamente.
              <br />
              <strong>Tap fuori dal campo</strong> → commit + <strong>toast non-invasivo
              bottom-center</strong> con before/after del valore + bottone <strong>Annulla</strong>{" "}
              (rollback al valore precedente). Toast auto-dismiss dopo 5s.
              <br />
              <strong>ESC</strong> → annulla pre-commit (no toast).
              <br />
              Pattern iOS Mail/Photos undo — affidabile, dismissibile, non blocca il flow.
            </>
          }
          items={[
            ["pro", "Zero chrome in idle/edit — coerente con inline per-campo"],
            ["pro", "<strong>Toast undo</strong> dà safety net immediato senza ⌘Z (compatibile Pencil-only)"],
            ["pro", "Pattern Apple Mail (delete email → 'Annulla 5s'), Photos (cestina → 'Annulla')"],
            ["pro", "Toast bottom-center fa pill non bloccante, dismissibile con X"],
            ["pro", "Mostra before/after del valore — l'utente vede esattamente cosa ha cambiato"],
            ["con", "Per più commit rapidi consecutivi serve queue (mostra solo l'ultimo) o stack"],
            ["con", "Richiede comunque undo globale (⌘Z) come safety dopo i 5s del toast"],
          ]}
        />

        <ConsideredAlternatives
          entries={[
            {
              letter: "B",
              title: "Inline ✓/✕ buttons",
              summary:
                "Due bottoni HeroUI 44×44 a destra dell'Input — commit/cancel espliciti.",
              pros: [
                "Affordance massima — l'utente vede ESATTAMENTE come committare",
                "Pattern enterprise (Salesforce inline edit, JIRA)",
                "Touch target enormi e dedicati",
              ],
              cons: [
                "Chrome heavy — il field IN EDIT diventa visivamente un form widget",
                "Su campi corti (data, tribù) i 2 bottoni occupano più spazio del valore",
                "Anti-Notion / anti-Apple Notes feel — sembra una webapp",
              ],
              whyRejected:
                "Il chrome aggiunto rompe il principio 'tutto è solo testo' dell'inline per-campo. A dà safety equivalente (undo toast) senza bottoni persistenti.",
            },
            {
              letter: "C",
              title: "Auto-save con toast",
              summary:
                "Ogni keystroke → debounce 500ms → commit · toast 'Salvato' 1.5s bottom.",
              pros: [
                "Zero friction — tutto si salva da solo",
                "Pattern Google Docs / Apple iWork — familiare",
                "Toast conferma silenzioso non interrompe",
              ],
              cons: [
                "No undo finestra — ogni keystroke è committato → CRDT history rumorosa",
                "Su sync Jazz, peer remoti vedono ogni intermediate state",
                "Per data invalida (es. '2x00 a.E.V.') quando salva? Validation timing tricky",
              ],
              whyRejected:
                "Jazz CRDT riceverebbe centinaia di commit per una frase → storia rumorosa e sync costoso. A commit solo al blur (una volta per edit session) è più pulito e preserva undo window chiara.",
            },
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Decisione propagata:</strong> il blur-to-save determina il commit
              pattern usato anche negli altri mockup (popover collegamento, editor markdown,
              composite Vita, ecc.).
            </li>
            <li>
              <strong>Compatibilità Pencil:</strong> Pencil tap + Scribble apre softkeyboard
              nativamente iPadOS, l'Input HeroUI supporta Scribble via contentEditable.
            </li>
            <li>
              <strong>Undo globale:</strong> l'app DEVE comunque avere <Code>⌘Z</Code> (se
              Magic Keyboard) e shake-to-undo iPadOS come safety oltre i 5s del toast.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// EditableField — atom locale: view 48px text ↔ edit Input HeroUI same height
// ============================================================================
interface EditableFieldProps {
  label: string;
  value: string;
  onCommit: (next: string) => void;
}

function EditableField({ label, value, onCommit }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [editing]);

  function startEdit() {
    setDraft(value);
    setEditing(true);
  }
  function commit() {
    onCommit(draft);
    setEditing(false);
  }
  function cancel() {
    setDraft(value);
    setEditing(false);
  }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") cancel();
    if (e.key === "Enter") commit();
  }

  if (editing) {
    return (
      <div className="flex items-center gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
          {label}
        </span>
        <div className="flex-1">
          <TextField value={draft} onChange={setDraft} aria-label={label}>
            <Input
              ref={inputRef}
              className="min-h-[48px]"
              onBlur={commit}
              onKeyDown={handleKeyDown}
            />
          </TextField>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group w-full text-left flex items-center gap-4 min-h-[48px] py-1 px-2 -mx-2 rounded hover:bg-primary/5 cursor-text transition-colors"
    >
      <span className="w-[110px] flex-shrink-0 text-[11px] uppercase tracking-wider text-primary font-semibold">
        {label}
      </span>
      <span className="flex-1 text-[15px] text-ink-hi">{value}</span>
      <Pencil
        size={14}
        className="text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        aria-hidden
      />
    </button>
  );
}

// ============================================================================
// UndoToast — pill non-invasivo bottom-center con rollback + X dismiss
// ============================================================================
interface UndoToastState {
  field: string;
  prevValue: string;
  newValue: string;
  rollback: () => void;
  ts: number;
}

function BlurToSaveMock() {
  const [nascita, setNascita] = useState("2000 a.E.V.");
  const [toast, setToast] = useState<UndoToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(id);
  }, [toast]);

  function handleCommit(next: string) {
    if (next === nascita) return;
    const prev = nascita;
    setNascita(next);
    setToast({
      field: "Nascita",
      prevValue: prev,
      newValue: next,
      rollback: () => {
        setNascita(prev);
        setToast(null);
      },
      ts: Date.now(),
    });
  }

  return (
    <div className="relative">
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Descrizione" value="Patriarca dei tre monoteismi." />
      <EditableField label="Nascita" value={nascita} onCommit={handleCommit} />
      <SimpleField label="Morte" value="1825 a.E.V." />
      <SimpleField label="Tribù" value="Ebrei" />
      <div className="mt-3 text-[11px] text-ink-dim italic">
        ↑ Tap su <strong>Nascita</strong> → entra in edit. Tap fuori → salva + toast undo
        (5s). ESC → annulla senza salvare.
      </div>

      <UndoToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function UndoToast({
  toast,
  onDismiss,
}: {
  toast: UndoToastState | null;
  onDismiss: () => void;
}) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-4 transition-[opacity,transform] duration-200 ${
        toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {toast && (
        <div
          key={toast.ts}
          className="pointer-events-auto inline-flex items-center gap-3 pl-4 pr-1.5 py-1.5 bg-slate-900/95 backdrop-blur text-white text-xs rounded-full shadow-xl"
        >
          <Check size={14} className="text-emerald-400 flex-shrink-0" />
          <span>
            <span className="opacity-70">{toast.field}:</span>{" "}
            <span className="font-mono opacity-60 line-through">{toast.prevValue}</span>{" "}
            <span className="font-mono">→</span>{" "}
            <span className="font-mono">{toast.newValue}</span>
          </span>
          <button
            type="button"
            onClick={toast.rollback}
            className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors"
          >
            <Undo2 size={12} />
            Annulla
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Chiudi"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
