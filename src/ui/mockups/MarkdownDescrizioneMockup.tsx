import { useState } from "react";
import { Drawer } from "@heroui/react";
import { Bold, Code as CodeIcon, Heading1, Italic, Link2, List, Quote } from "lucide-react";
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
 * Mockup S02/R005 — Sketch 4: Markdown descrizione (Milkdown chrome)
 *
 * Abraamo ha una descrizione markdown con grassetto, link, lista. Quale chrome
 * sopra Milkdown senza rompere inline per-campo?
 *
 *   A. Bubble menu on selection (Notion-style)        ⭐ RECOMMENDED
 *   B. Right Drawer full editor (Pages writing mode)
 *   C. Toolbar above field on focus only
 */

export function MarkdownDescrizioneMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="4"
          title="Markdown descrizione"
          subtitle={
            <>
              Descrizione di Abraamo con grassetto, link a Isacco, lista. Quale chrome
              UI sopra <strong>Milkdown</strong> per editare senza rompere inline per-campo?
            </>
          }
        />

        <Alternative
          letter="A"
          recommended
          title="Bubble menu on selection"
          subtitle="zero chrome in idle · selezione testo → bubble dark floating con format buttons"
          mock={<BubbleMenuMock />}
          grammatica={
            <>
              Tap nel campo descrizione → border teal + focus ring (HeroUI Input lg).
              <br />
              <strong>Idle (no selezione)</strong>: zero chrome, "sembra solo testo formattato".
              <br />
              <strong>Su selezione testo</strong> (tap-hold + drag handles iPad nativo) →
              bubble menu floating dark con buttons 44×44: Bold / Italic / Strike / H1 / Link
              / Code.
              <br />
              <strong>Inline shortcuts</strong> markdown (<Code>**bold**</Code>,{" "}
              <Code>*italic*</Code>) auto-convertiti da Milkdown.
              <br />
              Tap fuori → commit (sketch 1A blur-to-save).
            </>
          }
          items={[
            ["pro", "<strong>Chrome zero in idle</strong> — coerente con inline per-campo"],
            ["pro", "Bubble button 44×44 — usabile anche senza tastiera"],
            ["pro", "iPad supporta nativamente la selezione testo (tap-hold + handles + magnifier)"],
            ["pro", "Milkdown ha <Code>@milkdown/plugin-tooltip</Code> — implementazione diretta"],
            ["pro", "Mental model familiare (Notion, Apple Notes recente)"],
            ["con", "Block-level (heading, lista, quote) richiede shortcut markdown o tap H1/Quote nel bubble"],
            ["con", "Selezione touch è meno precisa del cursor — serve Pencil/dito preciso"],
          ]}
        />

        <Divider />

        <Alternative
          letter="B"
          title="Right Drawer full editor"
          subtitle="tap field → drawer 480px da destra · editor markdown full-width con toolbar Pages-style"
          mock={<DrawerEditorMock />}
          grammatica={
            <>
              Idle: il campo descrizione mostra il preview formattato (clickable, hover bg
              teal).
              <br />
              Tap field → <Code>{`<Drawer placement="right">`}</Code> 480px da destra con{" "}
              <strong>editor full-width</strong>, toolbar completa in alto (Bold, Italic,
              H1-3, List, Quote, Link, Code), preview live opzionale.
              <br />
              Tap fuori / Esc / X → close + commit.
              <br />
              <strong>Coerente con sketch 5 A</strong> (composite Vita drawer) per pattern
              "edit complesso = drawer".
            </>
          }
          items={[
            ["pro", "Spazio editing massimo — perfetto per descrizioni lunghe"],
            ["pro", "Toolbar completa sempre visibile — discoverability totale"],
            ["pro", "Preview live affiancato (split view possibile in 480px)"],
            ["pro", "Pattern unificato con sketch 5 A — edit complesso sempre in drawer"],
            ["con", "<strong>Mode-swap esplicito</strong>: tap field → editor pieno → leggermente anti inline"],
            ["con", "Per modifica veloce di una parola, drawer è overkill"],
            ["con", "iPad portrait (820px) il drawer copre &gt;50% dello schermo"],
          ]}
        />

        <Divider />

        <Alternative
          letter="C"
          title="Toolbar above field on focus"
          subtitle="idle text · tap → border teal + toolbar HeroUI compatta sopra il field (sticky)"
          mock={<FocusToolbarMock />}
          grammatica={
            <>
              Idle: testo formattato, zero chrome.
              <br />
              Tap field → border teal + <strong>toolbar HeroUI compatta sopra il field</strong>{" "}
              (sticky, non sopra la pagina), 44px alta, con 6-8 buttons format essenziali.
              <br />
              Toolbar disappare al blur (commit).
              <br />
              Compromesso tra A (zero chrome) e B (toolbar permanente).
            </>
          }
          items={[
            ["pro", "Toolbar appare solo quando serve — zero chrome in idle"],
            ["pro", "Heading/lista/link con un tap — no shortcut markdown da imparare"],
            ["pro", "Mantiene il field IN-PLACE (no drawer/modal)"],
            ["con", "Toolbar sticky = chrome ~44px sopra il field durante edit"],
            ["con", "<strong>Layout shift verticale</strong> all'apparire della toolbar — viola vincolo zero shift"],
            ["con", "Su descrizione corta la toolbar copre proporzionalmente troppo"],
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Editor locked:</strong> <Code>Milkdown</Code> (MIT, headless,
              ProseMirror). Lo sketch confronta solo la UI <em>chrome</em>.
            </li>
            <li>
              <strong>Data model:</strong> <Code>Elemento.descrizione: string</Code> resta
              markdown plain. Milkdown serializza/deserializza al boundary adapter.
            </li>
            <li>
              <strong>Plugin Milkdown:</strong> <Code>@milkdown/plugin-tooltip</Code> (per A),{" "}
              <Code>@milkdown/preset-commonmark</Code>, <Code>@milkdown/plugin-listener</Code>{" "}
              (commit on blur).
            </li>
            <li>
              <strong>Variante futura A+B:</strong> bubble menu inline per quick format +
              tap "Apri editor" icon → drawer per writing session lunghe. Da valutare in plan
              02-03.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

function FormattedDescrizione({ withSelection = false }: { withSelection?: boolean }) {
  return (
    <div className="text-[15px] leading-relaxed text-ink-hi space-y-2">
      <p>
        Patriarca dei{" "}
        {withSelection ? (
          <span className="bg-primary/25 rounded px-0.5">tre monoteismi abramitici</span>
        ) : (
          <strong className="font-semibold text-primary">tre monoteismi abramitici</strong>
        )}
        . Chiamato da <em className="italic text-primary">Ur dei Caldei</em>, riceve la
        promessa divina di una terra e una discendenza.
      </p>
      <p>
        La sua fede viene messa alla prova nel sacrificio di{" "}
        <a href="#" className="text-primary underline decoration-primary/40 underline-offset-2">
          Isacco
        </a>
        , evento chiamato <em className="italic text-primary">Akedah</em>.
      </p>
    </div>
  );
}

function BubbleButton({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      className={`w-11 h-11 inline-flex items-center justify-center rounded-md transition-colors ${
        active ? "bg-primary text-white" : "text-slate-200 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function BubbleMenuMock() {
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <div className="flex items-start gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Descrizione
        </span>
        <div className="flex-1 relative">
          <div className="border-2 border-primary rounded-lg px-4 py-3 shadow-[0_0_0_4px_rgba(20,184,166,0.15)]">
            <FormattedDescrizione withSelection />
          </div>
          {/* Bubble menu floating above selection */}
          <div className="absolute -top-16 left-12 inline-flex items-center gap-1 p-1.5 bg-slate-900 rounded-lg shadow-2xl">
            <BubbleButton active><Bold size={18} /></BubbleButton>
            <BubbleButton><Italic size={18} /></BubbleButton>
            <span className="w-px h-7 bg-white/15 mx-1" />
            <BubbleButton><Heading1 size={18} /></BubbleButton>
            <BubbleButton><Link2 size={18} /></BubbleButton>
            <BubbleButton><CodeIcon size={18} /></BubbleButton>
            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-8 w-3 h-3 bg-slate-900 rotate-45" />
          </div>
        </div>
      </div>
      <SimpleField label="Nascita" value="2000 a.E.V." />
    </>
  );
}

function DrawerEditorMock() {
  const [text, setText] = useState(
    "Patriarca dei **tre monoteismi abramitici**. Chiamato da *Ur dei Caldei*, riceve la promessa divina di una terra e una discendenza.\n\nLa sua fede viene messa alla prova nel sacrificio di [Isacco](#isacco), evento chiamato *Akedah*."
  );
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <div className="flex items-start gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Descrizione
        </span>
        <Drawer>
          <Drawer.Trigger className="flex-1 cursor-pointer text-left p-3 -m-3 rounded-md hover:bg-primary/5 transition-colors">
            <FormattedDescrizione />
          </Drawer.Trigger>
          <Drawer.Backdrop />
          <Drawer.Content placement="right" className="w-[480px] max-w-[90vw]">
            <Drawer.Dialog>
              <Drawer.Header className="px-6 py-4 border-b border-edge flex items-center justify-between">
                <Drawer.Heading className="font-heading text-lg text-ink-hi">
                  Modifica descrizione
                </Drawer.Heading>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <div className="px-6 py-2 border-b border-edge flex items-center gap-1 bg-chrome">
                <button className="w-10 h-10 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><Bold size={16} /></button>
                <button className="w-10 h-10 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><Italic size={16} /></button>
                <span className="w-px h-5 bg-edge mx-1" />
                <button className="w-10 h-10 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><Heading1 size={16} /></button>
                <button className="w-10 h-10 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><List size={16} /></button>
                <button className="w-10 h-10 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><Quote size={16} /></button>
                <span className="w-px h-5 bg-edge mx-1" />
                <button className="w-10 h-10 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><Link2 size={16} /></button>
                <button className="w-10 h-10 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><CodeIcon size={16} /></button>
              </div>
              <Drawer.Body className="px-6 py-5">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full min-h-[300px] resize-none border-2 border-primary rounded-lg p-4 font-body text-[15px] leading-relaxed text-ink-hi outline-none shadow-[0_0_0_4px_rgba(20,184,166,0.15)]"
                />
              </Drawer.Body>
              <Drawer.Footer className="px-6 py-3 border-t border-edge text-[11px] text-ink-dim">
                Markdown · Tap fuori per salvare
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer>
      </div>
      <SimpleField label="Nascita" value="2000 a.E.V." />
    </>
  );
}

function FocusToolbarMock() {
  return (
    <>
      <ElementoHeader />
      <SimpleField label="Tipo" value="personaggio" />
      <div className="flex items-start gap-4 min-h-[48px] py-1">
        <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold">
          Descrizione
        </span>
        <div className="flex-1">
          <div className="border-2 border-primary rounded-lg shadow-[0_0_0_4px_rgba(20,184,166,0.15)] overflow-hidden">
            <div className="flex items-center gap-1 px-2 py-1 bg-chrome border-b border-edge">
              <button className="w-9 h-9 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><Bold size={15} /></button>
              <button className="w-9 h-9 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><Italic size={15} /></button>
              <span className="w-px h-4 bg-edge mx-1" />
              <button className="w-9 h-9 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><Heading1 size={15} /></button>
              <button className="w-9 h-9 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><List size={15} /></button>
              <button className="w-9 h-9 inline-flex items-center justify-center rounded hover:bg-edge text-ink-md"><Link2 size={15} /></button>
            </div>
            <div className="px-4 py-3">
              <FormattedDescrizione />
            </div>
          </div>
        </div>
      </div>
      <SimpleField label="Nascita" value="2000 a.E.V." />
    </>
  );
}
