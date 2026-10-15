import type { ConfigurableItem, CustomizedLoadout, MissionEquipmentRuntime } from "../types";

export type ResolvedEquipmentItem = {
  id: string;
  name: string;
  designation: string;
  category: string;
  modifications: string[];
  tacticalUnlocks: string[];
  stealth: number;
  tactical: number;
  risk: number;
};

export function resolveConfiguredEquipment(loadout: CustomizedLoadout): ResolvedEquipmentItem[] {
  return (loadout.items || []).map((item) => {
    const selected = item.slots
      .map((slot) => slot.options.find((option) => option.id === slot.selectedOptionId))
      .filter(Boolean);
    return {
      id: item.id,
      name: item.name,
      designation: item.designation,
      category: item.category,
      modifications: selected.map((option) => option!.name),
      tacticalUnlocks: selected.map((option) => option!.tacticalActionUnlock).filter(Boolean) as string[],
      stealth: Math.max(0, Math.min(100, item.baseStealth + selected.reduce((sum, option) => sum + (option?.stealthModifier || 0), 0))),
      tactical: Math.max(0, Math.min(100, item.baseTactical + selected.reduce((sum, option) => sum + (option?.tacticalModifier || 0), 0))),
      risk: Math.max(0, item.baseRisk + selected.reduce((sum, option) => sum + (option?.riskModifier || 0), 0))
    };
  });
}

function inferCharges(item: ConfigurableItem): number | null {
  const text = `${item.name} ${item.designation} ${item.slots.flatMap(s => s.options.map(o => `${o.name} ${o.tacticalActionUnlock || ""}`)).join(" ")}`.toLowerCase();
  if (/explosive pen|grenade|dart|acid|rocket|micro-rocket|transponder|tracker round/.test(text)) return 1;
  if (/emp/.test(text)) return 2;
  return null;
}

export function createMissionEquipmentRuntime(loadout: CustomizedLoadout): MissionEquipmentRuntime[] {
  return resolveConfiguredEquipment(loadout).map((resolved) => {
    const source = loadout.items.find((item) => item.id === resolved.id)!;
    const charges = inferCharges(source);
    return {
      id: resolved.id,
      name: resolved.name,
      designation: resolved.designation,
      category: resolved.category,
      status: "READY",
      remainingUses: charges,
      modifications: resolved.modifications,
      tacticalUnlocks: resolved.tacticalUnlocks,
      stealthRating: resolved.stealth,
      tacticalRating: resolved.tactical,
      riskRating: resolved.risk,
      usageCount: 0
    };
  });
}

export function equipmentPromptPayload(loadout: CustomizedLoadout, runtime?: MissionEquipmentRuntime[]) {
  const resolved = resolveConfiguredEquipment(loadout);
  const base = resolved.map((item) => {
    const live = runtime?.find((entry) => entry.id === item.id);
    return {
      ...item,
      status: live?.status || "READY",
      remainingUses: live?.remainingUses ?? null
    };
  });
  const runtimeOnly = (runtime || [])
    .filter((entry) => !resolved.some((item) => item.id === entry.id))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      designation: entry.designation || "Q-RUNTIME",
      category: entry.category || "TACTICAL",
      modifications: entry.modifications || [],
      tacticalUnlocks: entry.tacticalUnlocks || [],
      stealth: entry.stealthRating ?? 50,
      tactical: entry.tacticalRating ?? 50,
      risk: entry.riskRating ?? 10,
      status: entry.status,
      remainingUses: entry.remainingUses
    }));
  return [...base, ...runtimeOnly];
}

export function markEquipmentUsed(runtime: MissionEquipmentRuntime[] | undefined, equipmentId: string): MissionEquipmentRuntime[] {
  if (!runtime) return [];
  return runtime.map((entry) => {
    if (entry.id !== equipmentId || entry.status === "EXHAUSTED" || entry.status === "LOST") return entry;
    if (entry.remainingUses == null) return { ...entry, status: "DEPLOYED" };
    const remainingUses = Math.max(0, entry.remainingUses - 1);
    return { ...entry, remainingUses, status: remainingUses === 0 ? "EXHAUSTED" : "DEPLOYED" };
  });
}


export function applyEquipmentWearForAction(runtime: MissionEquipmentRuntime[] | undefined, actionText: string, explicitEquipmentId?: string | null): MissionEquipmentRuntime[] {
  if (!runtime) return [];
  const lower = actionText.toLowerCase();
  return runtime.map((entry) => {
    if (entry.status === "EXHAUSTED" || entry.status === "LOST") return entry;
    const firearmUse = entry.category === "FIREARMS" && /\b(shoot|shot|fire|fires|firing|ppk|pistol|sidearm)\b/.test(lower);
    const watchUse = /omega|watch|laser/.test(lower) && /omega|chronometer|watch/i.test(entry.name);
    const namedUse = lower.includes(entry.name.toLowerCase().split(" ").slice(0, 2).join(" "));
    const explicit = explicitEquipmentId === entry.id;
    if (!(firearmUse || watchUse || namedUse || explicit)) return entry;

    const usageCount = (entry.usageCount || 0) + 1;
    if (entry.remainingUses != null) {
      const remainingUses = Math.max(0, entry.remainingUses - 1);
      return { ...entry, usageCount, remainingUses, status: remainingUses === 0 ? "EXHAUSTED" : "DEPLOYED" };
    }

    const heatSensitive = firearmUse && entry.modifications.some(mod => /suppressor|sound/i.test(mod));
    const laserWear = watchUse;
    const status: MissionEquipmentRuntime["status"] = (heatSensitive && usageCount >= 6) || (laserWear && usageCount >= 5) ? "DAMAGED" : "DEPLOYED";
    return { ...entry, usageCount, status };
  });
}
