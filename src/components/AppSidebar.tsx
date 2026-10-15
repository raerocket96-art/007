import React from "react";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Film,
  Network,
  Radar,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Wrench,
} from "lucide-react";
import { soundManager } from "../utils/sound";
import { AuthSession } from "../types";

export interface MasterHubItem {
  id: string;
  label: string;
  subtitle: string;
  icon: any;
  live?: boolean;
  legacyKeys: string[];
}

export const MASTER_HUBS: MasterHubItem[] = [
  {
    id: "command",
    label: "Command Centre",
    subtitle: "Overview & live dispatch",
    icon: TerminalSquare,
    legacyKeys: ["command"],
  },
  {
    id: "simulator",
    label: "Mission Simulator",
    subtitle: "Active 007 operations",
    icon: Radar,
    live: true,
    legacyKeys: ["simulator", "qbranch"],
  },
  {
    id: "operations",
    label: "Debrief & Archive",
    subtitle: "Runs, debriefs, DNA & compare",
    icon: Archive,
    legacyKeys: ["operations", "missionarchive", "debriefs", "compare", "decisions", "dna", "history"],
  },
  {
    id: "intel",
    label: "Intelligence Archives",
    subtitle: "Dossiers & relational network",
    icon: Network,
    legacyKeys: ["intel", "database", "graph"],
  },
  {
    id: "bond",
    label: "007 Film Operations",
    subtitle: "25 movies & Bond persona",
    icon: Film,
    legacyKeys: ["bond", "movies", "persona"],
  },
  {
    id: "system",
    label: "System Workspace",
    subtitle: "Settings & archive admin",
    icon: Wrench,
    legacyKeys: ["system", "settings", "admin"],
  },
];

interface AppSidebarProps {
  activeHub: string;
  onSelectHub: (hubId: string) => void;
  unreadCablesCount: number;
  session?: AuthSession;
  collapsed: boolean;
  onToggle: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeHub,
  onSelectHub,
  unreadCablesCount,
  session,
  collapsed,
  onToggle,
}) => {
  const isAllowed = (hub: MasterHubItem) => {
    const allowed = session?.agent?.allowedTabs;
    if (!allowed || allowed.length === 0) return true;
    return hub.legacyKeys.some((k) => allowed.includes(k));
  };

  return (
    <aside
      className={`no-print fixed left-0 top-[88px] bottom-0 z-30 hidden lg:flex flex-col border-r border-white/[0.06] bg-[#0b0f14]/96 backdrop-blur-2xl transition-all duration-300 ${
        collapsed ? "w-[84px]" : "w-[280px]"
      }`}
    >
      {/* Sidebar Header */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-stone-500 font-mono">
                OPERATIONAL WORKSPACE
              </div>
              <div className="mt-1 text-sm font-black text-stone-100 font-mono tracking-tight">
                MI6 // 00 SECTION
              </div>
            </div>
          )}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggle();
            }}
            className="h-9 w-9 rounded-xl border border-white/[0.08] bg-white/[0.03] text-stone-400 hover:text-amber-300 hover:border-amber-400/30 transition-colors flex items-center justify-center"
            title={collapsed ? "Expand navigation" : "Collapse navigation"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 6 Master Hubs Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono">
        {MASTER_HUBS.map((hub) => {
          const Icon = hub.icon;
          const active = activeHub === hub.id;
          const allowed = isAllowed(hub);

          return (
            <button
              key={hub.id}
              onClick={() => {
                if (!allowed) return;
                soundManager.playClick();
                onSelectHub(hub.id);
              }}
              disabled={!allowed}
              title={collapsed ? hub.label : undefined}
              className={`group relative w-full flex items-center rounded-2xl border transition-all duration-200 ${
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-3.5 py-3"
              } ${
                active
                  ? "bg-amber-400/[0.09] border-amber-300/30 text-amber-100 shadow-[inset_3px_0_0_rgba(251,191,36,.8)]"
                  : allowed
                  ? "border-transparent text-stone-400 hover:text-stone-100 hover:bg-white/[0.035] hover:border-white/[0.055]"
                  : "border-transparent text-stone-700 cursor-not-allowed"
              }`}
            >
              <div
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  active
                    ? "bg-amber-300/15 text-amber-300 border border-amber-400/30"
                    : "bg-white/[0.025] text-stone-500 group-hover:text-stone-300"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {hub.id === "command" && unreadCablesCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-[8px] leading-4 font-black text-black">
                    {unreadCablesCount > 9 ? "9+" : unreadCablesCount}
                  </span>
                )}
                {hub.live && (
                  <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b0f14] animate-pulse" />
                )}
              </div>

              {!collapsed && (
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] font-bold truncate ${active ? "text-amber-100" : ""}`}>
                      {hub.label}
                    </span>
                    {hub.live && (
                      <span className="text-[8px] font-mono tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5 truncate">{hub.subtitle}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer: Session Status */}
      <div className="p-3 border-t border-white/[0.06] font-mono">
        <div
          className={`rounded-2xl border border-white/[0.07] bg-white/[0.025] ${
            collapsed ? "p-2 flex justify-center" : "p-3"
          }`}
        >
          {collapsed ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          ) : (
            <>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                SECURE SESSION
              </div>
              <div className="mt-1.5 text-[11px] text-stone-200 font-bold truncate">
                {session?.agent?.callsign || "Commander Bond (007)"} • LVL {session?.agent?.clearanceLevel || 9}
              </div>
              <div className="mt-0.5 text-[9px] text-stone-500">AES-256 ENCRYPTION ACTIVE</div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
