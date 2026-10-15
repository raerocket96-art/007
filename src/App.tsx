import React, { useState, useEffect } from "react";
import {
  getStoredArchive,
  saveStoredArchive,
  MI6DatabaseStore,
  getAllRecords
} from "./data";
import { DatabaseRecord, AuthSession, AgentOperative, PersonnelRecord, DiplomaticCable } from "./types";
import { getInitialSession, persistSession } from "./data/operatives";
import { Header } from "./components/Header";
import { AppSidebar } from "./components/AppSidebar";
import { CommandCentre } from "./components/CommandCentre";
import { MissionSimulator } from "./components/MissionSimulator";
import { OperationalWorkspace, OperationalTab } from "./components/OperationalWorkspace";
import { IntelligenceHub, IntelligenceSubTab } from "./components/IntelligenceHub";
import { BondOperationsHub, BondOperationsSubTab } from "./components/BondOperationsHub";
import { SystemHub, SystemSubTab } from "./components/SystemHub";
import { DossierViewer } from "./components/DossierViewer";
import { SearchModal } from "./components/SearchModal";
import { AuthModal } from "./components/AuthModal";
import { SecureMessageTerminal } from "./components/SecureMessageTerminal";
import { AgentProfileEditor } from "./components/AgentProfileEditor";
import { ToastContainer } from "./components/ToastContainer";
import { MainMenu, PreDeploymentLaunchConfig } from "./components/MainMenu";
import { Footer } from "./components/Footer";
import { soundManager } from "./utils/sound";
import { toastManager } from "./utils/toast";
import { clearActiveMissionFromLocalStorage } from "./utils/dataSync";
import { ShieldAlert, ArrowLeft, Key } from "lucide-react";

export type MasterHubId = "command" | "simulator" | "operations" | "intel" | "bond" | "system";

export default function App() {
  const [store, setStore] = useState<MI6DatabaseStore>(() => getStoredArchive());
  const [activeHub, setActiveHub] = useState<MasterHubId>("command");

  // Internal sub-tab states for consolidated hubs
  const [operationsSubTab, setOperationsSubTab] = useState<OperationalTab>("runs");
  const [intelSubTab, setIntelSubTab] = useState<IntelligenceSubTab>("dossiers");
  const [bondSubTab, setBondSubTab] = useState<BondOperationsSubTab>("movies");
  const [systemSubTab, setSystemSubTab] = useState<SystemSubTab>("settings");

  const [selectedRecord, setSelectedRecord] = useState<DatabaseRecord | null>(null);
  const [session, setSession] = useState<AuthSession>(() => getInitialSession());
  const [isMainMenuVisible, setIsMainMenuVisible] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [clearanceLevel, setClearanceLevel] = useState<number>(() => session?.agent?.clearanceLevel || 9);

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSecureTerminalOpen, setIsSecureTerminalOpen] = useState<boolean>(false);
  const [selectedTerminalCableId, setSelectedTerminalCableId] = useState<string | undefined>(undefined);
  const [isAgentProfileEditorModalOpen, setIsAgentProfileEditorModalOpen] = useState<boolean>(false);

  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isRedactedMode, setIsRedactedMode] = useState<boolean>(false);
  const [missionLaunchTemplateId, setMissionLaunchTemplateId] = useState<string>("template-danube");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem("mi6_sidebar_collapsed_v1") === "1"; } catch { return false; }
  });

  const handleSaveAgentProfile = (updatedAgent: AgentOperative, personnelRecord?: PersonnelRecord) => {
    const nextSession: AuthSession = {
      ...session,
      agent: updatedAgent
    };
    setSession(nextSession);
    persistSession(nextSession);
    setClearanceLevel(updatedAgent.clearanceLevel);

    if (personnelRecord) {
      const existingIdx = store.personnel.findIndex(
        p => p.id === personnelRecord.id || p.serviceNumber === personnelRecord.serviceNumber || p.alias === personnelRecord.alias
      );
      let updatedPersonnel = [...store.personnel];
      if (existingIdx >= 0) {
        updatedPersonnel[existingIdx] = personnelRecord;
      } else {
        updatedPersonnel = [personnelRecord, ...updatedPersonnel];
      }
      handleUpdateStore({
        ...store,
        personnel: updatedPersonnel
      });
    }
  };

  useEffect(() => {
    soundManager.setEnabled(audioEnabled);
  }, [audioEnabled]);

  useEffect(() => {
    setClearanceLevel(session?.agent?.clearanceLevel ?? 9);
  }, [session?.agent?.clearanceLevel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        soundManager.playClick();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Backward-compatible Universal Navigation Handler
  const handleNavigate = (destination: string) => {
    soundManager.playClick();
    const dest = destination.toLowerCase().trim();

    if (dest === "command") {
      setActiveHub("command");
    } else if (dest === "simulator" || dest === "qbranch") {
      setActiveHub("simulator");
    } else if (dest === "operations" || dest === "missionarchive" || dest === "runs") {
      setActiveHub("operations");
      setOperationsSubTab("runs");
    } else if (dest === "debriefs") {
      setActiveHub("operations");
      setOperationsSubTab("debriefs");
    } else if (dest === "compare") {
      setActiveHub("operations");
      setOperationsSubTab("compare");
    } else if (dest === "decisions") {
      setActiveHub("operations");
      setOperationsSubTab("decisions");
    } else if (dest === "branches" || dest === "history") {
      setActiveHub("operations");
      setOperationsSubTab("branches");
    } else if (dest === "dna") {
      setActiveHub("operations");
      setOperationsSubTab("dna");
    } else if (dest === "intel" || dest === "database" || dest === "dossiers") {
      setActiveHub("intel");
      setIntelSubTab("dossiers");
    } else if (dest === "graph" || dest === "network") {
      setActiveHub("intel");
      setIntelSubTab("network");
    } else if (dest === "bond" || dest === "movies") {
      setActiveHub("bond");
      setBondSubTab("movies");
    } else if (dest === "persona" || dest === "doctrines") {
      setActiveHub("bond");
      setBondSubTab("persona");
    } else if (dest === "system" || dest === "settings") {
      setActiveHub("system");
      setSystemSubTab("settings");
    } else if (dest === "admin") {
      setActiveHub("system");
      setSystemSubTab("admin");
    } else {
      // Default fallback
      setActiveHub("command");
    }
  };

  const handleAuthenticatedEntry = (newSession: AuthSession, destination: string = "command", launchConfig?: PreDeploymentLaunchConfig) => {
    if (launchConfig) {
      setMissionLaunchTemplateId(launchConfig.missionTemplateId);
      try {
        localStorage.setItem("mi6_preselected_film_template_v1", launchConfig.missionTemplateId);
        localStorage.setItem("mi6_bond_doctrine_v1", launchConfig.doctrineId);
        localStorage.setItem("mi6_preferred_doctrine", launchConfig.doctrineId);
      } catch {}
      clearActiveMissionFromLocalStorage();
    }
    setSession(newSession);
    persistSession(newSession);
    setClearanceLevel(newSession.agent.clearanceLevel);
    setIsMainMenuVisible(false);
    handleNavigate(destination);
  };

  const handleUpdateStore = (newStore: MI6DatabaseStore) => {
    setStore(newStore);
    saveStoredArchive(newStore);
  };

  const handleUpdateRecord = (updatedRecord: DatabaseRecord) => {
    const newStore = { ...store };
    switch (updatedRecord.type) {
      case "personnel":
        newStore.personnel = newStore.personnel.map((r) => r.id === updatedRecord.id ? updatedRecord as any : r);
        break;
      case "operations":
        newStore.operations = newStore.operations.map((r) => r.id === updatedRecord.id ? updatedRecord as any : r);
        break;
      case "equipment":
        newStore.equipment = newStore.equipment.map((r) => r.id === updatedRecord.id ? updatedRecord as any : r);
        break;
      case "vehicles":
        newStore.vehicles = newStore.vehicles.map((r) => r.id === updatedRecord.id ? updatedRecord as any : r);
        break;
      case "locations":
        newStore.locations = newStore.locations.map((r) => r.id === updatedRecord.id ? updatedRecord as any : r);
        break;
      case "organizations":
        newStore.organizations = newStore.organizations.map((r) => r.id === updatedRecord.id ? updatedRecord as any : r);
        break;
      case "assets":
        newStore.assets = newStore.assets.map((r) => r.id === updatedRecord.id ? updatedRecord as any : r);
        break;
    }
    handleUpdateStore(newStore);
    setSelectedRecord(updatedRecord);
    toastManager.recordSaved(updatedRecord.name, updatedRecord.referenceNumber);
  };

  const handleOpenRecordById = (refOrId: string) => {
    const all = getAllRecords(store);
    const target = all.find(
      (r) => r.id.toLowerCase() === refOrId.toLowerCase() ||
             r.referenceNumber.toLowerCase() === refOrId.toLowerCase() ||
             ("alias" in r && r.alias?.toLowerCase() === refOrId.toLowerCase()) ||
             ("codename" in r && r.codename?.toLowerCase() === refOrId.toLowerCase())
    );

    if (target) {
      soundManager.playPaperRustle();
      setSelectedRecord(target);
    } else {
      console.warn("Record not found:", refOrId);
    }
  };

  const handleAcknowledgeCable = (cableId: string) => {
    const targetCable = store.cables.find((c) => c.id === cableId);
    const updatedCables = store.cables.map((c) =>
      c.id === cableId ? { ...c, acknowledged: true } : c
    );
    handleUpdateStore({
      ...store,
      cables: updatedCables
    });
    toastManager.cableAcknowledged(targetCable?.subject || "Diplomatic Dispatch Cable", cableId);
  };

  const handleStartMissionFromPrompt = (templateId?: string) => {
    if (templateId) {
      setMissionLaunchTemplateId(templateId);
    }
    handleNavigate("simulator");
  };

  const handleStartMissionWithDoctrine = (doctrineId: string, templateId?: string) => {
    try {
      localStorage.setItem("mi6_preferred_doctrine", doctrineId);
      localStorage.setItem("mi6_bond_doctrine_v1", doctrineId);
    } catch (e) {
      console.error(e);
    }
    handleStartMissionFromPrompt(templateId);
  };

  // Permission check for master hubs
  const isHubAllowed = (hub: MasterHubId) => {
    const allowed = session?.agent?.allowedTabs;
    if (!allowed || allowed.length === 0) return true;
    if (hub === "command") return allowed.includes("command");
    if (hub === "simulator") return allowed.includes("simulator");
    if (hub === "operations") return allowed.includes("simulator") || allowed.includes("operations") || allowed.includes("missionarchive");
    if (hub === "intel") return allowed.includes("database") || allowed.includes("graph") || allowed.includes("intel");
    if (hub === "bond") return allowed.includes("movies") || allowed.includes("persona") || allowed.includes("bond");
    if (hub === "system") return allowed.includes("admin") || allowed.includes("system") || allowed.includes("settings");
    return true;
  };

  if (isMainMenuVisible) {
    return <MainMenu onLogin={handleAuthenticatedEntry} />;
  }

  return (
    <div className={`min-h-screen mi6-app-shell text-stone-200 selection:bg-amber-300 selection:text-black font-sans pb-12 ${
      isRedactedMode ? "redacted-mode" : ""
    }`}>
      <Header
        activeTab={activeHub}
        onTabChange={handleNavigate}
        clearanceLevel={clearanceLevel}
        onClearanceChange={(lvl) => {
          soundManager.playTeletype();
          setClearanceLevel(lvl);
        }}
        audioEnabled={audioEnabled}
        onAudioToggle={() => {
          setAudioEnabled(!audioEnabled);
        }}
        onOpenSearch={() => {
          soundManager.playClick();
          setIsSearchOpen(true);
        }}
        onPrintCurrentView={() => {
          window.print();
        }}
        threatLevel="CRITICAL"
        unreadCablesCount={store.cables.filter((c) => !c.acknowledged).length}
        session={session}
        onOpenAuth={() => {
          soundManager.playClick();
          setIsAuthModalOpen(true);
        }}
        onLockTerminal={() => {
          const locked: AuthSession = {
            ...session,
            isLocked: true
          };
          setSession(locked);
          persistSession(locked);
        }}
        onOpenSecureTerminal={(cableId) => {
          setSelectedTerminalCableId(cableId);
          setIsSecureTerminalOpen(true);
        }}
        onOpenAgentCreator={() => {
          setIsAgentProfileEditorModalOpen(true);
        }}
      />

      <AppSidebar
        activeHub={activeHub}
        onSelectHub={handleNavigate}
        unreadCablesCount={store.cables.filter((c) => !c.acknowledged).length}
        session={session}
        collapsed={sidebarCollapsed}
        onToggle={() => {
          const next = !sidebarCollapsed;
          setSidebarCollapsed(next);
          try { localStorage.setItem("mi6_sidebar_collapsed_v1", next ? "1" : "0"); } catch {}
        }}
      />

      <main className={`pt-[112px] px-4 sm:px-6 xl:px-8 transition-[margin] duration-300 ${sidebarCollapsed ? "lg:ml-[84px]" : "lg:ml-[280px]"}`}>
        <div className="max-w-[1480px] mx-auto">
        {!isHubAllowed(activeHub) ? (
          <div className="bg-[#24272c] border-2 border-red-800 rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center shadow-2xl font-mono relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-red-950/30 to-transparent pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-red-950 border border-red-600 flex items-center justify-center mx-auto text-red-400 mb-4 shadow-inner">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <div className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">
              HER MAJESTY'S GOVERNMENT // RESTRICTED RECORD
            </div>
            <h2 className="text-2xl font-black text-stone-100 tracking-tight mb-2">
              CLEARANCE INSUFFICIENT — ACCESS DENIED
            </h2>
            <p className="text-stone-300 text-xs font-sans leading-relaxed mb-6 max-w-lg mx-auto">
              Operative <span className="font-mono font-bold text-amber-400">{session?.agent?.name} ({session?.agent?.callsign})</span> does not possess the requisite security classification to view the <span className="font-bold text-white uppercase">{activeHub}</span> hub.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <button
                onClick={() => handleNavigate("command")}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 border border-stone-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>RETURN TO COMMAND CENTRE</span>
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setIsAuthModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 shadow transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                <span>AUTHENTICATE OPERATIVE</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeHub === "command" && (
              <CommandCentre
                store={store}
                onOpenRecord={handleOpenRecordById}
                onNavigateToTab={handleNavigate}
                onStartMission={handleStartMissionFromPrompt}
                onAcknowledgeCable={handleAcknowledgeCable}
                onOpenSecureTerminal={(cableId) => {
                  setSelectedTerminalCableId(cableId);
                  setIsSecureTerminalOpen(true);
                }}
                onOpenAgentCreator={() => {
                  setIsAgentProfileEditorModalOpen(true);
                }}
              />
            )}

            {activeHub === "simulator" && (
              <MissionSimulator
                store={store}
                initialTemplateId={missionLaunchTemplateId}
                onOpenRecord={handleOpenRecordById}
                onNavigateToTab={handleNavigate}
              />
            )}

            {activeHub === "operations" && (
              <OperationalWorkspace
                initialSubTab={operationsSubTab}
                onNavigateToTab={handleNavigate}
              />
            )}

            {activeHub === "intel" && (
              <IntelligenceHub
                store={store}
                initialSubTab={intelSubTab}
                onSelectRecord={(record) => setSelectedRecord(record)}
                onOpenRecordId={handleOpenRecordById}
                clearanceLevel={clearanceLevel}
              />
            )}

            {activeHub === "bond" && (
              <BondOperationsHub
                initialSubTab={bondSubTab}
                onStartMission={handleStartMissionFromPrompt}
                onStartMissionWithDoctrine={handleStartMissionWithDoctrine}
                onOpenRecord={handleOpenRecordById}
                onNavigateToTab={handleNavigate}
              />
            )}

            {activeHub === "system" && (
              <SystemHub
                store={store}
                initialSubTab={systemSubTab}
                onUpdateStore={handleUpdateStore}
                clearanceLevel={clearanceLevel}
                onClearanceChange={setClearanceLevel}
                onNavigateToTab={handleNavigate}
                onSaveAgentProfile={handleSaveAgentProfile}
              />
            )}
          </>
        )}
        </div>
      </main>

      {/* Persistent SIS Command Footer */}
      <Footer 
        clearanceLevel={clearanceLevel}
        activeTab={activeHub}
        isRedactedMode={isRedactedMode}
      />

      {/* Secure Message Terminal Modal Overlay */}
      {isSecureTerminalOpen && (
        <SecureMessageTerminal
          cables={store.cables}
          activeAgent={session?.agent}
          onUpdateCables={(updatedCables) => handleUpdateStore({ ...store, cables: updatedCables })}
          onClose={() => setIsSecureTerminalOpen(false)}
          onOpenRecord={handleOpenRecordById}
          initialSelectedCableId={selectedTerminalCableId}
        />
      )}

      {/* Agent Profile Creator & Commissioning Modal Overlay */}
      {isAgentProfileEditorModalOpen && (
        <div
          className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200"
          onMouseDown={() => setIsAgentProfileEditorModalOpen(false)}
        >
          <div className="w-full max-w-4xl my-auto" onMouseDown={(e) => e.stopPropagation()}>
            <AgentProfileEditor
              initialProfile={session?.agent}
              store={store}
              onSaveProfile={handleSaveAgentProfile}
              onClose={() => setIsAgentProfileEditorModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Standardized Modal Stack */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200"
          onMouseDown={() => setSelectedRecord(null)}
        >
          <div className="w-full max-w-4xl my-auto" onMouseDown={(e) => e.stopPropagation()}>
            <DossierViewer
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
              onNavigateToRecord={handleOpenRecordById}
              onUpdateRecord={handleUpdateRecord}
              clearanceLevel={clearanceLevel}
            />
          </div>
        </div>
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        store={store}
        onSelectRecord={(record) => {
          setIsSearchOpen(false);
          setSelectedRecord(record);
        }}
      />

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentSession={session}
          onAuthenticate={(newSession) => {
            setSession(newSession);
            persistSession(newSession);
            setClearanceLevel(newSession.agent.clearanceLevel);
            setIsAuthModalOpen(false);
          }}
        />
      )}

      {/* SIS Toast Notification HUD */}
      <ToastContainer />
    </div>
  );
}
