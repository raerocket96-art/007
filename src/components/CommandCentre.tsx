import React, { useState, useMemo } from "react";
import { 
  MI6DatabaseStore 
} from "../data";
import { 
  Shield, 
  AlertTriangle, 
  Terminal, 
  Play, 
  ChevronRight, 
  Activity, 
  Film, 
  Sparkles,
  Award,
  Zap,
  Flame,
  UserCheck,
  Radio,
  Lock,
  Unlock,
  Plus,
  Send,
  CheckCircle2,
  ExternalLink,
  UserPlus
} from "lucide-react";
import { soundManager } from "../utils/sound";
import { BondRadio } from "./BondRadio";
import { OperativeSuccessChart } from "./OperativeSuccessChart";
import { bondFilmMissionTemplates } from "../data/bondFilmMissions";
import { BOND_DOCTRINES } from "../data/bondDoctrines";

interface CommandCentreProps {
  store: MI6DatabaseStore;
  onOpenRecord: (recordId: string) => void;
  onNavigateToTab: (tab: string) => void;
  onStartMission: (templateId?: string) => void;
  onAcknowledgeCable?: (cableId: string) => void;
  onOpenSecureTerminal?: (cableId?: string) => void;
  onOpenAgentCreator?: () => void;
}

export const CommandCentre: React.FC<CommandCentreProps> = ({
  store,
  onOpenRecord,
  onNavigateToTab,
  onStartMission,
  onAcknowledgeCable,
  onOpenSecureTerminal,
  onOpenAgentCreator
}) => {
  const [selectedFilmMissionId, setSelectedFilmMissionId] = useState<string>(
    bondFilmMissionTemplates[0]?.id || "film-dr-no"
  );
  const [messageFilter, setMessageFilter] = useState<"ALL" | "M" | "Q_BRANCH" | "FIELD_CONTROL">("ALL");
  const [decryptedTeaserIds, setDecryptedTeaserIds] = useState<string[]>([]);

  const selectedFilmMission = bondFilmMissionTemplates.find(m => m.id === selectedFilmMissionId) || bondFilmMissionTemplates[0];

  const activeAgents = store.personnel.filter(p => p.currentStatus === "ACTIVE");
  const unreadCables = store.cables.filter(c => !c.acknowledged);

  const filteredCables = store.cables.filter(c => {
    if (messageFilter === "M") return c.senderCategory === "M" || c.originStation.includes("M (");
    if (messageFilter === "Q_BRANCH") return c.senderCategory === "Q_BRANCH" || c.originStation.includes("Q-BRANCH");
    if (messageFilter === "FIELD_CONTROL") return c.senderCategory === "FIELD_CONTROL" || c.originStation.includes("STATION");
    return true;
  });

  const toggleTeaserDecrypt = (id: string) => {
    soundManager.playTeletype();
    if (decryptedTeaserIds.includes(id)) {
      setDecryptedTeaserIds(decryptedTeaserIds.filter(x => x !== id));
    } else {
      setDecryptedTeaserIds([...decryptedTeaserIds, id]);
    }
  };

  const completedRunsCount = useMemo(() => {
    try {
      const raw = localStorage.getItem("mi6_completed_run_archive_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch {}
    return 0;
  }, []);

  return (
    <div className="space-y-6 mi6-swap-grid rounded-[30px] p-1 font-mono">
      {/* Top Banner Alert / Crisis Header */}
      <div className="mi6-swap-panel rounded-[28px] p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
                  00-SECTION CENTRAL DISPATCH // LIVE MISSION SIMULATOR
                </span>
                <span className="bg-red-600 text-white font-mono text-[10px] px-2 py-0.2 rounded font-bold uppercase animate-pulse">
                  OPERATIONAL
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight mt-0.5">
                James Bond Mission Simulator Command Centre
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onStartMission(selectedFilmMissionId);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-2 shadow-md transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>LAUNCH SIMULATOR</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onNavigateToTab("movies");
              }}
              className="bg-white/[0.04] hover:bg-white/[0.08] text-stone-200 border border-white/12 font-mono text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              FILM DIRECTORY
            </button>
          </div>
        </div>
      </div>
      
      {/* Primary game entry: choose a Bond film first */}
      <section className="mi6-swap-panel rounded-[28px] p-5 shadow-xl border border-amber-500/20">
        <div className="flex flex-col xl:flex-row xl:items-end gap-4">
          <div className="flex-1">
            <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-amber-400 font-black">00-SECTION // FILM OPERATION SELECTOR</div>
            <h3 className="mt-1 text-2xl font-black text-stone-100">Choose the James Bond film to simulate</h3>
            <p className="mt-1 text-[11px] text-stone-400 max-w-3xl">
              Select an operation from the complete 25-film James Bond archive. The simulator places 007 at that film's authentic opening operational situation for direct insertion.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 xl:min-w-[620px]">
            <select
              value={selectedFilmMissionId}
              onChange={(e) => setSelectedFilmMissionId(e.target.value)}
              className="flex-1 bg-[#0f1319] border border-white/12 text-stone-100 px-3 py-3 rounded-xl focus:outline-none focus:border-amber-500 text-[11px] font-mono"
            >
              <optgroup label="EON JAMES BOND FILMS (25)">
                {bondFilmMissionTemplates.filter(m => !m.codename.startsWith("LEGACY")).map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </optgroup>
              <optgroup label="LEGACY / NON-EON">
                {bondFilmMissionTemplates.filter(m => m.codename.startsWith("LEGACY")).map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </optgroup>
            </select>
            <button
              onClick={() => {
                soundManager.playAccessGranted();
                onStartMission(selectedFilmMissionId);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-black px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              START MISSION
            </button>
          </div>
        </div>
        {selectedFilmMission && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-3">
            <div className="rounded-xl border border-white/8 bg-black/20 p-3">
              <div className="text-[8px] font-mono uppercase tracking-[0.16em] text-stone-600">Mission brief</div>
              <div className="mt-1 text-[11px] text-stone-200 font-semibold">{selectedFilmMission.objective}</div>
            </div>
            <div className="rounded-xl border border-white/8 bg-black/20 p-3">
              <div className="text-[8px] font-mono uppercase tracking-[0.16em] text-stone-600">Insertion / original-film starting situation</div>
              <div className="mt-1 text-[10px] leading-relaxed text-stone-400">{selectedFilmMission.initialSituation}</div>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/8 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigateToTab("movies");
            }}
            className="flex items-center space-x-2 text-stone-300 hover:text-amber-400 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>BROWSE ALL 25 BOND MOVIES DIRECTORY</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onNavigateToTab("persona");
            }}
            className="flex items-center space-x-2 text-stone-300 hover:text-amber-400 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>DISCOVER WHICH BOND YOU FEEL MOST LIKE</span>
          </button>
        </div>
      </section>

      {/* Bond Radio & Themes Section */}
      <div className="flex justify-center my-6">
        <BondRadio />
      </div>

      {/* Simulator Primary Key Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="mi6-swap-panel-soft p-4 rounded-xl">
          <div className="text-stone-400 text-xs flex justify-between items-center">
            <span>CANONICAL MISSIONS</span>
            <Film className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-stone-100 mt-1">25</div>
          <div className="text-[10px] text-amber-400 mt-0.5">EON Archive 1962–2021</div>
        </div>

        <div className="mi6-swap-panel-soft p-4 rounded-xl">
          <div className="text-stone-400 text-xs flex justify-between items-center">
            <span>BOND DOCTRINES</span>
            <UserCheck className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-violet-300 mt-1">{BOND_DOCTRINES.length}</div>
          <div className="text-[10px] text-stone-400 mt-0.5">Connery to Craig Eras</div>
        </div>

        <div className="mi6-swap-panel-soft p-4 rounded-xl">
          <div className="text-stone-400 text-xs flex justify-between items-center">
            <span>ACTIVE 00-OPERATIVES</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{activeAgents.length}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Double-O Status Verified</div>
        </div>

        <div className="mi6-swap-panel-soft p-4 rounded-xl">
          <div className="text-stone-400 text-xs flex justify-between items-center">
            <span>COMPLETED SIMULATIONS</span>
            <Award className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 mt-1">
            {completedRunsCount}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">Live Debriefs Evaluated</div>
        </div>
      </div>

      {/* Secure Encrypted Messages Console Widget */}
      <div className="mi6-swap-panel rounded-[24px] p-5 font-mono">
        <div className="flex flex-wrap items-center justify-between border-b border-white/8 pb-3 mb-4 gap-3">
          <div className="flex items-center space-x-2.5">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
              SECURE ENCRYPTED DISPATCHES & CABLE CONSOLE
            </h3>
            {unreadCables.length > 0 && (
              <span className="bg-red-950 text-red-300 border border-red-700 font-bold text-[9px] px-2 py-0.5 rounded-full animate-pulse">
                {unreadCables.length} UNREAD CABLES
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                soundManager.playClick();
                if (onOpenSecureTerminal) onOpenSecureTerminal();
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5 shadow transition-transform hover:scale-105"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>OPEN SECURE MESSAGE TERMINAL</span>
            </button>
          </div>
        </div>

        {/* Console Sender Filter Tabs */}
        <div className="flex items-center space-x-1 mb-3 text-[10px] font-bold">
          {[
            { id: "ALL", label: "ALL DISPATCHES" },
            { id: "M", label: "M (CHIEF)" },
            { id: "Q_BRANCH", label: "Q BRANCH" },
            { id: "FIELD_CONTROL", label: "FIELD CONTROL / STATION V" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setMessageFilter(tab.id as any);
              }}
              className={`px-3 py-1 rounded-lg border transition-colors ${
                messageFilter === tab.id
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-white/5 border-white/8 text-stone-400 hover:text-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cable Teaser Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCables.slice(0, 3).map((cable) => {
            const isDecryptedTeaser = decryptedTeaserIds.includes(cable.id) || !cable.isEncrypted;
            return (
              <div
                key={cable.id}
                className="bg-[#12151a] border border-white/10 hover:border-amber-500/50 p-3.5 rounded-xl space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className={`font-bold px-1.5 py-0.2 rounded border ${
                      cable.senderCategory === "M" ? "border-red-600/70 bg-red-950/40 text-red-300" :
                      cable.senderCategory === "Q_BRANCH" ? "border-amber-600/70 bg-amber-950/40 text-amber-300" :
                      "border-emerald-600/70 bg-emerald-950/40 text-emerald-300"
                    }`}>
                      {cable.originStation}
                    </span>
                    <span className="text-stone-500">{cable.timestamp.substring(0, 10)}</span>
                  </div>

                  <div className="font-bold text-stone-100 text-xs mt-2 line-clamp-1">
                    {cable.subject}
                  </div>

                  <div className="mt-2 bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono text-[10px] text-stone-300 min-h-[50px]">
                    {isDecryptedTeaser ? (
                      <p className="line-clamp-2 text-stone-200">{cable.content}</p>
                    ) : (
                      <div className="text-amber-400/90 font-mono tracking-widest break-all">
                        {cable.cipherText || "ENCRYPTED-AES256-GCHQ-CIPHER-BLOCK"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[9px]">
                  {cable.isEncrypted && !isDecryptedTeaser ? (
                    <button
                      onClick={() => toggleTeaserDecrypt(cable.id)}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
                    >
                      <Unlock className="w-3 h-3" />
                      <span>DECRYPT CIPHER</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PLAINTEXT VERIFIED
                    </span>
                  )}

                  <button
                    onClick={() => {
                      soundManager.playClick();
                      if (onOpenSecureTerminal) onOpenSecureTerminal(cable.id);
                    }}
                    className="text-stone-400 hover:text-stone-100 font-bold flex items-center space-x-1"
                  >
                    <span>VIEW DISPATCH</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* D3 Historical Mission Success & Operative Telemetry Line Chart (All 25 Bond Films + Player Sessions) */}
      <OperativeSuccessChart onOpenRecord={onOpenRecord} onStartMission={onStartMission} />

      {/* 00-Section & Command Personnel Status */}
      <div className="mi6-swap-panel rounded-[24px] p-5">
        <div className="flex items-center justify-between border-b border-white/8 pb-3 mb-4 flex-wrap gap-2">
          <div className="flex items-center space-x-2 font-mono">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-stone-200 uppercase tracking-wider">
              00-SECTION & COMMAND PERSONNEL STATUS
            </h3>
          </div>

          <div className="flex items-center space-x-3">
            {onOpenAgentCreator && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenAgentCreator();
                }}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow transition-transform hover:scale-105"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>COMMISSION NEW OPERATIVE</span>
              </button>
            )}

            <button
              onClick={() => onNavigateToTab("database")}
              className="text-xs font-mono text-amber-400 hover:underline flex items-center space-x-1"
            >
              <span>ALL PERSONNEL ({store.personnel.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {store.personnel.slice(0, 6).map((agent) => (
            <div
              key={agent.id}
              onClick={() => {
                soundManager.playPaperRustle();
                onOpenRecord(agent.id);
              }}
              className="bg-[#1c1e23] hover:bg-[#202329] border border-white/10/80 hover:border-amber-500/60 p-3.5 rounded-xl cursor-pointer transition-all flex items-start space-x-3 group"
            >
              <div className="w-12 h-14 bg-stone-900 rounded border border-white/10 overflow-hidden shrink-0 relative">
                {agent.imageUrl ? (
                  <img
                    src={agent.imageUrl}
                    alt={agent.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-600 font-mono text-xs">
                    ID
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-500 font-bold uppercase">{agent.referenceNumber}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                    agent.currentStatus === "ACTIVE" ? "bg-emerald-900/60 text-emerald-300" :
                    agent.currentStatus === "KIA" ? "bg-stone-800 text-stone-400" : "bg-red-900/60 text-red-300"
                  }`}>
                    {agent.currentStatus}
                  </span>
                </div>
                <div className="font-bold text-stone-100 text-xs truncate mt-0.5">
                  {agent.alias || agent.name}
                </div>
                <div className="text-[10px] text-stone-400 truncate">{agent.role}</div>
                <div className="mt-1 flex items-center space-x-2 text-[9px] text-stone-500">
                  <span>RELIABILITY: {agent.reliabilityRating}%</span>
                  <span>•</span>
                  <span>REQ LVL {agent.clearanceRequired}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
