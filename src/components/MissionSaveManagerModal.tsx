import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { SimulationSaveSlot } from "../types";
import { Download, FolderOpen, Save, Trash2, Upload, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  slots: SimulationSaveSlot[];
  onSave: (name?: string) => void;
  onLoad: (slot: SimulationSaveSlot) => void;
  onDelete: (slotId: string) => void;
  onImport: (slot: SimulationSaveSlot) => void;
  canSave: boolean;
}

export const MissionSaveManagerModal: React.FC<Props> = ({ open, onClose, slots, onSave, onLoad, onDelete, onImport, canSave }) => {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const exportSlot = (slot: SimulationSaveSlot) => {
    const blob = new Blob([JSON.stringify(slot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slot.slotName.replace(/[^a-z0-9]+/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed?.missionState || !parsed?.operationId) throw new Error("Invalid MI6 save");
        onImport({ ...parsed, slotId: `import-${Date.now()}`, savedAt: new Date().toISOString(), slotName: `[IMPORTED] ${parsed.slotName || "MI6 SAVE"}` });
      } catch {
        window.alert("This file is not a valid MI6 mission save.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/88 backdrop-blur-md p-3 flex items-center justify-center" onMouseDown={onClose}>
      <section className="w-full max-w-3xl max-h-[88vh] mi6-swap-panel rounded-[28px] overflow-hidden shadow-2xl font-mono" onMouseDown={e => e.stopPropagation()}>
        <header className="p-4 border-b border-white/8 flex items-center justify-between bg-[#111318]">
          <div className="flex items-center gap-3"><FolderOpen className="w-5 h-5 text-sky-400" /><div><div className="text-[9px] uppercase tracking-[0.22em] text-sky-400 font-bold">Operational Archive</div><div className="text-sm font-bold text-stone-100">Mission Save Manager</div></div></div>
          <button onClick={onClose} className="p-2 rounded-lg border border-white/10 text-stone-400 hover:text-white"><X className="w-4 h-4" /></button>
        </header>
        <div className="p-4 space-y-4 overflow-y-auto max-h-[76vh]">
          <div className="mi6-swap-panel-soft rounded-2xl p-3 flex flex-col sm:flex-row gap-2">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Save designation, optional" className="flex-1 bg-[#111318] border border-white/10 rounded-lg px-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-500" />
            <button disabled={!canSave} onClick={() => { onSave(name.trim() || undefined); setName(""); }} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-bold text-xs flex items-center justify-center gap-2"><Save className="w-3.5 h-3.5" />SAVE CURRENT BRANCH</button>
            <button onClick={() => inputRef.current?.click()} className="px-3 py-2 rounded-lg border border-white/10 bg-stone-900 text-sky-300 text-xs flex items-center justify-center gap-2"><Upload className="w-3.5 h-3.5" />IMPORT</button>
            <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={importFile} />
          </div>

          <div className="space-y-2">
            {slots.length === 0 && <div className="border border-dashed border-white/10 rounded-xl p-8 text-center text-xs text-stone-600">No manual branches archived yet.</div>}
            {slots.map(slot => (
              <div key={slot.slotId} className="mi6-swap-panel-soft rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <button onClick={() => { onLoad(slot); onClose(); }} className="flex-1 text-left min-w-0">
                  <div className="text-xs font-bold text-stone-100 truncate">{slot.slotName}</div>
                  <div className="text-[9px] text-stone-500 mt-1">{new Date(slot.savedAt).toLocaleString()} · TURN {slot.sceneNumber} · {slot.causalTree?.length || 0} causal nodes</div>
                </button>
                <div className="flex gap-2">
                  <button onClick={() => exportSlot(slot)} className="p-2 rounded-lg border border-white/10 text-sky-400 hover:bg-stone-800" title="Export JSON"><Download className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(slot.slotId)} className="p-2 rounded-lg border border-white/10 text-red-400 hover:bg-red-950/30" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
