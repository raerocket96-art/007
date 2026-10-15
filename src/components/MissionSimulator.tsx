import React, { useState, useEffect, useRef, useMemo } from "react";
import { MI6DatabaseStore } from "../data";
import { missionTemplates, MissionTemplate } from "../data/missions";
import { MissionState, CausalTreeNode, CustomizedLoadout, SimulationSaveSlot, MissionDebriefReport, SimulationStatReasons } from "../types";
import { 
  Play, 
  RotateCcw, 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Terminal, 
  CheckCircle2, 
  Send, 
  Radio, 
  ChevronRight,
  FileCheck,
  User,
  Wrench,
  Car,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Save,
  FolderOpen,
  GitBranch,
  ClipboardList,
  Trash2,
  Crosshair,
  Film,
  GitCompareArrows,
  Network,
  X,
  Gauge
} from "lucide-react";
import { ComprehensiveTelemetryModal } from "./ComprehensiveTelemetryModal";
import { soundManager } from "../utils/sound";
import { toastManager } from "../utils/toast";
import { QBranchCustomizer } from "./QBranchCustomizer";
import { INITIAL_CONFIGURABLE_EQUIPMENT, calculateLoadoutMetrics } from "../data/customizableEquipment";
import { saveActiveMissionToLocalStorage, loadActiveMissionFromLocalStorage, clearActiveMissionFromLocalStorage } from "../utils/dataSync";
import { SituationShiftCard, SituationShiftItem } from "./SituationShiftCard";
import { CausalTreeModal } from "./CausalTreeModal";
import { MissionSaveManagerModal } from "./MissionSaveManagerModal";
import { CanonicalComparisonModal } from "./CanonicalComparisonModal";
import { EnhancedDebriefPanel } from "./EnhancedDebriefPanel";
import { SimulationHistoryTab } from "./SimulationHistoryTab";
import { BOND_DOCTRINES } from "../data/bondDoctrines";
import { getFilmDebriefBaseline } from "../data/debriefBaselines";
import { calculateSuccessProbability } from "../utils/successProbability";
import { SuccessProbabilityGauge } from "./SuccessProbabilityGauge";
import { TacticalCommandDrawer } from "./TacticalCommandDrawer";
import { applyEquipmentWearForAction, createMissionEquipmentRuntime, equipmentPromptPayload } from "../utils/loadoutRuntime";
import { applyRiskResolutionToTurn, resolveRiskCheck } from "../utils/riskResolution";
import { getAdversaryProfile, createAdversaryRuntime } from "../data/adversaryProfiles";
import { getMissionPhases } from "../data/missionPhases";
import { getCoverIdentityForOperation, applySocialStanceModifier } from "../data/coverIdentities";
import { Q_PROTOTYPES, awardCareerRun, loadCareerProfile, saveCareerProfile, unlockPrototype } from "../utils/careerProgression";
import { applySimulationTurnToMissionState, createInitialSceneState, ensureSceneState, generateProceduralSimulationTurn, inferActionTypeFromText, migrateLegacyTurnLimitedMissionState } from "../utils/simulationState";
import { useTypewriter } from "../hooks/useTypewriter";
import type { SocialStanceType } from "../types";
import { ThemeSettings } from "./ThemeSettings";
import { ActorPortrait } from "./ActorPortrait";

interface MissionSimulatorProps {
  store: MI6DatabaseStore;
  initialTemplateId?: string;
  onOpenRecord: (recordId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

const MISSION_STAGES = [
  "Insertion", "Recon", "Access", "Investigation", "Counter-Intel",
  "Escalation", "Crisis", "Decisive Action", "Extraction"
];

const getLiveStageLabel = (turn: number) => {
  if (turn <= MISSION_STAGES.length) return MISSION_STAGES[Math.max(0, turn - 1)];
  return "Open Operations";
};

const DEBRIEF_CACHE_PREFIX = "mi6_final_debrief_v1:";

type CachedDebrief = {
  report: MissionDebriefReport | null;
  summary: string | null;
  cachedAt: string;
};

function loadCachedDebrief(missionId?: string | null): CachedDebrief | null {
  if (!missionId) return null;
  try {
    const raw = localStorage.getItem(`${DEBRIEF_CACHE_PREFIX}${missionId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return {
      report: parsed.report && typeof parsed.report === "object" ? parsed.report : null,
      summary: typeof parsed.summary === "string" ? parsed.summary : null,
      cachedAt: typeof parsed.cachedAt === "string" ? parsed.cachedAt : new Date(0).toISOString()
    };
  } catch {
    return null;
  }
}

function cacheDebrief(missionId: string, report: MissionDebriefReport | null, summary: string | null) {
  try {
    localStorage.setItem(`${DEBRIEF_CACHE_PREFIX}${missionId}`, JSON.stringify({
      report,
      summary,
      cachedAt: new Date().toISOString()
    }));
  } catch {
    // Debrief caching is best-effort only.
  }
}

type SimulatorPreferences = {
  hudMode: "focused" | "full";
  showStageRail: boolean;
  showSituationShifts: boolean;
  showRecentActivity: boolean;
  showIntelPanel: boolean;
  showDoctrinePanel: boolean;
  showSuggestedActions: boolean;
  showEngineStatus: boolean;
};

const SIMULATOR_SETTINGS_KEY = "mi6_simulator_preferences_v1";
const DEFAULT_SIMULATOR_PREFERENCES: SimulatorPreferences = {
  hudMode: "focused",
  showStageRail: false,
  showSituationShifts: false,
  showRecentActivity: false,
  showIntelPanel: false,
  showDoctrinePanel: false,
  showSuggestedActions: true,
  showEngineStatus: false,
};

type ArchivedRun = {
  id: string;
  title: string;
  actor?: string;
  score?: number;
  finishedAt: string;
  turnCount: number;
  outcome: string;
};

const RUN_ARCHIVE_KEY = "mi6_completed_run_archive_v1";
const FIELD_NOTES_KEY_PREFIX = "mi6_field_notes_v1:";

function loadRunArchive(): ArchivedRun[] {
  try {
    const raw = localStorage.getItem(RUN_ARCHIVE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSimulatorPreferences(): SimulatorPreferences {
  try {
    const raw = localStorage.getItem(SIMULATOR_SETTINGS_KEY);
    if (!raw) return DEFAULT_SIMULATOR_PREFERENCES;
    return { ...DEFAULT_SIMULATOR_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SIMULATOR_PREFERENCES;
  }
}

function buildSituationShifts(before: MissionState, after: MissionState, reasons: SimulationStatReasons = {}): SituationShiftItem[] {
  const values: Array<[string, number, number, boolean, keyof SimulationStatReasons]> = [
    ["Agent health", before.agentHealth, after.agentHealth, true, "health"],
    ["Cover integrity", before.stealthRating, after.stealthRating, true, "cover"],
    ["Hostile vigilance", before.alarmLevel, after.alarmLevel, false, "vigilance"],
    ["Suspicion", before.suspicion ?? before.alarmLevel, after.suspicion ?? after.alarmLevel, false, "suspicion"],
    ["Intel confidence", before.intelligenceConfidence ?? 0, after.intelligenceConfidence ?? 0, true, "intelConfidence"],
    ["Political exposure", before.politicalExposure ?? 0, after.politicalExposure ?? 0, false, "politicalExposure"],
    ["Time pressure", before.timePressure ?? 0, after.timePressure ?? 0, false, "timePressure"],
    ["Extraction readiness", before.escapeReadiness ?? 0, after.escapeReadiness ?? 0, true, "escapeReadiness"],
  ];
  return values
    .filter(([, a, b]) => a !== b)
    .slice(0, 4)
    .map(([metric, a, b, higherIsGood, reasonKey]) => ({
      metric,
      before: `${a}%`,
      after: `${b}%`,
      cause: reasons[reasonKey] || "Scene state changed for a concrete operational reason.",
      tone: (b === a ? "neutral" : ((b > a) === higherIsGood ? "good" : "bad")) as "good" | "bad" | "neutral"
    }));
}


export const MissionSimulator: React.FC<MissionSimulatorProps> = ({
  store,
  initialTemplateId = "template-danube",
  onOpenRecord,
  onNavigateToTab
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    const saved = loadActiveMissionFromLocalStorage();
    if (saved?.templateId) return saved.templateId;
    return initialTemplateId;
  });
  const currentTemplate = missionTemplates.find(t => t.id === selectedTemplateId) || missionTemplates[0];

  // Equipment & Agent Requisition
  const [selectedAgentId, setSelectedAgentId] = useState(currentTemplate.defaultAgentId);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>(currentTemplate.recommendedEquipment);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(currentTemplate.recommendedVehicle || "veh-db5");

  // Q-Branch Custom Loadout State
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizedLoadout, setCustomizedLoadout] = useState<CustomizedLoadout>(() => {
    try {
      const saved = localStorage.getItem("mi6_customized_loadout_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      items: INITIAL_CONFIGURABLE_EQUIPMENT,
      ...calculateLoadoutMetrics(INITIAL_CONFIGURABLE_EQUIPMENT)
    };
  });

  // Simulation Active State (restores automatically from localStorage if available)
  const [missionState, setMissionState] = useState<MissionState | null>(() => {
    const saved = loadActiveMissionFromLocalStorage();
    // Old saves from before the persistent scene-state engine are intentionally not restored
    // as an active run because they contain film-level location/objective leakage.
    return saved?.sceneState ? migrateLegacyTurnLimitedMissionState(saved) : null;
  });
  const [customActionText, setCustomActionText] = useState("");
  const [isLoadingTurn, setIsLoadingTurn] = useState(false);
  const [pendingDirective, setPendingDirective] = useState<string | null>(null);
  const [pendingSeconds, setPendingSeconds] = useState(0);
  const [lastTurnEngine, setLastTurnEngine] = useState<"gemini" | "procedural" | null>(null);
  const [debriefSummary, setDebriefSummary] = useState<string | null>(() => {
    const saved = loadActiveMissionFromLocalStorage();
    return loadCachedDebrief(saved?.id)?.summary || null;
  });
  const [debriefReport, setDebriefReport] = useState<MissionDebriefReport | null>(() => {
    const saved = loadActiveMissionFromLocalStorage();
    return loadCachedDebrief(saved?.id)?.report || null;
  });
  const [isDebriefLoading, setIsDebriefLoading] = useState(false);
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);
  const [isFinalDebriefOpen, setIsFinalDebriefOpen] = useState(false);
  const [lastSceneIntel, setLastSceneIntel] = useState(() => {
    const saved = loadActiveMissionFromLocalStorage();
    if (saved?.sceneState) {
      return {
        objective: saved.sceneState.immediateObjective,
        confirmed: saved.sceneState.discoveredIntel || [],
        uncertain: saved.sceneState.uncertainIntel || [],
        threats: saved.sceneState.nearbyThreats || [],
        assets: [] as string[]
      };
    }
    const initialScene = createInitialSceneState(currentTemplate.location, currentTemplate.objective, currentTemplate.initialSituation);
    return {
      objective: initialScene.immediateObjective,
      confirmed: [] as string[],
      uncertain: [] as string[],
      threats: [] as string[],
      assets: [] as string[]
    };
  });
  const [saveSlots, setSaveSlots] = useState<SimulationSaveSlot[]>(() => {
    try {
      const raw = localStorage.getItem("mi6_mission_save_slots_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [lastSituationShifts, setLastSituationShifts] = useState<SituationShiftItem[]>([]);
  const [isCausalTreeOpen, setIsCausalTreeOpen] = useState(false);
  const [isSaveManagerOpen, setIsSaveManagerOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isTacticalDrawerOpen, setIsTacticalDrawerOpen] = useState(false);
  const [pendingEquipmentUseId, setPendingEquipmentUseId] = useState<string | null>(null);
  const [careerProfile, setCareerProfile] = useState(() => loadCareerProfile());
  const [selectedDoctrineId, setSelectedDoctrineId] = useState<string>(() => {
    try { 
      return localStorage.getItem("mi6_bond_doctrine_v1") || localStorage.getItem("mi6_preferred_doctrine") || "connery"; 
    } catch { 
      return "connery"; 
    }
  });
  const [configurationNotice, setConfigurationNotice] = useState<string | null>(null);
  const [isMissionMenuOpen, setIsMissionMenuOpen] = useState(false);
  const [isRunArchiveOpen, setIsRunArchiveOpen] = useState(false);
  const [isFieldNotesOpen, setIsFieldNotesOpen] = useState(false);
  const [runArchive, setRunArchive] = useState<ArchivedRun[]>(() => loadRunArchive());
  const [fieldNotes, setFieldNotes] = useState("");
  const [preferences, setPreferences] = useState<SimulatorPreferences>(() => loadSimulatorPreferences());
  const [causalArchive, setCausalArchive] = useState<CausalTreeNode[]>(() => {
    try {
      const raw = localStorage.getItem("mi6_causal_archive_v2");
      return raw ? JSON.parse(raw) : (missionState?.causalTree || []);
    } catch { return missionState?.causalTree || []; }
  });
  const selectedDoctrine = BOND_DOCTRINES.find(d => d.id === selectedDoctrineId) || BOND_DOCTRINES[4];

  const doctrineChoiceScore = (actionType: "STEALTH" | "TACTICAL" | "DIPLOMATIC" | "AGGRESSIVE") => {
    if (actionType === "DIPLOMATIC") return Math.round((selectedDoctrine.charm + selectedDoctrine.professionalism) / 2);
    if (actionType === "STEALTH") return Math.round((selectedDoctrine.patience + selectedDoctrine.manipulationDeception) / 2);
    if (actionType === "TACTICAL") return selectedDoctrine.tacticalIntelligence;
    return Math.round((selectedDoctrine.riskTolerance + selectedDoctrine.ruthlessness) / 2);
  };

  const doctrineRecommendedStarts = useMemo(() => {
    return [...currentTemplate.startingNodes]
      .sort((a, b) => doctrineChoiceScore(b.actionType) - doctrineChoiceScore(a.actionType))
      .slice(0, 2);
  }, [currentTemplate.id, selectedDoctrineId]);

  const doctrineBrief = useMemo(() => {
    const primary = doctrineRecommendedStarts[0];
    return {
      headline: `${selectedDoctrine.name} // ${currentTemplate.title}`,
      approach: primary
        ? `${selectedDoctrine.name}'s strongest opening profile here is ${primary.actionType.toLowerCase()}: ${primary.text}`
        : `${selectedDoctrine.name} is cleared for this operation.`,
      strengths: selectedDoctrine.strengths.slice(0, 3)
    };
  }, [selectedDoctrineId, currentTemplate.id, doctrineRecommendedStarts]);

  const successProbabilityResult = useMemo(() => {
    if (!missionState) return null;
    return calculateSuccessProbability(missionState, selectedDoctrine);
  }, [missionState, selectedDoctrine]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Automatically save mission state to localStorage whenever it changes
  useEffect(() => {
    saveActiveMissionToLocalStorage(missionState);
  }, [missionState]);
  useEffect(() => {
    if (!missionState?.sessionFinished) return;
    const cached = loadCachedDebrief(missionState.id);
    if (!cached) return;
    if (cached.report) setDebriefReport(cached.report);
    if (cached.summary) setDebriefSummary(cached.summary);
  }, [missionState?.id, missionState?.sessionFinished]);
  useEffect(() => {
    if (!missionState?.id) { setFieldNotes(""); return; }
    try { setFieldNotes(localStorage.getItem(`${FIELD_NOTES_KEY_PREFIX}${missionState.id}`) || ""); } catch { setFieldNotes(""); }
  }, [missionState?.id]);

  useEffect(() => {
    if (!missionState?.id) return;
    try { localStorage.setItem(`${FIELD_NOTES_KEY_PREFIX}${missionState.id}`, fieldNotes); } catch {}
  }, [missionState?.id, fieldNotes]);

  useEffect(() => {
    if (!missionState?.sessionFinished) return;
    setRunArchive(prev => {
      const score = debriefReport?.scores?.overallAssessment;
      const item: ArchivedRun = {
        id: missionState.id,
        title: missionState.title || currentTemplate.title,
        actor: missionState.preferredBondActor || selectedDoctrine.name,
        score,
        finishedAt: new Date().toISOString(),
        turnCount: missionState.timeline?.length || missionState.currentTurn,
        outcome: missionState.outcome || "SESSION_CLOSED"
      };
      const next = [item, ...prev.filter(x => x.id !== item.id)].slice(0, 30);
      try { localStorage.setItem(RUN_ARCHIVE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [missionState?.sessionFinished, missionState?.id, debriefReport?.scores?.overallAssessment]);

  useEffect(() => {
    if (!missionState?.sessionFinished || !missionState.id || !debriefReport?.scores) return;
    const score = Math.round(debriefReport.scores.overallAssessment ?? debriefReport.scores.operationalEffectiveness ?? 50);
    setCareerProfile(prev => {
      const next = awardCareerRun(prev, {
        runId: missionState.id!,
        templateId: missionState.templateId || currentTemplate.id,
        score,
        politicalExposure: missionState.politicalExposure ?? 0
      });
      saveCareerProfile(next);
      return next;
    });
  }, [missionState?.sessionFinished, missionState?.id, debriefReport?.scores?.overallAssessment]);

  const intelIntegrity = useMemo(() => {
    const normalize = (v: string) => v.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(w => w.length > 4);
    const conflicts: string[] = [];
    for (const uncertain of lastSceneIntel.uncertain) {
      const u = new Set(normalize(uncertain));
      for (const confirmed of lastSceneIntel.confirmed) {
        const c = normalize(confirmed);
        const overlap = c.filter(w => u.has(w));
        if (overlap.length >= 2) { conflicts.push(uncertain); break; }
      }
    }
    return { conflicts: [...new Set(conflicts)], score: Math.max(0, 100 - conflicts.length * 25) };
  }, [lastSceneIntel.confirmed, lastSceneIntel.uncertain]);

  useEffect(() => {
    try { localStorage.setItem("mi6_bond_doctrine_v1", selectedDoctrineId); } catch {}
  }, [selectedDoctrineId]);

  useEffect(() => {
    try {
      localStorage.setItem(SIMULATOR_SETTINGS_KEY, JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  useEffect(() => {
    try { localStorage.setItem("mi6_causal_archive_v2", JSON.stringify(causalArchive)); } catch {}
  }, [causalArchive]);

  useEffect(() => {
    if (!isLoadingTurn) {
      setPendingSeconds(0);
      return;
    }
    const startedAt = Date.now();
    setPendingSeconds(0);
    const timer = window.setInterval(() => setPendingSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [isLoadingTurn]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [missionState?.timeline]);

  const handleStartMission = () => {
    soundManager.playTeletype();

    const initialSceneState = createInitialSceneState(
      currentTemplate.location,
      currentTemplate.objective,
      currentTemplate.initialSituation
    );

    const rootNode: CausalTreeNode = {
      id: "node-0",
      turnNumber: 0,
      description: currentTemplate.initialSituation,
      outcome: "INITIAL CONTACT",
      healthChange: 0,
      stealthChange: 0,
      timestamp: new Date().toISOString()
    };

    setMissionState({
      id: "sim-" + Date.now(),
      templateId: currentTemplate.id,
      title: currentTemplate.title,
      doctrineId: selectedDoctrineId,
      preferredBondActor: selectedDoctrine.name,
      currentTurn: 1,
      // Kept for backwards-compatible save files only. It no longer ends the session.
      maxTurns: 10,
      agentId: selectedAgentId,
      agentHealth: 100,
      // Cover/vigilance are scene facts, not Q-Branch loadout scores. Start uncompromised.
      stealthRating: 100,
      alarmLevel: 0,
      currentScenarioText: currentTemplate.initialSituation,
      availableDecisions: currentTemplate.startingNodes.map(n => ({
        id: n.id,
        text: n.text,
        actionType: n.actionType
      })),
      timeline: [
        {
          turn: 0,
          action: "INFILTRATION INITIATED",
          consequence: currentTemplate.initialSituation,
          time: "00:00 ZULU"
        }
      ],
      intelDiscovered: currentTemplate.startingNodes.flatMap(n => n.intelGained ? [n.intelGained] : []).slice(0, 1),
      casualties: [],
      outcome: "IN_PROGRESS",
      causalTree: [rootNode],
      missionProgress: 5,
      coverIntegrity: 100,
      suspicion: 0,
      enemyAlertLevel: "NORMAL",
      civilianDanger: "LOW",
      allyTrust: 70,
      assetTrust: 60,
      intelligenceConfidence: 25,
      evidence: [],
      equipmentCondition: Object.fromEntries(selectedEquipmentIds.map(id => [id, "SERVICEABLE"])),
      politicalExposure: 0,
      collateralDamage: 0,
      timePressure: 20,
      escapeReadiness: 15,
      objectiveStatus: "PENDING",
      unresolvedConsequences: [],
      sceneState: initialSceneState,
      equipmentInventory: [
        ...createMissionEquipmentRuntime(customizedLoadout),
        ...Q_PROTOTYPES.filter(proto => careerProfile.unlockedPrototypeIds.includes(proto.id)).map(proto => ({
          id: proto.id,
          name: proto.name,
          designation: "Q-PROTOTYPE",
          category: "PROTOTYPE",
          status: "READY" as const,
          remainingUses: 1,
          modifications: [proto.description],
          tacticalUnlocks: [proto.directive],
          stealthRating: 75,
          tacticalRating: 85,
          riskRating: 15
        }))
      ],
      vehicleRuntime: {
        id: selectedVehicleId,
        name: store.vehicles.find(v => v.id === selectedVehicleId)?.name || "MI6 field vehicle",
        status: "AVAILABLE"
      },
      fieldAssetCalls: [],
      adversaryState: createAdversaryRuntime(currentTemplate.id),
      phases: getMissionPhases(currentTemplate.id),
      currentPhase: getMissionPhases(currentTemplate.id)[0],
      coverIdentity: getCoverIdentityForOperation(currentTemplate.id),
      lastStatReasons: {},
      sessionFinished: false
    });
    setLastSceneIntel({
      objective: initialSceneState.immediateObjective,
      confirmed: initialSceneState.discoveredIntel,
      uncertain: initialSceneState.activeConsequences,
      threats: initialSceneState.nearbyThreats.length ? initialSceneState.nearbyThreats : [currentTemplate.threatLevel + " operation risk"],
      assets: ["MI6 London operations room", "Q-Branch telemetry"]
    });
    setDebriefReport(null);
    setDebriefSummary(null);
    setLastSituationShifts([]);
    setCausalArchive([rootNode]);
    toastManager.missionStarted(currentTemplate.title, selectedDoctrine.name);
  };

  const handleExecuteAction = async (
    actionText: string,
    requestedActionType?: "STEALTH" | "TACTICAL" | "DIPLOMATIC" | "AGGRESSIVE"
  ) => {
    if (!missionState || isLoadingTurn) return;
    setIsLoadingTurn(true);
    setPendingDirective(actionText);
    setLastTurnEngine(null);
    soundManager.playClick();

    const actionType = requestedActionType || inferActionTypeFromText(actionText);
    const selectedDecision = missionState.availableDecisions.find(d => d.text === actionText);
    const riskResolution = resolveRiskCheck({
      state: missionState,
      actionText,
      actionType,
      probability: successProbabilityResult || calculateSuccessProbability(missionState, selectedDoctrine),
      explicitRisk: selectedDecision?.risk
    });
    const priorScene = ensureSceneState(
      missionState.sceneState,
      currentTemplate.location,
      currentTemplate.objective,
      currentTemplate.initialSituation
    );

    const currentCover = missionState.coverIdentity || getCoverIdentityForOperation(currentTemplate.id);
    const stanceResult = applySocialStanceModifier(currentCover, currentCover.activeStance, actionText);

    const applyTurn = (sceneData: any) => {
      let updatedState = applySimulationTurnToMissionState({
        missionState,
        turn: sceneData,
        actionText
      });
      updatedState = {
        ...updatedState,
        lastRiskResolution: riskResolution,
        coverIdentity: stanceResult.updatedCover,
        equipmentInventory: applyEquipmentWearForAction(
          missionState.equipmentInventory || createMissionEquipmentRuntime(customizedLoadout),
          actionText,
          pendingEquipmentUseId
        ),
        fieldAssetCalls: (missionState.fieldAssetCalls || []).map(call =>
          call.status === "REQUESTED" && actionText.toLowerCase().includes(call.name.toLowerCase().split(" ")[0])
            ? { ...call, status: "ACTIVE" as const }
            : call
        )
      };
      if (pendingEquipmentUseId) setPendingEquipmentUseId(null);
      const sceneState = updatedState.sceneState!;
      const reasons = updatedState.lastStatReasons || {};

      setMissionState(updatedState);
      setLastSceneIntel({
        objective: sceneState.immediateObjective,
        confirmed: sceneState.discoveredIntel.slice(-4),
        uncertain: sceneState.uncertainIntel.slice(-4),
        threats: sceneState.nearbyThreats.slice(-4),
        assets: [
          store.vehicles.find(v => v.id === selectedVehicleId)?.name || "MI6 field transport",
          ...customizedLoadout.items.slice(0, 2).map(item => item.name)
        ]
      });
      setLastSituationShifts(buildSituationShifts(missionState, updatedState, reasons));
      setCausalArchive(prev => {
        const latest = updatedState.causalTree.at(-1);
        if (!latest || prev.some(n => n.id === latest.id)) return prev;
        return [...prev, latest];
      });
      setCustomActionText("");

      if (updatedState.outcome === "DEFEAT") {
        soundManager.playAlarm();
      } else {
        soundManager.playTeletype();
      }
    };

    try {
      const controller = new AbortController();
      const clientTimeout = window.setTimeout(() => controller.abort(), 16000);
      let response: Response;
      try {
        response = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            operation: {
              codename: currentTemplate.codename,
              primaryObjective: currentTemplate.objective,
              locations: currentTemplate.location.split("/").map(part => part.trim()).filter(Boolean)
            },
            agent: selectedAgent || { name: "Commander James Bond", rank: "Commander", role: "00-Section" },
            loadout: {
              equipment: equipmentPromptPayload(customizedLoadout, missionState.equipmentInventory),
              vehicle: missionState.vehicleRuntime || {
                id: selectedVehicleId,
                name: store.vehicles.find(v => v.id === selectedVehicleId)?.name || "Aston Martin DB5",
                status: "AVAILABLE"
              }
            },
            riskResolution,
            adversaryProfile: getAdversaryProfile(currentTemplate.id),
            currentScene: {
              narrative: missionState.currentScenarioText.slice(-1800),
              location: priorScene.currentLocation,
              sceneState: priorScene
            },
            playerAction: actionText,
            actionType,
            agentDoctrine: selectedDoctrine,
            missionState: {
              agentHealth: missionState.agentHealth,
              coverIntegrity: missionState.stealthRating,
              stealthRating: missionState.stealthRating,
              alarmLevel: missionState.alarmLevel,
              suspicion: missionState.suspicion,
              intelligenceConfidence: missionState.intelligenceConfidence,
              politicalExposure: missionState.politicalExposure,
              collateralDamage: missionState.collateralDamage,
              timePressure: missionState.timePressure,
              escapeReadiness: missionState.escapeReadiness,
              equipmentInventory: missionState.equipmentInventory,
              vehicleRuntime: missionState.vehicleRuntime,
              fieldAssetCalls: missionState.fieldAssetCalls,
              adversaryState: missionState.adversaryState || createAdversaryRuntime(currentTemplate.id),
              currentPhase: missionState.currentPhase || getMissionPhases(currentTemplate.id)[0],
              coverIdentity: stanceResult.updatedCover,
              sceneState: priorScene
            },
            sceneNumber: missionState.currentTurn,
            history: missionState.timeline.slice(-3).map(item => ({
              turn: item.turn,
              action: item.action,
              consequence: item.consequence
            }))
          })
        });
      } finally {
        window.clearTimeout(clientTimeout);
      }

      if (!response.ok) throw new Error("Simulation server returned an error");
      const resData = await response.json();
      if (!resData?.data?.sceneState) throw new Error("Simulation response missing persistent sceneState");
      setLastTurnEngine(resData.engine === "gemini" ? "gemini" : "procedural");
      applyTurn(applyRiskResolutionToTurn(resData.data, riskResolution));
    } catch (error) {
      console.warn("Simulation server unavailable or too slow; using continuity-preserving local fallback", error);
      setLastTurnEngine("procedural");
      const fallback = generateProceduralSimulationTurn({
        previousScene: priorScene,
        playerAction: actionText,
        actionType,
        operation: {
          codename: currentTemplate.codename,
          primaryObjective: currentTemplate.objective,
          locations: currentTemplate.location.split("/").map(part => part.trim()).filter(Boolean)
        },
        agentName: selectedAgent?.name || "Commander James Bond, 007",
        equipment: equipmentPromptPayload(customizedLoadout, missionState.equipmentInventory).flatMap(item => [item.name, ...item.tacticalUnlocks]),
        vehicle: store.vehicles.find(v => v.id === selectedVehicleId)?.name,
        doctrineName: selectedDoctrine.name,
        adversaryProfile: getAdversaryProfile(currentTemplate.id),
        sceneNumber: missionState.currentTurn
      });
      applyTurn(applyRiskResolutionToTurn(fallback, riskResolution));
    } finally {
      setIsLoadingTurn(false);
      setPendingDirective(null);
    }
  };

  const tacticalFieldAssets = useMemo(() => {
    const preferred = ["pers-leiter", "pers-moneypenny", "pers-q", "pers-wailin"];
    const ranked = [...store.personnel].sort((a, b) => Number(preferred.includes(b.id)) - Number(preferred.includes(a.id)));
    return ranked
      .filter(person => person.id !== selectedAgentId && person.currentStatus === "ACTIVE")
      .slice(0, 6)
      .map(person => ({ id: person.id, name: person.name, role: person.role }));
  }, [store.personnel, selectedAgentId]);

  const handleDeployEquipment = (equipmentId: string, directive: string) => {
    const item = (missionState?.equipmentInventory || []).find(entry => entry.id === equipmentId);
    if (!item || item.status === "EXHAUSTED" || item.status === "LOST") return;
    setPendingEquipmentUseId(equipmentId);
    setCustomActionText(directive);
    setIsTacticalDrawerOpen(false);
    soundManager.playClick();
  };

  const handleCallFieldAsset = (asset: { id: string; name: string; role: string }) => {
    if (!missionState || missionState.fieldAssetCalls?.some(call => call.id === asset.id)) return;
    setMissionState({
      ...missionState,
      timePressure: Math.min(100, (missionState.timePressure ?? 20) + 5),
      politicalExposure: Math.min(100, (missionState.politicalExposure ?? 0) + 2),
      fieldAssetCalls: [...(missionState.fieldAssetCalls || []), { id: asset.id, name: asset.name, role: asset.role, turn: missionState.currentTurn, status: "REQUESTED" }]
    });
    setCustomActionText(`Contact ${asset.name} (${asset.role}) over a secure SIS channel and request scene-relevant operational support without surrendering control of the mission.`);
    setIsTacticalDrawerOpen(false);
  };

  const handleUnlockPrototype = (prototypeId: string) => {
    const prototype = Q_PROTOTYPES.find(item => item.id === prototypeId);
    setCareerProfile(prev => {
      const next = unlockPrototype(prev, prototypeId);
      saveCareerProfile(next);
      if (prototype && missionState && next.unlockedPrototypeIds.includes(prototypeId) && !(missionState.equipmentInventory || []).some(item => item.id === prototypeId)) {
        setMissionState({
          ...missionState,
          equipmentInventory: [
            ...(missionState.equipmentInventory || createMissionEquipmentRuntime(customizedLoadout)),
            { id: prototype.id, name: prototype.name, designation: "Q-PROTOTYPE", category: "PROTOTYPE", status: "READY", remainingUses: 1, modifications: [prototype.description], tacticalUnlocks: [prototype.directive], stealthRating: 75, tacticalRating: 85, riskRating: 15 }
          ]
        });
      }
      return next;
    });
  };

  const handleDeployPrototype = (prototypeId: string, directive: string) => {
    const runtime = missionState?.equipmentInventory?.find(item => item.id === prototypeId);
    if (runtime?.status === "EXHAUSTED") return;
    setPendingEquipmentUseId(prototypeId);
    setCustomActionText(directive);
    setIsTacticalDrawerOpen(false);
  };

  const handleChangeSocialStance = (stance: SocialStanceType) => {
    if (!missionState) return;
    const currentCover = missionState.coverIdentity || getCoverIdentityForOperation(currentTemplate.id);
    const updatedCover = { ...currentCover, activeStance: stance };
    setMissionState({
      ...missionState,
      coverIdentity: updatedCover
    });
    soundManager.playClick();
    toastManager.info("COVER TRADECRAFT", `Social Espionage Stance: ${stance.replaceAll("_", " ")}`);
  };

  const handleFetchDebrief = async (finalState: MissionState) => {
    setIsDebriefLoading(true);
    try {
      const normalizedTitle = currentTemplate.title.replace(/\s*\(\d{4}\)\s*$/, "").trim().toLowerCase();
      const canonicalBaseline = store.operations.find(op =>
        String(op.name || "").toLowerCase().includes(normalizedTitle) ||
        String(op.codename || "").toLowerCase().includes(normalizedTitle)
      ) || getFilmDebriefBaseline(currentTemplate.title) || null;

      const res = await fetch("/api/debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: { codename: currentTemplate.codename, primaryObjective: currentTemplate.objective, title: currentTemplate.title },
          canonicalBaseline,
          agent: selectedAgent || { name: "Commander James Bond (007)" },
          agentDoctrine: selectedDoctrine,
          missionState: finalState,
          history: finalState.timeline
        })
      });
      if (!res.ok) throw new Error(`Debrief request failed with ${res.status}`);
      const data = await res.json();
      if (data?.debrief && typeof data.debrief === "object") {
        const report = data.debrief as MissionDebriefReport;
        const summary = report.operationSummary || report.agentPerformance || "Operation debrief registered in SIS archives.";
        setDebriefReport(report);
        setDebriefSummary(summary);
        cacheDebrief(finalState.id, report, summary);
      } else {
        const summary = typeof data.debrief === "string" ? data.debrief : "Operation debrief registered in SIS archives.";
        setDebriefSummary(summary);
        cacheDebrief(finalState.id, null, summary);
      }
    } catch (e) {
      console.warn("Final debrief generation failed", e);
      const summary = `SESSION CONCLUDED. The field state is locked, but the detailed AI debrief could not be generated. The archived timeline remains intact for retry/review.`;
      setDebriefSummary(summary);
      cacheDebrief(finalState.id, null, summary);
    } finally {
      setIsDebriefLoading(false);
    }
  };

  const handleFinishSession = () => {
    if (!missionState || missionState.sessionFinished || isLoadingTurn) return;

    const finalState: MissionState = {
      ...missionState,
      sessionFinished: true
    };

    setIsFinishConfirmOpen(false);
    setMissionState(finalState);
    setDebriefReport(null);
    setDebriefSummary("Final field state locked. MI6 is reviewing the complete recorded session.");
    setIsFinalDebriefOpen(true);
    soundManager.playAccessGranted();
    toastManager.info("FIELD SESSION CONCLUDED", `Final telemetry locked for ${currentTemplate.title}. Initializing M's debrief evaluation.`, "SESSION-COMPLETE");
    void handleFetchDebrief(finalState);
  };

  const handleRetryDebrief = () => {
    if (!missionState?.sessionFinished || isDebriefLoading) return;
    setIsFinalDebriefOpen(true);
    setDebriefSummary("Rebuilding the final MI6 assessment from the complete archived session.");
    void handleFetchDebrief(missionState);
  };

  const persistSaveSlots = (slots: SimulationSaveSlot[]) => {
    setSaveSlots(slots);
    try { localStorage.setItem("mi6_mission_save_slots_v1", JSON.stringify(slots)); } catch {}
  };

  const handleManualSave = (customName?: string) => {
    if (!missionState) return;
    const slot: SimulationSaveSlot = {
      slotId: "slot-" + Date.now(),
      slotName: customName || `${missionState.title || currentTemplate.title} // TURN ${missionState.currentTurn}`,
      savedAt: new Date().toISOString(),
      operationId: currentTemplate.id,
      agentId: selectedAgentId,
      sceneNumber: missionState.currentTurn,
      missionState: JSON.parse(JSON.stringify(missionState)),
      scenesHistory: [],
      causalTree: JSON.parse(JSON.stringify(missionState.causalTree)),
      isAutosave: false
    };
    persistSaveSlots([slot, ...saveSlots].slice(0, 12));
    soundManager.playAccessGranted();
    toastManager.success("OPERATIONAL CHECKPOINT SAVED", `Saved state for ${currentTemplate.title} at Turn ${missionState.currentTurn}.`, "VAULT-CHECKPOINT");
  };

  const handleLoadSlot = (slot: SimulationSaveSlot) => {
    const slotTemplate = missionTemplates.find(t => t.id === slot.operationId) || currentTemplate;
    const migratedState: MissionState = migrateLegacyTurnLimitedMissionState({
      ...slot.missionState,
      sceneState: ensureSceneState(
        slot.missionState.sceneState,
        slotTemplate.location,
        slotTemplate.objective,
        slotTemplate.initialSituation
      )
    });
    setSelectedTemplateId(slot.operationId);
    setSelectedAgentId(slot.agentId);
    if (migratedState.doctrineId) setSelectedDoctrineId(migratedState.doctrineId);
    const slotDoctrine = BOND_DOCTRINES.find(d => d.id === migratedState.doctrineId);
    setMissionState({
      ...migratedState,
      preferredBondActor: migratedState.preferredBondActor || slotDoctrine?.name
    });
    setDebriefReport(null);
    setDebriefSummary(null);
    setLastSceneIntel({
      objective: migratedState.sceneState!.immediateObjective,
      confirmed: migratedState.sceneState!.discoveredIntel,
      uncertain: migratedState.sceneState!.uncertainIntel,
      threats: migratedState.sceneState!.nearbyThreats,
      assets: []
    });
    setCausalArchive(prev => {
      const merged = [...prev];
      (slot.causalTree || []).forEach(node => { if (!merged.some(n => n.id === node.id)) merged.push(node); });
      return merged;
    });
    setLastSituationShifts([]);
    soundManager.playPaperRustle();
  };

  const handleDeleteSlot = (slotId: string) => {
    persistSaveSlots(saveSlots.filter(s => s.slotId !== slotId));
  };

  const handleImportSlot = (slot: SimulationSaveSlot) => {
    persistSaveSlots([slot, ...saveSlots].slice(0, 12));
    soundManager.playAccessGranted();
  };

  const selectedAgent = store.personnel.find(p => p.id === selectedAgentId);

  const resetSimulationForSelection = () => {
    // Match Actor Swap: selecting a new actor or film always returns to a clean READY state.
    clearActiveMissionFromLocalStorage();
    setMissionState(null);
    setDebriefSummary(null);
    setDebriefReport(null);
    setLastSituationShifts([]);
    setCustomActionText("");
    setIsLoadingTurn(false);
  };

  const handleTerminateOperation = () => {
    if (!missionState) return;
    const confirmed = window.confirm(
      "TERMINATE OPERATION? This clears the active session and returns to Mission Selection. Manual save slots are not deleted."
    );
    if (!confirmed) return;

    clearActiveMissionFromLocalStorage();
    setMissionState(null);
    setDebriefSummary(null);
    setDebriefReport(null);
    setIsFinalDebriefOpen(false);
    setIsFinishConfirmOpen(false);
    setIsMissionMenuOpen(false);
    setLastSituationShifts([]);
    setCustomActionText("");
    setPendingDirective(null);
    setIsLoadingTurn(false);
    setLastTurnEngine(null);
    const freshScene = createInitialSceneState(currentTemplate.location, currentTemplate.objective, currentTemplate.initialSituation);
    setLastSceneIntel({
      objective: freshScene.immediateObjective,
      confirmed: [],
      uncertain: [],
      threats: [],
      assets: []
    });
    soundManager.playClick();
  };

  const handleOperationChange = (nextTemplateId: string) => {
    if (nextTemplateId === selectedTemplateId) return;
    const nextTemplate = missionTemplates.find(t => t.id === nextTemplateId);
    if (!nextTemplate) return;

    soundManager.playPaperRustle();
    resetSimulationForSelection();

    // A mission choice is a full file load. Rebuild every dependent pre-deployment field now.
    setSelectedTemplateId(nextTemplateId);
    setSelectedAgentId(nextTemplate.defaultAgentId);
    setSelectedEquipmentIds([...nextTemplate.recommendedEquipment]);
    setSelectedVehicleId(nextTemplate.recommendedVehicle || "veh-db5");
    const nextInitialScene = createInitialSceneState(nextTemplate.location, nextTemplate.objective, nextTemplate.initialSituation);
    setLastSceneIntel({
      objective: nextInitialScene.immediateObjective,
      confirmed: [],
      uncertain: ["Operation file loaded. Awaiting deployment for live field confirmation."],
      threats: [`${nextTemplate.threatLevel} operation risk`],
      assets: ["MI6 London operations room", "Q-Branch telemetry"]
    });

    setConfigurationNotice(`MISSION FILE LOADED — ${nextTemplate.title.toUpperCase()} // READY FOR DEPLOYMENT`);
    window.setTimeout(() => setConfigurationNotice(null), 3000);
  };

  const handleDoctrineChange = (nextDoctrineId: string) => {
    if (nextDoctrineId === selectedDoctrineId) return;
    const nextDoctrine = BOND_DOCTRINES.find(d => d.id === nextDoctrineId);
    if (!nextDoctrine) return;

    soundManager.playClick();
    resetSimulationForSelection();
    setSelectedDoctrineId(nextDoctrineId);
    setConfigurationNotice(`007 PROFILE LOADED — ${nextDoctrine.name.toUpperCase()} // READY FOR DEPLOYMENT`);
    window.setTimeout(() => setConfigurationNotice(null), 3000);
  };

  const typedObjective = useTypewriter(currentTemplate.objective, 15);
  const typedSituation = useTypewriter(currentTemplate.initialSituation, 10);

  return (
    <div className="space-y-5 mi6-swap-grid bg-[#090c11] border border-white/8 rounded-[30px] p-4 sm:p-6 shadow-[0_40px_110px_rgba(0,0,0,0.5)]">
      {/* Simulator command dashboard header */}
      <div className="mi6-swap-panel rounded-[28px] p-5 lg:p-6 font-mono text-xs shadow-[0_26px_70px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.25fr] gap-4 items-center">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-red-950/70 border border-red-800 flex items-center justify-center text-red-300 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-amber-500 uppercase tracking-[0.18em] text-[10px]">TACTICAL OPERATIONS // EYES ONLY</span>
                <span className="bg-[#26231f] border border-[#51483d] text-stone-400 px-2 py-0.5 rounded text-[9px]">SIS SIMULATION DESK</span>
              </div>
              <h2 className="mi6-display-title text-[34px] leading-none text-stone-100 tracking-tight truncate mt-2">{currentTemplate.title}</h2>
              <div className="text-[10px] text-stone-500 mt-1 truncate">{missionState?.sceneState?.currentLocation || currentTemplate.location} // {missionState ? `LIVE TURN ${missionState.currentTurn}` : "PRE-DEPLOYMENT"}</div>
            </div>
          </div>

          {missionState && <div className="flex flex-wrap items-center justify-end gap-2 font-mono">
            <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-right">
              <div className="text-[8px] uppercase tracking-[0.16em] text-stone-600">ACTIVE 007</div>
              <div className="text-[10px] font-black text-violet-200">{selectedDoctrine.name.toUpperCase()}</div>
            </div>
            {successProbabilityResult && (
              <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-right">
                <div className="text-[8px] uppercase tracking-[0.16em] text-stone-600">SUCCESS PROB</div>
                <div className="flex items-center justify-end gap-1.5">
                  <span className={`text-[10px] font-black ${successProbabilityResult.ratingColor}`}>
                    {successProbabilityResult.probability}%
                  </span>
                  <span className={`text-[8px] px-1 rounded font-bold ${successProbabilityResult.badgeBg}`}>
                    {successProbabilityResult.level}
                  </span>
                </div>
              </div>
            )}
            <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-right">
              <div className="text-[8px] uppercase tracking-[0.16em] text-stone-600">MISSION STATE</div>
              <div className="text-[10px] font-black text-amber-200">TURN {missionState.currentTurn} // {getLiveStageLabel(missionState.currentTurn).toUpperCase()}</div>
            </div>
            <button
              type="button"
              onClick={() => setIsMissionMenuOpen(true)}
              className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[10px] font-black text-amber-200 hover:bg-amber-500/15 flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" /> MISSION MENU
            </button>
          </div>}
        </div>
      </div>

      {configurationNotice && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 font-mono text-[10px] sm:text-[11px] font-bold tracking-[0.12em] text-amber-200 flex items-center justify-between gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <span>{configurationNotice}</span>
          <span className="text-stone-500 shrink-0">STATE SYNCHRONIZED</span>
        </div>
      )}

      {/* PRE-DEPLOYMENT: Swap-style selection flow */}
      {!missionState ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono">
            {[
              ["01", "SELECT FILM", currentTemplate.title],
              ["02", "PREFERRED BOND", selectedDoctrine.name],
              ["03", "MISSION BRIEF + INSERTION", "READY TO DEPLOY"]
            ].map(([step, title, detail], idx) => (
              <div key={step} className={`rounded-2xl border px-4 py-3 ${idx === 2 ? "border-amber-500/35 bg-amber-500/[0.07]" : "border-white/8 bg-white/[0.02]"}`}>
                <div className="text-[8px] uppercase tracking-[0.2em] text-stone-600">STEP {step}</div>
                <div className="mt-1 text-[11px] font-black text-stone-100">{title}</div>
                <div className="mt-1 text-[9px] text-amber-300 truncate">{detail}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[260px_320px_minmax(0,1fr)] gap-5 items-start">
            {/* STEP 2 — Bond incarnation */}
            <section className="mi6-swap-panel-soft rounded-[26px] p-4 order-2">
              <div className="pb-3 border-b border-white/6">
                <div className="text-[8px] font-mono uppercase tracking-[0.22em] text-violet-400">02 // CASTING MATRIX</div>
                <div className="mt-1 text-lg font-black text-stone-100">Choose your preferred James Bond</div>
                <p className="mt-1.5 text-[9px] leading-relaxed text-stone-500 font-sans">Pick the Bond you prefer to deploy. The final AI debrief will independently judge whether your recorded choices actually matched him or another Bond.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {BOND_DOCTRINES.map((doctrine) => {
                  const active = doctrine.id === selectedDoctrineId;
                  return (
                    <button
                      key={doctrine.id}
                      type="button"
                      onClick={() => handleDoctrineChange(doctrine.id)}
                      className={`bond-actor-card group relative overflow-hidden rounded-2xl border text-left transition-all ${active ? "is-active" : ""}`}
                    >
                      <ActorPortrait
                        src={doctrine.portraitUrl}
                        name={doctrine.name}
                        className="h-24 w-full border-b border-white/8"
                        imgClassName="grayscale group-hover:grayscale-0 transition-all duration-300"
                      />
                      <div className="p-2.5">
                        <div className="text-[10px] font-black text-[var(--text-primary)] truncate">{doctrine.name}</div>
                        <div className="mt-1 text-[8px] font-mono text-[var(--text-muted)]">{doctrine.era}</div>
                      </div>
                      {active && <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 rounded-full bg-[var(--accent-primary)] p-0.5 text-[var(--accent-contrast)]" />}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-3">
                <div className="text-[8px] uppercase tracking-[0.18em] text-violet-400 font-mono">YOUR PREFERRED BOND // PRE-DEPLOYMENT PICK</div>
                <div className="mt-1 text-sm font-black text-stone-100">{selectedDoctrine.name}</div>
                <p className="mt-2 text-[10px] leading-relaxed text-stone-500">{selectedDoctrine.description}</p>
                <div className="grid grid-cols-3 gap-1.5 mt-3 text-center font-mono">
                  <div className="bg-black/20 rounded-lg p-2"><span className="block text-[7px] text-stone-600">TACTICAL</span><strong className="text-sky-300">{selectedDoctrine.tacticalIntelligence}</strong></div>
                  <div className="bg-black/20 rounded-lg p-2"><span className="block text-[7px] text-stone-600">CHARM</span><strong className="text-amber-300">{selectedDoctrine.charm}</strong></div>
                  <div className="bg-black/20 rounded-lg p-2"><span className="block text-[7px] text-stone-600">PATIENCE</span><strong className="text-emerald-300">{selectedDoctrine.patience}</strong></div>
                </div>
              </div>
            </section>

            {/* STEP 1 — Mission file */}
            <section className="mi6-swap-panel-soft rounded-[26px] p-4 order-1">
              <div className="pb-3 border-b border-white/6">
                <div className="text-[8px] font-mono uppercase tracking-[0.22em] text-amber-400">01 // FILM ARCHIVE</div>
                <div className="mt-1 text-lg font-black text-stone-100">Select mission file</div>
              </div>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleOperationChange(e.target.value)}
                className="mt-4 w-full bg-[#0f1319] border border-white/10 text-stone-100 px-3 py-3 rounded-xl focus:outline-none focus:border-amber-500 text-[11px] font-mono"
              >
                <optgroup label="BOND FILM OPERATIONS — EON ARCHIVE (25)">
                  {missionTemplates.filter(t => t.id.startsWith("film-") && !t.id.includes("casino-royale-1967") && !t.id.includes("never-say-never-again")).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </optgroup>
                <optgroup label="LEGACY / NON-EON FILM FILES">
                  {missionTemplates.filter(t => t.id === "film-casino-royale-1967" || t.id === "film-never-say-never-again").map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </optgroup>
                <optgroup label="ORIGINAL MI6 SIMULATIONS">
                  {missionTemplates.filter(t => !t.id.startsWith("film-")).map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </optgroup>
              </select>

              <div key={currentTemplate.id} className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-stone-600">Loaded file</div>
                    <div className="mt-1 text-sm font-black text-stone-100">{currentTemplate.title}</div>
                  </div>
                  <span className="rounded-md border border-red-800/50 bg-red-950/20 px-2 py-1 text-[8px] font-mono text-red-300">{currentTemplate.threatLevel}</span>
                </div>
                <div className="mt-3 text-[9px] font-mono uppercase tracking-[0.14em] text-amber-300">{currentTemplate.location}</div>
                <p className="mt-2 text-[10px] leading-relaxed text-stone-500">{currentTemplate.objective}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[9px]">
                <div className="rounded-xl border border-white/6 bg-black/20 p-3 flex items-center gap-2">
                  <img src={selectedDoctrine.portraitUrl} alt={selectedDoctrine.name} className="w-8 h-8 rounded-full object-cover border border-amber-500/50" />
                  <div>
                    <span className="block text-stone-600 text-[7px]">AGENT (DOCTRINE)</span>
                    <strong className="text-stone-200">{currentTemplate.availableAgents.find(a => a.id === selectedAgentId)?.name || "007"} ({selectedDoctrine.name})</strong>
                  </div>
                </div>
                <div className="rounded-xl border border-white/6 bg-black/20 p-3"><span className="block text-stone-600 text-[7px]">Q ITEMS</span><strong className="text-stone-200">{selectedEquipmentIds.length}</strong></div>
                <div className="rounded-xl border border-white/6 bg-black/20 p-3 col-span-2"><span className="block text-stone-600 text-[7px]">VEHICLE</span><strong className="text-stone-200">{store.vehicles.find(v => v.id === selectedVehicleId)?.name || selectedVehicleId}</strong></div>
              </div>
            </section>

            {/* STEP 3 — Live briefing */}
            <section key={`${selectedDoctrineId}-${selectedTemplateId}`} className="mi6-swap-panel rounded-[28px] overflow-hidden animate-in fade-in duration-200 order-3">
              <div className="px-5 py-4 border-b border-white/6 bg-black/15 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[8px] font-mono uppercase tracking-[0.22em] text-emerald-400">03 // LIVE BRIEFING</div>
                  <div className="mi6-display-title mt-1 text-3xl text-stone-100">{doctrineBrief.headline}</div>
                </div>
                <span className="rounded-full border border-emerald-800/60 bg-emerald-950/25 px-3 py-1.5 text-[8px] font-mono uppercase tracking-[0.14em] text-emerald-300">SYNCHRONIZED</span>
              </div>

              <div className="p-5 space-y-4">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 animate-in fade-in duration-1000">
                  <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-amber-400">Mission Brief // Primary Objective</div>
                  <p className="mt-2 text-[12px] leading-relaxed text-stone-200">{typedObjective}</p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-black/20 p-4 animate-in fade-in duration-1000">
                  <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-emerald-400">Insertion // Original Film Starting Situation</div>
                  <p className="mt-2 text-[12px] leading-relaxed text-stone-300">{typedSituation}</p>
                </div>

                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-4">
                  <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-violet-400">Preferred Bond Doctrine Read</div>
                  <p className="mt-2 text-[11px] leading-relaxed text-stone-300">{doctrineBrief.approach}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {doctrineBrief.strengths.map(strength => <span key={strength} className="rounded-full border border-violet-500/20 bg-black/20 px-2 py-1 text-[8px] font-mono text-violet-300">{strength}</span>)}
                  </div>
                </div>

                <div>
                  <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-stone-600 mb-2">Recommended Openings For This Bond</div>
                  <div className="space-y-2">
                    {doctrineRecommendedStarts.map((node, idx) => (
                      <div key={node.id} className="rounded-xl border border-white/7 bg-white/[0.02] px-3 py-3 flex gap-3">
                        <div className="w-6 h-6 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center justify-center text-[9px] font-black shrink-0">{idx + 1}</div>
                        <div>
                          <div className="text-[8px] font-mono uppercase tracking-[0.15em] text-amber-300">{node.actionType} // MATCH {doctrineChoiceScore(node.actionType)}</div>
                          <div className="mt-1 text-[10px] leading-relaxed text-stone-300">{node.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleStartMission}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-5 py-4 flex items-center justify-between gap-4 shadow-[0_20px_45px_rgba(217,165,59,.16)]"
                >
                  <div className="text-left">
                    <div className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-60">Configuration locked</div>
                    <div className="mt-1 text-sm font-black">DEPLOY {selectedDoctrine.name.toUpperCase()} INTO {currentTemplate.title.toUpperCase()}</div>
                  </div>
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : (
        /* Active Mission Simulation Cockpit */
        <div className="space-y-4">
          {/* Compact mission bar. Advanced tools live in the Mission Menu. */}
          <div className="mi6-swap-panel-soft rounded-[24px] px-3.5 py-3 shadow-lg font-mono flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-amber-500 text-black px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.12em]">{getLiveStageLabel(missionState.currentTurn)}</span>
              <span className="text-[10px] text-stone-400">TURN {missionState.currentTurn}</span>
              <span className="text-[10px] text-stone-600">•</span>
              <span className="text-[10px] text-stone-300 font-bold">{currentTemplate.title}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => handleManualSave()} className="text-[9px] text-amber-200 hover:text-white border border-amber-900/60 px-2.5 py-1.5 rounded-lg bg-amber-950/30 flex items-center gap-1.5"><Save className="w-3 h-3" /><span>QUICK SAVE</span></button>
              {missionState.sessionFinished && <button onClick={() => setIsFinalDebriefOpen(true)} className="text-[9px] text-emerald-100 hover:text-white border border-emerald-600/70 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 flex items-center gap-1.5"><FileCheck className="w-3 h-3" /><span>FINAL DEBRIEF</span></button>}
              <button onClick={handleTerminateOperation} className="text-[9px] text-red-200 hover:text-white border border-red-900/70 px-2.5 py-1.5 rounded-lg bg-red-950/25 flex items-center gap-1.5"><Trash2 className="w-3 h-3" /><span>TERMINATE OPERATION</span></button>
              <button onClick={() => setIsMissionMenuOpen(true)} className="text-[9px] text-stone-100 hover:text-white border border-white/12 px-2.5 py-1.5 rounded-lg bg-[#15171b] flex items-center gap-1.5"><SlidersHorizontal className="w-3 h-3" /><span>MENU / SETTINGS</span></button>
            </div>
          </div>

          {/* Dedicated Telemetry Strip */}
          <div className="rounded-2xl border border-white/8 bg-[#0e1218]/95 px-4 py-2.5 shadow-md flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 divide-x divide-white/10 text-[11px]">
              <div className="flex items-center space-x-1.5 pl-0">
                <span className="text-stone-500 font-bold">HEALTH</span>
                <span className={`font-black ${missionState.agentHealth > 60 ? "text-emerald-400" : missionState.agentHealth > 30 ? "text-amber-400" : "text-red-400"}`}>{missionState.agentHealth ?? 100}</span>
              </div>
              <div className="flex items-center space-x-1.5 pl-3 sm:pl-4">
                <span className="text-stone-500 font-bold">COVER</span>
                <span className={`font-black ${(missionState.coverIntegrity ?? missionState.stealthRating ?? 80) > 50 ? "text-sky-400" : "text-amber-400"}`}>{missionState.coverIntegrity ?? missionState.stealthRating ?? 80}</span>
              </div>
              <div className="flex items-center space-x-1.5 pl-3 sm:pl-4">
                <span className="text-stone-500 font-bold">SUSPICION</span>
                <span className={`font-black ${(missionState.suspicion ?? 15) < 40 ? "text-stone-200" : "text-amber-400"}`}>{missionState.suspicion ?? 15}</span>
              </div>
              <div className="flex items-center space-x-1.5 pl-3 sm:pl-4">
                <span className="text-stone-500 font-bold">INTEL</span>
                <span className="font-black text-amber-300">{missionState.intelligenceConfidence ?? 30}</span>
              </div>
              <div className="flex items-center space-x-1.5 pl-3 sm:pl-4">
                <span className="text-stone-500 font-bold">EXPOSURE</span>
                <span className={`font-black ${(missionState.politicalExposure ?? 5) < 30 ? "text-emerald-400" : "text-red-400"}`}>{missionState.politicalExposure ?? 5}</span>
              </div>
              <div className="flex items-center space-x-1.5 pl-3 sm:pl-4">
                <span className="text-stone-500 font-bold">PROGRESS</span>
                <span className="font-black text-violet-300">{missionState.missionProgress ?? Math.min(95, (missionState.currentTurn || 1) * 12)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setIsTelemetryModalOpen(true);
              }}
              className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400 text-amber-300 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>OPEN TELEMETRY</span>
            </button>
          </div>

          {/* Operational Phase Progression Stepper */}
          {missionState.phases && missionState.phases.length > 0 && (
            <div className="rounded-2xl border border-white/8 bg-[#0a0d12]/90 p-3 shadow-md font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-amber-400 font-bold">OPERATIONAL PHASE</span>
                  <span className="text-[10px] text-white font-black">{missionState.currentPhase?.name || missionState.phases[0].name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                  missionState.currentPhase?.hazardLevel === "CRITICAL" ? "bg-red-950/60 border-red-600 text-red-300" :
                  missionState.currentPhase?.hazardLevel === "HIGH" ? "bg-orange-950/60 border-orange-600 text-orange-300" :
                  missionState.currentPhase?.hazardLevel === "MODERATE" ? "bg-amber-950/60 border-amber-600 text-amber-300" :
                  "bg-emerald-950/60 border-emerald-600 text-emerald-300"
                }`}>
                  {missionState.currentPhase?.hazardLevel || "MODERATE"} HAZARD
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {missionState.phases.map((phase, idx) => {
                  const isActive = (missionState.currentPhase?.id || missionState.phases![0].id) === phase.id;
                  const isDone = phase.isComplete || (missionState.currentPhase ? phase.order < missionState.currentPhase.order : false);
                  return (
                    <div
                      key={phase.id}
                      className={`rounded-xl border p-2 text-left transition-all ${
                        isActive
                          ? "border-amber-500/80 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                          : isDone
                          ? "border-emerald-800/60 bg-emerald-950/20 opacity-80"
                          : "border-white/5 bg-black/30 opacity-40"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[7px] uppercase font-bold">
                        <span className={isActive ? "text-amber-300" : isDone ? "text-emerald-300" : "text-stone-500"}>
                          STAGE 0{idx + 1}
                        </span>
                        {isDone ? <span className="text-emerald-400 font-black">✓ DONE</span> : isActive ? <span className="text-amber-400 font-black animate-pulse">● ACTIVE</span> : <span className="text-stone-600">PENDING</span>}
                      </div>
                      <div className={`mt-0.5 text-[9px] font-black truncate ${isActive ? "text-white" : isDone ? "text-stone-300" : "text-stone-500"}`}>
                        {phase.shortTitle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thin stage rail: optional, hidden by default for a cleaner mission view */}
          {preferences.showStageRail && (
          <div className="grid grid-cols-5 md:grid-cols-10 gap-1 font-mono">
            {MISSION_STAGES.map((stage, idx) => {
              const turn = idx + 1;
              const active = missionState.currentTurn === turn;
              const complete = missionState.currentTurn > turn;
              return (
                <div key={stage} className={`rounded-lg border px-1 py-1.5 text-center transition-all ${active ? "bg-amber-500 border-amber-300 text-black shadow-md" : complete ? "bg-emerald-950/50 border-emerald-800/70 text-emerald-300" : "bg-[#0f1319] border-white/8 text-stone-600"}`}>
                  <div className="text-[8px] font-black">{String(turn).padStart(2,"0")}</div>
                  <div className="text-[7px] uppercase truncate">{stage}</div>
                </div>
              );
            })}
            <div className={`rounded-lg border px-1 py-1.5 text-center transition-all ${missionState.currentTurn >= 10 ? "bg-amber-500 border-amber-300 text-black shadow-md" : "bg-[#0f1319] border-white/8 text-stone-600"}`}>
              <div className="text-[8px] font-black">10+</div>
              <div className="text-[7px] uppercase truncate">Open Ops</div>
            </div>
          </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Central game surface */}
            <div className={`${preferences.hudMode === "focused" ? "xl:col-span-9" : "xl:col-span-8"} space-y-4`}>
              {/* Active Adversary Master Plan Banner */}
              {missionState.adversaryState && (
                <div className="rounded-2xl border border-red-900/40 bg-gradient-to-r from-red-950/40 via-[#150a0a] to-[#0f1319] p-3.5 shadow-lg font-mono">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-300 shrink-0 shadow-inner">
                        <span className="text-sm font-black">⚠️</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] uppercase tracking-[0.2em] text-red-400 font-bold">ADVERSARY MASTER PLAN CLOCK</span>
                          <span className="text-[8px] text-stone-500">• {missionState.adversaryState.name}</span>
                        </div>
                        <div className="text-xs font-black text-stone-100">{missionState.adversaryState.schemeName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[7px] uppercase text-stone-400">CRITICAL DEADLINE</div>
                        <div className="text-xs font-black text-amber-300">~{missionState.adversaryState.turnsToCriticalDeadline} TURNS LEFT</div>
                      </div>
                      <div className="text-right pl-3 border-l border-white/10">
                        <div className="text-[7px] uppercase text-stone-400">SCHEME PROGRESS</div>
                        <div className={`text-base font-black ${
                          missionState.adversaryState.masterPlanProgress >= 70 ? "text-red-400 animate-pulse" :
                          missionState.adversaryState.masterPlanProgress >= 40 ? "text-orange-300" :
                          "text-amber-300"
                        }`}>{missionState.adversaryState.masterPlanProgress}%</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 w-full bg-black/60 rounded-full h-1.5 border border-red-900/40 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 h-full transition-all duration-500"
                      style={{ width: `${missionState.adversaryState.masterPlanProgress}%` }}
                    />
                  </div>
                  {missionState.adversaryState.activeCountermeasures && missionState.adversaryState.activeCountermeasures.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[7px]">
                      <span className="text-stone-500 uppercase">ACTIVE COUNTERMEASURES:</span>
                      {missionState.adversaryState.activeCountermeasures.slice(-3).map((cm, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded border border-red-900/40 bg-red-950/20 text-red-300">
                          {cm}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <section className="mi6-swap-panel rounded-[28px] shadow-[0_30px_80px_rgba(0,0,0,0.45)] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/6 bg-black/18 flex flex-wrap items-center justify-between gap-3 font-mono">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.22em] text-amber-400 font-bold">Current Situation</div>
                    <div className="mi6-display-title text-2xl text-stone-100 mt-1">FIELD CONTROL // {missionState.sceneState?.currentLocation || currentTemplate.location}</div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] uppercase">
                    {isLoadingTurn && <span className="px-2 py-1 rounded border border-amber-700/60 bg-amber-950/30 text-amber-300 animate-pulse">EXECUTING {pendingSeconds}s</span>}
                    {preferences.showEngineStatus && !isLoadingTurn && lastTurnEngine && <span className={`px-2 py-1 rounded border ${lastTurnEngine === "gemini" ? "border-emerald-800/60 bg-emerald-950/25 text-emerald-300" : "border-sky-800/60 bg-sky-950/25 text-sky-300"}`}>{lastTurnEngine === "gemini" ? "AI CORE" : "FAST FALLBACK"}</span>}
                    <span className="px-2 py-1 rounded border border-[#5b5145] bg-[#15161a] text-stone-400">STATUS {missionState.sessionFinished ? "SESSION_CLOSED" : missionState.outcome}</span>
                    <span className="px-2 py-1 rounded border border-red-900/60 bg-red-950/20 text-red-300">THREAT {currentTemplate.threatLevel}</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_190px] gap-3">
                    <div className="mi6-swap-panel-soft rounded-[24px] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-stone-500 mb-2">Live narrative</div>
                      <p className="text-stone-100 text-[13px] leading-6 font-mono">{missionState.currentScenarioText}</p>
                    </div>
                    <div className="rounded-[24px] border border-amber-500/20 bg-amber-500/[0.06] p-4 font-mono">
                      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-amber-300">Immediate Objective</div>
                      <div className="text-[11px] text-stone-200 mt-2 leading-relaxed">{lastSceneIntel.objective}</div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-amber-900/30">
                        <div><span className="block text-[8px] text-stone-600">INTEL</span><strong className="text-sm text-emerald-300">{missionState.intelligenceConfidence ?? 25}%</strong></div>
                        <div><span className="block text-[8px] text-stone-600">EXPOSURE</span><strong className="text-sm text-red-300">{missionState.politicalExposure ?? 0}%</strong></div>
                      </div>
                    </div>
                  </div>

                  {isLoadingTurn && pendingDirective && (
                    <div className="rounded-xl border border-amber-700/40 bg-amber-500/[0.06] px-3 py-2.5 font-mono">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-300">Simulation core // executing directive</div>
                          <div className="mt-1 text-[10px] text-stone-300 line-clamp-2">{pendingDirective}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-lg font-black tabular-nums text-amber-300">{pendingSeconds}s</div>
                          <div className="text-[7px] uppercase text-stone-600">AI budget 12s</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {preferences.showSituationShifts && lastSituationShifts.length > 0 && <SituationShiftCard shifts={lastSituationShifts} />}

                  {missionState.outcome === "IN_PROGRESS" && !missionState.sessionFinished && (
                    <div className="space-y-3 font-mono">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#5b5145] pt-4">
                        <div>
                          <div className="text-[9px] uppercase tracking-[0.2em] text-stone-500">Decision Board</div>
                          <div className="text-xs font-black text-stone-100 mt-0.5">CHOOSE DIRECTIVE FOR {selectedAgent?.alias || "007"}</div>
                        </div>
                        <div className="text-[9px] text-stone-500 text-right">One action advances the operation.</div>
                      </div>

                      {/* Cover Identity & Social Espionage Stance Bar */}
                      {missionState.coverIdentity && (
                        <div className="rounded-xl border border-cyan-800/40 bg-cyan-950/15 p-2.5 font-mono flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[7px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/60">
                              COVER: {missionState.coverIdentity.alias}
                            </span>
                            <span className="text-[8px] text-stone-400">
                              INTEGRITY <strong className="text-cyan-300 font-bold">{missionState.coverIdentity.credentialIntegrity}%</strong>
                            </span>
                            <span className="text-[8px] text-stone-600">•</span>
                            <span className="text-[8px] text-stone-400">
                              SUSPICION <strong className="text-amber-300 font-bold">{missionState.coverIdentity.suspicionLevel}%</strong>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[7px] text-stone-500 uppercase mr-1">STANCE:</span>
                            {[
                              { id: "PLAY_PERSONA", label: "Persona", tone: "border-emerald-700 text-emerald-300" },
                              { id: "PSYCHOLOGICAL_PROVOCATION", label: "Provoke", tone: "border-violet-700 text-violet-300" },
                              { id: "CALCULATED_BLUFF", label: "Bluff", tone: "border-amber-700 text-amber-300" },
                              { id: "DEEP_COVER_SILENCE", label: "Silence", tone: "border-sky-700 text-sky-300" }
                            ].map(st => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => handleChangeSocialStance(st.id as SocialStanceType)}
                                className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-wide border transition-all ${
                                  missionState.coverIdentity?.activeStance === st.id
                                    ? `${st.tone} bg-white/10 shadow-sm ring-1 ring-white/20`
                                    : "border-white/8 bg-black/40 text-stone-500 hover:text-stone-300"
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {preferences.showSuggestedActions && <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        {missionState.availableDecisions.map((decision, idx) => (
                          <button
                            key={decision.id}
                            disabled={isLoadingTurn}
                            onClick={() => handleExecuteAction(decision.text, decision.actionType)}
                            className="group text-left bg-[#17191d] hover:bg-[#202228] border border-[#554b40] hover:border-amber-600 rounded-xl p-3.5 transition-all disabled:opacity-50 flex items-start gap-3"
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#111216] border border-[#494138] flex items-center justify-center text-[10px] font-black text-stone-500 shrink-0">{String(idx + 1).padStart(2,"0")}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase border ${
                                  decision.actionType === "STEALTH" ? "bg-emerald-950/50 text-emerald-300 border-emerald-800" :
                                  decision.actionType === "TACTICAL" ? "bg-sky-950/50 text-sky-300 border-sky-800" :
                                  decision.actionType === "DIPLOMATIC" ? "bg-amber-950/50 text-amber-300 border-amber-800" :
                                  "bg-red-950/50 text-red-300 border-red-800"
                                }`}>{decision.actionType}</span>
                                {decision.risk && <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase border ${decision.risk === "CRITICAL" ? "border-red-700 text-red-300" : decision.risk === "HIGH" ? "border-orange-700 text-orange-300" : decision.risk === "MEDIUM" ? "border-yellow-700 text-yellow-300" : "border-emerald-800 text-emerald-300"}`}>{decision.risk} RISK</span>}
                                {doctrineChoiceScore(decision.actionType) >= 75 && (
                                  <span className="text-[8px] text-amber-300 font-mono bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                                    <span>⭐ {selectedDoctrine.name.split(" ")[1] || selectedDoctrine.name} SYNERGY (+PROB)</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] leading-relaxed text-stone-200 group-hover:text-white">{decision.text}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-amber-400 mt-1 shrink-0" />
                          </button>
                        ))}
                      </div>}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (customActionText.trim()) handleExecuteAction(customActionText, inferActionTypeFromText(customActionText));
                        }}
                        className="bg-[#15161a] border border-[#4b4339] rounded-xl p-3"
                      >
                        <div className="text-[8px] uppercase tracking-[0.16em] text-stone-600 mb-2">Custom field directive</div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customActionText}
                            onChange={(e) => setCustomActionText(e.target.value)}
                            placeholder="Describe a deception, surveillance move, contact, route change or tactical action..."
                            disabled={isLoadingTurn}
                            className="flex-1 bg-[#101216] border border-[#554b40] rounded-lg px-3 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-600 font-mono"
                          />
                          <button type="submit" disabled={isLoadingTurn || !customActionText.trim()} className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-[10px] font-black flex items-center gap-1.5 disabled:opacity-50">
                            <Send className="w-3.5 h-3.5" /><span>EXECUTE</span>
                          </button>
                        </div>
                      </form>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] text-stone-600 pt-1">
                        <span>FIELD SUPPORT: {missionState.vehicleRuntime?.name || store.vehicles.find(v => v.id === selectedVehicleId)?.name || "Aston Martin DB5"} • {(missionState.equipmentInventory || []).filter(item => item.status !== "LOST").length || customizedLoadout.items.length} Q-Branch items</span>
                        <button type="button" onClick={() => setIsTacticalDrawerOpen(true)} className="rounded-lg border border-cyan-800/50 bg-cyan-950/20 px-3 py-1.5 text-[8px] font-black text-cyan-200 hover:border-cyan-500">TACTICAL COMMAND DRAWER</button>
                      </div>
                    </div>
                  )}

                  {missionState.sessionFinished && (
                    <div className="p-4 rounded-xl border font-mono bg-emerald-950/30 border-emerald-700 text-emerald-100">
                      <div className="flex items-center gap-2 font-black text-sm mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>SESSION CONCLUDED // DEBRIEF</span>
                      </div>
                      <p className="text-xs leading-relaxed text-stone-300 mb-3">{debriefSummary || "Final field state locked. MI6 assessment is being prepared from the complete recorded session."}</p>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setIsFinalDebriefOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-500">OPEN FINAL DEBRIEF</button>
                        {!debriefReport && <button disabled={isDebriefLoading} onClick={handleRetryDebrief} className="bg-amber-500 disabled:opacity-50 text-black px-4 py-2 rounded-lg font-bold hover:bg-amber-400">{isDebriefLoading ? "GENERATING FULL REPORT…" : "GENERATE / RETRY FULL DEBRIEF"}</button>}
                        <button onClick={handleStartMission} className="bg-[#17191d] text-stone-200 border border-stone-700 px-4 py-2 rounded-lg font-bold hover:border-amber-600">REPLAY</button>
                        <button onClick={() => handleManualSave()} className="bg-[#17191d] text-stone-200 border border-stone-700 px-4 py-2 rounded-lg font-bold hover:border-amber-600">ARCHIVE FINAL STATE</button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {missionState.sessionFinished && <EnhancedDebriefPanel state={missionState} report={debriefReport} />}
              
              {missionState.sessionFinished && <SimulationHistoryTab />}

              {/* Operational history stays available without occupying the live play surface */}
              {preferences.showRecentActivity && (
              <details className="mi6-swap-panel-soft rounded-[18px] px-3 py-2.5 font-mono group">
                <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase tracking-[0.18em] text-stone-500">Operational History</span>
                    <span className="ml-2 text-[9px] text-stone-600">{missionState.timeline.length} entries</span>
                    <div className="mt-0.5 text-[9px] text-stone-400 truncate">{missionState.timeline.at(-1)?.action || "No field log yet"}</div>
                  </div>
                  <span className="text-[8px] text-amber-400 shrink-0 group-open:hidden">VIEW LOG</span>
                  <span className="text-[8px] text-amber-400 shrink-0 hidden group-open:inline">CLOSE</span>
                </summary>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mt-3 pt-3 border-t border-white/6">
                  {missionState.timeline.slice(-5).map((item, idx) => (
                    <div key={`${item.turn}-${idx}`} className="bg-[#141519] border border-[#38332d] rounded-lg px-3 py-2">
                      <div className="flex justify-between text-[8px] text-amber-500 font-bold"><span>TURN {item.turn}</span><span>{item.time}</span></div>
                      <div className="text-[10px] text-stone-200 mt-1">{item.action}</div>
                      <div className="text-[9px] text-stone-500 mt-0.5">{item.consequence}</div>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </details>
              )}
            </div>

            {/* Right rail: compact telemetry first; secondary detail stays collapsed */}
            <aside className={`${preferences.hudMode === "focused" ? "xl:col-span-3" : "xl:col-span-4"} space-y-3 font-mono`}>
              {successProbabilityResult && (
                <SuccessProbabilityGauge data={successProbabilityResult} />
              )}

              <section className="mi6-swap-panel-soft rounded-[20px] p-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-[#443d35] pb-2 mb-2">
                  <div>
                    <div className="text-[8px] uppercase tracking-[0.18em] text-stone-600">Mission Status</div>
                    <div className="text-[10px] font-black text-stone-200">LIVE TELEMETRY</div>
                  </div>
                  <Crosshair className="w-4 h-4 text-amber-400" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    ["PROGRESS", missionState.missionProgress ?? 5, "text-amber-300"],
                    ["HEALTH", missionState.agentHealth, missionState.agentHealth > 60 ? "text-emerald-300" : missionState.agentHealth > 30 ? "text-amber-300" : "text-red-300"],
                    ["COVER", missionState.stealthRating, "text-sky-300"],
                    ["VIGILANCE", missionState.alarmLevel, "text-red-300"],
                    ["SUSPICION", missionState.suspicion ?? 0, "text-red-300"],
                    ["TIME", missionState.timePressure ?? 20, "text-amber-300"],
                    ["EXTRACTION", missionState.escapeReadiness ?? 15, "text-emerald-300"],
                    ["INTEL", missionState.intelligenceConfidence ?? 25, "text-sky-300"],
                  ].map(([label, value, colour]) => (
                    <div key={String(label)} className="bg-[#15161a] border border-white/5 rounded-lg px-2.5 py-2 flex items-center justify-between gap-2">
                      <span className="text-[7px] text-stone-600 tracking-wide">{label}</span>
                      <strong className={`text-[11px] ${String(colour)}`}>{value}%</strong>
                    </div>
                  ))}
                </div>
              </section>

              {preferences.showIntelPanel && (
              <details className="mi6-swap-panel-soft rounded-[18px] px-3 py-2.5 shadow-lg group">
                <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <ClipboardList className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[8px] uppercase tracking-[0.16em] text-stone-600">Intel Picture</div>
                      <div className="text-[9px] text-stone-300 truncate">{lastSceneIntel.threats[0] || lastSceneIntel.confirmed[0] || "No new intelligence"}</div>
                    </div>
                  </div>
                  <span className="text-[8px] text-amber-400 shrink-0">{lastSceneIntel.confirmed.length} CONF / {lastSceneIntel.threats.length} THREAT</span>
                </summary>
                <div className="mt-3 pt-3 border-t border-white/6 space-y-2.5">
                  <div className={`rounded-lg border px-2.5 py-2 ${intelIntegrity.conflicts.length ? "border-amber-700/50 bg-amber-950/20" : "border-emerald-800/40 bg-emerald-950/15"}`}>
                    <div className="flex items-center justify-between text-[8px] font-black uppercase"><span className={intelIntegrity.conflicts.length ? "text-amber-300" : "text-emerald-300"}>INTEL INTEGRITY</span><span className="text-stone-400">{intelIntegrity.score}%</span></div>
                    <div className="text-[8px] text-stone-500 mt-1">{intelIntegrity.conflicts.length ? `${intelIntegrity.conflicts.length} possible stale/contradictory uncertain item(s) detected.` : "No obvious confirmed/uncertain overlap detected."}</div>
                  </div>
                  {[
                    ["CONFIRMED", lastSceneIntel.confirmed, "text-emerald-400"],
                    ["UNCERTAIN", lastSceneIntel.uncertain, "text-amber-400"],
                    ["THREATS", lastSceneIntel.threats, "text-red-400"],
                    ["ASSETS", lastSceneIntel.assets, "text-sky-400"]
                  ].map(([label, values, colour]) => (
                    <div key={String(label)}>
                      <div className={`text-[8px] font-black uppercase ${colour}`}>{label}</div>
                      <div className="mt-1 space-y-1">
                        {(values as string[]).length ? (values as string[]).slice(0, 3).map((value, idx) => <div key={idx} className="bg-[#15161a] border border-[#38332d] rounded-lg px-2 py-1.5 text-[9px] leading-relaxed text-stone-300">{value}</div>) : <div className="text-[9px] text-stone-600">No new entry.</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
              )}

              {preferences.showDoctrinePanel && (
              <details className="rounded-[18px] border border-violet-500/20 bg-violet-500/[0.05] px-3 py-2.5 shadow-lg group">
                <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <User className="w-4 h-4 text-violet-300 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[8px] uppercase tracking-[0.16em] text-violet-400">Active Doctrine</div>
                      <div className="text-[10px] font-black text-stone-100 truncate">{selectedDoctrine.name.toUpperCase()} <span className="text-stone-600 font-normal">// {selectedDoctrine.era}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-[8px] shrink-0">
                    <span className="text-sky-300">T {selectedDoctrine.tacticalIntelligence}</span>
                    <span className="text-amber-300">C {selectedDoctrine.charm}</span>
                    <span className="text-emerald-300">P {selectedDoctrine.patience}</span>
                  </div>
                </summary>
                <div className="grid grid-cols-3 gap-1.5 text-center mt-3 pt-3 border-t border-violet-900/30">
                  <div className="bg-[#16151a] rounded-lg p-2"><span className="block text-[7px] text-stone-600">TACTICAL</span><strong className="text-sky-300">{selectedDoctrine.tacticalIntelligence}</strong></div>
                  <div className="bg-[#16151a] rounded-lg p-2"><span className="block text-[7px] text-stone-600">CHARM</span><strong className="text-amber-300">{selectedDoctrine.charm}</strong></div>
                  <div className="bg-[#16151a] rounded-lg p-2"><span className="block text-[7px] text-stone-600">PATIENCE</span><strong className="text-emerald-300">{selectedDoctrine.patience}</strong></div>
                  <div className="bg-[#16151a] rounded-lg p-2"><span className="block text-[7px] text-stone-600">RISK</span><strong className="text-red-300">{selectedDoctrine.riskTolerance}</strong></div>
                  <div className="bg-[#16151a] rounded-lg p-2"><span className="block text-[7px] text-stone-600">DECEPTION</span><strong className="text-violet-300">{selectedDoctrine.manipulationDeception}</strong></div>
                  <div className="bg-[#16151a] rounded-lg p-2"><span className="block text-[7px] text-stone-600">RUTHLESS</span><strong className="text-red-300">{selectedDoctrine.ruthlessness}</strong></div>
                </div>
              </details>
              )}
            </aside>
          </div>
        </div>
      )}

      {isMissionMenuOpen && missionState && (
        <div className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto" onMouseDown={() => setIsMissionMenuOpen(false)}>
          <section className="w-full max-w-5xl mx-auto my-3 mi6-swap-panel rounded-[28px] shadow-2xl font-mono border border-white/10" onMouseDown={e => e.stopPropagation()}>
            <header className="p-5 border-b border-white/8 flex items-center justify-between gap-3 sticky top-0 bg-[#111318]/95 backdrop-blur rounded-t-[28px] z-10">
              <div>
                <div className="text-[9px] uppercase tracking-[0.22em] text-amber-400 font-bold">MISSION CONTROL // PAUSE MENU</div>
                <div className="text-xl font-black text-stone-100 mt-1">Navigation & Simulator Settings</div>
                <div className="text-[9px] text-stone-500 mt-1">{currentTemplate.title} // TURN {missionState.currentTurn} // AUTOSAVE ACTIVE</div>
              </div>
              <button onClick={() => setIsMissionMenuOpen(false)} className="p-2 rounded-lg border border-white/10 text-stone-400 hover:text-white"><X className="w-4 h-4" /></button>
            </header>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-4">
                <section className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-amber-300 font-black mb-3">NAVIGATION HUBS</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      ["command", "COMMAND CENTRE", Terminal],
                      ["bond", "007 FILM OPS", Film],
                      ["intel", "INTEL ARCHIVES", Network],
                      ["operations", "DEBRIEF & ARCHIVE", ClipboardList],
                      ["system", "SYSTEM VAULT", Wrench],
                    ].map(([tab, label, Icon]) => (
                      <button key={String(tab)} type="button" onClick={() => { setIsMissionMenuOpen(false); onNavigateToTab?.(String(tab)); }} className="rounded-xl border border-white/8 bg-[#15171b] hover:border-amber-500/40 p-3 text-left text-[9px] text-stone-200">
                        {React.createElement(Icon as React.ComponentType<{className?: string}>, { className: "w-4 h-4 text-amber-400 mb-2" })}
                        <span className="font-black">{String(label)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="text-[8px] text-stone-600 mt-3">Leaving the simulator keeps the current mission autosaved. Return through Mission Simulator to continue.</div>
                </section>

                <section className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-sky-300 font-black mb-3">MISSION TOOLS</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button onClick={() => { handleManualSave(); setIsMissionMenuOpen(false); }} className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-3 text-left text-[10px] text-amber-100 flex items-center gap-2"><Save className="w-4 h-4" /> QUICK SAVE</button>
                    <button onClick={() => { setIsSaveManagerOpen(true); setIsMissionMenuOpen(false); }} className="rounded-xl border border-sky-900/60 bg-sky-950/20 p-3 text-left text-[10px] text-sky-100 flex items-center gap-2"><FolderOpen className="w-4 h-4" /> SAVE VAULT</button>
                    <button onClick={() => { setIsCausalTreeOpen(true); setIsMissionMenuOpen(false); }} className="rounded-xl border border-violet-900/60 bg-violet-950/20 p-3 text-left text-[10px] text-violet-100 flex items-center gap-2"><Network className="w-4 h-4" /> CAUSAL TREE</button>
                    {currentTemplate.id.startsWith("film-") && <button onClick={() => { setIsComparisonOpen(true); setIsMissionMenuOpen(false); }} className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-3 text-left text-[10px] text-emerald-100 flex items-center gap-2"><GitCompareArrows className="w-4 h-4" /> COMPARE WITH FILM</button>}
                    {!missionState.sessionFinished ? (
                      <button onClick={() => { setIsMissionMenuOpen(false); setIsFinishConfirmOpen(true); }} className="rounded-xl border border-emerald-700/60 bg-emerald-950/25 p-3 text-left text-[10px] text-emerald-100 flex items-center gap-2"><FileCheck className="w-4 h-4" /> FINISH & GENERATE DEBRIEF</button>
                    ) : (
                      <button onClick={() => { setIsMissionMenuOpen(false); setIsFinalDebriefOpen(true); }} className="rounded-xl border border-emerald-500/60 bg-emerald-950/35 p-3 text-left text-[10px] text-emerald-100 flex items-center gap-2"><FileCheck className="w-4 h-4" /> OPEN FINAL DEBRIEF</button>
                    )}
                    <button onClick={() => { setIsMissionMenuOpen(false); setIsFieldNotesOpen(true); }} className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-3 text-left text-[10px] text-cyan-100 flex items-center gap-2"><ClipboardList className="w-4 h-4" /> FIELD NOTES</button>
                    <button onClick={() => { setIsMissionMenuOpen(false); setIsRunArchiveOpen(true); }} className="rounded-xl border border-orange-900/60 bg-orange-950/20 p-3 text-left text-[10px] text-orange-100 flex items-center gap-2"><FolderOpen className="w-4 h-4" /> RUN ARCHIVE ({runArchive.length})</button>
                    <button onClick={handleTerminateOperation} className="rounded-xl border border-red-700/70 bg-red-950/30 p-3 text-left text-[10px] text-red-100 flex items-center gap-2"><Trash2 className="w-4 h-4" /> TERMINATE OPERATION // CLEAR ACTIVE SESSION</button>
                  </div>
                </section>
              </div>

              <div className="space-y-4">
                <section className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-violet-300 font-black mb-3">INTERFACE</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {(["focused", "full"] as const).map(mode => <button key={mode} onClick={() => setPreferences(prev => mode === "focused" ? { ...prev, hudMode: mode, showStageRail: false, showSituationShifts: false, showRecentActivity: false, showIntelPanel: false, showDoctrinePanel: false, showEngineStatus: false } : { ...prev, hudMode: mode, showStageRail: true, showSituationShifts: true, showRecentActivity: true, showIntelPanel: true, showDoctrinePanel: true, showEngineStatus: true })} className={`rounded-xl border p-3 text-left ${preferences.hudMode === mode ? "border-violet-400/60 bg-violet-500/10 text-violet-100" : "border-white/8 bg-[#15171b] text-stone-400"}`}><div className="text-[10px] font-black uppercase">{mode === "focused" ? "FOCUSED HUD" : "FULL HUD"}</div><div className="text-[8px] mt-1 text-stone-500">{mode === "focused" ? "Mission first, fewer panels." : "Restores stage, intel, history and analysis panels."}</div></button>)}
                  </div>
                  <div className="space-y-2">
                    {[
                      ["showStageRail", "Show mission stage rail"],
                      ["showSituationShifts", "Show situation-shift analysis"],
                      ["showRecentActivity", "Show recent activity log"],
                      ["showIntelPanel", "Show expanded intel panel"],
                      ["showDoctrinePanel", "Show doctrine statistics"],
                      ["showEngineStatus", "Show AI / fallback engine badges"],
                    ].map(([key, label]) => <label key={String(key)} className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-[#15171b] px-3 py-2.5 text-[9px] text-stone-300"><span>{String(label)}</span><input type="checkbox" checked={Boolean(preferences[key as keyof SimulatorPreferences])} onChange={e => setPreferences(prev => ({ ...prev, [key]: e.target.checked }))} className="accent-amber-500" /></label>)}
                  </div>
                </section>

                <ThemeSettings compact />

                <section className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-emerald-300 font-black mb-3">GAME & AI SETTINGS</div>
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-[#15171b] px-3 py-3 text-[9px] text-stone-300"><span><strong className="block text-stone-100">Suggested actions</strong><span className="text-stone-600">Keep generated choices above the free-text directive box.</span></span><input type="checkbox" checked={preferences.showSuggestedActions} onChange={e => setPreferences(prev => ({ ...prev, showSuggestedActions: e.target.checked }))} className="accent-amber-500" /></label>
                  <button onClick={() => setPreferences(DEFAULT_SIMULATOR_PREFERENCES)} className="mt-3 text-[9px] text-stone-500 hover:text-stone-200">RESET SETTINGS TO CLEAN DEFAULT</button>
                </section>
              </div>
            </div>

            <footer className="px-5 py-4 border-t border-white/8 flex items-center justify-between gap-3">
              <div className="text-[8px] text-stone-600">Changes apply immediately and persist on this browser.</div>
              <button onClick={() => setIsMissionMenuOpen(false)} className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 text-[10px] font-black">RESUME MISSION</button>
            </footer>
          </section>
        </div>
      )}

      {isFieldNotesOpen && missionState && (
        <div className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-md p-4 flex items-center justify-center" onMouseDown={() => setIsFieldNotesOpen(false)}>
          <section className="w-full max-w-2xl rounded-3xl border border-cyan-900/50 bg-[#101216] p-5 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 mb-4"><div><div className="text-[9px] text-cyan-300 font-black uppercase tracking-widest">FIELD NOTES // PRIVATE OPERATIVE LOG</div><div className="text-sm font-black text-white mt-1">{currentTemplate.title} · Turn {missionState.currentTurn}</div></div><button onClick={() => setIsFieldNotesOpen(false)} className="p-2 border border-white/10 rounded-lg text-stone-400"><X className="w-4 h-4" /></button></div>
            <textarea value={fieldNotes} onChange={e => setFieldNotes(e.target.value)} placeholder="Write hypotheses, names, suspicions, routes, reminders or your own plan for the next move..." className="w-full min-h-[280px] rounded-2xl border border-white/10 bg-black/30 p-4 text-[12px] text-stone-200 outline-none focus:border-cyan-500/50 font-sans" />
            <div className="mt-3 text-[8px] text-stone-600">Autosaved locally to this mission session. Notes do not alter the AI state unless you explicitly act on them.</div>
          </section>
        </div>
      )}

      {isRunArchiveOpen && (
        <div className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-md p-4 flex items-center justify-center" onMouseDown={() => setIsRunArchiveOpen(false)}>
          <section className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-3xl border border-orange-900/50 bg-[#101216] p-5 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 mb-4"><div><div className="text-[9px] text-orange-300 font-black uppercase tracking-widest">00-SECTION // RUN ARCHIVE</div><div className="text-sm font-black text-white mt-1">Completed simulation branches</div></div><button onClick={() => setIsRunArchiveOpen(false)} className="p-2 border border-white/10 rounded-lg text-stone-400"><X className="w-4 h-4" /></button></div>
            {runArchive.length ? <div className="space-y-2">{runArchive.map(run => <div key={run.id} className="rounded-2xl border border-white/8 bg-black/20 p-3 flex items-center justify-between gap-4"><div><div className="text-[11px] text-stone-100 font-black">{run.title}</div><div className="text-[8px] text-stone-500 mt-1">{run.actor || "007"} · {run.turnCount} recorded turns · {new Date(run.finishedAt).toLocaleString()}</div></div><div className="text-right"><div className="text-[7px] text-stone-600 uppercase">Assessment</div><div className="text-lg font-black text-orange-300">{typeof run.score === "number" ? `${run.score}/100` : "ARCHIVED"}</div></div></div>)}</div> : <div className="text-[10px] text-stone-500 py-8 text-center">No completed branches archived yet.</div>}
          </section>
        </div>
      )}

      <CausalTreeModal open={isCausalTreeOpen} onClose={() => setIsCausalTreeOpen(false)} nodes={causalArchive.length ? causalArchive : missionState?.causalTree || []} activeNodeId={missionState?.causalTree.at(-1)?.id} />
      <MissionSaveManagerModal open={isSaveManagerOpen} onClose={() => setIsSaveManagerOpen(false)} slots={saveSlots} onSave={handleManualSave} onLoad={handleLoadSlot} onDelete={handleDeleteSlot} onImport={handleImportSlot} canSave={!!missionState} />
      <CanonicalComparisonModal open={isComparisonOpen} onClose={() => setIsComparisonOpen(false)} filmTitle={currentTemplate.title} missionState={missionState} />

      {isFinishConfirmOpen && missionState && !missionState.sessionFinished && (
        <div className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-md p-4 flex items-center justify-center" onMouseDown={() => setIsFinishConfirmOpen(false)}>
          <section className="w-full max-w-xl mi6-swap-panel rounded-[28px] shadow-2xl font-mono border border-emerald-900/50" onMouseDown={e => e.stopPropagation()}>
            <header className="p-5 border-b border-white/8 flex items-center justify-between gap-3">
              <div>
                <div className="text-[9px] uppercase tracking-[0.22em] text-emerald-400 font-bold">SESSION TERMINATION AUTHORIZATION</div>
                <div className="text-lg font-black text-stone-100 mt-1">Generate final MI6 debrief?</div>
              </div>
              <button onClick={() => setIsFinishConfirmOpen(false)} className="p-2 rounded-lg border border-white/10 text-stone-400 hover:text-white"><X className="w-4 h-4" /></button>
            </header>
            <div className="p-5 space-y-4">
              <p className="text-xs leading-relaxed text-stone-300">This locks further directives for this run and generates a detailed assessment from all {missionState.timeline.length} recorded field entries, including decision analysis, scoring and the simulated branch versus the original film.</p>
              <div className="rounded-xl border border-amber-800/40 bg-amber-950/15 p-3 text-[10px] text-amber-200">Your save data is not deleted. Archive or save the final state afterward if you want a permanent slot.</div>
              <div className="flex flex-wrap justify-end gap-2">
                <button onClick={() => setIsFinishConfirmOpen(false)} className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 hover:border-stone-500">RETURN TO FIELD</button>
                <button onClick={handleFinishSession} className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-black hover:bg-emerald-500 flex items-center gap-2"><FileCheck className="w-4 h-4" /> FINISH & DEBRIEF</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {missionState?.sessionFinished && isFinalDebriefOpen && (
        <div className="fixed inset-0 z-[90] bg-black/92 backdrop-blur-md p-3 sm:p-5 overflow-y-auto" onMouseDown={() => setIsFinalDebriefOpen(false)}>
          <section className="w-full max-w-6xl mx-auto my-3" onMouseDown={e => e.stopPropagation()}>
            <div className="mi6-swap-panel rounded-[24px] p-3 mb-3 flex items-center justify-between gap-3 font-mono sticky top-2 z-10 shadow-2xl">
              <div>
                <div className="text-[9px] uppercase tracking-[0.22em] text-emerald-400 font-bold">DEBRIEF // FINAL MI6 ASSESSMENT</div>
                <div className="text-sm font-black text-stone-100">{currentTemplate.title} · {missionState.timeline.length} recorded entries</div>
              </div>
              <div className="flex items-center gap-2">
                {isDebriefLoading && <span className="text-[9px] text-amber-300 animate-pulse">ANALYSING COMPLETE SESSION…</span>}
                <button onClick={() => setIsFinalDebriefOpen(false)} className="p-2 rounded-lg border border-white/10 text-stone-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            </div>
            {isDebriefLoading && !debriefReport && (
              <div className="mi6-swap-panel-soft rounded-[20px] p-6 text-center font-mono text-stone-300">
                <div className="text-amber-400 font-black text-sm">CHIEF OF STAFF REVIEW IN PROGRESS</div>
                <div className="text-[10px] text-stone-500 mt-2">Reading the full mission history, causal state and canonical film baseline.</div>
              </div>
            )}
            <EnhancedDebriefPanel state={missionState} report={debriefReport} />
          </section>
        </div>
      )}

      {missionState?.sessionFinished && !isFinalDebriefOpen && (
        <div className="fixed right-4 bottom-5 z-[70] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 font-mono">
          {!debriefReport && (
            <button disabled={isDebriefLoading} onClick={handleRetryDebrief} className="rounded-xl border border-amber-700/70 bg-[#17130a]/95 px-4 py-3 text-[10px] font-black text-amber-200 shadow-2xl backdrop-blur hover:border-amber-400 disabled:opacity-60">
              {isDebriefLoading ? "GENERATING FULL REPORT…" : "GENERATE / RETRY FULL DEBRIEF"}
            </button>
          )}
          <button onClick={() => setIsFinalDebriefOpen(true)} className="rounded-xl border border-emerald-500/70 bg-[#071b16]/95 px-4 py-3 text-[10px] font-black text-emerald-100 shadow-2xl backdrop-blur hover:border-emerald-300 flex items-center justify-center gap-2">
            <FileCheck className="w-4 h-4" /> OPEN FINAL DEBRIEF
          </button>
        </div>
      )}

      {/* Q Branch Ordnance Customization Workbench Modal */}
      {isCustomizerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="max-w-6xl w-full my-auto">
            <QBranchCustomizer
              currentLoadout={customizedLoadout}
              onClose={() => setIsCustomizerOpen(false)}
              onApplyLoadout={(newLoadout) => {
                setCustomizedLoadout(newLoadout);
                try {
                  localStorage.setItem("mi6_customized_loadout_v1", JSON.stringify(newLoadout));
                } catch (e) {
                  // ignore
                }
                setIsCustomizerOpen(false);
              }}
              missionContext={{
                codename: currentTemplate.title,
                targetLocation: missionState?.sceneState?.currentLocation || currentTemplate.location,
                riskLevel: currentTemplate.threatLevel,
                recommendedFocus: "STEALTH"
              }}
            />
          </div>
        </div>
      )}
      {missionState && (
        <TacticalCommandDrawer
          open={isTacticalDrawerOpen}
          onClose={() => setIsTacticalDrawerOpen(false)}
          missionState={missionState}
          equipment={missionState.equipmentInventory || createMissionEquipmentRuntime(customizedLoadout)}
          fieldAssets={tacticalFieldAssets}
          assetCalls={missionState.fieldAssetCalls || []}
          career={careerProfile}
          prototypes={Q_PROTOTYPES}
          onOpenTelemetry={() => { setIsTacticalDrawerOpen(false); setIsTelemetryModalOpen(true); }}
          onOpenCausal={() => { setIsTacticalDrawerOpen(false); setIsCausalTreeOpen(true); }}
          onOpenCanon={() => { setIsTacticalDrawerOpen(false); setIsComparisonOpen(true); }}
          onDeployEquipment={handleDeployEquipment}
          onCallAsset={handleCallFieldAsset}
          onUnlockPrototype={handleUnlockPrototype}
          onDeployPrototype={handleDeployPrototype}
          onChangeSocialStance={handleChangeSocialStance}
        />
      )}

      {/* Comprehensive Telemetry Modal */}
      {missionState && (
        <ComprehensiveTelemetryModal
          isOpen={isTelemetryModalOpen}
          onClose={() => setIsTelemetryModalOpen(false)}
          missionState={missionState}
          sceneState={missionState.sceneState}
          operationTitle={currentTemplate.title}
          activeDoctrine={selectedDoctrine}
        />
      )}
    </div>
  );
};
