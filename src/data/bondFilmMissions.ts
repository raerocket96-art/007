import type { MissionTemplate } from "./missions";

type FilmMissionSeed = {
  id: string;
  title: string;
  year: number;
  threatLevel: MissionTemplate["threatLevel"];
  location: string;
  objective: string;
  initialSituation: string;
  partner?: { id: string; name: string; role: string };
  equipment: string[];
  vehicle?: string;
  legacy?: boolean;
};

const bondFilmSeeds: FilmMissionSeed[] = [
  {
    id: "dr-no",
    title: "Dr. No",
    year: 1962,
    threatLevel: "SEVERE",
    location: "Kingston / Crab Key, Jamaica",
    objective: "Investigate the disappearance of Station J personnel and stop interference with an American launch from Cape Canaveral.",
    initialSituation: "The Jamaica station has gone silent after the murder of its local chief. A trail involving suspicious mineral shipments, radio direction-finding and a heavily guarded private island points toward Crab Key and the reclusive Dr. No.",
    partner: { id: "pers-leiter", name: "Felix Leiter (CIA)", role: "Allied Station Support" },
    equipment: ["eq-ppk", "eq-camera", "eq-beacon", "eq-cyanide"],
  },
  {
    id: "from-russia-with-love",
    title: "From Russia with Love",
    year: 1963,
    threatLevel: "CRITICAL",
    location: "Istanbul / Orient Express / Venice",
    objective: "Secure a Soviet Lektor cipher machine and extract the defector offering it while identifying the trap around the operation.",
    initialSituation: "A Soviet clerk in Istanbul has offered to defect with a Lektor decoder, but the offer arrives with almost no reliable corroboration. Station T suspects hostile manipulation, yet London authorizes the operation because the prize could transform signals intelligence.",
    equipment: ["eq-ppk", "eq-camera", "eq-cyanide", "eq-beacon"],
  },
  {
    id: "goldfinger",
    title: "Goldfinger",
    year: 1964,
    threatLevel: "CRITICAL",
    location: "Miami / Switzerland / Kentucky",
    objective: "Determine Auric Goldfinger's smuggling network and prevent an attack designed to contaminate the United States gold reserve at Fort Knox.",
    initialSituation: "Treasury intelligence has linked industrialist Auric Goldfinger to large-scale bullion smuggling. Surveillance of his movements reveals unusual logistics around a Kentucky stud farm and a rapidly expanding private security force.",
    equipment: ["eq-ppk", "eq-beacon", "eq-grapple", "eq-camera"],
    vehicle: "veh-db5",
  },
  {
    id: "thunderball",
    title: "Thunderball",
    year: 1965,
    threatLevel: "CRITICAL",
    location: "Nassau / New Providence, Bahamas",
    objective: "Locate two stolen NATO nuclear weapons before SPECTRE's ransom deadline and identify the maritime recovery site.",
    initialSituation: "A Vulcan bomber carrying two nuclear weapons has vanished during a NATO exercise. SPECTRE claims responsibility and threatens mass destruction unless a vast ransom is paid. One lead points toward Nassau and a wealthy yacht owner with unusual underwater activity.",
    partner: { id: "pers-leiter", name: "Felix Leiter (CIA)", role: "Bahamas Joint Task Group" },
    equipment: ["eq-ppk", "eq-rebreather", "eq-camera", "eq-beacon"],
  },
  {
    id: "you-only-live-twice",
    title: "You Only Live Twice",
    year: 1967,
    threatLevel: "CRITICAL",
    location: "Tokyo / Kobe / volcanic island, Japan",
    objective: "Identify the force capturing American and Soviet spacecraft and prevent escalation into a superpower war.",
    initialSituation: "Manned spacecraft from both Cold War blocs are disappearing in orbit, with each side blaming the other. British tracking data indicates the hostile craft is landing somewhere in Japan, forcing 007 into a covert search before another launch triggers military retaliation.",
    equipment: ["eq-ppk", "eq-camera", "eq-grapple", "eq-cigarette"],
    vehicle: "veh-nellie",
  },
  {
    id: "on-her-majestys-secret-service",
    title: "On Her Majesty's Secret Service",
    year: 1969,
    threatLevel: "CRITICAL",
    location: "Bern / Piz Gloria, Swiss Alps",
    objective: "Infiltrate Blofeld's alpine research institute and stop a biological warfare programme targeting global agriculture.",
    initialSituation: "A genealogical cover provides rare access to Ernst Stavro Blofeld, now operating from a remote mountaintop clinic. The patients appear harmless, but intercepted material suggests hypnosis, covert distribution channels and a biological payload hidden inside agricultural products.",
    equipment: ["eq-ppk", "eq-camera", "eq-beacon", "eq-grapple"],
  },
  {
    id: "diamonds-are-forever",
    title: "Diamonds Are Forever",
    year: 1971,
    threatLevel: "SEVERE",
    location: "Amsterdam / Las Vegas / Baja California",
    objective: "Trace a diamond-smuggling pipeline and prevent the stones being used in a satellite-based directed-energy weapon.",
    initialSituation: "A surge in stolen South African diamonds is bypassing normal criminal resale channels. MI6 believes the stones are being accumulated for a technical project, with couriers moving through Amsterdam toward an eccentric Las Vegas industrial empire.",
    equipment: ["eq-ppk", "eq-camera", "eq-decoder", "eq-beacon"],
  },
  {
    id: "live-and-let-die",
    title: "Live and Let Die",
    year: 1973,
    threatLevel: "SEVERE",
    location: "New York / New Orleans / San Monique",
    objective: "Investigate the linked murders of three British agents and disrupt a heroin-distribution operation using diplomatic and criminal fronts.",
    initialSituation: "Three MI6 personnel monitoring the same political figure are killed within hours of one another. The common thread runs from Harlem to New Orleans and the Caribbean island of San Monique, where vast poppy fields are hidden from conventional surveillance.",
    partner: { id: "pers-leiter", name: "Felix Leiter (CIA)", role: "US Joint Operations" },
    equipment: ["eq-ppk", "eq-camera", "eq-beacon", "eq-grapple"],
  },
  {
    id: "the-man-with-the-golden-gun",
    title: "The Man with the Golden Gun",
    year: 1974,
    threatLevel: "SEVERE",
    location: "Beirut / Hong Kong / Macau / Thai islands",
    objective: "Locate Francisco Scaramanga, determine why 007 appears to be targeted, and recover the Solex solar-energy converter.",
    initialSituation: "A golden bullet engraved with 007's service number arrives at MI6 while a British scientist connected to solar-energy research is missing. The trail converges on elite assassin Francisco Scaramanga and an energy device with strategic implications.",
    equipment: ["eq-ppk", "eq-camera", "eq-beacon", "eq-decoder"],
  },
  {
    id: "the-spy-who-loved-me",
    title: "The Spy Who Loved Me",
    year: 1977,
    threatLevel: "CRITICAL",
    location: "Cairo / Sardinia / Mediterranean Sea",
    objective: "Recover submarine tracking technology and stop a plan to launch captured nuclear missiles against major cities.",
    initialSituation: "British and Soviet ballistic-missile submarines have vanished without distress calls. A stolen tracking system appears on the black market in Egypt, forcing MI6 and the KGB into an uneasy joint operation against shipping magnate Karl Stromberg.",
    equipment: ["eq-ppk", "eq-rebreather", "eq-camera", "eq-grapple"],
    vehicle: "veh-lotus",
  },
  {
    id: "moonraker",
    title: "Moonraker",
    year: 1979,
    threatLevel: "CRITICAL",
    location: "California / Venice / Rio de Janeiro / Amazon / orbit",
    objective: "Investigate the disappearance of a Moonraker shuttle and prevent a biological attack launched from an orbital station.",
    initialSituation: "A space shuttle on loan to the United Kingdom disappears during transport, yet its manufacturer appears strangely unconcerned. Laboratory evidence points from California to Venice and eventually toward a hidden aerospace launch programme in the Amazon.",
    equipment: ["eq-ppk", "eq-camera", "eq-wristcutter", "eq-grapple"],
  },
  {
    id: "for-your-eyes-only",
    title: "For Your Eyes Only",
    year: 1981,
    threatLevel: "SEVERE",
    location: "Madrid / Cortina / Corfu / Aegean Sea",
    objective: "Recover the ATAC command system from a sunken British vessel before it can be sold to Soviet intelligence.",
    initialSituation: "A British electronic-surveillance ship has sunk in the Ionian Sea with its ATAC submarine-command unit aboard. Competing salvage teams, assassinations and a deceptive patron make it unclear which local network is working for Moscow.",
    equipment: ["eq-ppk", "eq-rebreather", "eq-camera", "eq-beacon"],
  },
  {
    id: "octopussy",
    title: "Octopussy",
    year: 1983,
    threatLevel: "CRITICAL",
    location: "Delhi / Udaipur / East Germany / West Germany",
    objective: "Trace a Fabergé-egg smuggling network and prevent a rogue Soviet general from detonating a nuclear weapon at a NATO airbase.",
    initialSituation: "Agent 009 dies carrying a counterfeit Fabergé egg. The auction trail points to exiled Afghan prince Kamal Khan, a travelling circus and General Orlov, whose military ambitions could fracture NATO if a nuclear explosion is made to appear accidental.",
    equipment: ["eq-ppk", "eq-pen", "eq-camera", "eq-beacon"],
  },
  {
    id: "a-view-to-a-kill",
    title: "A View to a Kill",
    year: 1985,
    threatLevel: "CRITICAL",
    location: "Paris / Chantilly / San Francisco / Silicon Valley",
    objective: "Investigate Max Zorin's microchip operation and stop the deliberate flooding of Silicon Valley.",
    initialSituation: "A supposedly Soviet-manufactured microchip recovered from a dead agent is resistant to electromagnetic pulse damage and matches technology produced by Zorin Industries. Racing interests and unusual geological purchases lead toward a much larger plan beneath California.",
    equipment: ["eq-ppk", "eq-camera", "eq-decoder", "eq-beacon"],
  },
  {
    id: "the-living-daylights",
    title: "The Living Daylights",
    year: 1987,
    threatLevel: "SEVERE",
    location: "Bratislava / Vienna / Tangier / Afghanistan",
    objective: "Protect a Soviet defector, expose the deception surrounding his extraction, and dismantle an arms-for-opium financing scheme.",
    initialSituation: "General Georgi Koskov defects during a concert in Bratislava, claiming the KGB has revived a policy of assassinating Western spies. His story quickly develops inconsistencies, while cellist Kara Milovy and arms dealer Brad Whitaker become central to the case.",
    equipment: ["eq-ppk", "eq-keyfob", "eq-camera", "eq-beacon"],
    vehicle: "veh-valhalla",
  },
  {
    id: "licence-to-kill",
    title: "Licence to Kill",
    year: 1989,
    threatLevel: "CRITICAL",
    location: "Florida Keys / Isthmus City",
    objective: "Penetrate Franz Sanchez's narcotics empire, fracture his organization from within, and identify compromised officials assisting him.",
    initialSituation: "Drug lord Franz Sanchez escapes federal custody and retaliates brutally against Felix Leiter. Bond is ordered away from the matter, but the scale of corruption around Sanchez's organization suggests a broader intelligence threat that normal channels cannot penetrate.",
    partner: { id: "pers-q", name: "Q", role: "Unofficial Field Quartermaster" },
    equipment: ["eq-ppk", "eq-camera", "eq-cufflinks", "eq-beacon"],
  },
  {
    id: "goldeneye",
    title: "GoldenEye",
    year: 1995,
    threatLevel: "CRITICAL",
    location: "Monte Carlo / Severnaya / St. Petersburg / Cuba",
    objective: "Recover control of the GoldenEye orbital EMP system and stop Janus from using it against London.",
    initialSituation: "A stolen Tiger helicopter appears at Severnaya shortly before an orbital electromagnetic weapon destroys the Russian station. The surviving programmer Natalya Simonova is missing, and evidence points toward the Janus crime syndicate and a connection to 007's past.",
    equipment: ["eq-ppk", "eq-omega", "eq-grapple", "eq-camera"],
    vehicle: "veh-db5",
  },
  {
    id: "tomorrow-never-dies",
    title: "Tomorrow Never Dies",
    year: 1997,
    threatLevel: "CRITICAL",
    location: "Hamburg / South China Sea / Saigon",
    objective: "Prove that media tycoon Elliot Carver engineered a naval confrontation and prevent him from provoking war between Britain and China.",
    initialSituation: "HMS Devonshire is sunk in contested waters after receiving falsified navigation data. Carver Media Group publishes suspiciously detailed reports before official channels can respond, indicating foreknowledge of a manufactured international crisis.",
    partner: { id: "pers-wailin", name: "Colonel Wai Lin (MSS)", role: "Chinese Intelligence Liaison" },
    equipment: ["eq-ppk", "eq-camera", "eq-decoder", "eq-grapple"],
    vehicle: "veh-bmw",
  },
  {
    id: "the-world-is-not-enough",
    title: "The World Is Not Enough",
    year: 1999,
    threatLevel: "CRITICAL",
    location: "Bilbao / London / Baku / Kazakhstan / Istanbul",
    objective: "Protect Elektra King, identify Renard's true objective, and prevent a nuclear incident designed to reshape Caspian energy routes.",
    initialSituation: "An oil magnate is assassinated inside MI6 after recovered funds conceal an explosive device. His daughter Elektra inherits a strategically vital pipeline while terrorist Renard, whose injuries make him unusually dangerous, re-emerges near former Soviet nuclear facilities.",
    equipment: ["eq-ppk", "eq-camera", "eq-cufflinks", "eq-beacon"],
    vehicle: "veh-qboat",
  },
  {
    id: "die-another-day",
    title: "Die Another Day",
    year: 2002,
    threatLevel: "CRITICAL",
    location: "North Korea / Hong Kong / Cuba / Iceland",
    objective: "Identify the leak that compromised 007, expose Gustav Graves's true identity, and neutralize the Icarus orbital weapon.",
    initialSituation: "After fourteen months in North Korean captivity, Bond is exchanged and immediately suspected of having leaked intelligence under interrogation. A trail from Cuba to a newly wealthy industrialist in Iceland suggests the original target survived under a manufactured identity.",
    equipment: ["eq-ppk", "eq-omega", "eq-glasses", "eq-grapple"],
    vehicle: "veh-valhalla",
  },
  {
    id: "casino-royale-2006",
    title: "Casino Royale",
    year: 2006,
    threatLevel: "CRITICAL",
    location: "Madagascar / Bahamas / Miami / Montenegro / Venice",
    objective: "Bankrupt terror financier Le Chiffre at Casino Royale and force him to seek British protection in exchange for intelligence.",
    initialSituation: "Newly promoted 00 agent James Bond disrupts an aircraft sabotage operation financed through Le Chiffre. The failed investment leaves the banker exposed to violent clients, driving him into a high-stakes poker tournament in Montenegro to recover their money.",
    partner: { id: "pers-vesper", name: "Vesper Lynd (HM Treasury)", role: "Treasury Financial Controller" },
    equipment: ["eq-ppk", "eq-camera", "eq-beacon", "eq-decoder"],
    vehicle: "veh-dbs",
  },
  {
    id: "quantum-of-solace",
    title: "Quantum of Solace",
    year: 2008,
    threatLevel: "SEVERE",
    location: "Siena / Haiti / Bregenz / Bolivia",
    objective: "Map the Quantum network and stop Dominic Greene from seizing control of Bolivia's strategic water supply.",
    initialSituation: "Interrogation of Mr. White reveals that a previously unknown organization has penetrated British institutions. A compromised protection officer turns the investigation into a global chase that ultimately converges on environmental businessman Dominic Greene.",
    equipment: ["eq-ppk", "eq-camera", "eq-beacon", "eq-decoder"],
  },
  {
    id: "skyfall",
    title: "Skyfall",
    year: 2012,
    threatLevel: "CRITICAL",
    location: "Istanbul / Shanghai / Macau / London / Scotland",
    objective: "Recover compromised undercover identities, identify the attacker targeting MI6, and protect M from a personal assassination campaign.",
    initialSituation: "A hard drive containing NATO undercover identities is stolen in Istanbul. Soon afterward MI6 suffers a catastrophic cyberattack, and classified names begin appearing online. The attacker demonstrates detailed knowledge of SIS procedures and M's past.",
    equipment: ["eq-ppk", "eq-beacon", "eq-camera", "eq-grapple"],
    vehicle: "veh-db5",
  },
  {
    id: "spectre",
    title: "Spectre",
    year: 2015,
    threatLevel: "CRITICAL",
    location: "Mexico City / Rome / Austria / Tangier / London",
    objective: "Identify the organization connecting recent adversaries and prevent its leadership from taking control of a global surveillance network.",
    initialSituation: "A posthumous instruction from the former M sends Bond to Mexico City without authorization. The target's funeral leads to a clandestine meeting in Rome and evidence that multiple past operations were connected by a single organization known as SPECTRE.",
    equipment: ["eq-ppk", "eq-omega", "eq-camera", "eq-grapple"],
    vehicle: "veh-valhalla",
  },
  {
    id: "no-time-to-die",
    title: "No Time to Die",
    year: 2021,
    threatLevel: "CRITICAL",
    location: "Matera / Jamaica / Cuba / London / Norway / disputed island base",
    objective: "Recover control of the Heracles nanobot weapon and prevent Lyutsifer Safin from deploying it against targeted populations.",
    initialSituation: "Years after leaving active service, Bond is approached in Jamaica after a scientist connected to a secret biological-weapons programme is abducted. The weapon can be programmed against genetic profiles, while old SPECTRE networks and Safin's private force compete for control.",
    partner: { id: "pers-leiter", name: "Felix Leiter (CIA)", role: "CIA Joint Mission Contact" },
    equipment: ["eq-ppk", "eq-omega", "eq-camera", "eq-grapple"],
    vehicle: "veh-db5",
  },
  {
    id: "casino-royale-1967",
    title: "Casino Royale — Legacy / Non-EON",
    year: 1967,
    threatLevel: "SEVERE",
    location: "London / Scotland / Berlin / Casino Royale",
    objective: "Investigate SMERSH activity surrounding Casino Royale while coordinating an intentionally fragmented multi-agent operation.",
    initialSituation: "This archive file is classified as a non-EON legacy scenario. Multiple operatives are using the James Bond identity while an eccentric criminal plot develops around Casino Royale, making identity control and reliable command structure the central operational problem.",
    equipment: ["eq-ppk", "eq-camera", "eq-beacon", "eq-decoder"],
    legacy: true,
  },
  {
    id: "never-say-never-again",
    title: "Never Say Never Again — Legacy / Non-EON",
    year: 1983,
    threatLevel: "CRITICAL",
    location: "London / Bahamas / Monaco / North Africa",
    objective: "Recover stolen nuclear warheads from SPECTRE and stop their use in an international extortion operation.",
    initialSituation: "This archive file is classified as a non-EON legacy scenario. Two nuclear warheads are diverted during a NATO exercise, and SPECTRE demands payment under threat of detonation. Intelligence points toward Nassau and the wealthy Maximillian Largo.",
    equipment: ["eq-ppk", "eq-camera", "eq-rebreather", "eq-beacon"],
    legacy: true,
  },
];

function makeStartingNodes(seed: FilmMissionSeed): MissionTemplate["startingNodes"] {
  if (seed.id === "octopussy") return [
    {
      id: "octopussy-watch-khan",
      text: "Watch Kamal Khan's Delhi contacts from a concealed position and identify who handles the Fabergé egg shipments before making contact.",
      actionType: "STEALTH",
      intelGained: "Khan's local contacts may link the counterfeit egg to a specific courier route."
    },
    {
      id: "octopussy-approach-dealer",
      text: "Approach a Delhi antiques dealer under an art buyer's cover and ask discreetly who can authenticate the counterfeit Fabergé egg.",
      actionType: "DIPLOMATIC",
      intelGained: "An antiques dealer may identify the workshop or intermediaries behind the forgery."
    },
    {
      id: "octopussy-compare-egg",
      text: "Use Q-Branch imaging to compare 009's counterfeit egg with auction records and trace the unusual materials in its construction.",
      actionType: "TACTICAL",
      intelGained: "A material discrepancy may reveal where the forgery entered the smuggling chain."
    },
    {
      id: "octopussy-intercept-courier",
      text: "Intercept a confirmed courier linked to Khan's operation and seize the shipping paperwork before the trail reaches the circus.",
      actionType: "AGGRESSIVE",
      intelGained: "Courier documents may reveal a cargo route, while the seizure risks alerting Khan."
    }
  ];
  const lead = seed.initialSituation.split(". ")[0];
  return [
    {
      id: `${seed.id}-stealth`,
      text: `Establish covert surveillance in ${seed.location.split(" / ")[0]}, avoid direct contact, and verify the first intelligence lead before exposing 007's presence.`,
      actionType: "STEALTH",
      intelGained: `${lead}. Surveillance may reveal which part of the briefing is genuine and which part is bait.`
    },
    {
      id: `${seed.id}-diplomatic`,
      text: `Use an official or social cover to approach a person connected to the operation, test their story, and obtain access without force.`,
      actionType: "DIPLOMATIC",
      intelGained: "Human-source reporting provides a new relationship lead, but the cover identity is now known to at least one participant."
    },
    {
      id: `${seed.id}-tactical`,
      text: `Exploit Q-Branch equipment to inspect the hostile network's communications, transport or security perimeter before committing to an assault.`,
      actionType: "TACTICAL",
      intelGained: "Technical collection exposes a weakness in the target's operating pattern and adds a time-sensitive opportunity."
    },
    {
      id: `${seed.id}-aggressive`,
      text: `Move directly against the nearest confirmed hostile element to seize documents, equipment or a prisoner before the network can relocate.`,
      actionType: "AGGRESSIVE",
      intelGained: "Immediate material is recovered, but hostile alert levels rise and later security will be reinforced."
    }
  ];
}

export const bondFilmMissionTemplates: MissionTemplate[] = bondFilmSeeds.map((seed) => ({
  id: `film-${seed.id}`,
  title: `${seed.title} (${seed.year})`,
  year: seed.year,
  codename: seed.legacy ? `LEGACY FILM FILE // ${seed.title.toUpperCase()}` : `FILM OPERATION // ${seed.title.toUpperCase()}`,
  threatLevel: seed.threatLevel,
  location: seed.location,
  objective: seed.objective,
  initialSituation: seed.initialSituation,
  availableAgents: [
    { id: "pers-007", name: "Commander James Bond (007)", role: seed.legacy ? "Legacy Scenario Lead" : "Primary Field Operative" },
    ...(seed.partner ? [seed.partner] : [])
  ],
  defaultAgentId: "pers-007",
  recommendedEquipment: seed.equipment,
  recommendedVehicle: seed.vehicle,
  startingNodes: makeStartingNodes(seed)
}));
