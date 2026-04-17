import { useState } from "react";
import { Input, Popover, TextField } from "@heroui/react";
import { Plus, Search } from "lucide-react";
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
 * Mockup S02/R005 — Sketch 2.5: Multi-value chip array (Ruoli, Tags)
 *
 * Pattern per editare array di chip inline. Si attiva da:
 *   • Tap "+ aggiungi" (mockup 2) → "Ruoli" o "Tags"
 *   • Tap "+" inline accanto ai chip esistenti del field
 *
 * Decisione lockata:
 *   • Chip rimovibili con X piccolo (HeroUI onClose)
 *   • "+ aggiungi" inline come ultima chip → tap apre popover input + recent
 *   • Type + Enter aggiunge chip · Type + virgola separa multipli
 *   • Suggerimenti: valori già usati nel workspace per quel field
 */

const SUGGESTED_RUOLI = [
  "patriarca",
  "profeta",
  "padre della fede",
  "viandante",
  "fondatore di stirpe",
  "ospite di Mamre",
];

const INITIAL_RUOLI = ["patriarca", "profeta"];
const INITIAL_TAGS = ["genesi", "alleanza"];

export function MultiValueChipMockup() {
  const [ruoli, setRuoli] = useState<string[]>(INITIAL_RUOLI);
  const [tags, setTags] = useState<string[]>(INITIAL_TAGS);

  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="2.5"
          title="Multi-value chip array (Ruoli, Tags)"
          subtitle={
            <>
              Pattern unificato per editare array di chip inline. Si attiva sia da{" "}
              <strong>+ aggiungi</strong> (mockup 2) sia da <strong>+ chip</strong> inline
              quando il field esiste già.
            </>
          }
        />

        <div className="flex gap-8 items-start flex-wrap">
          <IpadFrame>
            <ElementoHeader />
            <SimpleField label="Tipo" value="personaggio" />
            <SimpleField label="Vita" value="2000 → 1825 a.E.V. · 175 anni" />

            <ChipArrayField
              label="Ruoli"
              chips={ruoli}
              onChange={setRuoli}
              suggestions={SUGGESTED_RUOLI}
              placeholder="Aggiungi ruolo..."
              addLabel="ruolo"
            />

            <ChipArrayField
              label="Tags"
              chips={tags}
              onChange={setTags}
              suggestions={["genesi", "alleanza", "fede", "circoncisione", "Akedah"]}
              placeholder="Aggiungi tag..."
              addLabel="tag"
            />

            <SimpleField label="Tribù" value="Ebrei" />
          </IpadFrame>

          <div className="flex-1 min-w-[320px] space-y-5">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm leading-relaxed text-ink-hi">
              <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1.5">
                Grammatica
              </div>
              <div>
                <strong>Idle</strong>: row con label + chip array a destra (wrap multi-line
                se molti). Ultima chip è il <Code>+ {"<addLabel>"}</Code> dashed border.
                <br />
                <strong>Tap chip esistente</strong>: hover X piccolo a destra → tap X →
                rimuove. Tap centro chip → (futuro) modifica inline o no-op.
                <br />
                <strong>Tap "+" chip</strong>: apre popover ancorato con input search +
                lista <em>recent values</em> dal workspace (suggestions auto-complete).
                <br />
                <strong>Type + Enter</strong>: aggiunge chip, popover resta aperto per
                aggiungerne altre.
                <br />
                <strong>Type + virgola</strong> o <strong>;</strong>: aggiunge multiple chip
                in una passata.
                <br />
                <strong>Tap fuori</strong>: close popover + commit (blur-to-save sketch 1).
                <br />
                <strong>ESC</strong>: cancel l'input corrente, popover resta aperto.
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-lg p-4 text-sm text-amber-900 leading-relaxed">
              <div className="text-[11px] uppercase tracking-wider font-bold mb-1.5">
                Casi d'uso
              </div>
              <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
                <li>
                  <strong>Ruoli</strong> personaggio: free text, suggestions da workspace
                </li>
                <li>
                  <strong>Tags</strong> universali: free text, condivisi tra tutti gli
                  elementi
                </li>
                <li>
                  <strong>RuoloLink parentela</strong> (figlio/figlia/padre/...): enum
                  fixed, no free text — il popover usa solo chip preset (no input)
                </li>
                <li>
                  <strong>Partecipanti evento</strong>: come Ruoli ma con suggestions =
                  altri personaggi referenziati
                </li>
              </ul>
            </div>

            <div className="text-sm leading-snug space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">+</span>
                <span>Inline editing — niente mode swap, niente form modale</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">+</span>
                <span>
                  Suggestions accelerano il caso comune (riuso valori esistenti workspace)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">+</span>
                <span>Touch target chip 32px + remove button 24px (visible su tap-hold)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">+</span>
                <span>
                  Pattern Notion multi-select / Linear labels — familiare iPad
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">−</span>
                <span>
                  X chip su touch può essere mis-tappato (tap centro chip per evitare)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">−</span>
                <span>
                  Su array molto grossi (50+ chip) la row wrappa parecchio — valutare
                  scroll o collapse
                </span>
              </div>
            </div>
          </div>
        </div>

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>HeroUI Chip</strong>: prop <Code>onClose</Code> abilita la X automatic.
              Per touch precisione, usiamo <Code>size="md"</Code> (28-32px).
            </li>
            <li>
              <strong>Suggestions</strong>: in implementazione reale verranno da{" "}
              <Code>useWorkspaceField(fieldName)</Code> hook che aggrega valori distinti
              cross-elementi.
            </li>
            <li>
              <strong>Validation</strong>: nessuna a livello chip-add; soft validation
              (sketch 6) può flaggare se ruolo non riconosciuto, ma non blocca l'add.
            </li>
            <li>
              <strong>Storage</strong>: <Code>{`Elemento.ruoli: string[]`}</Code> CRDT array
              su Jazz. Add = push, remove = filter, riordino = TBD (futuro).
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// ChipArrayField — atom per field row con array di chip + popover add
// ============================================================================

interface ChipArrayFieldProps {
  label: string;
  chips: string[];
  onChange: (chips: string[]) => void;
  suggestions: string[];
  placeholder: string;
  addLabel: string;
}

function ChipArrayField({
  label,
  chips,
  onChange,
  suggestions,
  placeholder,
  addLabel,
}: ChipArrayFieldProps) {
  function removeChip(idx: number) {
    onChange(chips.filter((_, i) => i !== idx));
  }

  function addChips(input: string) {
    const newOnes = input
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !chips.includes(s));
    if (newOnes.length > 0) {
      onChange([...chips, ...newOnes]);
    }
  }

  return (
    <div className="flex items-start gap-4 min-h-[48px] py-1 px-2 -mx-2 rounded">
      <span className="w-[110px] flex-shrink-0 pt-2 text-[11px] uppercase tracking-wider text-primary font-semibold">
        {label}
      </span>
      <div className="flex-1 flex flex-wrap items-center gap-1.5 pt-1">
        {chips.map((chip, idx) => (
          <RemovableChip key={`${chip}-${idx}`} onRemove={() => removeChip(idx)}>
            {chip}
          </RemovableChip>
        ))}
        <AddChipPopover
          suggestions={suggestions.filter((s) => !chips.includes(s))}
          placeholder={placeholder}
          addLabel={addLabel}
          onAdd={addChips}
        />
      </div>
    </div>
  );
}

interface AddChipPopoverProps {
  suggestions: string[];
  placeholder: string;
  addLabel: string;
  onAdd: (input: string) => void;
}

function AddChipPopover({
  suggestions,
  placeholder,
  addLabel,
  onAdd,
}: AddChipPopoverProps) {
  const [text, setText] = useState("");
  const filtered = text
    ? suggestions.filter((s) => s.toLowerCase().includes(text.toLowerCase()))
    : suggestions;

  function commit() {
    onAdd(text);
    setText("");
  }

  return (
    <Popover>
      <Popover.Trigger className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full border border-dashed border-primary/40 text-primary/80 text-xs font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
        <Plus size={12} />
        {addLabel}
      </Popover.Trigger>
      <Popover.Content className="w-[300px]">
        <Popover.Dialog className="bg-panel border border-edge rounded-xl shadow-xl p-3">
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none z-10"
            />
            <TextField value={text} onChange={setText} aria-label="Aggiungi">
              <Input
                placeholder={placeholder}
                className="min-h-[44px] pl-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commit();
                  }
                }}
              />
            </TextField>
          </div>
          {text.length > 0 && !suggestions.includes(text) && (
            <button
              type="button"
              onClick={commit}
              className="w-full flex items-center gap-2 min-h-[40px] px-2 rounded-md hover:bg-primary/5 text-sm text-primary font-medium cursor-pointer mb-1"
            >
              <Plus size={12} />
              Aggiungi "<span className="font-semibold">{text}</span>"
            </button>
          )}
          {filtered.length > 0 && (
            <>
              {text.length === 0 && (
                <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold px-2 mb-1">
                  Recenti nel workspace
                </div>
              )}
              <div className="space-y-0.5 max-h-[200px] overflow-y-auto">
                {filtered.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onAdd(s);
                      setText("");
                    }}
                    className="w-full text-left flex items-center min-h-[40px] px-2 rounded-md hover:bg-primary/5 text-sm text-ink-hi cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
          {text.length === 0 && filtered.length === 0 && (
            <div className="text-xs text-ink-dim italic px-2 py-3">
              Nessun suggerimento. Type per creare nuovo.
            </div>
          )}
          <div className="text-[10px] text-ink-dim mt-3 pt-2 border-t border-edge">
            Enter aggiunge · virgola separa multipli
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
