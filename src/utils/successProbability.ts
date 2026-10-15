import { MissionState } from "../types";
import { BondDoctrine, BOND_DOCTRINES } from "../data/bondDoctrines";

export interface ProbabilityFactor {
  factor: string;
  impact: number; // e.g. +12 or -8
  type: "positive" | "negative" | "neutral";
  description: string;
}

export interface SuccessProbabilityResult {
  probability: number; // 0 to 100
  level: "CRITICAL RISK" | "JEOPARDIZED" | "UNCERTAIN" | "FAVORABLE" | "OPTIMAL";
  ratingColor: string;
  badgeBg: string;
  synergyScore: number; // -20 to +20
  synergyLabel: string;
  doctrineName: string;
  factors: ProbabilityFactor[];
}

/**
 * Calculates dynamic probability of mission success based on operative vitals,
 * situational intelligence, hostile alertness, decision history, and alignment
 * with the active Bond Persona doctrine.
 */
export function calculateSuccessProbability(
  state: MissionState,
  doctrineOrId?: BondDoctrine | string
): SuccessProbabilityResult {
  // Resolve doctrine
  let doctrine: BondDoctrine;
  if (!doctrineOrId) {
    const doctrineId = state.doctrineId || "connery";
    doctrine = BOND_DOCTRINES.find(d => d.id === doctrineId) || BOND_DOCTRINES[0];
  } else if (typeof doctrineOrId === "string") {
    doctrine = BOND_DOCTRINES.find(d => d.id === doctrineOrId) || BOND_DOCTRINES[0];
  } else {
    doctrine = doctrineOrId;
  }

  const factors: ProbabilityFactor[] = [];

  // Base telemetry vitals
  const health = Math.max(0, Math.min(100, state.agentHealth ?? 100));
  const cover = Math.max(0, Math.min(100, state.stealthRating ?? 80));
  const alarm = Math.max(0, Math.min(100, state.alarmLevel ?? 20));
  const suspicion = Math.max(0, Math.min(100, state.suspicion ?? 10));
  const intelConfidence = Math.max(0, Math.min(100, state.intelligenceConfidence ?? 25));
  const escapeReadiness = Math.max(0, Math.min(100, state.escapeReadiness ?? 15));
  const politicalExposure = Math.max(0, Math.min(100, state.politicalExposure ?? 0));
  const collateralDamage = Math.max(0, Math.min(100, state.collateralDamage ?? 0));
  const timePressure = Math.max(0, Math.min(100, state.timePressure ?? 20));

  // 1. Health / Operative Condition Weight (Base pool: 25 pts)
  let healthScore = (health / 100) * 25;
  if (health >= 80) {
    factors.push({
      factor: "Optimal Physical Condition",
      impact: +5,
      type: "positive",
      description: `Operative health at ${health}% allows full operational agility.`
    });
  } else if (health < 40) {
    factors.push({
      factor: "Sustained Physical Damage",
      impact: -10,
      type: "negative",
      description: `Critical injury (${health}% health) severely limits tactical escape windows.`
    });
  }

  // 2. Cover & Stealth vs. Suspicion (Base pool: 20 pts)
  const netStealth = Math.max(0, cover - suspicion * 0.75);
  const stealthScore = (netStealth / 100) * 20;
  if (cover > 70 && suspicion < 25) {
    factors.push({
      factor: "Deep Cover Integrity",
      impact: +6,
      type: "positive",
      description: "Hostile network unaware of true identity and presence."
    });
  } else if (suspicion > 50 || cover < 30) {
    factors.push({
      factor: "Compromised Cover",
      impact: -8,
      type: "negative",
      description: `Heightened hostile suspicion (${suspicion}%) threatens operational secrecy.`
    });
  }

  // 3. Intelligence Exploitation (Base pool: 20 pts)
  const intelScore = (intelConfidence / 100) * 20;
  if (intelConfidence >= 60) {
    factors.push({
      factor: "Actionable Intelligence Lead",
      impact: +8,
      type: "positive",
      description: `SIS and field recon provide ${intelConfidence}% situational clarity.`
    });
  } else if (intelConfidence < 25) {
    factors.push({
      factor: "Intelligence Deficit",
      impact: -5,
      type: "negative",
      description: "Operating with unverified hostile disposition and layout."
    });
  }

  // 4. Hostile Alert & Vigilance (Base penalty: up to -15 pts)
  const alertPenalty = (alarm / 100) * 12 + (timePressure / 100) * 5;
  if (alarm >= 60) {
    factors.push({
      factor: "Hostile Station Lockdown",
      impact: -10,
      type: "negative",
      description: `Area vigilance at ${alarm}% with active patrols and reinforced perimeters.`
    });
  } else if (alarm <= 25) {
    factors.push({
      factor: "Unaware Target Security",
      impact: +4,
      type: "positive",
      description: "Standard patrol routines without heightened counter-measures."
    });
  }

  // 5. Extraction & Support Readiness (Base bonus: up to +10 pts)
  const extractionScore = (escapeReadiness / 100) * 10;
  if (escapeReadiness >= 50) {
    factors.push({
      factor: "Exfiltration Window Secured",
      impact: +6,
      type: "positive",
      description: `Q-Branch & Allied routes primed for immediate extraction (${escapeReadiness}%).`
    });
  }

  // 6. Political & Collateral Constraints (Penalty: up to -10 pts)
  const exposurePenalty = ((politicalExposure + collateralDamage) / 200) * 10;
  if (politicalExposure > 50 || collateralDamage > 40) {
    factors.push({
      factor: "Whitehall Diplomatic Heat",
      impact: -6,
      type: "negative",
      description: `Political exposure (${politicalExposure}%) limits aggressive support options.`
    });
  }

  // 7. BOND PERSONA DOCTRINE SYNERGY CALCULATION (-15 to +18 pts)
  // Analyze decision history alignment with the active doctrine
  let synergyScore = 0;
  let actionMatches = 0;
  let totalActions = state.timeline?.length || 0;

  if (state.timeline && state.timeline.length > 0) {
    state.timeline.forEach(turn => {
      const text = (turn.action || "").toLowerCase();

      // Check alignment based on specific Bond archetype
      switch (doctrine.id) {
        case "connery":
          // Connery thrives on charm, deception, pragmatism, ruthlessness
          if (text.includes("charm") || text.includes("deceiv") || text.includes("feign") || text.includes("baccarat") || text.includes("suit") || text.includes("disarm")) {
            actionMatches++;
          }
          break;
        case "lazenby":
          // Lazenby thrives on empathy, ally protection, physical leaps
          if (text.includes("protect") || text.includes("ally") || text.includes("commit") || text.includes("leap") || text.includes("courag")) {
            actionMatches++;
          }
          break;
        case "moore":
          // Moore thrives on diplomacy, de-escalation, high-tech decorum, patience
          if (text.includes("diplomat") || text.includes("gadget") || text.includes("watch") || text.includes("calm") || text.includes("subtle") || text.includes("witty")) {
            actionMatches++;
          }
          break;
        case "dalton":
          // Dalton thrives on tactical discipline, sniper recon, professional grit
          if (text.includes("tactical") || text.includes("recon") || text.includes("sniper") || text.includes("method") || text.includes("disciplin") || text.includes("surveill")) {
            actionMatches++;
          }
          break;
        case "brosnan":
          // Brosnan thrives on hybrid tech, modern firearms, stylish composure
          if (text.includes("tech") || text.includes("q-branch") || text.includes("bmw") || text.includes("laser") || text.includes("hack") || text.includes("dual")) {
            actionMatches++;
          }
          break;
        case "craig":
          // Craig thrives on raw resilience, relentless kinetic force, stoicism
          if (text.includes("force") || text.includes("assault") || text.includes("breach") || text.includes("brawl") || text.includes("relentless") || text.includes("endur")) {
            actionMatches++;
          }
          break;
      }
    });

    if (totalActions > 0) {
      const ratio = actionMatches / totalActions;
      if (ratio >= 0.4) {
        synergyScore = Math.round(ratio * 16);
      } else if (ratio === 0 && totalActions >= 2) {
        synergyScore = -4;
      }
    }
  }

  // Base inherent archetype strength applied to current context
  let doctrineContextBonus = 0;
  if (doctrine.id === "connery" && (cover > 50 || suspicion < 40)) {
    doctrineContextBonus = 6;
  } else if (doctrine.id === "moore" && (politicalExposure > 30 || alarm < 40)) {
    doctrineContextBonus = 6; // Moore excels at diffusing diplomatic heat
  } else if (doctrine.id === "dalton" && (intelConfidence > 40 || alarm > 40)) {
    doctrineContextBonus = 7; // Dalton excels in grim tactical combat & intel extraction
  } else if (doctrine.id === "craig" && (alarm > 60 || health < 60)) {
    doctrineContextBonus = 8; // Craig shines when cornered in high danger
  } else if (doctrine.id === "brosnan" && (state.timeline?.length || 0) >= 2) {
    doctrineContextBonus = 6; // Brosnan excels in balanced multi-phase ops
  } else if (doctrine.id === "lazenby" && state.casualties?.length === 0) {
    doctrineContextBonus = 5; // Lazenby excels when preserving team lives
  }

  const totalDoctrineBonus = Math.min(18, synergyScore + doctrineContextBonus);

  if (totalDoctrineBonus >= 8) {
    factors.push({
      factor: `${doctrine.name} Persona Synergy`,
      impact: +totalDoctrineBonus,
      type: "positive",
      description: `Operational decisions align seamlessly with ${doctrine.name}'s doctrine strengths (${doctrine.strengths.slice(0, 2).join(", ")}).`
    });
  } else if (totalDoctrineBonus < 0) {
    factors.push({
      factor: "Doctrine Friction",
      impact: totalDoctrineBonus,
      type: "negative",
      description: `Field actions diverge from ${doctrine.name}'s core operational doctrine.`
    });
  }

  // Compute Raw Composite Probability
  // Base baseline starting probability: ~40% + components
  let rawProbability = 30 + healthScore + stealthScore + intelScore + extractionScore - alertPenalty - exposurePenalty + totalDoctrineBonus;

  // Clamp within realistic 00-Section operational thresholds (5% - 98%)
  const probability = Math.max(5, Math.min(98, Math.round(rawProbability)));

  // Determine Level & Theme
  let level: SuccessProbabilityResult["level"];
  let ratingColor: string;
  let badgeBg: string;

  if (probability >= 80) {
    level = "OPTIMAL";
    ratingColor = "text-emerald-400";
    badgeBg = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  } else if (probability >= 65) {
    level = "FAVORABLE";
    ratingColor = "text-sky-400";
    badgeBg = "bg-sky-500/20 text-sky-300 border-sky-500/40";
  } else if (probability >= 45) {
    level = "UNCERTAIN";
    ratingColor = "text-amber-400";
    badgeBg = "bg-amber-500/20 text-amber-300 border-amber-500/40";
  } else if (probability >= 25) {
    level = "JEOPARDIZED";
    ratingColor = "text-orange-400";
    badgeBg = "bg-orange-500/20 text-orange-300 border-orange-500/40";
  } else {
    level = "CRITICAL RISK";
    ratingColor = "text-red-400";
    badgeBg = "bg-red-500/20 text-red-300 border-red-500/40";
  }

  let synergyLabel = "NOMINAL SYNERGY";
  if (totalDoctrineBonus >= 10) synergyLabel = "OPTIMAL DOCTRINE FIT";
  else if (totalDoctrineBonus >= 5) synergyLabel = "STRONG PERSONA ALIGNMENT";
  else if (totalDoctrineBonus < 0) synergyLabel = "DOCTRINE MISALIGNMENT";

  return {
    probability,
    level,
    ratingColor,
    badgeBg,
    synergyScore: totalDoctrineBonus,
    synergyLabel,
    doctrineName: doctrine.name,
    factors: factors.slice(0, 4)
  };
}
