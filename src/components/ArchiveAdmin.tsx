import React, { useState } from "react";
import { AgentProfileEditor } from "./AgentProfileEditor";
import { MI6DatabaseStore, resetStoredArchive } from "../data";
import { 
  RefreshCw, 
  Download, 
  Upload, 
  ShieldAlert, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Plus
} from "lucide-react";
import { soundManager } from "../utils/sound";
import { toastManager } from "../utils/toast";

interface ArchiveAdminProps {
  store: MI6DatabaseStore;
  onUpdateStore: (newStore: MI6DatabaseStore) => void;
  clearanceLevel: number;
  onClearanceChange: (lvl: number) => void;
}

export const ArchiveAdmin: React.FC<ArchiveAdminProps> = ({
  store,
  onUpdateStore,
  clearanceLevel,
  onClearanceChange
}) => {
  const [intelPrompt, setIntelPrompt] = useState("");
  const [intelCategory, setIntelCategory] = useState<"personnel" | "operations" | "equipment">("operations");
  const [generatedIntel, setGeneratedIntel] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string | null>(null);

  const handleExportData = () => {
    soundManager.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MI6_CLASSIFIED_ARCHIVES_EXPORT_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setAdminStatus("ARCHIVE SUCCESSFULLY EXPORTED TO ENCRYPTED FILE.");
    setTimeout(() => setAdminStatus(null), 4000);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.personnel)) {
          onUpdateStore(parsed);
          soundManager.playAccessGranted();
          setAdminStatus("ARCHIVAL RECORDS SUCCESSFULLY RESTORED FROM IMPORT.");
        } else {
          throw new Error("Invalid structure");
        }
      } catch (err) {
        soundManager.playAlarm();
        setAdminStatus("IMPORT FAILED: MALFORMED ARCHIVAL JSON PAYLOAD.");
      }
      setTimeout(() => setAdminStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleResetArchive = () => {
    if (window.confirm("WARNING: Confirming will reset all customized dossiers and restore original MI6 baseline records. Proceed?")) {
      const reset = resetStoredArchive();
      onUpdateStore(reset);
      soundManager.playTeletype();
      setAdminStatus("ARCHIVES RESET TO SOVEREIGN MI6 BASELINE.");
      setTimeout(() => setAdminStatus(null), 4000);
    }
  };

  const handleGenerateAIIntel = async () => {
    if (!intelPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/generate-intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: intelPrompt,
          category: intelCategory,
          context: "Archive Administration dossier synthesis"
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.record) {
        throw new Error(data?.error || "Dossier synthesis returned no structured record");
      }
      setGeneratedIntel(data.record);
      setAdminStatus(`DOSSIER SYNTHESIZED VIA ${(data.engine || "SIS ENGINE").toUpperCase()}. REVIEW BEFORE COMMIT.`);
      soundManager.playAccessGranted();
    } catch (e) {
      console.warn("Generating fallback intelligence", e);
      // Client-side emergency compiler keeps the button useful even when the API is offline.
      const stamp = Math.floor(100 + Math.random() * 900);
      const now = new Date().toISOString();
      const title = intelPrompt.trim();
      let fallbackRecord: any;
      if (intelCategory === "personnel") {
        fallbackRecord = {
          id: "pers-" + Date.now(), type: "personnel", referenceNumber: `SIS-PERS-${stamp}-GEN`, name: title,
          classification: "TOP SECRET", clearanceRequired: 8, lastUpdated: now, alias: `ASSET ${title.split(/\s+/).slice(-1)[0].toUpperCase()}`,
          serviceNumber: `SIS-X-${stamp}`, role: "Special Intelligence Asset", rank: "Civilian Asset", organization: "MI6 External Asset Network",
          nationality: "CLASSIFIED", currentStatus: "ACTIVE", skills: ["HUMINT", "Surveillance detection", "Secure communications"],
          psychologicalProfile: `Provisional profile compiled around ${title}.`, loyalties: "UNVERIFIED / CONDITIONAL", knownAssociates: ["00-Section handler"],
          missionHistory: ["Provisional central-registry entry"], injuries: ["None recorded"], equipment: ["Encrypted transmitter"],
          biography: `Provisional SIS personnel file generated from the lead: ${title}.`, confidentialNotes: "Requires field corroboration.",
          threatRating: "MODERATE", reliabilityRating: 70, fingerprintCode: `FP-GEN-${stamp}`
        };
      } else if (intelCategory === "equipment") {
        fallbackRecord = {
          id: "eq-" + Date.now(), type: "equipment", referenceNumber: `SIS-Q-${stamp}-GEN`, name: title,
          classification: "SECRET", clearanceRequired: 7, lastUpdated: now, designation: `Q-BRANCH / ${title.toUpperCase()}`,
          category: "SURVEILLANCE", issuedTo: ["00-Section"], firstAppearance: "2026",
          technicalSpecifications: ["Hardened miniature chassis", "Encrypted control bus"], concealedFunctions: ["Covert telemetry", "Burst transmission"],
          operationalPurpose: `Field prototype synthesized for ${title}.`, riskLevel: "MODERATE", reliability: 88,
          currentLocation: "Q Branch, London", status: "ACTIVE", relatedMissions: ["Generated field trial"]
        };
      } else {
        fallbackRecord = {
          id: "op-" + Date.now(), type: "operations", referenceNumber: `SIS-OPS-${stamp}-GEN`, name: `Operation ${title}`,
          codename: `OPERATION ${title.toUpperCase().replace(/\s+/g, " ")}`, date: "2026-ACTIVE CLASSIFIED", classification: "TOP SECRET",
          clearanceRequired: 9, lastUpdated: now, locations: ["London HQ", "International Sector"], assignedAgents: ["Commander James Bond (007)"],
          missionController: "M (Chief SIS)", primaryObjective: `Investigate and contain hostile activity related to ${title}.`,
          secondaryObjectives: ["Recover evidence", "Protect viable assets"], briefing: `Central Registry has opened an active file concerning ${title}.`,
          knownThreats: ["Armed security", "Counter-surveillance"], requiredEquipment: ["Walther PPK/S", "Q-Branch surveillance kit"],
          intelligenceGathered: ["Provisional lead accepted for field validation."], timeline: [{ time: "00:00 ZULU", event: "File opened." }],
          decisionsMade: ["Level 9 reconnaissance authorized."], casualties: ["None confirmed"], collateralImpact: "None", outcome: "ONGOING",
          debrief: "Operation active.", relatedFiles: ["SIS-PERS-007-UK"], threatLevel: "SEVERE"
        };
      }
      setGeneratedIntel(fallbackRecord);
      setAdminStatus("NETWORK GENERATOR UNAVAILABLE — LOCAL SIS COMPILER CREATED A PROVISIONAL DOSSIER.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddGeneratedToArchive = () => {
    if (!generatedIntel) return;
    soundManager.playPaperRustle();
    if (intelCategory === "operations") {
      onUpdateStore({
        ...store,
        operations: [generatedIntel, ...store.operations]
      });
    } else if (intelCategory === "personnel") {
      onUpdateStore({
        ...store,
        personnel: [generatedIntel, ...store.personnel]
      });
    } else {
      onUpdateStore({
        ...store,
        equipment: [generatedIntel, ...store.equipment]
      });
    }
    toastManager.recordSaved(generatedIntel.name, generatedIntel.referenceNumber);
    setAdminStatus(`FILE #${generatedIntel.referenceNumber} COMMITTED TO CENTRAL DATABASE.`);
    setGeneratedIntel(null);
    setIntelPrompt("");
    setTimeout(() => setAdminStatus(null), 4000);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="mi6-swap-panel rounded-[24px] p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-black/25 border border-white/10 flex items-center justify-center text-amber-500">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <span className="text-amber-500 font-bold uppercase text-[10px]">
              REGISTRY OVERSIGHT & CLEARANCE
            </span>
            <h2 className="text-xl font-black text-stone-100 tracking-tight">
              Archival Administration & Dossier Management
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportData}
            className="bg-white/[0.04] hover:bg-white/[0.08] text-stone-200 border border-white/12 px-3 py-1.5 rounded-lg flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT ARCHIVE</span>
          </button>
          <label className="bg-white/[0.04] hover:bg-white/[0.08] text-stone-200 border border-white/12 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>RESTORE</span>
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
          <button
            onClick={handleResetArchive}
            className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-1.5 rounded-lg"
          >
            RESET BASELINE
          </button>
        </div>
      </div>

      {adminStatus && (
        <div className="bg-amber-950/80 border border-amber-600 text-amber-200 p-3 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{adminStatus}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Classified Intelligence Generator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="mi6-swap-panel rounded-[24px] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-stone-200 uppercase text-xs">
                  GENERATE CLASSIFIED INTELLIGENCE REPORT
                </h3>
              </div>
              <span className="text-[10px] text-stone-500">POWERED BY SIS NEURAL ENGINE</span>
            </div>

            <p className="text-stone-400 text-xs font-sans">
              Enter any real-world or fictional espionage scenario, suspect name, or Q-branch invention prompt. The system will compile an official MI6 classified dossier formatted in full archival specifications.
            </p>

            <div className="space-y-3">
              <div className="flex space-x-2">
                {(["operations", "personnel", "equipment"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setIntelCategory(cat)}
                    className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                      intelCategory === cat ? "bg-amber-500 text-black" : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <textarea
                value={intelPrompt}
                onChange={(e) => setIntelPrompt(e.target.value)}
                placeholder="e.g. Rogue submarine hijacking off Gibraltar straits involving stealth hydrofoil..."
                rows={3}
                className="w-full bg-white/[0.025] border border-white/10 rounded-xl p-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 text-xs font-mono"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateAIIntel}
                  disabled={isGenerating || !intelPrompt.trim()}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-2 rounded-xl flex items-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGenerating ? "TRANSCRIBING CIPHER..." : "SYNTHESIZE DOSSIER"}</span>
                </button>
              </div>
            </div>

            {/* Generated Output Preview */}
            {generatedIntel && (
              <div className="mt-4 pt-4 border-t border-white/8 space-y-3">
                <div className="mi6-swap-panel-soft p-4 rounded-[22px] text-stone-100">
                  <div className="flex justify-between items-center text-[10px] font-bold border-b border-black pb-1 mb-2">
                    <span>{generatedIntel.referenceNumber}</span>
                    <span className="text-red-700">{generatedIntel.classification}</span>
                  </div>
                  <h4 className="font-bold text-sm">{generatedIntel.name}</h4>
                  <p className="text-xs font-sans mt-1 text-stone-800">
                    {generatedIntel.briefing || generatedIntel.biography || generatedIntel.operationalPurpose}
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleAddGeneratedToArchive}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-lg flex items-center space-x-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>COMMIT DOSSIER TO PERMANENT REGISTRY</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Security Auditing & Diagnostics */}
        <div className="lg:col-span-5 space-y-4">
          <AgentProfileEditor />
          <div className="mi6-swap-panel rounded-[24px] p-5 space-y-4">
            <div className="flex items-center space-x-2 text-stone-200 font-bold border-b border-white/8 pb-3 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>CLEARANCE & ACCESS AUDITING</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-[#1c1e23] p-2.5 rounded-lg border border-white/8">
                <span className="text-stone-400">ACTIVE USER CLEARANCE:</span>
                <span className="text-amber-400 font-bold">LEVEL {clearanceLevel}</span>
              </div>
              <div className="flex justify-between items-center bg-[#1c1e23] p-2.5 rounded-lg border border-white/8">
                <span className="text-stone-400">00-SECTION DISCRETION:</span>
                <span className={clearanceLevel >= 9 ? "text-emerald-400 font-bold" : "text-stone-500 font-bold"}>
                  {clearanceLevel >= 9 ? "AUTHORIZED" : "DISALLOWED"}
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#1c1e23] p-2.5 rounded-lg border border-white/8">
                <span className="text-stone-400">TOTAL REGISTRY DOSSIERS:</span>
                <span className="text-stone-200 font-bold">
                  {store.personnel.length + store.operations.length + store.equipment.length + store.vehicles.length + store.locations.length + store.organizations.length + store.assets.length} FILES
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-stone-500 uppercase block mb-1">
                EXECUTIVE CLEARANCE OVERRIDE:
              </span>
              <div className="grid grid-cols-5 gap-1">
                {[5, 6, 7, 8, 9].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => {
                      soundManager.playTeletype();
                      onClearanceChange(lvl);
                    }}
                    className={`py-1.5 rounded font-bold text-center border text-[11px] ${
                      clearanceLevel === lvl
                        ? "bg-amber-500 text-black border-amber-400 shadow"
                        : "bg-[#1c1e23] text-stone-400 border-white/10 hover:text-stone-200"
                    }`}
                  >
                    LVL {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/8 text-[10px] text-stone-500 font-sans leading-relaxed">
              Official Secrets Act 1989 Notice: Unauthorized retention, duplication, or transmission of classified Double-O section records is subject to immediate prosecution under sovereign authority.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
