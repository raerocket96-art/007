import { MissionState } from "../types";

export const ACTIVE_MISSION_STORAGE_KEY = "mi6_active_mission_state_v1";
export const LAST_DATA_SYNC_KEY = "mi6_last_data_sync_v1";
export const DATA_SYNC_EVENT = "mi6:data-sync";

export interface DataSyncPayload {
  source: "mission_state" | "archive_store" | "manual";
  timestamp: number;
  status: "saved" | "syncing" | "cleared";
  missionTitle?: string;
  turn?: number;
  maxTurns?: number;
  outcome?: string;
  message: string;
}

/**
 * Persists the active mission state to localStorage and dispatches
 * a window event to trigger the visual Data Sync indicator in the footer.
 */
export function saveActiveMissionToLocalStorage(state: MissionState | null): void {
  if (typeof window === "undefined") return;

  if (state) {
    try {
      localStorage.setItem(ACTIVE_MISSION_STORAGE_KEY, JSON.stringify(state));
      const payload: DataSyncPayload = {
        source: "mission_state",
        timestamp: Date.now(),
        status: "saved",
        missionTitle: state.title,
        turn: state.currentTurn,
        maxTurns: state.maxTurns,
        outcome: state.outcome,
        message: `MISSION STATE AUTO-SAVED: ${state.title} (Turn ${state.currentTurn})`
      };
      localStorage.setItem(LAST_DATA_SYNC_KEY, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent<DataSyncPayload>(DATA_SYNC_EVENT, { detail: payload }));
    } catch (err) {
      console.warn("Failed to persist mission state to localStorage:", err);
    }
  } else {
    try {
      localStorage.removeItem(ACTIVE_MISSION_STORAGE_KEY);
      const payload: DataSyncPayload = {
        source: "mission_state",
        timestamp: Date.now(),
        status: "cleared",
        message: "ACTIVE MISSION STATE CLEARED"
      };
      localStorage.setItem(LAST_DATA_SYNC_KEY, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent<DataSyncPayload>(DATA_SYNC_EVENT, { detail: payload }));
    } catch (err) {
      console.warn("Failed to clear mission state from localStorage:", err);
    }
  }
}

/**
 * Loads the active mission state from localStorage if one is stored and valid.
 */
export function loadActiveMissionFromLocalStorage(): MissionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_MISSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.id && parsed.title && Array.isArray(parsed.timeline)) {
      return parsed as MissionState;
    }
  } catch (e) {
    console.warn("Failed to parse stored mission state:", e);
  }
  return null;
}

/**
 * Removes the stored mission state from localStorage.
 */
export function clearActiveMissionFromLocalStorage(): void {
  saveActiveMissionToLocalStorage(null);
}

/**
 * Retrieves the last known DataSync payload from localStorage or creates an initial idle record.
 */
export function getLastDataSyncInfo(): DataSyncPayload {
  if (typeof window === "undefined") {
    return {
      source: "manual",
      timestamp: Date.now(),
      status: "saved",
      message: "LOCAL VAULT INITIALIZED"
    };
  }

  try {
    const raw = localStorage.getItem(LAST_DATA_SYNC_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.timestamp) {
        return parsed as DataSyncPayload;
      }
    }
  } catch (e) {
    // ignore
  }

  return {
    source: "manual",
    timestamp: Date.now(),
    status: "saved",
    message: "LOCAL VAULT READY"
  };
}

/**
 * Triggers a manual sync event (used for UI test trigger or force save).
 */
export function triggerManualDataSync(currentState?: MissionState | null): void {
  if (currentState) {
    saveActiveMissionToLocalStorage(currentState);
  } else {
    const payload: DataSyncPayload = {
      source: "manual",
      timestamp: Date.now(),
      status: "saved",
      message: "MANUAL VAULT RE-SYNCHRONIZATION COMPLETE"
    };
    try {
      localStorage.setItem(LAST_DATA_SYNC_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<DataSyncPayload>(DATA_SYNC_EVENT, { detail: payload }));
    }
  }
}

/**
 * Subscribes a listener to data sync events. Returns an unsubscribe cleanup function.
 */
export function subscribeToDataSync(listener: (payload: DataSyncPayload) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<DataSyncPayload>;
    if (customEvent.detail) {
      listener(customEvent.detail);
    }
  };

  window.addEventListener(DATA_SYNC_EVENT, handler);
  return () => {
    window.removeEventListener(DATA_SYNC_EVENT, handler);
  };
}
