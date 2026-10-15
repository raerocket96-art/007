import React, { useMemo, useState, useEffect } from "react";
import {
  Archive,
  BrainCircuit,
  ChevronRight,
  Clock3,
  FileText,
  GitCompareArrows,
  History,
  ShieldCheck,
  Target,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ArrowRight
} from "lucide-react";
import { soundManager } from "../utils/sound";

export type OperationalTab = "runs" | "debriefs" | "compare" | "decisions" | "branches" | "dna";

interface OperationalWorkspaceProps {
  initialSubTab?: OperationalTab;
  onNavigateToTab: (tab: string) => void;
}

type Run = {
  id?: string;
  title?: string;
  actor?: string;
  score?: number;
  finishedAt?: string;
  turnCount?: number;
  outcome?: string;
  report?: any;
  timeline?: any[];
  [key: string]: any;
};

const RUN_ARCHIVE_KEY = "mi6_completed_run_archive_v1";
const SAVES_KEY = "mi6_mission_saves_v1";
const LOADOUT_KEY = "mi6_customized_loadout_v1";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export const OperationalWorkspace: React.FC<OperationalWorkspaceProps> = ({
  initialSubTab = "runs",
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<OperationalTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Load shared archive data ONCE at the hub level
  const runs = useMemo(() => readJson<Run[]>(RUN_ARCHIVE_KEY, []), []);
  const saves = useMemo(() => readJson<any[]>(SAVES_KEY, []), []);
  const loadout = useMemo(() => readJson<any>(LOADOUT_KEY, { items: [] }), []);

  const [leftRunId, setLeftRunId] = useState<string>(runs[0]?.id || "");
  const [rightRunId, setRightRunId] = useState<string>(runs[1]?.id || runs[0]?.id || "");
  const [selectedRunId, setSelectedRunId] = useState<string>(runs[runs.length - 1]?.id || "");

  const activeRun = runs.find((r) => r.id === selectedRunId) || runs[runs.length - 1];

  const go = (destination: string) => {
    soundManager.playClick();
    onNavigateToTab(destination);
  };

  const navTabs: Array<{ id: OperationalTab; label: string; icon: any; badge?: string }> = [
    { id: "runs", label: "RUNS ARCHIVE", icon: Archive, badge: runs.length ? String(runs.length) : undefined },
    { id: "debriefs", label: "DEBRIEF CENTRE", icon: FileText },
    { id: "compare", label: "RUN COMPARISON", icon: GitCompareArrows },
    { id: "decisions", label: "DECISION ANALYSIS", icon: Target },
    { id: "branches", label: "BRANCH HISTORY", icon: History },
    { id: "dna", label: "OPERATIONAL DNA", icon: BrainCircuit },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Hub Hero Banner */}
      <div className="mi6-swap-panel rounded-[28px] p-5 sm:p-6 shadow-[0_26px_70px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black">
                  00-SECTION CENTRAL REGISTRY
                </span>
                <span className="bg-[#1e232b] text-stone-300 border border-white/10 text-[9px] px-2 py-0.5 rounded font-bold">
                  OPERATIONAL ARCHIVE HUB
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight mt-1">
                Operational Debrief & Archive
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => go("simulator")}
              className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-2 transition-colors shadow"
            >
              <span>ENTER SIMULATOR</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation Pill Strip */}
        <div className="mt-5 pt-4 border-t border-white/8 flex overflow-x-auto no-scrollbar gap-2">
          {navTabs.map((tab) => {
            const active = activeSubTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveSubTab(tab.id);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
                  active
                    ? "bg-amber-500 text-black shadow-md font-black"
                    : "bg-white/[0.03] text-stone-400 hover:bg-white/[0.07] hover:text-stone-100 border border-white/6"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-black" : "text-amber-400/80"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                      active ? "bg-black text-amber-400" : "bg-white/10 text-stone-300"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-VIEW 1: RUNS ARCHIVE */}
      {activeSubTab === "runs" && (
        <div className="grid xl:grid-cols-[1.4fr_.6fr] gap-5">
          <div className="mi6-swap-panel rounded-[26px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div>
                <span className="text-[9px] text-amber-400 uppercase font-black tracking-widest block">OPERATIONAL LOG</span>
                <h2 className="text-base font-bold text-stone-100">Completed Mission Branches</h2>
              </div>
              <span className="text-[10px] text-stone-500 font-mono">{runs.length} RECORDED RUNS</span>
            </div>

            {runs.length ? (
              <div className="divide-y divide-white/[0.06] space-y-1">
                {[...runs].reverse().map((run, idx) => (
                  <div
                    key={run.id || idx}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedRunId(run.id || "");
                    }}
                    className={`p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                      selectedRunId === run.id ? "bg-amber-500/10 border border-amber-500/30" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-stone-100 truncate">{run.title || "Classified Operation"}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          {run.actor || "007"} • {run.turnCount || 0} turns • {run.outcome || "ARCHIVED"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-amber-300">{typeof run.score === "number" ? `${run.score}/100` : "—"}</div>
                      <div className="text-[8px] text-stone-500 uppercase">FINAL M RATING</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState text="No completed mission runs have been archived in this session." action="Start a Film Simulation" onAction={() => go("simulator")} />
            )}
          </div>

          <div className="space-y-5">
            <div className="mi6-swap-panel rounded-[26px] p-5 space-y-3">
              <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs border-b border-white/8 pb-2">
                <Clock3 className="w-4 h-4 text-sky-400" />
                <span>SAVE VAULT STATUS</span>
              </div>
              <div className="text-3xl font-black text-stone-100">{saves.length}</div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Manual field checkpoint states stored locally. Return to the Mission Simulator to reload or manage slots.
              </p>
              <button
                onClick={() => go("simulator")}
                className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-200 border border-white/10 text-xs font-bold transition-colors"
              >
                OPEN SAVE VAULT IN SIMULATOR
              </button>
            </div>

            <div className="mi6-swap-panel rounded-[26px] p-5 space-y-2">
              <span className="text-[9px] text-amber-400 uppercase font-black">ARCHIVE DOCTRINE</span>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Every finished run is preserved as an alternate sovereign timeline. Replaying the same film creates parallel branches rather than overwriting prior outcomes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: DEBRIEF CENTRE */}
      {activeSubTab === "debriefs" && (
        <div className="mi6-swap-panel rounded-[26px] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/8 pb-3">
            <div>
              <span className="text-[9px] text-amber-400 uppercase font-black tracking-widest block">M'S FINAL REVIEW DESK</span>
              <h2 className="text-lg font-bold text-stone-100">
                {activeRun?.title ? `Debrief Report: ${activeRun.title}` : "Select a Completed Operation"}
              </h2>
            </div>
            {activeRun && (
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold">
                SCORE {activeRun.score ?? "—"}/100
              </span>
            )}
          </div>

          {activeRun ? (
            <div className="space-y-4 font-sans text-xs text-stone-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/8 space-y-2">
                <span className="font-mono text-[9px] text-amber-400 uppercase font-black block">EXECUTIVE SUMMARY</span>
                <p>{activeRun.report?.operationSummary || activeRun.debrief || `Archived run completed with ${activeRun.turnCount || 0} recorded decisions under ${activeRun.actor || "007"}.`}</p>
              </div>

              {activeRun.report?.mThoughts && (
                <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/25 space-y-2">
                  <span className="font-mono text-[9px] text-amber-400 uppercase font-black block">M'S EVALUATION & THOUGHTS</span>
                  <p className="text-stone-200">{activeRun.report.mThoughts}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 font-mono">
                <button
                  onClick={() => go("simulator")}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
                >
                  OPEN IN FULL DEBRIEF VIEWER
                </button>
              </div>
            </div>
          ) : (
            <EmptyState text="Complete a simulation session to review formal debrief evaluations from M." action="Launch Mission Simulator" onAction={() => go("simulator")} />
          )}
        </div>
      )}

      {/* SUB-VIEW 3: RUN COMPARISON */}
      {activeSubTab === "compare" && (
        <div className="mi6-swap-panel rounded-[26px] p-6 space-y-5">
          <div className="border-b border-white/8 pb-3">
            <span className="text-[9px] text-amber-400 uppercase font-black tracking-widest block">COMPARATIVE ANALYSIS DESK</span>
            <h2 className="text-lg font-bold text-stone-100">Compare Parallel Mission Branches</h2>
          </div>

          {runs.length < 2 ? (
            <EmptyState text="Complete at least two mission runs to unlock side-by-side branch comparison." action="Start Another Simulation" onAction={() => go("simulator")} />
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/30 border border-white/8 space-y-2">
                  <label className="text-[9px] text-amber-400 font-bold uppercase block">TIMELINE A</label>
                  <select
                    value={leftRunId}
                    onChange={(e) => setLeftRunId(e.target.value)}
                    className="w-full bg-[#141820] border border-white/10 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none"
                  >
                    {runs.map((r, i) => (
                      <option key={r.id || i} value={r.id}>
                        {r.title || `Run ${i + 1}`} ({r.actor || "007"} - Score {r.score ?? "—"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-white/8 space-y-2">
                  <label className="text-[9px] text-amber-400 font-bold uppercase block">TIMELINE B</label>
                  <select
                    value={rightRunId}
                    onChange={(e) => setRightRunId(e.target.value)}
                    className="w-full bg-[#141820] border border-white/10 rounded-xl px-3 py-2 text-stone-200 text-xs focus:outline-none"
                  >
                    {runs.map((r, i) => (
                      <option key={r.id || i} value={r.id}>
                        {r.title || `Run ${i + 1}`} ({r.actor || "007"} - Score {r.score ?? "—"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[runs.find((r) => r.id === leftRunId) || runs[0], runs.find((r) => r.id === rightRunId) || runs[1]].map((r, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#141820] border border-white/8 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-amber-400 font-bold">BRANCH {i === 0 ? "A" : "B"}</span>
                      <span className="text-lg font-black text-stone-100">{r?.score ?? "—"}/100</span>
                    </div>
                    <h3 className="text-base font-bold text-stone-100">{r?.title || "Classified Operation"}</h3>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5"><span className="text-stone-500 block text-[8px]">AGENT DOCTRINE</span><strong>{r?.actor || "007"}</strong></div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5"><span className="text-stone-500 block text-[8px]">TOTAL TURNS</span><strong>{r?.turnCount || 0}</strong></div>
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 col-span-2"><span className="text-stone-500 block text-[8px]">OUTCOME STATE</span><strong className="text-emerald-400">{r?.outcome || "ARCHIVED"}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 4: DECISION ANALYSIS */}
      {activeSubTab === "decisions" && (
        <div className="mi6-swap-panel rounded-[26px] p-6 space-y-5">
          <div className="border-b border-white/8 pb-3">
            <span className="text-[9px] text-amber-400 uppercase font-black tracking-widest block">TACTICAL EVALUATION</span>
            <h2 className="text-lg font-bold text-stone-100">Key Decision Analysis & Turning Points</h2>
          </div>

          {activeRun?.report?.decisionAssessment?.length ? (
            <div className="space-y-3">
              {activeRun.report.decisionAssessment.map((d: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-black/30 border border-white/8 space-y-2">
                  <div className="flex justify-between items-center text-[10px] border-b border-white/6 pb-1.5">
                    <span className="text-amber-400 font-bold">TURN {d.turn || idx + 1} DECISION</span>
                    <span className="text-stone-200 font-bold">M'S RATING: {d.score ?? "—"}/100</span>
                  </div>
                  <div className="text-xs font-bold text-stone-100">{d.decision}</div>
                  <p className="text-[11px] text-stone-400 font-sans">{d.assessment}</p>
                  {d.consequence && <div className="text-[10px] text-amber-300/80 font-mono">Consequence: {d.consequence}</div>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="Complete an operation to generate detailed turn-by-turn decision scorecards." action="Open Mission Simulator" onAction={() => go("simulator")} />
          )}
        </div>
      )}

      {/* SUB-VIEW 5: BRANCH HISTORY */}
      {activeSubTab === "branches" && (
        <div className="mi6-swap-panel rounded-[26px] p-6 space-y-5">
          <div className="border-b border-white/8 pb-3">
            <span className="text-[9px] text-amber-400 uppercase font-black tracking-widest block">CANON & MULTI-TIMELINE MATRIX</span>
            <h2 className="text-lg font-bold text-stone-100">Alternate Film Timelines</h2>
          </div>

          {runs.length ? (
            <div className="space-y-3">
              {Object.entries(
                runs.reduce((acc: Record<string, Run[]>, r) => {
                  const key = r.title || "Classified Operation";
                  (acc[key] ||= []).push(r);
                  return acc;
                }, {})
              ).map(([title, group]) => (
                <div key={title} className="p-4 rounded-2xl bg-black/30 border border-white/8 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <History className="w-5 h-5 text-violet-400 shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-stone-100">{title}</div>
                      <div className="text-[10px] text-stone-500">{group.length} recorded alternate timeline{group.length === 1 ? "" : "s"}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setActiveSubTab("compare");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border border-white/10 text-xs font-bold"
                  >
                    COMPARE BRANCHES
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="No alternate film branches recorded yet." action="Start a Film Operation" onAction={() => go("bond")} />
          )}
        </div>
      )}

      {/* SUB-VIEW 6: OPERATIONAL DNA */}
      {activeSubTab === "dna" && (
        <div className="mi6-swap-panel rounded-[26px] p-6 space-y-5">
          <div className="border-b border-white/8 pb-3">
            <span className="text-[9px] text-amber-400 uppercase font-black tracking-widest block">BEHAVIORAL FINGERPRINT</span>
            <h2 className="text-lg font-bold text-stone-100">Operative Behavioral DNA Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["Objective Focus", 88, "Prioritizing primary mission completion above all secondary distractions"],
              ["Intelligence Instinct", 76, "Propensity to acquire, verify and exploit signals and documentation"],
              ["Discretion & Stealth", 82, "Preference for low signature and zero collateral exposure"],
              ["Asset Protection", 70, "Commitment to preserving friendly couriers, sources and civilians"],
              ["Proportionality", 78, "Balancing minimum necessary force against hostile opposition"],
              ["Q-Branch Improvisation", 85, "Effective deployment of technical ordnance in clutch situations"],
            ].map(([name, score, desc], idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-black/30 border border-white/8 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-200 text-xs">{name}</span>
                  <span className="text-xs font-black text-amber-400">{score}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${score}%` }} />
                </div>
                <p className="text-[9px] text-stone-500 font-sans leading-tight">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState: React.FC<{ text: string; action?: string; onAction?: () => void }> = ({ text, action, onAction }) => (
  <div className="p-8 text-center rounded-2xl bg-black/20 border border-white/6 space-y-3">
    <Archive className="w-8 h-8 mx-auto text-stone-600" />
    <p className="text-stone-400 text-xs">{text}</p>
    {action && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold"
      >
        {action}
      </button>
    )}
  </div>
);
