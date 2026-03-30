import { useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Palette, X, Check, Sun, Moon } from "lucide-react";

// ── Palette data ──

interface ModeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface PaletteConfig {
  name: string;
  light: ModeColors;
  dark: ModeColors;
}

const NEUTRALS = {
  light: {
    panel: "#ffffff",
    chrome: "#f8fafc",
    chipBg: "#f1f5f9",
    edge: "#e2e8f0",
    inkHi: "#1e293b",
    inkMd: "#334155",
    inkLo: "#64748b",
    inkDim: "#94a3b8",
    inkGhost: "#cbd5e1",
  },
  dark: {
    panel: "#1e293b",
    chrome: "#0f172a",
    chipBg: "#334155",
    edge: "#475569",
    inkHi: "#f1f5f9",
    inkMd: "#e2e8f0",
    inkLo: "#94a3b8",
    inkDim: "#8293a6",
    inkGhost: "#6b7d8f",
  },
} as const;

const PALETTES: PaletteConfig[] = [
  {
    name: "Teal",
    light: { primary: "#0d9488", secondary: "#14b8a6", accent: "#f97316", background: "#f0fdfa", text: "#134e4a" },
    dark:  { primary: "#2dd4bf", secondary: "#5eead4", accent: "#fb923c", background: "#0f172a", text: "#ccfbf1" },
  },
  {
    name: "Indigo",
    light: { primary: "#4f46e5", secondary: "#6366f1", accent: "#f59e0b", background: "#eef2ff", text: "#1e1b4b" },
    dark:  { primary: "#818cf8", secondary: "#a5b4fc", accent: "#fbbf24", background: "#0f172a", text: "#e0e7ff" },
  },
  {
    name: "Blue",
    light: { primary: "#2563eb", secondary: "#3b82f6", accent: "#f97316", background: "#eff6ff", text: "#1e3a5f" },
    dark:  { primary: "#60a5fa", secondary: "#93c5fd", accent: "#fb923c", background: "#0f172a", text: "#dbeafe" },
  },
  {
    name: "Violet",
    light: { primary: "#7c3aed", secondary: "#8b5cf6", accent: "#f59e0b", background: "#f5f3ff", text: "#2e1065" },
    dark:  { primary: "#a78bfa", secondary: "#c4b5fd", accent: "#fbbf24", background: "#0f172a", text: "#ede9fe" },
  },
  {
    name: "Rose",
    light: { primary: "#e11d48", secondary: "#f43f5e", accent: "#0d9488", background: "#fff1f2", text: "#4c0519" },
    dark:  { primary: "#fb7185", secondary: "#fda4af", accent: "#2dd4bf", background: "#0f172a", text: "#ffe4e6" },
  },
  {
    name: "Emerald",
    light: { primary: "#059669", secondary: "#10b981", accent: "#f59e0b", background: "#ecfdf5", text: "#064e3b" },
    dark:  { primary: "#34d399", secondary: "#6ee7b7", accent: "#fbbf24", background: "#0f172a", text: "#d1fae5" },
  },
  {
    name: "Amber",
    light: { primary: "#d97706", secondary: "#f59e0b", accent: "#7c3aed", background: "#fffbeb", text: "#451a03" },
    dark:  { primary: "#fbbf24", secondary: "#fde68a", accent: "#a78bfa", background: "#0f172a", text: "#fef3c7" },
  },
  {
    name: "Slate",
    light: { primary: "#475569", secondary: "#64748b", accent: "#3b82f6", background: "#f8fafc", text: "#0f172a" },
    dark:  { primary: "#94a3b8", secondary: "#cbd5e1", accent: "#60a5fa", background: "#0f172a", text: "#f1f5f9" },
  },
];

// ── Apply theme to CSS custom properties ──

function applyTheme(palette: PaletteConfig, isDark: boolean) {
  const root = document.documentElement;
  const colors = isDark ? palette.dark : palette.light;
  const neutrals = isDark ? NEUTRALS.dark : NEUTRALS.light;

  // 1. Toggle HeroUI native dark mode
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", isDark ? "dark" : "light");

  // 2. Our custom variables (layout, custom elements)
  root.style.setProperty("--board-color-primary", colors.primary);
  root.style.setProperty("--board-color-secondary", colors.secondary);
  root.style.setProperty("--board-color-accent", colors.accent);
  root.style.setProperty("--board-color-background", colors.background);
  root.style.setProperty("--board-color-text", colors.text);
  root.style.setProperty("--board-color-panel", neutrals.panel);
  root.style.setProperty("--board-color-chrome", neutrals.chrome);
  root.style.setProperty("--board-color-chip-bg", neutrals.chipBg);
  root.style.setProperty("--board-color-edge", neutrals.edge);
  root.style.setProperty("--board-color-ink-hi", neutrals.inkHi);
  root.style.setProperty("--board-color-ink-md", neutrals.inkMd);
  root.style.setProperty("--board-color-ink-lo", neutrals.inkLo);
  root.style.setProperty("--board-color-ink-dim", neutrals.inkDim);
  root.style.setProperty("--board-color-ink-ghost", neutrals.inkGhost);

  // 3. Sync HeroUI semantic variables to match our palette
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", neutrals.inkHi);
  root.style.setProperty("--surface", neutrals.panel);
  root.style.setProperty("--surface-foreground", neutrals.inkHi);
  root.style.setProperty("--surface-secondary", neutrals.chipBg);
  root.style.setProperty("--surface-secondary-foreground", neutrals.inkMd);
  root.style.setProperty("--surface-tertiary", neutrals.chrome);
  root.style.setProperty("--surface-tertiary-foreground", neutrals.inkLo);
  root.style.setProperty("--overlay", neutrals.panel);
  root.style.setProperty("--overlay-foreground", neutrals.inkHi);
  root.style.setProperty("--muted", neutrals.inkDim);
  root.style.setProperty("--scrollbar", neutrals.inkDim);
  root.style.setProperty("--default", isDark ? neutrals.chipBg : neutrals.edge);
  root.style.setProperty("--default-foreground", neutrals.inkHi);
  root.style.setProperty("--accent", colors.primary);
  root.style.setProperty("--accent-foreground", neutrals.panel);
  root.style.setProperty("--focus", colors.primary);
  root.style.setProperty("--link", colors.primary);
  root.style.setProperty("--border", neutrals.edge);
  root.style.setProperty("--separator", neutrals.edge);
  root.style.setProperty("--field-background", isDark ? neutrals.chrome : neutrals.panel);
  root.style.setProperty("--field-foreground", neutrals.inkHi);
  root.style.setProperty("--field-placeholder", neutrals.inkDim);
  root.style.setProperty("--field-border", neutrals.edge);
}

// ── Component ──

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [activePalette, setActivePalette] = useState("Teal");
  const [isDark, setIsDark] = useState(false);

  function handleSelect(palette: PaletteConfig) {
    setActivePalette(palette.name);
    applyTheme(palette, isDark);
  }

  function handleToggleMode() {
    const next = !isDark;
    setIsDark(next);
    const palette = PALETTES.find((p) => p.name === activePalette) ?? PALETTES[0];
    applyTheme(palette, next);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-2 w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          {/* Header */}
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Palette colori
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                isIconOnly
                className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                onPress={handleToggleMode}
                aria-label={isDark ? "Modalità chiara" : "Modalità scura"}
              >
                {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                isIconOnly
                className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                onPress={() => setOpen(false)}
                aria-label="Chiudi palette"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Mode indicator */}
          <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1">
            <span className={`h-2 w-2 rounded-full ${isDark ? "bg-indigo-400" : "bg-amber-400"}`} />
            <span className="text-[10px] font-medium text-slate-500">
              {isDark ? "Dark mode" : "Light mode"}
            </span>
          </div>

          {/* Palette grid */}
          <div className="grid grid-cols-2 gap-1">
            {PALETTES.map((p) => {
              const colors = isDark ? p.dark : p.light;
              return (
                <button
                  key={p.name}
                  onClick={() => handleSelect(p)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors cursor-pointer ${
                    activePalette === p.name
                      ? "bg-slate-100 ring-1 ring-slate-300"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex gap-0.5 flex-shrink-0">
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ background: colors.primary }}
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ background: colors.accent }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 flex-1 truncate">
                    {p.name}
                  </span>
                  {activePalette === p.name && (
                    <Check className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <Tooltip>
          <Button
            isIconOnly
            variant="solid"
            onPress={() => setOpen(!open)}
            className="h-11 w-11 rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 cursor-pointer"
            aria-label="Cambia palette colori"
          >
            <Palette className="h-5 w-5" />
          </Button>
          <Tooltip.Content>Cambia palette colori</Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  );
}
