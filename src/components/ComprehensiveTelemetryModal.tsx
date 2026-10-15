import React, { useState, useMemo, useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  FileSearch,
  Gauge,
  Globe2,
  HelpCircle,
  Lock,
  Radio,
  Scale,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  UserCheck,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { MissionState, MissionSceneState } from "../types";
import { BondDoctrine, BOND_DOCTRINES } from "../data/bondDoctrines";
import { calculateSuccessProbability } from "../utils/successProbability";
import { soundManager } from "../utils/sound";

interface ComprehensiveTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionState: MissionState;
  sceneState?: MissionSceneState;
  operationTitle?: string;
  activeDoctrine?: BondDoctrine;
}

export const ComprehensiveTelemetryModal: React.FC<ComprehensiveTelemetryModalProps> = ({
  isOpen,
  onClose,
  missionState,
  sceneState,
  operationTitle,
  activeDoctrine,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "operative_threat" | "mission_intel" | "political_behavior" | "persona_causal"
  >("overview");
  const [isPersonaRevealed, setIsPersonaRevealed] = useState<boolean>(false);

  // Derived telemetry metrics
  const health = Math.max(0, Math.min(100, missionState.agentHealth ?? 100));
  const cover = Math.max(0, Math.min(100, missionState.coverIntegrity ?? missionState.stealthRating ?? 80));
  const suspicion = Math.max(0, Math.min(100, missionState.suspicion ?? 15));
  const vigilance = Math.max(0, Math.min(100, missionState.alarmLevel ?? 20));
  const intelConfidence = Math.max(0, Math.min(100, missionState.intelligenceConfidence ?? 30));
  const politicalExposure = Math.max(0, Math.min(100, missionState.politicalExposure ?? 5));
  const progress = Math.max(0, Math.min(100, missionState.missionProgress ?? Math.min(95, (missionState.currentTurn || 1) * 12)));
  const collateral = Math.max(0, Math.min(100, missionState.collateralDamage ?? 0));
  const timePressure = Math.max(0, Math.min(100, missionState.timePressure ?? 20));
  const escapeReadiness = Math.max(0, Math.min(100, missionState.escapeReadiness ?? 40));

  // Calculated secondary metrics
  const fatigue = Math.max(0, Math.min(100, (missionState.currentTurn || 1) * 7 + (100 - health) * 0.3));
  const hostileAwareness = Math.max(0, Math.min(100, Math.round((suspicion * 0.6) + (vigilance * 0.4))));
  const pursuitLevel = vigilance > 70 ? "HOT PURSUIT // ACTIVE SWEEP" : vigilance > 40 ? "LOCAL SEARCH // TIGHT PERIMETER" : "ROUTINE PATROL";
  const immediateThreatSeverity = health < 30 || vigilance > 80 ? "CRITICAL" : vigilance > 50 || suspicion > 60 ? "ELEVATED" : "MODERATE";

  const missionStability = Math.max(0, Math.min(100, Math.round(100 - (vigilance * 0.3 + politicalExposure * 0.4 + (100 - health) * 0.3))));
  const diplomaticRisk = politicalExposure > 60 ? "SEVERE SOVEREIGN COMPROMISE" : politicalExposure > 30 ? "MODERATE WHITEHALL EXPOSURE" : "DENIABLE // ZERO TRACE";
  const civilianRisk = collateral > 40 ? "HIGH SENSITIVITY COLLATERAL" : "CONTAINED // MINIMAL RISK";
  const mi6Visibility = politicalExposure > 50 ? "DEEP COMPROMISE" : politicalExposure > 20 ? "ELEVATED SIGNATURE" : "GHOST PROFILE";

  // Success probability
  const successProb = useMemo(() => {
    return calculateSuccessProbability(missionState, activeDoctrine);
  }, [missionState, activeDoctrine]);

  // Action history behavior analysis
  const behaviorScores = useMemo(() => {
    const history = missionState.timeline || [];
    let stealth = 50, aggression = 40, deception = 50, diplomacy = 45, gadget = 40, risk = 50, ruthless = 45, protect = 60;
    
    history.forEach((t) => {
      const text = `${t.action} ${t.consequence}`.toLowerCase();
      if (/stealth|silent|quiet|conceal|covert|shadow|hide/.test(text)) stealth += 10;
      if (/shoot|fire|assault|force|takedown|explos|kill|ram/.test(text)) aggression += 12;
      if (/bluff|alias|fake|bribe|lie|deceive|impersonat/.test(text)) deception += 12;
      if (/talk|convince|persuad|negot|charm|diplomat|contact/.test(text)) diplomacy += 10;
      if (/q-branch|laser|watch|gadget|beacon|decoder|jammer|rebreather/.test(text)) gadget += 15;
      if (/danger|reckless|high-speed|dive|jump|detonat|gamble/.test(text)) risk += 10;
      if (/execute|cold|eliminate|kill|ruthless|no mercy/.test(text)) ruthless += 14;
      if (/protect|save|hostage|civilian|extract.*ally|shield|spare/.test(text)) protect += 14;
    });

    return {
      stealth: Math.min(100, Math.max(10, stealth)),
      aggression: Math.min(100, Math.max(10, aggression)),
      deception: Math.min(100, Math.max(10, deception)),
      diplomacy: Math.min(100, Math.max(10, diplomacy)),
      gadgetReliance: Math.min(100, Math.max(10, gadget)),
      riskTolerance: Math.min(100, Math.max(10, risk)),
      ruthlessness: Math.min(100, Math.max(10, ruthless)),
      protectiveInstinct: Math.min(100, Math.max(10, protect)),
    };
  }, [missionState.timeline]);

  // Live Bond Persona alignment breakdown
  const personaAlignment = useMemo(() => {
    const b = behaviorScores;
    // Score formulas for each actor
    const conneryScore = Math.round((b.deception * 0.35) + (b.riskTolerance * 0.3) + (b.aggression * 0.2) + (b.diplomacy * 0.15));
    const lazenbyScore = Math.round((b.protectiveInstinct * 0.4) + (b.riskTolerance * 0.35) + (b.aggression * 0.25));
    const mooreScore = Math.round((b.diplomacy * 0.4) + (b.gadgetReliance * 0.3) + (b.stealth * 0.2) + (100 - b.ruthlessness) * 0.1);
    const daltonScore = Math.round((b.aggression * 0.35) + (b.ruthlessness * 0.3) + (b.protectiveInstinct * 0.2) + (b.stealth * 0.15));
    const brosnanScore = Math.round((b.gadgetReliance * 0.35) + (b.deception * 0.25) + (b.stealth * 0.2) + (b.diplomacy * 0.2));
    const craigScore = Math.round((b.aggression * 0.4) + (b.riskTolerance * 0.3) + (b.ruthlessness * 0.2) + (100 - b.gadgetReliance) * 0.1);

    const total = conneryScore + lazenbyScore + mooreScore + daltonScore + brosnanScore + craigScore || 1;
    const toPct = (val: number) => Math.round((val / total) * 100);

    return [
      { id: "connery", name: "Sean Connery", score: conneryScore, pct: toPct(conneryScore), traits: "Charm, Deception & Pragmatic Force" },
      { id: "lazenby", name: "George Lazenby", score: lazenbyScore, pct: toPct(lazenbyScore), traits: "Emotional Courage & Total Physical Commitment" },
      { id: "moore", name: "Roger Moore", score: mooreScore, pct: toPct(mooreScore), traits: "Diplomatic Wit, Gadgetry & Non-lethal Finesse" },
      { id: "dalton", name: "Timothy Dalton", score: daltonScore, pct: toPct(daltonScore), traits: "Grim Focus, Relentless Pursuit & Loyalty" },
      { id: "brosnan", name: "Pierce Brosnan", score: brosnanScore, pct: toPct(brosnanScore), traits: "High-Tech Composure & Social Engineering" },
      { id: "craig", name: "Daniel Craig", score: craigScore, pct: toPct(craigScore), traits: "Visceral Resilience & Kinetic Improvisation" },
    ].sort((a, b) => b.score - a.score);
  }, [behaviorScores]);

  // Causal telemetry lists
  const currentScene = sceneState || missionState.sceneState;
  const activeConsequences = currentScene?.activeConsequences || [];
  const persistentConsequences = missionState.timeline?.map(t => t.consequence).filter(Boolean).slice(-6) || [];
  const unresolvedThreats = currentScene?.nearbyThreats || missionState.unresolvedConsequences || [];
  const confirmedLeads = currentScene?.discoveredIntel || missionState.intelDiscovered || [];
  const uncertainLeads = currentScene?.uncertainIntel || [];

  const branchDivergence = Math.min(100, (missionState.currentTurn || 1) * 8 + (collateral > 30 ? 25 : 0) + (behaviorScores.ruthlessness > 60 ? 20 : 0));
  const canonDivergenceLabel = branchDivergence > 60 ? "SIGNIFICANT DIVERGENCE (ALTERNATE REALITY)" : branchDivergence > 30 ? "MODERATE VARIANCE FROM CANON" : "ALIGNED WITH ORIGINAL TIMELINE";

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 font-mono overflow-y-auto animate-in fade-in duration-200" onMouseDown={onClose}>
      <div className="relative w-full max-w-5xl bg-[#0b0f14] border border-amber-500/30 rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.85)] flex flex-col max-h-[92vh] overflow-hidden" onMouseDown={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-[#12161d] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Gauge className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black">
                  SIS 00-SECTION TELEMETRY MATRIX
                </span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
                  LIVE STREAM
                </span>
              </div>
              <h2 className="text-lg font-black text-stone-100 tracking-tight">
                {operationTitle || missionState.title || "Classified Operation"} // Full Telemetry
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-[10px] text-stone-400 bg-black/30 px-3 py-1.5 rounded-xl border border-white/6">
              <span>TURN {missionState.currentTurn}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{successProb.probability}% PROB</span>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-400 hover:text-stone-100 border border-white/10 transition-colors"
              title="Close Telemetry Matrix"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="px-5 py-2.5 border-b border-white/8 bg-[#0e1218] flex overflow-x-auto no-scrollbar gap-2 shrink-0">
          {[
            { id: "overview", label: "01 OVERVIEW", icon: Activity },
            { id: "operative_threat", label: "02 OPERATIVE & THREATS", icon: ShieldAlert },
            { id: "mission_intel", label: "03 MISSION & INTEL", icon: Target },
            { id: "political_behavior", label: "04 EXPOSURE & BEHAVIOR", icon: Scale },
            { id: "persona_causal", label: "05 PERSONA & CAUSAL", icon: BrainCircuit },
          ].map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider transition-all whitespace-nowrap ${
                  active
                    ? "bg-amber-500 text-black shadow-md"
                    : "bg-white/[0.02] text-stone-400 hover:bg-white/[0.05] hover:text-stone-200 border border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Primary Vital Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <MetricCard title="HEALTH" value={`${health}%`} sub={health > 70 ? "OPTIMAL" : health > 30 ? "WOUNDED" : "CRITICAL"} color={health > 70 ? "text-emerald-400" : health > 30 ? "text-amber-400" : "text-red-400"} />
                <MetricCard title="COVER" value={`${cover}%`} sub={cover > 60 ? "DEEP COVER" : "JEOPARDIZED"} color={cover > 60 ? "text-sky-400" : "text-red-400"} />
                <MetricCard title="SUSPICION" value={`${suspicion}%`} sub={suspicion < 30 ? "LOW TRACE" : suspicion < 60 ? "ALERTED" : "HUNTED"} color={suspicion < 30 ? "text-emerald-400" : "text-amber-400"} />
                <MetricCard title="INTEL" value={`${intelConfidence}%`} sub={`${confirmedLeads.length} CONFIRMED`} color="text-amber-400" />
                <MetricCard title="EXPOSURE" value={`${politicalExposure}%`} sub={politicalExposure < 25 ? "DENIABLE" : "HIGH SIGNATURE"} color={politicalExposure < 25 ? "text-emerald-400" : "text-red-400"} />
                <MetricCard title="PROGRESS" value={`${progress}%`} sub={`TURN ${missionState.currentTurn}`} color="text-violet-400" />
              </div>

              {/* Success Probability & Stability Hero Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 to-[#12161f] border border-amber-500/20 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="space-y-1">
                  <span className="text-[9px] text-stone-500 uppercase font-black">CALCULATED SUCCESS PROBABILITY</span>
                  <div className="flex items-baseline space-x-2">
                    <span className={`text-3xl font-black ${successProb.ratingColor}`}>{successProb.probability}%</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${successProb.badgeBg}`}>{successProb.level}</span>
                  </div>
                  <div className="text-[10px] text-stone-400">Synergy with active doctrine: <span className="text-amber-300 font-bold">{successProb.synergyLabel} ({successProb.synergyScore > 0 ? `+${successProb.synergyScore}` : successProb.synergyScore})</span></div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-stone-400">MISSION STABILITY INDEX:</span>
                    <span className="font-bold text-stone-200">{missionStability}%</span>
                  </div>
                  <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${missionStability}%` }} />
                  </div>
                  <div className="text-[9px] text-stone-500">Composite metric balancing threat pressure vs. asset protection</div>
                </div>

                <div className="space-y-1 bg-black/30 p-3 rounded-xl border border-white/6">
                  <span className="text-[9px] text-stone-400 font-bold block">CURRENT OPERATIVE SITUATION</span>
                  <div className="text-[11px] text-stone-200 font-bold truncate">{currentScene?.currentLocation || "Field Position"}</div>
                  <div className="text-[10px] text-amber-400 truncate">{currentScene?.immediateObjective || "Advance primary objective"}</div>
                </div>
              </div>

              {/* Quick Summary Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#12151c] border border-white/8 space-y-3">
                  <div className="flex items-center space-x-2 text-stone-200 font-bold text-[11px] border-b border-white/6 pb-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>ACTIVE SCENE CONSEQUENCES & THREATS</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {activeConsequences.length ? activeConsequences.map((c, i) => (
                      <div key={i} className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/40 text-[10px] text-amber-200 flex items-start space-x-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{c}</span>
                      </div>
                    )) : (
                      <div className="text-stone-500 text-[10px] italic p-2">No active adverse scene consequences in force.</div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#12151c] border border-white/8 space-y-3">
                  <div className="flex items-center space-x-2 text-stone-200 font-bold text-[11px] border-b border-white/6 pb-2">
                    <FileSearch className="w-4 h-4 text-sky-400" />
                    <span>CONFIRMED INTELLIGENCE RECOVERED</span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {confirmedLeads.length ? confirmedLeads.map((intel, i) => (
                      <div key={i} className="p-2 rounded-lg bg-sky-950/20 border border-sky-900/40 text-[10px] text-sky-200 flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{intel}</span>
                      </div>
                    )) : (
                      <div className="text-stone-500 text-[10px] italic p-2">Awaiting decisive intelligence acquisition in current theatre.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPERATIVE & THREATS */}
          {activeTab === "operative_threat" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Operative Status Box */}
                <div className="p-5 rounded-2xl bg-[#12151c] border border-white/8 space-y-4">
                  <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs border-b border-white/6 pb-3">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>OPERATIVE PHYSICAL & COVERT STATUS</span>
                  </div>
                  
                  <div className="space-y-3">
                    <TelemetryBar label="HEALTH INTEGRITY" value={health} text={`${health}%`} color="bg-emerald-500" note={health < 50 ? "Sustained physical trauma / blood loss" : "Full tactical combat agility"} />
                    <TelemetryBar label="COVER PROFILE" value={cover} text={`${cover}%`} color="bg-sky-500" note={cover < 40 ? "Identity partially compromised in theatre" : "Deep cover credentials intact"} />
                    <TelemetryBar label="FATIGUE & EXERTION" value={fatigue} text={`${fatigue}%`} color="bg-amber-500" note={fatigue > 60 ? "Heavy exertion affecting reaction speed" : "Endurance within operational baseline"} />
                    <TelemetryBar label="EXTRACTION READINESS" value={escapeReadiness} text={`${escapeReadiness}%`} color="bg-violet-500" note={escapeReadiness > 70 ? "Extraction vector clear & ready" : "Exfil routes contested or unverified"} />
                  </div>

                  <div className="pt-2 border-t border-white/6">
                    <span className="text-[9px] text-stone-500 uppercase block mb-1">OPERATIVE CONDITION FACTS:</span>
                    <div className="space-y-1">
                      {currentScene?.operativeCondition?.length ? currentScene.operativeCondition.map((cond, i) => (
                        <div key={i} className="text-[10px] text-stone-300 font-mono">• {cond}</div>
                      )) : <div className="text-[10px] text-stone-400">Agent in operational condition.</div>}
                    </div>
                  </div>
                </div>

                {/* Threat Telemetry Box */}
                <div className="p-5 rounded-2xl bg-[#12151c] border border-white/8 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/6 pb-3">
                    <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs">
                      <AlertOctagon className="w-4 h-4 text-red-400" />
                      <span>THREAT TELEMETRY & VIGILANCE</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                      immediateThreatSeverity === "CRITICAL" ? "bg-red-900 text-red-200" : "bg-amber-900/60 text-amber-300"
                    }`}>
                      {immediateThreatSeverity} THREAT
                    </span>
                  </div>

                  <div className="space-y-3">
                    <TelemetryBar label="SUSPICION LEVEL" value={suspicion} text={`${suspicion}%`} color="bg-amber-500" note={suspicion > 60 ? "Hostiles actively investigating anomalies" : "Cover story accepted"} />
                    <TelemetryBar label="VIGILANCE / ALARM" value={vigilance} text={`${vigilance}%`} color="bg-red-500" note={vigilance > 70 ? "All stations alerted with armed checkpoints" : "Normal security shifts"} />
                    <TelemetryBar label="HOSTILE AWARENESS INDEX" value={hostileAwareness} text={`${hostileAwareness}%`} color="bg-rose-600" note="Composite calculation of enemy alert and active search vectors" />
                  </div>

                  <div className="p-3 bg-black/30 rounded-xl border border-white/6 space-y-1.5">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-stone-400">PURSUIT STATUS:</span>
                      <span className="text-amber-300 font-bold">{pursuitLevel}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-stone-400">ALERT STATE:</span>
                      <span className="text-stone-200">{currentScene?.alertState || "No emergency lockdown"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MISSION & INTEL */}
          {activeTab === "mission_intel" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Mission Telemetry */}
                <div className="p-5 rounded-2xl bg-[#12151c] border border-white/8 space-y-4">
                  <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs border-b border-white/6 pb-3">
                    <Target className="w-4 h-4 text-violet-400" />
                    <span>MISSION PROGRESS & TIME DYNAMICS</span>
                  </div>

                  <div className="space-y-3">
                    <TelemetryBar label="OVERALL MISSION PROGRESS" value={progress} text={`${progress}%`} color="bg-violet-500" note={`Milestones achieved in Turn ${missionState.currentTurn}`} />
                    <TelemetryBar label="TIME PRESSURE DYNAMICS" value={timePressure} text={`${timePressure}%`} color="bg-orange-500" note={timePressure > 60 ? "Urgent countdown / timed objective in progress" : "Pacing controlled by operative initiative"} />
                    <TelemetryBar label="OPERATIONAL EQUILIBRIUM" value={missionStability} text={`${missionStability}%`} color="bg-emerald-500" note="Balance of tactical advantage vs risk factors" />
                  </div>

                  <div className="p-3 bg-black/30 rounded-xl border border-white/6 space-y-1">
                    <div className="text-[10px] text-stone-400">OBJECTIVE COMPLETION STATUS:</div>
                    <div className="text-sm font-bold text-stone-100">{missionState.objectiveStatus || "IN PROGRESS"}</div>
                    <div className="text-[10px] text-amber-300 pt-1">Primary: {currentScene?.immediateObjective || "Classified objective"}</div>
                  </div>
                </div>

                {/* Intelligence Telemetry */}
                <div className="p-5 rounded-2xl bg-[#12151c] border border-white/8 space-y-4">
                  <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs border-b border-white/6 pb-3">
                    <Radio className="w-4 h-4 text-amber-400" />
                    <span>INTELLIGENCE CONFIDENCE & LEADS</span>
                  </div>

                  <div className="space-y-3">
                    <TelemetryBar label="INTEL CONFIDENCE SCORE" value={intelConfidence} text={`${intelConfidence}%`} color="bg-amber-400" note={intelConfidence > 70 ? "Corroborated by signals & field documentation" : "Initial recon phase"} />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 block mb-1">CONFIRMED LEADS ({confirmedLeads.length})</span>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {confirmedLeads.map((item, idx) => (
                          <div key={idx} className="p-1.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-[9px] text-emerald-200">✓ {item}</div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-amber-400 block mb-1">UNCERTAIN LEADS / TRAPS ({uncertainLeads.length})</span>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {uncertainLeads.map((item, idx) => (
                          <div key={idx} className="p-1.5 rounded bg-amber-950/20 border border-amber-900/30 text-[9px] text-amber-200">? {item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXPOSURE & BEHAVIOR */}
          {activeTab === "political_behavior" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Political / Operational Exposure */}
                <div className="p-5 rounded-2xl bg-[#12151c] border border-white/8 space-y-4">
                  <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs border-b border-white/6 pb-3">
                    <Globe2 className="w-4 h-4 text-red-400" />
                    <span>POLITICAL & OPERATIONAL EXPOSURE</span>
                  </div>

                  <div className="space-y-3">
                    <TelemetryBar label="POLITICAL EXPOSURE RATING" value={politicalExposure} text={`${politicalExposure}%`} color="bg-red-500" note={diplomaticRisk} />
                    <TelemetryBar label="COLLATERAL DAMAGE IMPACT" value={collateral} text={`${collateral}%`} color="bg-rose-500" note={civilianRisk} />
                  </div>

                  <div className="p-3 bg-black/30 rounded-xl border border-white/6 space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-stone-400">DIPLOMATIC RISK:</span>
                      <span className="text-amber-300 font-bold">{diplomaticRisk}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-stone-400">CIVILIAN PROXIMITY:</span>
                      <span className="text-stone-200">{civilianRisk}</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-stone-400">MI6 VISIBILITY PROFILE:</span>
                      <span className="text-sky-300 font-bold">{mi6Visibility}</span>
                    </div>
                  </div>
                </div>

                {/* Behavioral Telemetry Breakdown */}
                <div className="p-5 rounded-2xl bg-[#12151c] border border-white/8 space-y-4">
                  <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs border-b border-white/6 pb-3">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>OPERATIVE BEHAVIOR TENDENCIES</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <BehaviorMiniCard label="STEALTH DISCIPLINE" val={behaviorScores.stealth} />
                    <BehaviorMiniCard label="TACTICAL AGGRESSION" val={behaviorScores.aggression} />
                    <BehaviorMiniCard label="DECEPTION & BLUFF" val={behaviorScores.deception} />
                    <BehaviorMiniCard label="DIPLOMATIC FINESSE" val={behaviorScores.diplomacy} />
                    <BehaviorMiniCard label="GADGET RELIANCE" val={behaviorScores.gadgetReliance} />
                    <BehaviorMiniCard label="RISK TOLERANCE" val={behaviorScores.riskTolerance} />
                    <BehaviorMiniCard label="RUTHLESSNESS" val={behaviorScores.ruthlessness} />
                    <BehaviorMiniCard label="PROTECTIVE INSTINCT" val={behaviorScores.protectiveInstinct} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERSONA & CAUSAL */}
          {activeTab === "persona_causal" && (
            <div className="space-y-5">
              {/* Bond Persona Section (Hidden by Default) */}
              <div className="p-5 rounded-2xl bg-[#12151c] border border-violet-500/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/6 pb-3">
                  <div className="flex items-center space-x-2">
                    <BrainCircuit className="w-4 h-4 text-violet-400" />
                    <span className="text-stone-100 font-bold text-xs">LIVE BOND PERSONA ALIGNMENT</span>
                  </div>
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setIsPersonaRevealed(!isPersonaRevealed);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      isPersonaRevealed
                        ? "bg-stone-800 text-stone-300 border-white/10"
                        : "bg-violet-600 hover:bg-violet-500 text-white border-violet-400 shadow"
                    }`}
                  >
                    {isPersonaRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isPersonaRevealed ? "HIDE ALIGNMENT" : "SHOW PERSONA ALIGNMENT"}</span>
                  </button>
                </div>

                {!isPersonaRevealed ? (
                  <div className="p-6 text-center space-y-2 bg-black/30 rounded-2xl border border-white/5">
                    <Lock className="w-6 h-6 text-stone-500 mx-auto" />
                    <div className="text-stone-300 font-bold text-xs">PERSONA TELEMETRY MASKED BY DEFAULT</div>
                    <p className="text-stone-500 text-[10px] max-w-lg mx-auto">
                      Alignment with the 6 Bond actor doctrines is intentionally concealed during operations so it does not subconsciously influence your natural operational instincts. Click the reveal button to inspect your current profile.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="text-[10px] text-stone-400">
                      Evaluated from your real choices and trade-offs across {missionState.timeline?.length || 1} recorded turns:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {personaAlignment.map((p, idx) => (
                        <div key={p.id} className={`p-3.5 rounded-xl border ${idx === 0 ? "bg-violet-950/30 border-violet-500/50" : "bg-[#161a22] border-white/6"}`}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-stone-100 text-xs">{p.name}</span>
                            <span className={`text-xs font-black px-1.5 py-0.2 rounded ${idx === 0 ? "bg-violet-600 text-white" : "bg-stone-800 text-stone-400"}`}>{p.pct}% MATCH</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mb-2">
                            <div className={`h-full ${idx === 0 ? "bg-violet-400" : "bg-stone-600"}`} style={{ width: `${p.pct}%` }} />
                          </div>
                          <div className="text-[9px] text-stone-400 leading-tight">{p.traits}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Causal Telemetry Section */}
              <div className="p-5 rounded-2xl bg-[#12151c] border border-white/8 space-y-4">
                <div className="flex items-center space-x-2 text-stone-200 font-bold text-xs border-b border-white/6 pb-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>CAUSAL TELEMETRY & BRANCH DIVERGENCE</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-black/30 rounded-xl border border-white/6 space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-stone-400">BRANCH DIVERGENCE INDEX:</span>
                      <span className="text-amber-300 font-bold">{branchDivergence}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${branchDivergence}%` }} />
                    </div>
                    <div className="text-[9px] text-stone-400">{canonDivergenceLabel}</div>
                  </div>

                  <div className="p-3.5 bg-black/30 rounded-xl border border-white/6 space-y-1">
                    <span className="text-[10px] text-stone-400 font-bold">UNRESOLVED THREATS & RISKS</span>
                    <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
                      {unresolvedThreats.length ? unresolvedThreats.map((t, i) => (
                        <div key={i} className="text-[9px] text-rose-300 flex items-center space-x-1.5">
                          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                          <span>{t}</span>
                        </div>
                      )) : <div className="text-[9px] text-stone-500">No unresolved high-threat nodes pending.</div>}
                    </div>
                  </div>
                </div>

                {persistentConsequences.length > 0 && (
                  <div className="pt-2 border-t border-white/6">
                    <span className="text-[9px] text-stone-400 font-bold block mb-2">PERSISTENT TIMELINE CONSEQUENCES:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {persistentConsequences.map((c, i) => (
                        <div key={i} className="p-2 rounded-lg bg-white/[0.02] border border-white/6 text-[9px] text-stone-300">
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/8 bg-[#0d1016] flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center space-x-2 text-stone-500 text-[10px]">
            <span>ENCRYPTED MI6 TELEMETRY BUS</span>
            <span>•</span>
            <span>UPDATED LIVE PER TURN</span>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
          >
            RETURN TO SIMULATOR
          </button>
        </div>

      </div>
    </div>
  );
};

/* Helper Components */

const MetricCard: React.FC<{ title: string; value: string; sub: string; color: string }> = ({ title, value, sub, color }) => (
  <div className="p-3 rounded-xl bg-[#141820] border border-white/8 text-center space-y-0.5">
    <span className="text-[8px] text-stone-500 uppercase font-black tracking-wider block">{title}</span>
    <span className={`text-xl font-black block ${color}`}>{value}</span>
    <span className="text-[8px] text-stone-400 block truncate">{sub}</span>
  </div>
);

const TelemetryBar: React.FC<{ label: string; value: number; text: string; color: string; note: string }> = ({ label, value, text, color, note }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px]">
      <span className="text-stone-400">{label}:</span>
      <span className="font-bold text-stone-200">{text}</span>
    </div>
    <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
    <div className="text-[8px] text-stone-500 leading-tight">{note}</div>
  </div>
);

const BehaviorMiniCard: React.FC<{ label: string; val: number }> = ({ label, val }) => (
  <div className="p-2.5 rounded-xl bg-[#151921] border border-white/6 space-y-1">
    <div className="flex justify-between text-[8px] text-stone-400">
      <span className="truncate">{label}</span>
      <span className="text-amber-400 font-bold">{val}%</span>
    </div>
    <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${val}%` }} />
    </div>
  </div>
);
