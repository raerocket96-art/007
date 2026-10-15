export type ClearanceLevel = 
  | "LEVEL 1 — PUBLIC ARCHIVE"
  | "LEVEL 3 — RESTRICTED DIPLOMATIC"
  | "LEVEL 5 — SECRET // WHITEHALL DISPATCH"
  | "LEVEL 7 — TOP SECRET // CABINET OFFICE"
  | "LEVEL 9 — 00-SECTION // EYES ONLY";

export type ClassificationType = 
  | "TOP SECRET"
  | "SECRET"
  | "CONFIDENTIAL"
  | "RESTRICTED"
  | "EYES ONLY";

export type EntityType = 
  | "personnel"
  | "operations"
  | "equipment"
  | "vehicles"
  | "locations"
  | "organizations"
  | "assets";

export interface BaseRecord {
  id: string;
  referenceNumber: string; // e.g. "SIS-007-PERS"
  name: string;
  classification: ClassificationType;
  clearanceRequired: number; // 1-9
  lastUpdated: string;
  archived?: boolean;
  isCustom?: boolean;
  tags?: string[];
  imageUrl?: string;
}

export interface PersonnelRecord extends BaseRecord {
  type: "personnel";
  alias: string;
  serviceNumber: string;
  role: string;
  rank: string;
  organization: string;
  nationality: string;
  currentStatus: "ACTIVE" | "MIA" | "KIA" | "UNDERCOVER" | "COMPROMISED" | "RETIRED";
  skills: string[];
  psychologicalProfile: string;
  loyalties: string;
  knownAssociates: string[];
  missionHistory: string[];
  injuries: string[];
  equipment: string[];
  biography: string;
  confidentialNotes: string;
  threatRating: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | "FRIENDLY ASSET";
  reliabilityRating: number; // 0-100%
  fingerprintCode: string;
  dateOfBirth?: string;
  eyeColor?: string;
  height?: string;
}

export interface OperationRecord extends BaseRecord {
  type: "operations";
  codename: string;
  date: string;
  locations: string[];
  assignedAgents: string[];
  missionController: string; // e.g. "M (Sir Miles Messervy)"
  primaryObjective: string;
  secondaryObjectives: string[];
  briefing: string;
  knownThreats: string[];
  requiredEquipment: string[];
  intelligenceGathered: string[];
  timeline: { time: string; event: string }[];
  decisionsMade: string[];
  casualties: string[];
  collateralImpact: string;
  outcome: "ONGOING" | "ACCOMPLISHED" | "COMPROMISED" | "ABORTED" | "STANDBY";
  debrief: string;
  relatedFiles: string[];
  threatLevel: "EXTREME" | "SEVERE" | "ELEVATED" | "GUARDED" | "LOW";
}

export interface EquipmentRecord extends BaseRecord {
  type: "equipment";
  itemName: string;
  qBranchDesignation: string; // e.g. "Q-DEV-PPK-BIO"
  category: "FIREARMS" | "WEARABLE" | "SURVEILLANCE" | "COUNTER-INTEL" | "BREACHING" | "TACTICAL";
  issuedTo: string;
  firstAppearance: string;
  technicalSpecifications: Record<string, string>;
  concealedFunctions: string[];
  operationalPurpose: string;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  reliability: number; // 0-100%
  currentLocation: string;
  status: "ISSUED" | "LAB TEST" | "LOST IN FIELD" | "RECOVERED" | "DECOMMISSIONED" | "STORAGE - CHELSEA BASIN";
  relatedMissions: string[];
  diagramDescription: string;
}

export interface VehicleRecord extends BaseRecord {
  type: "vehicles";
  manufacturer: string;
  model: string;
  registration: string;
  assignedAgent: string;
  armour: string;
  weapons: string[];
  defensiveSystems: string[];
  specialModifications: string[];
  performance: {
    topSpeed: string;
    acceleration: string;
    engine: string;
    range: string;
  };
  missionAppearances: string[];
  damageHistory: string[];
  status: "OPERATIONAL" | "UNDER REPAIR" | "DESTROYED" | "STORAGE - CHELSEA BASIN";
}

export interface LocationRecord extends BaseRecord {
  type: "locations";
  country: string;
  coordinates: {
    lat: number;
    lng: number;
    display: string;
  };
  politicalStatus: string;
  strategicImportance: string;
  knownOrganizations: string[];
  activeAgents: string[];
  previousOperations: string[];
  threatLevel: "ALPHA" | "BRAVO" | "CHARLIE" | "DELTA";
  intelligenceSummary: string;
  surveillanceImages: string[];
  accessRestrictions: string;
}

export interface OrganizationRecord extends BaseRecord {
  type: "organizations";
  orgType: "INTELLIGENCE AGENCY" | "SYNDICATE" | "CRIMINAL EMPIRE" | "STATE ACTOR" | "DEFENCE CONTRACTOR";
  leadership: string[];
  knownMembers: string[];
  ideology: string;
  resources: string;
  territory: string[];
  capabilities: string[];
  alliances: string[];
  enemies: string[];
  relatedOperations: string[];
  threatAssessment: "EXTREME GLOBAL" | "HIGH REGIONAL" | "ALLIED" | "SURVEILLANCE ONLY";
  status: "ACTIVE" | "DISRUPTED" | "DISSOLVED" | "LATENT";
}

export interface AssetRecord extends BaseRecord {
  type: "assets";
  codename: string;
  trueIdentityLock: boolean; // Clearance Level 9 to view true name
  trueIdentity: string;
  handler: string;
  reliability: "HIGH" | "UNVERIFIED" | "SUSPECT" | "COMPROMISED";
  accessLevel: "MINISTERIAL" | "COMMERCIAL" | "CRIMINAL SYNDICATE" | "MILITARY" | "DIPLOMATIC";
  motivation: "IDEOLOGICAL" | "FINANCIAL" | "COERCION" | "EGO" | "LOYALTY";
  intelligenceSupplied: string[];
  exposureRisk: "HIGH" | "MEDIUM" | "LOW";
  extractionStatus: "URGENT EXTRACTION REQUIRED" | "EMBEDDED" | "STANDBY" | "RELOCATED";
  protectionStatus: "ARMED ESCORT" | "WATCH ONLY" | "DISAVOWED" | "SAFE HOUSE";
  lastContact: string;
  relatedOperation: string;
}

export type AnyDatabaseRecord = 
  | PersonnelRecord
  | OperationRecord
  | EquipmentRecord
  | VehicleRecord
  | LocationRecord
  | OrganizationRecord
  | AssetRecord;

export type DatabaseRecord = AnyDatabaseRecord;

export interface MessageReply {
  id: string;
  sender: string;
  timestamp: string;
  content: string;
}

export interface DiplomaticCable {
  id: string;
  timestamp: string;
  originStation: string;
  senderCategory?: "M" | "Q_BRANCH" | "FIELD_CONTROL" | "WHITEHALL" | "GENERAL";
  destination: string;
  classification: ClassificationType;
  subject: string;
  content: string;
  cipherText?: string;
  isEncrypted?: boolean;
  priority?: "FLASH IMMEDIATE" | "HIGH" | "ROUTINE";
  actionRequired: boolean;
  acknowledged: boolean;
  relatedRecords: string[];
  replies?: MessageReply[];
}

// Simulator Interfaces

export interface MissionSceneState {
  currentLocation: string;
  immediateObjective: string;
  completedActions: string[];
  activeConsequences: string[];
  nearbyThreats: string[];
  discoveredIntel: string[];
  uncertainIntel: string[];
  operativeCondition: string[];
  environmentState: string;
  alertState: string;
}

export interface SimulationStatReasons {
  health?: string;
  cover?: string;
  vigilance?: string;
  suspicion?: string;
  intelConfidence?: string;
  politicalExposure?: string;
  collateralDamage?: string;
  timePressure?: string;
  escapeReadiness?: string;
}

export interface SimulationChoice {
  id: string;
  text: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requiredSkillOrTool?: string;
}

export interface SimulationScene {
  sceneNumber: number;
  sceneTitle: string;
  location: string;
  timestamp: string;
  narrative: string;
  immediateObjective: string;
  confirmedIntel: string[];
  uncertainIntel: string[];
  threats: string[];
  availableAssets: string[];
  choices: SimulationChoice[];
  stateChanges: {
    healthDelta?: number;
    coverDelta?: number;
    vigilanceDelta?: number;
    suspicionDelta?: number;
    intelConfidenceDelta?: number;
    politicalExposureDelta?: number;
    collateralDamageDelta?: number;
    timePressureDelta?: number;
    escapeReadinessDelta?: number;
    alertLevel?: string;
    reasons?: SimulationStatReasons;
  };
  newEvidence?: string;
  relationshipChanges?: string;
  consequences?: string[];
  missionLogEntry: string;
  playerChosenAction?: string;
}



export interface MissionEquipmentRuntime {
  id: string;
  name: string;
  designation?: string;
  category?: string;
  status: "READY" | "DEPLOYED" | "EXHAUSTED" | "DAMAGED" | "LOST";
  remainingUses: number | null;
  modifications: string[];
  tacticalUnlocks: string[];
  stealthRating?: number;
  tacticalRating?: number;
  riskRating?: number;
  usageCount?: number;
}

export interface VehicleRuntimeState {
  id: string;
  name: string;
  status: "AVAILABLE" | "ACTIVE" | "DAMAGED" | "ABANDONED" | "DESTROYED";
}

export interface RiskResolution {
  roll: number;
  target: number;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  outcome: "CRITICAL_SUCCESS" | "SUCCESS" | "PARTIAL_SUCCESS" | "TACTICAL_SETBACK" | "CATASTROPHIC_EXPOSURE";
  summary: string;
}

export interface FieldAssetCall {
  id: string;
  name: string;
  role: string;
  turn: number;
  status: "REQUESTED" | "ACTIVE" | "UNAVAILABLE";
}

export interface AdversaryRuntimeState {
  id: string;
  name: string;
  schemeName: string;
  masterPlanProgress: number; // 0 to 100%
  turnsToCriticalDeadline: number;
  activeCountermeasures: string[];
  currentVulnerability?: string;
  lastAdversaryMove?: string;
  threatLevel?: "MODERATE" | "SEVERE" | "CRITICAL" | "CATASTROPHIC";
}

export interface MissionPhase {
  id: string;
  order: number;
  name: string;
  shortTitle: string;
  description: string;
  primaryTasks: string[];
  completedTasks?: string[];
  hazardLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  isComplete?: boolean;
  transitionRequirement?: string;
}

export type SocialStanceType = "PLAY_PERSONA" | "PSYCHOLOGICAL_PROVOCATION" | "CALCULATED_BLUFF" | "DEEP_COVER_SILENCE";

export interface CoverIdentityState {
  id: string;
  alias: string;
  profession: string;
  backstorySummary: string;
  credentialIntegrity: number; // 0 to 100%
  suspicionLevel: number; // 0 to 100%
  authorizedZones: string[];
  activeStance: SocialStanceType;
  compromisedDetails: string[];
}

export interface MissionState {
  id?: string;
  templateId?: string;
  title?: string;
  operationTitle?: string;
  doctrineId?: string;
  /** Bond selected by the player before deployment. Used only as a preference/prediction in the final persona comparison. */
  preferredBondActor?: string;
  currentTurn: number;
  maxTurns: number; // Legacy save compatibility only; live sessions are open-ended.
  agentId?: string;
  agentHealth: number; // 0-100%
  stealthRating: number;
  alarmLevel: number;
  currentScenarioText: string;
  availableDecisions: Array<{
    id: string;
    text: string;
    actionType: "STEALTH" | "TACTICAL" | "DIPLOMATIC" | "AGGRESSIVE";
    risk?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  }>;
  timeline: Array<{
    turn: number;
    action: string;
    consequence: string;
    time: string;
  }>;
  intelDiscovered: string[];
  casualties: string[];
  outcome: "IN_PROGRESS" | "VICTORY" | "DEFEAT" | "ABORTED";
  sessionFinished?: boolean; // Final debrief/assessment is shown only after explicit session finish.
  causalTree: CausalTreeNode[];

  // Optional extended telemetry
  missionProgress?: number;
  coverIntegrity?: number;
  suspicion?: number;
  enemyAlertLevel?: "LOW" | "NORMAL" | "HEIGHTENED" | "CRITICAL" | "LOCKDOWN";
  civilianDanger?: "NONE" | "LOW" | "MODERATE" | "HIGH" | "CATASTROPHIC";
  allyTrust?: number;
  assetTrust?: number;
  intelligenceConfidence?: number;
  evidence?: string[];
  equipmentCondition?: Record<string, string>;
  politicalExposure?: number;
  collateralDamage?: number;
  timePressure?: number;
  escapeReadiness?: number;
  successProbability?: number;
  probabilityFactors?: string[];
  objectiveStatus?: "PENDING" | "PRIMARY COMPLETED" | "ALL COMPLETED" | "COMPROMISED";
  unresolvedConsequences?: string[];
  sceneState?: MissionSceneState;
  equipmentInventory?: MissionEquipmentRuntime[];
  vehicleRuntime?: VehicleRuntimeState;
  lastRiskResolution?: RiskResolution;
  fieldAssetCalls?: FieldAssetCall[];
  adversaryState?: AdversaryRuntimeState;
  currentPhase?: MissionPhase;
  phases?: MissionPhase[];
  coverIdentity?: CoverIdentityState;
  lastStatReasons?: SimulationStatReasons;
}

export interface CausalTreeNode {
  id: string;
  sceneNumber?: number;
  turnNumber?: number;
  label?: string;
  description?: string;
  chosenAction?: string;
  outcome?: string;
  consequence?: string;
  healthChange?: number;
  stealthChange?: number;
  timestamp?: string;
  delayedRisk?: string;
  status?: "ACTIVE" | "COMPLETED" | "FAILED" | "ABANDONED";
  parentId?: string;
  childrenIds?: string[];
}

export interface SimulationSaveSlot {
  slotId: string;
  slotName: string;
  savedAt: string;
  operationId: string;
  agentId: string;
  sceneNumber: number;
  missionState: MissionState;
  scenesHistory: SimulationScene[];
  causalTree: CausalTreeNode[];
  isAutosave?: boolean;
}

export interface MissionDebriefDecisionAssessment {
  turn?: number;
  decision: string;
  assessment: string;
  consequence: string;
  score?: number;
  strengths?: string[];
  concerns?: string[];
  dimensions?: {
    objectiveValue?: number;
    intelligenceValue?: number;
    discretion?: number;
    assetProtection?: number;
    proportionality?: number;
  };
}

export interface MissionDebriefConductReview {
  civilianCollateral: string;
  hostileForce: string;
  detaineeTreatment: string;
  sourceProtection: string;
  proportionality: string;
  overall: string;
}

export interface MissionDebriefOutcomeComparisonRow {
  category: string;
  simulatedVersion: string;
  originalFilm: string;
  advantage: "SIMULATION" | "ORIGINAL" | "EVEN" | "UNCLEAR";
}

export interface MissionDebriefReport {
  operationSummary: string;
  detailedSessionSummary?: string;
  objectiveResults: string;
  timeline: string[];
  keyDecisions: string[];
  decisionAssessment?: MissionDebriefDecisionAssessment[];
  intelligenceRecovered: string[];
  assetsStatus: string;
  agentPerformance: string;
  ethicalConcerns: string;
  conductReview?: MissionDebriefConductReview;
  mThoughts: string;
  psychologicalEvaluation: string;
  bondComparison: {
    actor: string;
    rationale: string;
    /** Bond the player selected before deployment. */
    preferredActor?: string;
    /** Whether the debrief agrees that the player actually behaved like their preferred Bond. */
    verdict?: "AGREES" | "DISAGREES";
    /** Choice-grounded explanation of the agreement/disagreement. */
    verdictRationale?: string;
  };
  politicalConsequences: string;
  equipmentPerformance: string;
  unresolvedThreats: string;
  recommendedFollowUp: string;
  classificationRating: string;
  filmComparison: string;
  worldOutcomeComparison?: {
    simulatedOutcome: string;
    originalOutcome: string;
    betterOutcome: "SIMULATION" | "ORIGINAL" | "MIXED" | "UNRESOLVED";
    rationale: string;
    rows: MissionDebriefOutcomeComparisonRow[];
  };
  canonicalBenchmarks: {
    intelligence: number;
    ethics: number;
    speed: number;
    stealth: number;
  };
  scores: {
    tacticalEfficiency: number;
    discretion: number;
    intelValue: number;
    politicalExposureRisk: number;
    operationalEffectiveness?: number;
    strategicDominance?: number;
    intelligenceExploitation?: number;
    assetProtection?: number;
    agentSurvival?: number;
    missionDiscipline?: number;
    resourcefulness?: number;
    cinematicIntensity?: number;
    overallAssessment?: number;
  };
}

export interface IntelCable {
  id: string;
  timestamp: string;
  origin: string; // e.g. "STATION V // VIENNA"
  author: string; // e.g. "M (CHIEF)"
  subject: string;
  priority: "FLASH IMMEDIATE" | "PRIORITY" | "ROUTINE";
  content: string;
  classification: ClassificationType;
  relatedRecordId?: string;
  read?: boolean;
}

// Security Agent Authentication & RBAC Interfaces
export interface AgentOperative {
  id: string;
  callsign: string;
  name: string;
  serviceNumber: string;
  role: string;
  rank: string;
  department: string;
  clearanceLevel: number; // 1, 3, 5, 7, 9, 10
  clearanceLabel: string;
  discretionaryLicence: boolean; // 00 licence to kill / discretionary executive action
  passcode: string;
  biometricCode: string;
  avatarUrl: string;
  allowedTabs: string[];
  nationality?: string;
  eyeColor?: string;
  height?: string;
  hairColor?: string;
  dateOfBirth?: string;
  physicalDescription?: string;
  biography?: string;
  psychologicalProfile?: string;
  confidentialNotes?: string;
  skills?: string[];
  loyalties?: string;
}

export interface AuthSession {
  agent: AgentOperative;
  token: string;
  loginTime: number;
  expiresAt: number;
  isLocked: boolean;
  warningAcknowledged: boolean;
}

// Real-Time Intelligence Feed Interfaces
export interface IntelligenceAlert {
  id: string;
  timestamp: string;
  title: string;
  summary: string;
  sourceStation: string;
  severity: "CRITICAL" | "HIGH" | "WARNING" | "INFO";
  category: "SIGINT" | "HUMINT" | "IMINT" | "CYBER" | "TACTICAL";
  relatedRecordIds: string[];
  status: "UNREAD" | "ACKNOWLEDGED" | "PINNED";
  actionRecommended?: string;
  theatre?: string;
  isLiveEvent?: boolean;
}

// Q-Branch Equipment Customization Interfaces
export interface EquipmentModOption {
  id: string;
  name: string;
  description: string;
  stealthModifier: number; // e.g. +15 or -10
  tacticalModifier: number; // e.g. +20 or -5
  riskModifier: number; // e.g. +5 or -10
  weightDeltaKg: number;
  tacticalActionUnlock?: string; // Special action text unlocked in simulation
}

export interface EquipmentCustomSlot {
  slotId: string;
  slotName: string;
  description: string;
  options: EquipmentModOption[];
  selectedOptionId: string;
}

export interface ConfigurableItem {
  id: string;
  equipmentRecordId: string;
  name: string;
  designation: string;
  category: "FIREARMS" | "WEARABLE" | "VEHICLES" | "SURVEILLANCE" | "BREACHING" | "TACTICAL";
  baseStealth: number;
  baseTactical: number;
  baseRisk: number;
  baseWeightKg: number;
  slots: EquipmentCustomSlot[];
  qCautionNote: string;
  schematicType: "weapon" | "timepiece" | "vehicle" | "gadget";
  imageUrl?: string;
}

export interface CustomizedLoadout {
  items: ConfigurableItem[];
  overallStealth: number;
  overallTactical: number;
  overallRisk: number;
  overallWeightKg: number;
  unlockedActions: string[];
}

