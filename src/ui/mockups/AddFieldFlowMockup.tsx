import { useState } from "react";
import { Chip, Input, Popover, TextField } from "@heroui/react";
import {
  ChevronLeft,
  FileText,
  Link2,
  Plus,
  Search,
  Tag,
  Users,
} from "lucide-react";
import {
  Code,
  ElementoHeader,
  IpadFrame,
  MockupFooter,
  MockupHeader,
  RemovableChip,
  SimpleField,
} from "./_atoms";

/**
 * Mockup S02/R005 — Sketch 2: Add field flow (entry point unificato)
 *
 * UNIFICA il flow "+ aggiungi → scegli tipo → riempi". Il popover ha uno stato
 * interno che fa content swap (categories ↔ multi-chip ↔ single-value picker)
 * con back navigation. Niente flicker close+open tra i 2 popover separati.
 *
 * Branches:
 *   • Multi-value (Ruoli, Tags) → vedi mockup 2.5 per il pattern dettagliato
 *   • Single-value (Collegamento, Fonte) → vedi mockup 3 per il picker
 *
 * Decisione lockata: nested popover content swap (option a). HeroUI Popover
 * primitive + state machine view interna.
 */

type View =
  | { kind: "categories" }
  | { kind: "ruoli-add" }
  | { kind: "tags-add" }
  | { kind: "collegamento-pick" }
  | { kind: "fonte-pick" };

export function AddFieldFlowMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="2"
          title="Add field flow"
          subtitle={
            <>
              Tap "+ aggiungi campo" → popover con categories. Tap categoria → il{" "}
              <strong>contenuto del popover swap</strong> al picker corrispondente con back
              navigation. Niente popover che si chiude e riapre.
            </>
          }
        />

        <div className="flex gap-8 items-start flex-wrap">
          <IpadFrame>
            <ElementoHeader />
            <SimpleField label="Tipo" value="personaggio" />
            <SimpleField label="Descrizione" value="Patriarca dei tre monoteismi." />
            <SimpleField label="Vita" value="2000 → 1825 a.E.V. · 175 anni" />
            <SimpleField label="Tribù" value="Ebrei" />
            <div className="mt-3">
              <AddFieldPopover />
            </div>
          </IpadFrame>

          <div className="flex-1 min-w-[320px] space-y-5">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm leading-relaxed text-ink-hi">
              <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1.5">
                Grammatica
              </div>
              <div>
                <strong>1. Entry</strong>: row "+ aggiungi campo" 48px, dashed border, tap
                cursor.
                <br />
                <strong>2. Categories</strong>: popover apre con sezioni "Field tipizzati"
                (filtrate per <Code>TipoElemento</Code>) + "Universali" (Collegamento,
                Fonte). Chip 44×44 tap target.
                <br />
                <strong>3. Content swap</strong>: tap chip categoria → popover{" "}
                <em>stesso surface</em> mostra picker per quel tipo. Header con back arrow{" "}
                <ChevronLeft size={12} className="inline" /> + titolo.
                <br />
                <strong>4. Confirm</strong>: tap "Aggiungi" → popover close + nuovo
                field-row in detail pane (in edit state pronta a digitare).
                <br />
                <strong>5. ESC / tap fuori</strong>: cancel + close popover.
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-lg p-4 text-sm text-amber-900 leading-relaxed">
              <div className="text-[11px] uppercase tracking-wider font-bold mb-1.5">
                Branching su altri mockup
              </div>
              <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
                <li>
                  Tap chip <strong>Ruoli</strong> o <strong>Tags</strong> → vedi{" "}
                  <a
                    href="/dev/mockup-multi-value-chip"
                    className="underline font-semibold"
                  >
                    Mockup 2.5 Multi-value chip
                  </a>
                </li>
                <li>
                  Tap chip <strong>Collegamento</strong> o <strong>Fonte</strong> → vedi{" "}
                  <a
                    href="/dev/mockup-single-value-picker"
                    className="underline font-semibold"
                  >
                    Mockup 3 Single-value picker
                  </a>
                </li>
                <li>
                  Qui mostriamo il pattern di <em>content swap</em>; il dettaglio del
                  picker live in 2.5 e 3.
                </li>
              </ul>
            </div>

            <div className="text-sm leading-snug space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">+</span>
                <span>
                  <strong>Un solo surface</strong> dall'inizio alla fine — niente flicker
                  close/open tra popover separati
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">+</span>
                <span>
                  Back navigation chiara — l'utente può cambiare idea (es. da Collegamento
                  a Fonte) senza ripartire
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">+</span>
                <span>
                  Pattern Notion command palette / Linear / iOS Settings drill-down —
                  familiare
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">−</span>
                <span>
                  Implementazione custom della view state machine dentro il popover (no
                  primitive HeroUI per nested navigation)
                </span>
              </div>
            </div>
          </div>
        </div>

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Sostituisce sketch precedente "empty fields"</strong> — la decisione
              "riga inline + popover chips" resta, ma adesso il popover è coerente col
              resto del flow add-field.
            </li>
            <li>
              <strong>Field tipizzati</strong> filtrati per <Code>TipoElemento</Code> via{" "}
              <Code>features/elemento/rules.ts</Code>: per personaggio = Ruoli/Tags; per
              evento = Data/Luogo/Partecipanti; per profezia = Enunciazione/Adempimento;
              etc.
            </li>
            <li>
              <strong>Universali</strong> (Collegamento, Fonte) sempre presenti per ogni
              TipoElemento, separati da divider nel popover.
            </li>
            <li>
              <strong>Composite</strong> (Vita, Regno, Periodo): appaiono come SINGOLA chip
              nel popover (es. "Vita"), non come 2 chip "Nascita"+"Morte". Vedi sketch 5.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// AddFieldPopover — contiene state machine view interno
// ============================================================================

function AddFieldPopover() {
  const [view, setView] = useState<View>({ kind: "categories" });

  function reset() {
    setView({ kind: "categories" });
  }

  return (
    <Popover>
      <Popover.Trigger className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-lg border border-dashed border-primary/40 text-primary/80 text-sm font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
        <Plus size={16} />
        Aggiungi campo
      </Popover.Trigger>
      <Popover.Content className="w-[380px]">
        <Popover.Dialog className="bg-panel border border-edge rounded-xl shadow-xl">
          {view.kind === "categories" && <CategoriesView onPick={setView} />}
          {view.kind === "ruoli-add" && (
            <SubView title="Aggiungi Ruoli" onBack={reset}>
              <MultiChipPreview placeholder="es. patriarca, profeta, padre della fede" />
              <PreviewLink href="/dev/mockup-multi-value-chip">
                Vedi mockup completo Multi-value chip →
              </PreviewLink>
            </SubView>
          )}
          {view.kind === "tags-add" && (
            <SubView title="Aggiungi Tags" onBack={reset}>
              <MultiChipPreview placeholder="es. genesi, fede, alleanza" />
              <PreviewLink href="/dev/mockup-multi-value-chip">
                Vedi mockup completo Multi-value chip →
              </PreviewLink>
            </SubView>
          )}
          {view.kind === "collegamento-pick" && (
            <SubView title="Aggiungi Collegamento" onBack={reset}>
              <SinglePickerPreview placeholder="Cerca elemento da linkare..." />
              <PreviewLink href="/dev/mockup-single-value-picker">
                Vedi mockup completo Single-value picker →
              </PreviewLink>
            </SubView>
          )}
          {view.kind === "fonte-pick" && (
            <SubView title="Aggiungi Fonte" onBack={reset}>
              <SinglePickerPreview placeholder="Cerca fonte (libro, articolo, sito)..." />
              <PreviewLink href="/dev/mockup-single-value-picker">
                Vedi mockup completo Single-value picker →
              </PreviewLink>
            </SubView>
          )}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

function CategoriesView({ onPick }: { onPick: (v: View) => void }) {
  return (
    <div className="p-4">
      <Popover.Heading className="text-[11px] uppercase tracking-wider text-primary font-bold mb-3">
        Aggiungi al detail di Abraamo
      </Popover.Heading>
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
  icon: React.ReactNode;
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

function SubView({
  title,
  onBack,
  children,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-edge">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ink-md hover:bg-primary/5 hover:text-primary transition-colors"
          aria-label="Indietro"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="text-sm font-semibold text-ink-hi">{title}</div>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </>
  );
}

function MultiChipPreview({ placeholder }: { placeholder: string }) {
  const [text, setText] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  function addChip() {
    if (text.trim()) {
      setChips([...chips, text.trim()]);
      setText("");
    }
  }
  function removeChip(idx: number) {
    setChips(chips.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-ink-lo">
        Type + Enter per aggiungere chip. X per rimuovere.
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            <RemovableChip
              key={i}
              size="sm"
              onRemove={() => removeChip(i)}
            >
              {c}
            </RemovableChip>
          ))}
        </div>
      )}
      <TextField
        value={text}
        onChange={setText}
        aria-label="Nuovo valore"
      >
        <Input
          placeholder={placeholder}
          className="min-h-[44px]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addChip();
            }
          }}
        />
      </TextField>
    </div>
  );
}

function SinglePickerPreview({ placeholder }: { placeholder: string }) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none z-10"
        />
        <Input
          placeholder={placeholder}
          className="min-h-[44px] pl-9 text-sm"
        />
      </div>
      <div className="space-y-1 max-h-[180px] overflow-y-auto">
        <PickerStub name="Isacco" tipo="personaggio" />
        <PickerStub name="Ismaele" tipo="personaggio" />
        <PickerStub name="Sara" tipo="personaggio" />
      </div>
    </div>
  );
}

function PickerStub({ name, tipo }: { name: string; tipo: string }) {
  return (
    <div className="flex items-center gap-3 min-h-[44px] px-3 rounded-md hover:bg-primary/5 cursor-pointer">
      <span className="flex-1 text-sm text-ink-hi font-medium">{name}</span>
      <Chip size="sm" variant="soft" className="bg-chip-bg text-ink-lo text-[10px]">
        {tipo}
      </Chip>
    </div>
  );
}

function PreviewLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="block text-[11px] text-primary hover:text-primary/80 font-semibold underline pt-2 border-t border-edge mt-2"
    >
      {children}
    </a>
  );
}
