import { useState } from "react";
import { Chip, Drawer, Input, Modal, Popover, TextField } from "@heroui/react";
import { Plus, Search } from "lucide-react";
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
 * Mockup S02/R005 — Sketch 3: Collegamento picker
 *
 * Su Abraamo, tap "+ collegamento" → cerco Isacco, scelgo TipoLink "parentela",
 * RuoloLink "figlio". Quale grammatica iPad-native?
 *
 *   A. Big anchored popover single-step grouped       ⭐ RECOMMENDED
 *   B. Right Drawer con filtri estesi + preview
 *   C. Centered modal command-palette style
 */

export function CollegamentoPickerMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="3"
          title="Collegamento picker"
          subtitle={
            <>
              Da Abraamo aggiungi link → Isacco con TipoLink <em>parentela</em>, ruolo{" "}
              <em>figlio</em>. Picker veloce o inspector ricco?
            </>
          }
        />

        <Alternative
          letter="A"
          recommended
          title="Big anchored popover (single-step)"
          subtitle="popover ~440px ancorato al + collegamento · search + lista raggruppata · ruolo inline"
          mock={<PopoverPickerMock />}
          grammatica={
            <>
              Tap "+ collegamento" → <Code>{`<Popover>`}</Code> ~440px ancorato al chip.
              Header con search prominente + close X.
              <br />
              Lista <strong>raggruppata per TipoLink</strong>: parentela, adempimento,
              parallelo, ecc. Tap su elemento (es. Isacco sotto Parentela) → row inline{" "}
              <strong>Ruolo</strong> appare sotto con chips 44px (figlio attivo di default).
              <br />
              Tap fuori → commit.
            </>
          }
          items={[
            ["pro", "<strong>Più veloce: 2 tap</strong> per il caso comune (elemento + ruolo)"],
            ["pro", "Anchored al trigger — l'utente vede da dove parte"],
            ["pro", "Lateralmente compatto, lascia visibile il detail pane"],
            ["pro", "Stesso primitive del composite Vita (sketch 5 C) — coerenza"],
            ["pro", "Search filtra TUTTI i gruppi insieme"],
            ["con", "Su workspace con &gt;100 elementi serve sempre digitare per filtrare"],
            ["con", "Ruolo appare solo per parentela — leggera sorpresa visuale"],
          ]}
        />

        <Divider />

        <Alternative
          letter="B"
          title="Right Drawer con filtri estesi"
          subtitle="drawer 440px da destra · search + filter pills tipo + preview elemento selezionato"
          mock={<DrawerPickerMock />}
          grammatica={
            <>
              Tap "+ collegamento" → <Code>{`<Drawer placement="right">`}</Code> 440px da
              destra. Header con search + close.
              <br />
              <strong>Filter pills</strong> per TipoElemento (personaggio/evento/luogo/...) +{" "}
              <strong>filter pills</strong> per TipoLink. Lista risultati + preview a destra
              con metadata dell'elemento selezionato.
              <br />
              Conferma con bottone "Aggiungi collegamento" in fondo, Esc/X annulla.
            </>
          }
          items={[
            ["pro", "Spazio per filtri estesi e preview — power user friendly"],
            ["pro", "Stesso primitive del composite Vita (sketch 5 A) — pattern unificato per 'edit complesso'"],
            ["pro", "Risk-free per workspace molto grandi (100+ elementi)"],
            ["con", "<strong>Pesante per un picker veloce</strong> — drawer per scegliere 1 elemento è overkill"],
            ["con", "3+ tap minimi (apri drawer + filter + scegli + conferma)"],
            ["con", "iPad portrait copre quasi tutto il detail pane"],
          ]}
        />

        <Divider />

        <Alternative
          letter="C"
          title="Centered modal command-palette"
          subtitle="modal centrato 520px · search dominante · recent + risultati · ⌘K affordance"
          mock={<ModalPickerMock />}
          grammatica={
            <>
              Tap "+ collegamento" → <Code>{`<Modal>`}</Code> centrato 520px stile{" "}
              <strong>Linear / Raycast</strong>. Search HUGE prominent + recent items + filter
              pills sopra.
              <br />
              Tap elemento → sezione inferiore appare con TipoLink chips e (se parentela)
              Ruolo chips. Conferma con Enter o tap "Aggiungi".
              <br />
              Shortcut <Code>⌘K</Code> globale per aprire da qualunque punto.
            </>
          }
          items={[
            ["pro", "Recenti prima — caso comune ottimizzato"],
            ["pro", "Pattern Linear/Raycast — familiare a power user"],
            ["pro", "⌘K shortcut globale per accesso da qualunque pagina"],
            ["con", "<strong>Modal centrato copre il detail pane</strong> — perde contesto"],
            ["con", "⌘K inutile senza tastiera fisica iPad"],
            ["con", "Inverte mental model: scegli prima 'chi', poi 'come' — anti-italiano"],
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Link bidirezionali:</strong> creando "Abraamo →padre→ Isacco" il dominio
              crea automaticamente "Isacco →figlio→ Abraamo". Mai mostrare l'inverso nel
              picker.
            </li>
            <li>
              <strong>Performance:</strong> A è il più snello. Per workspace &gt; 500 elementi
              valutare virtualization sulla lista risultati (intersection observer).
            </li>
            <li>
              <strong>Coerenza:</strong> A usa lo stesso pattern Popover di sketch 5 C (Vita),
              B usa lo stesso Drawer di sketch 5 A. Scegliere uno dei due per consistency.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

function CollegamentiSection() {
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Vita" value="2000 → 1825 a.E.V. · 175 anni" />
      <div className="flex items-start gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Collegamenti
        </span>
        <div className="flex-1 flex flex-wrap gap-2 items-center pt-2">
          <Chip size="md" variant="soft" color="accent">
            <span className="inline-flex items-center gap-1.5">
              Sara <span className="text-ink-dim text-[11px]">· coniuge</span>
            </span>
          </Chip>
        </div>
      </div>
    </>
  );
}

function PopoverPickerMock() {
  const [search, setSearch] = useState("");
  return (
    <>
      <CollegamentiSection />
      <div className="flex items-start gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold opacity-0">
          .
        </span>
        <Popover>
          <Popover.Trigger className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full border border-dashed border-primary/40 text-primary/80 text-sm font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
            <Plus size={14} />
            collegamento
          </Popover.Trigger>
          <Popover.Content className="w-[440px]">
            <Popover.Dialog className="bg-panel border border-edge rounded-xl shadow-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Popover.Heading className="font-heading text-sm text-ink-hi">
                  Aggiungi collegamento
                </Popover.Heading>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none z-10" />
                <TextField value={search} onChange={setSearch}>
                  <Input placeholder="Cerca elemento..." className="min-h-[48px] pl-10" />
                </TextField>
              </div>

              <div className="mt-4 max-h-[260px] overflow-y-auto">
                <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mt-1 mb-1 px-1">
                  Parentela
                </div>
                <PickerRow name="Isacco" tipo="personaggio" selected />
                <PickerRow name="Ismaele" tipo="personaggio" />

                <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mt-3 mb-1 px-1">
                  Adempimento
                </div>
                <PickerRow name="Promessa della terra" tipo="profezia" />
              </div>

              <div className="mt-3 pt-3 border-t border-edge">
                <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
                  Ruolo (parentela)
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip size="md" variant="primary" color="accent">figlio</Chip>
                  <Chip size="md" variant="soft">figlia</Chip>
                  <Chip size="md" variant="soft">padre</Chip>
                  <Chip size="md" variant="soft">madre</Chip>
                </div>
              </div>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </div>
    </>
  );
}

function PickerRow({ name, tipo, selected }: { name: string; tipo: string; selected?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 min-h-[48px] px-3 rounded-md cursor-pointer transition-colors ${
        selected ? "bg-primary/15" : "hover:bg-primary/5"
      }`}
    >
      <span className="flex-1 text-[14px] text-ink-hi font-medium">{name}</span>
      <Chip size="sm" variant="soft" className="bg-chip-bg text-ink-lo text-[11px]">
        {tipo}
      </Chip>
    </div>
  );
}

function DrawerPickerMock() {
  return (
    <>
      <CollegamentiSection />
      <div className="flex items-start gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold opacity-0">
          .
        </span>
        <Drawer>
          <Drawer.Trigger className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full border border-dashed border-primary/40 text-primary/80 text-sm font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
            <Plus size={14} />
            collegamento (drawer)
          </Drawer.Trigger>
          <Drawer.Backdrop />
          <Drawer.Content placement="right" className="w-[440px] max-w-[90vw]">
            <Drawer.Dialog>
              <Drawer.Header className="px-6 py-4 border-b border-edge flex items-center justify-between">
                <Drawer.Heading className="font-heading text-lg text-ink-hi">
                  Nuovo collegamento
                </Drawer.Heading>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <Drawer.Body className="px-6 py-5 space-y-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none z-10" />
                  <Input placeholder="Cerca..." className="min-h-[52px] pl-10" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
                    Filtra per tipo
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip size="md" variant="primary" color="accent">tutti</Chip>
                    <Chip size="md" variant="soft">personaggio</Chip>
                    <Chip size="md" variant="soft">evento</Chip>
                    <Chip size="md" variant="soft">luogo</Chip>
                    <Chip size="md" variant="soft">profezia</Chip>
                  </div>
                </div>
                <div className="space-y-1">
                  <PickerRow name="Isacco" tipo="personaggio" selected />
                  <PickerRow name="Ismaele" tipo="personaggio" />
                  <PickerRow name="Sara" tipo="personaggio" />
                </div>
                <div className="pt-3 border-t border-edge">
                  <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
                    TipoLink
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Chip size="md" variant="primary" color="accent">parentela</Chip>
                    <Chip size="md" variant="soft">causa-effetto</Chip>
                    <Chip size="md" variant="soft">parallelo</Chip>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
                    Ruolo
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip size="md" variant="primary" color="accent">figlio</Chip>
                    <Chip size="md" variant="soft">padre</Chip>
                    <Chip size="md" variant="soft">coniuge</Chip>
                  </div>
                </div>
              </Drawer.Body>
              <Drawer.Footer className="px-6 py-4 border-t border-edge text-[11px] text-ink-dim">
                Tap fuori per annullare · Enter per aggiungere
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer>
      </div>
    </>
  );
}

function ModalPickerMock() {
  return (
    <>
      <CollegamentiSection />
      <div className="flex items-start gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold opacity-0">
          .
        </span>
        <Modal>
          <Modal.Trigger className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full border border-dashed border-primary/40 text-primary/80 text-sm font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
            <Plus size={14} />
            collegamento (modal)
          </Modal.Trigger>
          <Modal.Backdrop />
          <Modal.Container placement="center" size="md">
            <Modal.Dialog className="w-[520px] max-w-[90vw]">
              <Modal.Header className="px-6 py-4 border-b border-edge flex items-center justify-between">
                <Modal.Heading className="font-heading text-lg text-ink-hi">
                  Aggiungi collegamento
                </Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="px-6 py-5 space-y-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-dim pointer-events-none z-10" />
                  <Input
                    placeholder="Cerca elemento..."
                    className="min-h-[56px] text-base pl-11"
                  />
                </div>
                <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold">
                  Recenti
                </div>
                <div className="space-y-1">
                  <PickerRow name="Sara" tipo="personaggio" />
                  <PickerRow name="Isacco" tipo="personaggio" selected />
                  <PickerRow name="Ismaele" tipo="personaggio" />
                </div>
              </Modal.Body>
              <Modal.Footer className="px-6 py-3 border-t border-edge text-[11px] text-ink-dim flex items-center justify-between">
                <span>⌘K per riaprire</span>
                <span>Enter per aggiungere</span>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal>
      </div>
    </>
  );
}
