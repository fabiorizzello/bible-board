import { useState } from "react";
import { Chip, Input, Popover, TextField } from "@heroui/react";
import { ExternalLink, FileText, Link2, Plus, Search } from "lucide-react";
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
 * Mockup S02/R005 — Sketch 3: Single-value picker (Collegamento + Fonte)
 *
 * Picker unificato per i due field universali single-value:
 *   • Collegamento → target = altro Elemento + TipoLink + RuoloLink
 *   • Fonte → target = Fonte + metadata (pagina, anno opt)
 *
 * 2 entry points (mostrati entrambi nel mockup):
 *   • Inline: "+ collegamento" / "+ fonte" accanto ai chip esistenti del field
 *   • Chained: da AddFieldFlow (mockup 2) → categoria scelta → questo picker
 *
 * Decisione lockata: big anchored popover ~440px single-step grouped.
 */

export function SingleValuePickerMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="3"
          title="Single-value picker (Collegamento + Fonte)"
          subtitle={
            <>
              Pattern unificato per i 2 field universali single-value. Stesso popover ~440px,
              search + grouped list, metadata sotto. Si attiva inline o chained dal mockup 2.
            </>
          }
        />

        <div className="space-y-10">
          <Section
            title="A. Collegamento — picker inline"
            description={
              <>
                Quando il field "Collegamenti" esiste già, l'utente tap "+ collegamento"
                accanto agli esistenti. Il picker si ancora al chip "+".
              </>
            }
          >
            <CollegamentoExample />
          </Section>

          <Section
            title="B. Fonte — picker inline"
            description={
              <>
                Stesso pattern del Collegamento, ma per le Fonti. Search trova fonti già
                referenziate nel workspace, "Aggiungi nuova" per inserire nuovo libro/articolo.
              </>
            }
          >
            <FonteExample />
          </Section>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm leading-relaxed text-ink-hi">
            <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1.5">
              Grammatica unificata
            </div>
            <div>
              <strong>Header</strong>: titolo "Aggiungi {`<tipo>`}" + close X.
              <br />
              <strong>Search</strong>: <Code>{`<Input>`}</Code> 48px con icona Search,
              focus auto.
              <br />
              <strong>Grouped list</strong>: per Collegamento raggruppa per TipoLink
              (parentela, adempimento, parallelo…); per Fonte raggruppa per categoria
              (libri, articoli, web).
              <br />
              <strong>Selected → metadata section</strong> appare sotto la lista (chip
              ruolo per parentela, input pagina per fonte).
              <br />
              <strong>Tap fuori / ESC</strong> → cancel. <strong>Tap conferma</strong> →
              commit + close.
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm leading-relaxed text-ink-hi">
            <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1.5">
              2 entry points
            </div>
            <div>
              <strong>1. Inline</strong> (qui mostrato): tap "+ collegamento" /
              "+ fonte" accanto ai chip del field esistente. Popover anchored al chip "+".
              <br />
              <strong>2. Chained</strong> da{" "}
              <a
                href="/dev/mockup-add-field-flow"
                className="underline font-semibold text-primary"
              >
                AddFieldFlow (mockup 2)
              </a>
              : tap "+ aggiungi" → "Collegamento" → questo picker appare nel popover stesso
              (content swap), no flicker.
              <br />
              <strong>Comportamento identico</strong> in entrambi gli entry: stesso UI,
              stesse interazioni, stesso commit.
            </div>
          </div>
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-lg p-4 text-sm text-amber-900 leading-relaxed">
          <div className="text-[11px] uppercase tracking-wider font-bold mb-1.5">
            Differenze Collegamento vs Fonte
          </div>
          <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
            <li>
              <strong>Target search</strong>: Collegamento cerca tra Elementi (personaggi,
              eventi, luoghi); Fonte cerca tra Fonti workspace + opzione "nuova fonte".
            </li>
            <li>
              <strong>Metadata</strong>: Collegamento richiede TipoLink (sempre) + RuoloLink
              (solo per parentela); Fonte richiede pagina/riferimento (opt) + anno (opt).
            </li>
            <li>
              <strong>Bidirezionalità</strong>: Collegamento crea automaticamente l'inverso
              (Abraamo →padre→ Isacco ⇒ Isacco →figlio→ Abraamo). Fonte è
              unidirezionale.
            </li>
            <li>
              <strong>Tipi enumerati</strong>: TipoLink = 8 valori fissi
              (parentela/causa-effetto/adempimento/parallelo/successione/localizzazione/residenza/correlato).
              Fonte categoria = 3 valori (libro/articolo/web).
            </li>
          </ul>
        </div>

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Bidirezionalità link:</strong> creando "Abraamo →padre→ Isacco" il
              dominio crea automaticamente l'inverso. Mai mostrare l'inverso nel picker.
            </li>
            <li>
              <strong>Performance:</strong> per workspace con &gt;500 elementi, valutare
              virtualization sulla lista risultati (intersection observer).
            </li>
            <li>
              <strong>Empty state</strong>: se workspace vuoto, mostrare CTA "Crea primo
              elemento da linkare" che porta al flow di creazione.
            </li>
            <li>
              <strong>Pattern unificato col mockup 5C scartato</strong>: stesso primitive
              HeroUI Popover ~440px usato anche per il composite Vita alternative C
              (poi sostituito con Drawer). Qui Popover è la scelta giusta perché picker è
              ricerca veloce, non editing complesso.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// Section header (per separare A/B nel mockup)
// ============================================================================

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-heading text-xl text-ink-hi mb-1.5">{title}</h2>
        <div className="text-sm text-ink-md">{description}</div>
      </div>
      <IpadFrame>{children}</IpadFrame>
    </section>
  );
}

// ============================================================================
// A. Collegamento example
// ============================================================================

function CollegamentoExample() {
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Vita" value="2000 → 1825 a.E.V. · 175 anni" />
      <div className="flex items-start gap-4 min-h-[48px] py-1 px-2 -mx-2">
        <span className="w-[110px] flex-shrink-0 pt-2 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Collegamenti
        </span>
        <div className="flex-1 flex flex-wrap items-center gap-2 pt-1">
          <RemovableChip onRemove={() => {}}>
            <span className="inline-flex items-center gap-1.5">
              Sara <span className="text-ink-dim text-[11px]">· coniuge</span>
            </span>
          </RemovableChip>
          <CollegamentoPickerPopover />
        </div>
      </div>
      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}

function CollegamentoPickerPopover() {
  const [search, setSearch] = useState("");
  const [selectedElem, setSelectedElem] = useState<string | null>(null);
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [selectedRuolo, setSelectedRuolo] = useState<string | null>(null);

  const isParentela = selectedTipo === "parentela";

  return (
    <Popover>
      <Popover.Trigger className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full border border-dashed border-primary/40 text-primary/80 text-xs font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
        <Plus size={12} />
        collegamento
      </Popover.Trigger>
      <Popover.Content className="w-[440px]">
        <Popover.Dialog className="bg-panel border border-edge rounded-xl shadow-xl">
          <div className="px-4 py-3 border-b border-edge">
            <Popover.Heading className="text-sm font-semibold text-ink-hi inline-flex items-center gap-2">
              <Link2 size={14} className="text-primary" />
              Aggiungi collegamento
            </Popover.Heading>
          </div>
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none z-10"
              />
              <TextField value={search} onChange={setSearch} aria-label="Cerca elemento">
                <Input
                  placeholder="Cerca elemento da linkare..."
                  className="min-h-[48px] pl-10"
                />
              </TextField>
            </div>

            <div className="max-h-[220px] overflow-y-auto -mx-1">
              <Group label="Parentela">
                <ResultRow
                  name="Isacco"
                  tipo="personaggio"
                  selected={selectedElem === "Isacco"}
                  onSelect={() => {
                    setSelectedElem("Isacco");
                    setSelectedTipo("parentela");
                  }}
                />
                <ResultRow
                  name="Ismaele"
                  tipo="personaggio"
                  selected={selectedElem === "Ismaele"}
                  onSelect={() => {
                    setSelectedElem("Ismaele");
                    setSelectedTipo("parentela");
                  }}
                />
              </Group>
              <Group label="Adempimento">
                <ResultRow
                  name="Promessa della terra"
                  tipo="profezia"
                  selected={selectedElem === "Promessa della terra"}
                  onSelect={() => {
                    setSelectedElem("Promessa della terra");
                    setSelectedTipo("adempimento");
                  }}
                />
              </Group>
            </div>

            {selectedElem && isParentela && (
              <div className="pt-3 border-t border-edge">
                <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
                  Ruolo (parentela)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["figlio", "figlia", "padre", "madre", "coniuge"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRuolo(r)}
                      className={`inline-flex items-center h-9 px-3 rounded-full text-xs font-medium transition-colors ${
                        selectedRuolo === r
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

            {selectedElem && (
              <div className="pt-3 border-t border-edge text-[11px] text-ink-md">
                Riepilogo:{" "}
                <strong className="text-ink-hi">Abraamo</strong> →{" "}
                <span className="text-primary font-mono">{selectedTipo ?? "?"}</span> →{" "}
                <strong className="text-ink-hi">{selectedElem}</strong>
                {isParentela && selectedRuolo && (
                  <>
                    {" · ruolo "}
                    <span className="text-primary font-mono">{selectedRuolo}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

// ============================================================================
// B. Fonte example
// ============================================================================

function FonteExample() {
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Vita" value="2000 → 1825 a.E.V. · 175 anni" />
      <div className="flex items-start gap-4 min-h-[48px] py-1 px-2 -mx-2">
        <span className="w-[110px] flex-shrink-0 pt-2 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Fonti
        </span>
        <div className="flex-1 flex flex-wrap items-center gap-2 pt-1">
          <RemovableChip onRemove={() => {}}>
            <span className="inline-flex items-center gap-1.5">
              Genesi 12 <span className="text-ink-dim text-[11px]">· libro</span>
            </span>
          </RemovableChip>
          <FontePickerPopover />
        </div>
      </div>
      <SimpleField label="Tribù" value="Ebrei" />
    </>
  );
}

function FontePickerPopover() {
  const [search, setSearch] = useState("");
  const [selectedFonte, setSelectedFonte] = useState<string | null>(null);
  const [pagina, setPagina] = useState("");

  return (
    <Popover>
      <Popover.Trigger className="inline-flex items-center gap-1 h-8 px-2.5 rounded-full border border-dashed border-primary/40 text-primary/80 text-xs font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
        <Plus size={12} />
        fonte
      </Popover.Trigger>
      <Popover.Content className="w-[440px]">
        <Popover.Dialog className="bg-panel border border-edge rounded-xl shadow-xl">
          <div className="px-4 py-3 border-b border-edge">
            <Popover.Heading className="text-sm font-semibold text-ink-hi inline-flex items-center gap-2">
              <FileText size={14} className="text-primary" />
              Aggiungi fonte
            </Popover.Heading>
          </div>
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none z-10"
              />
              <TextField value={search} onChange={setSearch} aria-label="Cerca fonte">
                <Input
                  placeholder="Cerca fonte (libro, articolo, web)..."
                  className="min-h-[48px] pl-10"
                />
              </TextField>
            </div>

            <div className="max-h-[180px] overflow-y-auto -mx-1">
              <Group label="Libri">
                <ResultRow
                  name="Genesi"
                  tipo="libro biblico"
                  selected={selectedFonte === "Genesi"}
                  onSelect={() => setSelectedFonte("Genesi")}
                />
                <ResultRow
                  name="Storia di Israele — J. Bright"
                  tipo="libro"
                  selected={selectedFonte === "Storia di Israele"}
                  onSelect={() => setSelectedFonte("Storia di Israele")}
                />
              </Group>
              <Group label="Articoli">
                <ResultRow
                  name="L'Akedah nella tradizione rabbinica"
                  tipo="articolo"
                  selected={selectedFonte === "Akedah"}
                  onSelect={() => setSelectedFonte("Akedah")}
                />
              </Group>
            </div>

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-md border border-dashed border-primary/40 text-primary text-xs font-medium hover:bg-primary/5 cursor-pointer"
            >
              <ExternalLink size={12} />
              Aggiungi nuova fonte (libro / articolo / web)
            </button>

            {selectedFonte && (
              <div className="pt-3 border-t border-edge space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold">
                  Riferimento (opzionale)
                </div>
                <TextField value={pagina} onChange={setPagina} aria-label="Pagina">
                  <Input
                    placeholder="es. cap. 12, p. 45-47"
                    className="min-h-[44px]"
                  />
                </TextField>
              </div>
            )}
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

// ============================================================================
// Atoms condivisi del picker
// ============================================================================

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold px-2 py-1.5">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function ResultRow({
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
      className={`w-full text-left flex items-center gap-3 min-h-[48px] px-2 rounded-md cursor-pointer transition-colors ${
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
