import React, { useMemo, useState } from "react";
import { AgentOperative, AuthSession } from "../types";
import { MI6_OPERATIVES, createAuthSession } from "../data/operatives";
import { bondFilmMissionTemplates } from "../data/bondFilmMissions";
import { BOND_DOCTRINES } from "../data/bondDoctrines";
import { soundManager } from "../utils/sound";
import { ActorPortrait } from "./ActorPortrait";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Crown,
  Crosshair,
  Database,
  Fingerprint,
  Film,
  Globe,
  KeyRound,
  Lock,
  Network,
  Play,
  Radio,
  Satellite,
  Settings2,
  Shield,
  ShieldCheck,
  Sparkles,
  UserSquare2
} from "lucide-react";

export interface PreDeploymentLaunchConfig {
  missionTemplateId: string;
  doctrineId: string;
}

interface MainMenuProps {
  onLogin: (session: AuthSession, destination?: string, launchConfig?: PreDeploymentLaunchConfig) => void;
}

type Destination = {
  id: string;
  label: string;
  kicker: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const destinations: Destination[] = [
  {
    id: "simulator",
    label: "MISSION SIMULATOR",
    kicker: "00-SECTION PRIMARY",
    description: "Deploy a Bond incarnation into operational timelines and reshape the mission outcome.",
    icon: Crosshair,
    accent: "text-amber-300"
  },
  {
    id: "command",
    label: "COMMAND CENTRE",
    kicker: "LIVE OPERATIONS",
    description: "Operational overview, incoming intelligence and active deployments.",
    icon: Activity,
    accent: "text-emerald-300"
  },
  {
    id: "database",
    label: "DOSSIER ARCHIVE",
    kicker: "CENTRAL REGISTRY",
    description: "Personnel, operations, equipment, vehicles, locations and assets.",
    icon: Database,
    accent: "text-stone-200"
  },
  {
    id: "graph",
    label: "INTELLIGENCE NETWORK",
    kicker: "RELATIONSHIP ANALYSIS",
    description: "Trace agents, organizations, operations and intelligence connections.",
    icon: Network,
    accent: "text-cyan-300"
  },
  {
    id: "telemetry",
    label: "GLOBAL TELEMETRY",
    kicker: "FIELD TRACKING",
    description: "Monitor theatres, stations and operational activity around the globe.",
    icon: Satellite,
    accent: "text-sky-300"
  },
  {
    id: "admin",
    label: "ARCHIVE ADMIN",
    kicker: "LEVEL 9+",
    description: "Synthesize, edit, link and maintain classified registry material.",
    icon: Settings2,
    accent: "text-violet-300"
  }
];

const launchStats = [
  ["ARCHIVE", "77", "classified records"],
  ["OPERATIONS", "27", "Bond film files"],
  ["NETWORK", "6", "core system modules"],
  ["STATUS", "LIVE", "SIS secure link"]
];

export const MainMenu: React.FC<MainMenuProps> = ({ onLogin }) => {
  const [selectedOperativeId, setSelectedOperativeId] = useState<string>(MI6_OPERATIVES[0].id);
  const [selectedDestination, setSelectedDestination] = useState<string>("simulator");
  const [selectedFilmMissionId, setSelectedFilmMissionId] = useState<string>("");
  const [selectedDoctrineId, setSelectedDoctrineId] = useState<string>("");
  const [serviceNumber, setServiceNumber] = useState<string>(MI6_OPERATIVES[0].serviceNumber);
  const [passcode, setPasscode] = useState<string>(MI6_OPERATIVES[0].passcode);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const selectedOperative = useMemo<AgentOperative>(() => {
    return MI6_OPERATIVES.find((op) => op.id === selectedOperativeId) || MI6_OPERATIVES[0];
  }, [selectedOperativeId]);

  const destination = useMemo(() => {
    return destinations.find((item) => item.id === selectedDestination) || destinations[0];
  }, [selectedDestination]);

  const selectedFilmMission = useMemo(() => {
    return bondFilmMissionTemplates.find((mission) => mission.id === selectedFilmMissionId) || null;
  }, [selectedFilmMissionId]);

  const selectedDoctrine = useMemo(() => {
    return BOND_DOCTRINES.find((doctrine) => doctrine.id === selectedDoctrineId) || null;
  }, [selectedDoctrineId]);

  const preDeploymentReady = Boolean(selectedFilmMission && selectedDoctrine);

  const handleSelectOperative = (operative: AgentOperative) => {
    soundManager.playClick();
    setSelectedOperativeId(operative.id);
    setServiceNumber(operative.serviceNumber);
    setPasscode(operative.passcode);
    setError(null);
  };

  const handleDestination = (id: string) => {
    if (!preDeploymentReady) {
      soundManager.playAlarm();
      setError("SELECT A BOND FILM AND PREFERRED JAMES BOND BEFORE ACCESSING THE MI6 SYSTEM.");
      return;
    }
    soundManager.playClick();
    setSelectedDestination(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedFilmMission || !selectedDoctrine) {
      soundManager.playAlarm();
      setError("PRE-DEPLOYMENT LOCK ACTIVE — SELECT BOTH A BOND FILM AND YOUR PREFERRED JAMES BOND.");
      return;
    }

    const target = MI6_OPERATIVES.find(
      (op) => op.serviceNumber.trim().toUpperCase() === serviceNumber.trim().toUpperCase()
    );

    if (!target) {
      soundManager.playAlarm();
      setError("SERVICE CREDENTIAL NOT RECOGNIZED BY CENTRAL REGISTRY.");
      return;
    }

    if (passcode !== target.passcode) {
      soundManager.playAlarm();
      setError("CIPHER PASSCODE INVALID — SECURITY EVENT LOGGED.");
      return;
    }

    if (!target.allowedTabs.includes(selectedDestination)) {
      soundManager.playAlarm();
      setError(`${target.callsign} DOES NOT HOLD CLEARANCE FOR ${destination.label}. SELECT AN AUTHORIZED DESTINATION OR OPERATIVE.`);
      return;
    }

    setIsLoggingIn(true);
    soundManager.playTeletype();

    window.setTimeout(() => {
      const session = createAuthSession(target);
      soundManager.playAccessGranted();
      try {
        localStorage.setItem("mi6_preselected_film_template_v1", selectedFilmMission.id);
        localStorage.setItem("mi6_bond_doctrine_v1", selectedDoctrine.id);
        localStorage.setItem("mi6_preferred_doctrine", selectedDoctrine.id);
      } catch {}
      onLogin(session, selectedDestination, { missionTemplateId: selectedFilmMission.id, doctrineId: selectedDoctrine.id });
    }, 480);
  };

  return (
    <div className="mi6-app-shell min-h-screen overflow-hidden text-[var(--text-primary)]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="launch-ambient-bg absolute inset-0" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-y-0 left-[18%] w-px bg-gradient-to-b from-transparent via-[var(--accent-primary)]/10 to-transparent" />
        <div className="absolute inset-y-0 right-[24%] w-px bg-gradient-to-b from-transparent via-white/6 to-transparent" />
        <div className="absolute right-[-120px] top-28 h-[720px] w-[720px] rounded-full border border-amber-500/10" />
        <div className="absolute right-[-30px] top-44 h-[500px] w-[500px] rounded-full border border-amber-500/10" />
      </div>

      <div className="relative z-10 border-b border-red-900/70 bg-[#4e0c10]/70 px-5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-stone-200 flex justify-between gap-4">
        <span className="hidden sm:block">Her Majesty's Government // Eyes Only</span>
        <span className="text-red-200">MI6 // Secure Entry Terminal</span>
        <span className="hidden md:block">Section 00 // Authorized Access</span>
      </div>

      <main className="relative z-10 max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-h-[calc(100vh-30px)]">
        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_380px] gap-6 h-full">
          <aside className="mi6-swap-panel p-4 lg:p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/6">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-[0.24em] text-stone-500">MI6 // Q Branch Simulation Lab</div>
                <div className="text-lg font-black text-stone-100">Operator Roster</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/30 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-300">
                <Radio className="w-3 h-3" /> Layers 1-3 online
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {MI6_OPERATIVES.slice(0, 6).map((op) => {
                const active = op.id === selectedOperative.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => handleSelectOperative(op)}
                    className={`rounded-2xl border p-3 text-left transition-all ${
                      active
                        ? "border-amber-500/70 bg-amber-500/10 shadow-[0_16px_40px_rgba(0,0,0,.28)]"
                        : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/12"
                    }`}
                  >
                    <div className="font-black text-sm text-stone-100">{op.callsign}</div>
                    <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-stone-500">{op.callsign === "007" ? "Senior Field Operative" : op.rank}</div>
                    <div className="mt-3 text-[10px] text-stone-400">{op.name}</div>
                    <div className="mt-1 text-[9px] text-amber-300 font-mono uppercase tracking-[0.14em]">LVL {op.clearanceLevel}</div>
                  </button>
                );
              })}
            </div>

            <div className="mi6-swap-panel-soft p-4">
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-400">Active Profile</div>
              <div className="mt-3 flex gap-3 items-center">
                <img
                  src={selectedOperative.avatarUrl}
                  alt={selectedOperative.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-2xl object-cover grayscale border border-white/12"
                />
                <div>
                  <div className="text-sm font-black text-stone-100">{selectedOperative.name}</div>
                  <div className="mt-1 text-[10px] text-stone-500 uppercase tracking-[0.16em] font-mono">{selectedOperative.role}</div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-[10px] text-stone-400">
                <div className="flex items-center justify-between"><span>Service ID</span><span className="font-mono text-stone-200">{selectedOperative.serviceNumber}</span></div>
                <div className="flex items-center justify-between"><span>Clearance</span><span className="font-mono text-amber-300">{selectedOperative.clearanceLabel}</span></div>
                <div className="flex items-center justify-between"><span>Discretionary</span><span className="font-mono text-stone-200">{selectedOperative.discretionaryLicence ? "00 ACTIVE" : "LIMITED"}</span></div>
              </div>
            </div>

            <div className="mi6-swap-panel-soft p-4 mt-auto">
              <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-stone-500">Launch Network</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {launchStats.map(([label, value, caption]) => (
                  <div key={label} className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
                    <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-stone-600">{label}</div>
                    <div className="mt-1 text-lg font-black text-stone-100">{value}</div>
                    <div className="text-[9px] text-stone-500">{caption}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex flex-col gap-6 min-w-0">
            <div className="mi6-swap-panel relative overflow-hidden px-6 py-6 lg:px-8 lg:py-8 min-h-[340px] flex flex-col justify-between">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_26%,rgba(197,156,76,0.12),transparent_22%),radial-gradient(circle_at_88%_40%,rgba(59,130,246,0.08),transparent_22%)]" />
              <div className="absolute right-[-160px] top-[-110px] h-[420px] w-[420px] rounded-full border border-amber-500/10" />
              <div className="absolute right-[-70px] top-[30px] h-[260px] w-[260px] rounded-full border border-amber-500/10" />
              <div className="absolute bottom-0 right-8 text-[140px] leading-none font-black text-white/[0.03] select-none">007</div>

              <div className="relative z-10 flex items-center justify-between gap-4 flex-wrap">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/25 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300">
                  <Sparkles className="w-3 h-3" /> Secure Intelligence Service // Live Entry
                </div>
                <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.15em]">
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-stone-300 inline-flex items-center gap-1.5"><Globe className="w-3 h-3 text-cyan-300" /> Network synchronized</span>
                  <span className="rounded-full border border-amber-700/40 bg-amber-500/10 px-3 py-1.5 text-amber-300 inline-flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Clearance routing ready</span>
                </div>
              </div>

              <div className="relative z-10 max-w-4xl mt-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-stone-500">Secret Intelligence Service // Central Registry</div>
                <h1 className="mi6-display-title mt-5 text-5xl sm:text-6xl lg:text-7xl leading-[0.9] text-stone-100 max-w-5xl">
                  MI6 Classified Operations Archive
                </h1>
                <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-stone-400">
                  Enter a premium Bond-era simulation environment. Select your operative, lock your destination and access the mission network, dossier archive and intelligence systems from one unified MI6 launch screen.
                </p>
              </div>

              <div className="relative z-10 mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { icon: Crosshair, label: "Simulation", value: "Deploy Bond into live mission timelines" },
                  { icon: Database, label: "Archive", value: "Browse dossiers, equipment and personnel" },
                  { icon: Network, label: "Intelligence", value: "Track connections, signals and global telemetry" }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-2xl border border-white/6 bg-black/20 px-4 py-4 backdrop-blur-sm">
                      <div className="w-10 h-10 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center justify-center text-amber-300 mb-3"><Icon className="w-4 h-4" /></div>
                      <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-stone-500">{item.label}</div>
                      <div className="mt-2 text-sm font-semibold text-stone-100 leading-relaxed">{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mi6-swap-panel p-5 lg:p-6 border border-amber-500/20">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-amber-400">00-SECTION // PRE-DEPLOYMENT LOCK</div>
                  <div className="text-2xl font-black text-stone-100 mt-1">Choose film + preferred Bond</div>
                  <p className="mt-2 max-w-3xl text-xs leading-relaxed text-stone-500">
                    Both selections are mandatory. The archive, destinations and launch terminal remain locked until you confirm the film operation and the James Bond you prefer to play. The final debrief will independently judge whether your recorded choices actually match that Bond.
                  </p>
                </div>
                <div className={`rounded-full border px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.16em] ${preDeploymentReady ? "border-emerald-700/50 bg-emerald-500/10 text-emerald-300" : "border-red-800/50 bg-red-950/30 text-red-300"}`}>
                  {preDeploymentReady ? "2 / 2 CONFIRMED" : `${(selectedFilmMission ? 1 : 0) + (selectedDoctrine ? 1 : 0)} / 2 REQUIRED`}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1.05fr_1.4fr] gap-4">
                <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.18em] text-stone-500">
                    <Film className="w-4 h-4 text-amber-300" /> 01 // Bond film
                  </div>
                  <select
                    value={selectedFilmMissionId}
                    onChange={(e) => { soundManager.playClick(); setSelectedFilmMissionId(e.target.value); setError(null); }}
                    className="mt-3 w-full rounded-xl border border-white/12 bg-[#0b0f14] px-3 py-3 text-[11px] font-mono text-stone-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="">SELECT A FILM OPERATION…</option>
                    <optgroup label="EON JAMES BOND FILMS">
                      {bondFilmMissionTemplates.filter((m) => !m.codename.startsWith("LEGACY")).map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </optgroup>
                    <optgroup label="LEGACY / NON-EON">
                      {bondFilmMissionTemplates.filter((m) => m.codename.startsWith("LEGACY")).map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="mt-3 min-h-[66px] rounded-xl border border-white/6 bg-white/[0.02] p-3">
                    {selectedFilmMission ? (
                      <>
                        <div className="flex items-center gap-2 text-emerald-300 text-[9px] font-mono uppercase tracking-[0.16em]"><CheckCircle2 className="w-3.5 h-3.5" /> Film confirmed</div>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="text-xs font-bold text-[var(--text-primary)]">{selectedFilmMission.title}</div>
                          <div className="shrink-0 rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[8px] font-mono text-[var(--text-muted)]">{selectedFilmMission.year || "FILM OP"}</div>
                        </div>
                        <div className="mt-1 text-[8px] font-mono uppercase tracking-[0.12em] text-[var(--accent-primary)] line-clamp-1">{selectedFilmMission.location}</div>
                        <div className="mt-1.5 text-[10px] leading-relaxed text-[var(--text-muted)] line-clamp-2">{selectedFilmMission.objective}</div>
                      </>
                    ) : (
                      <div className="text-[10px] leading-relaxed text-stone-600">No film selected. Mission routing remains sealed.</div>
                    )}
                  </div>
                </div>

                <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.18em] text-stone-500">
                    <Crown className="w-4 h-4 text-amber-300" /> 02 // Preferred James Bond
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BOND_DOCTRINES.map((doctrine) => {
                      const active = doctrine.id === selectedDoctrineId;
                      return (
                        <button
                          key={doctrine.id}
                          type="button"
                          onClick={() => { soundManager.playClick(); setSelectedDoctrineId(doctrine.id); setError(null); }}
                          className={`bond-actor-card group relative overflow-hidden rounded-2xl border text-left transition-all ${active ? "is-active" : ""}`}
                        >
                          <ActorPortrait
                            src={doctrine.portraitUrl}
                            name={doctrine.name}
                            className="h-24 sm:h-28 w-full border-b border-white/8"
                            imgClassName="grayscale group-hover:grayscale-0 transition-all duration-300"
                          />
                          <div className="p-2.5">
                            <div className="truncate text-[10px] font-black text-[var(--text-primary)]">{doctrine.name}</div>
                            <div className="mt-1 text-[7px] font-mono text-[var(--text-muted)]">{doctrine.era}</div>
                          </div>
                          {active && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-primary)] text-[var(--accent-contrast)] shadow-lg"><CheckCircle2 className="h-3.5 w-3.5" /></span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 rounded-xl border border-white/6 bg-white/[0.02] p-3 min-h-[58px]">
                    {selectedDoctrine ? (
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[9px] font-mono uppercase tracking-[0.16em] text-emerald-300">Preferred Bond confirmed</div>
                          <div className="mt-1 text-xs font-bold text-stone-200">{selectedDoctrine.name}</div>
                        </div>
                        <div className="text-[8px] font-mono uppercase tracking-[0.14em] text-stone-600">AI verdict comes after mission</div>
                      </div>
                    ) : (
                      <div className="text-[10px] leading-relaxed text-stone-600">No Bond selected. Actor preference must be explicitly confirmed.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`mi6-swap-panel p-5 lg:p-6 relative ${!preDeploymentReady ? "opacity-45" : ""}`}>
              {!preDeploymentReady && (
                <div className="absolute inset-0 z-20 rounded-[inherit] bg-[#090c11]/35 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="rounded-2xl border border-red-800/40 bg-[#100c0e]/95 px-5 py-3 text-center shadow-2xl">
                    <Lock className="w-4 h-4 text-red-300 mx-auto" />
                    <div className="mt-2 text-[9px] font-mono uppercase tracking-[0.18em] text-red-300">Locked // Film + Bond required</div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-stone-500">Destination Matrix</div>
                  <div className="text-2xl font-black text-stone-100 mt-1">Select destination</div>
                </div>
                <div className="rounded-full border border-amber-700/40 bg-amber-500/10 px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.16em] text-amber-300">
                  Post-login routing goes directly here
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {destinations.map((item) => {
                  const Icon = item.icon;
                  const active = selectedDestination === item.id;
                  const permitted = selectedOperative.allowedTabs.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleDestination(item.id)}
                      disabled={!preDeploymentReady}
                      className={`group rounded-[22px] border p-4 text-left transition-all ${
                        active
                          ? "border-amber-500/60 bg-amber-500/10 shadow-[0_18px_44px_rgba(0,0,0,.28)]"
                          : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/12"
                      } ${!permitted ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${active ? "border-amber-500/30 bg-amber-500/10" : "border-white/8 bg-black/20"}`}>
                          <Icon className={`w-5 h-5 ${item.accent}`} />
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${active ? "text-amber-300" : "text-stone-600 group-hover:text-stone-300"}`} />
                      </div>
                      <div className="mt-4 text-[8px] font-mono uppercase tracking-[0.22em] text-stone-600">{item.kicker}</div>
                      <div className={`mt-1 text-sm font-black ${active ? "text-amber-100" : "text-stone-100"}`}>{item.label}</div>
                      <p className="mt-2 text-xs leading-relaxed text-stone-500">{item.description}</p>
                      {!permitted && <div className="mt-3 text-[8px] font-mono uppercase tracking-[0.16em] text-red-400">Current operative lacks clearance</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-5">
            <section className={`mi6-swap-panel p-5 lg:p-6 relative ${!preDeploymentReady ? "opacity-55" : ""}`}>
              {!preDeploymentReady && (
                <div className="absolute inset-0 z-20 rounded-[inherit] bg-[#090c11]/50 backdrop-blur-[1px] flex items-center justify-center p-6">
                  <div className="w-full rounded-2xl border border-red-800/40 bg-[#100c0e]/95 px-5 py-4 text-center shadow-2xl">
                    <Lock className="w-5 h-5 text-red-300 mx-auto" />
                    <div className="mt-2 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-red-300">Launch terminal locked</div>
                    <div className="mt-1 text-[9px] leading-relaxed text-stone-500">Confirm a film operation and preferred James Bond in the centre panel first.</div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/6">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-amber-400">Secure Access</div>
                  <div className="text-xl font-black text-stone-100 mt-1">Launch terminal</div>
                </div>
                <div className="w-10 h-10 rounded-2xl border border-amber-500/20 bg-amber-500/10 flex items-center justify-center text-amber-300">
                  <Fingerprint className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedOperative.avatarUrl}
                    alt={selectedOperative.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover grayscale border border-white/12"
                  />
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-stone-600">Authorized operative</div>
                    <div className="text-lg font-black text-stone-100 mt-1">{selectedOperative.callsign}</div>
                    <div className="text-sm text-stone-400">{selectedOperative.name}</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[10px] text-stone-400">
                  <span>Destination lock</span>
                  <span className="text-amber-300 font-mono uppercase tracking-[0.14em]">{destination.label}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <div className="mi6-swap-input p-3.5">
                  <label className="block text-[8px] font-mono uppercase tracking-[0.18em] text-stone-600 mb-2">Service Number</label>
                  <input
                    value={serviceNumber}
                    disabled={!preDeploymentReady}
                    onChange={(e) => setServiceNumber(e.target.value)}
                    className="w-full bg-transparent text-[12px] font-mono font-bold text-stone-100 focus:outline-none"
                  />
                </div>

                <div className="mi6-swap-input p-3.5">
                  <label className="block text-[8px] font-mono uppercase tracking-[0.18em] text-stone-600 mb-2">Password / Passcode</label>
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="w-4 h-4 text-stone-600 shrink-0" />
                    <input
                      value={passcode}
                      disabled={!preDeploymentReady}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full bg-transparent text-[12px] font-mono font-bold text-stone-100 focus:outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-800/40 bg-red-950/25 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.14em] leading-relaxed text-red-300">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn || !preDeploymentReady}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-70 text-black px-4 py-4 flex items-center justify-between gap-4 transition-all shadow-[0_22px_50px_rgba(217,165,59,.18)]"
                >
                  <div className="text-left">
                    <div className="text-[8px] font-mono uppercase tracking-[0.2em] opacity-65">Credentials ready</div>
                    <div className="mt-1 text-sm font-black tracking-wide">{isLoggingIn ? "AUTHENTICATING…" : `ENTER ${destination.label}`}</div>
                  </div>
                  <Play className="w-4 h-4 fill-current shrink-0" />
                </button>

                <div className="text-center text-[8px] font-mono uppercase tracking-[0.18em] text-stone-600">
                  007 credentials preloaded // one click required
                </div>
              </form>
            </section>

            <section className={`mi6-swap-panel-soft p-5 ${!preDeploymentReady ? "opacity-40 pointer-events-none" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-stone-500">Route Preview</div>
                  <div className="text-lg font-black text-stone-100 mt-1">{destination.label}</div>
                </div>
                <div className="w-11 h-11 rounded-2xl border border-white/8 bg-black/20 flex items-center justify-center text-amber-300">
                  {React.createElement(destination.icon, { className: "w-5 h-5" })}
                </div>
              </div>
              <p className="mt-3 text-sm text-stone-400 leading-relaxed">{destination.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
                  <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-stone-600">Route</div>
                  <div className="mt-1 font-mono text-stone-200">/{destination.id}</div>
                </div>
                <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
                  <div className="text-[8px] font-mono uppercase tracking-[0.18em] text-stone-600">Clearance</div>
                  <div className={`mt-1 font-mono ${selectedOperative.allowedTabs.includes(destination.id) ? "text-emerald-300" : "text-red-300"}`}>
                    {selectedOperative.allowedTabs.includes(destination.id) ? "VERIFIED" : "RESTRICTED"}
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-auto flex items-center justify-between px-1 text-[8px] font-mono uppercase tracking-[0.16em] text-stone-700">
              <span>SIS OS // Build 00.27</span>
              <span>London // Vauxhall Cross</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
