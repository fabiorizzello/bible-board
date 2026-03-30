import { useSearchParams } from "react-router";
import { Button, Chip, ListBox } from "@heroui/react";
import { Plus, Circle } from "lucide-react";
import { useAuth } from "@/app/auth-context";
import {
  WORKSPACE,
  EMPTY_WORKSPACE,
  ELEMENTI,
  BOARDS,
  RECENTI,
} from "@/mock";
import type { Recente } from "@/mock";
import type { Workspace } from "@/features/workspace/workspace.model";

// ── Tipo abbreviation map ──

const TIPO_ABBREV: Record<string, string> = {
  personaggio: "pers.",
  evento: "evento",
  luogo: "luogo",
  profezia: "prof.",
  guerra: "guerra",
  regno: "regno",
  periodo: "periodo",
  annotazione: "nota",
};

function badgeLabel(rec: Recente): string {
  if (rec.tipo === "board") return "board";
  return TIPO_ABBREV[rec.elementoTipo ?? ""] ?? rec.elementoTipo ?? "";
}

// ── Date formatting ──

function formatCreatedAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ── Component ──

export function WorkspaceHomePage() {
  const { nome, logout } = useAuth();
  const [searchParams] = useSearchParams();

  const isEmpty = searchParams.get("empty") === "true";
  const workspace: Workspace = isEmpty ? EMPTY_WORKSPACE : WORKSPACE;
  const recenti: readonly Recente[] = isEmpty ? [] : RECENTI;

  if (isEmpty || ELEMENTI.length === 0) {
    return <EmptyWorkspaceState workspace={workspace} userName={nome} onLogout={logout} />;
  }

  return (
    <PopulatedWorkspaceState
      workspace={workspace}
      recenti={recenti}
      userName={nome}
      onLogout={logout}
    />
  );
}

// ── Empty State ──

function EmptyWorkspaceState({
  workspace,
  userName,
  onLogout,
}: {
  workspace: Workspace;
  userName: string | null;
  onLogout: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {/* Compact header */}
      <header className="flex items-center gap-3 border-b border-edge px-4 min-h-[48px]">
        <h1 className="font-heading text-sm font-semibold text-ink-hi truncate">
          {workspace.nome}
        </h1>
        <div className="flex-1" />
        {userName && (
          <button
            type="button"
            onClick={onLogout}
            className="min-h-[44px] min-w-[44px] px-2 text-xs text-ink-lo transition-colors duration-150 ease-out hover:text-accent"
          >
            {userName}
          </button>
        )}
      </header>

      {/* Centered empty state */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
        <p className="text-center text-sm text-ink-md">
          Nessun elemento nel workspace
        </p>
        <Button
          variant="solid"
          size="sm"
          className="min-h-[44px] gap-2 bg-accent px-6 font-body font-medium text-white"
          onPress={() => {
            console.log("[WorkspaceHome] CTA: Crea il primo Elemento");
          }}
        >
          <Plus className="h-4 w-4" />
          Crea il primo Elemento
        </Button>
      </div>
    </div>
  );
}

// ── Populated State ──

function PopulatedWorkspaceState({
  workspace,
  recenti,
  userName,
  onLogout,
}: {
  workspace: Workspace;
  recenti: readonly Recente[];
  userName: string | null;
  onLogout: () => void;
}) {
  const tagCount = workspace.tagRegistry.length;
  const boardCount = workspace.boardIds.length;
  const elementCount = ELEMENTI.length;
  const createdAt = formatCreatedAt(workspace.createdAt);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {/* Compact header (single row) */}
      <header className="flex items-center gap-3 border-b border-edge px-4 min-h-[48px]">
        <h1 className="font-heading text-sm font-semibold text-ink-hi truncate">
          {workspace.nome}
        </h1>

        {/* Sync badge */}
        <span className="flex items-center gap-1.5 text-[11px] text-ink-lo">
          <Circle className="h-2 w-2 fill-secondary text-secondary" />
          Sincronizzato
        </span>

        <div className="flex-1" />

        {/* New element button (dashed border, accent) */}
        <Button
          variant="bordered"
          isIconOnly
          size="sm"
          className="min-h-[44px] min-w-[44px] rounded-lg border-dashed border-accent/40 text-accent transition-colors duration-150 ease-out hover:border-accent hover:border-solid hover:bg-accent/5"
          aria-label="Nuovo elemento"
          onPress={() => {
            console.log("[WorkspaceHome] Quick action: Nuovo elemento");
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* User name / logout */}
        {userName && (
          <button
            type="button"
            onClick={onLogout}
            className="min-h-[44px] min-w-[44px] px-2 text-xs text-ink-lo transition-colors duration-150 ease-out hover:text-accent"
          >
            {userName}
          </button>
        )}
      </header>

      {/* Content area — centered, max-w-2xl */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {/* Lista recenti */}
          <section aria-label="Elementi recenti">
            <h2 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-dim">
              Recenti
            </h2>
            <ListBox
              aria-label="Elementi recenti"
              selectionMode="single"
              onSelectionChange={(keys) => {
                if (keys === "all" || keys.size === 0) return;
                const key = String([...keys][0]);
                console.log("[WorkspaceHome] Navigate to:", key);
              }}
              className="border-none p-0 outline-none"
            >
              {recenti.map((rec) => (
                <ListBox.Item
                  key={rec.id}
                  id={rec.id}
                  textValue={rec.titolo}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 min-h-[44px] cursor-pointer transition-colors duration-150 ease-out data-[hovered]:bg-primary/6 data-[selected]:bg-primary/10"
                >
                  <Chip
                    size="sm"
                    className={`flex-shrink-0 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider ${
                      rec.tipo === "board"
                        ? "bg-accent/10 text-accent"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {badgeLabel(rec)}
                  </Chip>
                  <span className="flex-1 truncate text-xs font-medium text-ink-md">
                    {rec.titolo}
                  </span>
                  <span className="flex-shrink-0 font-heading text-[9px] text-ink-dim">
                    {rec.tempo}
                  </span>
                </ListBox.Item>
              ))}
            </ListBox>
          </section>

          {/* Metriche inline row */}
          <section
            aria-label="Statistiche workspace"
            className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-edge pt-3"
          >
            <MetricItem label="Elementi" value={elementCount} />
            <MetricItem label="Board" value={boardCount} />
            <MetricItem label="Tag" value={tagCount} />
            <span className="text-[11px] text-ink-dim">
              Creato il {createdAt}
            </span>
          </section>
        </div>
      </main>
    </div>
  );
}

// ── Metric display ──

function MetricItem({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="font-heading text-sm font-semibold text-ink-hi tabular-nums">
        {value}
      </span>
      <span className="text-[11px] text-ink-lo">{label}</span>
    </span>
  );
}
