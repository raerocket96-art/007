import { MissionState } from "../types";
import { bondFilmMissionTemplates } from "./bondFilmMissions";

export interface MissionTemplate {
  id: string;
  title: string;
  year?: number;
  codename: string;
  threatLevel: "ELEVATED" | "SEVERE" | "CRITICAL";
  location: string;
  objective: string;
  initialSituation: string;
  availableAgents: { id: string; name: string; role: string }[];
  defaultAgentId: string;
  recommendedEquipment: string[];
  recommendedVehicle?: string;
  startingNodes: {
    id: string;
    text: string;
    actionType: "STEALTH" | "TACTICAL" | "DIPLOMATIC" | "AGGRESSIVE";
    intelGained?: string;
  }[];
}

const originalMissionTemplates: MissionTemplate[] = [
  {
    id: "template-danube",
    title: "The Danube Tritium Intercept",
    codename: "OPERATION NIGHTSHADE",
    threatLevel: "SEVERE",
    location: "Vienna / Danube Freight Corridor, Austria",
    objective: "Intercept a lead-lined barge carrying weapons-grade tritium isotopes without causing a diplomatic incident or radiological leak.",
    initialSituation: "Station V has visual contact on an unflagged river cargo barge negotiating Lock 4 on the Danube, 12 kilometers east of Vienna. Thermal cameras confirm lead-shielded refrigeration units. Two patrol boats with private mercenaries flying no colors are escorting the barge. Twilight is approaching in 20 minutes.",
    availableAgents: [
      { id: "pers-007", name: "Commander James Bond (007)", role: "Direct Field Infiltration" },
      { id: "pers-wailin", name: "Colonel Wai Lin (MSS)", role: "Allied Tactical Recon" },
      { id: "pers-leiter", name: "Felix Leiter (CIA)", role: "Maritime Interdiction Support" }
    ],
    defaultAgentId: "pers-007",
    recommendedEquipment: ["eq-ppk", "eq-omega", "eq-rebreather", "eq-grapple"],
    recommendedVehicle: "veh-db5",
    startingNodes: [
      {
        id: "start-1",
        text: "Dive into lock basin using Q-Branch micro-rebreather to board barge hull silently via rudder housing.",
        actionType: "STEALTH",
        intelGained: "Acoustic signatures indicate three guards in wheelhouse and two on cargo deck."
      },
      {
        id: "start-2",
        text: "Use Aston Martin DB5 to block the river lock bridge and disable the lead escort vessel with front machine guns.",
        actionType: "AGGRESSIVE",
        intelGained: "Alerts the lockmaster and triggers local Austrian police sirens within 4 minutes."
      },
      {
        id: "start-3",
        text: "Impersonate Austrian Federal River Inspector with forged Vienna Station credentials at the lock control tower.",
        actionType: "DIPLOMATIC",
        intelGained: "Lock master reveals captain's shipping manifest listed as 'Industrial Refrigeration Parts'."
      },
      {
        id: "start-4",
        text: "Climb the lock gantry and deploy EMP pen burst to disable barge diesel generator and navigation radar.",
        actionType: "TACTICAL",
        intelGained: "Barge drifts without steerage towards the weir gates, causing frantic guard response."
      }
    ]
  },
  {
    id: "template-montecarlo",
    title: "The Monte Carlo Salon Infiltration",
    codename: "OPERATION VELVET",
    threatLevel: "ELEVATED",
    location: "Casino de Monte-Carlo, Salon Privé, Monaco",
    objective: "Infiltrate a private baccarat table, identify the courier laundering SPECTRE bond certificates, and clone their cryptographic flash drive.",
    initialSituation: "The Casino de Monte-Carlo is packed for the annual Red Cross Gala. Intelligence indicates a high-ranking SPECTRE financial courier known only as 'The Banker' is seated at Table 7 playing high-stakes Chemin de Fer. He carries an encrypted titanium flash drive inside an antique gold pocket watch.",
    availableAgents: [
      { id: "pers-007", name: "Commander James Bond (007)", role: "High-Roller Player Cover" },
      { id: "pers-moneypenny", name: "Eve Moneypenny", role: "Surveillance Floor Coordinator" }
    ],
    defaultAgentId: "pers-007",
    recommendedEquipment: ["eq-glasses", "eq-cufflinks", "eq-camera", "eq-decoder"],
    recommendedVehicle: "veh-db5",
    startingNodes: [
      {
        id: "mc-1",
        text: "Buy in for €500,000 at Table 7, sit directly opposite target, and study his biometric tells through polarized spectacles.",
        actionType: "DIPLOMATIC",
        intelGained: "Target displays elevated pulse when making bets over €100,000; left wrist stays protected."
      },
      {
        id: "mc-2",
        text: "Slip into the casino private security monitoring room and deploy acoustic decoder on the safe deposit lock.",
        actionType: "STEALTH",
        intelGained: "Safe deposit box #414 is registered under a Geneva front corporation."
      },
      {
        id: "mc-3",
        text: "Stage a deliberate confrontation at the bar to spill champagne on target and trigger EMP cufflink short-circuit.",
        actionType: "TACTICAL",
        intelGained: "Courier's encrypted wristwatch flickers and security escorts him to the private lounge."
      }
    ]
  },
  {
    id: "template-arctic",
    title: "The Svalbard Deep Ice Station",
    codename: "OPERATION ECLIPSE",
    threatLevel: "CRITICAL",
    location: "Longyearbyen / Spitsbergen Glacier, Arctic",
    objective: "Penetrate an off-grid underground quantum compute bunker bored into glacial permafrost before satellite orbital weapon keys are transmitted.",
    initialSituation: "Outside temperatures are -34°C with 45-knot blizzard winds. Satellite reconnaissance shows an unauthorized drilling rig on an abandoned coal mining shelf. Automated perimeter sentry turrets and snowmobile patrols are guarding the blast doors. A transmission dish is scheduled to align with a rogue satellite in 18 minutes.",
    availableAgents: [
      { id: "pers-007", name: "Commander James Bond (007)", role: "Solo Arctic Infiltration" },
      { id: "pers-wailin", name: "Colonel Wai Lin", role: "Tactical Extraction Partner" }
    ],
    defaultAgentId: "pers-007",
    recommendedEquipment: ["eq-ppk", "eq-grapple", "eq-smartblood", "eq-pen"],
    recommendedVehicle: "veh-valhalla",
    startingNodes: [
      {
        id: "arc-1",
        text: "HALO parachute jump onto the glacier crest and ski down silently under blizzard cover to avoid radar sweeps.",
        actionType: "STEALTH",
        intelGained: "Air intake vents detected behind the west ice wall emitting warm steam."
      },
      {
        id: "arc-2",
        text: "Rig shaped C4 charges from the fountain pen to collapse the perimeter generator power mast and cause a base blackout.",
        actionType: "TACTICAL",
        intelGained: "Base switches to emergency battery power; automated sentry turrets cycle into reboot mode."
      },
      {
        id: "arc-3",
        text: "Ambush two snowmobile patrol guards, commandeer their cold-weather gear, and use their keycard at the service airlock.",
        actionType: "AGGRESSIVE",
        intelGained: "Keycard grants Level 3 access to the primary server centrifuge chamber."
      }
    ]
  }
];

export const missionTemplates: MissionTemplate[] = [
  ...bondFilmMissionTemplates,
  ...originalMissionTemplates,
];
