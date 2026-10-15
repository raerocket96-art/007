import React, { useState } from "react";
import { AuthSession } from "../types";
import { soundManager } from "../utils/sound";
import { 
  Lock, 
  KeyRound, 
  Fingerprint, 
  ShieldAlert, 
  AlertTriangle, 
  ArrowRight,
  LogOut
} from "lucide-react";

interface LockScreenProps {
  session: AuthSession;
  onUnlock: () => void;
  onSwitchOperative: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  session,
  onUnlock,
  onSwitchOperative
}) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(false);

    if (passcode === session.agent.passcode) {
      soundManager.playAccessGranted();
      onUnlock();
    } else {
      soundManager.playAlarm();
      setError(true);
    }
  };

  const handleBiometricUnlock = () => {
    soundManager.playTeletype();
    setIsBiometricScanning(true);
    setError(false);

    setTimeout(() => {
      setIsBiometricScanning(false);
      soundManager.playAccessGranted();
      onUnlock();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1013] text-stone-200 flex flex-col items-center justify-center p-4 font-mono select-none">
      {/* Background Subtle Watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#181a1f] border-2 border-red-900/60 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Warning Icon & Status */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 border-2 border-red-700/80 flex items-center justify-center text-red-500 shadow-lg animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
              TERMINAL LOCKED // MANUAL SECURITY PROTOCOL
            </div>
            <h1 className="text-xl font-black text-stone-100 mt-0.5">
              HER MAJESTY'S GOVERNMENT // SIS
            </h1>
          </div>
        </div>

        {/* Locked Operative Dossier Snapshot */}
        <div className="bg-[#121417] border border-white/8 rounded-2xl p-4 flex items-center space-x-4 text-left">
          <img
            src={session.agent.avatarUrl}
            alt={session.agent.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-xl object-cover grayscale border-2 border-white/10 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-100 truncate">{session.agent.name}</span>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-950/50 border border-amber-800/60 px-1.5 py-0.2 rounded">
                LVL {session.agent.clearanceLevel}
              </span>
            </div>
            <div className="text-[10px] text-stone-400 truncate">{session.agent.role}</div>
            <div className="text-[9px] text-stone-500 mt-1 flex items-center space-x-2">
              <span>{session.agent.serviceNumber}</span>
              <span>•</span>
              <span className="text-emerald-400">{session.agent.biometricCode}</span>
            </div>
          </div>
        </div>

        {/* Unlock Form */}
        <form onSubmit={handleUnlock} className="space-y-3">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="ENTER CIPHER PASSCODE"
              autoFocus
              className="w-full bg-[#121417] border border-white/10 focus:border-red-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none font-mono tracking-widest text-center"
            />
          </div>

          {error && (
            <div className="text-[10px] text-red-400 font-bold bg-red-950/40 border border-red-800/40 py-1 px-2 rounded">
              CIPHER CODE INCORRECT. RETRY OR USE BIOMETRIC SENSOR.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleBiometricUnlock}
              disabled={isBiometricScanning}
              className="bg-[#24272c] hover:bg-[#2c3036] border border-white/10 text-stone-200 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all"
            >
              <Fingerprint className={`w-4 h-4 text-emerald-400 ${isBiometricScanning ? "animate-pulse" : ""}`} />
              <span>{isBiometricScanning ? "SCANNING..." : "BIOMETRIC"}</span>
            </button>

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-98"
            >
              <span>UNLOCK</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Switch Operative / Logout Action */}
        <div className="pt-2 border-t border-white/8 flex items-center justify-between text-[10px] text-stone-500">
          <span>SECURE WORKSPACE LOCKED</span>
          <button
            onClick={() => {
              soundManager.playClick();
              onSwitchOperative();
            }}
            className="text-stone-400 hover:text-amber-400 flex items-center space-x-1 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            <span>SWITCH OPERATIVE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
