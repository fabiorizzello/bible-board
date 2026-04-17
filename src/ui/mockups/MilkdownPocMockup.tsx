import { useState } from "react";
import { Editor, defaultValueCtx, rootCtx } from "@milkdown/core";
import { commonmark } from "@milkdown/preset-commonmark";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { Chip } from "@heroui/react";
import { Star } from "lucide-react";
import { Code, ElementoHeader, IpadFrame, MockupFooter, MockupHeader, SimpleField } from "./_atoms";

// Project teal styling per Milkdown — base ProseMirror non serve, gestiamo
// noi tutto via custom CSS scoped a .milkdown-host
import "./milkdown-iframe.css";

/**
 * Mockup S02/R005 — Milkdown POC
 *
 * Sketch 4 versione REAL (non più static HTML). Usa Milkdown 7.20 vero,
 * preset commonmark, listener per blur-to-save.
 *
 * Cosa testare su iPad 10.9":
 *   - Tap nel testo formattato → diventa editable inline
 *   - Type → format markdown shortcuts (es. **bold** → bold renderizzato)
 *   - Selection touch (tap-hold) → ProseMirror handles
 *   - Apple Pencil Scribble (dev nativa iPadOS) per inserire testo
 *   - Soft keyboard apertura/chiusura
 *   - Performance perceived
 *
 * NO bubble menu plugin in questo POC: voglio prima validare che il render
 * base + interazione touch funzionino, poi iteriamo.
 */

const INITIAL_MARKDOWN = `Patriarca dei **tre monoteismi abramitici**. Chiamato da *Ur dei Caldei*, riceve la promessa divina di una terra e una discendenza.

La sua fede viene messa alla prova nel sacrificio di [Isacco](#isacco), evento chiamato *Akedah*.

- Nascita: Ur dei Caldei
- Morte: Hebron, 175 anni
- Moglie principale: Sara`;

function MilkdownEditor({
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
      .use(listener)
  );

  return <Milkdown />;
}

export function MilkdownPocMockup() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [showSource, setShowSource] = useState(false);

  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="4·POC"
          title="Milkdown POC"
          subtitle={
            <>
              Editor markdown <strong>vero</strong> (non più mockup statico). Milkdown 7.20
              + preset-commonmark + listener. Da testare su iPad 10.9" reale per
              selezione touch, Pencil Scribble, performance.
            </>
          }
        />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary text-white inline-flex items-center justify-center font-mono font-bold text-lg flex-shrink-0 shadow-lg shadow-primary/25">
            ★
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-xl text-ink-hi">Live Milkdown editor</h2>
            <div className="text-sm text-ink-lo">
              Tap nel testo, modifica, scopri come si comporta il vero Milkdown su touch.
            </div>
          </div>
          <Chip color="accent" variant="primary" size="sm">
            <span className="inline-flex items-center gap-1.5">
              <Star size={12} />
              POC reale
            </span>
          </Chip>
        </div>

        <div className="flex gap-8 items-start flex-wrap">
          <IpadFrame>
            <ElementoHeader />
            <SimpleField label="Tipo" value="personaggio" />
            <div className="flex items-start gap-4 min-h-[48px] py-1">
              <span className="w-[110px] flex-shrink-0 pt-3 text-[11px] uppercase tracking-wider text-primary font-semibold">
                Descrizione
              </span>
              <div className="flex-1 milkdown-host">
                <MilkdownProvider>
                  <MilkdownEditor defaultValue={INITIAL_MARKDOWN} onChange={setMarkdown} />
                </MilkdownProvider>
              </div>
            </div>
            <SimpleField label="Nascita" value="2000 a.E.V." />
          </IpadFrame>

          <div className="flex-1 min-w-[320px] space-y-5">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm leading-relaxed text-ink-hi">
              <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1.5">
                Cosa testare su iPad
              </div>
              <ul className="list-disc list-inside space-y-1 ml-1 text-sm">
                <li>
                  <strong>Tap-hold + drag handles</strong>: la selezione touch funziona?
                </li>
                <li>
                  <strong>Markdown shortcut</strong>: digita <Code>**ciao**</Code> e premi
                  spazio → diventa <strong>ciao</strong>?
                </li>
                <li>
                  <strong>Apple Pencil Scribble</strong>: scrivi a mano nel field, viene
                  trasformato in testo?
                </li>
                <li>
                  <strong>Soft keyboard</strong>: si apre subito al tap? Si chiude al tap fuori?
                </li>
                <li>
                  <strong>Performance</strong>: typing percepito istantaneo? Lag su backspace?
                </li>
                <li>
                  <strong>IME italiano</strong>: accenti (à, è, ì, ò, ù) corretti?
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-lg p-4 text-sm text-amber-900 leading-relaxed">
              <div className="text-[11px] uppercase tracking-wider font-bold mb-1.5">
                Non ancora incluso (verrà se POC OK)
              </div>
              <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                <li><Code>@milkdown/plugin-tooltip</Code> → bubble menu su selezione</li>
                <li><Code>@milkdown/plugin-slash</Code> → menu blocchi su <Code>/</Code></li>
                <li>Custom theme allineato a tokens progetto (al momento usa default ProseMirror)</li>
                <li>Link picker custom (per linkare elementi del workspace, non URL esterni)</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowSource((s) => !s)}
              className="w-full text-left text-xs text-primary hover:text-primary/80 font-semibold underline"
            >
              {showSource ? "Nascondi" : "Mostra"} markdown live
            </button>
            {showSource && (
              <pre className="rounded-md bg-slate-900 text-slate-200 p-4 text-[11px] leading-relaxed overflow-x-auto font-mono whitespace-pre-wrap">
                {markdown || <span className="text-slate-500 italic">(vuoto)</span>}
              </pre>
            )}
          </div>
        </div>

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Versioni:</strong> Milkdown 7.20.0, preset-commonmark, plugin-listener.
              React 19 compatibility OK (verificato build).
            </li>
            <li>
              <strong>Setup:</strong> <Code>{"<MilkdownProvider>"}</Code> wrapper +{" "}
              <Code>useEditor</Code> hook + <Code>{"<Milkdown />"}</Code> render. Listener
              chiama onChange a ogni keystroke (debounce-able esternamente).
            </li>
            <li>
              <strong>CSS:</strong> import obbligatorio di{" "}
              <Code>@milkdown/prose/style/prosemirror.css</Code>. Custom styling teal in{" "}
              <Code>milkdown-iframe.css</Code> co-located.
            </li>
            <li>
              <strong>Storage modello dominio:</strong> Milkdown gestisce ProseMirror state
              in memoria; il commit verso Jazz CRDT serializza il markdown via{" "}
              <Code>listener.markdownUpdated</Code>.
            </li>
            <li>
              <strong>Test su iPad:</strong> <Code>npm run dev -- --host</Code> + apri da
              iPad sulla LAN. Aprilo come PWA standalone (Add to Home Screen) per simulare
              l'esperienza prod.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}
