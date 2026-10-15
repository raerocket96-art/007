import React, { useState } from "react";
import { ConfigurableItem, CustomizedLoadout } from "../types";
import { INITIAL_CONFIGURABLE_EQUIPMENT, calculateLoadoutMetrics } from "../data/customizableEquipment";
import { soundManager } from "../utils/sound";
import { 
  Wrench, 
  ShieldCheck, 
  Crosshair, 
  AlertTriangle, 
  Check, 
  Cpu, 
  Gauge, 
  Eye, 
  Sliders, 
  Layers, 
  Sparkles,
  Info,
  ChevronRight,
  RotateCcw
} from "lucide-react";

interface QBranchCustomizerProps {
  currentLoadout?: CustomizedLoadout | null;
  onApplyLoadout: (loadout: CustomizedLoadout) => void;
  onClose?: () => void;
  missionContext?: {
    codename: string;
    targetLocation: string;
    riskLevel: string;
    recommendedFocus?: "STEALTH" | "TACTICAL" | "BALANCED";
  };
}

export const QBranchCustomizer: React.FC<QBranchCustomizerProps> = ({
  currentLoadout,
  onApplyLoadout,
  onClose,
  missionContext
}) => {
  const [items, setItems] = useState<ConfigurableItem[]>(() => {
    if (currentLoadout && currentLoadout.items.length > 0) {
      return currentLoadout.items;
    }
    return INITIAL_CONFIGURABLE_EQUIPMENT;
  });

  const [selectedItemId, setSelectedItemId] = useState<string>(
    items[0]?.id || "cfg-ppk"
  );

  const activeItem = items.find(i => i.id === selectedItemId) || items[0];
  const metrics = calculateLoadoutMetrics(items);

  const handleSelectOption = (itemId: string, slotId: string, optionId: string) => {
    soundManager.playClick();
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        slots: item.slots.map(slot => {
          if (slot.slotId !== slotId) return slot;
          return {
            ...slot,
            selectedOptionId: optionId
          };
        })
      };
    }));
  };

  const handleResetDefaults = () => {
    soundManager.playClick();
    setItems(INITIAL_CONFIGURABLE_EQUIPMENT);
  };

  const handleCommitLoadout = () => {
    soundManager.playAccessGranted();
    const updatedLoadout: CustomizedLoadout = {
      items,
      overallStealth: metrics.overallStealth,
      overallTactical: metrics.overallTactical,
      overallRisk: metrics.overallRisk,
      overallWeightKg: metrics.overallWeightKg,
      unlockedActions: metrics.unlockedActions
    };
    onApplyLoadout(updatedLoadout);
    if (onClose) onClose();
  };

  return (
    <div className="bg-[#1b1e23] border-2 border-white/10 rounded-2xl overflow-hidden font-mono text-stone-200 shadow-2xl">
      {/* Blueprint Header */}
      <div className="bg-[#14161a] border-b border-white/8 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-stone-100 tracking-wider">
                Q-BRANCH ORDNANCE & CUSTOMIZATION MODULE
              </h2>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                MK-IV CONFIGURATOR
              </span>
            </div>
            <div className="text-[10px] text-stone-400">
              DIRECTORATE OF SCIENCE & TECHNOLOGY // VAUXHALL CROSS
            </div>
          </div>
        </div>

        {missionContext && (
          <div className="bg-[#24272c] border border-white/10/80 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-stone-500 text-[10px] block">REQUISITION FOR OPERATION:</span>
            <span className="text-amber-400 font-bold">{missionContext.codename}</span>
            <span className="text-stone-400 text-[10px]"> ({missionContext.targetLocation})</span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Overall Loadout Assessment Meters */}
        <div className="bg-[#14161a] border border-white/8 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Stealth Metric */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-stone-400 flex items-center space-x-1">
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>STEALTH INDEX</span>
              </span>
              <span className="text-cyan-400 font-bold">{metrics.overallStealth}%</span>
            </div>
            <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-white/8">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${metrics.overallStealth}%` }}
              />
            </div>
            <div className="text-[8px] text-stone-500">Acoustic & thermal suppression</div>
          </div>

          {/* Tactical Firepower Metric */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-stone-400 flex items-center space-x-1">
                <Crosshair className="w-3 h-3 text-amber-400" />
                <span>TACTICAL IMPACT</span>
              </span>
              <span className="text-amber-400 font-bold">{metrics.overallTactical}%</span>
            </div>
            <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-white/8">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${metrics.overallTactical}%` }}
              />
            </div>
            <div className="text-[8px] text-stone-500">Kinetic penetration & neutralizing power</div>
          </div>

          {/* Risk / Malfunction Metric */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-stone-400 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>VOLATILITY / RISK</span>
              </span>
              <span className="text-red-400 font-bold">{metrics.overallRisk}%</span>
            </div>
            <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-white/8">
              <div
                className="bg-red-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${metrics.overallRisk}%` }}
              />
            </div>
            <div className="text-[8px] text-stone-500">Experimental failure probability</div>
          </div>

          {/* Weight Metric */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-stone-400 flex items-center space-x-1">
                <Gauge className="w-3 h-3 text-stone-300" />
                <span>FIELD MASS LOAD</span>
              </span>
              <span className="text-stone-200 font-bold">{metrics.overallWeightKg} KG</span>
            </div>
            <div className="text-[11px] font-bold text-stone-300 pt-1">
              {metrics.overallWeightKg > 1000 ? "HEAVY MOBILE UNIT" : "LIGHTWEIGHT RECON"}
            </div>
            <div className="text-[8px] text-stone-500">Tactical mobility rating: OPTIMAL</div>
          </div>
        </div>

        {/* Main Work Area: Equipment Selector Tabs & Mod Slots */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Equipment Navigation Column (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>REQUISITION ITEMS ({items.length}):</span>
              <button
                onClick={handleResetDefaults}
                className="text-stone-500 hover:text-stone-300 flex items-center space-x-1 text-[9px]"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>RESET ALL</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {items.map(item => {
                const isSelected = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedItemId(item.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#252a32] border-amber-500 shadow-md ring-1 ring-amber-500/40"
                        : "bg-[#181b20] border-white/8 text-stone-400 hover:border-white/10 hover:text-stone-200"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <span className="text-[9px] font-bold text-amber-500 bg-amber-950/60 px-1 py-0.2 rounded">
                          {item.designation}
                        </span>
                        <span className="text-[8px] text-stone-500">{item.category}</span>
                      </div>
                      <div className="text-xs font-bold text-stone-100 truncate">{item.name}</div>
                      <div className="text-[9px] text-stone-400 mt-0.5">
                        {item.slots.length} MODULAR {item.slots.length === 1 ? "SLOT" : "SLOTS"}
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-amber-400 translate-x-0.5" : "text-stone-600"}`} />
                  </button>
                );
              })}
            </div>

            {/* Unlocked Simulation Actions Box */}
            <div className="bg-[#14161a] border border-white/8 rounded-xl p-3.5 space-y-2 mt-4">
              <div className="text-[10px] text-amber-400 font-bold uppercase flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TACTICAL ACTIONS UNLOCKED IN SIMULATOR:</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {metrics.unlockedActions.length === 0 ? (
                  <div className="text-[10px] text-stone-500 italic">No specialized actions currently unlocked.</div>
                ) : (
                  metrics.unlockedActions.map((actionText, idx) => (
                    <div key={idx} className="p-1.5 bg-[#1b1e23] border border-white/8 rounded text-[10px] text-emerald-300 flex items-start space-x-1.5">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-tight">{actionText}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Active Item Configuration Workbench (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Active Item Overview Card */}
            <div className="bg-[#15171c] border border-white/8 rounded-xl p-4 flex flex-wrap sm:flex-nowrap items-start gap-4">
              {activeItem.imageUrl && (
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-lg object-cover border border-white/10 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-100">{activeItem.name}</span>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded font-bold">
                    {activeItem.designation}
                  </span>
                </div>
                <div className="text-[10px] text-stone-400">
                  BASE SPECS: STEALTH {activeItem.baseStealth}% • TACTICAL {activeItem.baseTactical}% • MASS {activeItem.baseWeightKg} KG
                </div>
                
                {/* Q's Caution Advisory Quote */}
                <div className="bg-[#1c2027] border-l-2 border-amber-500 p-2.5 rounded-r-lg text-[11px] text-amber-200 italic leading-relaxed">
                  "{activeItem.qCautionNote}"
                  <span className="block text-[9px] text-stone-400 not-italic font-bold mt-1 uppercase">
                    — Major Boothroyd, Head of Q-Branch
                  </span>
                </div>
              </div>
            </div>

            {/* Modular Customization Slots */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                <span>MODULAR TECHNICAL CONFIGURATION SLOTS</span>
              </div>

              {activeItem.slots.map(slot => (
                <div key={slot.slotId} className="bg-[#16181e] border border-white/8 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/8/80 pb-2">
                    <div>
                      <div className="text-xs font-bold text-stone-200">{slot.slotName}</div>
                      <div className="text-[10px] text-stone-400">{slot.description}</div>
                    </div>
                    <span className="text-[9px] text-stone-500 font-mono">
                      SLOT ID: {slot.slotId}
                    </span>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {slot.options.map(opt => {
                      const isOptionSelected = opt.id === slot.selectedOptionId;
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleSelectOption(activeItem.id, slot.slotId, opt.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                            isOptionSelected
                              ? "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40 text-stone-100"
                              : "bg-[#1c1f25] border-white/8 text-stone-400 hover:border-white/10 hover:text-stone-300"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className={`text-xs font-bold ${isOptionSelected ? "text-amber-400" : "text-stone-200"}`}>
                                {opt.name}
                              </span>
                              {isOptionSelected && (
                                <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[9px] font-bold shrink-0">
                                  ✓
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-400 leading-relaxed mb-2">
                              {opt.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-white/8/60 flex flex-wrap gap-2 text-[9px] font-mono">
                            {opt.stealthModifier !== 0 && (
                              <span className={opt.stealthModifier > 0 ? "text-cyan-400" : "text-stone-500"}>
                                STEALTH {opt.stealthModifier > 0 ? `+${opt.stealthModifier}%` : `${opt.stealthModifier}%`}
                              </span>
                            )}
                            {opt.tacticalModifier !== 0 && (
                              <span className={opt.tacticalModifier > 0 ? "text-amber-400" : "text-stone-500"}>
                                TACTICAL {opt.tacticalModifier > 0 ? `+${opt.tacticalModifier}%` : `${opt.tacticalModifier}%`}
                              </span>
                            )}
                            {opt.riskModifier !== 0 && (
                              <span className={opt.riskModifier > 0 ? "text-red-400" : "text-emerald-400"}>
                                RISK {opt.riskModifier > 0 ? `+${opt.riskModifier}%` : `${opt.riskModifier}%`}
                              </span>
                            )}
                            {opt.weightDeltaKg !== 0 && (
                              <span className="text-stone-400">
                                MASS {opt.weightDeltaKg > 0 ? `+${opt.weightDeltaKg}kg` : `${opt.weightDeltaKg}kg`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-4 border-t border-white/8 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] text-stone-500 flex items-center space-x-2">
            <Cpu className="w-3.5 h-3.5 text-amber-500" />
            <span>CUSTOM LOADOUT DIRECTLY IMPACTS FIELD SIMULATOR COMBAT & EVASION CHOICES</span>
          </div>

          <div className="flex items-center space-x-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
              >
                RETURN
              </button>
            )}
            <button
              type="button"
              onClick={handleCommitLoadout}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-6 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg transition-transform active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>COMMIT Q-BRANCH REQUISITION TO MISSION</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
