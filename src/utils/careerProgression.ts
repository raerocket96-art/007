export type CareerProfile = {
  rank: string;
  requisitionPoints: number;
  completedOperations: string[];
  rewardedRunIds: string[];
  unlockedPrototypeIds: string[];
};

export type QPrototype = {
  id: string;
  name: string;
  cost: number;
  directive: string;
  description: string;
};

export const CAREER_KEY = "mi6_career_profile_v1";

export const Q_PROTOTYPES: QPrototype[] = [
  { id: "proto-emp-cufflink", name: "EMP Cufflink Mk II", cost: 20, description: "Single-use localized electronics blackout.", directive: "Deploy the Q-Branch EMP Cufflink Mk II to disable nearby electronic security for a short tactical window." },
  { id: "proto-micro-rocket", name: "Micro-Rocket Cigarette", cost: 35, description: "Concealed one-shot breaching projectile.", directive: "Use the concealed Micro-Rocket Cigarette as a one-shot precision breaching tool against the immediate obstacle." },
  { id: "proto-adaptive-id", name: "Adaptive Cover ID", cost: 30, description: "Refreshes a compromised cover identity once per mission.", directive: "Activate the Adaptive Cover ID package to refresh Bond's compromised identity and attempt to restore local cover." }
];

export function loadCareerProfile(): CareerProfile {
  try {
    const raw = localStorage.getItem(CAREER_KEY);
    if (raw) return { rank: "Field Operative", requisitionPoints: 0, completedOperations: [], rewardedRunIds: [], unlockedPrototypeIds: [], ...JSON.parse(raw) };
  } catch {}
  return { rank: "Field Operative", requisitionPoints: 0, completedOperations: [], rewardedRunIds: [], unlockedPrototypeIds: [] };
}

export function saveCareerProfile(profile: CareerProfile) {
  try { localStorage.setItem(CAREER_KEY, JSON.stringify(profile)); } catch {}
}

export function awardCareerRun(profile: CareerProfile, params: { runId: string; templateId: string; score: number; politicalExposure: number }): CareerProfile {
  if (profile.rewardedRunIds.includes(params.runId)) return profile;
  const earned = Math.max(3, Math.round(params.score / 8) - Math.round(params.politicalExposure / 25));
  const completedOperations = [...new Set([...profile.completedOperations, params.templateId])];
  const totalCompleted = completedOperations.length;
  const rank = totalCompleted >= 15 ? "Chief Field Operative" : totalCompleted >= 8 ? "Senior 00 Operative" : totalCompleted >= 3 ? "00 Field Operative" : "Field Operative";
  return {
    ...profile,
    rank,
    requisitionPoints: profile.requisitionPoints + earned,
    completedOperations,
    rewardedRunIds: [...profile.rewardedRunIds, params.runId]
  };
}

export function unlockPrototype(profile: CareerProfile, prototypeId: string): CareerProfile {
  const prototype = Q_PROTOTYPES.find((item) => item.id === prototypeId);
  if (!prototype || profile.unlockedPrototypeIds.includes(prototypeId) || profile.requisitionPoints < prototype.cost) return profile;
  return { ...profile, requisitionPoints: profile.requisitionPoints - prototype.cost, unlockedPrototypeIds: [...profile.unlockedPrototypeIds, prototypeId] };
}
