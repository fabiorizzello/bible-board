import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Button,
  Chip,
  Drawer,
  Dropdown,
  Input,
  Label,
  Popover,
  TextField,
  toast,
} from "@heroui/react";
import {
  AlertTriangle,
  Copy,
  Calendar,
  Check,
  ChevronDown,
  FileText,
  Link2,
  MapPin,
  Maximize2,
  MoreHorizontal,
  Plus,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Editor, defaultValueCtx, rootCtx } from "@milkdown/core";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { commonmark } from "@milkdown/preset-commonmark";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";

import type { Elemento, ElementoTipo, RuoloLink, TipoLink } from "@/features/elemento/elemento.model";
import type { ElementoInput, FonteTipo, NormalizedFonte, ValidityWarning } from "@/features/elemento/elemento.rules";
import { computeValidityWarnings, normalizeElementoInput } from "@/features/elemento/elemento.rules";
import { formatHistoricalEra, type DataStorica } from "@/features/shared/value-objects";
import {
  addFonteToElemento,
  removeFonteFromElemento,
} from "@/features/elemento/elemento.adapter";
import {
  closeFieldEditor,
  commitNormalizedElement,
  createBidirectionalLink,
  getJazzElementi,
  getJazzMe,
  openFieldEditor,
  removeBidirectionalLink,
  type EditableFieldId,
} from "./workspace-ui-store";
import {
  CURRENT_AUTORE,
  FONTE_TIPI_IN_SCOPE,
  FONTE_TIPO_LABEL,
  formatElementDate,
  getAnnotazioniForElement,
  getFontiForElement,
  getFontiGroupedByTipo,
  resolveBoardsForElement,
  resolveCollegamenti,
} from "./display-helpers";
import "../mockups/milkdown-iframe.css";

type ValidationWarning = {
  field: EditableFieldId;
  label: string;
  message: string;
};

const VALIDITY_FIELD_MAP: Record<ValidityWarning["field"], EditableFieldId> = {
  date: "vita",
  nascita: "vita",
  morte: "vita",
  link: "collegamenti-generici",
};

const VALIDITY_LABEL_MAP: Record<ValidityWarning["field"], string> = {
  date: "Data",
  nascita: "Nascita",
  morte: "Morte",
  link: "Collegamento",
};

const INVALID_DATA = Symbol("INVALID_DATA");
const TIPO_OPTIONS: readonly ElementoTipo[] = [
  "personaggio",
  "guerra",
  "evento",
  "luogo",
  "profezia",
  "regno",
  "periodo",
  "annotazione",
];
const PARENTELA_ROLES: readonly RuoloLink[] = ["padre", "madre", "figlio", "figlia", "coniuge"];
const GENERIC_LINK_TYPES: readonly TipoLink[] = [
  "correlato",
  "successione",
  "causa-effetto",
  "localizzazione",
  "adempimento",
  "parallelo",
  "residenza",
];

function parseDataStorica(annoStr: string, era: "aev" | "ev") {
  const trimmed = annoStr.trim();
  if (!trimmed) return undefined;
  const anno = Number(trimmed);
  if (!Number.isInteger(anno) || anno <= 0) return INVALID_DATA;
  return { anno, era, precisione: "esatta" } satisfies DataStorica;
}

function toYearString(value?: DataStorica): string {
  return value?.anno ? String(value.anno) : "";
}

function formatStoricaShort(value?: DataStorica): string {
  if (!value) return "—";
  return `${value.anno} ${formatHistoricalEra(value.era)}`;
}

function formatVita(element: Elemento): string {
  if (!element.nascita && !element.morte) return "Aggiungi vita";
  return `${formatStoricaShort(element.nascita)} -> ${formatStoricaShort(element.morte)}`;
}

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={`strong-${key++}`}>{match[1]}</strong>);
    } else if (match[2]) {
      parts.push(<em key={`em-${key++}`}>{match[2]}</em>);
    } else if (match[3] && match[4]) {
      parts.push(
        <span key={`link-${key++}`} className="text-primary underline underline-offset-2">
          {match[3]}
        </span>,
      );
    }
    last = regex.lastIndex;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts;
}

function MarkdownPreview({ value }: { value: string }) {
  if (!value.trim()) {
    return <em className="text-sm text-ink-dim">Tap per aggiungere una descrizione…</em>;
  }

  return (
    <div className="space-y-3">
      {value.split(/\n\n+/).map((paragraph, index) => (
        <p key={`${paragraph}-${index}`} className="text-sm leading-relaxed text-ink-hi">
          {renderInline(paragraph)}
        </p>
      ))}
    </div>
  );
}

function MilkdownEditorInline({
  defaultValue,
  onChange,
}: {
  defaultValue: string;
  onChange: (markdown: string) => void;
}) {
  useEditor((root) =>
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, defaultValue);
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => onChange(markdown));
      })
      .use(commonmark)
      .use(listener),
  );

  return <Milkdown />;
}


function buildElementoInput(next: Elemento): ElementoInput {
  const hasDate =
    next.tipo === "evento" ||
    next.tipo === "periodo" ||
    next.tipo === "profezia" ||
    next.tipo === "regno";

  let typeSpecific: Partial<ElementoInput> = {};
  switch (next.tipo) {
    case "personaggio":
      typeSpecific = { nascita: next.nascita, morte: next.morte, tribu: next.tribu, ruoli: next.ruoli };
      break;
    case "guerra":
      typeSpecific = { fazioni: next.fazioni, esito: next.esito };
      break;
    case "profezia":
      typeSpecific = { statoProfezia: next.statoProfezia };
      break;
    case "regno":
      typeSpecific = { dettagliRegno: next.dettagliRegno };
      break;
    case "luogo":
      typeSpecific = { regione: next.regione };
      break;
    default:
      break;
  }

  return {
    titolo: next.titolo,
    descrizione: next.descrizione,
    tags: next.tags,
    tipo: next.tipo,
    ...(hasDate ? { date: next.date } : {}),
    ...typeSpecific,
  };
}

function buildTypeResetPatch(nextTipo: ElementoTipo): Partial<Elemento> {
  const cleared: Partial<Elemento> = {
    nascita: undefined,
    morte: undefined,
    tribu: undefined,
    ruoli: undefined,
    fazioni: undefined,
    esito: undefined,
    statoProfezia: undefined,
    dettagliRegno: undefined,
    regione: undefined,
  };

  if (nextTipo === "personaggio") {
    return { ...cleared, date: undefined };
  }

  return cleared;
}

function ChipButton({
  icon,
  label,
  value,
  active,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 py-1.5 text-left transition-colors ${
        active
          ? "border-primary/35 bg-primary/8 text-primary"
          : "border-edge bg-chrome text-ink-md hover:border-primary/25 hover:bg-primary/5"
      }`}
    >
      <span className="text-ink-dim">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-dim">{label}</span>
      <span className="text-[13px] font-medium leading-none">{value}</span>
      <ChevronDown className="h-3.5 w-3.5 text-ink-dim" />
    </button>
  );
}

function SurfaceMessage({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
      {message}
    </div>
  );
}

export function ElementoEditor({
  element,
  editingFieldId,
  isFullscreen = false,
  onDelete,
  onExpand,
}: {
  element: Elemento;
  editingFieldId: EditableFieldId | null;
  isFullscreen?: boolean;
  onDelete?: () => void;
  onExpand?: () => void;
}) {
  const [surfaceError, setSurfaceError] = useState<string | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [ruoloDraft, setRuoloDraft] = useState("");
  const [familySearch, setFamilySearch] = useState("");
  const [genericSearch, setGenericSearch] = useState("");
  const [familyRole, setFamilyRole] = useState<RuoloLink>("coniuge");
  const [genericType, setGenericType] = useState<TipoLink>("correlato");
  const [familyTargetId, setFamilyTargetId] = useState("");
  const [genericTargetId, setGenericTargetId] = useState("");
  const [fonteTipoDraft, setFonteTipoDraft] = useState<FonteTipo>("scrittura");
  const [fonteValoreDraft, setFonteValoreDraft] = useState("");

  // Jazz elements are read fresh on every render (no useMemo) — same pattern as familyCandidates below
  const liveElementoIds = new Set(getJazzElementi().map((e) => e.id as string));
  const warnings: ValidationWarning[] = computeValidityWarnings(
    element,
    (id) => liveElementoIds.has(id),
  ).map((w) => ({
    field: VALIDITY_FIELD_MAP[w.field],
    label: VALIDITY_LABEL_MAP[w.field],
    message: w.message,
  }));
  const boards = useMemo(() => resolveBoardsForElement(element), [element]);
  const fonti = useMemo(() => getFontiForElement(element), [element]);
  const fontiGrouped = useMemo(() => getFontiGroupedByTipo(element), [element]);
  const annotazioni = useMemo(
    () => getAnnotazioniForElement(element.id as string, CURRENT_AUTORE),
    [element],
  );
  const links = useMemo(() => resolveCollegamenti(element), [element]);

  const alreadyLinkedFamilyIds = useMemo(
    () => new Set(element.link.filter((l) => l.tipo === "parentela").map((l) => l.targetId)),
    [element.link],
  );
  const alreadyLinkedGenericIds = useMemo(
    () => new Set(element.link.map((l) => l.targetId)),
    [element.link],
  );

  // Computed fresh on every render — no useMemo so new Jazz elements are always visible
  const familyCandidates = getJazzElementi().filter(
    (candidate) =>
      candidate.id !== element.id &&
      !alreadyLinkedFamilyIds.has(candidate.id as string) &&
      candidate.tipo === "personaggio" &&
      candidate.titolo.toLowerCase().includes(familySearch.toLowerCase()),
  );
  const genericCandidates = getJazzElementi().filter(
    (candidate) =>
      candidate.id !== element.id &&
      !alreadyLinkedGenericIds.has(candidate.id as string) &&
      candidate.titolo.toLowerCase().includes(genericSearch.toLowerCase()),
  );

  useEffect(() => {
    setSurfaceError(null);
  }, [element.id, editingFieldId]);

  useEffect(() => {
    if (editingFieldId === "collegamenti-famiglia") {
      setFamilySearch("");
      setFamilyTargetId("");
    }
  }, [editingFieldId]);

  useEffect(() => {
    if (editingFieldId === "collegamenti-generici") {
      setGenericSearch("");
      setGenericTargetId("");
    }
  }, [editingFieldId]);

  function commitPatch(
    patch: Partial<Elemento>,
    label: string,
    options?: { keepEditorOpen?: boolean },
  ) {
    // Snapshot prev state before any mutation for per-field rollback
    const prevElement = { ...element };
    const next = { ...element, ...patch };
    const result = normalizeElementoInput(buildElementoInput(next));

    result.match(
      (normalized) => {
        commitNormalizedElement(element.id as string, normalized);
        setSurfaceError(null);
        if (!options?.keepEditorOpen) {
          closeFieldEditor();
        }
        // Blur-to-save + toast undo: every field mutation gets a rollback action
        toast(label, {
          timeout: 5_000,
          variant: "default",
          actionProps: {
            children: "Annulla",
            onPress: () => {
              normalizeElementoInput(buildElementoInput(prevElement)).match(
                (prevNormalized) => {
                  commitNormalizedElement(prevElement.id as string, prevNormalized);
                },
                () => {
                  // prevElement was already valid — this branch is a safeguard only
                },
              );
            },
          },
        });
      },
      (error) => {
        setSurfaceError(error.type.replaceAll("_", " "));
      },
    );
  }

  function commitTitle(nextTitle: string) {
    commitPatch({ titolo: nextTitle }, "Titolo aggiornato");
  }

  function commitTipo(nextTipo: ElementoTipo) {
    commitPatch(
      {
        ...buildTypeResetPatch(nextTipo),
        tipo: nextTipo,
      },
      "Tipo aggiornato",
    );
  }

  function commitVita(nascita?: DataStorica, morte?: DataStorica) {
    commitPatch({ nascita, morte }, "Vita aggiornata");
  }

  function commitDescrizione(nextDescrizione: string) {
    commitPatch({ descrizione: nextDescrizione }, "Descrizione aggiornata");
  }

  function commitScalar(field: keyof Elemento, value: string, label = "Campo aggiornato") {
    commitPatch({ [field]: value || undefined } as Partial<Elemento>, label);
  }

  function addTag() {
    const clean = tagDraft.trim();
    if (!clean) return;
    if (element.tags.includes(clean)) {
      setSurfaceError("Tag gia presente");
      return;
    }
    commitPatch({ tags: [...element.tags, clean] }, "Tag aggiunto", { keepEditorOpen: true });
    setTagDraft("");
  }

  function removeTag(tag: string) {
    commitPatch({ tags: element.tags.filter((value) => value !== tag) }, "Tag rimosso", {
      keepEditorOpen: true,
    });
  }

  function addRuolo() {
    const clean = ruoloDraft.trim();
    const current = element.ruoli ?? [];
    if (!clean) return;
    if (current.includes(clean)) {
      setSurfaceError("Ruolo gia presente");
      return;
    }
    commitPatch({ ruoli: [...current, clean] }, "Ruolo aggiunto", { keepEditorOpen: true });
    setRuoloDraft("");
  }

  function removeRuolo(ruolo: string) {
    commitPatch(
      { ruoli: (element.ruoli ?? []).filter((value) => value !== ruolo) },
      "Ruolo rimosso",
      { keepEditorOpen: true },
    );
  }

  function addFamilyLink() {
    if (!familyTargetId) return;
    if (element.link.some((link) => link.targetId === familyTargetId && link.tipo === "parentela")) {
      setSurfaceError("Collegamento famiglia gia presente");
      return;
    }
    const capturedTargetId = familyTargetId;
    const capturedRole = familyRole;
    createBidirectionalLink(element.id as string, capturedTargetId, "parentela", capturedRole);
    setFamilyTargetId("");
    setFamilySearch("");
    setSurfaceError(null);
    toast("Collegamento famiglia aggiunto", {
      timeout: 5_000,
      variant: "default",
      actionProps: {
        children: "Annulla",
        onPress: () =>
          removeBidirectionalLink(element.id as string, capturedTargetId, "parentela"),
      },
    });
  }

  function addGenericLink() {
    if (!genericTargetId) return;
    if (element.link.some((link) => link.targetId === genericTargetId && link.tipo === genericType)) {
      setSurfaceError("Collegamento gia presente");
      return;
    }
    const capturedTargetId = genericTargetId;
    const capturedType = genericType;
    createBidirectionalLink(element.id as string, capturedTargetId, capturedType);
    setGenericTargetId("");
    setGenericSearch("");
    setSurfaceError(null);
    toast("Collegamento aggiunto", {
      timeout: 5_000,
      variant: "default",
      actionProps: {
        children: "Annulla",
        onPress: () =>
          removeBidirectionalLink(element.id as string, capturedTargetId, capturedType),
      },
    });
  }

  function removeLink(targetId: string, tipo: string) {
    const linkToRemove = element.link.find((l) => l.targetId === targetId && l.tipo === tipo);
    const ruolo = linkToRemove?.ruolo;
    removeBidirectionalLink(element.id as string, targetId, tipo as TipoLink);
    toast("Collegamento rimosso", {
      timeout: 5_000,
      variant: "default",
      actionProps: {
        children: "Annulla",
        onPress: () =>
          createBidirectionalLink(element.id as string, targetId, tipo as TipoLink, ruolo),
      },
    });
  }

  function commitFonteAdd() {
    const capturedValore = fonteValoreDraft.trim();
    if (!capturedValore) return;
    const elementId = element.id as string;
    const capturedTipo = fonteTipoDraft;
    const me = getJazzMe();
    if (!me) {
      setSurfaceError("Account non disponibile");
      return;
    }
    const result = addFonteToElemento(me, elementId, { tipo: capturedTipo, valore: capturedValore });
    result.match(
      () => {
        setSurfaceError(null);
        setFonteValoreDraft("");
        toast("Fonte aggiunta", {
          timeout: 5_000,
          variant: "default",
          actionProps: {
            children: "Annulla",
            onPress: () => {
              const jazzMe = getJazzMe();
              if (jazzMe) removeFonteFromElemento(jazzMe, elementId, capturedTipo, capturedValore);
            },
          },
        });
      },
      (error) => {
        setSurfaceError(
          error.type === "fonte_duplicata" ? "Fonte gia presente" : "Valore fonte non valido",
        );
      },
    );
  }

  function commitFonteRemove(tipo: FonteTipo, valore: string) {
    const elementId = element.id as string;
    const me = getJazzMe();
    if (!me) {
      setSurfaceError("Account non disponibile");
      return;
    }
    const result = removeFonteFromElemento(me, elementId, tipo, valore);
    result.match(
      () => {
        toast("Fonte rimossa", {
          timeout: 5_000,
          variant: "default",
          actionProps: {
            children: "Annulla",
            onPress: () => {
              const jazzMe = getJazzMe();
              if (jazzMe) addFonteToElemento(jazzMe, elementId, { tipo, valore });
            },
          },
        });
      },
      () => {
        setSurfaceError("Fonte non trovata");
      },
    );
  }

  const familyLinks = links.filter((link) => link.tipo === "parentela");
  const genericLinks = links.filter((link) => link.tipo !== "parentela");

  const globalAddOptions = [
    { field: "descrizione" as EditableFieldId, label: "Descrizione", visible: !element.descrizione.trim() },
    { field: "tags" as EditableFieldId, label: "Tag", visible: element.tags.length === 0 },
    { field: "ruoli" as EditableFieldId, label: "Ruoli", visible: element.tipo === "personaggio" && (element.ruoli?.length ?? 0) === 0 },
    { field: "collegamenti-famiglia" as EditableFieldId, label: "Familiari", visible: element.tipo === "personaggio" && familyLinks.length === 0 },
    { field: "collegamenti-generici" as EditableFieldId, label: "Collegamenti", visible: genericLinks.length === 0 },
  ].filter((option) => option.visible);

  return (
    <div className={`flex flex-col gap-4 ${isFullscreen ? "px-0" : ""}`}>
      <SurfaceMessage message={surfaceError} />

      <header className="border-b border-primary/8 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <InlineTitle
            value={element.titolo}
            isEditing={editingFieldId === "titolo"}
            onStart={() => openFieldEditor("titolo")}
            onCancel={closeFieldEditor}
            onCommit={commitTitle}
          />
          <div className="flex items-center gap-2">
            <ReviewDrawer
              warnings={warnings}
              isOpen={editingFieldId === "review"}
              onOpenChange={(open) => (open ? openFieldEditor("review") : closeFieldEditor())}
              onJump={(field) => openFieldEditor(field)}
            />
            {!isFullscreen && onExpand && (
              <Button
                variant="ghost"
                isIconOnly
                className="h-[44px] w-[44px] rounded-full border border-edge text-ink-dim transition-colors hover:bg-primary/6"
                onPress={onExpand}
                aria-label="Apri in fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            <HeaderActionsMenu onDelete={onDelete} />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <TipoChip
            tipo={element.tipo}
            open={editingFieldId === "tipo"}
            onOpenChange={(open) => (open ? openFieldEditor("tipo") : closeFieldEditor())}
            onCommit={commitTipo}
          />
          {element.tipo === "personaggio" && (
            <>
              <VitaChip
                element={element}
                open={editingFieldId === "vita"}
                onOpenChange={(open) => (open ? openFieldEditor("vita") : closeFieldEditor())}
                onCommit={commitVita}
              />
              <ScalarChip
                icon={<Users className="h-3.5 w-3.5" />}
                label="Tribu"
                value={element.tribu ?? "Aggiungi tribu"}
                open={editingFieldId === "tribu"}
                onOpenChange={(open) => (open ? openFieldEditor("tribu") : closeFieldEditor())}
                onCommit={(value) => commitScalar("tribu", value, "Tribu aggiornata")}
              />
            </>
          )}
          {element.tipo === "luogo" && (
            <ScalarChip
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="Regione"
              value={element.regione ?? "Aggiungi regione"}
              open={editingFieldId === "origine"}
              onOpenChange={(open) => (open ? openFieldEditor("origine") : closeFieldEditor())}
              onCommit={(value) => commitScalar("regione", value, "Regione aggiornata")}
            />
          )}
          {(element.tipo === "evento" || element.tipo === "periodo" || element.tipo === "regno" || element.tipo === "profezia") && (
            <Chip className="min-h-[44px] border border-edge bg-chrome px-3.5 text-sm text-ink-md">
              <Calendar className="mr-2 h-3.5 w-3.5 text-ink-dim" />
              {formatElementDate(element) ?? "Data non definita"}
            </Chip>
          )}
        </div>
      </header>

      <DescrizioneSection
        value={element.descrizione}
        isEditing={editingFieldId === "descrizione"}
        onStart={() => openFieldEditor("descrizione")}
        onCancel={closeFieldEditor}
        onCommit={commitDescrizione}
      />

      {element.tipo === "personaggio" && (
        <ArraySection
          icon={<Users className="h-3.5 w-3.5" />}
          title="Ruoli"
          items={element.ruoli ?? []}
          addLabel="Aggiungi ruolo"
          draftValue={ruoloDraft}
          onDraftChange={setRuoloDraft}
          onOpenAdd={() => openFieldEditor("ruoli")}
          onCloseAdd={closeFieldEditor}
          isAddOpen={editingFieldId === "ruoli"}
          onAdd={addRuolo}
          onRemove={removeRuolo}
        />
      )}

      <ArraySection
        icon={<Tag className="h-3.5 w-3.5" />}
        title="Tag"
        items={element.tags}
        addLabel="Aggiungi tag"
        draftValue={tagDraft}
        onDraftChange={setTagDraft}
        onOpenAdd={() => openFieldEditor("tags")}
        onCloseAdd={closeFieldEditor}
        isAddOpen={editingFieldId === "tags"}
        onAdd={addTag}
        onRemove={removeTag}
      />

      {element.tipo === "personaggio" && (
        <LinkSection
          title="Familiari"
          links={familyLinks}
          fieldId="collegamenti-famiglia"
          open={editingFieldId === "collegamenti-famiglia"}
          onOpenChange={(open) => (open ? openFieldEditor("collegamenti-famiglia") : closeFieldEditor())}
          onRemove={(targetId, tipo) => removeLink(targetId, tipo)}
        >
          <TextField value={familySearch} onChange={setFamilySearch}>
            <Label className="text-xs text-ink-lo">Cerca personaggio</Label>
            <Input className="min-h-[44px]" />
          </TextField>
          <div className="grid gap-2 sm:grid-cols-2">
            {familyCandidates.length === 0 && (
              <p className="col-span-2 text-sm text-ink-dim">Nessun risultato.</p>
            )}
            {familyCandidates.slice(0, 8).map((candidate) => (
              <Button
                key={candidate.id}
                variant={familyTargetId === candidate.id ? "primary" : "outline"}
                className="justify-start"
                onPress={() => setFamilyTargetId(candidate.id as string)}
              >
                {candidate.titolo}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {PARENTELA_ROLES.map((role) => (
              <Button
                key={role}
                variant={familyRole === role ? "primary" : "outline"}
                size="sm"
                onPress={() => setFamilyRole(role)}
              >
                {role}
              </Button>
            ))}
          </div>
          <Button variant="primary" onPress={addFamilyLink} isDisabled={!familyTargetId}>
            Aggiungi collegamento
          </Button>
        </LinkSection>
      )}

      <LinkSection
        title="Collegamenti"
        links={genericLinks}
        fieldId="collegamenti-generici"
        open={editingFieldId === "collegamenti-generici"}
        onOpenChange={(open) => (open ? openFieldEditor("collegamenti-generici") : closeFieldEditor())}
        onRemove={(targetId, tipo) => removeLink(targetId, tipo)}
      >
        <TextField value={genericSearch} onChange={setGenericSearch}>
          <Label className="text-xs text-ink-lo">Cerca elemento</Label>
          <Input className="min-h-[44px]" />
        </TextField>
        <div className="grid gap-2 sm:grid-cols-2">
          {genericCandidates.length === 0 && (
            <p className="col-span-2 text-sm text-ink-dim">Nessun risultato.</p>
          )}
          {genericCandidates.slice(0, 8).map((candidate) => (
            <Button
              key={candidate.id}
              variant={genericTargetId === candidate.id ? "primary" : "outline"}
              className="justify-start"
              onPress={() => setGenericTargetId(candidate.id as string)}
            >
              {candidate.titolo}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {GENERIC_LINK_TYPES.map((type) => (
            <Button
              key={type}
              variant={genericType === type ? "primary" : "outline"}
              size="sm"
              onPress={() => setGenericType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
        <Button variant="primary" onPress={addGenericLink} isDisabled={!genericTargetId}>
          Aggiungi collegamento
        </Button>
      </LinkSection>

      {globalAddOptions.length > 0 && (
        <div className="border-t border-primary/8 pt-3 flex justify-end">
          <Dropdown>
            <Dropdown.Trigger>
              <Button variant="ghost" size="sm" className="min-h-[44px] gap-1.5 rounded-full px-3 text-primary">
                <Plus className="h-3.5 w-3.5" />
                Aggiungi campo
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Popover placement="bottom end">
              <Dropdown.Menu
                onAction={(key) => openFieldEditor(String(key) as EditableFieldId)}
              >
                {globalAddOptions.map((option) => (
                  <Dropdown.Item key={option.field} id={option.field} textValue={option.label}>
                    <Label>{option.label}</Label>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      )}

      <ReadOnlySection
        title="Annotazioni"
        icon={<FileText className="h-3.5 w-3.5" />}
      >
        {(annotazioni.mie.length > 0 || annotazioni.altreCount > 0) && (
          <>
            {annotazioni.mie.map((annotation) => (
              <div key={annotation.id as string} className="rounded-xl border border-primary/8 bg-panel px-3 py-2">
                <p className="text-sm font-medium text-ink-hi">{annotation.titolo}</p>
                {annotation.descrizione && (
                  <p className="mt-1 text-sm text-ink-md">{annotation.descrizione}</p>
                )}
              </div>
            ))}
            {annotazioni.altreCount > 0 && (
              <p className="text-sm text-ink-dim">{annotazioni.altreCount} annotazioni altrui non mostrate qui.</p>
            )}
          </>
        )}
      </ReadOnlySection>

      <ReadOnlySection
        title="Board"
        icon={<Users className="h-3.5 w-3.5" />}
      >
        {boards.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {boards.map((board) => (
              <Chip key={board} className="border border-primary/10 bg-primary/5 px-3 text-sm text-primary">
                {board}
              </Chip>
            ))}
          </div>
        )}
      </ReadOnlySection>

      <FontiSection
        fontiGrouped={fontiGrouped}
        totalCount={fonti.length}
        isAddOpen={editingFieldId === "fonti"}
        onOpenAdd={() => openFieldEditor("fonti")}
        onCloseAdd={closeFieldEditor}
        fonteTipo={fonteTipoDraft}
        onFonteTipoChange={setFonteTipoDraft}
        fonteValore={fonteValoreDraft}
        onFonteValoreChange={setFonteValoreDraft}
        onAdd={commitFonteAdd}
        onRemove={commitFonteRemove}
      />
    </div>
  );
}

function HeaderActionsMenu({ onDelete }: { onDelete?: () => void }) {
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Button
          variant="ghost"
          isIconOnly
          className="h-[44px] w-[44px] rounded-full border border-edge text-ink-dim transition-colors hover:bg-primary/6"
          aria-label="Azioni elemento"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end" className="min-w-[220px]">
        <Dropdown.Menu
          onAction={(key) => {
            if (key === "duplicate") {
              toast("Duplicazione rimandata a una fase successiva", { variant: "default" });
            }
            if (key === "delete") {
              onDelete?.();
            }
          }}
        >
          <Dropdown.Item id="duplicate" textValue="Duplica">
            <span className="inline-flex items-center gap-2">
              <Copy className="h-4 w-4" />
              <Label>Duplica</Label>
            </span>
          </Dropdown.Item>
          <Dropdown.Item id="delete" textValue="Elimina" variant="danger">
            <span className="inline-flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <Label>Elimina</Label>
            </span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

function InlineTitle({
  value,
  isEditing,
  onStart,
  onCancel,
  onCommit,
}: {
  value: string;
  isEditing: boolean;
  onStart: () => void;
  onCancel: () => void;
  onCommit: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value, isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isEditing]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      onCommit(draft);
    }
    if (event.key === "Escape") {
      onCancel();
    }
  }

  if (isEditing) {
    return (
      <TextField value={draft} onChange={setDraft} className="min-w-0 flex-1">
        <Input
          ref={inputRef}
          className="min-h-[56px] text-[1.65rem] font-semibold"
          onBlur={() => onCommit(draft)}
          onKeyDown={handleKeyDown}
        />
      </TextField>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      className="min-w-0 flex-1 rounded-xl px-2 py-1.5 text-left text-[1.65rem] font-semibold leading-tight text-ink-hi transition-colors hover:bg-primary/5"
    >
      {value}
    </button>
  );
}

function ReviewDrawer({
  warnings,
  isOpen,
  onOpenChange,
  onJump,
}: {
  warnings: ValidationWarning[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onJump: (field: EditableFieldId) => void;
}) {
  return (
    <>
      <Button
        variant={warnings.length > 0 ? "outline" : "ghost"}
        className={`min-h-[44px] rounded-full px-3 ${warnings.length > 0 ? "border-warning/35 bg-warning/10 text-warning" : "text-ink-dim"}`}
        onPress={() => onOpenChange(true)}
      >
        <AlertTriangle className="h-4 w-4" />
        {warnings.length > 0 ? `${warnings.length} da rivedere` : "Review"}
      </Button>
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} className="bg-black/30">
        <Drawer.Content placement="right">
          <Drawer.Dialog className="w-full max-w-[420px] bg-panel">
            <Drawer.Header className="border-b border-primary/8 px-5 py-4">
              <Drawer.Heading className="inline-flex items-center gap-2 text-lg font-semibold text-ink-hi">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Da rivedere
              </Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body className="space-y-3 px-5 py-4">
              {warnings.length === 0 && (
                <p className="text-sm text-ink-md">Nessun avviso attivo.</p>
              )}
              {warnings.map((warning) => (
                <button
                  key={warning.label}
                  type="button"
                  className="w-full rounded-xl border border-primary/8 bg-chrome p-3 text-left hover:border-primary/25"
                  onClick={() => {
                    onOpenChange(false);
                    onJump(warning.field);
                  }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim">
                    {warning.label}
                  </p>
                  <p className="mt-1 text-sm text-ink-hi">{warning.message}</p>
                </button>
              ))}
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </>
  );
}

function TipoChip({
  tipo,
  open,
  onOpenChange,
  onCommit,
}: {
  tipo: ElementoTipo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: (tipo: ElementoTipo) => void;
}) {
  return (
    <Popover isOpen={open} onOpenChange={onOpenChange}>
      <Popover.Trigger>
        <ChipButton
          icon={<Users className="h-3.5 w-3.5" />}
          label="Tipo"
          value={tipo}
          active={open}
          onPress={() => onOpenChange(!open)}
        />
      </Popover.Trigger>
      <Popover.Content placement="bottom" className="w-[220px]">
        <Popover.Dialog className="space-y-1 p-2">
          {TIPO_OPTIONS.map((option) => (
            <Button
              key={option}
              variant={option === tipo ? "primary" : "ghost"}
              className="w-full justify-start"
              onPress={() => onCommit(option)}
            >
              {option}
            </Button>
          ))}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

function VitaChip({
  element,
  open,
  onOpenChange,
  onCommit,
}: {
  element: Elemento;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: (nascita?: DataStorica, morte?: DataStorica) => void;
}) {
  const [nascitaAnno, setNascitaAnno] = useState(toYearString(element.nascita));
  const [nascitaEra, setNascitaEra] = useState<"aev" | "ev">(element.nascita?.era ?? "aev");
  const [morteAnno, setMorteAnno] = useState(toYearString(element.morte));
  const [morteEra, setMorteEra] = useState<"aev" | "ev">(element.morte?.era ?? "aev");

  useEffect(() => {
    setNascitaAnno(toYearString(element.nascita));
    setNascitaEra(element.nascita?.era ?? "aev");
    setMorteAnno(toYearString(element.morte));
    setMorteEra(element.morte?.era ?? "aev");
  }, [element, open]);

  function submit() {
    const nascita = parseDataStorica(nascitaAnno, nascitaEra);
    const morte = parseDataStorica(morteAnno, morteEra);
    if (nascita === INVALID_DATA || morte === INVALID_DATA) {
      toast("Usa solo anni interi positivi", { variant: "default" });
      return;
    }
    onCommit(nascita, morte);
  }

  return (
    <>
      <ChipButton
        icon={<Calendar className="h-3.5 w-3.5" />}
        label="Vita"
        value={formatVita(element)}
        active={open}
        onPress={() => onOpenChange(true)}
      />
      <Drawer.Backdrop isOpen={open} onOpenChange={onOpenChange} className="bg-black/30">
        <Drawer.Content placement="right">
          <Drawer.Dialog className="w-full max-w-[420px] bg-panel">
            <Drawer.Header className="border-b border-primary/8 px-5 py-4">
              <Drawer.Heading className="text-lg font-semibold text-ink-hi">Vita</Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body className="space-y-4 px-5 py-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <TextField value={nascitaAnno} onChange={setNascitaAnno}>
                  <Label className="text-xs text-ink-lo">Nascita</Label>
                  <Input className="min-h-[44px]" />
                </TextField>
                <div className="flex gap-2 pt-5">
                  <Button variant={nascitaEra === "aev" ? "primary" : "outline"} size="sm" onPress={() => setNascitaEra("aev")}>
                    aev
                  </Button>
                  <Button variant={nascitaEra === "ev" ? "primary" : "outline"} size="sm" onPress={() => setNascitaEra("ev")}>
                    ev
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <TextField value={morteAnno} onChange={setMorteAnno}>
                  <Label className="text-xs text-ink-lo">Morte</Label>
                  <Input className="min-h-[44px]" />
                </TextField>
                <div className="flex gap-2 pt-5">
                  <Button variant={morteEra === "aev" ? "primary" : "outline"} size="sm" onPress={() => setMorteEra("aev")}>
                    aev
                  </Button>
                  <Button variant={morteEra === "ev" ? "primary" : "outline"} size="sm" onPress={() => setMorteEra("ev")}>
                    ev
                  </Button>
                </div>
              </div>
            </Drawer.Body>
            <Drawer.Footer className="border-t border-primary/8 px-5 py-4">
              <Button variant="ghost" onPress={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button variant="primary" onPress={submit}>
                Salva vita
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </>
  );
}

function ScalarChip({
  icon,
  label,
  value,
  open,
  onOpenChange,
  onCommit,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value.startsWith("Aggiungi ") ? "" : value);
  const skipBlur = useRef(false);

  useEffect(() => {
    setDraft(value.startsWith("Aggiungi ") ? "" : value);
    skipBlur.current = false;
  }, [value, open]);

  function submit() {
    const trimmed = draft.trim();
    const original = value.startsWith("Aggiungi ") ? "" : value;
    if (trimmed === original) {
      onOpenChange(false);
      return;
    }
    onCommit(trimmed);
  }

  return (
    <Popover isOpen={open} onOpenChange={onOpenChange}>
      <Popover.Trigger>
        <ChipButton icon={icon} label={label} value={value} active={open} onPress={() => onOpenChange(!open)} />
      </Popover.Trigger>
      <Popover.Content placement="bottom start" className="w-[280px]">
        <Popover.Dialog className="p-3">
          <TextField value={draft} onChange={setDraft}>
            <Label className="text-xs text-ink-lo">{label}</Label>
            <Input
              className="min-h-[44px]"
              autoFocus
              onBlur={() => {
                if (!skipBlur.current) submit();
                skipBlur.current = false;
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  submit();
                }
                if (event.key === "Escape") {
                  skipBlur.current = true;
                  onOpenChange(false);
                }
              }}
            />
          </TextField>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

function DescrizioneSection({
  value,
  isEditing,
  onStart,
  onCancel,
  onCommit,
}: {
  value: string;
  isEditing: boolean;
  onStart: () => void;
  onCancel: () => void;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value, isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    const id = requestAnimationFrame(() => {
      containerRef.current?.querySelector<HTMLElement>(".ProseMirror")?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [isEditing]);

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onCommit(draft);
    }
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim">Descrizione</p>
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onPress={onCancel}>
              Annulla
            </Button>
            <Button variant="primary" size="sm" onPress={() => onCommit(draft)}>
              <Check className="h-3.5 w-3.5" />
              Fatto
            </Button>
          </div>
        )}
      </div>
      {isEditing ? (
        <div
          ref={containerRef}
          tabIndex={-1}
          onBlur={handleBlur}
          className="milkdown-host rounded-2xl border border-primary/20 bg-primary/[0.03] p-3"
        >
          <MilkdownProvider>
            <MilkdownEditorInline defaultValue={value} onChange={setDraft} />
          </MilkdownProvider>
        </div>
      ) : (
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-2xl border border-primary/8 bg-chrome/40 px-4 py-4 text-left transition-colors hover:border-primary/20 hover:bg-primary/[0.03]"
        >
          <MarkdownPreview value={value} />
        </button>
      )}
    </section>
  );
}

function ArraySection({
  icon,
  title,
  items,
  addLabel,
  draftValue,
  onDraftChange,
  onOpenAdd,
  onCloseAdd,
  isAddOpen,
  onAdd,
  onRemove,
}: {
  icon: ReactNode;
  title: string;
  items: readonly string[];
  addLabel: string;
  draftValue: string;
  onDraftChange: (value: string) => void;
  onOpenAdd: () => void;
  onCloseAdd: () => void;
  isAddOpen: boolean;
  onAdd: () => void;
  onRemove: (value: string) => void;
}) {
  if (items.length === 0 && !isAddOpen) return null;
  return (
    <section className="border-t border-primary/8 pt-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <span className="text-ink-dim">{icon}</span>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim">{title}</p>
        </div>
        <Button variant="ghost" size="sm" className="min-h-[44px] rounded-full px-3 text-primary" onPress={onOpenAdd}>
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </Button>
        <FieldDrawer title={addLabel} isOpen={isAddOpen} onOpenChange={(open) => (open ? onOpenAdd() : onCloseAdd())}>
          <TextField value={draftValue} onChange={onDraftChange}>
            <Label className="text-xs text-ink-lo">{title}</Label>
            <Input
              className="min-h-[44px]"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onAdd();
                }
                if (event.key === "Escape") {
                  onCloseAdd();
                }
              }}
            />
          </TextField>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onPress={onCloseAdd}>
              Chiudi
            </Button>
            <Button variant="primary" size="sm" onPress={onAdd}>
              Aggiungi
            </Button>
          </div>
        </FieldDrawer>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Chip
            key={item}
            className="min-h-[44px] border border-primary/10 bg-panel px-2.5 text-sm text-ink-hi"
          >
            <span className="flex items-center gap-1.5">
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="-m-1 flex h-6 w-6 items-center justify-center rounded-full p-1 hover:bg-black/10"
                aria-label={`Rimuovi ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </Chip>
        ))}
      </div>
    </section>
  );
}

function LinkSection({
  title,
  links,
  fieldId,
  open,
  onOpenChange,
  onRemove,
  children,
}: {
  title: string;
  links: ReadonlyArray<{ titolo: string; tipo: string; targetId: string; ruolo?: string }>;
  fieldId: EditableFieldId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: (targetId: string, tipo: string) => void;
  children: ReactNode;
}) {
  if (links.length === 0 && !open) return null;
  return (
    <section className="border-t border-primary/8 pt-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim">{title}</p>
        <Button variant="ghost" size="sm" className="min-h-[44px] rounded-full px-3 text-primary" onPress={() => onOpenChange(true)}>
          <Plus className="h-3.5 w-3.5" />
          Aggiungi
        </Button>
        <FieldDrawer title={`Aggiungi: ${title}`} isOpen={open} onOpenChange={onOpenChange}>
          {children}
        </FieldDrawer>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Chip
            key={`${fieldId}-${link.targetId}-${link.tipo}`}
            className="min-h-[44px] border border-primary/10 bg-panel px-2.5 text-sm text-ink-hi"
          >
            <span className="flex items-center gap-1.5">
              {link.titolo}
              <span className="text-xs text-ink-dim">{link.ruolo ?? link.tipo}</span>
              <button
                type="button"
                onClick={() => onRemove(link.targetId, link.tipo)}
                className="-m-1 flex h-6 w-6 items-center justify-center rounded-full p-1 hover:bg-black/10"
                aria-label={`Rimuovi ${link.titolo}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          </Chip>
        ))}
      </div>
    </section>
  );
}

function FieldDrawer({
  title,
  isOpen,
  onOpenChange,
  children,
}: {
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange} className="bg-black/30">
      <Drawer.Content placement="right">
        <Drawer.Dialog className="w-full max-w-[420px] bg-panel">
          <Drawer.Header className="border-b border-primary/8 px-5 py-4">
            <Drawer.Heading className="text-lg font-semibold text-ink-hi">{title}</Drawer.Heading>
            <Drawer.CloseTrigger />
          </Drawer.Header>
          <Drawer.Body className="space-y-4 px-5 py-4">{children}</Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}

function FontiSection({
  fontiGrouped,
  totalCount,
  isAddOpen,
  onOpenAdd,
  onCloseAdd,
  fonteTipo,
  onFonteTipoChange,
  fonteValore,
  onFonteValoreChange,
  onAdd,
  onRemove,
}: {
  fontiGrouped: Map<FonteTipo, readonly NormalizedFonte[]>;
  totalCount: number;
  isAddOpen: boolean;
  onOpenAdd: () => void;
  onCloseAdd: () => void;
  fonteTipo: FonteTipo;
  onFonteTipoChange: (tipo: FonteTipo) => void;
  fonteValore: string;
  onFonteValoreChange: (valore: string) => void;
  onAdd: () => void;
  onRemove: (tipo: FonteTipo, valore: string) => void;
}) {
  if (totalCount === 0 && !isAddOpen) return null;

  return (
    <section className="border-t border-primary/8 pt-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <span className="text-ink-dim"><Link2 className="h-3.5 w-3.5" /></span>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim">Fonti</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] rounded-full px-3 text-primary"
          onPress={onOpenAdd}
        >
          <Plus className="h-3.5 w-3.5" />
          Aggiungi fonte
        </Button>
        <FieldDrawer title="Aggiungi fonte" isOpen={isAddOpen} onOpenChange={(open) => (open ? onOpenAdd() : onCloseAdd())}>
          <div className="space-y-1">
            <p className="text-xs text-ink-lo">Tipo</p>
            <div className="flex flex-wrap gap-2">
              {FONTE_TIPI_IN_SCOPE.map((tipo) => (
                <Button
                  key={tipo}
                  variant={fonteTipo === tipo ? "primary" : "outline"}
                  size="sm"
                  onPress={() => onFonteTipoChange(tipo)}
                >
                  {FONTE_TIPO_LABEL[tipo]}
                </Button>
              ))}
            </div>
          </div>
          <TextField value={fonteValore} onChange={onFonteValoreChange}>
            <Label className="text-xs text-ink-lo">
              {fonteTipo === "scrittura" ? "Riferimento (es. Genesi 12:1-3)" : "Valore"}
            </Label>
            <Input
              className="min-h-[44px]"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") onAdd();
                if (event.key === "Escape") onCloseAdd();
              }}
            />
          </TextField>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onPress={onCloseAdd}>
              Chiudi
            </Button>
            <Button variant="primary" size="sm" onPress={onAdd} isDisabled={!fonteValore.trim()}>
              Aggiungi
            </Button>
          </div>
        </FieldDrawer>
      </div>

      {/* Grouped by FonteTipo */}
      {FONTE_TIPI_IN_SCOPE.map((tipo) => {
        const group = fontiGrouped.get(tipo);
        if (!group || group.length === 0) return null;
        return (
          <div key={tipo} className="mb-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-ghost">
              {FONTE_TIPO_LABEL[tipo]}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.map((fonte) => (
                <Chip
                  key={`${tipo}-${fonte.valore}`}
                  className="min-h-[44px] border border-primary/10 bg-panel px-2.5 text-sm text-ink-hi"
                >
                  <span className="flex items-center gap-1.5">
                    {fonte.urlCalcolata ? (
                      <a
                        href={fonte.urlCalcolata}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 hover:text-ink transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {fonte.valore}
                      </a>
                    ) : (
                      <span>{fonte.valore}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemove(tipo, fonte.valore)}
                      className="-m-1 flex h-6 w-6 items-center justify-center rounded-full p-1 hover:bg-black/10"
                      aria-label={`Rimuovi ${fonte.valore}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                </Chip>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ReadOnlySection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const isEmpty = Array.isArray(children) ? children.length === 0 : !children;
  if (isEmpty) return null;

  return (
    <section className="border-t border-primary/8 pt-3">
      <div className="mb-2 inline-flex items-center gap-2">
        <span className="text-ink-dim">{icon}</span>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-dim">{title}</p>
      </div>
      {children}
    </section>
  );
}
