import React, { useState, useEffect } from "react";
import { MI6DatabaseStore } from "../data";
import { DatabaseRecord } from "../types";
import { DatabaseBrowser } from "./DatabaseBrowser";
import { IntelligenceGraph } from "./IntelligenceGraph";
import { Network, Shield, FileText, ChevronRight } from "lucide-react";
import { soundManager } from "../utils/sound";

export type IntelligenceSubTab = "dossiers" | "network";

interface IntelligenceHubProps {
  store: MI6DatabaseStore;
  initialSubTab?: IntelligenceSubTab;
  onSelectRecord: (record: DatabaseRecord) => void;
  onOpenRecordId: (recordId: string) => void;
  clearanceLevel: number;
}

export const IntelligenceHub: React.FC<IntelligenceHubProps> = ({
  store,
  initialSubTab = "dossiers",
  onSelectRecord,
  onOpenRecordId,
  clearanceLevel,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<IntelligenceSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const totalDossiers =
    store.personnel.length +
    store.operations.length +
    store.equipment.length +
    store.vehicles.length +
    store.locations.length +
    store.organizations.length +
    store.assets.length;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Hub Hero Banner */}
      <div className="mi6-swap-panel rounded-[28px] p-5 sm:p-6 shadow-[0_26px_70px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/35 flex items-center justify-center text-sky-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-sky-400 uppercase tracking-widest font-black">
                  CENTRAL INTELLIGENCE REPOSITORY
                </span>
                <span className="bg-[#1e232b] text-stone-300 border border-white/10 text-[9px] px-2 py-0.5 rounded font-bold">
                  LEVEL {clearanceLevel} ACCESSIBLE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight mt-1">
                Intelligence Archives & Relational Network
              </h1>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl block">
              {totalDossiers} CLASSIFIED DOSSIERS
            </span>
          </div>
        </div>

        {/* Sub-tab Navigation Pill Strip */}
        <div className="mt-5 pt-4 border-t border-white/8 flex overflow-x-auto no-scrollbar gap-2">
          {[
            { id: "dossiers", label: "DOSSIER ARCHIVE (7 CATEGORIES)", icon: FileText, count: totalDossiers },
            { id: "network", label: "INTEL RELATIONS GRAPH (D3 / SVG)", icon: Network },
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
                    ? "bg-sky-500 text-black shadow-md font-black"
                    : "bg-white/[0.03] text-stone-400 hover:bg-white/[0.07] hover:text-stone-100 border border-white/6"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-black" : "text-sky-400"}`} />
                <span>{tab.label}</span>
                {tab.count && (
                  <span
                    className={`ml-1 text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                      active ? "bg-black text-sky-400" : "bg-white/10 text-stone-300"
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
      {activeSubTab === "dossiers" && (
        <DatabaseBrowser
          store={store}
          onSelectRecord={onSelectRecord}
          clearanceLevel={clearanceLevel}
        />
      )}

      {activeSubTab === "network" && (
        <IntelligenceGraph
          store={store}
          onOpenRecord={onOpenRecordId}
        />
      )}
    </div>
  );
};
