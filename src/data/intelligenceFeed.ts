import { IntelligenceAlert } from "../types";

export const INITIAL_INTELLIGENCE_ALERTS: IntelligenceAlert[] = [
  {
    id: "alert-001",
    timestamp: "21:08:14 ZULU",
    title: "GCHQ SIGINT: Encrypted Burst Intercept — Danube Lock 4",
    summary: "High-frequency burst transmission intercepted from barge 'Donau-Kaiser'. Message decrypt contains references to high-density fissile containers and Lock 4 transit schedules.",
    sourceStation: "GCHQ CHELTENHAM // STATION V (VIENNA)",
    severity: "CRITICAL",
    category: "SIGINT",
    theatre: "Central Europe (Vienna-Bratislava)",
    relatedRecordIds: ["op-danube", "loc-vienna", "org-spectre", "pers-007"],
    status: "UNREAD",
    actionRecommended: "Alert Commander Bond (007). Authorize boarding protocol before Lock 4 gates close.",
    isLiveEvent: true
  },
  {
    id: "alert-002",
    timestamp: "20:55:02 ZULU",
    title: "STATION M: Quantum Account Transfer Flagged in Monte Carlo",
    summary: "Casino cashier flagged 12 million Euro wire transaction routed through shell corporation 'Le Chiffre Holdings' via Zurich private node. Financial courier observed boarding speedboat.",
    sourceStation: "STATION M (MONTE CARLO) // FINANCIAL INTEL",
    severity: "HIGH",
    category: "CYBER",
    theatre: "Mediterranean Basin",
    relatedRecordIds: ["op-velvet", "loc-monte-carlo", "org-spectre"],
    status: "UNREAD",
    actionRecommended: "Freeze international settlement accounts via Bank of England liaison.",
    isLiveEvent: true
  },
  {
    id: "alert-003",
    timestamp: "20:41:30 ZULU",
    title: "KH-11 IMINT: Thermal Anomaly at Severnaya Satellite Array",
    summary: "Classified reconnaissance satellite pass confirms thermal plume venting from dormant Soviet-era subterranean bunker. Dish alignment shifted 14 degrees toward Western satellite constellation.",
    sourceStation: "DEFENCE INTELLIGENCE // SATELLITE OPS",
    severity: "HIGH",
    category: "IMINT",
    theatre: "Russian Arctic (Severnaya)",
    relatedRecordIds: ["op-eclipse", "loc-severnaya", "org-janus"],
    status: "ACKNOWLEDGED",
    actionRecommended: "Task Royal Air Force Sigint Rivet Joint aircraft for Arctic electronic surveillance sweep.",
    isLiveEvent: false
  },
  {
    id: "alert-004",
    timestamp: "20:20:18 ZULU",
    title: "HUMINT FLASH: Asset 'NIGHTSHADE' Reports Egress Compromise in Tangier",
    summary: "Local Moroccan informant reports heavy surveillance presence outside Old Medina safehouse. Foreign operatives equipped with directional microphones and suppressed handguns.",
    sourceStation: "STATION T (TANGIER)",
    severity: "CRITICAL",
    category: "HUMINT",
    theatre: "North Africa",
    relatedRecordIds: ["loc-tangier", "pers-m"],
    status: "UNREAD",
    actionRecommended: "Authorize emergency exfiltration team and deploy diplomatic pouch courier protocol.",
    isLiveEvent: true
  },
  {
    id: "alert-005",
    timestamp: "19:58:44 ZULU",
    title: "CHELSEA BASIN: Q-Branch Hydrofoil Submersible Ready for Deployment",
    summary: "Maintenance inspection of titanium pressure hull completed. Oxygen scrubbers and acoustic stealth baffles verified operational by Major Boothroyd.",
    sourceStation: "Q-BRANCH TESTING FACILITY (CHELSEA)",
    severity: "INFO",
    category: "TACTICAL",
    theatre: "United Kingdom",
    relatedRecordIds: ["eq-rebreather", "pers-q", "veh-db5"],
    status: "ACKNOWLEDGED",
    actionRecommended: "Log operational readiness status on Central Registry.",
    isLiveEvent: false
  },
  {
    id: "alert-006",
    timestamp: "19:30:10 ZULU",
    title: "GIBRALTAR STATION: Unidentified Acoustic Signature off Europa Point",
    summary: "Sub-surface hydrophone array detects silent cavitation signature consistent with mini-submersible moving at 12 knots toward Strait narrows.",
    sourceStation: "STATION G (GIBRALTAR NAVAL BASE)",
    severity: "WARNING",
    category: "TACTICAL",
    theatre: "Iberian Peninsula",
    relatedRecordIds: ["loc-gibraltar", "op-archangel"],
    status: "UNREAD",
    actionRecommended: "Alert Royal Navy patrol vessel HMS Defender for sonar ping sweep.",
    isLiveEvent: false
  }
];

export const CRISIS_TEMPLATES: Array<Omit<IntelligenceAlert, "id" | "timestamp">> = [
  {
    title: "CRISIS FLASH: Vienna Lock 4 Radiation Spike Intercepted",
    summary: "Sensor buoys along the Danube report gamma-ray signature exceeding baseline by 400%. Suspected tritium canister breach aboard hostile vessel.",
    sourceStation: "STATION V (VIENNA) // SENSOR NET",
    severity: "CRITICAL",
    category: "TACTICAL",
    theatre: "Central Europe",
    relatedRecordIds: ["op-danube", "loc-vienna", "pers-007"],
    status: "UNREAD",
    actionRecommended: "Execute immediate containment protocol. Discretionary 00-firepower approved by M.",
    isLiveEvent: true
  },
  {
    title: "CYBER ATTACK: SIS Vauxhall Cross Telemetry Link Jammed",
    summary: "Directional radio frequency pulse detected from foreign diplomatic limousine parked on Albert Embankment. Q-Branch backup satellite uplink activated.",
    sourceStation: "GCHQ CYBER DEFENCE CELL",
    severity: "CRITICAL",
    category: "CYBER",
    theatre: "London Headquarters",
    relatedRecordIds: ["pers-m", "pers-q"],
    status: "UNREAD",
    actionRecommended: "Dispatch Metropolitan Special Branch intercept unit to impound vehicle under State Secrets Act.",
    isLiveEvent: true
  },
  {
    title: "IMINT ALERT: Submarine Pen Doors Open at Severnaya Complex",
    summary: "Optical satellite confirms blast doors opened at icy cliffside facility. Armoured icebreaker vessel preparing for unannounced maritime egress.",
    sourceStation: "RAF RAF WADDINGTON AIR SPACE SURVEILLANCE",
    severity: "HIGH",
    category: "IMINT",
    theatre: "Arctic Ocean",
    relatedRecordIds: ["op-eclipse", "loc-severnaya"],
    status: "UNREAD",
    actionRecommended: "Transmit immediate coordinates to 00-Section operative in the field.",
    isLiveEvent: true
  },
  {
    title: "HUMINT REPORT: SPECTRE Council Envoy Spotted in Geneva",
    summary: "Facial recognition match at Geneva Cornavin railway station. Target traveling on forged Canadian diplomatic passport under the alias 'Dr. Noack'.",
    sourceStation: "STATION G (GENEVA LIASON)",
    severity: "HIGH",
    category: "HUMINT",
    theatre: "Switzerland",
    relatedRecordIds: ["org-spectre", "pers-007"],
    status: "UNREAD",
    actionRecommended: "Place target under unobtrusive visual surveillance; do not initiate arrest on Swiss soil.",
    isLiveEvent: true
  }
];
