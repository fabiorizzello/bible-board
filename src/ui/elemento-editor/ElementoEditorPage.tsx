import { useEffect, useState } from "react";
import {
  CalendarRange,
  Crown,
  MapPin,
  ScrollText,
  Sparkles,
  Swords,
  User
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import {
  createElementoInWorkspace,
  deserializeDataTemporale,
  findWorkspaceElementoById,
  updateWorkspaceElemento,
  useWorkspaceElementiState
} from "@/features/elemento/elemento.adapter";
import type {
  DataStorica,
  DataTemporale,
  HistoricalEra,
  HistoricalPrecision
} from "@/features/shared/value-objects";

const ELEMENTO_TIPI = [
  {
    value: "personaggio",
    label: "Personaggio",
    description: "Persone con nascita, morte e ruolo nello studio.",
    icon: User
  },
  {
    value: "guerra",
    label: "Guerra",
    description: "Conflitti, campagne e scontri rilevanti.",
    icon: Swords
  },
  {
    value: "profezia",
    label: "Profezia",
    description: "Pronunciamenti, attese e adempimenti collegati.",
    icon: ScrollText
  },
  {
    value: "regno",
    label: "Regno",
    description: "Regni, dinastie e periodi di governo.",
    icon: Crown
  },
  {
    value: "periodo",
    label: "Periodo",
    description: "Intervalli storici o fasi di un racconto.",
    icon: CalendarRange
  },
  {
    value: "luogo",
    label: "Luogo",
    description: "Località, regioni e punti geografici.",
    icon: MapPin
  },
  {
    value: "evento",
    label: "Evento",
    description: "Fatti singoli da collocare e collegare.",
    icon: Sparkles
  }
] as const;

const DATE_PRECISIONI: { value: HistoricalPrecision; label: string }[] = [
  { value: "esatta", label: "Esatta" },
  { value: "circa", label: "Circa" }
];

type ElementoTipoValue = (typeof ELEMENTO_TIPI)[number]["value"];

interface HistoricalDateDraft {
  anno: string;
  dettaglio: "anno" | "mese" | "giorno";
  era: HistoricalEra;
  mese: string;
  giorno: string;
  precisione: HistoricalPrecision;
}

interface TemporalDateDraft {
  kind: "puntuale" | "range";
  data: HistoricalDateDraft;
  inizio: HistoricalDateDraft;
  fine: HistoricalDateDraft;
}

function createEmptyDateDraft(): HistoricalDateDraft {
  return {
    anno: "",
    dettaglio: "anno",
    era: "aev",
    mese: "",
    giorno: "",
    precisione: "esatta"
  };
}

function createEmptyTemporalDateDraft(): TemporalDateDraft {
  return {
    kind: "puntuale",
    data: createEmptyDateDraft(),
    inizio: createEmptyDateDraft(),
    fine: createEmptyDateDraft()
  };
}

function SegmentedControl<TValue extends string>({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: readonly {
    readonly value: TValue;
    readonly label: string;
  }[];
  value: TValue;
  onChange: (nextValue: TValue) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
        {label}
      </span>
      <div className="grid min-h-12 grid-cols-2 gap-2 rounded-[1.25rem] bg-primary/5 p-1 md:auto-cols-fr md:grid-flow-col">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={`min-h-12 rounded-[1rem] px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-white text-primary shadow-sm shadow-primary/15 ring-1 ring-primary/15"
                  : "text-ink/70 hover:bg-white/70"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ElementoTypeCards({
  value,
  onChange
}: {
  value: ElementoTipoValue;
  onChange: (nextValue: ElementoTipoValue) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-semibold text-ink">Tipo elemento</p>
        <p className="mt-1 text-sm leading-6 text-ink/70">
          Scegli prima il tipo. Il form mostrerà i campi più utili per quel caso.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ELEMENTO_TIPI.map((tipo) => {
          const Icon = tipo.icon;
          const isActive = tipo.value === value;

          return (
            <button
              key={tipo.value}
              type="button"
              onClick={() => onChange(tipo.value)}
              aria-pressed={isActive}
              className={`min-h-28 rounded-[1.5rem] border p-4 text-left transition ${
                isActive
                  ? "border-primary bg-primary/8 shadow-lg shadow-primary/10 ring-2 ring-primary/15"
                  : "border-primary/10 bg-white hover:border-primary/25 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
                    isActive ? "bg-primary text-white" : "bg-surface text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-ink">{tipo.label}</p>
                  <p className="text-sm leading-6 text-ink/70">{tipo.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function toDateDraft(value?: DataStorica | null): HistoricalDateDraft {
  if (!value) {
    return createEmptyDateDraft();
  }

  return {
    anno: String(value.anno),
    dettaglio: value.giorno !== undefined ? "giorno" : value.mese !== undefined ? "mese" : "anno",
    era: value.era,
    mese: value.mese !== undefined ? String(value.mese) : "",
    giorno: value.giorno !== undefined ? String(value.giorno) : "",
    precisione: value.precisione
  };
}

function toTemporalDateDraft(value?: DataTemporale): TemporalDateDraft {
  if (!value) {
    return createEmptyTemporalDateDraft();
  }

  if (value.kind === "puntuale") {
    return {
      kind: "puntuale",
      data: toDateDraft(value.data),
      inizio: createEmptyDateDraft(),
      fine: createEmptyDateDraft()
    };
  }

  return {
    kind: "range",
    data: createEmptyDateDraft(),
    inizio: toDateDraft(value.inizio),
    fine: toDateDraft(value.fine)
  };
}

function HistoricalDateCard({
  label,
  value,
  onChange
}: {
  label: string;
  value: HistoricalDateDraft;
  onChange: (nextValue: HistoricalDateDraft) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-primary/12 bg-surface/80 p-4">
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-sm font-semibold text-ink">{label}</span>
          <p className="mt-1 text-sm leading-6 text-ink/65">
            Inserisci l&apos;anno e poi scegli se aggiungere mese e giorno.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
              Anno
            </span>
            <input
              inputMode="numeric"
              value={value.anno}
              onChange={(event) =>
                onChange({
                  ...value,
                  anno: event.target.value.replace(/[^\d]/g, "")
                })
              }
              className="min-h-12 rounded-2xl border border-primary/15 bg-white px-4 text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="2018"
            />
          </label>

          <SegmentedControl
            label="Era"
            value={value.era}
            onChange={(era) =>
              onChange({
                ...value,
                era
              })
            }
            options={[
              { value: "aev", label: "a.e.v." },
              { value: "ev", label: "e.v." }
            ]}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <SegmentedControl
            label="Precisione"
            value={value.precisione}
            onChange={(precisione) =>
              onChange({
                ...value,
                precisione
              })
            }
            options={DATE_PRECISIONI}
          />

          <SegmentedControl
            label="Dettaglio"
            value={value.dettaglio}
            onChange={(dettaglio) =>
              onChange({
                ...value,
                dettaglio,
                mese: dettaglio === "anno" ? "" : value.mese,
                giorno: dettaglio === "giorno" ? value.giorno : ""
              })
            }
            options={[
              { value: "anno", label: "Solo anno" },
              { value: "mese", label: "Anno + mese" },
              { value: "giorno", label: "Anno + mese + giorno" }
            ]}
          />
        </div>

        {value.dettaglio !== "anno" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
                Mese
              </span>
              <select
                value={value.mese}
                onChange={(event) =>
                  onChange({
                    ...value,
                    mese: event.target.value,
                    giorno: value.dettaglio === "giorno" ? value.giorno : ""
                  })
                }
                className="min-h-12 rounded-2xl border border-primary/15 bg-white px-4 text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="">Seleziona mese</option>
                <option value="1">Gennaio</option>
                <option value="2">Febbraio</option>
                <option value="3">Marzo</option>
                <option value="4">Aprile</option>
                <option value="5">Maggio</option>
                <option value="6">Giugno</option>
                <option value="7">Luglio</option>
                <option value="8">Agosto</option>
                <option value="9">Settembre</option>
                <option value="10">Ottobre</option>
                <option value="11">Novembre</option>
                <option value="12">Dicembre</option>
              </select>
            </label>

            {value.dettaglio === "giorno" ? (
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
                  Giorno
                </span>
                <input
                  inputMode="numeric"
                  value={value.giorno}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      giorno: event.target.value.replace(/[^\d]/g, "")
                    })
                  }
                  disabled={!value.mese}
                  className="min-h-12 rounded-2xl border border-primary/15 bg-white px-4 text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface/60 disabled:text-ink/40"
                  placeholder="14"
                />
              </label>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TemporalDateSection({
  value,
  onChange
}: {
  value: TemporalDateDraft;
  onChange: (nextValue: TemporalDateDraft) => void;
}) {
  return (
    <div className="space-y-4">
      <SegmentedControl
        label="Tipo di collocazione"
        value={value.kind}
        onChange={(kind) =>
          onChange({
            ...value,
            kind
          })
        }
        options={[
          { value: "puntuale", label: "Data singola" },
          { value: "range", label: "Periodo" }
        ]}
      />

      {value.kind === "puntuale" ? (
        <HistoricalDateCard
          label="Data"
          value={value.data}
          onChange={(data) =>
            onChange({
              ...value,
              data
            })
          }
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <HistoricalDateCard
            label="Inizio"
            value={value.inizio}
            onChange={(inizio) =>
              onChange({
                ...value,
                inizio
              })
            }
          />
          <HistoricalDateCard
            label="Fine"
            value={value.fine}
            onChange={(fine) =>
              onChange({
                ...value,
                fine
              })
            }
          />
        </div>
      )}
    </div>
  );
}

export function ElementoEditorPage() {
  const navigate = useNavigate();
  const { elementoId } = useParams();
  const { account, workspace } = useWorkspaceElementiState();
  const me = account.me;
  const elemento = findWorkspaceElementoById(workspace, elementoId);
  const isEditing = Boolean(elementoId);
  const [titolo, setTitolo] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<TemporalDateDraft>(createEmptyTemporalDateDraft());
  const [nascita, setNascita] = useState<HistoricalDateDraft>(createEmptyDateDraft());
  const [morte, setMorte] = useState<HistoricalDateDraft>(createEmptyDateDraft());
  const [tipo, setTipo] = useState<ElementoTipoValue>("personaggio");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!elemento) {
      return;
    }

    setTitolo(elemento.titolo ?? "");
    setNote(elemento.note ?? "");
    setTipo(elemento.tipo);
    setDate(toTemporalDateDraft(deserializeDataTemporale(elemento)));
    setNascita(toDateDraft(elemento.nascita));
    setMorte(toDateDraft(elemento.morte));
  }, [elemento]);

  if (!me || !workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-ink/80">Caricamento editor elemento...</p>
      </div>
    );
  }

  if (isEditing && !elemento) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-red-700 shadow-lg shadow-red-100">
          Elemento non trovato.
        </div>
      </div>
    );
  }

  function toStructuredDate(value: HistoricalDateDraft) {
    if (!value.anno.trim()) {
      return undefined;
    }

    return {
      anno: Number(value.anno),
      era: value.era,
      precisione: value.precisione,
      mese: value.dettaglio === "mese" || value.dettaglio === "giorno" ? Number(value.mese) : undefined,
      giorno: value.dettaglio === "giorno" ? Number(value.giorno) : undefined
    };
  }

  function toStructuredTemporalDate(value: TemporalDateDraft) {
    if (value.kind === "puntuale") {
      const data = toStructuredDate(value.data);
      return data
        ? {
            kind: "puntuale" as const,
            data
          }
        : undefined;
    }

    const inizio = toStructuredDate(value.inizio);
    const fine = toStructuredDate(value.fine);

    return inizio && fine
      ? {
          kind: "range" as const,
          inizio,
          fine
        }
      : undefined;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      titolo,
      note,
      date: tipo !== "personaggio" ? toStructuredTemporalDate(date) : undefined,
      nascita: tipo === "personaggio" ? toStructuredDate(nascita) : undefined,
      morte: tipo === "personaggio" ? toStructuredDate(morte) : undefined,
      tipo
    };

    const result = isEditing && elemento
      ? updateWorkspaceElemento(me, elemento.id, payload)
      : createElementoInWorkspace(me, payload);

    if (result.isErr()) {
      if (result.error.type === "titolo_vuoto") {
        setError("Il titolo dell'Elemento non puo essere vuoto.");
        return;
      }

      if (result.error.type === "data_non_valida") {
        setError("Controlla le date inserite: anno, mese, giorno e ordine del periodo.");
        return;
      }

      if (result.error.type === "elemento_non_trovato") {
        setError("L'Elemento da modificare non e piu disponibile.");
        return;
      }

      setError("Impossibile salvare l'Elemento.");
      return;
    }

    navigate(`/elemento/${result.value.id}`);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_42%),linear-gradient(180deg,_#f0fdfa_0%,_#ffffff_55%,_#ecfeff_100%)] px-6 py-10">
      <section className="mx-auto max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              {isEditing ? "Modifica Elemento" : "Nuovo Elemento"}
            </p>
            <h1 className="font-heading text-3xl text-ink">
              {isEditing ? "Aggiorna l'Elemento" : "Crea il primo Elemento"}
            </h1>
            <p className="text-base leading-7 text-ink/75">
              {isEditing
                ? "Le modifiche vengono salvate direttamente nel workspace Jazz corrente."
                : "Salvataggio immediato nel workspace Jazz corrente."}
            </p>
          </div>

          <article className="rounded-[2rem] border border-primary/15 bg-white/90 p-8 shadow-xl shadow-primary/10 backdrop-blur">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Identita
                </p>
                <h2 className="font-heading text-2xl text-ink">Che cosa stai salvando?</h2>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-ink">Titolo</span>
                <input
                  value={titolo}
                  onChange={(event) => setTitolo(event.target.value)}
                  className="min-h-12 rounded-2xl border border-primary/15 bg-surface px-4 text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Esempio: Abraamo"
                />
              </label>

              <ElementoTypeCards value={tipo} onChange={setTipo} />
            </div>
          </article>

          <article className="rounded-[2rem] border border-primary/15 bg-white/90 p-8 shadow-xl shadow-primary/10 backdrop-blur">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Tempo
                </p>
                <h2 className="font-heading text-2xl text-ink">Collocazione storica</h2>
                <p className="max-w-2xl text-sm leading-6 text-ink/70">
                  Per i personaggi usa nascita e morte. Per gli altri tipi usa una data singola
                  oppure un periodo con inizio e fine.
                </p>
              </div>

              {tipo === "personaggio" ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  <HistoricalDateCard
                    label="Data nascita"
                    value={nascita}
                    onChange={setNascita}
                  />
                  <HistoricalDateCard
                    label="Data morte"
                    value={morte}
                    onChange={setMorte}
                  />
                </div>
              ) : (
                <TemporalDateSection value={date} onChange={setDate} />
              )}
            </div>
          </article>

          <article className="rounded-[2rem] border border-primary/15 bg-white/90 p-8 shadow-xl shadow-primary/10 backdrop-blur">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Note
                </p>
                <h2 className="font-heading text-2xl text-ink">Contesto e osservazioni</h2>
                <p className="max-w-2xl text-sm leading-6 text-ink/70">
                  Usa le note come campo principale per appunti di studio, collegamenti e
                  osservazioni.
                </p>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-ink">Note di studio</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={8}
                  className="rounded-[1.5rem] border border-primary/15 bg-surface px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Inserisci note di studio, collegamenti e osservazioni."
                />
              </label>
            </div>
          </article>

          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}

          <div className="sticky bottom-4 z-30 rounded-[1.75rem] border border-primary/15 bg-white/95 p-4 shadow-2xl shadow-primary/10 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm leading-6 text-ink/70">
                Controlla titolo, tipo e tempo prima di salvare.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center rounded-2xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent/90 focus:outline-none focus:ring-4 focus:ring-accent/25"
                >
                  {isEditing ? "Salva modifiche" : "Salva Elemento"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(isEditing && elemento ? `/elemento/${elemento.id}` : "/")}
                  className="inline-flex min-h-12 items-center rounded-2xl border border-primary/15 px-5 py-3 font-semibold text-ink transition hover:bg-surface"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
