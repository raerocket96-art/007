import { ConfigurableItem } from "../types";

export const INITIAL_CONFIGURABLE_EQUIPMENT: ConfigurableItem[] = [
  {
    id: "cfg-ppk",
    equipmentRecordId: "eq-ppk",
    name: "Walther PPK/S 9mm (Biometric Sidearm)",
    designation: "Q-ARM-901-BIO",
    category: "FIREARMS",
    baseStealth: 65,
    baseTactical: 70,
    baseRisk: 10,
    baseWeightKg: 0.59,
    qCautionNote: "Pay attention, 007. The palm sensor is coded exclusively to your epidermal signature. If an adversary attempts to draw it, it will lock the firing pin and emit a tracking pulse. Do try not to drop it in the mud.",
    schematicType: "weapon",
    imageUrl: "https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80",
    slots: [
      {
        slotId: "muzzle",
        slotName: "Barrel & Muzzle Assembly",
        description: "Acoustic signature dampening or velocity compensation",
        selectedOptionId: "opt-suppressor",
        options: [
          {
            id: "opt-suppressor",
            name: "Q-Spec Titanium Sound Suppressor",
            description: "Acoustic baffled suppressor reducing muzzle flash and report by 38dB.",
            stealthModifier: 30,
            tacticalModifier: -5,
            riskModifier: -5,
            weightDeltaKg: 0.18,
            tacticalActionUnlock: "[SUPPRESSED PPK] Silently dispatch sentry with zero audible acoustic signature."
          },
          {
            id: "opt-compensator",
            name: "Ported High-Velocity Match Compensator",
            description: "Directs propellant gasses upward to eliminate muzzle climb during rapid double-taps.",
            stealthModifier: -20,
            tacticalModifier: 25,
            riskModifier: 5,
            weightDeltaKg: 0.12,
            tacticalActionUnlock: "[COMPENSATED PPK] Rapid double-tap hostile combatants with match-grade accuracy."
          },
          {
            id: "opt-standard-barrel",
            name: "Concealed Factory Snub Barrel",
            description: "Standard ultra-compact profile for seamless tuxedo jacket concealment.",
            stealthModifier: 10,
            tacticalModifier: 0,
            riskModifier: 0,
            weightDeltaKg: 0.0
          }
        ]
      },
      {
        slotId: "ammunition",
        slotName: "Ammunition Specification",
        description: "Calibre payload tailored for target tactical posture",
        selectedOptionId: "opt-subsonic",
        options: [
          {
            id: "opt-subsonic",
            name: "9mm Subsonic Expanding Hollow-Point",
            description: "Prevents supersonic crack; ensures maximum stopping power without penetration risk.",
            stealthModifier: 15,
            tacticalModifier: 10,
            riskModifier: 0,
            weightDeltaKg: 0.0
          },
          {
            id: "opt-armorpiercing",
            name: "Tungsten-Core Armour-Piercing Rounds",
            description: "Hardened tungsten penetrator capable of punching through Kevlar vests and engine blocks.",
            stealthModifier: -10,
            tacticalModifier: 30,
            riskModifier: 10,
            weightDeltaKg: 0.05,
            tacticalActionUnlock: "[TUNGSTEN ROUNDS] Shoot through reinforced ballistic barrier and incapacitate target."
          },
          {
            id: "opt-tracker-ammo",
            name: "Micro-Transponder Tagging Rounds",
            description: "Fires non-lethal subsonic dart containing satellite RFID beacon.",
            stealthModifier: 20,
            tacticalModifier: -15,
            riskModifier: -5,
            weightDeltaKg: 0.0,
            tacticalActionUnlock: "[TRACKER ROUND] Plant covert satellite RFID beacon onto escaping syndicate vehicle."
          }
        ]
      },
      {
        slotId: "optics",
        slotName: "Sighting & Target Acquisition",
        description: "Day/night targeting assistance",
        selectedOptionId: "opt-laser-sight",
        options: [
          {
            id: "opt-laser-sight",
            name: "Infrared Micro-Laser (Visible on HUD)",
            description: "Coded 850nm infrared laser dot visible only through polarized tactical spectacles.",
            stealthModifier: 10,
            tacticalModifier: 20,
            riskModifier: 0,
            weightDeltaKg: 0.04
          },
          {
            id: "opt-tritium",
            name: "Luminescent Tritium 3-Dot Night Sights",
            description: "Self-illuminating green radioactive phosphor sights requiring no battery power.",
            stealthModifier: 5,
            tacticalModifier: 10,
            riskModifier: 0,
            weightDeltaKg: 0.01
          }
        ]
      }
    ]
  },
  {
    id: "cfg-omega",
    equipmentRecordId: "eq-omega",
    name: "Omega Seamaster Diver 300M (Laser Chronometer)",
    designation: "Q-CHRONO-300-LSR",
    category: "WEARABLE",
    baseStealth: 85,
    baseTactical: 60,
    baseRisk: 15,
    baseWeightKg: 0.14,
    qCautionNote: "The bezel is geared to a high-density gallium arsenide diode. It will burn through a steel bulkhead or an ankle shackle in seconds. It also tells the time with commendable precision.",
    schematicType: "timepiece",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    slots: [
      {
        slotId: "bezel-emitter",
        slotName: "Rotary Bezel Module",
        description: "Primary tactical emission hardware",
        selectedOptionId: "opt-laser-cutter",
        options: [
          {
            id: "opt-laser-cutter",
            name: "1064nm Continuous Cutting Laser",
            description: "Burns through 15mm tempered steel plate, vault locks, or steel anchor cables.",
            stealthModifier: 10,
            tacticalModifier: 25,
            riskModifier: 15,
            weightDeltaKg: 0.02,
            tacticalActionUnlock: "[OMEGA LASER] Burn through reinforced steel hatch locking mechanism in 8 seconds."
          },
          {
            id: "opt-emp-bezel",
            name: "Directional Micro-EMP Capacitor",
            description: "Emits high-intensity electromagnetic pulse disabling cameras, alarms, and digital scanners within 6m.",
            stealthModifier: 35,
            tacticalModifier: 15,
            riskModifier: 5,
            weightDeltaKg: 0.01,
            tacticalActionUnlock: "[DIRECTIONAL EMP] Discharge watch EMP to black out room surveillance cameras and magnetic door locks."
          },
          {
            id: "opt-grapple-wire",
            name: "High-Tensile Micro-Grapple Cable",
            description: "Fires 15m of ultra-fine Spectra monofilament with magnetic anchor for rapid vertical egress.",
            stealthModifier: 25,
            tacticalModifier: 20,
            riskModifier: 10,
            weightDeltaKg: 0.03,
            tacticalActionUnlock: "[OMEGA GRAPPLE] Fire monofilament wire to hoist operative upward into ventilation shaft."
          }
        ]
      },
      {
        slotId: "detonator-valve",
        slotName: "Helium Valve Auxiliary",
        description: "Secondary concealed tactical trigger",
        selectedOptionId: "opt-remote-det",
        options: [
          {
            id: "opt-remote-det",
            name: "Encrypted Radio Frequency C4 Detonator",
            description: "Rotating the helium valve initiates an encrypted radio sequence to detonate plastic charges.",
            stealthModifier: 5,
            tacticalModifier: 30,
            riskModifier: 20,
            weightDeltaKg: 0.0,
            tacticalActionUnlock: "[OMEGA DETONATOR] Remotely detonate planted explosive charge via watch valve."
          },
          {
            id: "opt-distress-beacon",
            name: "Sub-Audible Satellite SOS Uplink",
            description: "Dispatches covert SOS packet directly to Vauxhall Cross without local radio interception.",
            stealthModifier: 25,
            tacticalModifier: 5,
            riskModifier: -10,
            weightDeltaKg: 0.0
          }
        ]
      }
    ]
  },
  {
    id: "cfg-db5",
    equipmentRecordId: "veh-db5",
    name: "Aston Martin DB5 (Q-Branch Armoured Chassis)",
    designation: "Q-VEH-DB5-MK3",
    category: "VEHICLES",
    baseStealth: 40,
    baseTactical: 90,
    baseRisk: 25,
    baseWeightKg: 1450,
    qCautionNote: "Now 007, try to bring this one back in pristine condition. The revolving number plates alone required six weeks in the machine shop, and the ejector seat is strictly for uninvited passengers.",
    schematicType: "vehicle",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    slots: [
      {
        slotId: "defensive-system",
        slotName: "Rear Countermeasure Suite",
        description: "Active countermeasures against pursuit",
        selectedOptionId: "opt-oilslick",
        options: [
          {
            id: "opt-oilslick",
            name: "High-Pressure Oil Slick & Smoke Dispenser",
            description: "Coat the roadway in dense synthetic oil followed by thick smoke to send pursuing vehicles spinning.",
            stealthModifier: 15,
            tacticalModifier: 25,
            riskModifier: 5,
            weightDeltaKg: 15.0,
            tacticalActionUnlock: "[DB5 OIL SLICK] Dispense high-pressure oil slick to derail pursuing convoy off the mountain road."
          },
          {
            id: "opt-armor-plate",
            name: "Retractable Bulletproof Steel Rear Shield",
            description: "Hydraulically deploys a 10mm high-carbon ballistic steel plate over the rear windshield.",
            stealthModifier: -5,
            tacticalModifier: 30,
            riskModifier: -10,
            weightDeltaKg: 35.0,
            tacticalActionUnlock: "[DB5 REAR SHIELD] Raise ballistic steel shield to absorb heavy automatic fire from pursuers."
          }
        ]
      },
      {
        slotId: "offensive-system",
        slotName: "Front Armament",
        description: "Concealed frontal kinetic weapon systems",
        selectedOptionId: "opt-browning-guns",
        options: [
          {
            id: "opt-browning-guns",
            name: "Twin .303 Browning Machine Guns Behind Indicator Lights",
            description: "Hidden pneumatic solenoids pop open the front sidelights to unleash 600 rounds per minute.",
            stealthModifier: -25,
            tacticalModifier: 40,
            riskModifier: 20,
            weightDeltaKg: 40.0,
            tacticalActionUnlock: "[DB5 BROWNINGS] Pop front indicator lights and strafe hostile roadblocks with twin machine guns."
          },
          {
            id: "opt-tyre-slashers",
            name: "Extendable Wheel Hub Scythes (Tyre Slashers)",
            description: "Hardened steel blades extend 30cm outward from spinner hub to shred adjacent tyres.",
            stealthModifier: 5,
            tacticalModifier: 20,
            riskModifier: 15,
            weightDeltaKg: 10.0,
            tacticalActionUnlock: "[DB5 TYRE SCYTHES] Pull alongside hostile SUV and slice their left-side tyres with hub scythes."
          }
        ]
      },
      {
        slotId: "cabin-special",
        slotName: "Interior Cabin Modifications",
        description: "Specialized passenger and cabin equipment",
        selectedOptionId: "opt-ejector-seat",
        options: [
          {
            id: "opt-ejector-seat",
            name: "Pneumatic Passenger Ejector Seat",
            description: "Gearstick button releases the roof hatch and fires the passenger seat 15 metres into the air.",
            stealthModifier: -10,
            tacticalModifier: 25,
            riskModifier: 15,
            weightDeltaKg: 20.0,
            tacticalActionUnlock: "[DB5 EJECTOR SEAT] Press red gearstick button to eject hostile gunman through the roof hatch."
          },
          {
            id: "opt-comms-suite",
            name: "GCHQ High-Frequency Encrypted Radar & Teleprinter",
            description: "Concealed beneath the walnut dashboard with direct global satellite intercept telemetry.",
            stealthModifier: 20,
            tacticalModifier: 15,
            riskModifier: -5,
            weightDeltaKg: 12.0
          }
        ]
      }
    ]
  },
  {
    id: "cfg-rebreather",
    equipmentRecordId: "eq-rebreather",
    name: "Micro-Submersible Breathing Capsule MK IV",
    designation: "Q-MED-OXY-03",
    category: "SURVEILLANCE",
    baseStealth: 90,
    baseTactical: 45,
    baseRisk: 5,
    baseWeightKg: 0.28,
    qCautionNote: "The solid oxygen transformation creates zero visible bubbles in the water. Remember: it gives four minutes of air. Check your watch; we don't supply gills.",
    schematicType: "gadget",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
    slots: [
      {
        slotId: "catalytic-cell",
        slotName: "Oxygen Scrubber & Salt Cell",
        description: "Chemical duration and capacity",
        selectedOptionId: "opt-salt-standard",
        options: [
          {
            id: "opt-salt-standard",
            name: "Standard 4-Minute Catalytic Salt Chamber",
            description: "Ultra-compact profile fitting comfortably in a waistcoat pocket.",
            stealthModifier: 20,
            tacticalModifier: 5,
            riskModifier: 0,
            weightDeltaKg: 0.0,
            tacticalActionUnlock: "[REBREATHER INSERT] Infiltrate hostile docklands undetected via deep underwater channel."
          },
          {
            id: "opt-salt-extended",
            name: "Dual-Chamber 8-Minute Extended Dive Cell",
            description: "Secondary chemical stage for deeper harbour and hull inspections.",
            stealthModifier: 25,
            tacticalModifier: 15,
            riskModifier: 5,
            weightDeltaKg: 0.15,
            tacticalActionUnlock: "[EXTENDED DIVE] Swim beneath target barge hull and plant magnetic charges on the keel."
          }
        ]
      }
    ]
  },
  {
    id: "cfg-pen",
    equipmentRecordId: "eq-pen",
    name: "Parker Jotter Acid & EMP Fountain Pen",
    designation: "Q-DEV-PEN-44",
    category: "BREACHING",
    baseStealth: 80,
    baseTactical: 65,
    baseRisk: 30,
    baseWeightKg: 0.06,
    qCautionNote: "Three clicks arms the four-second fuse. Four clicks disarms it. Do not mix those up, 007, or you will find yourself writing in the clouds.",
    schematicType: "gadget",
    imageUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80",
    slots: [
      {
        slotId: "payload",
        slotName: "Chemical / Explosive Core",
        description: "Internal reservoir payload",
        selectedOptionId: "opt-pen-c4",
        options: [
          {
            id: "opt-pen-c4",
            name: "Class 4 Plastic Explosive Pellet",
            description: "Sufficient concentrated explosive force to breach bank vault hinges or blast steel doors.",
            stealthModifier: -15,
            tacticalModifier: 35,
            riskModifier: 25,
            weightDeltaKg: 0.02,
            tacticalActionUnlock: "[JOTTER EXPLOSIVE] Arm Class-4 pen grenade and wedge into the reinforced blast door hinges."
          },
          {
            id: "opt-pen-acid",
            name: "Pressurized Aqua Regia Acid Capsule",
            description: "Corrosive chemical spray that dissolves lock tumblers and metal grilles without sound or smoke.",
            stealthModifier: 30,
            tacticalModifier: 15,
            riskModifier: 5,
            weightDeltaKg: 0.01,
            tacticalActionUnlock: "[ACID PEN] Dissolve steel lock tumblers with aqua regia spray for silent egress."
          }
        ]
      }
    ]
  },
  {
    id: "cfg-spectacles",
    equipmentRecordId: "eq-glasses",
    name: "Polarized X-Ray Surveillance Spectacles",
    designation: "Q-OPTIC-XRAY-12",
    category: "SURVEILLANCE",
    baseStealth: 85,
    baseTactical: 50,
    baseRisk: 5,
    baseWeightKg: 0.04,
    qCautionNote: "The terahertz polarization reveals concealed weapons under evening dress. Touch the right hinge for thermal mode. Try not to stare too intently at the roulette table.",
    schematicType: "gadget",
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80",
    slots: [
      {
        slotId: "sensor-filter",
        slotName: "Optical Detection Filter",
        description: "Sensor frequency spectrum",
        selectedOptionId: "opt-optic-xray",
        options: [
          {
            id: "opt-optic-xray",
            name: "Terahertz Weapon Concealment Scanner",
            description: "Displays metallic and ceramic firearm outlines under clothing in high-contrast cyan.",
            stealthModifier: 25,
            tacticalModifier: 20,
            riskModifier: 0,
            weightDeltaKg: 0.0,
            tacticalActionUnlock: "[X-RAY SPECTACLES] Scan casino security to locate armed bodyguards and concealed triggers."
          },
          {
            id: "opt-optic-thermal",
            name: "Infrared Thermal & Residual Heat Sensor",
            description: "Reveals human body heat through walls and shows recently pressed keypad numbers by thermal residue.",
            stealthModifier: 30,
            tacticalModifier: 15,
            riskModifier: 0,
            weightDeltaKg: 0.0,
            tacticalActionUnlock: "[THERMAL SPECTACLES] Read keypad lock combination via residual fingertip heat signatures."
          }
        ]
      }
    ]
  }
];

export function calculateLoadoutMetrics(items: ConfigurableItem[]) {
  let totalStealth = 0;
  let totalTactical = 0;
  let totalRisk = 0;
  let totalWeight = 0;
  const unlockedActions: string[] = [];

  for (const item of items) {
    let itemStealth = item.baseStealth;
    let itemTactical = item.baseTactical;
    let itemRisk = item.baseRisk;
    let itemWeight = item.baseWeightKg;

    for (const slot of item.slots) {
      const selected = slot.options.find(o => o.id === slot.selectedOptionId);
      if (selected) {
        itemStealth += selected.stealthModifier;
        itemTactical += selected.tacticalModifier;
        itemRisk += selected.riskModifier;
        itemWeight += selected.weightDeltaKg;
        if (selected.tacticalActionUnlock) {
          unlockedActions.push(selected.tacticalActionUnlock);
        }
      }
    }

    totalStealth += itemStealth;
    totalTactical += itemTactical;
    totalRisk += itemRisk;
    totalWeight += itemWeight;
  }

  const count = Math.max(1, items.length);
  return {
    overallStealth: Math.min(100, Math.max(10, Math.round(totalStealth / count))),
    overallTactical: Math.min(100, Math.max(10, Math.round(totalTactical / count))),
    overallRisk: Math.min(100, Math.max(5, Math.round(totalRisk / count))),
    overallWeightKg: Number(totalWeight.toFixed(2)),
    unlockedActions
  };
}
