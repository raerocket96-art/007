import React, { useState, useEffect, useRef } from "react";
import { 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  HardDrive, 
  Clock, 
  Lock, 
  CheckCircle2, 
  Radio, 
  Shield,
  Sparkles
} from "lucide-react";
import { 
  subscribeToDataSync, 
  getLastDataSyncInfo, 
  triggerManualDataSync, 
  DataSyncPayload,
  ACTIVE_MISSION_STORAGE_KEY
} from "../utils/dataSync";
import { soundManager } from "../utils/sound";

interface FooterProps {
  clearanceLevel?: number;
  activeTab?: string;
  isRedactedMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  clearanceLevel = 9,
  activeTab = "command",
  isRedactedMode = false
}) => {
  const [syncInfo, setSyncInfo] = useState<DataSyncPayload>(() => getLastDataSyncInfo());
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [flashCount, setFlashCount] = useState<number>(0);
  const [currentTimeZulu, setCurrentTimeZulu] = useState<string>("");
  const flashTimerRef = useRef<number | null>(null);

  // Keep clock updated for ZULU timestamps
  useEffect(() => {
    const updateZulu = () => {
      const now = new Date();
      setCurrentTimeZulu(now.toISOString().slice(11, 19) + " Z");
    };
    updateZulu();
    const interval = setInterval(updateZulu, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to mission state auto-save events
  useEffect(() => {
    const unsubscribe = subscribeToDataSync((payload) => {
      setSyncInfo(payload);
      setIsFlashing(true);
      setFlashCount((prev) => prev + 1);

      if (flashTimerRef.current) {
        window.clearTimeout(flashTimerRef.current);
      }

      flashTimerRef.current = window.setTimeout(() => {
        setIsFlashing(false);
      }, 2400);
    });

    return () => {
      unsubscribe();
      if (flashTimerRef.current) {
        window.clearTimeout(flashTimerRef.current);
      }
    };
  }, []);

  const handleManualSyncTest = () => {
    soundManager.playClick();
    triggerManualDataSync();
  };

  const formattedSyncTime = new Date(syncInfo.timestamp).toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }) + " ZULU";

  return (
    <footer 
      id="app-footer" 
      className="border-t border-stone-800 bg-[#14161b]/95 backdrop-blur-md text-stone-400 py-3.5 px-4 sm:px-6 lg:px-8 mt-12 transition-colors relative z-20 print:hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs">
        
        {/* Left: SIS Station Telemetry & Classification */}
        <div className="flex items-center space-x-3 order-2 md:order-1">
          <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-500 shrink-0 shadow-inner">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-stone-200 font-bold uppercase tracking-wider text-[11px]">
                MI6 ARCHIVAL NETWORK
              </span>
              <span className="text-[10px] bg-red-950/80 border border-red-800/80 text-red-400 px-1.5 py-0.2 rounded font-bold">
                TOP SECRET // STRAP 1
              </span>
            </div>
            <div className="text-[10px] text-stone-400 flex items-center space-x-2">
              <span>VAUXHALL CROSS, LONDON SE1</span>
              <span>•</span>
              <span className="text-stone-400">TERM 00-{clearanceLevel}</span>
            </div>
          </div>
        </div>

        {/* Center: THE VISUAL DATA SYNC INDICATOR */}
        <div 
          id="footer-data-sync-indicator"
          className={`order-1 md:order-2 flex items-center space-x-3 px-4 py-2 rounded-xl border transition-all duration-300 ${
            isFlashing 
              ? "data-sync-flashing border-amber-400 bg-amber-950/40 text-stone-100 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.02]" 
              : "border-stone-800 bg-[#1c1e23] text-stone-300 hover:border-stone-700"
          }`}
          title="Automatic LocalStorage Mission State Synchronizer"
        >
          {/* Flashing Status LED Beacon */}
          <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
            {isFlashing ? (
              <>
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]" />
            )}
          </div>

          {/* Sync Animated Icon */}
          <div className="shrink-0">
            {isFlashing ? (
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <HardDrive className="w-4 h-4 text-emerald-400" />
            )}
          </div>

          {/* Label and Dynamic State Content */}
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[11px] tracking-wider text-stone-100 uppercase">
                DATA SYNC
              </span>

              {isFlashing ? (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/60 text-amber-300 font-bold text-[10px] animate-pulse flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>SAVED TO LOCALSTORAGE</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded bg-stone-800/90 border border-stone-700 text-stone-400 text-[10px]">
                  LOCAL SYNC ACTIVE
                </span>
              )}
            </div>

            {/* Subtext with Mission Title or Status & Zulu Timestamp */}
            <div className="text-[10px] text-stone-400 flex items-center space-x-1.5 mt-0.5">
              {syncInfo.missionTitle ? (
                <span className="text-amber-400/90 font-medium truncate max-w-[210px] sm:max-w-[280px]">
                  {syncInfo.missionTitle} {syncInfo.turn ? `(Turn ${syncInfo.turn})` : ""}
                </span>
              ) : (
                <span className="text-stone-400">MISSION VAULT PERSISTENCE</span>
              )}
              <span>•</span>
              <span className="text-stone-400 font-mono text-[9.5px]">
                {formattedSyncTime}
              </span>
            </div>
          </div>

          {/* Manual Trigger Test Button */}
          <button
            onClick={handleManualSyncTest}
            title="Trigger manual data sync save & test indicator flash"
            className="ml-2 p-1.5 rounded-lg border border-stone-700/80 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Security & Storage Infrastructure Badges */}
        <div className="flex items-center space-x-4 text-[10px] text-stone-400 order-3">
          <div className="hidden sm:flex items-center space-x-1.5 bg-stone-900/80 border border-stone-800 px-2.5 py-1 rounded-lg">
            <Lock className="w-3 h-3 text-amber-500" />
            <span>STORAGE: LOCAL AES-256</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-stone-300">ZULU: {currentTimeZulu || "SYNCING..."}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
