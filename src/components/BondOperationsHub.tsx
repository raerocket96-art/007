import React, { useState, useEffect } from "react";
import { Film, Sparkles, UserCheck, Play } from "lucide-react";
import { BondMovieDirectory } from "./BondMovieDirectory";
import { BondPersonaProfiler } from "./BondPersonaProfiler";
import { soundManager } from "../utils/sound";

export type BondOperationsSubTab = "movies" | "persona";

interface BondOperationsHubProps {
  initialSubTab?: BondOperationsSubTab;
  onStartMission: (templateId: string) => void;
  onStartMissionWithDoctrine: (doctrineId: string, templateId?: string) => void;
  onOpenRecord?: (recordId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const BondOperationsHub: React.FC<BondOperationsHubProps> = ({
  initialSubTab = "movies",
  onStartMission,
  onStartMissionWithDoctrine,
  onOpenRecord,
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<BondOperationsSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Hub Hero Banner */}
      <div className="mi6-swap-panel rounded-[28px] p-5 sm:p-6 shadow-[0_26px_70px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-500/35 flex items-center justify-center text-violet-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-violet-400 uppercase tracking-widest font-black">
                  007 SECTION CANONICAL DIRECTORY
                </span>
                <span className="bg-[#1e232b] text-stone-300 border border-white/10 text-[9px] px-2 py-0.5 rounded font-bold">
                  25 FILM OPERATIONS • 6 DOCTRINES
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight mt-1">
                007 Film Operations & Persona Profiling
              </h1>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation Pill Strip */}
        <div className="mt-5 pt-4 border-t border-white/8 flex overflow-x-auto no-scrollbar gap-2">
          {[
            { id: "movies", label: "25 BOND FILM OPERATIONS", icon: Film, count: "25" },
            { id: "persona", label: "BOND PERSONA & DOCTRINES", icon: Sparkles, count: "6" },
          ].map((tab) => {
            const active = activeSubTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveSubTab(tab.id as any);
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
                  active
                    ? "bg-violet-600 text-white shadow-md font-black"
                    : "bg-white/[0.03] text-stone-400 hover:bg-white/[0.07] hover:text-stone-100 border border-white/6"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-white" : "text-violet-400"}`} />
                <span>{tab.label}</span>
                {tab.count && (
                  <span
                    className={`ml-1 text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                      active ? "bg-black text-violet-300" : "bg-white/10 text-stone-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-views */}
      {activeSubTab === "movies" && (
        <BondMovieDirectory
          onStartMission={onStartMission}
          onOpenPersonaProfiler={() => {
            soundManager.playClick();
            setActiveSubTab("persona");
          }}
          onOpenRecord={onOpenRecord}
        />
      )}

      {activeSubTab === "persona" && (
        <BondPersonaProfiler
          onStartMissionWithDoctrine={onStartMissionWithDoctrine}
          onNavigateToTab={onNavigateToTab}
        />
      )}
    </div>
  );
};
