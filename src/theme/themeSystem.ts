export type ThemeId =
  | "mi6-classified"
  | "xbox-series-x"
  | "ps5"
  | "windows-11-dark"
  | "cyber-intelligence"
  | "night-vision"
  | "arctic-command"
  | "crimson-operations";

export type AccentId = "theme" | "gold" | "green" | "blue" | "cyan" | "purple" | "red" | "orange" | "silver";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  swatches: string[];
  category: string;
}

export const THEME_STORAGE_KEY = "mi6_interface_theme_v1";
export const ACCENT_STORAGE_KEY = "mi6_interface_accent_v1";
export const THEME_CHANGE_EVENT = "mi6-theme-change";

export const THEMES: ThemeDefinition[] = [
  { id: "mi6-classified", name: "MI6 Classified / Original", description: "Charcoal intelligence workstation with warm classified-gold highlights.", swatches: ["#080b0f", "#111820", "#e8b85c"], category: "Original" },
  { id: "xbox-series-x", name: "Xbox Series X", description: "Graphite console surfaces with precise Xbox-green operational accents.", swatches: ["#070a08", "#111713", "#52b043"], category: "Console" },
  { id: "ps5", name: "PS5", description: "Deep navy layers, cool white typography and electric-blue focus states.", swatches: ["#060a14", "#111929", "#2f7cff"], category: "Console" },
  { id: "windows-11-dark", name: "Windows 11 Dark", description: "Soft graphite glass, rounded panels and restrained blue illumination.", swatches: ["#0c1118", "#18202b", "#60a5fa"], category: "Desktop" },
  { id: "cyber-intelligence", name: "Cyber Intelligence", description: "Professional black/teal signal desk with violet secondary telemetry.", swatches: ["#050a0b", "#0c1719", "#21d4c2"], category: "Tactical" },
  { id: "night-vision", name: "Night Vision", description: "Dark tactical green interface with restrained luminous field indicators.", swatches: ["#050805", "#0d160e", "#6ccf72"], category: "Tactical" },
  { id: "arctic-command", name: "Arctic Command", description: "Cold steel-blue command environment tuned for clean, high-contrast telemetry.", swatches: ["#071019", "#10202d", "#67d6f4"], category: "Command" },
  { id: "crimson-operations", name: "Crimson Operations", description: "Graphite black with deep crimson mission accents and separate danger states.", swatches: ["#0b0708", "#1a1013", "#d24b65"], category: "Command" },
];

export const ACCENTS: { id: AccentId; name: string; color: string }[] = [
  { id: "theme", name: "Theme default", color: "linear-gradient(135deg,#e8b85c,#60a5fa)" },
  { id: "gold", name: "Gold", color: "#e8b85c" },
  { id: "green", name: "Green", color: "#52b043" },
  { id: "blue", name: "Blue", color: "#3b82f6" },
  { id: "cyan", name: "Cyan", color: "#22d3ee" },
  { id: "purple", name: "Purple", color: "#a78bfa" },
  { id: "red", name: "Red", color: "#ef5b68" },
  { id: "orange", name: "Orange", color: "#f59e0b" },
  { id: "silver", name: "Silver", color: "#d6d9df" },
];

export function getStoredTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    return THEMES.some((theme) => theme.id === saved) ? (saved as ThemeId) : "mi6-classified";
  } catch {
    return "mi6-classified";
  }
}

export function getStoredAccent(): AccentId {
  try {
    const saved = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentId | null;
    return ACCENTS.some((accent) => accent.id === saved) ? (saved as AccentId) : "theme";
  } catch {
    return "theme";
  }
}

export function applyTheme(theme: ThemeId, accent: AccentId = getStoredAccent()) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.accent = accent;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  } catch {}
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme, accent } }));
}

export function initializeTheme() {
  applyTheme(getStoredTheme(), getStoredAccent());
}
