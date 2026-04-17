import { Button, Chip, Popover } from "@heroui/react";
import { Plus, Tag, Users, Link2, FileText } from "lucide-react";
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
 * Mockup S02/R005 — Sketch 2: Empty fields + aggiungi campo
 *
 * Abraamo ha 4 campi popolati. Ruoli e Tags sono vuoti. Si mostrano sempre,
 * si nascondono, o si aggiungono on-demand via "+ aggiungi"?
 *
 *   A. Always-visible placeholders (clutter su tipi ricchi)
 *   B. Riga inline "+ aggiungi" con popover chips      ⭐ RECOMMENDED
 *   C. Toolbar action sticky bottom (sempre visibile)
 */

export function EmptyFieldsMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="2"
          title="Empty fields + aggiungi campo"
          subtitle={
            <>
              4 campi popolati su Abraamo. <strong>Ruoli</strong> e <strong>Tags</strong> sono
              vuoti, e potremmo voler aggiungere collegamenti/fonti. Dove vive il "+ aggiungi"?
            </>
          }
        />

        <Alternative
          letter="A"
          title="Always-visible placeholders"
          subtitle="tutti i campi del TipoElemento sempre in lista, vuoti come placeholder muted"
          mock={<AlwaysVisibleMock />}
          grammatica={
            <>
              Ogni campo del <Code>TipoElemento</Code> è un row sempre visibile. Vuoti →
              label muted + valore italic <em>"— nessun X"</em>.
              <br />
              Tap su placeholder → entra in edit con valore vuoto.
              <br />
              Niente menu "+ aggiungi" — la lista campi è data-driven dal tipo.
            </>
          }
          items={[
            ["pro", "Discoverability 100% — l'utente vede subito quali campi può popolare"],
            ["pro", "Cambio TipoElemento → auto-surface dei nuovi campi"],
            ["pro", "Layout prevedibile — ogni elemento dello stesso tipo ha stessa altezza"],
            ["con", "<strong>Clutter su tipi ricchi</strong>: periodo (4 campi data), evento (6+ campi)"],
            ["con", "Anti-Notion — Notion mostra solo property con valore o esplicitamente fissate"],
            ["con", "Niente posto naturale per aggiungere link/fonti/allegati universali"],
          ]}
        />

        <Divider />

        <Alternative
          letter="B"
          recommended
          title="Riga inline + popover chips"
          subtitle="solo campi popolati visibili · row '+ aggiungi' bottom · tap → popover con chips filtrati"
          mock={<InlineAddMock />}
          grammatica={
            <>
              Solo campi con valore in lista (in-flow Notion-style).
              <br />
              Sotto l'ultimo field, row 48px <strong>"+ aggiungi campo"</strong> in style
              dashed. Tap → <Code>{`<Popover>`}</Code> HeroUI con chips filtrate per
              TipoElemento + chips universali (Collegamento, Fonte).
              <br />
              Tap su chip → nuovo field-row in edit state, popover si chiude.
            </>
          }
          items={[
            ["pro", "<strong>In-flow Notion-style</strong> — coerente con inline per-campo"],
            ["pro", "Touch target 48px su row + 44px su chip → iPad-friendly"],
            ["pro", "Unifica field tipizzati + universali (Collegamento, Fonte) in 1 entry point"],
            ["pro", "Apple HIG-compliant: pattern Notes ('Add Item'), Things 3, Reminders"],
            ["pro", "Niente clutter su tipi semplici (annotazione: 0 → mostra solo '+ aggiungi')"],
            ["con", "Su elementi molto popolati (50+ link/fonti) la row '+' può finire fuori viewport"],
            ["con", "Discoverability dei field tipizzati richiede onboarding minimo"],
          ]}
        />

        <Divider />

        <Alternative
          letter="C"
          title="Toolbar action sticky bottom"
          subtitle="bottone '+ aggiungi' SEMPRE visibile, sticky in fondo al detail pane"
          mock={<StickyBottomMock />}
          grammatica={
            <>
              Solo campi con valore in lista. In fondo al detail pane (sticky) → toolbar con{" "}
              <Code>{`<Button>`}</Code> HeroUI "+ aggiungi campo".
              <br />
              Tap → popover identico a B (chips filtrate).
              <br />
              Toolbar sempre raggiungibile anche con scroll lungo.
            </>
          }
          items={[
            ["pro", "Always-reachable — anche su elementi con 100+ link, '+' è sempre lì"],
            ["pro", "Pattern noto: macOS Notes toolbar, Pages action bar"],
            ["pro", "Discoverability massima"],
            ["con", "<strong>Chrome permanente</strong>: una bar in fondo riduce spazio per contenuto"],
            ["con", "Sticky-bottom su iPad portrait collide con safe area"],
            ["con", "Inflessibile: 1 sola action universale, perde la differenziazione field tipizzati vs universali"],
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Field data-driven:</strong> la lista campi ammessi viene da{" "}
              <Code>features/elemento/rules.ts</Code> exhaustive su <code>TipoElemento</code>{" "}
              (8 varianti). La UI riflette il dominio.
            </li>
            <li>
              <strong>Composite components:</strong> Vita, Regno, Periodo (sketch 5)
              compaiono come SINGOLE entry nel popover di B. Non 2 chip "nascita"+"morte".
            </li>
            <li>
              <strong>Universal fields:</strong> Collegamento e Fonte sono validi per ogni
              TipoElemento e devono apparire in fondo al popover (separati da divider).
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

function AlwaysVisibleMock() {
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Descrizione" value="Patriarca dei tre monoteismi." />
      <SimpleField label="Nascita" value="2000 a.E.V." />
      <SimpleField label="Morte" value="1825 a.E.V." />
      <SimpleField label="Tribù" value="Ebrei" />
      <SimpleField label="Ruoli" value="— nessun ruolo" dim />
      <SimpleField label="Tags" value="— nessun tag" dim />
    </>
  );
}

function InlineAddMock() {
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Descrizione" value="Patriarca dei tre monoteismi." />
      <SimpleField label="Nascita" value="2000 a.E.V." />
      <SimpleField label="Morte" value="1825 a.E.V." />
      <SimpleField label="Tribù" value="Ebrei" />
      <div className="mt-3">
        <Popover>
          <Popover.Trigger className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-lg border border-dashed border-primary/40 text-primary/80 text-sm font-medium hover:bg-primary/5 hover:border-primary cursor-pointer transition-colors">
            <Plus size={16} />
            Aggiungi campo
          </Popover.Trigger>
          <Popover.Content className="w-[360px]">
            <Popover.Dialog className="bg-panel border border-edge rounded-xl shadow-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
                Campi tipizzati
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Chip size="md" variant="soft" className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5"><Users size={14} /> Ruoli</span>
                </Chip>
                <Chip size="md" variant="soft" className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5"><Tag size={14} /> Tags</span>
                </Chip>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2 pt-3 border-t border-edge">
                Universali
              </div>
              <div className="flex flex-wrap gap-2">
                <Chip size="md" variant="soft" className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5"><Link2 size={14} /> Collegamento</span>
                </Chip>
                <Chip size="md" variant="soft" className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5"><FileText size={14} /> Fonte</span>
                </Chip>
              </div>
            </Popover.Dialog>
          </Popover.Content>
        </Popover>
      </div>
    </>
  );
}

function StickyBottomMock() {
  return (
    <div className="relative pb-16">
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <SimpleField label="Descrizione" value="Patriarca dei tre monoteismi." />
      <SimpleField label="Nascita" value="2000 a.E.V." />
      <SimpleField label="Morte" value="1825 a.E.V." />
      <SimpleField label="Tribù" value="Ebrei" />

      {/* Sticky toolbar bottom */}
      <div className="absolute bottom-0 left-0 right-0 -mx-7 -mb-6 px-7 py-3 bg-chrome border-t border-edge flex items-center justify-between">
        <span className="text-[11px] text-ink-dim">5 campi · 0 link · 0 fonti</span>
        <Button size="sm" variant="primary" className="min-h-9">
          <span className="inline-flex items-center gap-1.5">
            <Plus size={14} />
            Aggiungi
          </span>
        </Button>
      </div>
    </div>
  );
}
