import { Chip } from "@heroui/react";
import { Calendar, Link2, MapPin, Tag, Users } from "lucide-react";
import type { ReactNode } from "react";
import {
  Alternative,
  Code,
  ConsideredAlternatives,
  MockupFooter,
  MockupHeader,
} from "./_atoms";

/**
 * Mockup S02/R005 — Sketch 8: Detail pane layout
 *
 * Decisione lockata: C. Metadata chips + body (Linear issue style).
 * Differenzia il trattamento per tipologia di field. Le alternative
 * A (2-col status quo) e B (label-stacked Apple Calendar) sono
 * elencate in fondo come storico, non implementate.
 */

const ABRAAMO = {
  nome: "Abraamo",
  tipo: "personaggio",
  descrizione:
    "Patriarca dei tre monoteismi abramitici. Chiamato da Ur dei Caldei, riceve la promessa divina di una terra e una discendenza. La sua fede viene messa alla prova nel sacrificio di Isacco.",
  nascita: "2000 a.E.V.",
  morte: "1825 a.E.V.",
  tribu: "Ebrei",
  luogo_origine: "Ur dei Caldei",
  ruoli: ["patriarca", "profeta"],
  tags: ["Genesi", "Antico Testamento"],
  collegamenti: [
    { nome: "Sara", ruolo: "coniuge" },
    { nome: "Isacco", ruolo: "figlio" },
  ],
};

export function DetailLayoutMockup() {
  return (
    <div className="min-h-dvh bg-surface text-ink font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <MockupHeader
          number="8"
          title="Detail pane layout"
          subtitle={
            <>
              Layout differenziato per <strong>tipologia</strong> di field: metadati brevi
              in chip header, descrizione full-width come prose, array di chip in sezioni
              dedicate. Pattern Linear issue + Notion page.
            </>
          }
        />

        <Alternative
          letter="C"
          recommended
          title="Metadata chips + body (Linear issue style)"
          subtitle="metadati brevi in chip header · descrizione/body full-width · sezioni per array"
          mock={<ChipsBodyMock />}
          grammatica={
            <>
              Layout <strong>differenziato per tipologia</strong> di field:
              <br />
              <strong>Header metadata</strong>: chip pills orizzontali con icona + valore
              per metadati brevi (tipo, nascita, morte, tribù, luogo). Ognuno è un chip ~28px
              tappabile.
              <br />
              <strong>Body</strong>: descrizione full-width in prose, label-less.
              <br />
              <strong>Sezioni raggruppate</strong>: Ruoli, Tags, Collegamenti — ognuna un
              mini-header + chip row.
              <br />
              Pattern Linear issue detail, Notion page properties + body.
            </>
          }
          items={[
            ["pro", "<strong>Differenzia per tipologia</strong> — ogni field tipo ha il trattamento ottimale"],
            ["pro", "Metadati brevi compattissimi in 1 row orizzontale (4-6 chip)"],
            ["pro", "Descrizione full-width come una vera prose — respiro da documento"],
            ["pro", "Array di chip in sezioni dedicate — niente wrap schiacciato"],
            ["pro", "Pattern moderni (Linear, Notion, GitHub issue) familiare a power user"],
            ["pro", "Sfrutta bene lo spazio orizzontale iPad 10.9 landscape"],
            ["con", "Pattern più complesso — più varianti visuali da mantenere"],
            ["con", "Header chip row può wrappare disordinatamente su tipi con molti metadati (es. periodo con 4 date)"],
            ["con", "Edit di un metadato chip può richiedere popover invece che inline"],
          ]}
        />

        <ConsideredAlternatives
          entries={[
            {
              letter: "A",
              title: "2-col label/value (status quo)",
              summary:
                "Label uppercase 110px + value flex. Ogni field uniforme nello stesso template.",
              pros: [
                "Scanning verticale veloce — label allineati a sinistra",
                "Pattern database / form familiare",
                "Layout prevedibile: ogni field sa dove sta",
              ],
              cons: [
                "Tabellare — tratta descrizione lunga come tribù corto",
                "Spreco spazio orizzontale per label uppercase ripetuti",
                "Array di chip (ruoli, tags, collegamenti) schiacciati nel value → wrap ruvido",
                "Metadati brevi occupano una riga intera ciascuno (verticale alto)",
              ],
              whyRejected:
                "Feedback esplicito utente: 'troppo tabellare'. Tutti i field trattati uguali, ignora la natura eterogenea dei dati (scalari brevi vs prose vs array).",
            },
            {
              letter: "B",
              title: "Label-stacked (Apple Calendar event)",
              summary:
                "Label uppercase mini ABOVE, value 15-16px sotto. Più verticalità, più ariosità.",
              pros: [
                "Value prominente — leggibilità massima del dato",
                "Tap area enorme (intero blocco verticale) — iPad touch-friendly",
                "Pattern Apple-native (Calendar, Mail, Contacts)",
                "Niente allineamento label a sinistra → flessibilità typografica",
              ],
              cons: [
                "Verticalità esplosa — ogni field 2 righe invece di 1 (scroll aumenta)",
                "Scan meno efficace — occhio non trova i label subito",
                "Su detail pane stretto (iPad portrait) perde ariosità",
                "Non risolve il problema array di chip schiacciati",
              ],
              whyRejected:
                "Risolve parzialmente (ariosità sì, ma non la natura eterogenea dei field). Su elementi ricchi (personaggio con 8+ field) esplode verticalmente richiedendo scroll.",
            },
          ]}
        />

        <MockupFooter>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Impatto su altri mockup:</strong> la scelta di C ribalta parte dei
              pattern di edit inline. I metadati chip si editano via popover (tap su chip →
              popover con input), non via tap su row. Da propagare in plan 02-03.
            </li>
            <li>
              <strong>Tipi di field identificati:</strong>
              <ol className="list-decimal list-inside ml-2 mt-1 space-y-0.5 text-xs">
                <li>Metadata scalari brevi (tipo, tribù, luogo, date singole) → chip header</li>
                <li>Contenuto lungo (descrizione, annotazioni) → prose full-width</li>
                <li>Array di chip (ruoli, tags, collegamenti, fonti) → sezione dedicata</li>
                <li>Composite (Vita, Regno, Intervallo) → chip speciale o drawer</li>
              </ol>
            </li>
            <li>
              <strong>Portrait/landscape:</strong> su iPad portrait (820px) i chip header
              possono wrappare su 2 righe, mentre le sezioni array restano uguali.
            </li>
            <li>
              <strong>HeroUI:</strong> tutto realizzabile con <Code>{`<Chip>`}</Code>{" "}
              esistente. Niente nuovi primitive richiesti.
            </li>
          </ul>
        </MockupFooter>
      </div>
    </div>
  );
}

// ============================================================================
// Recommended: Metadata chips + body (Linear/Notion hybrid)
// ============================================================================

function AbraamoHeader() {
  return (
    <div className="pb-4 border-b border-edge mb-4">
      <div className="font-heading text-2xl font-semibold text-ink-hi leading-tight">
        {ABRAAMO.nome}
      </div>
    </div>
  );
}

function ChipsBodyMock() {
  return (
    <>
      <AbraamoHeader />

      <div className="flex flex-wrap gap-2 mb-5">
        <MetaChip icon={<Users size={12} />} label="Tipo" value={ABRAAMO.tipo} primary />
        <MetaChip icon={<Calendar size={12} />} label="Nato" value={ABRAAMO.nascita} />
        <MetaChip icon={<Calendar size={12} />} label="Morto" value={ABRAAMO.morte} />
        <MetaChip icon={<MapPin size={12} />} label="Origine" value={ABRAAMO.luogo_origine} />
        <MetaChip icon={<Users size={12} />} label="Tribù" value={ABRAAMO.tribu} />
      </div>

      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-ink-lo font-bold mb-2">
          Descrizione
        </div>
        <p className="text-[15px] leading-relaxed text-ink-hi line-clamp-4">
          {ABRAAMO.descrizione}
        </p>
      </div>

      <ArraySection
        icon={<Tag size={12} />}
        label="Ruoli"
        chips={ABRAAMO.ruoli.map((r) => (
          <Chip key={r} size="md" variant="soft" className="bg-chip-bg text-ink-lo">
            {r}
          </Chip>
        ))}
      />
      <ArraySection
        icon={<Tag size={12} />}
        label="Tags"
        chips={ABRAAMO.tags.map((t) => (
          <Chip key={t} size="md" variant="soft" className="bg-chip-bg text-ink-lo">
            {t}
          </Chip>
        ))}
      />
      <ArraySection
        icon={<Link2 size={12} />}
        label="Collegamenti"
        chips={ABRAAMO.collegamenti.map((c) => (
          <Chip key={c.nome} size="md" variant="soft" color="accent">
            <span className="inline-flex items-center gap-1">
              {c.nome}
              <span className="opacity-60">· {c.ruolo}</span>
            </span>
          </Chip>
        ))}
      />
    </>
  );
}

function MetaChip({
  icon,
  label,
  value,
  primary,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 min-h-[28px] px-3 py-1 rounded-full border transition-colors cursor-pointer ${
        primary
          ? "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
          : "border-edge bg-chrome text-ink-md hover:border-primary/30 hover:bg-primary/5"
      }`}
    >
      <span className={primary ? "text-primary" : "text-ink-lo"}>{icon}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70 font-semibold">
        {label}
      </span>
      <span className="text-[13px] font-medium">{value}</span>
    </button>
  );
}

function ArraySection({
  icon,
  label,
  chips,
}: {
  icon: ReactNode;
  label: string;
  chips: ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-ink-lo">{icon}</span>
        <span className="text-[10px] uppercase tracking-wider text-ink-lo font-bold">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">{chips}</div>
    </div>
  );
}
