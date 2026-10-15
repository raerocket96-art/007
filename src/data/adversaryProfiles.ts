import { AdversaryRuntimeState } from "../types";

export type AdversaryProfile = {
  name: string;
  schemeName: string;
  doctrine: string;
  counters: string[];
  vulnerabilities: string[];
  escalation: string;
  initialDeadlineTurns: number;
};

const profiles: Record<string, AdversaryProfile> = {
  "film-goldfinger": {
    name: "Auric Goldfinger",
    schemeName: "Operation Grand Slam (Fort Knox Contamination)",
    doctrine: "Layered industrial security, nerve gas dispersal logistics, and controlled lethality",
    counters: ["obvious surveillance", "frontal intrusion", "predictable gunplay"],
    vulnerabilities: ["social manipulation", "financial leverage", "turning insiders"],
    escalation: "Responds to exposure with heavy nerve gas deployment, decoys, and hardened vault security.",
    initialDeadlineTurns: 10
  },
  "film-on-her-majestys-secret-service": {
    name: "Ernst Stavro Blofeld",
    schemeName: "Virus Omega (Bacteriological Extortion)",
    doctrine: "Compartmentalized alpine security, hypnotic conditioning, and hostage leverage",
    counters: ["predictable infiltration", "overt MI6 signatures", "frontal assaults"],
    vulnerabilities: ["heraldic identity deception", "inside contact cultivation", "allied coordination"],
    escalation: "Uses funicular isolation, timed avalanche charges, and armed henchmen when threatened.",
    initialDeadlineTurns: 10
  },
  "film-goldeneye": {
    name: "Alec Trevelyan (006 / Janus)",
    schemeName: "GoldenEye EMP London Financial Blackout",
    doctrine: "Counter-MI6 tradecraft, satellite synchronization, and psychological exploitation",
    counters: ["standard SIS procedure", "predictable gadget use", "bureaucratic delays"],
    vulnerabilities: ["unorthodox improvisation", "turning Janus logistics", "protecting Natalya"],
    escalation: "Anticipates Bond's training, accelerates satellite alignment, and weaponizes shared institutional knowledge.",
    initialDeadlineTurns: 9
  },
  "film-casino-royale": {
    name: "Le Chiffre",
    schemeName: "Montenegro Financial Restitution & Terror Brokering",
    doctrine: "Financial leverage, private military security, and coercive psychological pressure",
    counters: ["direct intimidation", "reckless exposure", "obvious eavesdropping"],
    vulnerabilities: ["bluffing", "financial disruption", "patient card-play observation"],
    escalation: "Uses debt pressure, digital poison countermeasures, and hired hitmen when financially cornered.",
    initialDeadlineTurns: 11
  },
  "film-skyfall": {
    name: "Raoul Silva",
    schemeName: "Whitehall Cyber Penetration & M Assassination",
    doctrine: "Cyber manipulation, surveillance inversion, and institutional psychological warfare",
    counters: ["networked electronics", "predictable digital tracking", "government protocols"],
    vulnerabilities: ["low-tech improvisation", "physical isolation", "unpredictable misdirection"],
    escalation: "Turns connected systems against the operative and attacks institutional trust directly.",
    initialDeadlineTurns: 8
  },
  "film-die-another-day": {
    name: "Gustav Graves / Colonel Moon",
    schemeName: "Icarus Orbital Sun-Laser Weaponization",
    doctrine: "Technology-heavy spectacle, layered cover identities, and rapid escalation",
    counters: ["slow bureaucratic response", "obvious surveillance", "isolated assaults"],
    vulnerabilities: ["identity exposure", "allied intelligence cooperation", "sabotage of Icarus control links"],
    escalation: "Escalates rapidly through private armored security, hovercraft, and orbital targeting.",
    initialDeadlineTurns: 9
  },
  "film-octopussy": {
    name: "Kamal Khan & General Orlov",
    schemeName: "Karl-Marx-Stadt Nuclear Train Detonation",
    doctrine: "Smuggling compartmentalization, circus deception, and deniable rogue military logistics",
    counters: ["single-source assumptions", "overt pursuit", "border checkpoints"],
    vulnerabilities: ["cargo manifest tracking", "source cultivation", "logistics intelligence"],
    escalation: "Relocates cargo, burns intermediaries, and accelerates the bomb detonation timetable.",
    initialDeadlineTurns: 9
  },
  "film-the-spy-who-loved-me": {
    name: "Karl Stromberg",
    schemeName: "Submarine Nuclear Armageddon & Atlantis Hegemony",
    doctrine: "Remote submarine control, maritime isolation, and private naval security",
    counters: ["surface-only assault", "predictable naval approaches", "direct torpedo attacks"],
    vulnerabilities: ["technical sabotage", "subsurface infiltration", "turning command staff"],
    escalation: "Seals submersible compartments, fires nuclear tracking torpedos, and deploys heavy hitmen.",
    initialDeadlineTurns: 10
  },
  "template-danube": {
    name: "Danube Shadow Syndicate",
    schemeName: "Tritium Isotope Smuggling & Dirty Weapon Transfer",
    doctrine: "Riverway compartmentalization, armed escort patrol boats, and lead shielding",
    counters: ["noisy motorboat pursuit", "predictable bridge checkpoints"],
    vulnerabilities: ["underwater hull infiltration", "customs document fraud", "diverting lock gates"],
    escalation: "Accelerates barge engine RPM, scuttles evidence into riverbed, and opens automatic fire.",
    initialDeadlineTurns: 8
  }
};

export function getAdversaryProfile(templateId: string): AdversaryProfile {
  return profiles[templateId] || {
    name: "Primary Hostile Syndicate",
    schemeName: "Classified Hostile Operation",
    doctrine: "Adaptive counter-intelligence and escalating local security",
    counters: ["repeated tactics", "predictable routes"],
    vulnerabilities: ["fresh intelligence", "deception", "environmental improvisation"],
    escalation: "Raises vigilance and closes routes when the same tactic is repeated or obvious traces are left behind.",
    initialDeadlineTurns: 10
  };
}

export function createAdversaryRuntime(templateId: string): AdversaryRuntimeState {
  const profile = getAdversaryProfile(templateId);
  return {
    id: `adv-${templateId}`,
    name: profile.name,
    schemeName: profile.schemeName,
    masterPlanProgress: 15,
    turnsToCriticalDeadline: profile.initialDeadlineTurns,
    activeCountermeasures: ["Standard patrol sweeps", "Encrypted radio channels"],
    currentVulnerability: profile.vulnerabilities[0] || "Covert deception",
    lastAdversaryMove: "Adversary staging underway; primary plan advancing according to schedule.",
    threatLevel: "MODERATE"
  };
}

export function advanceAdversaryTurn(
  adversary: AdversaryRuntimeState,
  actionText: string,
  actionType: string,
  riskOutcome?: string
): { updatedAdversary: AdversaryRuntimeState; consequenceText?: string; deltaAlert: number } {
  const lower = actionText.toLowerCase();
  let progressDelta = 10;
  let deadlineDelta = -1;
  let deltaAlert = 0;
  let moveDescription = "";
  const newCountermeasures = [...adversary.activeCountermeasures];

  // If the player executed direct sabotage or exploited a vulnerability
  const isDirectSabotage = /sabotage|destroy|disarm|cut |intercept|disable|jam |overload|hack/.test(lower) || actionType === "AGGRESSIVE";
  const isCovertInfiltration = /silent|sneak|stealth|observe|watch|shadow|eavesdrop/.test(lower) || actionType === "STEALTH";

  if (riskOutcome === "CRITICAL_SUCCESS" || (isDirectSabotage && riskOutcome === "SUCCESS")) {
    progressDelta = -10;
    deadlineDelta = +1;
    moveDescription = `${adversary.name}'s timetable was severely disrupted by the operative's tactical strike!`;
    if (!newCountermeasures.includes("Hardened sector security")) {
      newCountermeasures.push("Hardened sector security");
    }
  } else if (isDirectSabotage) {
    progressDelta = 0;
    deadlineDelta = 0;
    deltaAlert = +10;
    moveDescription = `${adversary.name} reacted to the sabotage attempt by raising local facility alert and fortifying secondary lines.`;
    if (!newCountermeasures.includes("Automated lockdown protocols")) {
      newCountermeasures.push("Automated lockdown protocols");
    }
  } else if (isCovertInfiltration) {
    progressDelta = +8;
    moveDescription = `${adversary.name}'s master plan continues unhindered while the operative maneuvers in the shadows.`;
  } else if (riskOutcome === "TACTICAL_SETBACK" || riskOutcome === "CATASTROPHIC_EXPOSURE") {
    progressDelta = +15;
    deltaAlert = +15;
    moveDescription = `${adversary.name} exploited the operative's exposure to accelerate the master plan execution!`;
    if (!newCountermeasures.includes("Reinforced guard patrols")) {
      newCountermeasures.push("Reinforced guard patrols");
    }
  } else {
    progressDelta = +10;
    moveDescription = `${adversary.name}'s operational countdown advanced another turn.`;
  }

  const nextProgress = Math.max(0, Math.min(100, adversary.masterPlanProgress + progressDelta));
  const nextDeadline = Math.max(1, adversary.turnsToCriticalDeadline + deadlineDelta);

  const threatLevel: AdversaryRuntimeState["threatLevel"] =
    nextProgress >= 80 ? "CATASTROPHIC" : nextProgress >= 60 ? "CRITICAL" : nextProgress >= 35 ? "SEVERE" : "MODERATE";

  const updatedAdversary: AdversaryRuntimeState = {
    ...adversary,
    masterPlanProgress: nextProgress,
    turnsToCriticalDeadline: nextDeadline,
    activeCountermeasures: newCountermeasures.slice(-4),
    lastAdversaryMove: moveDescription,
    threatLevel
  };

  return { updatedAdversary, consequenceText: moveDescription, deltaAlert };
}
