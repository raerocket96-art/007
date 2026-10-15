import React, { useState } from "react";
import { Activity, BriefcaseBusiness, GitBranch, GitCompareArrows, Radio, ShieldCheck, UserCheck, Skull, X, Zap } from "lucide-react";
import type { FieldAssetCall, MissionEquipmentRuntime, MissionState, SocialStanceType } from "../types";
import type { CareerProfile, QPrototype } from "../utils/careerProgression";

export type TacticalDrawerTab = "telemetry" | "phases" | "adversary" | "cover" | "qbranch" | "causal" | "canon" | "humint" | "career";

type Props = {
  open: boolean;
  onClose: () => void;
  missionState: MissionState;
  equipment: MissionEquipmentRuntime[];
  fieldAssets: Array<{ id: string; name: string; role: string }>;
  assetCalls: FieldAssetCall[];
  career: CareerProfile;
  prototypes: QPrototype[];
  onOpenTelemetry: () => void;
  onOpenCausal: () => void;
  onOpenCanon: () => void;
  onDeployEquipment: (equipmentId: string, directive: string) => void;
  onCallAsset: (asset: { id: string; name: string; role: string }) => void;
  onUnlockPrototype: (prototypeId: string) => void;
  onDeployPrototype: (prototypeId: string, directive: string) => void;
  onChangeSocialStance?: (stance: SocialStanceType) => void;
};

const tabs: Array<{ id: TacticalDrawerTab; label: string; icon: React.ReactNode }> = [
  { id: "telemetry", label: "Telemetry", icon: <Activity className="w-3.5 h-3.5" /> },
  { id: "adversary", label: "Adversary Clock", icon: <Skull className="w-3.5 h-3.5" /> },
  { id: "cover", label: "Cover Identity", icon: <UserCheck className="w-3.5 h-3.5" /> },
  { id: "qbranch", label: "Q-Branch Bag", icon: <BriefcaseBusiness className="w-3.5 h-3.5" /> },
  { id: "causal", label: "Causal Timeline", icon: <GitBranch className="w-3.5 h-3.5" /> },
  { id: "canon", label: "Canonical Delta", icon: <GitCompareArrows className="w-3.5 h-3.5" /> },
  { id: "humint", label: "Field Assets", icon: <Radio className="w-3.5 h-3.5" /> },
  { id: "career", label: "00 Career", icon: <ShieldCheck className="w-3.5 h-3.5" /> }
];

export const TacticalCommandDrawer: React.FC<Props> = (props) => {
  const [tab, setTab] = useState<TacticalDrawerTab>("telemetry");
  if (!props.open) return null;

  const metric = (label: string, value: number | undefined) => (
    <div className="rounded-xl border border-white/8 bg-black/20 p-3">
      <div className="text-[7px] uppercase tracking-widest text-stone-600">{label}</div>
      <div className="mt-1 text-lg font-black text-stone-100">{Math.round(value ?? 0)}%</div>
    </div>
  );

  const adversary = props.missionState.adversaryState;
  const cover = props.missionState.coverIdentity;
  const currentPhase = props.missionState.currentPhase;
  const allPhases = props.missionState.phases || [];

  return (
    <div className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm" onMouseDown={props.onClose}>
      <aside className="absolute right-0 top-0 h-full w-full max-w-[540px] border-l border-[#5c5145] bg-[#0d0f12] shadow-2xl flex flex-col" onMouseDown={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-white/8 flex items-center justify-between gap-3 font-mono">
          <div>
            <div className="text-[8px] uppercase tracking-[0.22em] text-amber-300 font-black">TACTICAL COMMAND DRAWER</div>
            <div className="text-sm text-white font-black mt-1">Turn {props.missionState.currentTurn} // {currentPhase?.shortTitle || "STAGE I"}</div>
          </div>
          <button onClick={props.onClose} className="p-2 rounded-lg border border-white/10 text-stone-400 hover:text-white"><X className="w-4 h-4" /></button>
        </header>

        <div className="flex overflow-x-auto border-b border-white/8 bg-black/20 p-2 gap-1 scrollbar-thin">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[8px] font-black uppercase tracking-wide border transition-all ${
                tab === item.id ? "border-amber-500/50 bg-amber-500/10 text-amber-200" : "border-white/5 text-stone-500 hover:text-stone-200"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 font-mono space-y-4">
          {tab === "telemetry" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {metric("Health", props.missionState.agentHealth)}
                {metric("Cover", props.missionState.coverIntegrity ?? props.missionState.stealthRating)}
                {metric("Suspicion", props.missionState.suspicion)}
                {metric("Intel", props.missionState.intelligenceConfidence)}
                {metric("Exposure", props.missionState.politicalExposure)}
                {metric("Progress", props.missionState.missionProgress)}
              </div>
              {props.missionState.lastRiskResolution && (
                <div className="rounded-xl border border-violet-800/50 bg-violet-950/20 p-3">
                  <div className="text-[8px] text-violet-300 font-black uppercase tracking-wider">LAST RISK RESOLUTION</div>
                  <div className="mt-1 text-[10px] text-stone-200">{props.missionState.lastRiskResolution.summary}</div>
                </div>
              )}
              {currentPhase && (
                <div className="rounded-xl border border-amber-800/40 bg-amber-950/15 p-3">
                  <div className="text-[8px] text-amber-300 font-black uppercase tracking-wider">ACTIVE OPERATIONAL PHASE</div>
                  <div className="mt-1 text-xs font-black text-stone-100">{currentPhase.name}</div>
                  <div className="mt-1 text-[10px] text-stone-400">{currentPhase.description}</div>
                </div>
              )}
              <button onClick={props.onOpenTelemetry} className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-black py-3 text-[9px] font-black uppercase tracking-wider">
                OPEN FULL TELEMETRY
              </button>
            </div>
          )}

          {tab === "adversary" && (
            <div className="space-y-4">
              {adversary ? (
                <>
                  <div className="rounded-xl border border-red-800/50 bg-red-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[8px] uppercase tracking-widest text-red-400 font-bold">PRIMARY ADVERSARY SCHEME</div>
                        <div className="text-sm font-black text-red-200 mt-0.5">{adversary.name}</div>
                      </div>
                      <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase border ${
                        adversary.threatLevel === "CATASTROPHIC" ? "bg-red-900/60 border-red-500 text-red-200 animate-pulse" :
                        adversary.threatLevel === "CRITICAL" ? "bg-orange-950/60 border-orange-600 text-orange-200" :
                        "bg-amber-950/50 border-amber-700 text-amber-300"
                      }`}>{adversary.threatLevel || "MODERATE"} THREAT</span>
                    </div>
                    <div className="text-[11px] text-stone-200">{adversary.schemeName}</div>

                    <div className="space-y-1.5 pt-2 border-t border-red-900/30">
                      <div className="flex justify-between text-[8px] font-mono">
                        <span className="text-stone-400 uppercase">Master Plan Progress</span>
                        <span className="text-red-300 font-black">{adversary.masterPlanProgress}%</span>
                      </div>
                      <div className="w-full bg-black/60 rounded-full h-2 border border-red-900/50 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 h-full transition-all duration-500"
                          style={{ width: `${adversary.masterPlanProgress}%` }}
                        />
                      </div>
                      <div className="text-[8px] text-stone-500">Critical operational deadline: ~{adversary.turnsToCriticalDeadline} turns remaining before scheme execution.</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/8 bg-black/20 p-3.5 space-y-2">
                    <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">ACTIVE COUNTERMEASURES</div>
                    <div className="flex flex-wrap gap-1.5">
                      {adversary.activeCountermeasures?.map((counter, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md border border-red-900/40 bg-red-950/30 text-red-300 text-[8px]">
                          ⚠️ {counter}
                        </span>
                      ))}
                    </div>
                  </div>

                  {adversary.currentVulnerability && (
                    <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-3.5 space-y-1">
                      <div className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">IDENTIFIED VULNERABILITY</div>
                      <div className="text-[10px] text-stone-200">{adversary.currentVulnerability}</div>
                    </div>
                  )}

                  {adversary.lastAdversaryMove && (
                    <div className="rounded-xl border border-white/8 bg-black/20 p-3.5 space-y-1">
                      <div className="text-[8px] text-stone-500 font-bold uppercase tracking-wider">LAST ADVERSARY ACTION</div>
                      <div className="text-[10px] text-stone-300">{adversary.lastAdversaryMove}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-[10px] text-stone-500">Adversary intelligence runtime not active for this session.</div>
              )}
            </div>
          )}

          {tab === "cover" && (
            <div className="space-y-4">
              {cover ? (
                <>
                  <div className="rounded-xl border border-cyan-800/50 bg-cyan-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[8px] uppercase tracking-widest text-cyan-400 font-bold">ACTIVE COVER IDENTITY</div>
                        <div className="text-sm font-black text-cyan-100 mt-0.5">{cover.alias}</div>
                      </div>
                      <span className="px-2 py-0.5 text-[8px] font-black rounded uppercase border border-cyan-700 bg-cyan-950/50 text-cyan-300">
                        {cover.activeStance.replaceAll("_", " ")}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-200">{cover.profession}</div>
                    <p className="text-[10px] text-stone-400 leading-relaxed">{cover.backstorySummary}</p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-900/30">
                      <div className="rounded-lg bg-black/40 border border-white/5 p-2 text-center">
                        <div className="text-[7px] text-stone-500 uppercase">Credential Integrity</div>
                        <div className="text-sm font-black text-cyan-300">{cover.credentialIntegrity}%</div>
                      </div>
                      <div className="rounded-lg bg-black/40 border border-white/5 p-2 text-center">
                        <div className="text-[7px] text-stone-500 uppercase">Suspicion Level</div>
                        <div className="text-sm font-black text-amber-300">{cover.suspicionLevel}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/8 bg-black/20 p-3.5 space-y-2">
                    <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">CHANGE SOCIAL ESPIONAGE STANCE</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "PLAY_PERSONA", label: "Play Persona", desc: "Adhere to backstory (+Cover, -Suspicion)" },
                        { id: "PSYCHOLOGICAL_PROVOCATION", label: "Provoke", desc: "Sharp psychological sparring (+Intel, +Suspicion)" },
                        { id: "CALCULATED_BLUFF", label: "Bluff", desc: "High-stakes deception to bypass checks" },
                        { id: "DEEP_COVER_SILENCE", label: "Silence", desc: "Total observer posture (+Stealth)" }
                      ].map((st) => (
                        <button
                          key={st.id}
                          onClick={() => props.onChangeSocialStance?.(st.id as SocialStanceType)}
                          className={`text-left p-2.5 rounded-lg border text-[8px] transition-all ${
                            cover.activeStance === st.id
                              ? "border-cyan-500 bg-cyan-950/40 text-cyan-200"
                              : "border-white/8 bg-black/30 text-stone-400 hover:text-stone-200"
                          }`}
                        >
                          <div className="font-bold uppercase">{st.label}</div>
                          <div className="text-[7px] text-stone-500 mt-0.5 line-clamp-1">{st.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/8 bg-black/20 p-3.5 space-y-1.5">
                    <div className="text-[8px] text-stone-400 font-bold uppercase tracking-wider">AUTHORIZED ACCESS ZONES</div>
                    <div className="flex flex-wrap gap-1">
                      {cover.authorizedZones?.map((zone, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded border border-white/10 bg-black/40 text-stone-300 text-[8px]">
                          ✓ {zone}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-[10px] text-stone-500">Cover identity not initialized for this mission.</div>
              )}
            </div>
          )}

          {tab === "qbranch" && (
            <div className="space-y-2">
              {props.equipment.map((item) => (
                <div key={item.id} className="rounded-xl border border-white/8 bg-black/20 p-3">
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-black text-stone-100">{item.name}</div>
                      <div className="text-[7px] text-stone-600 mt-1">{item.modifications.join(" • ") || "Standard configuration"}</div>
                    </div>
                    <div className={`text-[8px] font-black ${item.status === "EXHAUSTED" ? "text-red-400" : "text-emerald-400"}`}>
                      {item.status}{item.remainingUses != null ? ` // ${item.remainingUses}` : ""}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tacticalUnlocks.slice(0, 3).map((unlock, idx) => (
                      <button
                        key={idx}
                        disabled={item.status === "EXHAUSTED" || item.status === "LOST"}
                        onClick={() => props.onDeployEquipment(item.id, unlock)}
                        className="rounded-lg border border-cyan-800/50 bg-cyan-950/20 px-2 py-1.5 text-[7px] text-cyan-200 disabled:opacity-30"
                      >
                        <Zap className="inline w-3 h-3 mr-1" />DEPLOY ACTION
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {!props.equipment.length && <div className="text-[9px] text-stone-600">No Q-Branch runtime inventory available in this legacy save.</div>}
            </div>
          )}

          {tab === "causal" && (
            <div className="space-y-3">
              <p className="text-[10px] text-stone-400">Inspect the persistent cause-and-effect chain for this timeline.</p>
              <button onClick={props.onOpenCausal} className="w-full rounded-xl border border-cyan-700/50 bg-cyan-950/20 py-3 text-[9px] font-black text-cyan-200">
                OPEN CAUSAL TIMELINE
              </button>
            </div>
          )}

          {tab === "canon" && (
            <div className="space-y-3">
              <p className="text-[10px] text-stone-400">Compare this branch against the archived film baseline.</p>
              <button onClick={props.onOpenCanon} className="w-full rounded-xl border border-emerald-700/50 bg-emerald-950/20 py-3 text-[9px] font-black text-emerald-200">
                OPEN CANONICAL DELTA
              </button>
            </div>
          )}

          {tab === "humint" && (
            <div className="space-y-2">
              <div className="text-[8px] text-stone-500 mb-3">Calling an asset inserts a support directive and costs time/operational exposure. The AI must resolve whether the contact can actually help.</div>
              {props.fieldAssets.map((asset) => {
                const previous = props.assetCalls.find((call) => call.id === asset.id);
                return (
                  <button
                    key={asset.id}
                    disabled={!!previous}
                    onClick={() => props.onCallAsset(asset)}
                    className="w-full text-left rounded-xl border border-white/8 bg-black/20 p-3 hover:border-amber-700/60 disabled:opacity-40"
                  >
                    <div className="text-[10px] font-black text-stone-100">{asset.name}</div>
                    <div className="text-[8px] text-stone-500 mt-1">{asset.role}</div>
                    {previous && <div className="text-[7px] text-amber-300 mt-2">{previous.status} // TURN {previous.turn}</div>}
                  </button>
                );
              })}
            </div>
          )}

          {tab === "career" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-800/40 bg-amber-950/10 p-4">
                <div className="text-[8px] text-amber-300 font-black">{props.career.rank.toUpperCase()}</div>
                <div className="mt-1 text-2xl font-black text-white">{props.career.requisitionPoints} RP</div>
                <div className="text-[8px] text-stone-500 mt-1">{props.career.completedOperations.length} unique film/theatre files completed</div>
              </div>
              {props.prototypes.map((prototype) => {
                const unlocked = props.career.unlockedPrototypeIds.includes(prototype.id);
                return (
                  <div key={prototype.id} className="rounded-xl border border-white/8 bg-black/20 p-3">
                    <div className="flex justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black text-stone-100">{prototype.name}</div>
                        <div className="text-[8px] text-stone-500 mt-1">{prototype.description}</div>
                      </div>
                      <div className="text-[9px] font-black text-amber-300">{unlocked ? "UNLOCKED" : `${prototype.cost} RP`}</div>
                    </div>
                    <button
                      onClick={() => unlocked ? props.onDeployPrototype(prototype.id, prototype.directive) : props.onUnlockPrototype(prototype.id)}
                      disabled={!unlocked && props.career.requisitionPoints < prototype.cost}
                      className="mt-3 rounded-lg border border-amber-700/50 bg-amber-950/20 px-3 py-2 text-[8px] text-amber-200 disabled:opacity-30"
                    >
                      {unlocked ? "INSERT PROTOTYPE DIRECTIVE" : "REQUISITION BLUEPRINT"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
