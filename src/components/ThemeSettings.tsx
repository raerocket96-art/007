import React, { useEffect, useMemo, useState } from "react";
import { Check, MonitorCog, Palette, RotateCcw, Sparkles } from "lucide-react";
import { ACCENTS, AccentId, applyTheme, getStoredAccent, getStoredTheme, THEMES, ThemeId } from "../theme/themeSystem";
import { soundManager } from "../utils/sound";

export const ThemeSettings: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [theme, setTheme] = useState<ThemeId>(() => getStoredTheme());
  const [accent, setAccent] = useState<AccentId>(() => getStoredAccent());

  useEffect(() => applyTheme(theme, accent), [theme, accent]);
  const activeTheme = useMemo(() => THEMES.find((item) => item.id === theme) || THEMES[0], [theme]);

  const selectTheme = (id: ThemeId) => {
    soundManager.playClick();
    setTheme(id);
  };

  const reset = () => {
    soundManager.playClick();
    setTheme("mi6-classified");
    setAccent("theme");
  };

  return (
    <section className="theme-settings-shell rounded-[24px] border border-white/8 bg-black/20 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)]">
            <MonitorCog className="w-4 h-4" /> Interface theme engine
          </div>
          <h3 className="mt-1 text-base font-black text-[var(--text-primary)]">Choose the workstation identity</h3>
          <p className="mt-1 max-w-3xl text-[10px] leading-relaxed text-[var(--text-muted)]">
            Themes alter surfaces, borders, focus states, telemetry and ambient treatment without touching mission logic. Your choice is saved on this browser.
          </p>
        </div>
        <button onClick={reset} className="theme-quiet-button inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-[9px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <RotateCcw className="w-3.5 h-3.5" /> Original
        </button>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {THEMES.map((item) => {
          const active = item.id === theme;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectTheme(item.id)}
              className={`theme-card group relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all ${active ? "is-active" : ""}`}
            >
              <div className="theme-mini-preview rounded-xl border border-white/8 p-2.5">
                <div className="flex gap-1.5">
                  {item.swatches.map((swatch) => <span key={swatch} className="h-2.5 flex-1 rounded-full border border-white/10" style={{ background: swatch }} />)}
                </div>
                <div className="mt-2 grid grid-cols-[.55fr_1fr] gap-1.5">
                  <div className="h-9 rounded-lg bg-black/30 border border-white/6" />
                  <div className="space-y-1.5">
                    <div className="h-2 rounded-full bg-white/15" />
                    <div className="h-2 w-3/4 rounded-full" style={{ background: item.swatches[2], opacity: .75 }} />
                    <div className="h-2 w-1/2 rounded-full bg-white/8" />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-black text-[var(--text-primary)]">{item.name}</div>
                  <div className="mt-1 text-[8px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{item.category}</div>
                </div>
                {active && <span className="theme-selected-badge flex h-6 w-6 shrink-0 items-center justify-center rounded-full"><Check className="w-3.5 h-3.5" /></span>}
              </div>
              <p className="mt-2 text-[9px] leading-relaxed text-[var(--text-muted)]">{item.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 border-t border-white/8 pt-4">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-[var(--text-secondary)]"><Palette className="w-3.5 h-3.5" /> Optional accent override</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACCENTS.map((item) => {
            const active = item.id === accent;
            return (
              <button key={item.id} onClick={() => { soundManager.playClick(); setAccent(item.id); }} className={`accent-chip flex items-center gap-2 rounded-xl border px-3 py-2 text-[9px] font-bold ${active ? "is-active" : ""}`}>
                <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: item.color }} />
                {item.name}
                {active && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[8px] text-[var(--text-muted)]"><Sparkles className="w-3 h-3 text-[var(--accent-primary)]" /> Active: {activeTheme.name}{accent !== "theme" ? ` + ${ACCENTS.find((a) => a.id === accent)?.name}` : ""}</div>
      </div>
    </section>
  );
};
