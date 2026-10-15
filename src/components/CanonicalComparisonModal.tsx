import React, { useMemo } from "react";
import { MissionState } from "../types";
import { BOND_FILMS } from "../data/bondFilmCanon";
import { GitCompareArrows, X, Film, Route, CheckCircle2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  filmTitle: string;
  missionState: MissionState | null;
}

export const CanonicalComparisonModal: React.FC<Props> = ({ open, onClose, filmTitle, missionState }) => {
  const film = useMemo(() => BOND_FILMS.find(f => f.title.toLowerCase() === filmTitle.replace(/\s*\(\d{4}\)\s*$/, "").toLowerCase()), [filmTitle]);
  if (!open) return null;

  const actions = missionState?.timeline.filter(t => t.turn > 0) || [];
  const aggressive = actions.filter(a => /shoot|attack|assault|kill|explos|aggress|breach/i.test(a.action)).length;
  const quiet = actions.filter(a => /observe|surveil|stealth|covert|listen|track|inspect|decode/i.test(a.action)).length;
  const divergence = Math.min(100, 20 + actions.length * 8 + aggressive * 8 + quiet * 3);

  return (
    <div className="fixed inset-0 z-[70] bg-black/88 backdrop-blur-md p-3 flex items-center justify-center" onMouseDown={onClose}>
      <section className="w-full max-w-4xl max-h-[88vh] overflow-y-auto mi6-swap-panel rounded-[28px] shadow-2xl font-mono" onMouseDown={e => e.stopPropagation()}>
        <header className="sticky top-0 bg-[#111318] border-b border-white/8 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3"><GitCompareArrows className="w-5 h-5 text-amber-400" /><div><div className="text-[9px] uppercase tracking-[0.22em] text-amber-400 font-bold">Canonical Timeline Analysis</div><div className="text-sm font-bold text-stone-100">Simulation vs Original Movie</div></div></div>
          <button onClick={onClose} className="p-2 rounded-lg border border-white/10 text-stone-400"><X className="w-4 h-4" /></button>
        </header>
        <div className="p-5 space-y-4">
          {!film ? (
            <div className="border border-dashed border-white/10 rounded-xl p-8 text-center text-stone-500 text-xs">No canonical comparison file is available for this original MI6 simulation.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-3 mi6-swap-panel-soft rounded-2xl p-4"><div className="text-[9px] text-stone-500 uppercase">Original Film</div><div className="text-lg font-black text-stone-100 mt-1">{film.title} ({film.year})</div><div className="text-xs text-stone-400 mt-1">Original Bond: {film.originalActor} · {film.era}</div></div>
                <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-4"><div className="text-[9px] text-amber-300 uppercase">Timeline Divergence</div><div className="text-3xl font-black text-amber-400 mt-1">{divergence}%</div><div className="text-[9px] text-stone-500 mt-1">Branch estimate from recorded choices</div></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <article className="mi6-swap-panel-soft rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-[10px] uppercase"><Film className="w-4 h-4" /> Original movie baseline</div>
                  <div className="mt-3 text-xs text-stone-200 font-bold">{film.openingScene.title}</div>
                  <p className="mt-2 text-[11px] leading-relaxed text-stone-400">{film.openingScene.description}</p>
                  <div className="mt-3 text-[10px] text-stone-500">OBJECTIVE: {film.initialObjective}</div>
                </article>
                <article className="mi6-swap-panel-soft rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase"><Route className="w-4 h-4" /> Your simulated branch</div>
                  <div className="mt-3 text-xs text-stone-200 font-bold">{actions.length} player decisions recorded</div>
                  <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                    {actions.length ? actions.map((a, i) => <div key={i} className="border-l-2 border-amber-500 pl-3"><div className="text-[9px] text-amber-400">TURN {a.turn}</div><div className="text-[10px] text-stone-300">{a.action}</div><div className="text-[9px] text-stone-600 mt-0.5">{a.consequence}</div></div>) : <div className="text-[10px] text-stone-600">No divergence recorded yet.</div>}
                  </div>
                </article>
              </div>

              <article className="mi6-swap-panel-soft rounded-2xl p-4">
                <div className="text-[10px] font-bold uppercase text-stone-300 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Canonical anchors still relevant</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-[10px] text-stone-400">
                  <div className="bg-[#15171b] rounded-lg p-2">Primary villain network: {film.villains.join(", ") || "Classified"}</div>
                  <div className="bg-[#15171b] rounded-lg p-2">Known allies: {film.allies.join(", ") || "Classified"}</div>
                  <div className="bg-[#15171b] rounded-lg p-2">Canonical gadgets: {film.gadgets.join(", ") || "Standard issue"}</div>
                  <div className="bg-[#15171b] rounded-lg p-2">Canonical locations: {film.setting.join(", ")}</div>
                </div>
              </article>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
