import React from "react";
import { MissionDebriefReport } from "../types";
import { Award, Target, Film, X, TrendingUp, ShieldCheck } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface DebriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MissionDebriefReport;
}

export const DebriefModal: React.FC<DebriefModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  if (!isOpen) return null;

  const chartData = [
    { subject: "Intelligence", player: report.scores.intelValue, canonical: report.canonicalBenchmarks.intelligence },
    { subject: "Ethics", player: Math.max(0, 100 - report.scores.politicalExposureRisk), canonical: report.canonicalBenchmarks.ethics },
    { subject: "Speed", player: report.scores.tacticalEfficiency, canonical: report.canonicalBenchmarks.speed },
    { subject: "Stealth", player: report.scores.discretion, canonical: report.canonicalBenchmarks.stealth },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#1c1e23] border-2 border-white/10 rounded-2xl shadow-2xl overflow-y-auto font-mono text-stone-200">
        
        {/* Dossier Header */}
        <div className="bg-[#15171b] border-b border-white/8 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-100 tracking-wider">
                SIS MISSION DEBRIEF // FINAL ASSESSMENT
              </div>
              <div className="text-[9px] text-stone-400 uppercase tracking-widest">
                {report.classificationRating}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 text-xs px-2 py-1 rounded hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Mission Summary Section */}
          <section className="mi6-swap-panel-soft rounded-xl p-4">
            <h3 className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Mission Summary
            </h3>
            <p className="text-[13px] leading-relaxed text-stone-300 font-sans">{report.operationSummary}</p>
          </section>

          {/* Comparative Performance Section */}
          <section className="mi6-swap-panel-soft rounded-xl p-4">
            <h3 className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Film className="w-4 h-4" /> Comparative Performance
            </h3>
            <p className="text-[13px] leading-relaxed text-stone-300 font-sans mb-4">{report.filmComparison}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#444" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Player" dataKey="player" stroke="#34d399" fill="#34d399" fillOpacity={0.5} />
                    <Radar name="Canonical" dataKey="canonical" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center content-center">
                {Object.entries(report.scores).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="bg-[#15171b] rounded-lg p-3 border border-white/5">
                    <div className="text-[8px] uppercase text-stone-500 tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-xl font-black text-stone-100">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Key Decisions Section */}
          <section className="mi6-swap-panel-soft rounded-xl p-4">
            <h3 className="text-[10px] text-sky-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Key Decisions
            </h3>
            <ul className="space-y-2 list-none">
              {report.keyDecisions.map((decision, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[12px] text-stone-300 font-sans">
                  <span className="text-sky-500 mt-1">•</span> {decision}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
