import React, { useState, useEffect } from "react";
import { MI6DatabaseStore } from "../data";
import { ArchiveAdmin } from "./ArchiveAdmin";
import { Wrench, Settings2, ShieldCheck, NotebookTabs, Download, Upload, RefreshCw, ChevronRight, User } from "lucide-react";
import { soundManager } from "../utils/sound";
import { ThemeSettings } from "./ThemeSettings";
import { AgentProfileEditor } from "./AgentProfileEditor";
import { PersonnelRecord, AgentOperative } from "../types";

export type SystemSubTab = "settings" | "admin";

interface SystemHubProps {
  store: MI6DatabaseStore;
  initialSubTab?: SystemSubTab;
  onUpdateStore: (newStore: MI6DatabaseStore) => void;
  clearanceLevel: number;
  onClearanceChange: (lvl: number) => void;
  onNavigateToTab: (tab: string) => void;
  onSaveAgentProfile?: (agent: AgentOperative, personnelRecord?: PersonnelRecord) => void;
}

export const SystemHub: React.FC<SystemHubProps> = ({
  store,
  initialSubTab = "settings",
  onUpdateStore,
  clearanceLevel,
  onClearanceChange,
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SystemSubTab>(initialSubTab);

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
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black">
                  SYSTEM ARCHIVES & WORKSPACE CONFIGURATION
                </span>
                <span className="bg-[#1e232b] text-stone-300 border border-white/10 text-[9px] px-2 py-0.5 rounded font-bold">
                  CENTRAL VAULT
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight mt-1">
                System Workspace & Registry Administration
              </h1>
            </div>
          </div>
        </div>

        {/* Sub-tab Navigation Pill Strip */}
        <div className="mt-5 pt-4 border-t border-white/8 flex overflow-x-auto no-scrollbar gap-2">
          {[
            { id: "settings", label: "WORKSPACE SETTINGS & VAULT", icon: Settings2 },
            { id: "admin", label: "ARCHIVE ADMIN & AI SYNTHESIS", icon: Wrench },
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
                    ? "bg-amber-500 text-black shadow-md font-black"
                    : "bg-white/[0.03] text-stone-400 hover:bg-white/[0.07] hover:text-stone-100 border border-white/6"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-black" : "text-amber-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-views */}
      {activeSubTab === "settings" && (
        <div className="space-y-5">
          {/* Agent Profile Creator & Commissioning Section */}
          <AgentProfileEditor
            store={store}
            onSaveProfile={(updatedAgent, personnelRecord) => {
              if (onSaveAgentProfile) onSaveAgentProfile(updatedAgent, personnelRecord);
            }}
          />

          <ThemeSettings />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="mi6-swap-panel rounded-[24px] p-5 space-y-3">
              <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs">
                <Settings2 className="w-4 h-4 text-amber-400" />
                <span>MISSION SIMULATOR CONTROLS</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Configure live tactical HUD preferences, AI latency timeouts, typewriter speeds, and stage indicators.
              </p>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigateToTab("simulator");
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
              >
                OPEN SIMULATOR SETTINGS
              </button>
            </div>

            <div className="mi6-swap-panel rounded-[24px] p-5 space-y-3">
              <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs">
                <NotebookTabs className="w-4 h-4 text-sky-400" />
                <span>SAVE VAULT & EXPORT</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Review checkpoint snapshots, export complete encrypted archives, or restore previous simulation backups.
              </p>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigateToTab("operations");
                }}
                className="w-full py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold transition-colors"
              >
                BROWSE SAVED RUNS
              </button>
            </div>

            <div className="mi6-swap-panel rounded-[24px] p-5 space-y-3">
              <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ACTIVE OPERATIVE CLEARANCE</span>
              </div>
              <div className="text-xl font-black text-emerald-400">LEVEL {clearanceLevel}</div>
              <p className="text-[11px] text-stone-400">
                00-Section discretionary clearance authorized under the Official Secrets Act.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "admin" && (
        <ArchiveAdmin
          store={store}
          onUpdateStore={onUpdateStore}
          clearanceLevel={clearanceLevel}
          onClearanceChange={onClearanceChange}
        />
      )}
    </div>
  );
};
