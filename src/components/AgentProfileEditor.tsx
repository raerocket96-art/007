import React, { useState, useEffect } from "react";
import { AgentOperative, PersonnelRecord, MI6DatabaseStore } from "../types";
import { 
  User, 
  Shield, 
  Camera, 
  Key, 
  Award, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Fingerprint, 
  Globe, 
  SlidersHorizontal,
  Bookmark,
  Check,
  Eye,
  Crosshair,
  Info,
  ShieldCheck,
  Zap,
  HelpCircle,
  X
} from "lucide-react";
import { soundManager } from "../utils/sound";
import { toastManager } from "../utils/toast";

interface AgentProfileEditorProps {
  initialProfile?: AgentOperative;
  store?: MI6DatabaseStore;
  onSaveProfile?: (updatedAgent: AgentOperative, newPersonnelRecord?: PersonnelRecord) => void;
  onClose?: () => void;
}

const PRESET_AVATARS = [
  { label: "Commander (Connery Era)", url: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Sean_Connery.jpg" },
  { label: "Operative (Craig Era)", url: "https://upload.wikimedia.org/wikipedia/commons/8/84/Daniel_Craig_2007.jpg" },
  { label: "Special Agent (Brosnan Era)", url: "https://upload.wikimedia.org/wikipedia/commons/1/1c/PierceBrosnan%28CannesPhotoCall%29.jpg" },
  { label: "Field Agent (Moore Era)", url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Roger_Moore_c._1960.jpg" },
  { label: "Tactical Agent (Dalton Era)", url: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Timothy_Dalton_1987.jpg" },
  { label: "Operative (Lazenby Era)", url: "https://upload.wikimedia.org/wikipedia/commons/b/b9/George_Lazenby_2001.jpg" },
  { label: "Clandestine Commando", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" },
  { label: "Intelligence Liaison", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80" },
  { label: "Special Operations Officer", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80" }
];

const PRESET_SKILLS = [
  "Precision Marksmanship (9mm)",
  "Covert Infiltration & Surveillance",
  "High-Speed Evasive Driving",
  "Close-Quarters Combat & Krav Maga",
  "High-Stakes Gambling Psychology",
  "Demolitions & Breaching",
  "Cryptanalysis & Cyber SIGINT",
  "Deep-Sea Rebreather Operations",
  "Deep Cover Impersonation",
  "Seduction & Social Tradecraft",
  "Lockpicking & Safecracking",
  "Heli-Tactical Extraction"
];

const PRESET_LOYALTIES = [
  "The Crown & Secret Intelligence Service",
  "00-Section Esprit de Corps",
  "HM Cabinet Office & Joint Intelligence Committee",
  "CIA Special Activities Division Liaison",
  "Independent Mercenary / Financial Compensation",
  "Personal Vengeance & Sovereign Honor"
];

export const AgentProfileEditor: React.FC<AgentProfileEditorProps> = ({
  initialProfile,
  store,
  onSaveProfile,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<"IDENTITY" | "APPEARANCE" | "DOSSIER" | "PREVIEW">("IDENTITY");

  // State fields
  const [callsign, setCallsign] = useState(initialProfile?.callsign || "007");
  const [name, setName] = useState(initialProfile?.name || "Commander James Bond, CMG, RN");
  const [serviceNumber, setServiceNumber] = useState(initialProfile?.serviceNumber || "RN-771802-007");
  const [rank, setRank] = useState(initialProfile?.rank || "Commander, Royal Navy Reserve");
  const [role, setRole] = useState(initialProfile?.role || "Senior Field Operator, 00-Section");
  const [department, setDepartment] = useState(initialProfile?.department || "00-Section (Executive Action)");
  const [clearanceLevel, setClearanceLevel] = useState<number>(initialProfile?.clearanceLevel ?? 9);
  const [discretionaryLicence, setDiscretionaryLicence] = useState(initialProfile?.discretionaryLicence ?? true);
  
  // Physical Traits & Appearance
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatarUrl || PRESET_AVATARS[0].url);
  const [nationality, setNationality] = useState(initialProfile?.nationality || "British (Scottish / Swiss descent)");
  const [eyeColor, setEyeColor] = useState(initialProfile?.eyeColor || "Blue-Grey");
  const [height, setHeight] = useState(initialProfile?.height || "183 cm");
  const [hairColor, setHairColor] = useState(initialProfile?.hairColor || "Dark Brown");
  const [dateOfBirth, setDateOfBirth] = useState(initialProfile?.dateOfBirth || "13-APR-1968");
  const [biometricCode, setBiometricCode] = useState(initialProfile?.biometricCode || "FP-UK-007-88219-ALPHA");
  const [physicalDescription, setPhysicalDescription] = useState(initialProfile?.physicalDescription || "Athletic build, facial scar on right cheek, bullet trauma right shoulder.");

  // Dossier & Psych
  const [biography, setBiography] = useState(initialProfile?.biography || "Orphaned early; educated at Fettes College and Britannia Royal Naval College Dartmouth. Commissioned into Naval Intelligence Division during Cold War tensions before induction into the Double-O section.");
  const [psychologicalProfile, setPsychologicalProfile] = useState(initialProfile?.psychologicalProfile || "Exceptionally high stress threshold; clinical detachment under mortal peril; slight pathological resistance to bureaucratic authority. Absolute sovereign loyalty.");
  const [confidentialNotes, setConfidentialNotes] = useState(initialProfile?.confidentialNotes || "Authorized for discretionary executive action under 00-Section Charter. Expenditure on martinis and continental tailoring continuously monitored.");

  // Skills & Loyalties
  const [skills, setSkills] = useState<string[]>(initialProfile?.skills || [
    "Precision Marksmanship (9mm)",
    "Covert Infiltration & Surveillance",
    "High-Speed Evasive Driving",
    "Close-Quarters Combat & Krav Maga",
    "High-Stakes Gambling Psychology"
  ]);
  const [customSkill, setCustomSkill] = useState("");
  const [loyalties, setLoyalties] = useState(initialProfile?.loyalties || "The Crown & Secret Intelligence Service");

  const generateServiceNumber = () => {
    soundManager.playClick();
    const stamp = Math.floor(100000 + Math.random() * 900000);
    const num = `RN-${stamp}-${callsign.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "007"}`;
    setServiceNumber(num);
  };

  const generateBiometricCode = () => {
    soundManager.playClick();
    const stamp = Math.floor(10000 + Math.random() * 90000);
    const code = `FP-UK-${callsign.toUpperCase()}-${stamp}-ALPHA`;
    setBiometricCode(code);
  };

  const toggleSkill = (skill: string) => {
    soundManager.playClick();
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (!customSkill.trim()) return;
    soundManager.playClick();
    if (!skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
    }
    setCustomSkill("");
  };

  const handleSave = () => {
    soundManager.playAccessGranted();

    const clearanceLabel = 
      clearanceLevel >= 9 ? "LEVEL 9 — 00-SECTION // EYES ONLY" :
      clearanceLevel >= 7 ? "LEVEL 7 — TOP SECRET // CABINET OFFICE" :
      clearanceLevel >= 5 ? "LEVEL 5 — SECRET // WHITEHALL DISPATCH" : "LEVEL 3 — RESTRICTED DIPLOMATIC";

    const updatedAgent: AgentOperative = {
      id: initialProfile?.id || `agent-${Date.now()}`,
      callsign: callsign.trim() || "007",
      name: name.trim() || "Commander James Bond",
      serviceNumber: serviceNumber.trim() || "RN-771802-007",
      role: role.trim() || "Senior Field Operator, 00-Section",
      rank: rank.trim() || "Commander",
      department: department.trim() || "00-Section",
      clearanceLevel,
      clearanceLabel,
      discretionaryLicence,
      passcode: initialProfile?.passcode || "ALPHA-007",
      biometricCode,
      avatarUrl,
      allowedTabs: ["command", "simulator", "operations", "database", "graph", "movies", "persona", "admin", "system"],
      nationality,
      eyeColor,
      height,
      hairColor,
      dateOfBirth,
      physicalDescription,
      biography,
      psychologicalProfile,
      confidentialNotes,
      skills,
      loyalties
    };

    // Also construct matching PersonnelRecord for the database store
    const personnelRecord: PersonnelRecord = {
      id: `pers-${updatedAgent.callsign.toLowerCase().replace(/[^a-z0-9]/g, "") || "007"}`,
      type: "personnel",
      referenceNumber: `SIS-PERS-${updatedAgent.callsign.toUpperCase().replace(/[^A-Z0-9]/g, "")}-UK`,
      name: updatedAgent.name,
      alias: updatedAgent.callsign,
      serviceNumber: updatedAgent.serviceNumber,
      role: updatedAgent.role,
      rank: updatedAgent.rank,
      organization: `MI6 (${updatedAgent.department})`,
      nationality: updatedAgent.nationality || "British",
      currentStatus: "ACTIVE",
      classification: clearanceLevel >= 9 ? "TOP SECRET" : "SECRET",
      clearanceRequired: clearanceLevel,
      lastUpdated: new Date().toISOString(),
      skills: updatedAgent.skills || [],
      psychologicalProfile: updatedAgent.psychologicalProfile || "Verified operative.",
      loyalties: updatedAgent.loyalties || "The Crown",
      knownAssociates: ["M (Chief SIS)", "Q (Quartermaster)", "Miss Moneypenny", "Felix Leiter"],
      missionHistory: ["Operation Danube", "Operation GoldenEye", "Operation Casino Royale"],
      injuries: ["Field scars confirmed in biometric file"],
      equipment: ["Walther PPK/S 9mm", "Omega Seamaster Laser Chronometer"],
      biography: updatedAgent.biography || "Commissioned MI6 operative.",
      confidentialNotes: updatedAgent.confidentialNotes || "Verified Double-O asset.",
      threatRating: "FRIENDLY ASSET",
      reliabilityRating: 98,
      fingerprintCode: updatedAgent.biometricCode,
      dateOfBirth: updatedAgent.dateOfBirth,
      height: updatedAgent.height,
      eyeColor: updatedAgent.eyeColor,
      imageUrl: updatedAgent.avatarUrl
    };

    if (onSaveProfile) {
      onSaveProfile(updatedAgent, personnelRecord);
    }

    toastManager.success("OPERATIVE DOSSIER COMMISSIONED", `Agent profile updated: ${updatedAgent.name} (${updatedAgent.callsign})`, "PROFILE-UPDATED");
    if (onClose) onClose();
  };

  return (
    <div className="mi6-swap-panel rounded-[28px] border border-white/12 bg-[#090c11] shadow-2xl p-5 sm:p-6 font-mono text-stone-200 max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                00-SECTION CENTRAL REGISTRY // PROFILE CREATOR
              </span>
              <span className="bg-red-950 text-red-300 border border-red-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                CLEARANCE LEVEL {clearanceLevel}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight mt-0.5">
              MI6 Operative Dossier Commissioning
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Subtabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {[
          { id: "IDENTITY", label: "01. IDENTITY & RANK", icon: ShieldCheck },
          { id: "APPEARANCE", label: "02. APPEARANCE & TRAITS", icon: Eye },
          { id: "DOSSIER", label: "03. SKILLS & PSYCHOLOGY", icon: FileText },
          { id: "PREVIEW", label: "04. DOSSIER PREVIEW", icon: Fingerprint }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                isActive
                  ? "bg-amber-500 text-black shadow-lg"
                  : "bg-white/[0.03] hover:bg-white/[0.08] text-stone-400 hover:text-stone-200 border border-white/8"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Identity, Service Number, Rank & Role */}
      {activeTab === "IDENTITY" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Operative Callsign / Codename
              </label>
              <input
                type="text"
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder="e.g. 007, VANGUARD, FOXTHROAT"
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Full Legal Identity & Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Commander James Bond, CMG, RN"
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-stone-400 font-bold uppercase">
                  Service Number
                </label>
                <button
                  type="button"
                  onClick={generateServiceNumber}
                  className="text-[9px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> AUTO-GENERATE
                </button>
              </div>
              <input
                type="text"
                value={serviceNumber}
                onChange={(e) => setServiceNumber(e.target.value)}
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Naval / Military Rank
              </label>
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. Commander, Royal Navy Reserve"
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Primary Operational Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Field Operator, 00-Section"
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                MI6 Department / Section
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="00-Section (Executive Action)">00-Section (Executive Action)</option>
                <option value="Directorate of Operations">Directorate of Operations</option>
                <option value="Q-Branch Technical Division">Q-Branch Technical Division</option>
                <option value="Station V Vienna">Station V (Vienna / Central Europe)</option>
                <option value="GCHQ Foreign Signals Liaison">GCHQ Foreign Signals Liaison</option>
              </select>
            </div>

          </div>

          {/* Clearance Level & 00 Licence Toggle */}
          <div className="mi6-swap-panel-soft rounded-2xl p-4 space-y-3 border border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  SECURITY CLASSIFICATION & LICENCE
                </span>
                <span className="text-xs text-stone-300 font-bold">
                  Requisition Clearance Level: {clearanceLevel}
                </span>
              </div>

              <label className="flex items-center space-x-2 bg-red-950/40 border border-red-800/80 px-3 py-1.5 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={discretionaryLicence}
                  onChange={(e) => setDiscretionaryLicence(e.target.checked)}
                  className="accent-amber-500"
                />
                <span className="text-[10px] font-black text-red-300 uppercase tracking-wider">
                  00 DISCRETIONARY LICENCE TO KILL
                </span>
              </label>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px]">
              {[1, 3, 5, 7, 9, 10].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setClearanceLevel(lvl)}
                  className={`p-2 rounded-xl border transition-all ${
                    clearanceLevel === lvl
                      ? "bg-amber-500 text-black border-amber-400 font-black shadow"
                      : "bg-white/5 text-stone-400 border-white/10 hover:border-stone-500"
                  }`}
                >
                  <span className="block text-[8px] opacity-75">LEVEL</span>
                  <span className="font-bold text-xs">{lvl}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Appearance & Physical Traits */}
      {activeTab === "APPEARANCE" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Avatar Gallery Selector */}
          <div>
            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-2">
              Select Agent Portrait / Avatar Preset
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {PRESET_AVATARS.map((preset, idx) => {
                const isSelected = avatarUrl === preset.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setAvatarUrl(preset.url);
                    }}
                    className={`relative rounded-xl border overflow-hidden transition-all group ${
                      isSelected ? "border-amber-400 ring-2 ring-amber-500/50 scale-105" : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover grayscale contrast-125 group-hover:scale-110 transition-transform" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-amber-300 font-black" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
              Custom Portrait Image URL (Optional)
            </label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 focus:border-amber-500 focus:outline-none font-mono"
            />
          </div>

          {/* Physical Traits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Nationality
              </label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g. British (Scottish / Swiss descent)"
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Date of Birth
              </label>
              <input
                type="text"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                placeholder="e.g. 13-APR-1968"
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Height
              </label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 183 cm"
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Eye Color
              </label>
              <input
                type="text"
                value={eyeColor}
                onChange={(e) => setEyeColor(e.target.value)}
                placeholder="e.g. Blue-Grey"
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Hair Color
              </label>
              <input
                type="text"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
                placeholder="e.g. Dark Brown / Black"
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-stone-100"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-stone-400 font-bold uppercase">
                  Biometric Fingerprint Code
                </label>
                <button
                  type="button"
                  onClick={generateBiometricCode}
                  className="text-[9px] text-amber-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> RE-GEN
                </button>
              </div>
              <input
                type="text"
                value={biometricCode}
                onChange={(e) => setBiometricCode(e.target.value)}
                className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-stone-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
              Physical Traits & Distinguishing Features
            </label>
            <textarea
              rows={2}
              value={physicalDescription}
              onChange={(e) => setPhysicalDescription(e.target.value)}
              placeholder="e.g. Athletic build, facial scar on right cheek, minor bullet trauma shoulder."
              className="w-full bg-[#12151c] border border-white/10 rounded-xl p-3 text-xs text-stone-100"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Skills, Bio & Psychology */}
      {activeTab === "DOSSIER" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Starting Skills Selector */}
          <div>
            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-2">
              Starting Espionage Skills (Select Active Capabilities)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SKILLS.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                        : "bg-white/5 border-white/10 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}{skill}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add custom espionage skill..."
                className="flex-1 bg-[#12151c] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-stone-100"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 py-1.5 rounded-xl text-xs"
              >
                ADD SKILL
              </button>
            </div>
          </div>

          {/* Primary Loyalties */}
          <div>
            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
              Primary Sovereign Loyalty
            </label>
            <select
              value={loyalties}
              onChange={(e) => setLoyalties(e.target.value)}
              className="w-full bg-[#12151c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 mb-2"
            >
              {PRESET_LOYALTIES.map(loyalty => (
                <option key={loyalty} value={loyalty}>{loyalty}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
              Brief Biography & Naval/Military Career
            </label>
            <textarea
              rows={3}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Orphaned early; educated at Fettes College. Inducted into Naval Intelligence Division..."
              className="w-full bg-[#12151c] border border-white/10 rounded-xl p-3 text-xs text-stone-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Psychological Evaluation Notes
              </label>
              <textarea
                rows={3}
                value={psychologicalProfile}
                onChange={(e) => setPsychologicalProfile(e.target.value)}
                placeholder="Exceptionally high stress threshold; clinical detachment under mortal peril..."
                className="w-full bg-[#12151c] border border-white/10 rounded-xl p-3 text-xs text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                Confidential Handler Notes
              </label>
              <textarea
                rows={3}
                value={confidentialNotes}
                onChange={(e) => setConfidentialNotes(e.target.value)}
                placeholder="Authorized for discretionary executive action under 00-Section Charter..."
                className="w-full bg-[#12151c] border border-white/10 rounded-xl p-3 text-xs text-stone-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Live Archival Dossier Preview */}
      {activeTab === "PREVIEW" && (
        <div className="dossier-paper rounded-2xl p-6 text-black space-y-4 font-mono shadow-2xl animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between border-b-2 border-black pb-3">
            <div>
              <span className="stamp-top-secret text-xs px-2 py-0.5">
                TOP SECRET // EYES ONLY
              </span>
              <h3 className="text-xl font-black mt-2 tracking-tight">
                {name || "Commander James Bond"} ({callsign})
              </h3>
              <div className="text-xs font-bold text-neutral-700">
                SERVICE NO: {serviceNumber}
              </div>
            </div>

            <div className="w-20 h-24 border-2 border-black rounded overflow-hidden bg-neutral-200">
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover grayscale contrast-125" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><strong>RANK:</strong> {rank}</div>
            <div><strong>DEPARTMENT:</strong> {department}</div>
            <div><strong>NATIONALITY:</strong> {nationality}</div>
            <div><strong>CLEARANCE:</strong> LEVEL {clearanceLevel} ({clearanceLevel >= 9 ? "00-SECTION" : "SECRET"})</div>
            <div><strong>BIOMETRIC CODE:</strong> {biometricCode}</div>
            <div><strong>00 LICENCE:</strong> {discretionaryLicence ? "GRANTED // DISCRETIONARY" : "STANDARD"}</div>
          </div>

          <div className="border-t border-black/30 pt-2 text-xs">
            <strong>STARTING SKILLS:</strong> {skills.join(" • ")}
          </div>

          <div className="border-t border-black/30 pt-2 text-xs">
            <strong>PSYCHOLOGICAL EVALUATION:</strong>
            <p className="mt-1 text-neutral-800 italic font-typewriter">{psychologicalProfile}</p>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[10px] text-stone-500 font-mono">
          COMMISSIONING AGENT: <span className="text-amber-400 font-bold">{callsign}</span> ({serviceNumber})
        </div>

        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              CANCEL
            </button>
          )}

          <button
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-6 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg transition-transform hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>SAVE & COMMISSION AGENT PROFILE</span>
          </button>
        </div>
      </div>

    </div>
  );
};
