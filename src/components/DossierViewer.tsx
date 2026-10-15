import React, { useState } from "react";
import { 
  DatabaseRecord, 
  PersonnelRecord, 
  OperationRecord, 
  EquipmentRecord, 
  VehicleRecord, 
  LocationRecord, 
  OrganizationRecord, 
  AssetRecord 
} from "../types";
import { 
  Shield, 
  FileText, 
  ExternalLink, 
  Printer, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Edit3, 
  Save, 
  Calendar,
  MapPin,
  Tag,
  Crosshair,
  Radio,
  FileCheck
} from "lucide-react";
import { soundManager } from "../utils/sound";

interface DossierViewerProps {
  record: DatabaseRecord;
  clearanceLevel: number;
  onClose?: () => void;
  onNavigateToRecord: (recordId: string) => void;
  onUpdateRecord?: (updated: DatabaseRecord) => void;
  isModal?: boolean;
}

export const DossierViewer: React.FC<DossierViewerProps> = ({
  record,
  clearanceLevel,
  onClose,
  onNavigateToRecord,
  onUpdateRecord,
  isModal = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(
    ("confidentialNotes" in record && record.confidentialNotes) || 
    ("debrief" in record && record.debrief) || 
    ("intelligenceSummary" in record && record.intelligenceSummary) || ""
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isRestricted = clearanceLevel < record.clearanceRequired;

  const handleSaveNotes = () => {
    if (!onUpdateRecord) return;
    let updated = { ...record };
    if ("confidentialNotes" in updated) {
      updated = { ...updated, confidentialNotes: editedNotes };
    } else if ("debrief" in updated) {
      updated = { ...updated, debrief: editedNotes };
    } else if ("intelligenceSummary" in updated) {
      updated = { ...updated, intelligenceSummary: editedNotes };
    }
    onUpdateRecord(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    soundManager.playTeletype();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getStampClass = (classification: string) => {
    switch (classification) {
      case "TOP SECRET":
        return "border-red-600 text-red-600 bg-red-50/10";
      case "SECRET":
        return "border-red-700 text-red-700 bg-red-50/10";
      case "CONFIDENTIAL":
        return "border-amber-700 text-amber-700 bg-amber-50/10";
      default:
        return "border-white/12 text-stone-700";
    }
  };

  return (
    <div className={`mi6-swap-panel rounded-2xl border-4 border-black p-4 sm:p-8 relative shadow-2xl transition-all ${
      isModal ? "max-h-[90vh] overflow-y-auto" : "w-full my-4"
    }`}>
      {/* Top Archival Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-black text-white px-3 py-1 font-mono text-xs font-bold tracking-widest uppercase rounded">
            FILE #{record.referenceNumber}
          </div>
          <span className="text-xs font-mono text-stone-700 font-semibold uppercase">
            REGISTRY CLASS: {record.type.toUpperCase()}
          </span>
          <span className="text-xs font-mono text-stone-500">
            UPDATED: {new Date(record.lastUpdated).toLocaleDateString("en-GB")}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Classification Stamp */}
          <div className={`border-2 px-3 py-0.5 text-xs font-mono font-black tracking-widest uppercase rotate-[-2deg] rounded ${getStampClass(record.classification)}`}>
            {record.classification} // REQ LVL {record.clearanceRequired}
          </div>

          <button
            onClick={() => window.print()}
            title="Print Official Dossier"
            className="p-1.5 bg-stone-200 hover:bg-stone-300 border-2 border-black rounded text-stone-100 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          {onClose && (
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              title="Close Dossier"
              className="p-1.5 bg-stone-200 hover:bg-red-200 border-2 border-black rounded text-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Clearance Warning Banner if Restricted */}
      {isRestricted && (
        <div className="bg-amber-100 border-2 border-amber-600 p-4 rounded-lg mb-6 flex items-start space-x-3 text-amber-900">
          <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-mono font-bold text-xs uppercase tracking-wider text-amber-900">
              RESTRICTED INTELLIGENCE DOSSIER // EYES ONLY
            </div>
            <div className="text-xs mt-1">
              Your active security clearance is <strong>Level {clearanceLevel}</strong>. This record requires <strong>Level {record.clearanceRequired}</strong> clearance. Certain tactical intelligence, operative identities, and operational notes have been redacted by order of the Chief of SIS.
            </div>
          </div>
        </div>
      )}

      {/* Main Dossier Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Core Identity and Visual Insets */}
        <div className="lg:col-span-4 space-y-4">
          {/* Identity Card Inset */}
          <div className="bg-white/[0.03] border-2 border-black rounded-xl p-4 shadow-sm">
            {record.imageUrl ? (
              <div className="relative mb-3 border-2 border-black rounded-lg overflow-hidden bg-stone-100 aspect-4/3 flex items-center justify-center">
                <img
                  src={record.imageUrl}
                  alt={record.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                />
                <div className="absolute bottom-2 left-2 bg-black/80 text-white font-mono text-[9px] px-2 py-0.5 rounded">
                  SIS ARCHIVE PHOTO // SEC-ID
                </div>
                {isRestricted && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-red-600 text-white font-mono text-xs font-bold px-3 py-1 uppercase tracking-widest rotate-[-12deg] shadow">
                      REDACTED
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-3 border-2 border-dashed border-stone-400 rounded-lg aspect-4/3 flex flex-col items-center justify-center text-stone-500 font-mono text-xs p-4 text-center">
                <Shield className="w-10 h-10 mb-2 opacity-40" />
                <span>NO VISUAL PHOTOMETRY ON FILE</span>
              </div>
            )}

            <div className="space-y-2 font-mono">
              <div>
                <span className="text-[10px] text-stone-500 uppercase block">SUBJECT / DESIGNATION</span>
                <h2 className="text-lg font-bold text-stone-100 tracking-tight leading-tight">
                  {record.name}
                </h2>
                {"alias" in record && record.alias && (
                  <div className="text-xs text-stone-600 font-semibold">
                    AKA: "{record.alias}"
                  </div>
                )}
                {"codename" in record && record.codename && (
                  <div className="text-xs text-amber-700 font-bold">
                    CODENAME: [{record.codename}]
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-stone-200 text-xs space-y-1.5 text-stone-200">
                {"serviceNumber" in record && record.serviceNumber && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">SERVICE NO:</span>
                    <span className="font-semibold">{record.serviceNumber}</span>
                  </div>
                )}
                {"role" in record && record.role && (
                  <div>
                    <span className="text-stone-500 block text-[10px]">ROLE:</span>
                    <span className="font-semibold">{record.role}</span>
                  </div>
                )}
                {"rank" in record && record.rank && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">RANK:</span>
                    <span className="font-semibold">{record.rank}</span>
                  </div>
                )}
                {"organization" in record && record.organization && (
                  <div>
                    <span className="text-stone-500 block text-[10px]">ORGANIZATION:</span>
                    <span className="font-semibold">{record.organization}</span>
                  </div>
                )}
                {"currentStatus" in record && (
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-stone-500">CURRENT STATUS:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      record.currentStatus === "ACTIVE" 
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : record.currentStatus === "KIA"
                        ? "bg-stone-900 text-white"
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}>
                      {record.currentStatus}
                    </span>
                  </div>
                )}
                {"fingerprintCode" in record && record.fingerprintCode && (
                  <div className="pt-2 border-t border-stone-200">
                    <span className="text-stone-500 text-[9px] block">BIOMETRIC ENCODING:</span>
                    <span className="text-[10px] tracking-widest text-stone-700 font-bold">
                      {isRestricted ? "FP-████-████-REDACTED" : record.fingerprintCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Inset */}
          <div className="bg-white/[0.03] border-2 border-black rounded-xl p-4 shadow-sm font-mono text-xs space-y-2">
            <div className="font-bold text-stone-100 border-b border-stone-200 pb-1 text-[11px] tracking-wide uppercase">
              SECURITY & LOGISTICAL METRICS
            </div>
            {"threatRating" in record && (
              <div className="flex justify-between items-center">
                <span className="text-stone-500">THREAT RATING:</span>
                <span className={`font-bold ${
                  record.threatRating === "CRITICAL" ? "text-red-600" :
                  record.threatRating === "HIGH" ? "text-red-500" : "text-emerald-700"
                }`}>{record.threatRating}</span>
              </div>
            )}
            {"reliabilityRating" in record && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-stone-500">RELIABILITY INDEX:</span>
                  <span className="font-bold">{record.reliabilityRating}%</span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden border border-stone-400">
                  <div 
                    className={`h-full ${record.reliabilityRating > 80 ? "bg-emerald-600" : record.reliabilityRating > 50 ? "bg-amber-600" : "bg-red-600"}`}
                    style={{ width: `${record.reliabilityRating}%` }}
                  />
                </div>
              </div>
            )}
            {"category" in record && (
              <div className="flex justify-between">
                <span className="text-stone-500">CATEGORY:</span>
                <span className="font-bold">{record.category}</span>
              </div>
            )}
            {"currentLocation" in record && (
              <div className="flex justify-between">
                <span className="text-stone-500">LOCATION:</span>
                <span className="font-semibold text-right">{record.currentLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: In-depth Archival File Fields */}
        <div className="lg:col-span-8 space-y-4">
          {/* Detailed Primary Profile / Briefing */}
          <div className="bg-white/[0.03] border-2 border-black rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b-2 border-stone-200 pb-2">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-stone-100 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-stone-700" />
                <span>EXECUTIVE INTELLIGENCE PROFILE</span>
              </h3>
              <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-300">
                OFFICIAL RECORD
              </span>
            </div>

            {/* Render based on Record Type */}
            {record.type === "personnel" && (
              <div className="space-y-4 text-xs font-sans text-stone-200 leading-relaxed">
                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">BIOGRAPHY & SERVICE RECORD:</h4>
                  <p className="bg-stone-50 border border-stone-200 p-3 rounded text-stone-200 font-mono text-[11px]">
                    {(record as PersonnelRecord).biography}
                  </p>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">PSYCHOLOGICAL ASSESSMENT:</h4>
                  <p className={`p-3 rounded font-mono text-[11px] ${
                    isRestricted ? "bg-stone-900 text-stone-100 select-none" : "bg-stone-50 border border-stone-200 text-stone-200"
                  }`}>
                    {isRestricted ? "PSYCH PROFILE REDACTED UNDER SIS CHARTER SECTION 19" : (record as PersonnelRecord).psychologicalProfile}
                  </p>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">TACTICAL CAPABILITIES:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(record as PersonnelRecord).skills.map((skill, idx) => (
                      <span key={idx} className="bg-stone-100 border border-stone-300 px-2 py-1 rounded text-[11px] font-mono font-medium text-stone-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Known Associates with Cross-linking */}
                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">KNOWN ASSOCIATES & LIAISONS:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(record as PersonnelRecord).knownAssociates.map((associate, idx) => (
                      <span 
                        key={idx}
                        className="bg-stone-100 border border-stone-300 hover:border-amber-600 hover:bg-amber-50 px-2.5 py-1 rounded text-stone-200 text-xs font-mono flex items-center space-x-1 cursor-pointer transition-colors"
                        onClick={() => {
                          if (associate.includes("007")) onNavigateToRecord("pers-007");
                          else if (associate.includes("M (Chief")) onNavigateToRecord("pers-m");
                          else if (associate.includes("Q (Quarter")) onNavigateToRecord("pers-q");
                          else if (associate.includes("Moneypenny")) onNavigateToRecord("pers-moneypenny");
                          else if (associate.includes("Felix Leiter")) onNavigateToRecord("pers-leiter");
                        }}
                      >
                        <span>{associate}</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {record.type === "operations" && (
              <div className="space-y-4 text-xs font-sans text-stone-200 leading-relaxed">
                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">MISSION BRIEFING:</h4>
                  <p className="bg-stone-50 border border-stone-200 p-3 rounded font-mono text-[11px] text-stone-200">
                    {(record as OperationRecord).briefing}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded">
                    <span className="font-bold text-emerald-900 block mb-1 text-[10px]">PRIMARY OBJECTIVE:</span>
                    <span className="text-emerald-950">{(record as OperationRecord).primaryObjective}</span>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <span className="font-bold text-red-900 block mb-1 text-[10px]">OUTCOME:</span>
                    <span className="font-bold text-red-950">{(record as OperationRecord).outcome}</span>
                  </div>
                </div>

                {/* Operation Timeline */}
                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">CHRONOLOGICAL ENGAGEMENT TIMELINE:</h4>
                  <div className="space-y-1.5 font-mono text-[11px] bg-stone-50 border border-stone-200 p-3 rounded">
                    {(record as OperationRecord).timeline.map((item, idx) => (
                      <div key={idx} className="flex space-x-3 items-baseline border-b border-stone-200/60 pb-1 last:border-none">
                        <span className="text-amber-700 font-bold shrink-0">{item.time}</span>
                        <span className="text-stone-700">{item.event}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cross Links to related files */}
                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">REFERENCED ARCHIVAL FILES:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(record as OperationRecord).relatedFiles.map((fileId, idx) => (
                      <button
                        key={idx}
                        onClick={() => onNavigateToRecord(fileId)}
                        className="bg-stone-100 hover:bg-amber-100 border border-stone-300 px-2.5 py-1 rounded font-mono text-xs text-stone-200 flex items-center space-x-1"
                      >
                        <FileCheck className="w-3 h-3 text-amber-700" />
                        <span>{fileId}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {record.type === "equipment" && (
              <div className="space-y-4 text-xs font-sans text-stone-200 leading-relaxed">
                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">OPERATIONAL PURPOSE:</h4>
                  <p className="bg-stone-50 border border-stone-200 p-3 rounded font-mono text-[11px]">
                    {(record as EquipmentRecord).operationalPurpose}
                  </p>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">CONCEALED FUNCTIONS:</h4>
                  <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-stone-200">
                    {(record as EquipmentRecord).concealedFunctions.map((fn, idx) => (
                      <li key={idx}>{fn}</li>
                    ))}
                  </ul>
                </div>

                {/* Technical Specifications Inset Table */}
                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">Q-BRANCH TECHNICAL SPECIFICATIONS:</h4>
                  <div className="bg-stone-50 border border-stone-200 rounded overflow-hidden font-mono text-xs">
                    <table className="w-full text-left">
                      <tbody>
                        {Object.entries((record as EquipmentRecord).technicalSpecifications).map(([k, v], idx) => (
                          <tr key={idx} className="border-b border-stone-200 last:border-none">
                            <td className="p-2 font-semibold text-stone-600 bg-stone-100 w-1/3">{k}</td>
                            <td className="p-2 text-stone-100">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {record.type === "vehicles" && (
              <div className="space-y-4 text-xs font-sans text-stone-200 leading-relaxed">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center">
                  <div className="bg-stone-100 border border-stone-200 p-2 rounded">
                    <span className="text-stone-500 text-[10px] block">TOP SPEED</span>
                    <span className="font-bold text-stone-100 text-xs">{(record as VehicleRecord).performance.topSpeed}</span>
                  </div>
                  <div className="bg-stone-100 border border-stone-200 p-2 rounded">
                    <span className="text-stone-500 text-[10px] block">0-60 MPH</span>
                    <span className="font-bold text-stone-100 text-xs">{(record as VehicleRecord).performance.acceleration}</span>
                  </div>
                  <div className="bg-stone-100 border border-stone-200 p-2 rounded">
                    <span className="text-stone-500 text-[10px] block">RANGE</span>
                    <span className="font-bold text-stone-100 text-xs">{(record as VehicleRecord).performance.range}</span>
                  </div>
                  <div className="bg-stone-100 border border-stone-200 p-2 rounded">
                    <span className="text-stone-500 text-[10px] block">ARMOUR</span>
                    <span className="font-bold text-stone-100 text-[11px] truncate">TITANIUM/KEVLAR</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">TACTICAL WEAPONS ARRAY:</h4>
                  <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-stone-200">
                    {(record as VehicleRecord).weapons.map((w, idx) => (
                      <li key={idx} className="font-medium">{w}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">DEFENSIVE COUNTERMEASURES:</h4>
                  <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-stone-200">
                    {(record as VehicleRecord).defensiveSystems.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {record.type === "locations" && (
              <div className="space-y-4 text-xs font-sans text-stone-200 leading-relaxed">
                <div className="bg-stone-50 border border-stone-200 p-3 rounded font-mono text-xs flex justify-between items-center">
                  <div>
                    <span className="text-stone-500 text-[10px] block">GEOGRAPHIC COORDINATES:</span>
                    <span className="font-bold text-stone-100">{(record as LocationRecord).coordinates.display}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-500 text-[10px] block">SOVEREIGN NATION:</span>
                    <span className="font-bold text-stone-100">{(record as LocationRecord).country}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">STRATEGIC IMPORTANCE:</h4>
                  <p className="bg-stone-50 border border-stone-200 p-3 rounded font-mono text-[11px]">
                    {(record as LocationRecord).strategicImportance}
                  </p>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">INTELLIGENCE SUMMARY:</h4>
                  <p className="bg-stone-50 border border-stone-200 p-3 rounded font-mono text-[11px]">
                    {(record as LocationRecord).intelligenceSummary}
                  </p>
                </div>
              </div>
            )}

            {record.type === "organizations" && (
              <div className="space-y-4 text-xs font-sans text-stone-200 leading-relaxed">
                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">IDEOLOGICAL DOCTRINE:</h4>
                  <p className="bg-stone-50 border border-stone-200 p-3 rounded font-mono text-[11px]">
                    {(record as OrganizationRecord).ideology}
                  </p>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">RESOURCES & ASSETS:</h4>
                  <p className="bg-stone-50 border border-stone-200 p-3 rounded font-mono text-[11px]">
                    {(record as OrganizationRecord).resources}
                  </p>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">LEADERSHIP & DIRECTORS:</h4>
                  <div className="flex flex-wrap gap-2 font-mono text-xs">
                    {(record as OrganizationRecord).leadership.map((leader, idx) => (
                      <span key={idx} className="bg-stone-100 border border-stone-300 px-2.5 py-1 rounded text-stone-200">
                        {leader}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {record.type === "assets" && (
              <div className="space-y-4 text-xs font-sans text-stone-200 leading-relaxed">
                <div className="bg-stone-50 border border-stone-200 p-3 rounded font-mono text-xs grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-500 text-[10px] block">HANDLER:</span>
                    <span className="font-bold text-stone-100">{(record as AssetRecord).handler}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">MOTIVATION:</span>
                    <span className="font-bold text-stone-100">{(record as AssetRecord).motivation}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-stone-700 uppercase mb-1 text-[11px]">INTELLIGENCE DELIVERED:</h4>
                  <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-stone-200">
                    {(record as AssetRecord).intelligenceSupplied.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Confidential Notes & Editable Archival Debrief */}
          <div className="bg-white/[0.03] border-2 border-black rounded-xl p-5 shadow-sm font-mono text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="font-bold text-stone-100 uppercase tracking-wider flex items-center space-x-2 text-[11px]">
                <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                <span>CONFIDENTIAL FIELD NOTES & REVISIONS</span>
              </span>
              {onUpdateRecord && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-[10px] bg-stone-100 hover:bg-stone-200 border border-stone-300 px-2 py-0.5 rounded text-stone-700 font-bold"
                >
                  {isEditing ? "CANCEL" : "AMEND NOTES"}
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-stone-50 border-2 border-stone-400 p-3 rounded font-mono text-xs text-stone-100 focus:outline-none focus:border-amber-600"
                  placeholder="Enter updated field intelligence notes..."
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleSaveNotes}
                    className="bg-stone-900 hover:bg-black text-white px-3 py-1.5 rounded font-bold flex items-center space-x-1 text-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>SAVE AMENDMENT</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className={`p-3 rounded font-mono text-[11px] leading-relaxed ${
                isRestricted ? "bg-stone-900 text-stone-100 select-none" : "bg-stone-50 border border-stone-200 text-stone-200"
              }`}>
                {isRestricted ? (
                  "CONFIDENTIAL FIELD NOTES REDACTED UNDER OFFICIAL SECRETS ACT"
                ) : (
                  editedNotes || "No supplementary field notes appended to this registry record."
                )}
              </div>
            )}

            {saveSuccess && (
              <div className="text-emerald-700 bg-emerald-50 border border-emerald-300 p-2 rounded text-[11px] flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>AMENDMENT PERSISTED TO CENTRAL MI6 REGISTRY</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
