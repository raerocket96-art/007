import { CoverIdentityState } from "../types";

export const OPERATION_COVER_DOSSIERS: Record<string, CoverIdentityState> = {
  "film-goldfinger": {
    id: "cover-goldfinger",
    alias: "James St. George (UK Treasury Auditor)",
    profession: "Senior HM Treasury Bullion Inspector",
    backstorySummary: "Investigating unauthorized gold flow and arbitrage anomalies across Swiss and American banks under diplomatic transit cover.",
    credentialIntegrity: 88,
    suspicionLevel: 12,
    authorizedZones: ["Hotel lobby", "Casino floor", "Public lounge", "Commercial airfield"],
    activeStance: "PLAY_PERSONA",
    compromisedDetails: []
  },
  "film-on-her-majestys-secret-service": {
    id: "cover-ohmss",
    alias: "Sir Hilary Bray, Bart.",
    profession: "College of Arms Genealogist & Royal Heraldry Consultant",
    backstorySummary: "Invited to Piz Gloria to verify Count Balthazar de Bleuchamp's ancestral title and lineage claims.",
    credentialIntegrity: 94,
    suspicionLevel: 8,
    authorizedZones: ["Piz Gloria clinic salon", "Research laboratory public wing", "Dining hall", "Funicular terminal"],
    activeStance: "PLAY_PERSONA",
    compromisedDetails: []
  },
  "film-diamonds-are-forever": {
    id: "cover-diamonds",
    alias: "Peter Franks (Diamond Courier)",
    profession: "Independent Smuggling Intermediary & Diamond Courier",
    backstorySummary: "Contracted in Amsterdam to transport 50,000 carats of rough South African diamonds to Los Angeles contacts.",
    credentialIntegrity: 78,
    suspicionLevel: 25,
    authorizedZones: ["Amsterdam canal warehouse", "Airport customs", "Vegas casino floor", "Whyte House lobby"],
    activeStance: "PLAY_PERSONA",
    compromisedDetails: []
  },
  "film-a-view-to-a-kill": {
    id: "cover-view-to-kill",
    alias: "James St. John Smythe",
    profession: "British Aristocrat & Thoroughbred Equine Syndicate Owner",
    backstorySummary: "Attending Max Zorin's prestigious Chantilly estate horse auction to acquire championship bloodstock.",
    credentialIntegrity: 90,
    suspicionLevel: 15,
    authorizedZones: ["Chantilly stables", "Estate ballroom", "Paddock pavilion", "Auction floor"],
    activeStance: "PLAY_PERSONA",
    compromisedDetails: []
  },
  "film-casino-royale": {
    id: "cover-casino-royale",
    alias: "James Beech (High-Stakes Gambler & Wealth Management Client)",
    profession: "Professional High-Stakes Chess & Poker Speculator",
    backstorySummary: "Entered into the Montenegro Texas Hold'em tournament backed by private Swiss wealth capital.",
    credentialIntegrity: 92,
    suspicionLevel: 10,
    authorizedZones: ["Hotel Splendide lounge", "Casino high-stakes salon", "Hotel suite", "Terrace bar"],
    activeStance: "PLAY_PERSONA",
    compromisedDetails: []
  },
  "film-the-spy-who-loved-me": {
    id: "cover-spy-who-loved-me",
    alias: "Robert Sterling (Marine Botanist & Oceanographic Surveyor)",
    profession: "Senior Surveyor, Lloyd's of London Maritime Syndicate",
    backstorySummary: "Inspecting Mediterranean shipping manifests and marine research vessels around Sardinia.",
    credentialIntegrity: 85,
    suspicionLevel: 14,
    authorizedZones: ["Sardinian hotel", "Marina docks", "Atlantis public observation deck"],
    activeStance: "PLAY_PERSONA",
    compromisedDetails: []
  },
  "film-goldeneye": {
    id: "cover-goldeneye",
    alias: "David Sommer (Commercial Aviation & Defense Broker)",
    profession: "European Defense Procurement Consultant",
    backstorySummary: "Navigating post-Soviet defense surplus markets in St. Petersburg to broker transport aviation deals.",
    credentialIntegrity: 82,
    suspicionLevel: 20,
    authorizedZones: ["Grand Hotel Europe lounge", "St. Petersburg railway plaza", "Public baths"],
    activeStance: "PLAY_PERSONA",
    compromisedDetails: []
  },
  "film-skyfall": {
    id: "cover-skyfall",
    alias: "James Bond (Independent Private Security Asset)",
    profession: "Private Security & Asset Protection Consultant",
    backstorySummary: "Tracing stolen high-value digital assets through Macau floating casinos into Shanghai high-rises.",
    credentialIntegrity: 75,
    suspicionLevel: 28,
    authorizedZones: ["Floating Dragon Casino", "Shanghai financial tower public lobby", "Macau waterfront"],
    activeStance: "PLAY_PERSONA",
    compromisedDetails: []
  },
  "template-danube": {
    id: "cover-danube",
    alias: "Stefan Radtke (Federal River Navigation Inspector)",
    profession: "Danube Commission Cargo & Hydro-Safety Officer",
    backstorySummary: "Conducting unannounced environmental and radiation spot-checks along the Vienna-Bratislava river lock corridor.",
    credentialIntegrity: 86,
    suspicionLevel: 12,
    authorizedZones: ["Lock 4 control office", "Customs inspection jetty", "Barge outer deck", "River towpath"],
    activeStance: "PLAY_PERSONA",
    compromisedDetails: []
  }
};

export function getCoverIdentityForOperation(templateId: string): CoverIdentityState {
  const dossier = OPERATION_COVER_DOSSIERS[templateId];
  if (dossier) {
    return { ...dossier, activeStance: "PLAY_PERSONA", compromisedDetails: [] };
  }

  return {
    id: `cover-${templateId}`,
    alias: "Commander J. Sterling (Universal Export Representative)",
    profession: "Commercial Import & Export Trade Liaison",
    backstorySummary: "Traveling under official British Commonwealth commercial import credentials to inspect local logistics and trade partnerships.",
    credentialIntegrity: 85,
    suspicionLevel: 15,
    authorizedZones: ["Airport arrivals", "Hotel reception", "Commercial trade offices", "Public lounges"],
    activeStance: "PLAY_PERSONA",
    compromisedDetails: []
  };
}

export function applySocialStanceModifier(
  cover: CoverIdentityState,
  stance: CoverIdentityState["activeStance"],
  actionText: string
): { updatedCover: CoverIdentityState; stealthDelta: number; suspicionDelta: number; intelDelta: number; reason: string } {
  let integrityChange = 0;
  let suspicionDelta = 0;
  let stealthDelta = 0;
  let intelDelta = 0;
  let reason = "";

  const lower = actionText.toLowerCase();

  switch (stance) {
    case "PLAY_PERSONA":
      integrityChange = +3;
      suspicionDelta = -5;
      stealthDelta = +4;
      intelDelta = +2;
      reason = `Adhered strictly to ${cover.alias} cover credentials, calming local scrutiny.`;
      break;

    case "PSYCHOLOGICAL_PROVOCATION":
      integrityChange = -6;
      suspicionDelta = +8;
      stealthDelta = -4;
      intelDelta = +8;
      reason = `Intentionally provoked the adversary through sharp psychological sparring, extracting intel at the cost of personal attention.`;
      break;

    case "CALCULATED_BLUFF":
      if (lower.includes("bluff") || lower.includes("pretend") || lower.includes("claim") || lower.includes("forge")) {
        integrityChange = -4;
        suspicionDelta = +4;
        intelDelta = +6;
        reason = `Calculated bluff successfully bypassed immediate security checks with high-stakes social tradecraft.`;
      } else {
        integrityChange = -2;
        suspicionDelta = +2;
        intelDelta = +3;
        reason = `Tested hostile perimeter with calculated deception.`;
      }
      break;

    case "DEEP_COVER_SILENCE":
      integrityChange = +5;
      suspicionDelta = -8;
      stealthDelta = +6;
      intelDelta = 0;
      reason = `Maintained total social silence and passive observer posture under ${cover.alias} cover.`;
      break;
  }

  const updatedCover: CoverIdentityState = {
    ...cover,
    activeStance: stance,
    credentialIntegrity: Math.max(0, Math.min(100, cover.credentialIntegrity + integrityChange)),
    suspicionLevel: Math.max(0, Math.min(100, cover.suspicionLevel + suspicionDelta))
  };

  return { updatedCover, stealthDelta, suspicionDelta, intelDelta, reason };
}
