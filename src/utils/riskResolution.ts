import type { MissionState, RiskResolution } from "../types";
import type { SuccessProbabilityResult } from "./successProbability";

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function inferRisk(text: string, actionType: string): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const lower = text.toLowerCase();
  if (/suicide|nuclear|warhead|jump from|cliff|point blank|hostage|explosive|detonat|ramming|open fire/.test(lower)) return "CRITICAL";
  if (/assault|breach|shoot|fight|pursuit|chase|parachute|helicopter|aircraft/.test(lower)) return "HIGH";
  if (actionType === "AGGRESSIVE") return "HIGH";
  if (actionType === "TACTICAL") return "MEDIUM";
  if (actionType === "STEALTH" || actionType === "DIPLOMATIC") return "LOW";
  return "MEDIUM";
}

export function resolveRiskCheck(params: {
  state: MissionState;
  actionText: string;
  actionType: string;
  probability: SuccessProbabilityResult;
  explicitRisk?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}): RiskResolution {
  const risk = params.explicitRisk || inferRisk(params.actionText, params.actionType);
  const riskPenalty = risk === "LOW" ? -8 : risk === "MEDIUM" ? 0 : risk === "HIGH" ? 10 : 20;
  const target = Math.max(5, Math.min(95, params.probability.probability - riskPenalty));
  const seed = `${params.state.id || "mission"}:${params.state.currentTurn}:${params.actionText}`;
  const roll = (hashSeed(seed) % 100) + 1;
  const margin = target - roll;
  let outcome: RiskResolution["outcome"];
  if (margin >= 30) outcome = "CRITICAL_SUCCESS";
  else if (margin >= 0) outcome = "SUCCESS";
  else if (margin >= -18) outcome = "PARTIAL_SUCCESS";
  else if (margin >= -35) outcome = "TACTICAL_SETBACK";
  else outcome = "CATASTROPHIC_EXPOSURE";
  return {
    roll,
    target,
    risk,
    outcome,
    summary: `${risk} risk check: ${roll} vs ${target} → ${outcome.replaceAll("_", " ")}`
  };
}

export function applyRiskResolutionToTurn<T extends { narrative?: string; stateChanges?: any; missionLogEntry?: string }>(turn: T, risk: RiskResolution): T {
  const changes = { ...(turn.stateChanges || {}) };
  changes.reasons = { ...(changes.reasons || {}) };
  if (risk.outcome === "CRITICAL_SUCCESS") {
    changes.intelConfidenceDelta = Math.max(changes.intelConfidenceDelta || 0, 8);
    changes.coverDelta = Math.max(changes.coverDelta || 0, 4);
    changes.reasons.intelConfidence ||= "Risk resolution produced an unusually clean operational breakthrough.";
  } else if (risk.outcome === "PARTIAL_SUCCESS") {
    changes.suspicionDelta = Math.max(changes.suspicionDelta || 0, 6);
    changes.reasons.suspicion ||= "The objective advanced, but the action left a detectable trace.";
  } else if (risk.outcome === "TACTICAL_SETBACK") {
    changes.coverDelta = Math.min(changes.coverDelta || 0, -8);
    changes.vigilanceDelta = Math.max(changes.vigilanceDelta || 0, 10);
    changes.reasons.cover ||= "The attempted action was disrupted before a clean resolution.";
    changes.reasons.vigilance ||= "Hostile security reacted to the failed maneuver.";
  } else if (risk.outcome === "CATASTROPHIC_EXPOSURE") {
    changes.coverDelta = Math.min(changes.coverDelta || 0, -18);
    changes.vigilanceDelta = Math.max(changes.vigilanceDelta || 0, 18);
    changes.suspicionDelta = Math.max(changes.suspicionDelta || 0, 15);
    changes.reasons.cover ||= "The high-risk action catastrophically exposed the operative.";
    changes.reasons.vigilance ||= "Hostile forces escalated immediately after the failed action.";
    changes.reasons.suspicion ||= "The operative's identity or intent is now substantially compromised.";
  }
  return {
    ...turn,
    narrative: `${turn.narrative || ""}\n\nRISK RESOLUTION: ${risk.summary}.`,
    missionLogEntry: `${turn.missionLogEntry || "Action resolved"} // ${risk.summary}`,
    stateChanges: changes
  };
}
