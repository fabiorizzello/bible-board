import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Button,
  Chip,
  Drawer,
  Dropdown,
  Input,
  Label,
  Popover,
  Separator,
  TextField,
} from "@heroui/react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  FileText,
  Link2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  Undo2,
  Users,
  X,
} from "lucide-react";
import { Editor, defaultValueCtx, rootCtx } from "@milkdown/core";
import { commonmark } from "@milkdown/preset-commonmark";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { Code, MockupFooter, MockupHeader, RemovableChip } from "./_atoms";
import "./milkdown-iframe.css";

/**
 * Mockup S02/R005 — Sketch 9: Unified editor (integration)
 *
 * Sintesi di tutte le 8 decisioni consolidate in una singola esperienza:
 *   1. Blur-to-save + toast undo (commit pattern)
 *   2. Add field flow (dual-entry: inline "+ <label>" + globale)
 *   4. Milkdown per descrizione (lazy mount, tap-to-edit)
 *   5. Right drawer per composite Vita
 *   6. Soft validation + drawer review
 *   7. Inline titolo + tipo dropdown + kebab actions
 *   8. Metadata chip row + body prose + array sections (Linear style)
 *
 * Non è un'alternativa — è l'integrazione canonica. Ogni edit passa per
 * `commit(label, prev, next, rollback)` → toast undo unificato.
 */

// ============================================================================
// Domain types + constants
// ============================================================================

const TIPI_ELEMENTO = [
  "personaggio",
  "guerra",
  "evento",
  "luogo",
  "profezia",
  "regno",
  "periodo",
  "annotazione",
] as const;
type TipoElemento = (typeof TIPI_ELEMENTO)[number];

interface Collegamento {
  titolo: string;
  ruolo?: string;
  tipo: string;
  gruppo: "famiglia" | "generico";
}

interface Elemento {
  titolo: string;
  tipo: TipoElemento;
  nascita: string;
  morte: string;
  luogoOrigine: string;
  tribu: string;
  descrizione: string;
  ruoli: string[];
  tags: string[];
  collegamenti: Collegamento[];
}

const ABRAAMO_INITIAL: Elemento = {
  titolo: "Abraamo",
  tipo: "personaggio",
  nascita: "2000 a.E.V.",
  morte: "1825 a.E.V.",
  luogoOrigine: "Ur dei Caldei",
  tribu: "Ebrei",
  descrizione: `Patriarca dei **tre monoteismi abramitici**. Chiamato da *Ur dei Caldei*, riceve la promessa divina di una terra e una discendenza.

La sua fede viene messa alla prova nel sacrificio di [Isacco](#isacco), evento chiamato *Akedah*.`,
  ruoli: ["patriarca", "profeta"],
  tags: ["Genesi", "Antico Testamento"],
  collegamenti: [
    { titolo: "Sara", ruolo: "coniuge", tipo: "personaggio", gruppo: "famiglia" },
    { titolo: "Isacco", ruolo: "figlio", tipo: "personaggio", gruppo: "famiglia" },
    { titolo: "Promessa della terra", tipo: "profezia", gruppo: "generico" },
  ],
};

const RUOLI_SUGGESTED = [
  "padre della fede",
  "viandante",
  "ospite di Mamre",
  "capostipite",
];
const TAGS_SUGGESTED = ["Pentateuco", "Ur", "Canaan", "Akedah"];
const COLLEGAMENTI_SUGGESTED: Collegamento[] = [
  { titolo: "Ismaele", ruolo: "figlio", tipo: "personaggio", gruppo: "famiglia" },
  { titolo: "Terach", ruolo: "padre", tipo: "personaggio", gruppo: "famiglia" },
  { titolo: "Sara", ruolo: "coniuge", tipo: "personaggio", gruppo: "famiglia" },
  { titolo: "Promessa della terra", tipo: "profezia", gruppo: "generico" },
  { titolo: "Patto di Mamre", tipo: "evento", gruppo: "generico" },
  { titolo: "Ur dei Caldei", tipo: "luogo", gruppo: "generico" },
];

// ============================================================================
// Validation (soft, at-read — sketch 6 pattern)
// ============================================================================

type WarningSeverity = "warning" | "info";
interface Warning {
  field: keyof Elemento;
  label: string;
  message: string;
  severity: WarningSeverity;
}

function validateElemento(el: Elemento): Warning[] {
  const ws: Warning[] = [];
  if (el.luogoOrigine.trim()) {
    ws.push({
      field: "luogoOrigine",
      label: "Origine",
      message: `"${el.luogoOrigine}" è una stringa libera — considera di collegarlo a un elemento Luogo dedicato`,
      severity: "info",
    });
  }
  if (el.tribu.trim()) {
    ws.push({
      field: "tribu",
      label: "Tribù",
      message: `"${el.tribu}" non è ancora un elemento del workspace`,
      severity: "info",
    });
  }
  return ws;
}

// ============================================================================
// Utilities
// ============================================================================

function parseAEV(d: string): number | null {
  const m = d.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function calcolaDurata(nascita: string, morte: string): string | null {
  const n = parseAEV(nascita);
  const m = parseAEV(morte);
  if (n === null || m === null) return null;
  const anni = Math.abs(n - m);
  return anni > 0 ? `${anni} anni` : null;
}

// ============================================================================
// Toast state
// ============================================================================

interface UndoToastState {
  label: string;
  prevValue: string;
  newValue: string;
  rollback: () => void;
  ts: number;
}

// ============================================================================
// Main component
// ============================================================================

export function UnifiedEditorMockup() {
  const [el, setEl] = useState<Elemento>(ABRAAMO_INITIAL);
  const [toast, setToast] = useState<UndoToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(id);
  }, [toast]);

  function fireToast(
    label: string,
    prev: string,
    next: string,
    rollback: () => void,
  ) {
    setToast({
      label,
      prevValue: prev,
      newValue: next,
      rollback: () => {
        rollback();
        setToast(null);
      },
      ts: Date.now(),
    });
  }

  function commitScalar<K extends keyof Elemento>(
    field: K,
    label: string,
    next: Elemento[K],
  ) {
    const prev = el[field];
    if (prev === next) return;
    setEl({ ...el, [field]: next });
    fireToast(label, String(prev) || "—", String(next) || "—", () =>
      setEl((cur) => ({ ...cur, [field]: prev })),
    );
  }

  function commitVita(nascita: string, morte: string) {
    if (nascita === el.nascita && morte === el.morte) return;
    const prev = { nascita: el.nascita, morte: el.morte };
    setEl({ ...el, nascita, morte });
    fireToast(
      "Vita",
      `${prev.nascita} → ${prev.morte || "—"}`,
      `${nascita} → ${morte || "—"}`,
      () =>
        setEl((cur) => ({
          ...cur,
          nascita: prev.nascita,
          morte: prev.morte,
        })),
    );
  }

  function addArrayValue(field: "ruoli" | "tags", value: string) {
    const clean = value.trim();
    if (!clean) return;
    if (el[field].includes(clean)) return;
    const prev = el[field];
    setEl({ ...el, [field]: [...prev, clean] });
    fireToast(field === "ruoli" ? "Ruolo" : "Tag", "—", `+ ${clean}`, () =>
      setEl((cur) => ({ ...cur, [field]: prev })),
    );
  }

  function removeArrayValue(field: "ruoli" | "tags", value: string) {
    const prev = el[field];
    if (!prev.includes(value)) return;
    setEl({ ...el, [field]: prev.filter((v) => v !== value) });
    fireToast(
      field === "ruoli" ? "Ruolo" : "Tag",
      value,
      "(rimosso)",
      () => setEl((cur) => ({ ...cur, [field]: prev })),
    );
  }

  function addCollegamento(c: Collegamento) {
    if (el.collegamenti.some((x) => x.titolo === c.titolo)) return;
    const prev = el.collegamenti;
    setEl({ ...el, collegamenti: [...prev, c] });
    fireToast(
      "Collegamento",
      "—",
      c.ruolo ? `+ ${c.titolo} · ${c.ruolo}` : `+ ${c.titolo}`,
      () => setEl((cur) => ({ ...cur, collegamenti: prev })),
    );
  }

  function removeCollegamento(titolo: string) {
    const prev = el.collegamenti;
    if (!prev.some((x) => x.titolo === titolo)) return;
    setEl({
      ...el,
      collegamenti: prev.filter((x) => x.titolo !== titolo),
    });
    fireToast("Collegamento", titolo, "(rimosso)", () =>
      setEl((cur) => ({ ...cur, collegamenti: prev })),
    );
  }

  const warnings = validateElemento(el);

  return (
    <div className="min-h-dvh bg-surface text-ink font-body relative">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="9"
          title="Unified editor — integration"
          subtitle={
            <>
              Sintesi di <strong>tutte le 8 decisioni</strong> consolidate in una
              singola esperienza. Ogni edit passa per il pattern{" "}
              <strong>blur-to-save + toast undo</strong> (sketch 1), il layout è{" "}
              <strong>metadata chips + body prose + array sections</strong>{" "}
              (sketch 8), gli edit complessi aprono il <strong>right drawer</strong>{" "}
              (sketch 5 + 2), la validation è <strong>soft e passive</strong>{" "}
              (sketch 6).
            </>
          }
        />

        <IntegrationOverview />

        <BigFrame>
          <UnifiedDetailPane
            el={el}
            warnings={warnings}
            onCommitTitle={(next) => commitScalar("titolo", "Titolo", next)}
            onCommitTipo={(next) => commitScalar("tipo", "Tipo", next)}
            onCommitVita={commitVita}
            onCommitOrigine={(next) =>
              commitScalar("luogoOrigine", "Origine", next)
            }
            onCommitTribu={(next) => commitScalar("tribu", "Tribù", next)}
            onCommitDescrizione={(next) =>
              commitScalar("descrizione", "Descrizione", next)
            }
            onAddRuolo={(v) => addArrayValue("ruoli", v)}
            onRemoveRuolo={(v) => removeArrayValue("ruoli", v)}
            onAddTag={(v) => addArrayValue("tags", v)}
            onRemoveTag={(v) => removeArrayValue("tags", v)}
            onAddCollegamento={addCollegamento}
            onRemoveCollegamento={removeCollegamento}
          />
        </BigFrame>

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Mappatura sketch → elemento:</strong> 1 (toast undo
              condiviso), 2 (drawer dual-entry: inline <Code>+ label</Code>{" "}
              skippa categories · globale <Code>+ Aggiungi campo</Code> apre
              categories), 4 (Milkdown lazy mount), 5 (Vita drawer), 6 (badge
              warning → review drawer), 7 (titolo inline + tipo dropdown + kebab
              senza Rinomina), 8 (chip header + body prose + array sezioni).
            </li>
            <li>
              <strong>Commit unificato:</strong> ogni field ritorna il valore
              nuovo tramite <Code>onCommit(next)</Code>, il componente root
              aggiorna lo state e solleva il toast. Rollback ripristina solo il
              field toccato, non l'intero stato (gestisce edit concorrenti).
            </li>
            <li>
              <strong>Validation inline:</strong> Origine e Tribù come stringhe
              libere generano un warning soft visibile sia inline (
              <AlertTriangle className="inline text-amber-600" size={12} /> sul
              chip) sia nell'header (
              <Chip
                size="sm"
                color="warning"
                variant="soft"
                className="inline-flex align-baseline"
              >
                <span className="inline-flex items-center gap-1">
                  <AlertTriangle size={10} />
                  badge
                </span>
              </Chip>
              ) con drawer review cliccabile.
            </li>
            <li>
              <strong>Sopravvissuti dal pattern:</strong> Milkdown rimonta a
              ogni edit session (clean state). Blur-to-save gestisce sia click
              fuori sia Esc. Drawer e Popover chiudono su tap outside, Esc, X.
            </li>
            <li>
              <strong>Chip touch target:</strong> 28px per densità Linear/Notion
              (sketch 8). Tap area estesa tramite padding. Touch target{" "}
              <code>≥ 44</code> garantito per bottoni primari (titolo input,
              kebab, add field row).
            </li>
          </ul>
        </MockupFooter>
      </div>

      <UndoToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

// ============================================================================
// Overview banner
// ============================================================================

function IntegrationOverview() {
  return (
    <div className="mb-8 px-5 py-4 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-xl">
      <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1">
        Integration mockup · non è un'alternativa
      </div>
      <div className="text-sm text-ink-hi leading-relaxed">
        Questo mockup <strong>compone</strong> le 8 decisioni in un singolo
        detail pane interattivo. Testa qui come le scelte interagiscono: tap un
        metadata chip, apri il drawer Vita, edita la descrizione, aggiungi un
        ruolo, vedi il toast undo condiviso, apri la review warnings.
      </div>
    </div>
  );
}

// ============================================================================
// iPad-sized frame (wider than IpadFrame — detail pane in real proportions)
// ============================================================================

function BigFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-panel border border-edge rounded-xl shadow-md mx-auto"
      style={{ maxWidth: 760 }}
    >
      <div className="h-9 bg-chrome border-b border-edge flex items-center justify-between px-4 text-[10px] uppercase tracking-wider text-ink-lo font-semibold rounded-t-xl">
        <span>iPad 10.9" · detail pane · unified editor · 720px</span>
        <span className="text-emerald-600">touch ≥ 44px ✓ (primari)</span>
      </div>
      <div className="px-8 py-7">{children}</div>
    </div>
  );
}

// ============================================================================
// Unified detail pane
// ============================================================================

interface UnifiedDetailPaneProps {
  el: Elemento;
  warnings: Warning[];
  onCommitTitle: (next: string) => void;
  onCommitTipo: (next: TipoElemento) => void;
  onCommitVita: (nascita: string, morte: string) => void;
  onCommitOrigine: (next: string) => void;
  onCommitTribu: (next: string) => void;
  onCommitDescrizione: (next: string) => void;
  onAddRuolo: (v: string) => void;
  onRemoveRuolo: (v: string) => void;
  onAddTag: (v: string) => void;
  onRemoveTag: (v: string) => void;
  onAddCollegamento: (c: Collegamento) => void;
  onRemoveCollegamento: (titolo: string) => void;
}

function UnifiedDetailPane({
  el,
  warnings,
  onCommitTitle,
  onCommitTipo,
  onCommitVita,
  onCommitOrigine,
  onCommitTribu,
  onCommitDescrizione,
  onAddRuolo,
  onRemoveRuolo,
  onAddTag,
  onRemoveTag,
  onAddCollegamento,
  onRemoveCollegamento,
}: UnifiedDetailPaneProps) {
  const origineWarning = warnings.find((w) => w.field === "luogoOrigine");
  const tribuWarning = warnings.find((w) => w.field === "tribu");

  return (
    <div>
      {/* Header: titolo inline + validation badge + kebab */}
      <HeaderRow
        titolo={el.titolo}
        warnings={warnings}
        onCommitTitle={onCommitTitle}
      />

      {/* Metadata chip row: tipo · Vita · Origine · Tribù */}
      <div className="flex flex-wrap gap-2 mb-7">
        <TipoDropdownChip tipo={el.tipo} onCommit={onCommitTipo} />
        <VitaDrawerChip
          nascita={el.nascita}
          morte={el.morte}
          onCommit={onCommitVita}
        />
        <MetaChipText
          icon={<MapPin size={12} />}
          label="Origine"
          value={el.luogoOrigine}
          warning={origineWarning}
          promotionHint="Per ora stringa rapida. In wiring può diventare un collegamento a un Elemento Luogo."
          onCommit={onCommitOrigine}
        />
        <MetaChipText
          icon={<Users size={12} />}
          label="Tribù"
          value={el.tribu}
          warning={tribuWarning}
          promotionHint="Per ora stringa rapida. Il mockup rimarca che può essere promossa a Elemento collegato del workspace."
          onCommit={onCommitTribu}
        />
      </div>

      {/* Body: descrizione markdown */}
      <DescrizioneBody value={el.descrizione} onCommit={onCommitDescrizione} />

      {/* Array sections */}
      <RuoliSection
        ruoli={el.ruoli}
        onAdd={onAddRuolo}
        onRemove={onRemoveRuolo}
      />
      <TagsSection tags={el.tags} onAdd={onAddTag} onRemove={onRemoveTag} />
      <CollegamentiFamiliariSection
        collegamenti={el.collegamenti}
        onAdd={onAddCollegamento}
        onRemove={onRemoveCollegamento}
      />
      <CollegamentiGenericiSection
        collegamenti={el.collegamenti}
        onAdd={onAddCollegamento}
        onRemove={onRemoveCollegamento}
      />

      {/* Globale add field */}
      <div className="mt-6 pt-5 border-t border-edge">
        <AddFieldGlobalButton
          onAddRuolo={onAddRuolo}
          onAddTag={onAddTag}
          onAddCollegamento={onAddCollegamento}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Header row: titolo inline-editable + validation badge + kebab
// ============================================================================

function HeaderRow({
  titolo,
  warnings,
  onCommitTitle,
}: {
  titolo: string;
  warnings: Warning[];
  onCommitTitle: (next: string) => void;
}) {
  return (
    <div className="flex items-start justify-between pb-4 border-b border-edge mb-5 gap-3">
      <InlineTitle value={titolo} onCommit={onCommitTitle} />
      <div className="flex items-center gap-2 flex-shrink-0">
        {warnings.length > 0 && <ValidationBadgeDrawer warnings={warnings} />}
        <ActionsDropdown />
      </div>
    </div>
  );
}

function InlineTitle({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (next: string) => void;
}) {
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
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") cancel();
    if (e.key === "Enter") commit();
  }

  if (editing) {
    return (
      <div className="flex-1 min-w-0">
        <TextField value={draft} onChange={setDraft} aria-label="Titolo">
          <Input
            ref={inputRef}
            className="min-h-[44px] text-2xl font-heading font-semibold"
            onBlur={commit}
            onKeyDown={handleKeyDown}
          />
        </TextField>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group min-w-0 flex-1 text-left font-heading text-2xl font-semibold text-ink-hi leading-tight rounded-md px-2 -mx-2 py-1 transition-colors hover:bg-primary/5 cursor-text inline-flex items-center gap-2"
    >
      <span className="truncate">{value}</span>
      <Pencil
        size={14}
        className="text-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        aria-hidden
      />
    </button>
  );
}

function ActionsDropdown() {
  return (
    <Dropdown>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Azioni elemento"
        className="min-w-10 min-h-10"
      >
        <MoreHorizontal size={18} />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Item id="duplicate" textValue="Duplica">
            <span className="inline-flex items-center gap-2">
              <Copy size={14} /> <Label>Duplica</Label>
            </span>
          </Dropdown.Item>
          <Separator />
          <Dropdown.Item id="delete" textValue="Elimina" variant="danger">
            <span className="inline-flex items-center gap-2">
              <Trash2 size={14} /> <Label>Elimina</Label>
            </span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

// ============================================================================
// Validation badge + drawer review (sketch 6)
// ============================================================================

function ValidationBadgeDrawer({ warnings }: { warnings: Warning[] }) {
  return (
    <Drawer>
      <Drawer.Trigger className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-semibold hover:bg-amber-200 cursor-pointer transition-colors">
        <AlertTriangle size={12} />
        {warnings.length} da rivedere
      </Drawer.Trigger>
      <Drawer.Backdrop>
        <Drawer.Content placement="right" className="w-[400px] max-w-[90vw]">
          <Drawer.Dialog>
            <Drawer.Header className="px-6 py-4 border-b border-edge flex items-center justify-between">
              <Drawer.Heading className="font-heading text-lg text-ink-hi inline-flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" />
                Da rivedere ({warnings.length})
              </Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body className="px-6 py-5 space-y-3">
              {warnings.map((w, i) => (
                <ReviewItem key={`${w.field}-${i}`} warning={w} />
              ))}
            </Drawer.Body>
            <Drawer.Footer className="px-6 py-3 border-t border-edge text-[11px] text-ink-dim">
              Tap su un item per saltare al field · tap outside, Esc, X per
              chiudere
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

function ReviewItem({ warning }: { warning: Warning }) {
  const tone =
    warning.severity === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : "bg-blue-50 border-blue-200 text-blue-900";
  const icon =
    warning.severity === "warning" ? "text-amber-600" : "text-blue-600";
  return (
    <div
      className={`p-3 rounded-md border cursor-pointer hover:shadow-sm transition-shadow ${tone}`}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle size={16} className={`flex-shrink-0 mt-0.5 ${icon}`} />
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-75 mb-0.5 inline-flex items-center gap-1">
            {warning.label}
            <ArrowRight size={10} className="opacity-60" />
          </div>
          <div className="text-xs leading-relaxed">{warning.message}</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Metadata chips
// ============================================================================

function ChipVisual({
  icon,
  label,
  value,
  primary,
  warning,
  suffix,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  primary?: boolean;
  warning?: boolean;
  suffix?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 min-h-[32px] px-3 py-1 rounded-full border transition-colors ${
        primary
          ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
          : warning
            ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
            : "border-edge bg-chrome text-ink-md hover:border-primary/30 hover:bg-primary/5"
      }`}
    >
      <span
        className={
          primary
            ? "text-primary"
            : warning
              ? "text-amber-700"
              : "text-ink-lo"
        }
      >
        {icon}
      </span>
      <span className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">
        {label}
      </span>
      <span className="text-[13px] font-medium">{value || "—"}</span>
      {warning && (
        <AlertTriangle
          size={12}
          className="text-amber-600 flex-shrink-0"
          aria-hidden
        />
      )}
      {suffix}
    </span>
  );
}

// Tipo: popover with list of TipoElemento (sketch 7 pattern, called "dropdown" colloquially)
function TipoDropdownChip({
  tipo,
  onCommit,
}: {
  tipo: TipoElemento;
  onCommit: (next: TipoElemento) => void;
}) {
  const [open, setOpen] = useState(false);

  function handlePick(t: TipoElemento) {
    if (t !== tipo) onCommit(t);
    setOpen(false);
  }

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <Popover.Trigger className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        <ChipVisual
          icon={<Users size={12} />}
          label="Tipo"
          value={tipo}
          primary
          suffix={
            <ChevronDown size={12} className="text-primary/60 flex-shrink-0" />
          }
        />
      </Popover.Trigger>
      <Popover.Content className="w-[260px]">
        <Popover.Dialog className="bg-panel border border-edge rounded-xl shadow-xl p-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold px-2 py-1.5">
            TipoElemento
          </div>
          <div className="max-h-[280px] overflow-y-auto">
            {TIPI_ELEMENTO.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handlePick(t)}
                className={`w-full text-left inline-flex items-center justify-between gap-2 min-h-[40px] px-3 py-1.5 rounded-md text-sm transition-colors ${
                  t === tipo
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-ink-hi hover:bg-primary/5"
                }`}
              >
                <span>{t}</span>
                {t === tipo && <Check size={14} />}
              </button>
            ))}
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

// Vita: right drawer (sketch 5)
function VitaDrawerChip({
  nascita,
  morte,
  onCommit,
}: {
  nascita: string;
  morte: string;
  onCommit: (nascita: string, morte: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draftN, setDraftN] = useState(nascita);
  const [draftM, setDraftM] = useState(morte);

  useEffect(() => {
    if (open) {
      setDraftN(nascita);
      setDraftM(morte);
    }
  }, [open, nascita, morte]);

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && (draftN !== nascita || draftM !== morte)) {
      onCommit(draftN.trim(), draftM.trim());
    }
    setOpen(isOpen);
  }

  const durata = calcolaDurata(draftN || nascita, draftM || morte);
  const durataDisplay = calcolaDurata(nascita, morte);
  const displayValue = `${nascita} → ${morte || "—"}${
    durataDisplay ? ` · ${durataDisplay}` : ""
  }`;

  return (
    <Drawer isOpen={open} onOpenChange={handleOpenChange}>
      <Drawer.Trigger className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        <ChipVisual
          icon={<Calendar size={12} />}
          label="Vita"
          value={displayValue}
        />
      </Drawer.Trigger>
      <Drawer.Backdrop>
        <Drawer.Content placement="right" className="w-[440px] max-w-[90vw]">
          <Drawer.Dialog>
            <Drawer.Header className="px-7 py-5 border-b border-edge">
              <Drawer.Heading className="font-heading text-xl text-ink-hi">
                Modifica vita
              </Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body className="px-7 py-6 space-y-5">
              <TextField value={draftN} onChange={setDraftN}>
                <Label className="block text-[11px] uppercase text-ink-lo font-semibold mb-2">
                  Nato (obbligatoria)
                </Label>
                <Input className="min-h-[52px] text-base" />
              </TextField>
              <TextField value={draftM} onChange={setDraftM}>
                <Label className="block text-[11px] uppercase text-ink-lo font-semibold mb-2">
                  Morto{" "}
                  <span className="opacity-60 normal-case">(opzionale)</span>
                </Label>
                <Input placeholder="—" className="min-h-[52px] text-base" />
              </TextField>
              <div className="flex justify-between items-center pt-3 border-t border-edge text-sm">
                <span className="text-primary font-semibold">
                  Durata calcolata
                </span>
                <span className="text-ink-hi font-mono font-semibold">
                  {durata ?? "—"}
                </span>
              </div>
            </Drawer.Body>
            <Drawer.Footer className="px-7 py-3 text-[11px] text-ink-dim border-t border-edge">
              Tap fuori, Esc, o X per chiudere e salvare (toast undo)
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

// Scalar text metadata: popover with input (blur-to-save + toast via parent)
function MetaChipText({
  icon,
  label,
  value,
  warning,
  promotionHint,
  onCommit,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  warning?: Warning;
  promotionHint?: string;
  onCommit: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(value);
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [open, value]);

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && draft.trim() !== value) {
      onCommit(draft.trim());
    }
    setOpen(isOpen);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      setOpen(false);
    }
    if (e.key === "Escape") {
      setDraft(value);
      setOpen(false);
    }
  }

  return (
    <Popover isOpen={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger
        className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        title={warning?.message}
      >
        <ChipVisual
          icon={icon}
          label={label}
          value={value}
          warning={Boolean(warning)}
          suffix={
            <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-ink-lo">
              collegabile
            </span>
          }
        />
      </Popover.Trigger>
      <Popover.Content className="w-[320px]">
        <Popover.Dialog className="bg-panel border border-edge rounded-xl shadow-xl p-4">
          <Label className="block text-[10px] uppercase text-ink-lo font-bold mb-2">
            {label}
          </Label>
          <TextField value={draft} onChange={setDraft} aria-label={label}>
            <Input
              ref={inputRef}
              className="min-h-[44px]"
              onKeyDown={handleKeyDown}
            />
          </TextField>
          {warning && (
            <div className="mt-3 pt-3 border-t border-edge flex items-start gap-2 text-[11px] text-amber-900">
              <AlertTriangle
                size={12}
                className="text-amber-600 flex-shrink-0 mt-0.5"
              />
              <span className="leading-relaxed">{warning.message}</span>
            </div>
          )}
          {promotionHint && (
            <div className="mt-3 rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2 text-[11px] leading-relaxed text-ink-md">
              <div className="font-semibold text-ink-hi mb-1">
                Fondazione del mockup
              </div>
              <div>{promotionHint}</div>
            </div>
          )}
          <div className="mt-2 text-[10px] text-ink-dim">
            Enter salva · Esc annulla · tap fuori salva
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

// ============================================================================
// Descrizione body: prose readonly → tap → Milkdown lazy mount
// ============================================================================

function DescrizioneBody({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (next: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [editing, value]);

  useEffect(() => {
    if (!editing) return;
    const id = requestAnimationFrame(() => {
      const pm = containerRef.current?.querySelector<HTMLElement>(
        ".ProseMirror",
      );
      pm?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [editing]);

  function handleContainerBlur(e: FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      onCommit(draft);
      setEditing(false);
    }
  }

  function handleDone() {
    onCommit(draft);
    setEditing(false);
  }

  return (
    <section className="mb-7">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold">
          Descrizione
        </div>
        {editing && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleDone}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-primary text-white text-[11px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Check size={12} />
            Fatto
          </button>
        )}
      </div>

      {editing ? (
        <div
          ref={containerRef}
          onBlur={handleContainerBlur}
          tabIndex={-1}
          className="milkdown-host rounded-lg border border-primary/40 bg-primary/[0.02] px-3 py-2 min-h-[140px] focus-within:border-primary"
        >
          <MilkdownProvider>
            <MilkdownEditorInline
              defaultValue={value}
              onChange={setDraft}
            />
          </MilkdownProvider>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full text-left rounded-lg border border-transparent hover:border-primary/20 hover:bg-primary/[0.02] px-3 -mx-3 py-2 transition-colors cursor-text min-h-[140px]"
        >
          <MarkdownPreview value={value} />
        </button>
      )}
    </section>
  );
}

function MilkdownEditorInline({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (md: string) => void;
}) {
  useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, defaultValue);
        ctx
          .get(listenerCtx)
          .markdownUpdated((_ctx, markdown) => onChange(markdown));
      })
      .use(commonmark)
      .use(listener),
  );
  return <Milkdown />;
}

function MarkdownPreview({ value }: { value: string }) {
  if (!value.trim()) {
    return (
      <em className="text-ink-dim text-[15px]">
        Tap per aggiungere una descrizione…
      </em>
    );
  }
  const paragraphs = value.split(/\n\n+/);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="text-[15px] leading-relaxed text-ink-hi first:mt-0"
        >
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1]) {
      parts.push(
        <strong key={`b${k++}`} className="font-semibold text-ink-hi">
          {m[1]}
        </strong>,
      );
    } else if (m[2]) {
      parts.push(
        <em key={`i${k++}`} className="italic">
          {m[2]}
        </em>,
      );
    } else if (m[3]) {
      parts.push(
        <a
          key={`a${k++}`}
          href={m[4]}
          className="text-primary underline decoration-primary/40 hover:decoration-primary"
        >
          {m[3]}
        </a>,
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ============================================================================
// Array sections: chips + inline "+ <label>" dashed chip
// ============================================================================

function ArraySectionShell({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-ink-lo">{icon}</span>
        <span className="text-[10px] uppercase tracking-wider text-ink-lo font-bold">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </section>
  );
}

function RuoliSection({
  ruoli,
  onAdd,
  onRemove,
}: {
  ruoli: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  return (
    <ArraySectionShell icon={<Tag size={12} />} label="Ruoli">
      {ruoli.map((r) => (
        <RemovableChip
          key={r}
          size="md"
          className="bg-chip-bg text-ink-lo"
          onRemove={() => onRemove(r)}
        >
          {r}
        </RemovableChip>
      ))}
      <InlineAddMultiChip
        label="ruolo"
        existing={ruoli}
        suggestions={RUOLI_SUGGESTED}
        onAdd={onAdd}
      />
    </ArraySectionShell>
  );
}

function TagsSection({
  tags,
  onAdd,
  onRemove,
}: {
  tags: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  return (
    <ArraySectionShell icon={<Tag size={12} />} label="Tags">
      {tags.map((t) => (
        <RemovableChip
          key={t}
          size="md"
          className="bg-chip-bg text-ink-lo"
          onRemove={() => onRemove(t)}
        >
          {t}
        </RemovableChip>
      ))}
      <InlineAddMultiChip
        label="tag"
        existing={tags}
        suggestions={TAGS_SUGGESTED}
        onAdd={onAdd}
      />
    </ArraySectionShell>
  );
}

function CollegamentiFamiliariSection({
  collegamenti,
  onAdd,
  onRemove,
}: {
  collegamenti: Collegamento[];
  onAdd: (c: Collegamento) => void;
  onRemove: (titolo: string) => void;
}) {
  const familiari = collegamenti.filter((c) => c.gruppo === "famiglia");

  return (
    <ArraySectionShell icon={<Users size={12} />} label="Familiari">
      {familiari.map((c) => (
        <RemovableChip
          key={c.titolo}
          size="md"
          className="bg-primary/10 text-primary"
          onRemove={() => onRemove(c.titolo)}
        >
          <span className="inline-flex items-center gap-1">
            {c.titolo}
            {c.ruolo && <span className="opacity-60">· {c.ruolo}</span>}
          </span>
        </RemovableChip>
      ))}
      <InlineAddCollegamento
        mode="famiglia"
        existing={collegamenti}
        onAdd={onAdd}
      />
    </ArraySectionShell>
  );
}

function CollegamentiGenericiSection({
  collegamenti,
  onAdd,
  onRemove,
}: {
  collegamenti: Collegamento[];
  onAdd: (c: Collegamento) => void;
  onRemove: (titolo: string) => void;
}) {
  const generici = collegamenti.filter((c) => c.gruppo === "generico");

  return (
    <ArraySectionShell icon={<Link2 size={12} />} label="Collegamenti">
      {generici.map((c) => (
        <RemovableChip
          key={c.titolo}
          size="md"
          className="bg-primary/10 text-primary"
          onRemove={() => onRemove(c.titolo)}
        >
          <span className="inline-flex items-center gap-1">
            {c.titolo}
            {c.ruolo && <span className="opacity-60">· {c.ruolo}</span>}
          </span>
        </RemovableChip>
      ))}
      <InlineAddCollegamento
        mode="generico"
        existing={collegamenti}
        onAdd={onAdd}
      />
    </ArraySectionShell>
  );
}

// ============================================================================
// Inline add triggers (skip categories — sketch 2 dual-entry)
// ============================================================================

function DashedAddChip({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full border border-dashed border-primary/40 text-primary/80 text-xs font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors"
    >
      <Plus size={12} />
      {label}
    </span>
  );
}

function InlineAddMultiChip({
  label,
  existing,
  suggestions,
  onAdd,
}: {
  label: string;
  existing: string[];
  suggestions: string[];
  onAdd: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer isOpen={open} onOpenChange={setOpen}>
      <Drawer.Trigger className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full border border-dashed border-primary/40 text-primary/80 text-xs font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
        <Plus size={12} />
        {label}
      </Drawer.Trigger>
      <Drawer.Backdrop>
        <Drawer.Content placement="right" className="w-[440px] max-w-[90vw]">
          <Drawer.Dialog>
            <Drawer.Header className="px-6 py-4 border-b border-edge">
              <Drawer.Heading className="font-heading text-lg text-ink-hi">
                Aggiungi {label}
              </Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body className="px-2 py-3">
              <MultiAddContent
                label={label}
                existing={existing}
                suggestions={suggestions}
                onAdd={onAdd}
              />
            </Drawer.Body>
            <Drawer.Footer className="px-6 py-3 border-t border-edge text-[11px] text-ink-dim">
              Enter o tap suggerito per aggiungere · tap fuori / Esc per
              chiudere
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

function MultiAddContent({
  label,
  existing,
  suggestions,
  onAdd,
}: {
  label: string;
  existing: string[];
  suggestions: string[];
  onAdd: (v: string) => void;
}) {
  const [text, setText] = useState("");
  const filteredSuggestions = suggestions.filter((s) => !existing.includes(s));

  function submit(v: string) {
    const clean = v.trim();
    if (!clean || existing.includes(clean)) return;
    onAdd(clean);
    setText("");
  }

  return (
    <div className="p-4 space-y-3">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none z-10"
        />
        <TextField value={text} onChange={setText} aria-label={`Aggiungi ${label}`}>
          <Input
            placeholder={`Aggiungi ${label}…`}
            className="min-h-[44px] pl-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit(text);
              }
            }}
          />
        </TextField>
      </div>
      {text.length > 0 && (
        <button
          type="button"
          onClick={() => submit(text)}
          className="w-full flex items-center gap-2 min-h-[40px] px-2 rounded-md hover:bg-primary/5 text-sm text-primary font-medium cursor-pointer"
        >
          <Plus size={12} />
          Aggiungi "<span className="font-semibold">{text}</span>"
        </button>
      )}
      {filteredSuggestions.length > 0 && text.length === 0 && (
        <>
          <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold px-2">
            Suggeriti dal workspace
          </div>
          <div className="space-y-0.5">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="w-full text-left flex items-center min-h-[40px] px-2 rounded-md hover:bg-primary/5 text-sm text-ink-hi cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function InlineAddCollegamento({
  mode,
  existing,
  onAdd,
}: {
  mode: "famiglia" | "generico";
  existing: Collegamento[];
  onAdd: (c: Collegamento) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer isOpen={open} onOpenChange={setOpen}>
      <Drawer.Trigger className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full border border-dashed border-primary/40 text-primary/80 text-xs font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
        <Plus size={12} />
        {mode === "famiglia" ? "familiare" : "collegamento"}
      </Drawer.Trigger>
      <Drawer.Backdrop>
        <Drawer.Content placement="right" className="w-[440px] max-w-[90vw]">
          <Drawer.Dialog>
            <Drawer.Header className="px-6 py-4 border-b border-edge">
              <Drawer.Heading className="font-heading text-lg text-ink-hi">
                {mode === "famiglia" ? "Aggiungi Familiare" : "Aggiungi Collegamento"}
              </Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body className="px-2 py-3">
              <CollegamentoAddContent
                mode={mode}
                existing={existing}
                onAdd={(c) => {
                  onAdd(c);
                }}
              />
            </Drawer.Body>
            <Drawer.Footer className="px-6 py-3 border-t border-edge text-[11px] text-ink-dim">
              {mode === "famiglia"
                ? "Scegli elemento + ruolo · tap fuori / Esc per chiudere"
                : "Scegli elemento; il ruolo è opzionale · tap fuori / Esc per chiudere"}
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

const RUOLI_PARENTELA = [
  "figlio",
  "figlia",
  "padre",
  "madre",
  "coniuge",
  "fratello",
  "sorella",
];

function CollegamentoAddContent({
  mode,
  existing,
  onAdd,
}: {
  mode: "famiglia" | "generico";
  existing: Collegamento[];
  onAdd: (c: Collegamento) => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Collegamento | null>(null);
  const [ruolo, setRuolo] = useState<string | null>(null);

  const existingTitoli = new Set(existing.map((c) => c.titolo));
  const candidates = COLLEGAMENTI_SUGGESTED.filter(
    (c) =>
      c.gruppo === mode &&
      !existingTitoli.has(c.titolo) &&
      (search.trim() === "" ||
        c.titolo.toLowerCase().includes(search.toLowerCase())),
  );

  function commit() {
    if (!selected) return;
    if (mode === "famiglia" && !ruolo) return;
    onAdd({
      titolo: selected.titolo,
      ruolo: mode === "famiglia" ? ruolo ?? undefined : ruolo ?? undefined,
      tipo: selected.tipo,
      gruppo: mode,
    });
    setSelected(null);
    setRuolo(null);
    setSearch("");
  }

  return (
    <div className="p-4 space-y-3">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none z-10"
        />
        <TextField value={search} onChange={setSearch} aria-label="Cerca">
          <Input
            placeholder="Cerca elemento da linkare…"
            className="min-h-[44px] pl-9 text-sm"
          />
        </TextField>
      </div>
      <div className="max-h-[200px] overflow-y-auto space-y-0.5 -mx-1">
        {candidates.length === 0 && (
          <div className="text-xs text-ink-dim italic px-2 py-3">
            Nessun elemento trovato
          </div>
        )}
        {candidates.map((c) => (
          <button
            key={c.titolo}
            type="button"
            onClick={() => setSelected(c)}
            className={`w-full text-left flex items-center gap-3 min-h-[44px] px-2 rounded-md cursor-pointer transition-colors ${
              selected?.titolo === c.titolo ? "bg-primary/15" : "hover:bg-primary/5"
            }`}
          >
            <span className="flex-1 text-sm text-ink-hi font-medium">
              {c.titolo}
            </span>
            <Chip
              size="sm"
              variant="soft"
              className="bg-chip-bg text-ink-lo text-[10px]"
            >
              {c.tipo}
            </Chip>
          </button>
        ))}
      </div>
      {selected && (
        <div className="pt-3 border-t border-edge space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold">
            {mode === "famiglia" ? "Ruolo" : "Ruolo opzionale"}
          </div>
          {mode === "famiglia" ? (
            <div className="flex flex-wrap gap-1.5">
              {RUOLI_PARENTELA.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRuolo(r)}
                  className={`inline-flex items-center h-9 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    ruolo === r
                      ? "bg-primary text-white"
                      : "bg-chip-bg text-ink-md hover:bg-primary/10"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          ) : (
            <TextField value={ruolo ?? ""} onChange={setRuolo} aria-label="Ruolo opzionale">
              <Input
                placeholder="es. adempimento, causa-effetto, localizzazione"
                className="min-h-[44px]"
              />
            </TextField>
          )}
          {mode === "generico" && (
            <div className="text-[11px] text-ink-dim leading-relaxed">
              Non tutti i collegamenti hanno un ruolo. Il mockup lascia il ruolo
              opzionale per i collegamenti generici.
            </div>
          )}
          <Button
            variant="primary"
            onClick={commit}
            isDisabled={mode === "famiglia" && !ruolo}
            className="w-full mt-2 min-h-[44px]"
          >
            <span className="inline-flex items-center gap-1.5">
              <Plus size={14} />
              Aggiungi {selected.titolo}
              {ruolo ? ` come ${ruolo}` : ""}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Globale "+ Aggiungi campo" — categories flow (sketch 2 C pattern)
// ============================================================================

type CategoryKind =
  | "ruoli"
  | "tags"
  | "collegamento-familiare"
  | "collegamento"
  | "fonte";

function AddFieldGlobalButton({
  onAddRuolo,
  onAddTag,
  onAddCollegamento,
}: {
  onAddRuolo: (v: string) => void;
  onAddTag: (v: string) => void;
  onAddCollegamento: (c: Collegamento) => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CategoryKind | null>(null);

  function reset() {
    setView(null);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) reset();
    setOpen(isOpen);
  }

  return (
    <Drawer isOpen={open} onOpenChange={handleOpenChange}>
      <Drawer.Trigger className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-lg border border-dashed border-primary/40 text-primary/80 text-sm font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
        <Plus size={16} />
        Aggiungi campo
      </Drawer.Trigger>
      <Drawer.Backdrop>
        <Drawer.Content placement="right" className="w-[440px] max-w-[90vw]">
          <Drawer.Dialog>
            <Drawer.Header className="px-6 py-4 border-b border-edge">
              <Drawer.Heading className="font-heading text-lg text-ink-hi inline-flex items-center gap-2">
                {view !== null && (
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ink-md hover:bg-primary/5 hover:text-primary cursor-pointer"
                    aria-label="Indietro"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                {view === null && "Aggiungi al detail"}
                {view === "ruoli" && "Aggiungi Ruolo"}
                {view === "tags" && "Aggiungi Tag"}
                {view === "collegamento-familiare" && "Aggiungi Familiare"}
                {view === "collegamento" && "Aggiungi Collegamento"}
                {view === "fonte" && "Fonte (fuori scope)"}
              </Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body className="px-2 py-3">
              {view === null && <CategoriesContent onPick={setView} />}
              {view === "ruoli" && (
                <MultiAddContent
                  label="ruolo"
                  existing={[]}
                  suggestions={RUOLI_SUGGESTED}
                  onAdd={onAddRuolo}
                />
              )}
              {view === "tags" && (
                <MultiAddContent
                  label="tag"
                  existing={[]}
                  suggestions={TAGS_SUGGESTED}
                  onAdd={onAddTag}
                />
              )}
              {view === "collegamento-familiare" && (
                <CollegamentoAddContent
                  mode="famiglia"
                  existing={[]}
                  onAdd={onAddCollegamento}
                />
              )}
              {view === "collegamento" && (
                <CollegamentoAddContent
                  mode="generico"
                  existing={[]}
                  onAdd={onAddCollegamento}
                />
              )}
              {view === "fonte" && (
                <div className="p-4 text-sm text-ink-md leading-relaxed">
                  <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    Fonti sono fuori scope S02/R005. Verrà coperto da sketch
                    dedicato (value object <Code>Fonte</Code> con tipo · ref ·
                    url).
                  </div>
                </div>
              )}
            </Drawer.Body>
            <Drawer.Footer className="px-6 py-3 border-t border-edge text-[11px] text-ink-dim">
              Tap fuori / Esc per chiudere
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}

function CategoriesContent({
  onPick,
}: {
  onPick: (k: CategoryKind) => void;
}) {
  return (
    <div className="p-4">
      <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-3">
        Aggiungi al detail di Abraamo
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
        Field tipizzati (personaggio)
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <CategoryButton
          icon={<Users size={14} />}
          label="Ruoli"
          onClick={() => onPick("ruoli")}
        />
        <CategoryButton
          icon={<Tag size={14} />}
          label="Tags"
          onClick={() => onPick("tags")}
        />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2 pt-3 border-t border-edge">
        Universali
      </div>
      <div className="flex flex-wrap gap-2">
        <CategoryButton
          icon={<Users size={14} />}
          label="Familiare"
          onClick={() => onPick("collegamento-familiare")}
        />
        <CategoryButton
          icon={<Link2 size={14} />}
          label="Collegamento"
          onClick={() => onPick("collegamento")}
        />
        <CategoryButton
          icon={<FileText size={14} />}
          label="Fonte"
          onClick={() => onPick("fonte")}
        />
      </div>
    </div>
  );
}

function CategoryButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full bg-primary/5 hover:bg-primary/15 border border-primary/20 hover:border-primary/40 text-ink-hi text-sm font-medium transition-colors cursor-pointer"
    >
      <span className="text-primary">{icon}</span>
      {label}
    </button>
  );
}

// ============================================================================
// UndoToast — fixed bottom-center, z-50
// ============================================================================

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
      className={`pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-6 z-50 transition-all duration-200 ${
        toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {toast && (
        <div
          key={toast.ts}
          className="pointer-events-auto inline-flex items-center gap-3 pl-4 pr-1.5 py-1.5 bg-slate-900/95 backdrop-blur text-white text-xs rounded-full shadow-xl"
        >
          <Check size={14} className="text-emerald-400 flex-shrink-0" />
          <span className="max-w-[460px] truncate">
            <span className="opacity-70">{toast.label}:</span>{" "}
            <span className="font-mono opacity-60 line-through">
              {toast.prevValue}
            </span>{" "}
            <span className="font-mono">→</span>{" "}
            <span className="font-mono">{toast.newValue}</span>
          </span>
          <button
            type="button"
            onClick={toast.rollback}
            className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Undo2 size={12} />
            Annulla
          </button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Chiudi"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
