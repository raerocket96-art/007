import React, { useState, useEffect } from "react";
import { DiplomaticCable, ClassificationType, MessageReply, AgentOperative } from "../types";
import { 
  Lock, 
  Unlock, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Radio, 
  FileText, 
  X, 
  Search, 
  AlertTriangle, 
  Terminal as TerminalIcon,
  Sparkles,
  ArrowRight,
  User,
  Clock,
  ExternalLink,
  Plus
} from "lucide-react";
import { soundManager } from "../utils/sound";
import { toastManager } from "../utils/toast";

interface SecureMessageTerminalProps {
  cables: DiplomaticCable[];
  activeAgent?: AgentOperative;
  onUpdateCables: (updatedCables: DiplomaticCable[]) => void;
  onClose: () => void;
  onOpenRecord?: (recordId: string) => void;
  initialSelectedCableId?: string;
}

export const SecureMessageTerminal: React.FC<SecureMessageTerminalProps> = ({
  cables,
  activeAgent,
  onUpdateCables,
  onClose,
  onOpenRecord,
  initialSelectedCableId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | "M" | "Q_BRANCH" | "FIELD_CONTROL" | "UNREAD">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCableId, setSelectedCableId] = useState<string>(initialSelectedCableId || cables[0]?.id || "");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(100);
  const [replyText, setReplyText] = useState("");
  const [isComposingNew, setIsComposingNew] = useState(false);

  // New Cable Form State
  const [newRecipient, setNewRecipient] = useState<"M" | "Q_BRANCH" | "FIELD_CONTROL">("M");
  const [newSubject, setNewSubject] = useState("");
  const [newClassification, setNewClassification] = useState<ClassificationType>("TOP SECRET");
  const [newContent, setNewContent] = useState("");

  const activeCable = cables.find(c => c.id === selectedCableId) || cables[0];

  useEffect(() => {
    if (initialSelectedCableId) {
      setSelectedCableId(initialSelectedCableId);
    }
  }, [initialSelectedCableId]);

  const filteredCables = cables.filter(cable => {
    if (selectedCategory === "UNREAD" && cable.acknowledged) return false;
    if (selectedCategory === "M" && cable.senderCategory !== "M") return false;
    if (selectedCategory === "Q_BRANCH" && cable.senderCategory !== "Q_BRANCH") return false;
    if (selectedCategory === "FIELD_CONTROL" && cable.senderCategory !== "FIELD_CONTROL" && !cable.originStation.toLowerCase().includes("station")) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        cable.subject.toLowerCase().includes(q) ||
        cable.originStation.toLowerCase().includes(q) ||
        cable.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectCable = (cableId: string) => {
    soundManager.playClick();
    setSelectedCableId(cableId);
    setIsComposingNew(false);
    const target = cables.find(c => c.id === cableId);
    if (target?.isEncrypted) {
      setIsDecrypting(false);
    }
  };

  const handleDecrypt = (cableId: string) => {
    soundManager.playTeletype();
    setIsDecrypting(true);
    setDecryptProgress(0);

    const interval = setInterval(() => {
      setDecryptProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDecrypting(false);
          // Mark cable as decrypted in state
          const updated = cables.map(c => c.id === cableId ? { ...c, isEncrypted: false } : c);
          onUpdateCables(updated);
          soundManager.playAccessGranted();
          toastManager.info("DISPATCH DECRYPTED", "GCHQ 256-bit AES cipher successfully decoded.", "CIPHER-OK");
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleAcknowledge = (cableId: string) => {
    soundManager.playClick();
    const target = cables.find(c => c.id === cableId);
    const updated = cables.map(c => c.id === cableId ? { ...c, acknowledged: true } : c);
    onUpdateCables(updated);
    toastManager.cableAcknowledged(target?.subject || "Encrypted Dispatch", cableId);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeCable) return;
    soundManager.playTeletype();

    const newReply: MessageReply = {
      id: `rep-${Date.now()}`,
      sender: activeAgent?.name ? `${activeAgent.name} (${activeAgent.callsign || "007"})` : "00-Section Operative",
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16) + " ZULU",
      content: replyText.trim()
    };

    const updated = cables.map(c => {
      if (c.id === activeCable.id) {
        return {
          ...c,
          acknowledged: true,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    });

    onUpdateCables(updated);
    setReplyText("");
    toastManager.success("ENCRYPTED TRANSMISSION SENT", `Reply dispatched to ${activeCable.originStation}`, "BURST-SENT");
  };

  const handleSendNewCable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newContent.trim()) return;

    soundManager.playAccessGranted();

    const recipientStation = 
      newRecipient === "M" ? "M (CHIEF OF SIS)" :
      newRecipient === "Q_BRANCH" ? "Q-BRANCH TECHNICAL DIVISION" : "FIELD CONTROL // STATION V";

    const newCable: DiplomaticCable = {
      id: `cable-out-${Date.now()}`,
      timestamp: new Date().toISOString(),
      originStation: activeAgent?.name ? `${activeAgent.name} (${activeAgent.callsign || "007"})` : "00-Section Field Agent",
      senderCategory: newRecipient,
      destination: recipientStation,
      classification: newClassification,
      priority: "HIGH",
      subject: newSubject.toUpperCase(),
      content: newContent,
      cipherText: `88G-OUTBOUND-${Date.now()}-GCHQ-ENCRYPTED-TRANSMISSION`,
      isEncrypted: false,
      actionRequired: false,
      acknowledged: true,
      relatedRecords: [activeAgent?.serviceNumber || "SIS-PERS-007-UK"]
    };

    onUpdateCables([newCable, ...cables]);
    setIsComposingNew(false);
    setSelectedCableId(newCable.id);
    setNewSubject("");
    setNewContent("");
    toastManager.success("FIELD DISPATCH TRANSMITTED", `Encrypted burst cable delivered to ${recipientStation}`, "ENCRYPTED-OUTBOUND");
  };

  const getSenderBadge = (cat?: string, station?: string) => {
    if (cat === "M" || station?.includes("M (")) {
      return { label: "M (CHIEF)", color: "border-red-600/70 bg-red-950/40 text-red-300" };
    }
    if (cat === "Q_BRANCH" || station?.includes("Q-BRANCH")) {
      return { label: "Q BRANCH", color: "border-amber-600/70 bg-amber-950/40 text-amber-300" };
    }
    if (cat === "FIELD_CONTROL" || station?.includes("STATION")) {
      return { label: "FIELD CONTROL", color: "border-emerald-600/70 bg-emerald-950/40 text-emerald-300" };
    }
    return { label: "WHITEHALL JIC", color: "border-sky-600/70 bg-sky-950/40 text-sky-300" };
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto flex items-center justify-center animate-in fade-in duration-200">
      <div className="w-full max-w-5xl my-auto mi6-swap-panel rounded-[28px] border border-white/12 bg-[#0a0d12] shadow-2xl overflow-hidden font-mono text-stone-200">
        
        {/* Terminal Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  GCHQ CHELTENHAM // SECURE CABLE TERMINAL
                </span>
                <span className="bg-red-950 text-red-300 border border-red-800 text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                  AES-256 ENCRYPTED
                </span>
              </div>
              <h2 className="text-xl font-black text-stone-100 tracking-tight">
                MI6 Classified Encrypted Dispatches
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsComposingNew(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>COMPOSE CABLE</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Terminal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] min-h-[540px]">
          
          {/* Left Sidebar: Dispatches List */}
          <div className="border-r border-white/10 bg-black/20 p-4 space-y-4">
            
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-black/40 p-1 rounded-xl border border-white/8 text-[9px] font-bold">
              {[
                { id: "ALL", label: "ALL" },
                { id: "M", label: "M" },
                { id: "Q_BRANCH", label: "Q BRANCH" },
                { id: "FIELD_CONTROL", label: "STATION V" },
                { id: "UNREAD", label: "UNREAD" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedCategory(tab.id as any);
                  }}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition-colors text-center ${
                    selectedCategory === tab.id
                      ? "bg-amber-500 text-black font-black"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Filter Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject or origin..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Cable Feed List */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredCables.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs font-mono">
                  No encrypted dispatches match current filter.
                </div>
              ) : (
                filteredCables.map((cable) => {
                  const isSelected = cable.id === selectedCableId && !isComposingNew;
                  const badge = getSenderBadge(cable.senderCategory, cable.originStation);
                  
                  return (
                    <div
                      key={cable.id}
                      onClick={() => handleSelectCable(cable.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/60 text-white shadow-md"
                          : cable.acknowledged
                          ? "bg-white/[0.02] hover:bg-white/[0.05] border-white/8 text-stone-300"
                          : "bg-red-950/20 hover:bg-red-950/30 border-red-700/50 text-stone-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-[9px] text-stone-500">
                          {cable.timestamp.substring(0, 10)}
                        </span>
                      </div>
                      <div className="font-bold text-xs truncate">
                        {cable.subject}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[9px] text-stone-500">
                        <span className="truncate max-w-[180px]">{cable.originStation}</span>
                        {cable.isEncrypted ? (
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> CIPHER
                          </span>
                        ) : !cable.acknowledged ? (
                          <span className="text-red-400 font-bold">UNREAD</span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> ACK
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Message Viewer / Reply / Composer */}
          <div className="p-6 space-y-5 bg-gradient-to-b from-black/40 to-black/70 flex flex-col justify-between">
            
            {isComposingNew ? (
              /* New Outbound Cable Form */
              <form onSubmit={handleSendNewCable} className="space-y-4 font-mono">
                <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400">
                      OUTBOUND TRANSMISSION // ENCRYPTED BURST
                    </span>
                    <h3 className="text-base font-black text-stone-100">
                      Transmit Cable to MI6 Headquarters
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsComposingNew(false)}
                    className="text-xs text-stone-400 hover:text-white"
                  >
                    CANCEL
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                      Recipient Station
                    </label>
                    <select
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value as any)}
                      className="w-full bg-[#15171c] border border-white/10 rounded-xl p-2.5 text-xs text-stone-200"
                    >
                      <option value="M">M (CHIEF OF SIS)</option>
                      <option value="Q_BRANCH">Q-BRANCH TECHNICAL DIVISION</option>
                      <option value="FIELD_CONTROL">FIELD CONTROL // STATION V</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                      Classification
                    </label>
                    <select
                      value={newClassification}
                      onChange={(e) => setNewClassification(e.target.value as any)}
                      className="w-full bg-[#15171c] border border-white/10 rounded-xl p-2.5 text-xs text-stone-200"
                    >
                      <option value="TOP SECRET">TOP SECRET</option>
                      <option value="SECRET">SECRET</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                      <option value="EYES ONLY">EYES ONLY</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                    Dispatch Subject
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. FIELD SITUATION REPORT // LOCK 4 SECURED"
                    className="w-full bg-[#15171c] border border-white/10 rounded-xl p-2.5 text-xs text-stone-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-stone-400 font-bold uppercase mb-1">
                    Encrypted Payload Message
                  </label>
                  <textarea
                    rows={6}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Provide operational facts, intelligence observations, or backup requests..."
                    className="w-full bg-[#15171c] border border-white/10 rounded-xl p-3 text-xs text-stone-200"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsComposingNew(false)}
                    className="bg-stone-800 text-stone-300 px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    DISCARD
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2 rounded-xl text-xs flex items-center space-x-2 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>TRANSMIT ENCRYPTED BURST</span>
                  </button>
                </div>
              </form>
            ) : activeCable ? (
              /* Active Message Viewer */
              <div className="space-y-4 font-mono">
                
                {/* Message Header Information */}
                <div className="border-b border-white/10 pb-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className={`stamp-top-secret text-[10px] px-2.5 py-0.5 rounded ${
                        activeCable.classification === "TOP SECRET" ? "border-red-600 text-red-400" : "border-amber-500 text-amber-400"
                      }`}>
                        {activeCable.classification}
                      </span>
                      {activeCable.priority && (
                        <span className="bg-red-950/80 border border-red-600 text-red-300 text-[9px] px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                          {activeCable.priority}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{activeCable.timestamp}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-stone-100 leading-snug">
                    {activeCable.subject}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-400 pt-1">
                    <div>
                      <span className="text-stone-600 uppercase font-bold">ORIGIN:</span>{" "}
                      <span className="text-stone-200 font-bold">{activeCable.originStation}</span>
                    </div>
                    <div>
                      <span className="text-stone-600 uppercase font-bold">RECIPIENT:</span>{" "}
                      <span className="text-stone-200 font-bold">{activeCable.destination}</span>
                    </div>
                  </div>
                </div>

                {/* Cipher Decryption / Plaintext Viewer */}
                <div className="dossier-inset rounded-2xl p-5 border-2 border-stone-800 bg-[#0f1115] relative overflow-hidden min-h-[180px]">
                  
                  {activeCable.isEncrypted ? (
                    <div className="space-y-4 text-center py-6">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                        <Lock className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-amber-400 font-bold text-xs uppercase tracking-widest">
                          GCHQ HIGH-GRADE AES-256 CIPHER
                        </div>
                        <div className="text-stone-400 text-[10px] mt-1 font-mono break-all max-w-lg mx-auto bg-black/40 p-2 rounded border border-white/5">
                          {activeCable.cipherText || "ENCRYPTED-CIPHER-BLOCK-007-GCHQ"}
                        </div>
                      </div>

                      {isDecrypting ? (
                        <div className="max-w-xs mx-auto space-y-2">
                          <div className="text-emerald-400 text-[10px] font-bold uppercase animate-pulse">
                            DECRYPTING TRANSMISSION... {decryptProgress}%
                          </div>
                          <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full transition-all duration-150"
                              style={{ width: `${decryptProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDecrypt(activeCable.id)}
                          className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-5 py-2.5 rounded-xl inline-flex items-center space-x-2 shadow-lg transition-transform hover:scale-105"
                        >
                          <Unlock className="w-4 h-4" />
                          <span>DECRYPT TRANSMISSION CIPHER</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Decrypted Plaintext Content */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[9px] text-emerald-400 font-bold border-b border-white/10 pb-2">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> DECRYPTED PLAINTEXT // GCHQ VERIFIED
                        </span>
                        <span className="text-stone-500 font-mono">
                          ID: {activeCable.id}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-typewriter whitespace-pre-wrap">
                        {activeCable.content}
                      </p>

                      {/* Related Record Links */}
                      {activeCable.relatedRecords && activeCable.relatedRecords.length > 0 && (
                        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="text-stone-500 uppercase font-bold">CROSS-REFERENCED DOSSIERS:</span>
                          {activeCable.relatedRecords.map((ref) => (
                            <button
                              key={ref}
                              onClick={() => {
                                soundManager.playClick();
                                if (onOpenRecord) onOpenRecord(ref);
                              }}
                              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded font-mono text-[9px] inline-flex items-center gap-1 transition-colors"
                            >
                              <span>{ref}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Transmitted Replies Thread */}
                {activeCable.replies && activeCable.replies.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      TRANSMITTED FIELD REPLIES ({activeCable.replies.length})
                    </div>
                    {activeCable.replies.map((rep) => (
                      <div key={rep.id} className="bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs space-y-1 font-mono">
                        <div className="flex items-center justify-between text-[9px] text-stone-400">
                          <span className="text-amber-300 font-bold">{rep.sender}</span>
                          <span>{rep.timestamp}</span>
                        </div>
                        <div className="text-stone-200 text-xs">
                          {rep.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactive Reply & Acknowledge Section */}
                {!activeCable.isEncrypted && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">
                        ENCRYPTED FIELD RESPONSE
                      </span>
                      {!activeCable.acknowledged && (
                        <button
                          onClick={() => handleAcknowledge(activeCable.id)}
                          className="bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500 text-emerald-200 text-[10px] font-bold px-3 py-1 rounded-lg flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>ACKNOWLEDGE DISPATCH</span>
                        </button>
                      )}
                    </div>

                    {/* Quick Preset Replies */}
                    <div className="flex flex-wrap gap-1.5 text-[9px]">
                      {[
                        "Directive acknowledged, M. Proceeding to target sector.",
                        "Requesting Q-Branch technical clearance for heavy breaching payload.",
                        "Station V: Cover identity maintained. Awaiting extraction signal."
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setReplyText(preset)}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 px-2 py-1 rounded text-left transition-colors"
                        >
                          "{preset.substring(0, 42)}..."
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Transmit encrypted response to ${activeCable.originStation}...`}
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="bg-amber-500 hover:bg-amber-400 text-black font-black text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 disabled:opacity-50 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>REPLY</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-stone-500 font-mono text-xs">
                Select an encrypted dispatch from the left panel to inspect.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
