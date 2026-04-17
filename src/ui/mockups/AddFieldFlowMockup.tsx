import { useState, type ReactNode } from "react";
import { Chip, Drawer, Input, TextField } from "@heroui/react";
import {
  ChevronLeft,
  FileText,
  Link2,
  Plus,
  Search,
  Star,
  Tag,
  Users,
} from "lucide-react";
import {
  Alternative,
  Code,
  ConsideredAlternatives,
  ElementoHeader,
  MockupFooter,
  MockupHeader,
  RemovableChip,
  SimpleField,
} from "./_atoms";

/**
 * Mockup S02/R005 — Sketch 2: Add field flow UNIFICATO
 *
 * Il flow completo "+ aggiungi campo" → categories → (multi-chip OR picker) → commit
 * come UNA decisione. Copriamo entrambi i sub-flow (multi-value tipo Ruoli/Tags +
 * single-value tipo Collegamento/Fonte) perché sono parti dello stesso gesto utente.
 *
 * 3 alternative per la intera UX del flow:
 *   A. Tutto nel popover: content swap interno  ⭐ RECOMMENDED
 *   B. Escalation: popover leggero → right drawer per picker complesso
 *   C. Right drawer sempre (stesso primitive di sketch 5 Vita)
 */

export function AddFieldFlowMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="2"
          title="Add field flow (unified)"
          subtitle={
            <>
              "+ aggiungi campo" + sub-flow multi-value (Ruoli, Tags) + sub-flow
              single-value (Collegamento, Fonte) come <strong>unica decisione UX</strong>.
              3 alternative per la intera esperienza.
            </>
          }
        />

        <Alternative
          letter="C"
          recommended
          title="Right drawer sempre (single surface)"
          subtitle="tap + aggiungi → drawer 440px con categories + content swap interno · coerente con sketch 5 Vita"
          mock={<AltCDrawerAlways />}
          grammatica={
            <>
              Tap "+ aggiungi" → <Code>{`<Drawer placement="right">`}</Code> 440px si apre
              immediatamente con la categories view (Field tipizzati + Universali).
              <br />
              Tap categoria → content swap all'interno del drawer:
              <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                <li>
                  Multi-value (Ruoli, Tags) → input text + chip preview + suggestions
                </li>
                <li>
                  Single-value (Collegamento, Fonte) → search + grouped list + metadata
                </li>
              </ul>
              Back arrow per tornare a categories. Tap fuori / Esc / X → close.
              <br />
              <strong>Stesso primitive di sketch 5 A (Vita)</strong> — pattern unified
              tablet-native: ogni edit complesso = right drawer.
            </>
          }
          items={[
            ["pro", "<strong>Consistency totale</strong> col composite Vita (sketch 5 A) — una regola sola: edit complesso = drawer"],
            ["pro", "Sfrutta lo spazio orizzontale di iPad 10.9\" landscape (1180px)"],
            ["pro", "Un solo surface dall'inizio alla fine, content swap interno"],
            ["pro", "Pattern Apple Pages format inspector — riconoscibile su iPad"],
            ["pro", "Picker complessi (Collegamento con search+filtri+ruolo) hanno respiro"],
            ["con", "Overkill per task minimo (es. add 1 tag) — costo basso accettato"],
            ["con", "iPad portrait (820px) il drawer copre ~50% del detail pane"],
          ]}
        />

        <ConsideredAlternatives
          entries={[
            {
              letter: "A",
              title: "Popover unico con content swap",
              summary:
                "Popover ~380px con categories view → sub-view interne con back arrow. Tutto in un solo surface lightweight.",
              pros: [
                "Un solo surface, zero flicker, fluido",
                "Lightweight: popover ≤ 380px preserva contesto detail",
                "Multi-value e single-value riusano lo stesso wrapper",
              ],
              cons: [
                "Popover 380px è web-feel su iPad landscape",
                "Spazio stretto per picker complessi (Collegamento con search+grouped+ruolo)",
                "Inconsistente con sketch 5 (Vita = drawer)",
              ],
              whyRejected:
                "Su iPad landscape (1180px) il popover 380px non sfrutta lo spazio. Inoltre rompe la coerenza con sketch 5 A che usa drawer per edit complesso. Una regola sola (edit complesso = drawer) batte l'ottimizzazione per task type.",
            },
            {
              letter: "B",
              title: "Escalation: popover → right drawer",
              summary:
                "Popover lightweight per multi-value (Ruoli, Tags), drawer 440px per single-value (Collegamento, Fonte) complessi.",
              pros: [
                "Spazio massimo per picker complessi via drawer",
                "Lightweight per task lightweight",
                "Right tool for right task",
              ],
              cons: [
                "2 surface diversi — cognitive load misto",
                "Transizione close-popover + open-drawer ha flicker visibile",
                "Orchestrazione tra Popover e Drawer state più complessa",
              ],
              whyRejected:
                "L'orchestrazione popover→drawer è fragile da implementare bene; la transizione 'visibile' è una piccola UX regression. Una regola sola (C) è più robusta nel tempo.",
            },
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Decisione unificata:</strong> questo mockup copre entrambi i sub-flow
              (multi-value e single-value) perché nell'esperienza utente sono parti dello
              stesso gesto "aggiungi qualcosa al detail". Scegliere 3 patterns separati
              sarebbe frammentato.
            </li>
            <li>
              <strong>Content swap</strong> (alt A e C): implementazione via state machine{" "}
              <Code>view: 'categories' | 'ruoli-add' | 'collegamento-pick' | …</Code>{" "}
              dentro il popover/drawer. Back arrow chiama <Code>setView('categories')</Code>.
            </li>
            <li>
              <strong>Multi-value sub-view</strong>: input text + chip preview +
              suggestions dal workspace. Type + Enter aggiunge chip, virgola separa
              multipli. X rimuove chip.
            </li>
            <li>
              <strong>Single-value sub-view</strong>: search + grouped list (per TipoLink
              per collegamento, per categoria per fonte) + metadata conditional (Ruolo per
              parentela, pagina per fonte).
            </li>
            <li>
              <strong>Coerenza composite (sketch 5)</strong>: composite appaiono come
              SINGOLA chip categoria (es. "Vita"), non due chip separati
              "Nascita"+"Morte".
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// Shared sub-view atoms (usati da tutte e 3 le alternative)
// ============================================================================

type SubFlowView =
  | { kind: "categories" }
  | { kind: "ruoli-add" }
  | { kind: "tags-add" }
  | { kind: "collegamento-pick" }
  | { kind: "fonte-pick" };

function CategoriesContent({ onPick }: { onPick: (v: SubFlowView) => void }) {
  return (
    <div className="p-4">
      <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-3">
        Aggiungi al detail di Abraamo
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
        Field tipizzati (personaggio)
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <CategoryChip
          icon={<Users size={14} />}
          label="Ruoli"
          onClick={() => onPick({ kind: "ruoli-add" })}
        />
        <CategoryChip
          icon={<Tag size={14} />}
          label="Tags"
          onClick={() => onPick({ kind: "tags-add" })}
        />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2 pt-3 border-t border-edge">
        Universali
      </div>
      <div className="flex flex-wrap gap-2">
        <CategoryChip
          icon={<Link2 size={14} />}
          label="Collegamento"
          onClick={() => onPick({ kind: "collegamento-pick" })}
        />
        <CategoryChip
          icon={<FileText size={14} />}
          label="Fonte"
          onClick={() => onPick({ kind: "fonte-pick" })}
        />
      </div>
    </div>
  );
}

function CategoryChip({
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

function MultiChipContent({ label }: { label: string }) {
  const [text, setText] = useState("");
  const [chips, setChips] = useState<string[]>(["patriarca", "profeta"]);
  const suggestions = ["padre della fede", "viandante", "ospite di Mamre"].filter(
    (s) => !chips.includes(s),
  );

  function addChip(v: string) {
    const clean = v.trim();
    if (clean && !chips.includes(clean)) setChips([...chips, clean]);
    setText("");
  }

  return (
    <div className="p-4 space-y-3">
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <RemovableChip
              key={`${c}-${i}`}
              size="sm"
              onRemove={() => setChips(chips.filter((_, j) => j !== i))}
            >
              {c}
            </RemovableChip>
          ))}
        </div>
      )}
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
                addChip(text);
              }
            }}
          />
        </TextField>
      </div>
      {text.length > 0 && (
        <button
          type="button"
          onClick={() => addChip(text)}
          className="w-full flex items-center gap-2 min-h-[40px] px-2 rounded-md hover:bg-primary/5 text-sm text-primary font-medium cursor-pointer"
        >
          <Plus size={12} />
          Aggiungi "<span className="font-semibold">{text}</span>"
        </button>
      )}
      {suggestions.length > 0 && text.length === 0 && (
        <>
          <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold px-2">
            Suggeriti dal workspace
          </div>
          <div className="space-y-0.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addChip(s)}
                className="w-full text-left flex items-center min-h-[40px] px-2 rounded-md hover:bg-primary/5 text-sm text-ink-hi"
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="text-[10px] text-ink-dim pt-2 border-t border-edge">
        Enter aggiunge · virgola separa multipli
      </div>
    </div>
  );
}

function SingleValueContent({ kind }: { kind: "collegamento" | "fonte" }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [ruolo, setRuolo] = useState<string | null>(null);

  const placeholder =
    kind === "collegamento"
      ? "Cerca elemento da linkare..."
      : "Cerca fonte (libro, articolo, web)...";

  return (
    <div className="p-4 space-y-3">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none z-10"
        />
        <TextField value={search} onChange={setSearch} aria-label="Cerca">
          <Input placeholder={placeholder} className="min-h-[44px] pl-9 text-sm" />
        </TextField>
      </div>
      <div className="max-h-[200px] overflow-y-auto space-y-2 -mx-1">
        {kind === "collegamento" ? (
          <>
            <GroupHeader>Parentela</GroupHeader>
            <PickerRow
              name="Isacco"
              tipo="personaggio"
              selected={selected === "Isacco"}
              onSelect={() => setSelected("Isacco")}
            />
            <PickerRow
              name="Ismaele"
              tipo="personaggio"
              selected={selected === "Ismaele"}
              onSelect={() => setSelected("Ismaele")}
            />
            <GroupHeader>Adempimento</GroupHeader>
            <PickerRow
              name="Promessa della terra"
              tipo="profezia"
              selected={selected === "Promessa"}
              onSelect={() => setSelected("Promessa")}
            />
          </>
        ) : (
          <>
            <GroupHeader>Libri</GroupHeader>
            <PickerRow
              name="Genesi"
              tipo="libro biblico"
              selected={selected === "Genesi"}
              onSelect={() => setSelected("Genesi")}
            />
            <PickerRow
              name="Storia di Israele"
              tipo="libro"
              selected={selected === "Storia"}
              onSelect={() => setSelected("Storia")}
            />
            <GroupHeader>Articoli</GroupHeader>
            <PickerRow
              name="L'Akedah nella tradizione rabbinica"
              tipo="articolo"
              selected={selected === "Akedah"}
              onSelect={() => setSelected("Akedah")}
            />
          </>
        )}
      </div>
      {selected && kind === "collegamento" && (
        <div className="pt-3 border-t border-edge">
          <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
            Ruolo (parentela)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["figlio", "figlia", "padre", "madre", "coniuge"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRuolo(r)}
                className={`inline-flex items-center h-9 px-3 rounded-full text-xs font-medium transition-colors ${
                  ruolo === r
                    ? "bg-primary text-white"
                    : "bg-chip-bg text-ink-md hover:bg-primary/10"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      {selected && kind === "fonte" && (
        <div className="pt-3 border-t border-edge">
          <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
            Riferimento (opzionale)
          </div>
          <Input
            placeholder="es. cap. 12, p. 45"
            className="min-h-[40px] text-sm"
          />
        </div>
      )}
    </div>
  );
}

function GroupHeader({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold px-2 py-1">
      {children}
    </div>
  );
}

function PickerRow({
  name,
  tipo,
  selected,
  onSelect,
}: {
  name: string;
  tipo: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left flex items-center gap-3 min-h-[44px] px-2 rounded-md cursor-pointer transition-colors ${
        selected ? "bg-primary/15" : "hover:bg-primary/5"
      }`}
    >
      <span className="flex-1 text-sm text-ink-hi font-medium">{name}</span>
      <Chip size="sm" variant="soft" className="bg-chip-bg text-ink-lo text-[10px]">
        {tipo}
      </Chip>
    </button>
  );
}

// ============================================================================
// Recommended implementation — Right drawer sempre
// ============================================================================

function AltCDrawerAlways() {
  const [view, setView] = useState<SubFlowView>({ kind: "categories" });
  const reset = () => setView({ kind: "categories" });

  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Vita" value="2000 → 1825 a.E.V. · 175 anni" />
      <SimpleField label="Tribù" value="Ebrei" />
      <div className="mt-3">
        <Drawer>
          <Drawer.Trigger className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-lg border border-dashed border-primary/40 text-primary/80 text-sm font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
            <Plus size={16} />
            Aggiungi campo (drawer)
          </Drawer.Trigger>
          <Drawer.Backdrop>
            <Drawer.Content placement="right" className="w-[440px] max-w-[90vw]">
              <Drawer.Dialog>
                <Drawer.Header className="px-6 py-4 border-b border-edge">
                  <Drawer.Heading className="font-heading text-lg text-ink-hi inline-flex items-center gap-2">
                    {view.kind !== "categories" && (
                      <button
                        type="button"
                        onClick={reset}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ink-md hover:bg-primary/5 hover:text-primary"
                        aria-label="Indietro"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    )}
                    {view.kind === "categories" && "Aggiungi al detail"}
                    {view.kind === "ruoli-add" && "Aggiungi Ruoli"}
                    {view.kind === "tags-add" && "Aggiungi Tags"}
                    {view.kind === "collegamento-pick" && "Aggiungi Collegamento"}
                    {view.kind === "fonte-pick" && "Aggiungi Fonte"}
                  </Drawer.Heading>
                  <Drawer.CloseTrigger />
                </Drawer.Header>
                <Drawer.Body className="px-2 py-3">
                  {view.kind === "categories" && <CategoriesContent onPick={setView} />}
                  {view.kind === "ruoli-add" && <MultiChipContent label="ruolo" />}
                  {view.kind === "tags-add" && <MultiChipContent label="tag" />}
                  {view.kind === "collegamento-pick" && (
                    <SingleValueContent kind="collegamento" />
                  )}
                  {view.kind === "fonte-pick" && <SingleValueContent kind="fonte" />}
                </Drawer.Body>
                <Drawer.Footer className="px-6 py-3 border-t border-edge text-[11px] text-ink-dim">
                  Tap fuori / Esc per chiudere
                </Drawer.Footer>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
        <div className="mt-3 text-[11px] text-ink-dim italic inline-flex items-center gap-1">
          <Star size={10} className="text-primary fill-primary" />
          Stesso primitive Drawer di sketch 5 A (Vita).
        </div>
      </div>
    </>
  );
}
