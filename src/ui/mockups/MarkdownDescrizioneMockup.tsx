import { useState } from "react";
import { Editor, defaultValueCtx, rootCtx } from "@milkdown/core";
import { commonmark } from "@milkdown/preset-commonmark";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { Chip } from "@heroui/react";
import { Star } from "lucide-react";
import {
  Code,
  ElementoHeader,
  IpadFrame,
  MockupFooter,
  MockupHeader,
  SimpleField,
} from "./_atoms";
import "./milkdown-iframe.css";

/**
 * Mockup S02/R005 — Sketch 4: Markdown descrizione (Milkdown vero)
 *
 * Decisione lockata: Milkdown 7.20 è l'editor markdown.
 * Niente alternative — questo POC valida che Milkdown su iPad funzioni.
 *
 * Da testare su iPad 10.9":
 *   - Tap nel testo → cursor entra, soft keyboard si apre
 *   - Markdown shortcut inline: **bold**, *italic*, [link](url), - lista, # h1, > quote
 *   - Apple Pencil Scribble (handwriting → text)
 *   - Selection touch (tap-hold) + drag handles iOS
 *   - Undo nativo (Cmd+Z se Magic Keyboard, shake-to-undo iPadOS)
 *   - IME italiano (accenti)
 *   - Performance typing
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

export function MarkdownDescrizioneMockup() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [showSource, setShowSource] = useState(false);

  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="4"
          title="Markdown descrizione (Milkdown)"
          subtitle={
            <>
              Editor markdown <strong>vero</strong>. Milkdown 7.20 + preset-commonmark +
              plugin-listener. Decisione lockata: niente alternative, vediamo se questo
              setup funziona su iPad 10.9".
            </>
          }
        />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-secondary text-white inline-flex items-center justify-center font-mono font-bold text-lg flex-shrink-0 shadow-lg shadow-primary/25">
            ★
          </div>
          <div className="flex-1">
            <h2 className="font-heading text-xl text-ink-hi">Editor live</h2>
            <div className="text-sm text-ink-lo">
              Tap nel campo descrizione di Abraamo, modifica con markdown shortcut
              inline.
            </div>
          </div>
          <Chip color="accent" variant="primary" size="sm">
            <span className="inline-flex items-center gap-1.5">
              <Star size={12} />
              Milkdown vero
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
                  <MilkdownEditor
                    defaultValue={INITIAL_MARKDOWN}
                    onChange={setMarkdown}
                  />
                </MilkdownProvider>
              </div>
            </div>
            <SimpleField label="Nascita" value="2000 a.E.V." />
          </IpadFrame>

          <div className="flex-1 min-w-[320px] space-y-5">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm leading-relaxed text-ink-hi">
              <div className="text-[11px] uppercase tracking-wider text-primary font-bold mb-1.5">
                Markdown shortcut da provare
              </div>
              <ul className="list-disc list-inside space-y-1 ml-1 text-sm">
                <li>
                  <Code>**testo**</Code> + spazio → <strong>testo</strong>
                </li>
                <li>
                  <Code>*testo*</Code> + spazio → <em>testo</em>
                </li>
                <li>
                  <Code># Titolo</Code> + invio → titolo H1
                </li>
                <li>
                  <Code>- item</Code> + invio → lista puntata
                </li>
                <li>
                  <Code>1. item</Code> + invio → lista ordinata
                </li>
                <li>
                  <Code>{"> quote"}</Code> + invio → blockquote
                </li>
                <li>
                  <Code>[label](url)</Code> → link
                </li>
                <li>
                  <Code>`code`</Code> → code inline
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-lg p-4 text-sm text-amber-900 leading-relaxed">
              <div className="text-[11px] uppercase tracking-wider font-bold mb-1.5">
                Da testare su iPad 10.9" reale
              </div>
              <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
                <li>Selection touch (tap-hold + drag handles iOS)</li>
                <li>Apple Pencil Scribble (handwriting → testo)</li>
                <li>Soft keyboard apertura/chiusura</li>
                <li>IME italiano accenti (long-press vocali)</li>
                <li>Undo nativo (shake-to-undo iPadOS, Cmd+Z se keyboard)</li>
                <li>Performance typing (deve essere istantaneo su Air 4 M1)</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowSource((s) => !s)}
              className="w-full text-left text-xs text-primary hover:text-primary/80 font-semibold underline"
            >
              {showSource ? "Nascondi" : "Mostra"} markdown live (cosa va su Jazz CRDT)
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
              <strong>Decisione:</strong> Milkdown 7.20 lockato. Niente alternative
              (Tiptap/Lexical scartati). Iteriamo su questo se POC valida.
            </li>
            <li>
              <strong>Plugin attivi:</strong> <Code>commonmark</Code>,{" "}
              <Code>listener</Code>. Da aggiungere se OK:{" "}
              <Code>plugin-tooltip</Code> (bubble menu), <Code>plugin-slash</Code>{" "}
              (block menu).
            </li>
            <li>
              <strong>Storage modello dominio:</strong>{" "}
              <Code>Elemento.descrizione: string</Code> resta plain markdown. Listener
              chiama onChange a ogni keystroke; debounce per CRDT da fare a livello adapter.
            </li>
            <li>
              <strong>Styling:</strong>{" "}
              <Code>src/ui/mockups/milkdown-iframe.css</Code> scoped a{" "}
              <Code>.milkdown-host</Code>. Focus ring teal HeroUI-style, Fira Sans body,
              Fira Code per heading/code.
            </li>
            <li>
              <strong>Test su iPad:</strong> <Code>npm run dev -- --host</Code> + apri da
              iPad sulla LAN. Aprilo come PWA standalone (Add to Home Screen) per
              esperienza prod.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}
