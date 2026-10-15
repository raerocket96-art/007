import React, { useState, useEffect } from "react";
import { IntelligenceAlert } from "../types";
import { INITIAL_INTELLIGENCE_ALERTS, CRISIS_TEMPLATES } from "../data/intelligenceFeed";
import { soundManager } from "../utils/sound";
import { toastManager } from "../utils/toast";
import { 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  Pin, 
  Play, 
  Pause, 
  Zap, 
  ExternalLink, 
  Filter, 
  ChevronRight, 
  Clock, 
  ShieldAlert,
  Search,
  Check
} from "lucide-react";

interface IntelligenceFeedProps {
  onOpenRecord: (recordId: string) => void;
  onAlertTriggered?: (alert: IntelligenceAlert) => void;
}

export const IntelligenceFeed: React.FC<IntelligenceFeedProps> = ({
  onOpenRecord,
  onAlertTriggered
}) => {
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>(() => {
    try {
      const saved = localStorage.getItem("mi6_intel_alerts_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_INTELLIGENCE_ALERTS;
  });

  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedAlert, setSelectedAlert] = useState<IntelligenceAlert | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Persist alerts
  useEffect(() => {
    try {
      localStorage.setItem("mi6_intel_alerts_v1", JSON.stringify(alerts));
    } catch (e) {}
  }, [alerts]);

  // Periodic automatic event simulation stream
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // 30% chance every 28s to generate a random live intercept
      if (Math.random() > 0.3) {
        const randomTemplate = CRISIS_TEMPLATES[Math.floor(Math.random() * CRISIS_TEMPLATES.length)];
        const now = new Date();
        const timeStr = `${now.toISOString().slice(11, 19)} ZULU`;

        const newAlert: IntelligenceAlert = {
          ...randomTemplate,
          id: "alert-" + Date.now(),
          timestamp: timeStr,
          status: "UNREAD"
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 24)]);
        soundManager.playTeletype();
        if (onAlertTriggered) onAlertTriggered(newAlert);
      }
    }, 28000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, onAlertTriggered]);

  const handleTriggerManualCrisis = () => {
    soundManager.playAlarm();
    const template = CRISIS_TEMPLATES[Math.floor(Math.random() * CRISIS_TEMPLATES.length)];
    const now = new Date();
    const timeStr = `${now.toISOString().slice(11, 19)} ZULU`;

    const newAlert: IntelligenceAlert = {
      ...template,
      id: "alert-crisis-" + Date.now(),
      timestamp: timeStr,
      status: "UNREAD",
      severity: "CRITICAL"
    };

    setAlerts(prev => [newAlert, ...prev]);
    setSelectedAlert(newAlert);
    if (onAlertTriggered) onAlertTriggered(newAlert);
  };

  const handleAcknowledge = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playClick();
    const targetAlert = alerts.find(a => a.id === id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "ACKNOWLEDGED" } : a));
    if (selectedAlert?.id === id) {
      setSelectedAlert(prev => prev ? { ...prev, status: "ACKNOWLEDGED" } : null);
    }
    if (targetAlert) {
      toastManager.cableAcknowledged(targetAlert.title, targetAlert.id);
    }
  };

  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    soundManager.playClick();
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "PINNED" ? "UNREAD" : "PINNED" } : a));
  };

  const unreadCount = alerts.filter(a => a.status === "UNREAD").length;

  const filteredAlerts = alerts
    .filter(a => {
      if (selectedSeverity !== "ALL" && a.severity !== selectedSeverity) return false;
      if (selectedCategory !== "ALL" && a.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.sourceStation.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      // Pinned items stay at top
      if (a.status === "PINNED" && b.status !== "PINNED") return -1;
      if (b.status === "PINNED" && a.status !== "PINNED") return 1;
      return 0;
    });

  return (
    <div className="mi6-swap-panel rounded-[24px] p-5 space-y-4 font-mono text-xs">
      {/* Feed Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/80 flex items-center justify-center text-red-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-stone-100 uppercase tracking-wider">
                REAL-TIME INTELLIGENCE FEED SYSTEM
              </h3>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                isLiveStreaming ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60" : "bg-stone-800 text-stone-400"
              }`}>
                {isLiveStreaming ? "● LIVE SATELLITE FEED" : "PAUSED"}
              </span>
            </div>
            <div className="text-[10px] text-stone-400">
              CENTRAL COMMAND SURVEILLANCE // GLOBAL INTERCEPTS & LEADS
            </div>
          </div>
        </div>

        {/* Live Stream Controls & Trigger Crisis Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsLiveStreaming(!isLiveStreaming);
            }}
            title={isLiveStreaming ? "Pause Live Satellite Intercepts" : "Resume Live Satellite Intercepts"}
            className="p-2 bg-[#1c1e23] hover:bg-stone-800 border border-white/10 rounded-lg text-stone-300 transition-colors"
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={handleTriggerManualCrisis}
            className="bg-red-700 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-[11px] font-bold flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>TRIGGER GLOBAL CRISIS</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        {/* Severity Filter Chips */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-stone-500 text-[10px] uppercase mr-1 hidden sm:inline">SEVERITY:</span>
          {["ALL", "CRITICAL", "HIGH", "WARNING", "INFO"].map(sev => (
            <button
              key={sev}
              onClick={() => {
                soundManager.playClick();
                setSelectedSeverity(sev);
              }}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                selectedSeverity === sev
                  ? sev === "CRITICAL"
                    ? "bg-red-600 text-white"
                    : sev === "HIGH"
                    ? "bg-amber-600 text-white"
                    : "bg-stone-100 text-stone-900"
                  : "mi6-swap-panel-soft text-stone-400 hover:text-stone-200"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-stone-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, stations..."
            className="w-full bg-[#1c1e23] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>
      </div>

      {/* Feed List and Lead Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Alert Cards Stream (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center bg-[#1c1e23] rounded-xl border border-white/8 text-stone-500">
              NO INTELLIGENCE INTERCEPTS MATCHING CURRENT FILTERS.
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isSelected = selectedAlert?.id === alert.id;
              const isUnread = alert.status === "UNREAD";
              const isPinned = alert.status === "PINNED";

              return (
                <div
                  key={alert.id}
                  onClick={() => {
                    soundManager.playPaperRustle();
                    setSelectedAlert(alert);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#282c33] border-amber-500 shadow-md"
                      : isPinned
                      ? "bg-[#242930] border-amber-700/60"
                      : isUnread
                      ? "bg-[#1e2026] border-white/10 hover:border-stone-500"
                      : "bg-[#1a1c21] border-white/8/80 text-stone-400 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-900/80 text-red-200 border border-red-700 animate-pulse"
                          : alert.severity === "HIGH"
                          ? "bg-amber-900/80 text-amber-200 border border-amber-700"
                          : alert.severity === "WARNING"
                          ? "bg-orange-900/60 text-orange-200"
                          : "bg-stone-800 text-stone-300"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-[9px] text-stone-500 font-bold">{alert.category}</span>
                      <span className="text-[9px] text-stone-400">{alert.timestamp}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleTogglePin(alert.id, e)}
                        title={isPinned ? "Unpin Lead" : "Pin Lead to Top"}
                        className={`p-1 rounded hover:bg-stone-800 ${isPinned ? "text-amber-400" : "text-stone-500"}`}
                      >
                        <Pin className="w-3 h-3 fill-current" />
                      </button>
                      {isUnread && (
                        <button
                          onClick={(e) => handleAcknowledge(alert.id, e)}
                          title="Mark Acknowledged"
                          className="p-1 rounded text-stone-400 hover:text-emerald-400 hover:bg-stone-800"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={`font-bold text-xs leading-snug mb-1 ${isUnread ? "text-stone-100" : "text-stone-300"}`}>
                    {alert.title}
                  </div>

                  <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                    {alert.summary}
                  </p>

                  <div className="mt-2 pt-2 border-t border-white/8/80 flex items-center justify-between text-[10px] text-stone-500">
                    <span className="truncate">{alert.sourceStation}</span>
                    <span className="text-amber-400 hover:underline flex items-center space-x-0.5 shrink-0">
                      <span>INSPECT</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Lead Intel Telemetry Card (5 cols on lg) */}
        <div className="lg:col-span-5">
          {selectedAlert ? (
            <div className="mi6-swap-panel-soft rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-white/8 pb-2">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  SITUATION REPORT // LEAD DETAILS
                </span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                  selectedAlert.status === "UNREAD" ? "bg-red-950 text-red-300 border border-red-800" : "bg-emerald-950 text-emerald-300"
                }`}>
                  {selectedAlert.status}
                </span>
              </div>

              <div>
                <div className="text-[10px] text-stone-400 mb-0.5">{selectedAlert.sourceStation}</div>
                <h4 className="font-bold text-stone-100 text-sm leading-snug">
                  {selectedAlert.title}
                </h4>
                <div className="text-[10px] text-stone-500 mt-1 flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>INTERCEPTED: {selectedAlert.timestamp}</span>
                  {selectedAlert.theatre && <span>• {selectedAlert.theatre}</span>}
                </div>
              </div>

              <div className="bg-black/20 border border-white/8 p-3 rounded-lg text-xs leading-relaxed text-stone-300">
                {selectedAlert.summary}
              </div>

              {selectedAlert.actionRecommended && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg">
                  <span className="text-[10px] font-bold text-amber-400 block mb-1 uppercase">
                    RECOMMENDED OPERATIONAL DIRECTIVE:
                  </span>
                  <p className="text-stone-200 text-xs leading-relaxed">
                    {selectedAlert.actionRecommended}
                  </p>
                </div>
              )}

              {/* Cross-Referenced Dossiers */}
              {selectedAlert.relatedRecordIds && selectedAlert.relatedRecordIds.length > 0 && (
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block mb-1.5 uppercase">
                    CROSS-REFERENCED ARCHIVAL DOSSIERS:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAlert.relatedRecordIds.map(refId => (
                      <button
                        key={refId}
                        onClick={() => onOpenRecord(refId)}
                        className="bg-[#24272c] hover:bg-amber-500 hover:text-black border border-white/10 text-stone-300 text-[10px] font-bold px-2 py-1 rounded flex items-center space-x-1 transition-colors"
                      >
                        <span>{refId.toUpperCase()}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-white/8 flex items-center justify-between">
                <button
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  disabled={selectedAlert.status === "ACKNOWLEDGED"}
                  className="bg-emerald-900/50 hover:bg-emerald-800/60 border border-emerald-700/60 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedAlert.status === "ACKNOWLEDGED" ? "ACKNOWLEDGED" : "ACKNOWLEDGE LEAD"}</span>
                </button>

                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-stone-400 hover:text-stone-200 text-xs px-2 py-1"
                >
                  CLOSE
                </button>
              </div>
            </div>
          ) : (
            <div className="mi6-swap-panel-soft rounded-xl p-8 text-center text-stone-500 space-y-2">
              <Radio className="w-6 h-6 mx-auto text-stone-600 animate-pulse" />
              <div className="text-xs">SELECT ANY INTERCEPT FROM THE FEED TO INSPECT SITREP TELEMETRY</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
