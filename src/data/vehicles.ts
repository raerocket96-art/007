import { VehicleRecord } from "../types";

export const initialVehicles: VehicleRecord[] = [
  {
    id: "veh-db5",
    type: "vehicles",
    referenceNumber: "SIS-VEH-001-DB5",
    name: "Aston Martin DB5 (1964 Silver Birch)",
    classification: "TOP SECRET",
    clearanceRequired: 8,
    lastUpdated: "2026-09-15T10:00:00Z",
    manufacturer: "Aston Martin Lagonda Ltd / Q-Branch Modified",
    model: "DB5 Vantage Coupe",
    registration: "BMT 216A (Revolving: 4711-EA-62, JB-007)",
    assignedAgent: "Commander James Bond, 007",
    armour: "Reinforced Kevlar & titanium composite panels; 45mm multi-layer bulletproof glass; retractable steel rear bullet-shield.",
    weapons: [
      "Twin Browning .303 machine guns concealed behind front indicator lenses",
      "Deployable rear tyre-slashers extending from wire-wheel knock-off spinners",
      "Rear bumper hydraulic oil-slick and smoke-screen dispersers",
      "Caltrop nail ejector beneath spare tyre well"
    ],
    defensiveSystems: [
      "Passenger ejector seat with roof panel release (red button beneath gear knob)",
      "Revolving French, Swiss, and UK registration plates",
      "Radar scanner screen integrated into dashboard radio aperture"
    ],
    specialModifications: [
      "Armrest weapons control console",
      "Under-seat weapon rack holding Walther sniper carbine and smoke grenades",
      "Encrypted VHF radio linking directly to M's Whitehall office"
    ],
    performance: {
      topSpeed: "145 mph (233 km/h)",
      acceleration: "0-60 mph in 7.1 seconds",
      engine: "4.0L All-Aluminium Inline-6 (325 bhp with Vantage triple Weber carbs)",
      range: "340 miles (547 km)"
    },
    missionAppearances: ["Operation Goldfinger", "Operation Thunderball", "Operation GoldenEye", "Operation Skyfall", "Operation Spectre"],
    damageHistory: [
      "Severely damaged during firefight at Skyfall Lodge (completely rebuilt by Q-Branch, 2015)",
      "Rear bumper impacted during Geneva mountain chase (1964)"
    ],
    status: "OPERATIONAL",
    imageUrl: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "veh-lotus",
    type: "vehicles",
    referenceNumber: "SIS-VEH-002-LOTUS",
    name: "Lotus Esprit S1 'Wet Nellie' (Submersible)",
    classification: "TOP SECRET",
    clearanceRequired: 8,
    lastUpdated: "2026-09-12T11:00:00Z",
    manufacturer: "Lotus Cars Ltd / Q-Branch Marine Division",
    model: "Esprit S1 Mid-Engine Coupe",
    registration: "PPW 306R",
    assignedAgent: "Commander James Bond, 007",
    armour: "Water-tight sealed fiberglass monocoque with ceramic ballast plates; hydro-pneumatic seal around wheel wells.",
    weapons: [
      "Vertical-launch anti-aircraft missile battery concealed in rear louvres",
      "Underwater harpoon launchers mounted in radiator intake",
      "Black dye and ink screen projector for underwater evasion",
      "Sub-surface depth charges dropped from rear axle bay"
    ],
    defensiveSystems: [
      "Full rudder and dive-plane hydro-fin conversion extending from wheel arches",
      "Four electric propeller propulsion pods replacing rear drive wheels",
      "Periscope display extending from interior roof console"
    ],
    specialModifications: [
      "Complete hermetic pressurization with 2-hour dual oxygen scrubbers",
      "Cement sprayer concealed in rear license plate for asphalt pursuit"
    ],
    performance: {
      topSpeed: "138 mph road / 12 knots underwater",
      acceleration: "0-60 mph in 6.8 seconds",
      engine: "2.0L 16-valve Lotus 907 Inline-4 + Dual Marine Electric Motors",
      range: "280 miles road / 45 nautical miles submerged"
    },
    missionAppearances: ["Operation The Spy Who Loved Me (Sardinia)", "Mediterranean Underwater Recon"],
    damageHistory: [
      "Sardinia pier plunge into Mediterranean (Intentional transition to submarine mode - Zero damage)"
    ],
    status: "STORAGE - CHELSEA BASIN",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "veh-dbs",
    type: "vehicles",
    referenceNumber: "SIS-VEH-003-DBS",
    name: "Aston Martin DBS V12",
    classification: "SECRET",
    clearanceRequired: 7,
    lastUpdated: "2026-09-10T14:30:00Z",
    manufacturer: "Aston Martin Lagonda Ltd",
    model: "DBS V12 Coupe",
    registration: "TT 378-20 / KV08 XRR",
    assignedAgent: "Commander James Bond, 007",
    armour: "Carbon-fiber composite bodywork; reinforced steel side-impact sills; shatterproof solar glass.",
    weapons: ["Concealed under-tray sound-suppressed Walther P99 mount with extended magazines"],
    defensiveSystems: [
      "Hidden glovebox emergency medical kit with automated external defibrillator",
      "Digitalis & organophosphate antidote injectors with satellite telemetry link to SIS medical staff",
      "Covert weapon drawer holding silenced Walther PPK and smoke grenades"
    ],
    specialModifications: [
      "Encrypted biometric ignition thumbprint scanner",
      "Active vehicle telemetry satellite beacon"
    ],
    performance: {
      topSpeed: "191 mph (307 km/h)",
      acceleration: "0-60 mph in 4.3 seconds",
      engine: "5.9L 48-valve V12 (510 bhp, 420 lb-ft torque)",
      range: "310 miles (499 km)"
    },
    missionAppearances: ["Operation Casino Royale (Montenegro)", "Operation Quantum of Solace (Siena quarry chase)"],
    damageHistory: [
      "Rolled seven times at 75 mph avoiding Vesper Lynd on road in Montenegro (World record barrel roll - Total loss)",
      "Driver door sheared off during Alfa Romeo pursuit in Italian quarry"
    ],
    status: "UNDER REPAIR",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "veh-qboat",
    type: "vehicles",
    referenceNumber: "SIS-VEH-004-QBOAT",
    name: "Q-Branch River Jet Hydrofoil ('Q-Boat')",
    classification: "SECRET",
    clearanceRequired: 7,
    lastUpdated: "2026-08-14T15:00:00Z",
    manufacturer: "Q-Branch Marine Skunkworks",
    model: "Custom Enclosed Jet Hydrofoil",
    registration: "SIS-MARINE-007",
    assignedAgent: "Used by 007 during Thames pursuit",
    armour: "Lightweight Kevlar-reinforced hull; bulletproof tinted canopy.",
    weapons: [
      "Twin bow-mounted forward torpedo launchers",
      "Rear jet wash capable of swamping pursuing motor launches",
      "Submersible dive capability for shallow bridge clearance"
    ],
    defensiveSystems: [
      "Deployable balance fins allowing 360-degree barrel rolls through water",
      "Emergency shore-skimming capability across dry land and muddy embankments"
    ],
    specialModifications: [
      "Steerable marine jet drive producing immense low-end thrust",
      "Direct VHF dispatch override to Thames River Police"
    ],
    performance: {
      topSpeed: "60 knots (111 km/h) on water",
      acceleration: "Instant jet impulse response",
      engine: "High-output marine gas turbine",
      range: "120 nautical miles"
    },
    missionAppearances: ["Operation The World Is Not Enough (River Thames to Millennium Dome)"],
    damageHistory: [
      "Landed atop Millennium Dome perimeter after clearing Thames flood barrier (Hull preserved at Q-Branch)"
    ],
    status: "STORAGE - CHELSEA BASIN",
    imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d17?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "veh-bmw",
    type: "vehicles",
    referenceNumber: "SIS-VEH-005-BMW",
    name: "BMW 750iL (Mobile Remote Control)",
    classification: "TOP SECRET",
    clearanceRequired: 8,
    lastUpdated: "2026-08-28T10:00:00Z",
    manufacturer: "BMW AG / Q-Branch Electronics",
    model: "750iL E38 Armoured Saloon",
    registration: "B-MT 2144 (Hamburg)",
    assignedAgent: "Commander James Bond, 007",
    armour: "Class B7 ballistic steel and ceramic armoring (withstands sledgehammer and high-velocity rifle fire); self-inflating run-flat tyres.",
    weapons: [
      "Sunroof-mounted twelve-tube micro-rocket launcher",
      "Rear bumper caltrop nail dispensers",
      "Under-chassis tear-gas dispensers"
    ],
    defensiveSystems: [
      "20,000V electric shock door handle defense system",
      "Steel-reinforced bumper cable-cutter that pops up through BMW roundel badge",
      "Remote drive control via Ericsson mobile phone touchpad"
    ],
    specialModifications: [
      "Full vehicular drive-by-wire system controlled entirely from handset",
      "Voice guidance synthesizer ('Please be careful, 007')"
    ],
    performance: {
      topSpeed: "155 mph (250 km/h limited)",
      acceleration: "0-60 mph in 6.4 seconds",
      engine: "5.4L M73 V12 (322 bhp)",
      range: "380 miles"
    },
    missionAppearances: ["Operation Tomorrow Never Dies (Hamburg Atlantic Hotel car park)"],
    damageHistory: [
      "Driven off roof of multi-story car park into an Avis rental station storefront (Complete loss)"
    ],
    status: "DESTROYED",
    imageUrl: "https://images.unsplash.com/photo-1555353540-64580b51c258?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "veh-jaguar",
    type: "vehicles",
    referenceNumber: "SIS-VEH-006-JAG",
    name: "Jaguar XKR Convertible (Hostile Counter-Vehicle)",
    classification: "SECRET",
    clearanceRequired: 7,
    lastUpdated: "2026-07-20T12:00:00Z",
    manufacturer: "Jaguar Cars / Customized by Zao (North Korean Rogue)",
    model: "XKR Supercharged",
    registration: "Unregistered (Ice Palace, Iceland)",
    assignedAgent: "Captured syndicate vehicle (Encountered by 007)",
    armour: "Heavy ballistic chassis plating; heated thermal windshield for Arctic combat.",
    weapons: [
      "Centrally mounted hydraulic Gatling gun behind passenger compartment",
      "Door-mounted missile batteries (18 heat-seeking rockets)",
      "Front grille mortar launchers",
      "Battering ram with deployable spiked ice drills"
    ],
    defensiveSystems: [
      "Rear infrared thermal jammer",
      "Deployable spiked snow tracks"
    ],
    specialModifications: ["Customized by North Korean weapons engineers for high-speed ice drift combat"],
    performance: {
      topSpeed: "155 mph (250 km/h)",
      acceleration: "0-60 mph in 5.2 seconds on ice",
      engine: "4.0L Supercharged V8 (370 bhp)",
      range: "260 miles"
    },
    missionAppearances: ["Operation Die Another Day (Iceland Ice Lake duel against Aston Martin V12 Vanquish)"],
    damageHistory: [
      "Fell into freezing Arctic lake waters after being rammed by 007's Vanquish"
    ],
    status: "DESTROYED",
    imageUrl: "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "veh-nellie",
    type: "vehicles",
    referenceNumber: "SIS-VEH-007-NELLIE",
    name: "Little Nellie (Wallis WA-116 Agile Autogyro)",
    classification: "TOP SECRET",
    clearanceRequired: 8,
    lastUpdated: "2026-08-01T08:00:00Z",
    manufacturer: "Ken Wallis / Q-Branch Lightweight Aircraft",
    model: "WA-116 Series 1 Autogyro",
    registration: "G-AVKW",
    assignedAgent: "Commander James Bond, 007 (Delivered in 4 suitcases by Q)",
    armour: "Open cockpit ultralight aluminium frame; Kevlar seat protection.",
    weapons: [
      "Twin forward-firing synchronized machine guns (tracer and armor-piercing)",
      "Twin rocket pods firing high-explosive unguided missiles",
      "Rear aerial air-to-air flame-thrower",
      "Rear parachute-retarded smoke canisters and floating air-mines"
    ],
    defensiveSystems: [
      "High agility tight turning radius (can out-manoeuvre conventional turbine helicopters)",
      "Foldable mast and rotor blades packing into 4 standard passenger suitcases"
    ],
    specialModifications: ["Radio transponder linked directly to Japanese Secret Service base"],
    performance: {
      topSpeed: "130 mph (209 km/h)",
      acceleration: "Takeoff roll under 30 metres",
      engine: "72 hp McCulloch 4318A 4-cylinder two-stroke",
      range: "140 miles (225 km)"
    },
    missionAppearances: ["Operation You Only Live Twice (Volcano crater aerial duel, Kyushu, Japan)"],
    damageHistory: [
      "Shrapnel from exploding SPECTRE turbine helicopter peppered tail rudder (Repaired)"
    ],
    status: "STORAGE - CHELSEA BASIN",
    imageUrl: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "veh-valhalla",
    type: "vehicles",
    referenceNumber: "SIS-VEH-008-VALHALLA",
    name: "Aston Martin Valhalla Hybrid Hypercar",
    classification: "TOP SECRET",
    clearanceRequired: 9,
    lastUpdated: "2026-09-15T01:00:00Z",
    manufacturer: "Aston Martin Lagonda Ltd / Q-Branch Advanced Propulsion",
    model: "Valhalla Mid-Engine Hybrid",
    registration: "SIS-PROTO-009",
    assignedAgent: "00-Section Tactical Deployment",
    armour: "Carbon-fiber monocoque passenger cell with integrated Kevlar splinter shield.",
    weapons: [
      "Pulsed EMP frequency emitters hidden in active front aero vents",
      "Deployable radar-absorbent body coating"
    ],
    defensiveSystems: [
      "Biometric start and satellite encrypted remote immobilizer",
      "Infrared stealth thermal suppression exhaust cooling"
    ],
    specialModifications: ["Electric-only silent creep mode for quiet perimeter approach"],
    performance: {
      topSpeed: "217 mph (349 km/h)",
      acceleration: "0-60 mph in 2.5 seconds",
      engine: "Twin-Turbo 4.0L V8 + Dual Electric Motors (937 bhp)",
      range: "350 miles"
    },
    missionAppearances: ["Operation Eclipse (Advanced trials, Wind Tunnel testing)"],
    damageHistory: ["Pristine test condition at Millbrook Proving Ground"],
    status: "OPERATIONAL",
    imageUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80"
  }
];
