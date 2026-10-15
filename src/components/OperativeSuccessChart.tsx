import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { 
  TrendingUp, 
  Activity, 
  Award, 
  ShieldCheck, 
  Filter, 
  Calendar, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Zap,
  Layers,
  Search,
  Play,
  Clock,
  User,
  Film,
  Target
} from "lucide-react";
import { soundManager } from "../utils/sound";
import { bondFilmMissionTemplates } from "../data/bondFilmMissions";

export interface HistoricalMissionDataPoint {
  id: string;
  templateId?: string;
  operationName: string;
  codename: string;
  year: number;
  date: string; // ISO or YYYY-MM
  timestamp: number;
  actor: string;
  successRate: number; // 0 to 100
  tacticalEfficiency: number; // 0 to 100
  stealthRating: number; // 0 to 100
  collateralControl: number; // 0 to 100
  location: string;
  objective: string;
  turns?: number;
  outcome: "DISTINGUISHED SUCCESS" | "TACTICAL SUCCESS" | "COMPROMISED EXTRACTION" | "VICTORY" | "SESSION CONCLUDED" | "IN PROGRESS";
  isLiveRun?: boolean;
}

// Complete 25-film official EON Mission Historical Telemetry Dataset
const ALL_25_CANONICAL_HISTORICAL_DATA: HistoricalMissionDataPoint[] = [
  {
    id: "hist-drno",
    templateId: "film-dr-no",
    operationName: "Dr. No (Crab Key)",
    codename: "OPERATION DR. NO",
    year: 1962,
    date: "1962-10",
    timestamp: new Date("1962-10-05").getTime(),
    actor: "Sean Connery",
    successRate: 88,
    tacticalEfficiency: 85,
    stealthRating: 82,
    collateralControl: 90,
    location: "Kingston / Crab Key, Jamaica",
    objective: "Investigate the disappearance of Station J personnel and stop radio interference with Cape Canaveral launches.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-frwl",
    templateId: "film-from-russia-with-love",
    operationName: "From Russia with Love (Orient Express)",
    codename: "OPERATION LEKTOR",
    year: 1963,
    date: "1963-10",
    timestamp: new Date("1963-10-10").getTime(),
    actor: "Sean Connery",
    successRate: 94,
    tacticalEfficiency: 96,
    stealthRating: 90,
    collateralControl: 92,
    location: "Istanbul / Orient Express / Venice",
    objective: "Secure a Soviet Lektor cipher machine and extract the defector while identifying the SPECTRE trap.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-goldfinger",
    templateId: "film-goldfinger",
    operationName: "Goldfinger (Fort Knox)",
    codename: "OPERATION GRAND SLAM",
    year: 1964,
    date: "1964-09",
    timestamp: new Date("1964-09-17").getTime(),
    actor: "Sean Connery",
    successRate: 96,
    tacticalEfficiency: 92,
    stealthRating: 86,
    collateralControl: 95,
    location: "Miami / Switzerland / Kentucky",
    objective: "Uncover Auric Goldfinger's smuggling network and prevent radioactive contamination of Fort Knox.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-thunderball",
    templateId: "film-thunderball",
    operationName: "Thunderball (Bahamas Recovery)",
    codename: "OPERATION THUNDERBALL",
    year: 1965,
    date: "1965-12",
    timestamp: new Date("1965-12-09").getTime(),
    actor: "Sean Connery",
    successRate: 91,
    tacticalEfficiency: 89,
    stealthRating: 88,
    collateralControl: 84,
    location: "Nassau / New Providence, Bahamas",
    objective: "Locate two stolen NATO nuclear weapons before SPECTRE's ransom deadline.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-you-only-live-twice",
    templateId: "film-you-only-live-twice",
    operationName: "You Only Live Twice (Volcano Base)",
    codename: "OPERATION BIRD ONE",
    year: 1967,
    date: "1967-06",
    timestamp: new Date("1967-06-12").getTime(),
    actor: "Sean Connery",
    successRate: 89,
    tacticalEfficiency: 92,
    stealthRating: 81,
    collateralControl: 85,
    location: "Tokyo / Kobe / Volcano Island, Japan",
    objective: "Identify the rogue entity swallowing spacecraft in orbit before superpower war erupts.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-ohmss",
    templateId: "film-on-her-majestys-secret-service",
    operationName: "On Her Majesty's Secret Service (Piz Gloria)",
    codename: "OPERATION CORONA",
    year: 1969,
    date: "1969-12",
    timestamp: new Date("1969-12-18").getTime(),
    actor: "George Lazenby",
    successRate: 86,
    tacticalEfficiency: 88,
    stealthRating: 80,
    collateralControl: 78,
    location: "Bern / Piz Gloria, Swiss Alps",
    objective: "Infiltrate Blofeld's alpine institute and stop an agricultural biological warfare attack.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-diamonds-are-forever",
    templateId: "film-diamonds-are-forever",
    operationName: "Diamonds Are Forever (Las Vegas & Rig)",
    codename: "OPERATION DIAMONDS",
    year: 1971,
    date: "1971-12",
    timestamp: new Date("1971-12-14").getTime(),
    actor: "Sean Connery",
    successRate: 87,
    tacticalEfficiency: 84,
    stealthRating: 76,
    collateralControl: 82,
    location: "Amsterdam / Las Vegas / Baja California",
    objective: "Trace a diamond-smuggling pipeline and destroy a satellite-based laser weapon.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-live-and-let-die",
    templateId: "film-live-and-let-die",
    operationName: "Live and Let Die (San Monique & Bayou)",
    codename: "OPERATION SAN MONIQUE",
    year: 1973,
    date: "1973-06",
    timestamp: new Date("1973-06-27").getTime(),
    actor: "Roger Moore",
    successRate: 90,
    tacticalEfficiency: 88,
    stealthRating: 82,
    collateralControl: 86,
    location: "New York / New Orleans / San Monique",
    objective: "Investigate murders of 3 British agents and dismantle Dr. Kananga's heroin distribution cartel.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-man-with-golden-gun",
    templateId: "film-the-man-with-the-golden-gun",
    operationName: "The Man with the Golden Gun (Solex Agitator)",
    codename: "OPERATION SOLEX",
    year: 1974,
    date: "1974-12",
    timestamp: new Date("1974-12-19").getTime(),
    actor: "Roger Moore",
    successRate: 88,
    tacticalEfficiency: 86,
    stealthRating: 84,
    collateralControl: 90,
    location: "Macau / Hong Kong / Scaramanga's Island",
    objective: "Recover the stolen Solex Agitator solar device and neutralize assassin Francisco Scaramanga.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-spywholovedme",
    templateId: "film-the-spy-who-loved-me",
    operationName: "The Spy Who Loved Me (Liparus & Atlantis)",
    codename: "OPERATION ATLANTIS",
    year: 1977,
    date: "1977-07",
    timestamp: new Date("1977-07-07").getTime(),
    actor: "Roger Moore",
    successRate: 93,
    tacticalEfficiency: 91,
    stealthRating: 84,
    collateralControl: 88,
    location: "Cairo / Sardinia / Mediterranean Sea",
    objective: "Track vanishing ballistic missile submarines and thwart Stromberg's undersea empire plan.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-moonraker",
    templateId: "film-moonraker",
    operationName: "Moonraker (Orbital Bio-Station)",
    codename: "OPERATION MOONRAKER",
    year: 1979,
    date: "1979-06",
    timestamp: new Date("1979-06-26").getTime(),
    actor: "Roger Moore",
    successRate: 89,
    tacticalEfficiency: 86,
    stealthRating: 79,
    collateralControl: 82,
    location: "California / Venice / Rio / Low Earth Orbit",
    objective: "Locate a hijacked Moonraker shuttle and prevent Hugo Drax's global nerve toxin genocide.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-for-your-eyes-only",
    templateId: "film-for-your-eyes-only",
    operationName: "For Your Eyes Only (ATAC St. Cyril)",
    codename: "OPERATION ATAC",
    year: 1981,
    date: "1981-06",
    timestamp: new Date("1981-06-24").getTime(),
    actor: "Roger Moore",
    successRate: 92,
    tacticalEfficiency: 90,
    stealthRating: 93,
    collateralControl: 94,
    location: "Ionian Sea / Cortina d'Ampezzo / Meteora, Greece",
    objective: "Recover the ATAC naval transmitter before Soviet KGB agents seize British submarine command codes.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-octopussy",
    templateId: "film-octopussy",
    operationName: "Octopussy (Feldstadt Air Base)",
    codename: "OPERATION OCTOPUSSY",
    year: 1983,
    date: "1983-06",
    timestamp: new Date("1983-06-06").getTime(),
    actor: "Roger Moore",
    successRate: 91,
    tacticalEfficiency: 89,
    stealthRating: 86,
    collateralControl: 92,
    location: "East Berlin / Udaipur, India / West Germany",
    objective: "Investigate forged Fabergé eggs and defuse a rogue nuclear device placed at a US Air Force base.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-view-to-a-kill",
    templateId: "film-a-view-to-a-kill",
    operationName: "A View to a Kill (Silicon Valley & Bridge)",
    codename: "OPERATION GRAND CHELEM",
    year: 1985,
    date: "1985-05",
    timestamp: new Date("1985-05-22").getTime(),
    actor: "Roger Moore",
    successRate: 87,
    tacticalEfficiency: 85,
    stealthRating: 80,
    collateralControl: 79,
    location: "Siberia / Paris / San Francisco",
    objective: "Expose Max Zorin's microchip monopoly plot and stop flooding of Silicon Valley along the San Andreas fault.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-livingdaylights",
    templateId: "film-the-living-daylights",
    operationName: "The Living Daylights (Bratislava & Tangier)",
    codename: "OPERATION SMERSH",
    year: 1987,
    date: "1987-06",
    timestamp: new Date("1987-06-27").getTime(),
    actor: "Timothy Dalton",
    successRate: 92,
    tacticalEfficiency: 95,
    stealthRating: 94,
    collateralControl: 89,
    location: "Bratislava / Vienna / Tangier / Afghanistan",
    objective: "Extract Soviet General Koskov and dismantle an illicit arms/opium triangle masquerading as a defection.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-licencetokill",
    templateId: "film-licence-to-kill",
    operationName: "Licence to Kill (Isthmus Tanker Convoy)",
    codename: "ROGUE SANCTION",
    year: 1989,
    date: "1989-07",
    timestamp: new Date("1989-07-07").getTime(),
    actor: "Timothy Dalton",
    successRate: 87,
    tacticalEfficiency: 94,
    stealthRating: 82,
    collateralControl: 72,
    location: "Key West / Isthmus City, Latin America",
    objective: "Infiltrate Franz Sanchez's cocaine smuggling cartel in an unsanctioned personal revenge mission.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-goldeneye",
    templateId: "film-goldeneye",
    operationName: "GoldenEye (Severnaya & Cradle)",
    codename: "OPERATION JANUS",
    year: 1995,
    date: "1995-11",
    timestamp: new Date("1995-11-17").getTime(),
    actor: "Pierce Brosnan",
    successRate: 95,
    tacticalEfficiency: 94,
    stealthRating: 88,
    collateralControl: 91,
    location: "Arkhangelsk / St. Petersburg / Cuba",
    objective: "Prevent Alec Trevelyan from using the EMP GoldenEye satellite weapon to wipe London financial data.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-tomorrowneverdies",
    templateId: "film-tomorrow-never-dies",
    operationName: "Tomorrow Never Dies (Saigon & Stealth Ship)",
    codename: "OPERATION CARVER",
    year: 1997,
    date: "1997-12",
    timestamp: new Date("1997-12-12").getTime(),
    actor: "Pierce Brosnan",
    successRate: 90,
    tacticalEfficiency: 92,
    stealthRating: 85,
    collateralControl: 86,
    location: "Hamburg / Saigon / South China Sea",
    objective: "Expose Elliot Carver's media empire inciting war between Britain and China with a stealth vessel.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-world-is-not-enough",
    templateId: "film-the-world-is-not-enough",
    operationName: "The World Is Not Enough (Bosphorus Sub)",
    codename: "OPERATION KING",
    year: 1999,
    date: "1999-11",
    timestamp: new Date("1999-11-19").getTime(),
    actor: "Pierce Brosnan",
    successRate: 89,
    tacticalEfficiency: 90,
    stealthRating: 84,
    collateralControl: 83,
    location: "Bilbao / London / Baku / Istanbul",
    objective: "Protect oil heiress Elektra King and stop Renard from detonating a nuclear submarine in Istanbul.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-die-another-day",
    templateId: "film-die-another-day",
    operationName: "Die Another Day (Icarus & DMZ)",
    codename: "OPERATION ICARUS",
    year: 2002,
    date: "2002-11",
    timestamp: new Date("2002-11-20").getTime(),
    actor: "Pierce Brosnan",
    successRate: 86,
    tacticalEfficiency: 88,
    stealthRating: 77,
    collateralControl: 75,
    location: "North Korea / Havana / London / Iceland",
    objective: "Unmask Colonel Moon's DNA transformation as Gustav Graves and stop the Icarus solar weapon in the DMZ.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-casinoroyale",
    templateId: "film-casino-royale",
    operationName: "Casino Royale (Montenegro Poker & Venice)",
    codename: "OPERATION LE CHIFFRE",
    year: 2006,
    date: "2006-11",
    timestamp: new Date("2006-11-14").getTime(),
    actor: "Daniel Craig",
    successRate: 93,
    tacticalEfficiency: 97,
    stealthRating: 78,
    collateralControl: 80,
    location: "Madagascar / Bahamas / Montenegro / Venice",
    objective: "Bankrupt terrorist financier Le Chiffre in a high-stakes poker game at Casino Royale.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-quantum-of-solace",
    templateId: "film-quantum-of-solace",
    operationName: "Quantum of Solace (Perla de las Dunas)",
    codename: "OPERATION MEDRANO",
    year: 2008,
    date: "2008-10",
    timestamp: new Date("2008-10-29").getTime(),
    actor: "Daniel Craig",
    successRate: 88,
    tacticalEfficiency: 94,
    stealthRating: 81,
    collateralControl: 74,
    location: "Siena / Port-au-Prince / Bregenz / Atacama Desert",
    objective: "Uncover Dominic Greene's Quantum network manipulating water utilities and staging a coup in Bolivia.",
    outcome: "TACTICAL SUCCESS",
  },
  {
    id: "hist-skyfall",
    templateId: "film-skyfall",
    operationName: "Skyfall (London Defence & Scottish Highlands)",
    codename: "OPERATION SILVA",
    year: 2012,
    date: "2012-10",
    timestamp: new Date("2012-10-23").getTime(),
    actor: "Daniel Craig",
    successRate: 97,
    tacticalEfficiency: 98,
    stealthRating: 92,
    collateralControl: 85,
    location: "Istanbul / Shanghai / Macau / London / Scotland",
    objective: "Protect M and recover compromised NATO operative identities from cyberterrorist Raoul Silva.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-spectre",
    templateId: "film-spectre",
    operationName: "Spectre (Crater Facility & MI6 Ruins)",
    codename: "OPERATION SPECTRE",
    year: 2015,
    date: "2015-10",
    timestamp: new Date("2015-10-26").getTime(),
    actor: "Daniel Craig",
    successRate: 91,
    tacticalEfficiency: 93,
    stealthRating: 86,
    collateralControl: 82,
    location: "Mexico City / Rome / Tangier / London",
    objective: "Follow a posthumous lead from M to uncover the global criminal syndicate SPECTRE and Blofeld.",
    outcome: "DISTINGUISHED SUCCESS",
  },
  {
    id: "hist-notimetodie",
    templateId: "film-no-time-to-die",
    operationName: "No Time to Die (Nanobot Island Facility)",
    codename: "OPERATION HERACLES",
    year: 2021,
    date: "2021-09",
    timestamp: new Date("2021-09-28").getTime(),
    actor: "Daniel Craig",
    successRate: 92,
    tacticalEfficiency: 96,
    stealthRating: 86,
    collateralControl: 94,
    location: "Matera / Jamaica / London / Norway / Kuril Island",
    objective: "Rescue a kidnapped scientist and stop Safin from weaponizing DNA-targeted nanobots on a global scale.",
    outcome: "DISTINGUISHED SUCCESS",
  }
];

const RUN_ARCHIVE_KEY = "mi6_completed_run_archive_v1";
const MISSION_SAVES_KEY = "mi6_mission_saves_v1";
const ACTIVE_MISSION_KEY = "mi6_active_mission_v1";

interface OperativeSuccessChartProps {
  onOpenRecord?: (recordId: string) => void;
  onStartMission?: (templateId?: string) => void;
}

export const OperativeSuccessChart: React.FC<OperativeSuccessChartProps> = ({
  onOpenRecord,
  onStartMission
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedActor, setSelectedActor] = useState<string>("ALL");
  const [selectedMetric, setSelectedMetric] = useState<"successRate" | "tacticalEfficiency" | "stealthRating">("successRate");
  const [viewFilter, setViewFilter] = useState<"ALL" | "CANONICAL" | "PLAYER_PLAYED">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDataPoint, setActiveDataPoint] = useState<HistoricalMissionDataPoint | null>(null);
  const [selectedMissionForDetails, setSelectedMissionForDetails] = useState<HistoricalMissionDataPoint | null>(null);
  const [liveRuns, setLiveRuns] = useState<HistoricalMissionDataPoint[]>([]);

  // Load player's live completed runs, saves, and active mission from localStorage
  useEffect(() => {
    try {
      const recordedRuns: HistoricalMissionDataPoint[] = [];

      // 1. Load completed run archive
      const rawRuns = localStorage.getItem(RUN_ARCHIVE_KEY);
      if (rawRuns) {
        const parsed = JSON.parse(rawRuns);
        if (Array.isArray(parsed)) {
          parsed.forEach((item: any, idx: number) => {
            const score = typeof item.score === "number" ? Math.max(10, Math.min(100, item.score)) : 85;
            const matchedTemplate = bondFilmMissionTemplates.find(t => 
              t.title.toLowerCase() === String(item.title || "").toLowerCase() ||
              t.codename.toLowerCase() === String(item.title || "").toLowerCase()
            );

            recordedRuns.push({
              id: item.id || `live-archive-${idx}`,
              templateId: matchedTemplate?.id || item.templateId || "film-goldfinger",
              operationName: item.title ? `Player Run: ${item.title}` : `Field Operation #${idx + 1}`,
              codename: item.title ? item.title.toUpperCase() : `SIM-RUN-${idx + 1}`,
              year: item.finishedAt ? new Date(item.finishedAt).getFullYear() : 2026,
              date: item.finishedAt ? new Date(item.finishedAt).toISOString().slice(0, 10) : "2026-LIVE",
              timestamp: item.finishedAt ? new Date(item.finishedAt).getTime() : Date.now() - (idx * 3600000),
              actor: item.actor || "Commander James Bond (007)",
              successRate: score,
              tacticalEfficiency: Math.min(100, score + 2),
              stealthRating: Math.min(100, Math.max(30, score - 3)),
              collateralControl: Math.max(40, score - 5),
              location: matchedTemplate?.location || "Field Operation Active Theatre",
              objective: matchedTemplate?.objective || "Classified Double-O field assignment",
              turns: item.turnCount || 5,
              outcome: score >= 90 ? "DISTINGUISHED SUCCESS" : score >= 75 ? "TACTICAL SUCCESS" : "COMPROMISED EXTRACTION",
              isLiveRun: true,
            });
          });
        }
      }

      // 2. Load mission saves
      const rawSaves = localStorage.getItem(MISSION_SAVES_KEY);
      if (rawSaves) {
        const parsedSaves = JSON.parse(rawSaves);
        if (Array.isArray(parsedSaves)) {
          parsedSaves.forEach((save: any, idx: number) => {
            if (!recordedRuns.some(r => r.id === save.id)) {
              const state = save.missionState;
              const matchedTemplate = bondFilmMissionTemplates.find(t => 
                t.title.toLowerCase() === String(save.name || "").toLowerCase() ||
                t.title.toLowerCase() === String(state?.title || "").toLowerCase()
              );
              recordedRuns.push({
                id: save.id || `save-${idx}`,
                templateId: matchedTemplate?.id || "film-dr-no",
                operationName: `Saved Slot: ${save.name || state?.title || "Field State"}`,
                codename: `SAVE // ${(save.name || "SLOT").toUpperCase()}`,
                year: save.timestamp ? new Date(save.timestamp).getFullYear() : 2026,
                date: save.timestamp ? new Date(save.timestamp).toISOString().slice(0, 10) : "2026-SAVE",
                timestamp: save.timestamp ? new Date(save.timestamp).getTime() : Date.now() - (idx * 7200000),
                actor: state?.preferredBondActor || "Commander James Bond (007)",
                successRate: state?.agentHealth ? Math.round((state.agentHealth + (state.stealthRating || 80)) / 2) : 84,
                tacticalEfficiency: state?.stealthRating || 82,
                stealthRating: state?.stealthRating || 85,
                collateralControl: Math.max(20, 100 - (state?.collateralDamage || 0)),
                location: state?.sceneState?.currentLocation || matchedTemplate?.location || "Field Operations Theatre",
                objective: state?.sceneState?.immediateObjective || matchedTemplate?.objective || "Active operational objective",
                turns: state?.currentTurn || 3,
                outcome: "IN PROGRESS",
                isLiveRun: true,
              });
            }
          });
        }
      }

      setLiveRuns(recordedRuns);
    } catch {
      // Local archive read is best effort
    }
  }, []);

  // Combine dataset based on ViewFilter, Actor, and Search Query
  const dataset = useMemo(() => {
    let combined: HistoricalMissionDataPoint[] = [];

    if (viewFilter === "ALL") {
      combined = [...ALL_25_CANONICAL_HISTORICAL_DATA, ...liveRuns];
    } else if (viewFilter === "CANONICAL") {
      combined = [...ALL_25_CANONICAL_HISTORICAL_DATA];
    } else {
      combined = liveRuns.length ? [...liveRuns] : [...ALL_25_CANONICAL_HISTORICAL_DATA.slice(0, 5)];
    }

    combined.sort((a, b) => a.timestamp - b.timestamp);

    if (selectedActor !== "ALL") {
      combined = combined.filter(d => d.actor.toLowerCase().includes(selectedActor.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter(d => 
        d.operationName.toLowerCase().includes(q) ||
        d.codename.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.actor.toLowerCase().includes(q)
      );
    }

    return combined;
  }, [viewFilter, selectedActor, searchQuery, liveRuns]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    if (!dataset.length) {
      return { average: 91, peak: 97, peakName: "Skyfall", totalRuns: 25, liveCount: liveRuns.length, trend: "+3.8%" };
    }
    const values = dataset.map(d => d[selectedMetric]);
    const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    let peak = values[0];
    let peakItem = dataset[0];
    dataset.forEach(d => {
      if (d[selectedMetric] > peak) {
        peak = d[selectedMetric];
        peakItem = d;
      }
    });

    const recent = dataset.slice(-6);
    const recentAvg = recent.reduce((a, b) => a + b[selectedMetric], 0) / recent.length;
    const earlier = dataset.slice(0, Math.max(1, dataset.length - 6));
    const earlierAvg = earlier.reduce((a, b) => a + b[selectedMetric], 0) / earlier.length;
    const delta = Math.round((recentAvg - earlierAvg) * 10) / 10;
    const trend = delta >= 0 ? `+${delta}%` : `${delta}%`;

    return {
      average,
      peak,
      peakName: peakItem.operationName.split("(")[0].trim(),
      totalRuns: dataset.length,
      liveCount: liveRuns.length,
      trend,
    };
  }, [dataset, selectedMetric, liveRuns]);

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || dataset.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 45, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define Gradients & Filters
    const defs = svg.append("defs");

    const areaGradient = defs.append("linearGradient")
      .attr("id", "operativeSuccessGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    areaGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", selectedMetric === "successRate" ? "#f59e0b" : selectedMetric === "tacticalEfficiency" ? "#38bdf8" : "#10b981")
      .attr("stop-opacity", 0.45);

    areaGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", selectedMetric === "successRate" ? "#f59e0b" : selectedMetric === "tacticalEfficiency" ? "#38bdf8" : "#10b981")
      .attr("stop-opacity", 0.0);

    const filter = defs.append("filter")
      .attr("id", "metricGlow")
      .attr("x", "-20%").attr("y", "-20%")
      .attr("width", "140%").attr("height", "140%");

    filter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Scales
    const xScale = d3.scalePoint<string>()
      .domain(dataset.map(d => d.id))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([60, 100])
      .range([innerHeight, 0])
      .nice();

    // Grid lines (horizontal)
    const yAxisGrid = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat(() => "")
      .ticks(5);

    g.append("g")
      .attr("class", "grid")
      .call(yAxisGrid)
      .selectAll("line")
      .attr("stroke", "rgba(255, 255, 255, 0.06)")
      .attr("stroke-dasharray", "3,3");

    g.select(".grid .domain").remove();

    // Area Generator
    const areaGenerator = d3.area<HistoricalMissionDataPoint>()
      .x(d => xScale(d.id) || 0)
      .y0(innerHeight)
      .y1(d => yScale(d[selectedMetric]))
      .curve(d3.curveMonotoneX);

    // Line Generator
    const lineGenerator = d3.line<HistoricalMissionDataPoint>()
      .x(d => xScale(d.id) || 0)
      .y(d => yScale(d[selectedMetric]))
      .curve(d3.curveMonotoneX);

    // Draw Area
    g.append("path")
      .datum(dataset)
      .attr("fill", "url(#operativeSuccessGradient)")
      .attr("d", areaGenerator);

    // Draw Line
    const strokeColor = selectedMetric === "successRate" ? "#f59e0b" : selectedMetric === "tacticalEfficiency" ? "#38bdf8" : "#10b981";

    const path = g.append("path")
      .datum(dataset)
      .attr("fill", "none")
      .attr("stroke", strokeColor)
      .attr("stroke-width", 2.5)
      .attr("filter", "url(#metricGlow)")
      .attr("d", lineGenerator);

    // Animate line path drawing
    const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 1000;
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((id) => {
        const item = dataset.find(d => d.id === id);
        if (!item) return "";
        return item.isLiveRun ? "LIVE" : item.date.slice(2, 4) + "'";
      });

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    // Render X Axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr("color", "rgba(255, 255, 255, 0.4)")
      .selectAll("text")
      .attr("font-family", "monospace")
      .attr("font-size", "8.5px")
      .attr("fill", "rgba(255, 255, 255, 0.6)")
      .attr("transform", "rotate(-25)")
      .style("text-anchor", "end");

    // Render Y Axis
    g.append("g")
      .call(yAxis)
      .attr("color", "rgba(255, 255, 255, 0.4)")
      .selectAll("text")
      .attr("font-family", "monospace")
      .attr("font-size", "9px")
      .attr("fill", "rgba(255, 255, 255, 0.6)");

    // Interactive Vertical Guideline
    const crosshair = g.append("line")
      .attr("y1", 0)
      .attr("y2", innerHeight)
      .attr("stroke", "rgba(245, 158, 11, 0.5)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0);

    // Plot Data Node Circles
    const nodes = g.selectAll(".data-node")
      .data(dataset)
      .enter()
      .append("g")
      .attr("class", "data-node")
      .attr("transform", d => `translate(${xScale(d.id) || 0},${yScale(d[selectedMetric])})`);

    // Outer Halo Circle
    nodes.append("circle")
      .attr("r", d => d.isLiveRun ? 5.5 : 3.8)
      .attr("fill", d => d.isLiveRun ? "#10b981" : strokeColor)
      .attr("stroke", "#090c11")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .on("click", (_, d) => {
        soundManager.playClick();
        setSelectedMissionForDetails(d);
      })
      .transition()
      .duration(400)
      .delay((_, i) => i * 25);

    // Hover Target Area Overlay for Smooth Mouse Navigation
    const overlay = g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .attr("cursor", "crosshair");

    overlay.on("mousemove", (event) => {
      const [mouseX] = d3.pointer(event);
      
      let closest: HistoricalMissionDataPoint = dataset[0];
      let minDistance = Infinity;

      dataset.forEach(d => {
        const cx = xScale(d.id) || 0;
        const dist = Math.abs(mouseX - cx);
        if (dist < minDistance) {
          minDistance = dist;
          closest = d;
        }
      });

      const cx = xScale(closest.id) || 0;
      crosshair
        .attr("x1", cx)
        .attr("x2", cx)
        .style("opacity", 1);

      setActiveDataPoint(closest);
    });

    overlay.on("mouseleave", () => {
      crosshair.style("opacity", 0);
      setActiveDataPoint(null);
    });

    overlay.on("click", () => {
      if (activeDataPoint) {
        soundManager.playClick();
        setSelectedMissionForDetails(activeDataPoint);
      }
    });

  }, [dataset, selectedMetric, activeDataPoint]);

  return (
    <section className="mi6-swap-panel rounded-[28px] p-5 shadow-xl border border-white/10 relative overflow-hidden font-mono space-y-5">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.22em] text-amber-400">
              00-SECTION HISTORICAL TELEMETRY // ALL 25 MISSIONS & PLAYER SESSIONS
            </span>
          </div>
          <h3 className="text-xl font-black text-stone-100 tracking-tight mt-1 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            Operative Mission Success Telemetry Over Time
          </h3>
          <p className="text-[11px] text-stone-400 mt-0.5">
            Complete historical performance matrix covering every mission played before across 60 years of service.
          </p>
        </div>

        {/* View Mode & Metric Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Filter (All vs Canonical vs Live Runs) */}
          <div className="bg-[#12151c] border border-white/10 rounded-xl p-1 flex items-center text-[10px]">
            <button
              onClick={() => {
                soundManager.playClick();
                setViewFilter("ALL");
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all font-bold ${
                viewFilter === "ALL" ? "bg-amber-500 text-black shadow-sm" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              ALL MISSIONS ({ALL_25_CANONICAL_HISTORICAL_DATA.length + liveRuns.length})
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setViewFilter("CANONICAL");
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all font-bold ${
                viewFilter === "CANONICAL" ? "bg-amber-500 text-black shadow-sm" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              25 CANONICAL FILMS
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setViewFilter("PLAYER_PLAYED");
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all font-bold ${
                viewFilter === "PLAYER_PLAYED" ? "bg-emerald-500 text-black shadow-sm" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              PLAYER SESSIONS ({liveRuns.length})
            </button>
          </div>

          {/* Metric Selector */}
          <div className="bg-[#12151c] border border-white/10 rounded-xl p-1 flex items-center text-[10px]">
            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedMetric("successRate");
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all font-bold ${
                selectedMetric === "successRate" ? "bg-amber-500 text-black shadow-sm" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              SUCCESS %
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedMetric("tacticalEfficiency");
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all font-bold ${
                selectedMetric === "tacticalEfficiency" ? "bg-sky-500 text-black shadow-sm" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              TACTICAL
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedMetric("stealthRating");
              }}
              className={`px-2.5 py-1.5 rounded-lg transition-all font-bold ${
                selectedMetric === "stealthRating" ? "bg-emerald-500 text-black shadow-sm" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              COVER / STEALTH
            </button>
          </div>

          {/* Actor Era Filter */}
          <select
            value={selectedActor}
            onChange={(e) => {
              soundManager.playClick();
              setSelectedActor(e.target.value);
            }}
            className="bg-[#12151c] border border-white/10 text-stone-200 text-[10px] font-mono px-3 py-2 rounded-xl focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">ALL DOCTRINES / ERAS</option>
            <option value="Sean Connery">SEAN CONNERY (1962–1971)</option>
            <option value="George Lazenby">GEORGE LAZENBY (1969)</option>
            <option value="Roger Moore">ROGER MOORE (1973–1985)</option>
            <option value="Timothy Dalton">TIMOTHY DALTON (1987–1989)</option>
            <option value="Pierce Brosnan">PIERCE BROSNAN (1995–2002)</option>
            <option value="Daniel Craig">DANIEL CRAIG (2006–2021)</option>
          </select>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/8 bg-black/25 p-3">
          <div className="text-[8px] uppercase tracking-wider text-stone-500 font-bold flex items-center justify-between">
            <span>AVERAGE {selectedMetric === "successRate" ? "SUCCESS RATE" : selectedMetric === "tacticalEfficiency" ? "TACTICAL INDEX" : "COVER INTEGRITY"}</span>
            <span className="text-amber-400">{metrics.trend}</span>
          </div>
          <div className="text-2xl font-black text-amber-300 mt-1">
            {metrics.average}%
          </div>
          <div className="text-[8px] text-stone-500 mt-0.5">
            {metrics.average >= 90 ? "DISTINGUISHED STANDARD" : "NOMINAL THRESHOLD"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/25 p-3">
          <div className="text-[8px] uppercase tracking-wider text-stone-500 font-bold flex items-center justify-between">
            <span>HISTORICAL PEAK</span>
            <Award className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 mt-1">
            {metrics.peak}%
          </div>
          <div className="text-[8px] text-stone-400 truncate mt-0.5">
            {metrics.peakName}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/25 p-3">
          <div className="text-[8px] uppercase tracking-wider text-stone-500 font-bold flex items-center justify-between">
            <span>RECORDED MISSIONS</span>
            <Layers className="w-3 h-3 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-stone-100 mt-1">
            {dataset.length}
          </div>
          <div className="text-[8px] text-sky-400 mt-0.5">
            {metrics.liveCount} Live Sessions Logged
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-black/25 p-3">
          <div className="text-[8px] uppercase tracking-wider text-stone-500 font-bold flex items-center justify-between">
            <span>OPERATIVE READINESS</span>
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-sm font-black text-emerald-300 mt-2 truncate">
            SOVEREIGN READY
          </div>
          <div className="text-[8px] text-stone-500 mt-0.5">
            00-Section Status Verified
          </div>
        </div>
      </div>

      {/* D3 SVG Chart Container */}
      <div className="relative" ref={containerRef}>
        <svg
          ref={svgRef}
          className="w-full h-[280px] overflow-visible select-none"
        />

        {/* Interactive Hover Tooltip */}
        {activeDataPoint && (
          <div className="absolute top-2 right-2 max-w-xs bg-[#101319]/95 border border-amber-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-md pointer-events-none transition-all z-20">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${activeDataPoint.isLiveRun ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span className="text-[8px] uppercase font-bold text-amber-300">
                  {activeDataPoint.isLiveRun ? "PLAYER SIMULATION RUN" : `FILM #${activeDataPoint.year}`}
                </span>
              </div>
              <span className="text-[8px] text-stone-400">{activeDataPoint.date}</span>
            </div>

            <div className="text-xs font-black text-stone-100 leading-snug">
              {activeDataPoint.operationName}
            </div>
            <div className="text-[9px] text-violet-300 mt-0.5">
              Operative: {activeDataPoint.actor}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/8 text-center">
              <div>
                <span className="block text-[7px] text-stone-500">SUCCESS</span>
                <strong className="text-[11px] text-amber-300 font-black">{activeDataPoint.successRate}%</strong>
              </div>
              <div>
                <span className="block text-[7px] text-stone-500">TACTICAL</span>
                <strong className="text-[11px] text-sky-300 font-black">{activeDataPoint.tacticalEfficiency}%</strong>
              </div>
              <div>
                <span className="block text-[7px] text-stone-500">COVER</span>
                <strong className="text-[11px] text-emerald-300 font-black">{activeDataPoint.stealthRating}%</strong>
              </div>
            </div>

            <div className="mt-2 text-[8px] text-stone-400 flex items-center justify-between">
              <span>STATUS:</span>
              <span className="text-emerald-400 font-bold uppercase">{activeDataPoint.outcome}</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Mission Spotlight Modal / Card */}
      {selectedMissionForDetails && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-4 transition-all animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2 text-[9px] text-amber-400 font-bold uppercase tracking-widest">
                <Target className="w-3.5 h-3.5" />
                <span>MISSION DOSSIER TELEMETRY SPOTLIGHT</span>
                <span className="text-stone-500">•</span>
                <span className="text-stone-300">{selectedMissionForDetails.date}</span>
              </div>
              <h4 className="text-base font-black text-white mt-0.5">{selectedMissionForDetails.operationName}</h4>
              <div className="text-[10px] text-stone-400 mt-0.5 font-sans">
                {selectedMissionForDetails.location} · Assigned Operative: <strong className="text-stone-200">{selectedMissionForDetails.actor}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onStartMission && selectedMissionForDetails.templateId && (
                <button
                  onClick={() => {
                    soundManager.playAccessGranted();
                    onStartMission(selectedMissionForDetails.templateId);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>LAUNCH / REPLAY MISSION</span>
                </button>
              )}
              <button
                onClick={() => setSelectedMissionForDetails(null)}
                className="text-stone-400 hover:text-stone-200 border border-white/10 px-3 py-2 rounded-xl text-xs"
              >
                DISMISS
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-xs">
            <div className="bg-black/30 border border-white/8 rounded-xl p-3">
              <span className="text-[8px] text-stone-500 uppercase font-black">MISSION OBJECTIVE</span>
              <p className="text-[11px] text-stone-300 mt-1 font-sans leading-relaxed">{selectedMissionForDetails.objective}</p>
            </div>

            <div className="bg-black/30 border border-white/8 rounded-xl p-3">
              <span className="text-[8px] text-stone-500 uppercase font-black">HISTORICAL EVALUATION</span>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                <div className="border border-white/8 rounded-lg p-1.5 bg-black/20">
                  <div className="text-[7px] text-stone-400">SUCCESS</div>
                  <div className="text-sm font-black text-amber-400">{selectedMissionForDetails.successRate}%</div>
                </div>
                <div className="border border-white/8 rounded-lg p-1.5 bg-black/20">
                  <div className="text-[7px] text-stone-400">TACTICAL</div>
                  <div className="text-sm font-black text-sky-400">{selectedMissionForDetails.tacticalEfficiency}%</div>
                </div>
                <div className="border border-white/8 rounded-lg p-1.5 bg-black/20">
                  <div className="text-[7px] text-stone-400">STEALTH</div>
                  <div className="text-sm font-black text-emerald-400">{selectedMissionForDetails.stealthRating}%</div>
                </div>
              </div>
            </div>

            <div className="bg-black/30 border border-white/8 rounded-xl p-3">
              <span className="text-[8px] text-stone-500 uppercase font-black">OUTCOME STATUS</span>
              <div className="mt-1 text-emerald-300 font-black text-sm">{selectedMissionForDetails.outcome}</div>
              <div className="text-[9px] text-stone-400 mt-1">
                {selectedMissionForDetails.isLiveRun ? `Live Simulation Branch (${selectedMissionForDetails.turns || 5} recorded turns)` : "Archived EON Canonical Operation"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Historical Mission Explorer (All 25 Canonical + Player Missions) */}
      <div className="border-t border-white/8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <Film className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-black text-stone-200 uppercase tracking-wider">
              OPERATIVE MISSION TELEMETRY LOG ({dataset.length} MISSIONS)
            </h4>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search historical mission..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#101319] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        {/* Scrollable Missions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {dataset.map((mission) => (
            <div
              key={mission.id}
              onClick={() => {
                soundManager.playPaperRustle();
                setSelectedMissionForDetails(mission);
              }}
              className={`rounded-xl border p-3 cursor-pointer transition-all ${
                selectedMissionForDetails?.id === mission.id
                  ? "border-amber-500 bg-amber-950/20 shadow-md"
                  : "border-white/8 bg-[#15181f] hover:border-white/20 hover:bg-[#1a1e27]"
              }`}
            >
              <div className="flex items-center justify-between text-[9px] mb-1">
                <span className="text-amber-400 font-bold uppercase">{mission.codename}</span>
                <span className={`px-1.5 py-0.5 rounded font-black ${
                  mission.isLiveRun ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60" : "text-stone-500"
                }`}>
                  {mission.isLiveRun ? "LIVE RUN" : mission.date}
                </span>
              </div>

              <div className="text-xs font-bold text-stone-200 line-clamp-1">
                {mission.operationName}
              </div>

              <div className="text-[10px] text-stone-400 truncate mt-0.5 font-sans">
                {mission.location}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/6 text-[9px]">
                <span className="text-stone-400">{mission.actor}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-stone-500">SCORE:</span>
                  <span className="text-amber-300 font-black">{mission.successRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
