import React, { useEffect, useState } from "react";
import { Lock, Printer, Radio, Search, Volume2, VolumeX } from "lucide-react";
import { soundManager } from "../utils/sound";
import { AuthSession } from "../types";

interface HeaderProps {
  clearanceLevel: number;
  onClearanceChange: (level: number) => void;
  onOpenSearch: () => void;
  onPrintCurrentView: () => void;
  threatLevel: "AMBER" | "RED" | "CRITICAL";
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCablesCount: number;
  session?: AuthSession;
  onOpenAuth?: () => void;
  onLockTerminal?: () => void;
  audioEnabled?: boolean;
  onAudioToggle?: () => void;
  onOpenSecureTerminal?: () => void;
  onOpenAgentCreator?: () => void;
}

const labels: Record<string, string> = {
  command: "Command Centre",
  simulator: "Mission Simulator",
  operations: "Operational Debrief & Archive",
  intel: "Intelligence Archives",
  bond: "007 Film Operations",
  system: "System Workspace",
  // Legacy aliases
  database: "Intelligence Archives // Dossiers",
  graph: "Intelligence Archives // Network",
  movies: "007 Film Operations // Movies",
  persona: "007 Film Operations // Persona",
  missionarchive: "Debrief & Archive // Runs",
  debriefs: "Debrief & Archive // Reports",
  compare: "Debrief & Archive // Compare",
  admin: "System Workspace // Admin",
  settings: "System Workspace // Settings",
};

export const Header: React.FC<HeaderProps> = ({
  clearanceLevel,
  onClearanceChange,
  onOpenSearch,
  onPrintCurrentView,
  activeTab,
  unreadCablesCount,
  session,
  onOpenAuth,
  onLockTerminal,
  audioEnabled,
  onAudioToggle,
  onOpenSecureTerminal,
  onOpenAgentCreator,
}) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toISOString().slice(11, 19) + " Z");
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <header className="no-print fixed inset-x-0 top-0 z-40 h-[88px] border-b border-white/[0.065] bg-[#090d12]/94 backdrop-blur-2xl shadow-[0_18px_60px_rgba(0,0,0,.28)]">
      <div className="h-7 px-4 lg:px-6 flex items-center justify-between border-b border-white/[0.055] bg-[#11161d]/70 font-mono text-[8px] sm:text-[9px] tracking-[0.18em] uppercase">
        <span className="text-stone-500">Her Majesty's Government · Secret Intelligence Service</span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:flex items-center gap-1.5 text-emerald-400/80"><Radio className="w-3 h-3" /> network synchronized</span>
          <span className="text-stone-500">{time}</span>
          <span className="text-amber-300/80">Eyes only</span>
        </div>
      </div>

      <div className="h-[60px] px-4 lg:px-6 flex items-center gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-9 w-9 rounded-xl border border-amber-300/20 bg-amber-300/[0.07] text-amber-300 flex items-center justify-center font-black text-xs tracking-tighter">MI6</div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.18em] font-mono text-stone-600">Classified Operations Archive</div>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-[15px] font-semibold text-stone-100 truncate">{labels[activeTab] || "Secure Workspace"}</h1>
              {activeTab === "simulator" && <span className="text-[8px] font-mono rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-400 px-2 py-0.5">LIVE OPS</span>}
            </div>
          </div>
        </div>

        <button
          onClick={() => { soundManager.playClick(); onOpenSearch(); }}
          className="hidden md:flex items-center gap-2 h-9 min-w-[190px] px-3 rounded-xl border border-white/[0.07] bg-white/[0.025] text-stone-500 hover:text-stone-300 hover:border-white/[0.12] transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-[11px]">Search archive</span>
          <kbd className="ml-auto text-[9px] font-mono text-stone-600">⌘K</kbd>
        </button>

        <div className="hidden xl:flex items-center gap-2 h-9 px-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
          <Lock className="w-3 h-3 text-amber-400" />
          <select
            value={clearanceLevel}
            onChange={(e) => onClearanceChange(Number(e.target.value))}
            className="bg-transparent text-[10px] font-mono text-stone-400 focus:outline-none cursor-pointer"
          >
            {[5,6,7,8,9,10].map((lvl) => <option key={lvl} value={lvl} className="bg-[#11161d]">LVL {lvl}</option>)}
          </select>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            if (onOpenSecureTerminal) onOpenSecureTerminal();
          }}
          title="Secure Encrypted Messages"
          className="relative h-9 px-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 text-xs font-mono font-bold"
        >
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden md:inline">MESSAGES</span>
          {unreadCablesCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center animate-pulse">
              {unreadCablesCount}
            </span>
          )}
        </button>

        <button onClick={onAudioToggle} title="Toggle sound" className="h-9 w-9 rounded-xl border border-white/[0.07] bg-white/[0.02] text-stone-500 hover:text-amber-300 transition-colors flex items-center justify-center">
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
        <button onClick={() => { soundManager.playPaperRustle(); onPrintCurrentView(); }} title="Print dossier" className="hidden sm:flex h-9 w-9 rounded-xl border border-white/[0.07] bg-white/[0.02] text-stone-500 hover:text-amber-300 transition-colors items-center justify-center">
          <Printer className="w-4 h-4" />
        </button>

        {session && (
          <div className="flex items-center gap-2 pl-1">
            <button 
              onClick={() => {
                soundManager.playClick();
                if (onOpenAgentCreator) onOpenAgentCreator();
                else if (onOpenAuth) onOpenAuth();
              }} 
              title="Edit Operative Profile & Commissioning"
              className="flex items-center gap-2 h-10 px-2 rounded-xl hover:bg-white/[0.035] transition-colors"
            >
              <img src={session.agent.avatarUrl} alt={session.agent.callsign} referrerPolicy="no-referrer" className="w-8 h-8 rounded-lg object-cover grayscale border border-white/[0.12]" />
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-[11px] font-semibold text-stone-200">{session.agent.callsign}</div>
                <div className="text-[8px] font-mono uppercase tracking-wider text-stone-600">{session.agent.role}</div>
              </div>
            </button>
            <button onClick={() => { soundManager.playAlarm(); onLockTerminal?.(); }} title="Lock terminal" className="h-9 w-9 rounded-xl border border-red-500/15 bg-red-500/[0.035] text-red-400/70 hover:text-red-300 hover:border-red-500/30 flex items-center justify-center transition-colors">
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
