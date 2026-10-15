import React, { useState, useEffect } from "react";
import { AgentOperative, AuthSession } from "../types";
import { MI6_OPERATIVES, createAuthSession } from "../data/operatives";
import { soundManager } from "../utils/sound";
import { 
  Shield, 
  Lock, 
  KeyRound, 
  Fingerprint, 
  CheckCircle, 
  AlertOctagon, 
  UserCheck, 
  Terminal,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: AuthSession | null;
  onAuthenticate: (session: AuthSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onAuthenticate
}) => {
  const [selectedOperativeId, setSelectedOperativeId] = useState<string>(
    currentSession?.agent.id || MI6_OPERATIVES[0].id
  );
  const [serviceNumberInput, setServiceNumberInput] = useState<string>(
    currentSession?.agent.serviceNumber || MI6_OPERATIVES[0].serviceNumber
  );
  const [passcodeInput, setPasscodeInput] = useState<string>(
    currentSession?.agent.passcode || MI6_OPERATIVES[0].passcode
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [biometricVerified, setBiometricVerified] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentSelectedOp = MI6_OPERATIVES.find(op => op.id === selectedOperativeId) || MI6_OPERATIVES[0];

  const handleSelectOperative = (op: AgentOperative) => {
    soundManager.playClick();
    setSelectedOperativeId(op.id);
    setServiceNumberInput(op.serviceNumber);
    setPasscodeInput(op.passcode);
    setBiometricVerified(false);
    setErrorMessage(null);
  };

  const handleBiometricScan = () => {
    soundManager.playTeletype();
    setBiometricScanning(true);
    setErrorMessage(null);

    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricVerified(true);
      soundManager.playAccessGranted();
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Verify credentials
    const targetOp = MI6_OPERATIVES.find(
      op => op.serviceNumber.trim().toUpperCase() === serviceNumberInput.trim().toUpperCase()
    );

    if (!targetOp) {
      soundManager.playAlarm();
      setErrorMessage("SERVICE NUMBER NOT RECOGNIZED IN CENTRAL VAULT.");
      return;
    }

    if (passcodeInput !== targetOp.passcode) {
      soundManager.playAlarm();
      setErrorMessage("CIPHER PASSCODE INVALID. SECURITY VIOLATION LOGGED.");
      return;
    }

    soundManager.playAccessGranted();

    const newSession: AuthSession = createAuthSession(targetOp);

    onAuthenticate(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200" onMouseDown={onClose}>
      <div className="relative w-full max-w-2xl bg-[#1c1e23] border-2 border-white/10 rounded-2xl shadow-2xl overflow-hidden font-mono text-stone-200" onMouseDown={(e) => e.stopPropagation()}>
        {/* Top Whitehall Stamped Header */}
        <div className="bg-[#15171b] border-b border-white/8 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-stone-100 tracking-wider">
                SIS SECURE AGENT AUTHENTICATION TERMINAL
              </div>
              <div className="text-[9px] text-stone-400">
                VAUXHALL CROSS // CENTRAL DISPATCH DIRECTORY
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 text-xs px-2 py-1 rounded hover:bg-stone-800"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Operative Quick-Select Roster */}
          <div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>SELECT OPERATIVE IDENTITY / ROLE:</span>
              <span className="text-stone-400 font-normal">PERSONAS ENFORCE SPECIFIC CLEARANCES</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {MI6_OPERATIVES.map((op) => {
                const isSelected = op.id === selectedOperativeId;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => handleSelectOperative(op)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500 text-stone-100 shadow-md ring-1 ring-amber-500/50"
                        : "bg-[#24272c] border-white/8 text-stone-400 hover:border-white/10 hover:text-stone-200"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1.5">
                      <img
                        src={op.avatarUrl}
                        alt={op.callsign}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover grayscale border border-white/12 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="text-[10px] font-bold truncate text-stone-100">{op.callsign}</div>
                        <div className="text-[8px] text-amber-400 font-bold">LVL {op.clearanceLevel}</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-stone-400 truncate leading-tight">{op.name.split(" ")[op.name.split(" ").length - 1]}</div>
                    {op.discretionaryLicence && (
                      <span className="mt-1 text-[7px] bg-red-900/60 text-red-300 px-1 py-0.2 rounded font-bold self-start">
                        00 LICENCE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Profile Card */}
          <div className="mi6-swap-panel-soft rounded-xl p-4 flex flex-wrap sm:flex-nowrap items-start gap-4">
            <img
              src={currentSelectedOp.avatarUrl}
              alt={currentSelectedOp.name}
              referrerPolicy="no-referrer"
              className="w-16 h-20 rounded-lg object-cover grayscale border-2 border-white/10 shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-sm font-bold text-stone-100">{currentSelectedOp.name}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                  currentSelectedOp.clearanceLevel >= 9
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : currentSelectedOp.clearanceLevel >= 7
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    : "bg-stone-800 text-stone-300 border-white/10"
                }`}>
                  {currentSelectedOp.clearanceLabel}
                </span>
              </div>
              <div className="text-[11px] text-stone-300">{currentSelectedOp.role}</div>
              <div className="text-[10px] text-stone-400">{currentSelectedOp.rank} • {currentSelectedOp.department}</div>
              <div className="text-[9px] text-stone-500 pt-1 flex items-center space-x-3">
                <span>SERVICE REF: <strong className="text-stone-300">{currentSelectedOp.serviceNumber}</strong></span>
                <span>•</span>
                <span>BIOMETRIC: <strong className="text-emerald-400">{currentSelectedOp.biometricCode}</strong></span>
              </div>
            </div>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Service Number Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 font-bold uppercase block">
                  SERVICE CREDENTIAL REF:
                </label>
                <div className="relative">
                  <Terminal className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-500" />
                  <input
                    type="text"
                    value={serviceNumberInput}
                    onChange={(e) => setServiceNumberInput(e.target.value)}
                    required
                    placeholder="e.g. SIS-007"
                    className="w-full bg-[#15171b] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              {/* Cipher Passcode Input */}
              <div className="space-y-1">
                <label className="text-[10px] text-stone-400 font-bold uppercase block">
                  SECURITY CIPHER PASSCODE:
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    required
                    placeholder="ENTER CIPHER"
                    className="w-full bg-[#15171b] border border-white/10 rounded-lg pl-9 pr-9 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Biometric Verification & Session Lifetime Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Biometric Scanner */}
              <div className="bg-black/20 border border-white/8 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    biometricVerified 
                      ? "bg-emerald-950/80 border-emerald-600 text-emerald-400" 
                      : biometricScanning 
                      ? "bg-amber-950/80 border-amber-600 text-amber-400 animate-pulse" 
                      : "bg-stone-900 border-white/10 text-stone-400"
                  }`}>
                    {biometricVerified ? <CheckCircle className="w-4 h-4" /> : <Fingerprint className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-200">
                      {biometricVerified ? "BIOMETRICS CONFIRMED" : biometricScanning ? "SCANNING RETINA/PALM..." : "BIOMETRIC LINK REQUIRED"}
                    </div>
                    <div className="text-[8px] text-stone-500">
                      {biometricVerified ? currentSelectedOp.biometricCode : "EPIDERMAL / RETINAL SCAN"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBiometricScan}
                  disabled={biometricScanning || biometricVerified}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded transition-all ${
                    biometricVerified
                      ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/60 cursor-default"
                      : "bg-white/[0.04] hover:bg-white/[0.08] text-amber-400 border border-white/12"
                  }`}
                >
                  {biometricVerified ? "VERIFIED" : "VERIFY"}
                </button>
              </div>

              {/* Session Policy */}
              <div className="bg-black/20 border border-white/8 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-200">SESSION POLICY:</div>
                    <div className="text-[8px] text-emerald-400">NO AUTO-TIMEOUT // MANUAL LOCK ONLY</div>
                  </div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-950/60 border border-red-700/80 rounded-lg flex items-center space-x-2 text-red-300 text-xs font-bold">
                <AlertOctagon className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="pt-3 border-t border-white/8 flex items-center justify-between">
              <div className="text-[9px] text-stone-500 flex items-center space-x-1.5">
                <Lock className="w-3 h-3 text-amber-500" />
                <span>OFFICIAL SECRETS ACT 1989 COMPLIANT TERMINAL</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-lg text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-5 py-2 rounded-lg flex items-center space-x-1.5 shadow-lg transition-transform active:scale-95"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>AUTHORIZE & LOG IN</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
