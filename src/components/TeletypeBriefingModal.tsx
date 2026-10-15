import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, 
  Play, 
  FastForward, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Lock, 
  X, 
  ArrowRight,
  FileText,
  Radio
} from "lucide-react";
import { soundManager } from "../utils/sound";
import { MissionTemplate } from "../data/missions";
import { BondDoctrine } from "../data/bondDoctrines";

interface TeletypeBriefingModalProps {
  template: MissionTemplate;
  doctrine: BondDoctrine;
  onDeploy: () => void;
  onClose: () => void;
}

export const TeletypeBriefingModal: React.FC<TeletypeBriefingModalProps> = ({
  template,
  doctrine,
  onDeploy,
  onClose
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fullBriefingText = [
    `═══════════════════════════════════════════════════════════════════`,
    `SECRET INTELLIGENCE SERVICE // EYES ONLY // 00-SECTION DISPATCH`,
    `CENTRAL REGISTRY: VAUXHALL CROSS, LONDON SE1 // GCHQ ENCRYPTED`,
    `DATE: ${new Date().toISOString().replace("T", " // ").slice(0, 24)} ZULU`,
    `SECURITY CLEARANCE: LEVEL 9 (DISCRETIONARY EXECUTIVE ACTION)`,
    `═══════════════════════════════════════════════════════════════════`,
    ``,
    `[OPERATIONAL TARGET PROFILE]`,
    `OPERATION CODENAME   : ${template.codename}`,
    `TARGET UNIVERSE      : ${template.title.toUpperCase()}`,
    `THEATRE OF ACTION    : ${template.location}`,
    `THREAT CLASSIFICATION: ${template.threatLevel}`,
    `ASSIGNED 007 PROFILE : ${doctrine.name.toUpperCase()} (${doctrine.era})`,
    ``,
    `-------------------------------------------------------------------`,
    `[PRIMARY MISSION DIRECTIVE]`,
    `${template.objective}`,
    `-------------------------------------------------------------------`,
    ``,
    `[ORIGINAL FIRST SITUATION // POINT OF INSERTION]`,
    `${template.initialSituation}`,
    ``,
    `-------------------------------------------------------------------`,
    `[FIELD DOCTRINE & TACTICAL ADVISORY]`,
    `Operative Profile: ${doctrine.description}`,
    `Core Strengths   : ${doctrine.strengths.join(" • ")}`,
    `Authorized Loadout: Walther PPK/S, Q-Branch field ordnance, encrypted beacon.`,
    ``,
    `═══════════════════════════════════════════════════════════════════`,
    `TRANSMISSION COMPLETE // READY FOR IMMEDIATE INSERTION`,
    `HER MAJESTY'S GOVERNMENT DISAVOWS KNOWLEDGE IN EVENT OF CAPTURE.`,
    `═══════════════════════════════════════════════════════════════════`
  ].join("\n");

  useEffect(() => {
    let index = 0;
    const speed = 12; // ms per char
    let intervalId: number;

    intervalId = window.setInterval(() => {
      index += 2;
      if (index >= fullBriefingText.length) {
        setDisplayedText(fullBriefingText);
        setIsCompleted(true);
        clearInterval(intervalId);
      } else {
        setDisplayedText(fullBriefingText.slice(0, index));
        // Play teletype mechanical sound periodically
        if (index % 16 === 0 && !soundMuted) {
          soundManager.playTeletype();
        }
      }

      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [fullBriefingText, soundMuted]);

  const handleSkip = () => {
    setDisplayedText(fullBriefingText);
    setIsCompleted(true);
    soundManager.playClick();
  };

  const handleDeployNow = () => {
    soundManager.playAccessGranted();
    onDeploy();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-4xl w-full bg-[#070b0e] border-2 border-amber-500/50 rounded-2xl shadow-[0_0_80px_rgba(217,165,59,0.25)] flex flex-col max-h-[92vh] overflow-hidden font-mono">
        
        {/* CRT Glass & Amber Header Bar */}
        <div className="bg-[#121820] border-b border-amber-500/40 px-4 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-amber-400 font-bold tracking-widest text-[11px] uppercase">
              MI6 TELETYPE TERMINAL // DIRECT DISPATCH
            </span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] px-2 py-0.5 rounded">
              TOP SECRET // STRAP 1
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className="text-stone-400 hover:text-amber-400 p-1.5 rounded transition-colors"
              title={soundMuted ? "Unmute teletype sound" : "Mute teletype sound"}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1.5 rounded transition-colors"
              title="Close and return to selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Teletype Paper / Terminal Screen */}
        <div 
          ref={scrollRef}
          className="flex-1 p-5 sm:p-7 overflow-y-auto bg-[#030608] text-amber-300 text-xs sm:text-[13px] leading-relaxed select-text font-mono relative scanlines shadow-inner"
          style={{
            textShadow: "0 0 5px rgba(245, 158, 11, 0.45)",
          }}
        >
          <pre className="whitespace-pre-wrap font-mono break-words">{displayedText}</pre>
          {!isCompleted && (
            <span className="inline-block w-2.5 h-4 bg-amber-400 ml-1 animate-pulse" />
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#0e131a] border-t border-white/10 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] text-stone-400 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>ENCRYPTED SECURE CARRIER // VAUXHALL CROSS &rarr; AGENT 007</span>
          </div>

          <div className="flex items-center gap-2.5">
            {!isCompleted && (
              <button
                onClick={handleSkip}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>FAST FORWARD</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-lg text-xs font-bold transition-colors"
            >
              CANCEL / ABORT
            </button>

            <button
              onClick={handleDeployNow}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black rounded-lg text-xs font-black tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>INSERT 007 NOW (TURN 1)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
