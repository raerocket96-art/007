import React from "react";
import { Activity, ArrowRight } from "lucide-react";

export interface SituationShiftItem {
  metric: string;
  before: string;
  after: string;
  cause: string;
  tone?: "good" | "bad" | "neutral";
}

export const SituationShiftCard: React.FC<{ shifts: SituationShiftItem[] }> = ({ shifts }) => {
  if (!shifts.length) return null;

  return (
    <section className="mi6-swap-panel rounded-[20px] p-3 font-mono">
      <div className="flex items-center gap-2 border-b border-white/8 pb-2 mb-2">
        <Activity className="w-4 h-4 text-sky-400" />
        <div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-sky-400 font-bold">Situation Shift</div>
          <div className="text-xs font-bold text-stone-200">What your last decision actually changed</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
        {shifts.map((shift, idx) => (
          <div key={`${shift.metric}-${idx}`} className="mi6-swap-panel-soft rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 text-[8px] uppercase tracking-wider text-stone-500 font-bold truncate">{shift.metric}</div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold shrink-0">
                <span className="text-stone-500">{shift.before}</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
                <span className={shift.tone === "good" ? "text-emerald-400" : shift.tone === "bad" ? "text-red-400" : "text-stone-100"}>{shift.after}</span>
              </div>
            </div>
            <div className="mt-1 text-[8px] leading-4 text-stone-500 line-clamp-2">{shift.cause}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
