import { MissionPhase } from "../types";

export function getMissionPhases(templateId: string): MissionPhase[] {
  const genericPhases: MissionPhase[] = [
    {
      id: "phase-1",
      order: 1,
      name: "Phase I: Cover Ingestion & Theatre Infiltration",
      shortTitle: "I: INFILTRATION",
      description: "Establish covert staging foothold, verify forged credentials, and penetrate initial hostile perimeter.",
      primaryTasks: [
        "Infiltrate local staging area without alerting regional security",
        "Confirm cover credentials and establish local observation post",
        "Identify primary access vector to high-security target sector"
      ],
      hazardLevel: "LOW",
      completedTasks: [],
      isComplete: false,
      transitionRequirement: "Breach outer perimeter or gain authenticated access to inner facility"
    },
    {
      id: "phase-2",
      order: 2,
      name: "Phase II: Reconnaissance & Intelligence Ingestion",
      shortTitle: "II: RECON & INTEL",
      description: "Locate hostile command center, tap communications, identify key personnel, and verify target vulnerabilities.",
      primaryTasks: [
        "Recover encrypted manifests, blueprints or cipher keys",
        "Establish visual on primary adversary and evaluate security detail",
        "Disrupt or delay the adversary's master plan countdown"
      ],
      hazardLevel: "MODERATE",
      completedTasks: [],
      isComplete: false,
      transitionRequirement: "Recover actionable operational intelligence on the adversary's immediate scheme"
    },
    {
      id: "phase-3",
      order: 3,
      name: "Phase III: Sabotage & Climax Confrontation",
      shortTitle: "III: CLIMAX & SABOTAGE",
      description: "Execute surgical strike against core target asset, neutralize villain defenses, and prevent catastrophic execution.",
      primaryTasks: [
        "Infiltrate inner sanctum / command bunker / vault",
        "Sabotage weapon system, trigger mechanism, or financial ledger",
        "Neutralize key hostile henchmen or corner the primary antagonist"
      ],
      hazardLevel: "CRITICAL",
      completedTasks: [],
      isComplete: false,
      transitionRequirement: "Neutralize primary threat asset or render adversary master weapon inoperable"
    },
    {
      id: "phase-4",
      order: 4,
      name: "Phase IV: Evasion, Pursuit & Exfiltration",
      shortTitle: "IV: EXFILTRATION",
      description: "Evacuate compromised combat theatre, survive pursuit counter-attacks, and extract to safe rendezvous.",
      primaryTasks: [
        "Break through surviving hostile security cordon",
        "Deploy vehicle countermeasures or covert exfiltration vector",
        "Link up with SIS / Allied extraction team"
      ],
      hazardLevel: "HIGH",
      completedTasks: [],
      isComplete: false,
      transitionRequirement: "Reach secure international waters, allied airspace, or SIS extraction point"
    }
  ];

  if (templateId === "film-goldfinger") {
    genericPhases[0].description = "Establish surveillance on Goldfinger's Swiss refinery and Kentucky stud farm.";
    genericPhases[0].primaryTasks = ["Surveil Swiss smelting facility", "Infiltrate Auric Enterprises Kentucky perimeter", "Identify Operation Grand Slam blueprints"];
    genericPhases[1].description = "Eavesdrop on syndicate briefing and discover the nerve gas dispersal timetable.";
    genericPhases[2].description = "Breach the Fort Knox depository vault and disarm the nuclear device.";
    genericPhases[3].description = "Overcome remaining private security and extract from the Kentucky combat zone.";
  } else if (templateId === "film-casino-royale") {
    genericPhases[0].description = "Arrive in Montenegro, establish high-stakes cover with Vesper Lynd, and enter tournament.";
    genericPhases[1].description = "Out-gamble Le Chiffre, survive poison attempt, and extract syndicate financial data.";
    genericPhases[2].description = "Rescue Vesper from syndicate torture and track the stolen funds to Venice.";
    genericPhases[3].description = "Survive the collapsing Venetian palazzo and extract with the recovered accounts.";
  } else if (templateId === "film-goldeneye") {
    genericPhases[0].description = "Infiltrate St. Petersburg under arms broker cover and establish contact with Valentin Zukovsky.";
    genericPhases[1].description = "Meet Janus at the statue park, rescue Natalya Simonova, and track the armored train.";
    genericPhases[2].description = "Infiltrate the Cuban jungle satellite cradle and sabotage the GoldenEye dish.";
    genericPhases[3].description = "Confront Alec Trevelyan on the antenna cradle and extract before the dish collapses.";
  } else if (templateId === "template-danube") {
    genericPhases[0].description = "Submerge into Danube Lock 4 and board the lead-shielded barge unnoticed.";
    genericPhases[1].description = "Locate the tritium isotope cylinders and photograph shipping manifests.";
    genericPhases[2].description = "Neutralize escort patrol boats and secure the barge steering control.";
    genericPhases[3].description = "Guide barge into Austrian naval interdiction cordon for full containment.";
  }

  return genericPhases;
}

export function evaluatePhaseProgression(
  currentPhase: MissionPhase,
  allPhases: MissionPhase[],
  currentTurn: number,
  completedActions: string[]
): { currentPhase: MissionPhase; allPhases: MissionPhase[]; isNewPhase: boolean; phaseMilestone?: string } {
  const currentIdx = allPhases.findIndex(p => p.id === currentPhase.id);
  if (currentIdx === -1) return { currentPhase, allPhases, isNewPhase: false };

  // Phase transition logic based on turns or milestone completion
  let shouldAdvance = false;
  if (currentIdx === 0 && (currentTurn >= 3 || completedActions.length >= 2)) {
    shouldAdvance = true;
  } else if (currentIdx === 1 && (currentTurn >= 6 || completedActions.length >= 5)) {
    shouldAdvance = true;
  } else if (currentIdx === 2 && (currentTurn >= 9 || completedActions.length >= 8)) {
    shouldAdvance = true;
  }

  if (shouldAdvance && currentIdx + 1 < allPhases.length) {
    const nextPhase = { ...allPhases[currentIdx + 1], isComplete: false };
    const updatedPhases = allPhases.map((p, idx) => {
      if (idx === currentIdx) return { ...p, isComplete: true };
      return p;
    });
    return {
      currentPhase: nextPhase,
      allPhases: updatedPhases,
      isNewPhase: true,
      phaseMilestone: `OPERATIONAL ADVANCEMENT: Transitioned to ${nextPhase.name}. Objective rules shifted.`
    };
  }

  return { currentPhase, allPhases, isNewPhase: false };
}
