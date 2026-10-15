import { initialPersonnel } from "./personnel";
import { initialOperations } from "./operations";
import { initialEquipment } from "./equipment";
import { initialVehicles } from "./vehicles";
import { initialLocations } from "./locations";
import { initialOrganizations } from "./organizations";
import { initialAssets } from "./assets";
import { initialCables } from "./cables";
import { missionTemplates } from "./missions";
import { DatabaseRecord } from "../types";

export {
  initialPersonnel,
  initialOperations,
  initialEquipment,
  initialVehicles,
  initialLocations,
  initialOrganizations,
  initialAssets,
  initialCables,
  missionTemplates
};

const STORAGE_KEY = "MI6_CLASSIFIED_ARCHIVE_DATA_V1";

export interface MI6DatabaseStore {
  personnel: typeof initialPersonnel;
  operations: typeof initialOperations;
  equipment: typeof initialEquipment;
  vehicles: typeof initialVehicles;
  locations: typeof initialLocations;
  organizations: typeof initialOrganizations;
  assets: typeof initialAssets;
  cables: typeof initialCables;
}

export const getStoredArchive = loadStoredArchive;

export function loadStoredArchive(): MI6DatabaseStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        Array.isArray(parsed.personnel) &&
        Array.isArray(parsed.operations) &&
        Array.isArray(parsed.equipment)
      ) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not load from localStorage, resetting to default archival records", e);
  }

  const defaultStore: MI6DatabaseStore = {
    personnel: initialPersonnel,
    operations: initialOperations,
    equipment: initialEquipment,
    vehicles: initialVehicles,
    locations: initialLocations,
    organizations: initialOrganizations,
    assets: initialAssets,
    cables: initialCables
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStore));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }

  return defaultStore;
}

export function saveStoredArchive(store: MI6DatabaseStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error("Failed to persist archive store", e);
  }
}

export function resetStoredArchive(): MI6DatabaseStore {
  const defaultStore: MI6DatabaseStore = {
    personnel: initialPersonnel,
    operations: initialOperations,
    equipment: initialEquipment,
    vehicles: initialVehicles,
    locations: initialLocations,
    organizations: initialOrganizations,
    assets: initialAssets,
    cables: initialCables
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStore));
  return defaultStore;
}

export function getAllRecords(store: MI6DatabaseStore): DatabaseRecord[] {
  return [
    ...store.personnel,
    ...store.operations,
    ...store.equipment,
    ...store.vehicles,
    ...store.locations,
    ...store.organizations,
    ...store.assets
  ];
}
