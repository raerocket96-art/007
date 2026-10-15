import type { MissionSceneState, SimulationStatReasons, MissionState } from "../types";
import { advanceAdversaryTurn, createAdversaryRuntime } from "../data/adversaryProfiles";
import { evaluatePhaseProgression, getMissionPhases } from "../data/missionPhases";

export type SimulationActionType = "STEALTH" | "TACTICAL" | "DIPLOMATIC" | "AGGRESSIVE";

export interface SimulationStateChanges {
  healthDelta: number;
  coverDelta: number;
  vigilanceDelta: number;
  suspicionDelta: number;
  intelConfidenceDelta: number;
  politicalExposureDelta: number;
  collateralDamageDelta: number;
  timePressureDelta: number;
  escapeReadinessDelta: number;
  alertLevel: "LOW" | "NORMAL" | "HEIGHTENED" | "CRITICAL" | "LOCKDOWN";
  reasons: SimulationStatReasons;
}

export interface NormalizedSimulationTurn {
  sceneTitle: string;
  timestamp: string;
  narrative: string;
  sceneState: MissionSceneState;
  choices: Array<{
    id: string;
    text: string;
    actionType: SimulationActionType;
    risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    requiredSkillOrTool?: string;
  }>;
  stateChanges: SimulationStateChanges;
  newEvidence: string | null;
  relationshipChanges: string | null;
  missionLogEntry: string;
}

function cleanString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function cleanArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return [...fallback];
  const result = value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim().slice(0, 220))
    .filter(Boolean);
  return result.length ? result : [...fallback];
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clamp(value: unknown, min: number, max: number, fallback = 0): number {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

export function initialOperationalLocation(locationList?: string): string {
  if (!locationList) return "Classified staging area";
  const first = locationList
    .split(/\s*\/\s*|\s*\|\s*|\s*;\s*/)
    .map((part) => part.trim())
    .find(Boolean);
  return first || locationList.trim();
}

export function createInitialSceneState(
  operationLocation: string,
  _filmObjective: string,
  _initialSituation: string
): MissionSceneState {
  const location = initialOperationalLocation(operationLocation);
  return {
    currentLocation: location,
    immediateObjective: `Establish a secure operational foothold at ${location} and verify the immediate security picture.`,
    completedActions: [],
    activeConsequences: [],
    nearbyThreats: [],
    discoveredIntel: [],
    uncertainIntel: [],
    operativeCondition: ["Agent uninjured and operational"],
    environmentState: "Initial field conditions not yet fully assessed.",
    alertState: "No scene-specific alarm has been confirmed."
  };
}

export function ensureSceneState(
  raw: Partial<MissionSceneState> | undefined | null,
  operationLocation: string,
  filmObjective: string,
  initialSituation: string
): MissionSceneState {
  const fallback = createInitialSceneState(operationLocation, filmObjective, initialSituation);
  if (!raw) return fallback;
  return {
    currentLocation: cleanString(raw.currentLocation, fallback.currentLocation),
    immediateObjective: cleanString(raw.immediateObjective, fallback.immediateObjective),
    completedActions: cleanArray(raw.completedActions, fallback.completedActions),
    activeConsequences: cleanArray(raw.activeConsequences, fallback.activeConsequences),
    nearbyThreats: cleanArray(raw.nearbyThreats, fallback.nearbyThreats),
    discoveredIntel: cleanArray(raw.discoveredIntel, fallback.discoveredIntel),
    uncertainIntel: cleanArray(raw.uncertainIntel, fallback.uncertainIntel),
    operativeCondition: cleanArray(raw.operativeCondition, fallback.operativeCondition),
    environmentState: cleanString(raw.environmentState, fallback.environmentState),
    alertState: cleanString(raw.alertState, fallback.alertState)
  };
}

export function inferActionTypeFromText(text: string): SimulationActionType {
  const lower = text.toLowerCase();
  if (/diplomat|cover identity|social|convince|persuad|negot|bluff|impersonat|official/.test(lower)) return "DIPLOMATIC";
  if (/silent|silently|conceal|covert|stealth|sneak|avoid|hide|submerged|surveillance|observe|scan|bypass/.test(lower)) return "STEALTH";
  if (/explod|grenade|open fire|assault|ram |detonat|machine gun|heavy fire|kill everyone/.test(lower)) return "AGGRESSIVE";
  return "TACTICAL";
}

function conciseActionSummary(action: string): string {
  const text = action.replace(/\s+/g, " ").trim();
  if (!text) return "Field action completed";
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  return firstSentence.length > 118 ? `${firstSentence.slice(0, 115).trim()}…` : firstSentence;
}

function sceneSpecificFallbackState(
  previous: MissionSceneState,
  playerAction: string,
  filmObjective: string
): MissionSceneState {
  const lower = playerAction.toLowerCase();
  let currentLocation = previous.currentLocation;
  let immediateObjective = previous.immediateObjective;
  const completed = [...previous.completedActions];
  const completedCountBeforeInference = completed.length;
  const consequences = [...previous.activeConsequences];
  const threats = [...previous.nearbyThreats];
  const intel = [...previous.discoveredIntel];
  const uncertain = [...previous.uncertainIntel];
  const condition = [...previous.operativeCondition];
  let environmentState = previous.environmentState;
  let alertState = previous.alertState;

  if (lower.includes("chimera")) {
    if (/interior|corridor|through the access door|inside the vessel|inside chimera|close the hatch/.test(lower)) {
      currentLocation = "Chimera // Interior Service Corridor";
      immediateObjective = "Assess the first interior junction, identify cameras, guards and electronic locks, and preserve concealment before advancing.";
      environmentState = "Confined steel service corridor with limited sightlines and shipboard electronic security.";
    } else if (/board|side entry|starboard|access point|onto the vessel/.test(lower)) {
      currentLocation = "Chimera // Starboard Service Deck";
      immediateObjective = "Secure the interior access point before the missing exterior sentries are noticed.";
      environmentState = "Exposed service deck with nearby interior access and restricted patrol visibility.";
    } else if (/submerged|underwater|swim|offshore/.test(lower)) {
      currentLocation = "Offshore // Submerged Approach to Chimera";
      immediateObjective = "Reach a low-profile hull access point without entering the guards' visual sweep.";
      environmentState = "Cold submerged approach beneath the vessel's patrol line.";
    }
  }

  if (/locate|observe|patrol pattern/.test(lower) && lower.includes("chimera")) {
    completed.push("Chimera located and patrol pattern observed");
    intel.push("Chimera patrol pattern assessed from concealment");
  }
  if (/submerged|underwater|swim/.test(lower) && lower.includes("chimera")) completed.push("Underwater approach completed");
  if (/board|side entry|onto the vessel|starboard access/.test(lower) && lower.includes("chimera")) completed.push("Starboard access achieved");
  if (/two armed guards|2 armed guards|two guards/.test(lower) && /shoot|neutraliz|eliminat/.test(lower)) {
    completed.push("Two exterior guards neutralized");
    consequences.push("Exterior sentries will miss their next check-in");
    threats.push("Missing sentries may trigger a local security check if their absence is noticed");
    uncertain.push("It is not yet known when the exterior sentries are due to report in.");
  }
  if (/access door|proceed inside|enter the vessel|through the access door/.test(lower) && lower.includes("chimera")) {
    completed.push("Interior access secured");
    consequences.push("Bond is now inside the Chimera");
  }
  if (/scan|assess/.test(lower) && /corridor|camera|guards|electronic locks|junction/.test(lower)) {
    completed.push("Immediate interior corridor assessed");
    intel.push("Interior security sweep initiated with Q-Branch watch");
    immediateObjective = "Resolve the first junction's security picture before advancing deeper into the vessel.";
  }
  if (/suppressed|silent|silently|without.*alarm|before.*alarm/.test(lower)) {
    consequences.push("No general alarm has been raised");
    alertState = "No general alarm; local security remains unaware of the full breach.";
  }

  if (completed.length === completedCountBeforeInference) {
    const summary = conciseActionSummary(playerAction);
    if (summary && !completed.some((item) => item.toLowerCase() === summary.toLowerCase())) completed.push(summary);
  }

  if (currentLocation === previous.currentLocation && immediateObjective === previous.immediateObjective) {
    immediateObjective = `Maintain control of ${currentLocation} and resolve the most immediate scene-level obstacle created by the last action.`;
  }

  if (!environmentState) environmentState = `Operational conditions at ${currentLocation} remain partially assessed.`;
  if (!alertState) alertState = "No confirmed change in enemy alert state.";

  return {
    currentLocation,
    immediateObjective: immediateObjective || filmObjective,
    completedActions: unique(completed).slice(-20),
    activeConsequences: unique(consequences).slice(-16),
    nearbyThreats: unique(threats).slice(-12),
    discoveredIntel: unique(intel).slice(-16),
    uncertainIntel: unique(uncertain).slice(-12),
    operativeCondition: unique(condition).slice(-8),
    environmentState,
    alertState
  };
}

function inferProceduralStatChanges(action: string, previous: MissionSceneState): SimulationStateChanges {
  const lower = action.toLowerCase();
  let healthDelta = 0;
  let coverDelta = 0;
  let vigilanceDelta = 0;
  let suspicionDelta = 0;
  let intelConfidenceDelta = 0;
  let politicalExposureDelta = 0;
  let collateralDamageDelta = 0;
  let timePressureDelta = 0;
  let escapeReadinessDelta = 0;
  const reasons: SimulationStatReasons = {};

  if (/bond.*(?:shot|hit|wound|injur)|(?:shot|hit|wound|injur).*bond|poison|severe exhaustion|fractur|burned/.test(lower)) {
    healthDelta = -8;
    reasons.health = "The action explicitly describes physical injury or severe physiological harm to the operative.";
  }

  const explicitlySilent = /suppressed|silent|silently|without (?:raising |triggering )?(?:an )?alarm|before (?:either|they|he|she|anyone) can raise (?:an )?alarm|no general alarm/.test(lower);
  const concreteDetection = /detected|spotted|seen by|camera.*detect|unsuppressed|open fire|explosion|explod|loud|alarm (?:sounds|raised|triggered|activated)/.test(lower);
  if (concreteDetection && !explicitlySilent) {
    coverDelta = -10;
    vigilanceDelta = 12;
    suspicionDelta = 12;
    reasons.cover = "The action creates an identifiable detection or trace risk.";
    reasons.vigilance = "Hostile security has a concrete reason to increase vigilance.";
    reasons.suspicion = "Observable activity gives the opposition reason to suspect an intrusion.";
  }
  if (/two armed guards|2 armed guards|two guards/.test(lower) && /neutraliz|eliminat|shoot/.test(lower)) {
    timePressureDelta = 4;
    reasons.timePressure = "The missing sentries create a future check-in deadline even though no alarm is active yet.";
  }

  if (/scan|observe|identify|inspect|recover|copy|photograph|intercept|patrol pattern|recon/.test(lower)) {
    intelConfidenceDelta = 8;
    reasons.intelConfidence = "The action directly gathers or verifies operational information.";
  }

  if (/civilian|embassy|police|government|diplomat|public crowd|publicly|border incident/.test(lower) && /shoot|threat|explod|assault|expose|detain/.test(lower)) {
    politicalExposureDelta = 8;
    reasons.politicalExposure = "The action creates a plausible diplomatic, civilian or governmental exposure.";
  }

  if (/explod|grenade|firefight|ram |destroy civilian|collateral/.test(lower)) {
    collateralDamageDelta = 8;
    reasons.collateralDamage = "The action explicitly risks property damage or collateral harm.";
  }

  if (/escape route|extraction|egress|rendezvous|vehicle staged/.test(lower)) {
    escapeReadinessDelta = 8;
    reasons.escapeReadiness = "The action directly prepares or improves an extraction route.";
  }

  const previousAlert = previous.alertState.toLowerCase();
  const priorAlarmActive = /alarm (?:active|raised|triggered)|lockdown|heightened alert/.test(previousAlert)
    && !/no (?:general )?alarm|alarm has not/.test(previousAlert);
  const alertLevel = vigilanceDelta >= 20 || suspicionDelta >= 20
    ? "CRITICAL"
    : vigilanceDelta > 0 || suspicionDelta > 0
      ? "HEIGHTENED"
      : priorAlarmActive
        ? "HEIGHTENED"
        : "NORMAL";

  return {
    healthDelta,
    coverDelta,
    vigilanceDelta,
    suspicionDelta,
    intelConfidenceDelta,
    politicalExposureDelta,
    collateralDamageDelta,
    timePressureDelta,
    escapeReadinessDelta,
    alertLevel,
    reasons
  };
}

function contextualChoices(scene: MissionSceneState, actionType: SimulationActionType, equipment: string[], vehicle?: string): NormalizedSimulationTurn["choices"] {
  const location = scene.currentLocation.toLowerCase();
  const kit = equipment.length ? equipment : ["Q-Branch field kit"];
  if (location.includes("chimera") && location.includes("interior")) {
    return [
      {
        id: "chimera-camera-loop",
        text: "Use the Omega watch to map the nearest camera cycle and hold position until the corridor is blind.",
        actionType: "STEALTH",
        risk: "LOW",
        requiredSkillOrTool: "Omega Q-Branch watch"
      },
      {
        id: "chimera-lock-bypass",
        text: "Inspect the first electronic lock and bypass it without opening the next section until the access log is understood.",
        actionType: "TACTICAL",
        risk: "MEDIUM",
        requiredSkillOrTool: kit[1] || kit[0]
      },
      {
        id: "chimera-listen-patrol",
        text: "Remain concealed at the junction and listen for radio traffic or approaching crew before committing to a route.",
        actionType: "STEALTH",
        risk: "LOW",
        requiredSkillOrTool: "Tradecraft"
      },
      {
        id: "chimera-intercept-comms",
        text: "Tap the nearest shipboard communications line to learn whether the missing exterior guards have been queried.",
        actionType: "TACTICAL",
        risk: "MEDIUM",
        requiredSkillOrTool: "Encrypted field interface"
      }
    ];
  }

  if (location.includes("chimera") && location.includes("starboard")) {
    return [
      {
        id: "chimera-secure-door",
        text: "Secure the interior access door and enter before the exterior sentries' absence is noticed.",
        actionType: "STEALTH",
        risk: "MEDIUM",
        requiredSkillOrTool: "Suppressed sidearm / lock tools"
      },
      {
        id: "chimera-conceal-sentries",
        text: "Move the neutralized sentries out of the patrol sightline and preserve the appearance of an intact perimeter.",
        actionType: "STEALTH",
        risk: "LOW",
        requiredSkillOrTool: "Tradecraft"
      },
      {
        id: "chimera-monitor-radio",
        text: "Hold the deck briefly and monitor local radio traffic for the next guard check-in before entering.",
        actionType: "TACTICAL",
        risk: "LOW",
        requiredSkillOrTool: kit[0]
      }
    ];
  }

  const base: NormalizedSimulationTurn["choices"] = [
    {
      id: "scene-recon",
      text: `Observe ${scene.currentLocation} long enough to identify the most immediate security pattern before moving.`,
      actionType: "STEALTH",
      risk: "LOW",
      requiredSkillOrTool: "Tradecraft"
    },
    {
      id: "scene-objective",
      text: scene.immediateObjective,
      actionType,
      risk: "MEDIUM",
      requiredSkillOrTool: kit[0]
    },
    {
      id: "scene-intel",
      text: `Use available Q-Branch equipment to gather one concrete piece of intelligence at ${scene.currentLocation} without changing position.`,
      actionType: "TACTICAL",
      risk: "LOW",
      requiredSkillOrTool: kit[1] || kit[0]
    }
  ];
  const outdoor = !/interior|corridor|office|room|cellar|ventilation|shaft|casino floor|aircraft cabin|submarine interior/i.test(scene.currentLocation);
  if (vehicle && outdoor) {
    base.push({
      id: "scene-vehicle-tactic",
      text: `Use ${vehicle} for a scene-appropriate surveillance, pursuit, route-control or extraction maneuver without forcing vehicle access where the terrain does not permit it.`,
      actionType: "TACTICAL",
      risk: "MEDIUM",
      requiredSkillOrTool: vehicle
    });
  }
  return base;
}

export function generateProceduralSimulationTurn(params: {
  previousScene: MissionSceneState;
  playerAction: string;
  actionType: SimulationActionType;
  operation: { codename?: string; primaryObjective?: string; locations?: string[] };
  agentName?: string;
  equipment?: string[];
  vehicle?: string;
  doctrineName?: string;
  adversaryProfile?: { name?: string; doctrine?: string; counters?: string[]; vulnerabilities?: string[]; escalation?: string };
  sceneNumber: number;
}): NormalizedSimulationTurn {
  const previous = params.previousScene;
  const filmObjective = params.operation.primaryObjective || "Complete the classified operation";
  const nextScene = sceneSpecificFallbackState(previous, params.playerAction, filmObjective);
  const stateChanges = inferProceduralStatChanges(params.playerAction, previous);
  const equipment = params.equipment || [];
  const adversary = params.adversaryProfile;
  const actionSummary = conciseActionSummary(params.playerAction);
  const newlyCompleted = nextScene.completedActions.filter((item) => !previous.completedActions.some((old) => old.toLowerCase() === item.toLowerCase()));
  const newConsequences = nextScene.activeConsequences.filter((item) => !previous.activeConsequences.some((old) => old.toLowerCase() === item.toLowerCase()));

  const narrativeParts = [
    `${params.agentName || "Commander James Bond, 007"} completes the directive and consolidates the new position.`,
    `The operational picture is now anchored at ${nextScene.currentLocation}. ${nextScene.environmentState}`,
    newlyCompleted.length ? `Confirmed progress: ${newlyCompleted.join("; ")}.` : `The previous scene state remains intact while the agent consolidates the position.`,
    newConsequences.length ? `Active consequence: ${newConsequences.join("; ")}.` : `No new scene-level consequence is introduced without a concrete cause.`
  ];

  const choices = contextualChoices(nextScene, params.actionType, equipment, params.vehicle);
  if (adversary?.vulnerabilities?.length && choices.length < 5) {
    choices.push({
      id: "adversary-counterplay",
      text: `Exploit ${adversary.name || "the hostile network"}'s known vulnerability to ${adversary.vulnerabilities[0]} while avoiding its expected countermeasures.`,
      actionType: "TACTICAL",
      risk: "MEDIUM",
      requiredSkillOrTool: "Adversary intelligence profile"
    });
  }

  return {
    sceneTitle: `${params.operation.codename || "MISSION"} // ${nextScene.currentLocation}`,
    timestamp: `${new Date().toLocaleTimeString("en-GB", { hour12: false })} ZULU`,
    narrative: narrativeParts.join("\n\n"),
    sceneState: nextScene,
    choices,
    stateChanges,
    newEvidence: nextScene.discoveredIntel.find((item) => !previous.discoveredIntel.includes(item)) || null,
    relationshipChanges: null,
    missionLogEntry: `${actionSummary} // Location confirmed: ${nextScene.currentLocation}`
  };
}

export function normalizeSimulationTurn(
  raw: any,
  previousScene: MissionSceneState,
  playerAction: string,
  fallback: NormalizedSimulationTurn,
  background?: { filmObjective?: string; filmLocations?: string[] }
): NormalizedSimulationTurn {
  const rawScene = raw?.sceneState || {};
  const rawLocation = cleanString(rawScene.currentLocation ?? raw?.currentLocation ?? raw?.location, fallback.sceneState.currentLocation);
  const backgroundLocations = (background?.filmLocations || []).filter(Boolean);
  const joinedBackgroundLocations = backgroundLocations.join(" / ");
  const locationLooksLikeFilmList = Boolean(
    (joinedBackgroundLocations && rawLocation.toLowerCase() === joinedBackgroundLocations.toLowerCase()) ||
    (backgroundLocations.length >= 3 && backgroundLocations.filter(loc => rawLocation.toLowerCase().includes(loc.toLowerCase())).length >= 3) ||
    rawLocation.split(/\s+\/\s+/).length >= 4
  );
  const rawObjective = cleanString(rawScene.immediateObjective ?? raw?.immediateObjective, fallback.sceneState.immediateObjective);
  const filmObjective = cleanString(background?.filmObjective);
  const objectiveLooksFilmLevel = Boolean(
    (filmObjective && rawObjective.toLowerCase() === filmObjective.toLowerCase()) ||
    /^exploit the .*advance toward:/i.test(rawObjective) ||
    (filmObjective.length > 80 && rawObjective.toLowerCase().includes(filmObjective.toLowerCase()))
  );
  const sceneState: MissionSceneState = {
    currentLocation: locationLooksLikeFilmList ? fallback.sceneState.currentLocation : rawLocation,
    immediateObjective: objectiveLooksFilmLevel ? fallback.sceneState.immediateObjective : rawObjective,
    completedActions: unique(cleanArray(rawScene.completedActions, previousScene.completedActions)),
    activeConsequences: unique(cleanArray(rawScene.activeConsequences ?? raw?.consequences, previousScene.activeConsequences)),
    nearbyThreats: unique(cleanArray(rawScene.nearbyThreats ?? raw?.threats, fallback.sceneState.nearbyThreats)),
    discoveredIntel: unique(cleanArray(rawScene.discoveredIntel ?? raw?.confirmedIntel, fallback.sceneState.discoveredIntel)),
    uncertainIntel: unique(cleanArray(rawScene.uncertainIntel ?? raw?.uncertainIntel, fallback.sceneState.uncertainIntel)),
    operativeCondition: unique(cleanArray(rawScene.operativeCondition, fallback.sceneState.operativeCondition)),
    environmentState: cleanString(rawScene.environmentState, fallback.sceneState.environmentState),
    alertState: cleanString(rawScene.alertState, fallback.sceneState.alertState)
  };

  // Completed history is immutable. AI may add to it, never remove previous items.
  sceneState.completedActions = unique([...previousScene.completedActions, ...sceneState.completedActions]).slice(-20);
  sceneState.activeConsequences = unique([...previousScene.activeConsequences, ...sceneState.activeConsequences]).slice(-16);
  sceneState.discoveredIntel = unique([...previousScene.discoveredIntel, ...sceneState.discoveredIntel]).slice(-16);
  sceneState.uncertainIntel = unique([...previousScene.uncertainIntel, ...sceneState.uncertainIntel]).slice(-12);

  const rawChanges = raw?.stateChanges || {};
  const rawReasons = rawChanges?.reasons || raw?.statReasons || {};
  const normalizeReason = (value: unknown): string => {
    const reason = cleanString(value);
    if (!reason || reason.length > 180 || /reason only if|player'?s complete directive|same as action/i.test(reason)) return "";
    const action = playerAction.trim().toLowerCase();
    if (action.length > 40) {
      const reasonLower = reason.toLowerCase();
      if (reasonLower === action || reasonLower.includes(action.slice(0, Math.min(90, action.length)))) return "";
    }
    return reason;
  };
  const stateChanges: SimulationStateChanges = {
    healthDelta: clamp(rawChanges.healthDelta, -30, 5, 0),
    coverDelta: clamp(rawChanges.coverDelta, -35, 10, 0),
    vigilanceDelta: clamp(rawChanges.vigilanceDelta, -20, 35, 0),
    suspicionDelta: clamp(rawChanges.suspicionDelta, -20, 30, 0),
    intelConfidenceDelta: clamp(rawChanges.intelConfidenceDelta, -20, 30, 0),
    politicalExposureDelta: clamp(rawChanges.politicalExposureDelta, -20, 30, 0),
    collateralDamageDelta: clamp(rawChanges.collateralDamageDelta, 0, 25, 0),
    timePressureDelta: clamp(rawChanges.timePressureDelta, -20, 30, 0),
    escapeReadinessDelta: clamp(rawChanges.escapeReadinessDelta, -20, 30, 0),
    alertLevel: ["LOW", "NORMAL", "HEIGHTENED", "CRITICAL", "LOCKDOWN"].includes(rawChanges.alertLevel)
      ? rawChanges.alertLevel
      : fallback.stateChanges.alertLevel,
    reasons: {
      health: normalizeReason(rawReasons.health),
      cover: normalizeReason(rawReasons.cover),
      vigilance: normalizeReason(rawReasons.vigilance),
      suspicion: normalizeReason(rawReasons.suspicion),
      intelConfidence: normalizeReason(rawReasons.intelConfidence),
      politicalExposure: normalizeReason(rawReasons.politicalExposure),
      collateralDamage: normalizeReason(rawReasons.collateralDamage),
      timePressure: normalizeReason(rawReasons.timePressure),
      escapeReadiness: normalizeReason(rawReasons.escapeReadiness)
    }
  };

  // A non-zero stat change without its own short causal explanation is rejected.
  const reasonPairs: Array<[keyof SimulationStatReasons, keyof Omit<SimulationStateChanges, "alertLevel" | "reasons">]> = [
    ["health", "healthDelta"],
    ["cover", "coverDelta"],
    ["vigilance", "vigilanceDelta"],
    ["suspicion", "suspicionDelta"],
    ["intelConfidence", "intelConfidenceDelta"],
    ["politicalExposure", "politicalExposureDelta"],
    ["collateralDamage", "collateralDamageDelta"],
    ["timePressure", "timePressureDelta"],
    ["escapeReadiness", "escapeReadinessDelta"]
  ];
  for (const [reasonKey, deltaKey] of reasonPairs) {
    if (stateChanges[deltaKey] !== 0 && !stateChanges.reasons[reasonKey]) {
      (stateChanges as any)[deltaKey] = 0;
    }
  }

  // Alert level cannot jump on its own when neither vigilance nor suspicion has a supported change.
  if (stateChanges.vigilanceDelta === 0 && stateChanges.suspicionDelta === 0) {
    stateChanges.alertLevel = fallback.stateChanges.alertLevel;
  }

  const choicesRaw = Array.isArray(raw?.choices) ? raw.choices : [];
  const choices = choicesRaw
    .filter((choice: any) => choice && typeof choice.text === "string" && choice.text.trim())
    .slice(0, 5)
    .map((choice: any, index: number) => ({
      id: cleanString(choice.id, `choice-${index + 1}`),
      text: cleanString(choice.text),
      actionType: (["STEALTH", "TACTICAL", "DIPLOMATIC", "AGGRESSIVE"].includes(choice.actionType)
        ? choice.actionType
        : inferActionTypeFromText(choice.text)) as SimulationActionType,
      risk: (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(choice.risk) ? choice.risk : "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      requiredSkillOrTool: cleanString(choice.requiredSkillOrTool) || undefined
    }));

  return {
    sceneTitle: cleanString(raw?.sceneTitle, fallback.sceneTitle),
    timestamp: cleanString(raw?.timestamp, fallback.timestamp),
    narrative: (() => {
      let narrative = cleanString(raw?.narrative ?? raw?.sceneNarrative, fallback.narrative);
      const locationMentions = backgroundLocations.filter(loc => narrative.toLowerCase().includes(loc.toLowerCase())).length;
      if (joinedBackgroundLocations && narrative.includes(joinedBackgroundLocations)) {
        narrative = narrative.split(joinedBackgroundLocations).join(sceneState.currentLocation);
      } else if (backgroundLocations.length >= 3 && locationMentions >= 3) {
        narrative = fallback.narrative;
      }
      if (filmObjective.length > 80 && narrative.toLowerCase().includes(filmObjective.toLowerCase())) {
        narrative = narrative.replace(new RegExp(filmObjective.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "the wider classified operation");
      }
      return narrative;
    })(),
    sceneState,
    choices: choices.length >= 2 ? choices : fallback.choices,
    stateChanges,
    newEvidence: cleanString(raw?.newEvidence) || null,
    relationshipChanges: cleanString(raw?.relationshipChanges) || null,
    missionLogEntry: cleanString(raw?.missionLogEntry, fallback.missionLogEntry)
  };
}


export function migrateLegacyTurnLimitedMissionState(state: MissionState): MissionState {
  const hitLegacyAutoVictory =
    state.maxTurns === 10 &&
    state.currentTurn >= 10 &&
    state.outcome === "VICTORY" &&
    !state.sessionFinished;

  if (!hitLegacyAutoVictory) return state;

  return {
    ...state,
    outcome: "IN_PROGRESS",
    sessionFinished: false,
    missionProgress: Math.min(95, state.missionProgress ?? 95),
    objectiveStatus: state.objectiveStatus === "PRIMARY COMPLETED" ? "PENDING" : state.objectiveStatus,
  };
}

export function applySimulationTurnToMissionState(params: {
  missionState: MissionState;
  turn: NormalizedSimulationTurn;
  actionText: string;
  now?: number;
}): MissionState {
  const { missionState, turn, actionText } = params;
  const currentTurn = missionState.currentTurn;
  const nextTurn = currentTurn + 1;
  const changes = turn.stateChanges;
  const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

  const newHealth = clampPercent(missionState.agentHealth + changes.healthDelta);
  const newCover = clampPercent(missionState.stealthRating + changes.coverDelta);
  const newVigilance = clampPercent(missionState.alarmLevel + changes.vigilanceDelta);
  const newSuspicion = clampPercent((missionState.suspicion ?? 0) + changes.suspicionDelta);
  const newIntelConfidence = clampPercent((missionState.intelligenceConfidence ?? 0) + changes.intelConfidenceDelta);
  const newPoliticalExposure = clampPercent((missionState.politicalExposure ?? 0) + changes.politicalExposureDelta);
  const newCollateral = clampPercent((missionState.collateralDamage ?? 0) + changes.collateralDamageDelta);
  const newTimePressure = clampPercent((missionState.timePressure ?? 0) + changes.timePressureDelta);
  const newEscapeReadiness = clampPercent((missionState.escapeReadiness ?? 0) + changes.escapeReadinessDelta);

  const priorScene = missionState.sceneState || turn.sceneState;
  const sceneState: MissionSceneState = {
    ...turn.sceneState,
    completedActions: unique([...(priorScene.completedActions || []), ...turn.sceneState.completedActions]).slice(-20),
    discoveredIntel: unique([...(priorScene.discoveredIntel || []), ...turn.sceneState.discoveredIntel]).slice(-16),
    uncertainIntel: unique([...(priorScene.uncertainIntel || []), ...turn.sceneState.uncertainIntel]).slice(-12),
    activeConsequences: unique([...(priorScene.activeConsequences || []), ...turn.sceneState.activeConsequences]).slice(-16)
  };

  const decisions = turn.choices.slice(0, 5).map((choice, idx) => ({
    id: choice.id || `dec-${nextTurn}-${idx + 1}`,
    text: choice.text,
    actionType: choice.actionType,
    risk: choice.risk
  }));

  const evidence = turn.newEvidence
    ? unique([...(missionState.evidence || []), turn.newEvidence])
    : (missionState.evidence || []);
  // Sessions are intentionally open-ended. Progress reflects concrete field advancement,
  // never the number of turns elapsed. 100% is reserved for an explicitly finished session.
  const movedLocation = sceneState.currentLocation !== priorScene.currentLocation;
  const progressGain = Math.max(
    1,
    Math.round(
      Math.max(0, changes.intelConfidenceDelta) * 0.35 +
      (turn.newEvidence ? 4 : 0) +
      (movedLocation ? 3 : 0)
    )
  );
  const progress = Math.min(99, Math.max(0, missionState.missionProgress ?? 5) + progressGain);
  const isDefeat = newHealth <= 0;
  const time = `+${String(nextTurn * 3).padStart(2, "0")}:00 ZULU`;
  const now = params.now ?? Date.now();

  const templateId = missionState.templateId || "template-danube";
  const rawAdversary = missionState.adversaryState || createAdversaryRuntime(templateId);
  const { updatedAdversary } = advanceAdversaryTurn(
    rawAdversary,
    actionText,
    turn.choices.find(c => c.text === actionText)?.actionType || "TACTICAL",
    (missionState.lastRiskResolution?.outcome)
  );

  const allPhases = missionState.phases?.length ? missionState.phases : getMissionPhases(templateId);
  const currentPhase = missionState.currentPhase || allPhases[0];
  const { currentPhase: nextPhase, allPhases: updatedPhases, phaseMilestone } = evaluatePhaseProgression(
    currentPhase,
    allPhases,
    nextTurn,
    sceneState.completedActions
  );

  return {
    ...missionState,
    currentTurn: nextTurn,
    agentHealth: newHealth,
    stealthRating: newCover,
    coverIntegrity: newCover,
    alarmLevel: newVigilance,
    suspicion: newSuspicion,
    currentScenarioText: turn.narrative || missionState.currentScenarioText,
    availableDecisions: decisions,
    adversaryState: updatedAdversary,
    currentPhase: nextPhase,
    phases: updatedPhases,
    coverIdentity: missionState.coverIdentity,
    timeline: [
      ...missionState.timeline,
      {
        turn: currentTurn,
        action: actionText,
        consequence: (phaseMilestone ? `${phaseMilestone} • ` : "") + (turn.missionLogEntry || `Scene updated at ${sceneState.currentLocation}.`),
        time
      }
    ],
    intelDiscovered: unique([
      ...missionState.intelDiscovered,
      ...sceneState.discoveredIntel,
      ...(turn.newEvidence ? [turn.newEvidence] : [])
    ]).slice(-30),
    causalTree: [
      ...missionState.causalTree,
      {
        id: `node-${nextTurn}-${now}`,
        turnNumber: currentTurn,
        description: actionText,
        outcome: (phaseMilestone ? `[${nextPhase.shortTitle}] ` : "") + (turn.missionLogEntry || `Scene advanced to ${sceneState.currentLocation}`),
        consequence: sceneState.activeConsequences.slice(-3).join(" • ") || undefined,
        healthChange: changes.healthDelta,
        stealthChange: changes.coverDelta,
        timestamp: new Date(now).toISOString(),
        delayedRisk: sceneState.activeConsequences.at(-1),
        status: isDefeat ? "FAILED" : "COMPLETED",
        parentId: missionState.causalTree.at(-1)?.id
      }
    ],
    missionProgress: progress,
    enemyAlertLevel: changes.alertLevel || missionState.enemyAlertLevel || "NORMAL",
    intelligenceConfidence: newIntelConfidence,
    evidence,
    collateralDamage: newCollateral,
    politicalExposure: newPoliticalExposure,
    timePressure: newTimePressure,
    escapeReadiness: newEscapeReadiness,
    objectiveStatus: isDefeat ? "COMPROMISED" : missionState.objectiveStatus || "PENDING",
    unresolvedConsequences: sceneState.activeConsequences.slice(-16),
    outcome: isDefeat ? "DEFEAT" : (updatedAdversary.masterPlanProgress >= 100 ? "DEFEAT" : "IN_PROGRESS"),
    sessionFinished: false,
    sceneState,
    lastStatReasons: changes.reasons
  };
}
