import { AgentOperative } from "../types";

export const MI6_OPERATIVES: AgentOperative[] = [
  {
    id: "op-007",
    callsign: "007",
    name: "Commander James Bond",
    serviceNumber: "SIS-007",
    role: "Senior Field Operative // 00-Section",
    rank: "Commander, Royal Navy (Attached SIS)",
    department: "Section 00 (Special Operations Executive)",
    clearanceLevel: 9,
    clearanceLabel: "LEVEL 9 // 00-SECTION DISCRETIONARY",
    discretionaryLicence: true,
    passcode: "ASTON-MARTINI-SHAKEN",
    biometricCode: "DNA-007-VAUX-9921-ALPHA",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    allowedTabs: ["command", "database", "graph", "simulator", "telemetry", "movies", "persona"]
  },
  {
    id: "op-m",
    callsign: "M",
    name: "Sir Miles Messervy",
    serviceNumber: "SIS-M-01",
    role: "Chief of SIS ('C') // Head of Service",
    rank: "Rear Admiral, Royal Navy (Ret.)",
    department: "Chief Directorate // Whitehall Liaison",
    clearanceLevel: 10,
    clearanceLabel: "LEVEL 10 // SOVEREIGN EXECUTIVE CLEARANCE",
    discretionaryLicence: true,
    passcode: "WESTMINSTER-C-CABINET",
    biometricCode: "DNA-M01-CHIEF-0001-OMEGA",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    allowedTabs: ["command", "database", "graph", "simulator", "telemetry", "admin", "movies", "persona"]
  },
  {
    id: "op-q",
    callsign: "Q",
    name: "Major Boothroyd",
    serviceNumber: "SIS-Q-01",
    role: "Head of Q-Branch // Quartermaster & Ordnance",
    rank: "Major, Royal Army Ordnance Corps",
    department: "Q-Branch Technical Research & Development",
    clearanceLevel: 9,
    clearanceLabel: "LEVEL 9 // TECHNICAL & ORDNANCE DISCRETIONARY",
    discretionaryLicence: false,
    passcode: "PAY-ATTENTION-007",
    biometricCode: "DNA-Q01-LABS-3341-TECH",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    allowedTabs: ["command", "database", "graph", "simulator", "telemetry", "admin", "movies", "persona"]
  },
  {
    id: "op-moneypenny",
    callsign: "EVE",
    name: "Miss Eve Moneypenny",
    serviceNumber: "SIS-MP-04",
    role: "Chief Secretary to M // Operations Liaison",
    rank: "Executive Security Officer",
    department: "Directorate of Operations & Diplomatic Comms",
    clearanceLevel: 7,
    clearanceLabel: "LEVEL 7 // SECRET CLEARANCE",
    discretionaryLicence: false,
    passcode: "VAUXHALL-DESK-00",
    biometricCode: "DNA-MP04-CENTRAL-7128-BETA",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    allowedTabs: ["command", "database", "graph", "telemetry", "movies", "persona"]
  },
  {
    id: "op-analyst",
    callsign: "ANALYST-IV",
    name: "Peter Ross",
    serviceNumber: "SIS-AN-192",
    role: "Section IV Tactical Threat & Sigint Analyst",
    rank: "Higher Intelligence Officer",
    department: "European Counter-Intelligence Assessment",
    clearanceLevel: 5,
    clearanceLabel: "LEVEL 5 // RESTRICTED / CONFIDENTIAL",
    discretionaryLicence: false,
    passcode: "SIGINT-CHELSEA-4",
    biometricCode: "DNA-AN192-DESK-5541-GAMMA",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    allowedTabs: ["command", "database", "telemetry", "movies", "persona"]
  }
];

export const AUTH_STORAGE_KEY = "mi6_agent_auth_session_v1";
export function createAuthSession(agent: AgentOperative) {
  const now = Date.now();
  return {
    agent,
    token: "SIS-AUTH-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    loginTime: now,
    // Kept for backwards-compatible persisted-session shape. Automatic expiry is disabled.
    expiresAt: Number.MAX_SAFE_INTEGER,
    isLocked: false,
    warningAcknowledged: false
  };
}

export function getInitialSession(): {
  agent: AgentOperative;
  token: string;
  loginTime: number;
  expiresAt: number;
  isLocked: boolean;
  warningAcknowledged: boolean;
} {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate legacy timed sessions to the new manual-lock-only policy.
      if (parsed.agent) {
        const legacyTimedSession = parsed.expiresAt !== Number.MAX_SAFE_INTEGER;
        const migrated = {
          ...parsed,
          expiresAt: Number.MAX_SAFE_INTEGER,
          // A legacy timeout may already have auto-locked the terminal. Clear that once during migration.
          // New manual locks remain persistent because new sessions already use MAX_SAFE_INTEGER.
          isLocked: legacyTimedSession ? false : Boolean(parsed.isLocked)
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch (e) {
    console.warn("Failed to read stored session:", e);
  }

  // Default authenticated operative: Commander James Bond (007)
  const defaultAgent = MI6_OPERATIVES[0];
  const session = createAuthSession(defaultAgent);
  console.log("getInitialSession returning:", session);
  return session;
}

export function persistSession(session: any) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save auth session:", e);
  }
}
