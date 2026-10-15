import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Crosshair, 
  Activity,
  Zap,
  Info
} from "lucide-react";
import { SuccessProbabilityResult } from "../utils/successProbability";
import { soundManager } from "../utils/sound";

interface SuccessProbabilityGaugeProps {
  data: SuccessProbabilityResult;
  compact?: boolean;
}

export const SuccessProbabilityGauge: React.FC<SuccessProbabilityGaugeProps> = ({
  data,
  compact = false
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Circumference for circular progress gauge
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.probability / 100) * circumference;

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-2.5 py-1.5 rounded-xl font-mono text-xs">
        <Activity className={`w-3.5 h-3.5 ${data.ratingColor} animate-pulse`} />
        <div>
          <span className="text-[8px] text-stone-500 uppercase tracking-wider block leading-none">SUCCESS PROB</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`font-black text-xs ${data.ratingColor}`}>{data.probability}%</span>
            <span className={`text-[8px] px-1 rounded font-bold ${data.badgeBg}`}>{data.level}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="mi6-swap-panel-soft rounded-[22px] p-4 shadow-xl border border-white/10 relative overflow-hidden font-mono">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <div className="text-[8px] uppercase tracking-[0.2em] text-stone-500 font-bold">PREDICTIVE TELEMETRY</div>
            <div className="text-[11px] font-black text-stone-100">SUCCESS PROBABILITY</div>
          </div>
        </div>

        <span className={`text-[9px] px-2 py-0.5 rounded font-black border uppercase tracking-wider ${data.badgeBg}`}>
          {data.level}
        </span>
      </div>

      {/* Gauge Body */}
      <div className="flex items-center justify-between gap-4 my-1">
        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-stone-800/80"
            />
            {/* Animated Dynamic Value Arc */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`${data.ratingColor} transition-all duration-700 ease-out`}
            />
          </svg>

          {/* Centered Percentage */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-2xl font-black tracking-tight ${data.ratingColor}`}>
              {data.probability}%
            </span>
            <span className="text-[7px] text-stone-500 uppercase tracking-widest font-bold">
              EST. PROB
            </span>
          </div>
        </div>

        {/* Persona Alignment & Metric Info */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="bg-black/30 border border-white/6 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-[8px] text-stone-500 mb-1">
              <span className="uppercase">007 PERSONA SYNERGY</span>
              <span className={`font-black ${data.synergyScore >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {data.synergyScore >= 0 ? `+${data.synergyScore}%` : `${data.synergyScore}%`}
              </span>
            </div>
            <div className="text-[10px] font-black text-amber-300 truncate">
              {data.doctrineName.toUpperCase()}
            </div>
            <div className="text-[8px] text-stone-400 mt-0.5">
              {data.synergyLabel}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              setShowBreakdown(!showBreakdown);
            }}
            className="w-full text-[9px] text-stone-400 hover:text-amber-300 flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 px-2 py-1 rounded-lg transition-colors"
          >
            <span>{showBreakdown ? "HIDE CAUSAL FACTORS" : "VIEW CAUSAL FACTORS"}</span>
            {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Causal Factors Breakdown Dropdown */}
      {showBreakdown && (
        <div className="mt-3 pt-3 border-t border-white/8 space-y-2 text-[9px]">
          <div className="text-[8px] uppercase tracking-wider text-stone-500 font-bold">
            KEY CAUSAL FACTORS
          </div>
          {data.factors.length === 0 ? (
            <div className="text-stone-500 text-[9px]">Baseline telemetry nominal.</div>
          ) : (
            data.factors.map((f, idx) => (
              <div
                key={idx}
                className="bg-[#12141a] border border-white/6 rounded-lg p-2 flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className={`font-bold ${f.type === "positive" ? "text-emerald-300" : "text-red-300"}`}>
                      {f.factor}
                    </span>
                  </div>
                  <p className="text-stone-400 text-[8px] leading-relaxed mt-0.5">
                    {f.description}
                  </p>
                </div>
                <span className={`font-black shrink-0 ${f.type === "positive" ? "text-emerald-400" : "text-red-400"}`}>
                  {f.impact > 0 ? `+${f.impact}%` : `${f.impact}%`}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
};
