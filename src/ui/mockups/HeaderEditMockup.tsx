import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Button,
  Chip,
  Dropdown,
  Input,
  Label,
  Popover,
  Separator,
  TextField,
} from "@heroui/react";
import {
  Check,
  ChevronDown,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
  Type,
} from "lucide-react";
import {
  Alternative,
  Code,
  Divider,
  MockupFooter,
  MockupHeader,
  SimpleField,
} from "./_atoms";

/**
 * Mockup S02/R005 — Sketch 7: Header edit (nome + tipo + actions)
 *
 * Il header del detail pane ha 3 elementi: nome elemento, chip TipoElemento,
 * e actions (rinomina/duplica/elimina). Come si edita ognuno?
 *
 *   A. Inline nome edit + tipo popover + kebab actions    ⭐ RECOMMENDED
 *   B. Inline nome edit + tipo readonly + kebab contains change-type
 *   C. Tutto dietro kebab menu (readonly inline)
 */

const TIPI_ELEMENTO = [
  "personaggio",
  "evento",
  "luogo",
  "profezia",
  "periodo",
  "istituzione",
  "opera",
  "annotazione",
] as const;

export function HeaderEditMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="7"
          title="Header edit (nome + tipo + actions)"
          subtitle={
            <>
              Header del detail pane: nome <strong>Abraamo</strong>, chip{" "}
              <strong>personaggio</strong>, e azioni (rinomina, cambia tipo, duplica,
              elimina). Come si edita ciascun pezzo?
            </>
          }
        />

        <Alternative
          letter="A"
          recommended
          title="Inline nome + tipo popover + kebab actions"
          subtitle="nome tap-to-edit, chip tipo popover con lista TipoElemento, kebab (⋯) azioni complementari"
          mock={<InlineNomePopoverTipoMock />}
          grammatica={
            <>
              <strong>Nome</strong>: tap → diventa Input HeroUI (stesso pattern sketch 1,
              blur-to-save + toast undo).
              <br />
              <strong>Chip tipo</strong>: tap → <Code>{`<Popover>`}</Code> con lista
              TipoElemento. Selezione cambia il tipo (operazione atomica, con conferma se
              distruttiva).
              <br />
              <strong>Azioni</strong>: kebab (⋯) HeroUI <Code>{`<Dropdown>`}</Code> top-right
              con Rinomina (focus sul nome), Duplica, Elimina.
              <br />
              Ogni pezzo del header è tappabile direttamente — nessuna UI affonda nel menu
              tranne azioni non-critiche.
            </>
          }
          items={[
            ["pro", "Tap diretto su nome e tipo — 1 tap per l'edit più comune"],
            ["pro", "Coerente con inline per-campo (sketch 1) per il nome"],
            ["pro", "Popover tipo mostra tutte le 8 opzioni in una volta"],
            ["pro", "Kebab libera lo header da azioni secondarie (duplica, elimina)"],
            ["pro", "Pattern Apple Notes (title tappabile) + Linear (actions in ⋯)"],
            ["con", "Cambio tipo è operazione significativa — serve dialog di conferma se perde field tipo-specifici"],
            ["con", "Il chip clickable richiede una affordance (chevron) per segnalare che è interattivo"],
          ]}
        />

        <Divider />

        <Alternative
          letter="B"
          title="Inline nome + tipo readonly + kebab change-type"
          subtitle="nome tap-to-edit, chip tipo non cliccabile, kebab contiene Cambia tipo (dialog)"
          mock={<InlineNomeReadonlyTipoMock />}
          grammatica={
            <>
              <strong>Nome</strong>: identico ad A, tap-to-edit inline.
              <br />
              <strong>Chip tipo</strong>: <strong>read-only</strong>. Nessun hover, cursor
              default. Visivamente un tag di stato.
              <br />
              <strong>Azioni</strong>: kebab (⋯) con <em>Cambia tipo</em>, Duplica, Elimina.
              Cambia tipo apre <Code>{`<Modal>`}</Code> con lista + avviso "potresti perdere
              campi tipo-specifici".
              <br />
              Cambiare tipo è un'azione "strutturale", protetta dietro kebab + modal.
            </>
          }
          items={[
            ["pro", "<strong>Sicurezza</strong> — cambiare tipo è difficile e richiede conferma esplicita"],
            ["pro", "Chip tipo pulito visivamente, senza affordance interattiva"],
            ["pro", "Pattern Things 3 (tag readonly) + Linear (change via menu)"],
            ["con", "1 tap extra per cambiare tipo (apri kebab + clicca Cambia tipo)"],
            ["con", "Chi vuole cambiare tipo spesso (es. fase di data entry) friction alta"],
            ["con", "L'affordance del chip è ambigua: sembra clickable ma non lo è"],
          ]}
        />

        <Divider />

        <Alternative
          letter="C"
          title="Tutto dietro kebab menu"
          subtitle="nome e tipo entrambi readonly in header, ogni edit passa dal menu ⋯"
          mock={<AllBehindKebabMock />}
          grammatica={
            <>
              <strong>Nome</strong>: readonly in header. Non tappabile. Per rinominare:
              kebab → Rinomina → <Code>{`<Modal>`}</Code> con Input.
              <br />
              <strong>Chip tipo</strong>: readonly, come B.
              <br />
              <strong>Azioni</strong>: kebab con Rinomina, Cambia tipo, Duplica, Elimina —
              TUTTE le azioni.
              <br />
              Pattern enterprise: nulla cambia per sbaglio, ogni azione esplicita.
            </>
          }
          items={[
            ["pro", "Zero probabilità di edit accidentale"],
            ["pro", "Pattern Salesforce / JIRA issue detail"],
            ["pro", "Azioni raggruppate in un punto solo"],
            ["con", "<strong>Friction massima</strong> — 3+ tap per rinominare (⋯ + Rinomina + conferma)"],
            ["con", "Anti inline per-campo: il nome NON si comporta come un field"],
            ["con", "Su iPad touch-first il kebab nasconde funzionalità primarie — anti-discoverable"],
            ["con", "Inconsistente con decisione sketch 1 (edit diretto inline)"],
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Coerenza propagata:</strong> scegliere A allinea il nome al pattern
              degli altri field (tap-to-edit inline + blur-to-save + toast undo). C è
              esplicitamente incoerente.
            </li>
            <li>
              <strong>Cambio tipo è speciale:</strong> indipendente dall'alternativa,
              cambiare TipoElemento può distruggere field tipo-specifici. Serve sempre
              conferma esplicita (dialog con lista field che andranno persi).
            </li>
            <li>
              <strong>HeroUI kebab:</strong> <Code>{`<Dropdown>`}</Code> +{" "}
              <Code>{`<Dropdown.Popover>`}</Code> + <Code>{`<Dropdown.Menu>`}</Code> + items
              con icon + <Code>variant="danger"</Code> per Elimina.
            </li>
            <li>
              <strong>Azioni mancanti da decidere:</strong> Export? Soft delete vs hard
              delete? Archivia? Sposta in altro workspace? Da coprire in un sketch
              separato se non banali.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// Shared: editable name (blur-to-save, identical to sketch 1)
// ============================================================================

function EditableName({
  value,
  onCommit,
  editable,
}: {
  value: string;
  onCommit: (next: string) => void;
  editable: boolean;
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
    if (!editable) return;
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
      <TextField value={draft} onChange={setDraft} aria-label="Nome">
        <Input
          ref={inputRef}
          className="min-h-[44px] text-2xl font-heading font-semibold"
          onBlur={commit}
          onKeyDown={handleKeyDown}
        />
      </TextField>
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      disabled={!editable}
      className={`font-heading text-2xl font-semibold text-ink-hi leading-tight text-left rounded-md px-2 -mx-2 transition-colors ${
        editable ? "hover:bg-primary/5 cursor-text" : "cursor-default"
      }`}
    >
      {value}
      {editable && (
        <Pencil
          size={14}
          className="inline-block ml-2 text-primary/30 opacity-0 hover:opacity-100 transition-opacity"
          aria-hidden
        />
      )}
    </button>
  );
}

function FakeBody() {
  return (
    <div className="mt-2">
      <SimpleField label="Descrizione" value="Patriarca dei tre monoteismi." />
      <SimpleField label="Vita" value="2000 → 1825 a.E.V. · 175 anni" />
      <SimpleField label="Tribù" value="Ebrei" />
    </div>
  );
}

function HeaderShell({
  chipSlot,
  nameSlot,
  actionsSlot,
}: {
  chipSlot: ReactNode;
  nameSlot: ReactNode;
  actionsSlot?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between pb-5 border-b border-edge mb-3 gap-3">
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {chipSlot}
        {nameSlot}
      </div>
      {actionsSlot}
    </div>
  );
}

function ActionsDropdown() {
  return (
    <Dropdown>
      <Button isIconOnly size="sm" variant="ghost" aria-label="Azioni elemento" className="min-w-10 min-h-10">
        <MoreHorizontal size={18} />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Item id="rename" textValue="Rinomina">
            <span className="inline-flex items-center gap-2">
              <Pencil size={14} /> <Label>Rinomina</Label>
            </span>
          </Dropdown.Item>
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

function ActionsDropdownWithChangeType() {
  return (
    <Dropdown>
      <Button isIconOnly size="sm" variant="ghost" aria-label="Azioni elemento" className="min-w-10 min-h-10">
        <MoreHorizontal size={18} />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Item id="change-type" textValue="Cambia tipo">
            <span className="inline-flex items-center gap-2">
              <Type size={14} /> <Label>Cambia tipo...</Label>
            </span>
          </Dropdown.Item>
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

function ActionsDropdownFull() {
  return (
    <Dropdown>
      <Button isIconOnly size="sm" variant="ghost" aria-label="Azioni elemento" className="min-w-10 min-h-10">
        <MoreHorizontal size={18} />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu>
          <Dropdown.Item id="rename" textValue="Rinomina">
            <span className="inline-flex items-center gap-2">
              <Pencil size={14} /> <Label>Rinomina</Label>
            </span>
          </Dropdown.Item>
          <Dropdown.Item id="change-type" textValue="Cambia tipo">
            <span className="inline-flex items-center gap-2">
              <Type size={14} /> <Label>Cambia tipo...</Label>
            </span>
          </Dropdown.Item>
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
// A — Inline nome + tipo popover + kebab actions (RECOMMENDED)
// ============================================================================

function InlineNomePopoverTipoMock() {
  const [nome, setNome] = useState("Abraamo");
  const [tipo, setTipo] = useState<string>("personaggio");

  return (
    <>
      <HeaderShell
        chipSlot={
          <Popover>
            <Popover.Trigger className="self-start inline-flex items-center gap-1 cursor-pointer hover:opacity-80">
              <Chip size="md" color="accent" variant="soft" className="cursor-pointer">
                <span className="inline-flex items-center gap-1">
                  {tipo}
                  <ChevronDown size={12} />
                </span>
              </Chip>
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
                      onClick={() => setTipo(t)}
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
        }
        nameSlot={<EditableName value={nome} onCommit={setNome} editable />}
        actionsSlot={<ActionsDropdown />}
      />
      <FakeBody />
      <div className="mt-3 text-[11px] text-ink-dim italic">
        ↑ Tap su <strong>Abraamo</strong> → input nome. Tap sul chip <strong>personaggio</strong> →
        popover TipoElemento. Tap ⋯ → menu Rinomina/Duplica/Elimina.
      </div>
    </>
  );
}

// ============================================================================
// B — Inline nome + tipo readonly + kebab change-type
// ============================================================================

function InlineNomeReadonlyTipoMock() {
  const [nome, setNome] = useState("Abraamo");

  return (
    <>
      <HeaderShell
        chipSlot={
          <Chip size="md" color="accent" variant="soft" className="self-start">
            personaggio
          </Chip>
        }
        nameSlot={<EditableName value={nome} onCommit={setNome} editable />}
        actionsSlot={<ActionsDropdownWithChangeType />}
      />
      <FakeBody />
      <div className="mt-3 text-[11px] text-ink-dim italic">
        ↑ Tap su <strong>Abraamo</strong> → input. Chip readonly. Tap ⋯ → menu con Cambia
        tipo (apre modal con avviso).
      </div>
    </>
  );
}

// ============================================================================
// C — Tutto dietro kebab menu
// ============================================================================

function AllBehindKebabMock() {
  return (
    <>
      <HeaderShell
        chipSlot={
          <Chip size="md" color="accent" variant="soft" className="self-start">
            personaggio
          </Chip>
        }
        nameSlot={<EditableName value="Abraamo" onCommit={() => {}} editable={false} />}
        actionsSlot={<ActionsDropdownFull />}
      />
      <FakeBody />
      <div className="mt-3 text-[11px] text-ink-dim italic">
        ↑ Nome e chip entrambi readonly. Tap ⋯ → menu con tutte le azioni (Rinomina, Cambia
        tipo, Duplica, Elimina).
      </div>
    </>
  );
}
