export interface BondDoctrine {
  id: string;
  name: string;
  era: string;
  description: string;
  strengths: string[];
  tacticalIntelligence: number;
  professionalism: number;
  charm: number;
  patience: number;
  riskTolerance: number;
  compassion: number;
  ruthlessness: number;
  manipulationDeception: number;
  portraitUrl: string;
}

export const BOND_DOCTRINES: BondDoctrine[] = [
  {
    id: "connery",
    name: "Sean Connery",
    era: "1962–1967, 1971",
    description: "Confident, direct and highly deceptive. Strong social dominance with pragmatic use of force.",
    strengths: ["Charm", "Deception", "Improvisation"],
    tacticalIntelligence: 85,
    professionalism: 75,
    charm: 100,
    patience: 40,
    riskTolerance: 85,
    compassion: 40,
    ruthlessness: 75,
    manipulationDeception: 90,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Sean_Connery.jpg',
  },
  {
    id: "lazenby",
    name: "George Lazenby",
    era: "1969",
    description: "Emotionally open, physically committed and unusually willing to put himself at risk for allies.",
    strengths: ["Courage", "Empathy", "Physical commitment"],
    tacticalIntelligence: 65,
    professionalism: 50,
    charm: 70,
    patience: 30,
    riskTolerance: 95,
    compassion: 85,
    ruthlessness: 50,
    manipulationDeception: 40,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/George_Lazenby_2001.jpg',
  },
  {
    id: "moore",
    name: "Roger Moore",
    era: "1973–1985",
    description: "Patient, diplomatic and highly controlled. Prefers intelligence, wit and clean solutions before escalation.",
    strengths: ["Diplomacy", "Patience", "Professional control"],
    tacticalIntelligence: 85,
    professionalism: 95,
    charm: 100,
    patience: 90,
    riskTolerance: 50,
    compassion: 95,
    ruthlessness: 55,
    manipulationDeception: 80,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Roger_Moore_c._1960.jpg',
  },
  {
    id: "dalton",
    name: "Timothy Dalton",
    era: "1987–1989",
    description: "Mission-focused, intense and highly tactical. Independent when orders conflict with operational judgement.",
    strengths: ["Tactical intelligence", "Discipline", "Relentless pursuit"],
    tacticalIntelligence: 95,
    professionalism: 90,
    charm: 40,
    patience: 50,
    riskTolerance: 80,
    compassion: 60,
    ruthlessness: 80,
    manipulationDeception: 50,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Timothy_Dalton_1987.jpg',
  },
  {
    id: "brosnan",
    name: "Pierce Brosnan",
    era: "1995–2002",
    description: "Balanced modern field doctrine combining social engineering, technology and efficient tactical action.",
    strengths: ["Hybrid operations", "Technology", "Composure"],
    tacticalIntelligence: 85,
    professionalism: 90,
    charm: 95,
    patience: 70,
    riskTolerance: 70,
    compassion: 50,
    ruthlessness: 60,
    manipulationDeception: 85,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/PierceBrosnan%28CannesPhotoCall%29.jpg',
  },
  {
    id: "craig",
    name: "Daniel Craig",
    era: "2006–2021",
    description: "High-risk, direct and physically aggressive doctrine with strong tactical instincts and low patience.",
    strengths: ["Direct action", "Risk tolerance", "Tactical pressure"],
    tacticalIntelligence: 90,
    professionalism: 80,
    charm: 50,
    patience: 30,
    riskTolerance: 100,
    compassion: 30,
    ruthlessness: 95,
    manipulationDeception: 60,
    portraitUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Daniel_Craig_2007.jpg',
  },
];
