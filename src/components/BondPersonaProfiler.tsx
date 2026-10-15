import React, { useState, useMemo } from "react";
import { 
  Award, 
  Sparkles, 
  Target, 
  ShieldCheck, 
  BrainCircuit, 
  HeartPulse, 
  Crosshair, 
  Play, 
  RotateCcw, 
  Check, 
  UserCheck, 
  Flame, 
  Radio, 
  FileText,
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from "lucide-react";
import { BOND_DOCTRINES, BondDoctrine } from "../data/bondDoctrines";
import { soundManager } from "../utils/sound";

interface BondPersonaProfilerProps {
  onStartMissionWithDoctrine?: (doctrineId: string, templateId?: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

interface QuizQuestion {
  id: number;
  scenario: string;
  category: string;
  options: {
    text: string;
    description: string;
    scores: Record<string, number>; // actor doctrine ID -> score (0-10)
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: "TACTICAL CONFRONTATION",
    scenario: "An enemy operative intercepts you in a luxury casino suite with a drawn silenced pistol. How do you resolve the encounter?",
    options: [
      {
        text: "Feign amusement, exploit an environmental distraction (lighter/champagne), and disarm them with brutal efficiency.",
        description: "Pragmatic deception and ruthless physical dominance.",
        scores: { connery: 10, craig: 6, brosnan: 5, moore: 3, dalton: 4, lazenby: 6 }
      },
      {
        text: "Maintain absolute composure, deliver a razor-sharp quip, and deploy a concealed Q-Branch gadget with impeccable timing.",
        description: "Sophisticated decorum, psychological calm, and high-tech wit.",
        scores: { moore: 10, brosnan: 8, connery: 5, dalton: 2, craig: 1, lazenby: 3 }
      },
      {
        text: "Instantly close the distance, take the recoil graze, and neutralize the threat with relentless, bone-shattering close-quarters combat.",
        description: "Raw physiological resilience and uncompromising kinetic force.",
        scores: { craig: 10, dalton: 7, lazenby: 7, connery: 6, brosnan: 3, moore: 1 }
      },
      {
        text: "Execute a disciplined, textbook tactical counter-ambush, securing the firearm as evidence while demanding intelligence on their handler.",
        description: "Mission-first discipline, methodical intelligence gathering, and tactical realism.",
        scores: { dalton: 10, brosnan: 7, craig: 5, connery: 4, moore: 3, lazenby: 2 }
      },
      {
        text: "Protect the innocent bystander or ally first, accepting personal vulnerability to ensure their survival before taking down the hostile.",
        description: "Emotional commitment, deep empathy, and instinctive chivalry.",
        scores: { lazenby: 10, craig: 6, dalton: 5, brosnan: 4, connery: 2, moore: 3 }
      },
      {
        text: "Engage in swift tactical suppression with dual-weapon dexterity, then trigger an automated perimeter escape sequence.",
        description: "High-gloss kinetic action, modern cyber-awareness, and stylish composure.",
        scores: { brosnan: 10, moore: 5, connery: 6, craig: 4, dalton: 5, lazenby: 3 }
      }
    ]
  },
  {
    id: 2,
    category: "Q-BRANCH GEAR PHILOSOPHY",
    scenario: "Major Boothroyd (Q) invites you to select your primary field kit for an unsanctioned infiltration. What is your priority?",
    options: [
      {
        text: "The standard Walther PPK/P99, a sharp dinner suit, and a lighter that conceals high-grade plastic explosive.",
        description: "Classic lethality masked behind effortless elegance.",
        scores: { connery: 10, brosnan: 6, craig: 5, moore: 3, dalton: 4, lazenby: 3 }
      },
      {
        text: "The most elaborate wrist-mounted micro-dart system, magnetic watch, and a submarine Lotus with surface-to-air missiles.",
        description: "Ingenious technological supremacy and debonair audacity.",
        scores: { moore: 10, brosnan: 7, connery: 4, dalton: 1, craig: 1, lazenby: 2 }
      },
      {
        text: "A high-precision sniper rifle with infrared sighting, tactical body armor, and non-traceable field comms.",
        description: "Professional military realism and uncompromising tactical utility.",
        scores: { dalton: 10, craig: 7, brosnan: 6, connery: 4, lazenby: 3, moore: 1 }
      },
      {
        text: "Laser watch, titanium grappling hook belt, and a high-tech BMW packed with GPS tracking and autonomous drive.",
        description: "Peak 90s/2000s technological mastery and polished precision.",
        scores: { brosnan: 10, moore: 6, connery: 5, dalton: 3, craig: 2, lazenby: 2 }
      },
      {
        text: "A reliable firearm, a clean knife, and a bottle of Scotch. The rest is just weight that gets in the way.",
        description: "Brutal minimalism and visceral resourcefulness.",
        scores: { craig: 10, dalton: 7, connery: 6, lazenby: 5, brosnan: 2, moore: 1 }
      }
    ]
  },
  {
    id: 3,
    category: "DIPLOMATIC VS. DIRECT ACTION",
    scenario: "An influential foreign oligarch is funding a private mercenary army. You must extract their private encryption ledger. Your approach:",
    options: [
      {
        text: "Infiltrate their high-stakes private baccarat game, charm their inner circle, and steal the cipher during a romantic rendezvous.",
        description: "Irresistible magnetism and effortless social manipulation.",
        scores: { connery: 10, moore: 8, brosnan: 7, lazenby: 5, craig: 3, dalton: 2 }
      },
      {
        text: "Engage them in a witty verbal duel at a diplomatic gala, discreetly swap their champagne glass, and let GCHQ tap their line.",
        description: "High-society diplomacy, subtle subterfuge, and zero blood on the carpet.",
        scores: { moore: 10, brosnan: 7, connery: 5, dalton: 2, craig: 1, lazenby: 2 }
      },
      {
        text: "Track their illicit arms shipment to a remote border crossing, ambush the convoy, and interrogate the commander personally.",
        description: "Aggressive reconnaissance, field grit, and righteous operational justice.",
        scores: { dalton: 10, craig: 8, lazenby: 5, connery: 5, brosnan: 4, moore: 1 }
      },
      {
        text: "Breach the security vault by blowing through the wall, eliminate the mercenary guards, and tear the hard drive from the mainframe.",
        description: "Direct kinetic assault with visceral momentum.",
        scores: { craig: 10, dalton: 6, connery: 6, brosnan: 5, lazenby: 6, moore: 1 }
      }
    ]
  },
  {
    id: 4,
    category: "RESPONSE TO AUTHORITY & ORDERS",
    scenario: "M issues an explicit order from Whitehall to abort the mission due to political sensitivities. However, you know the villain's weapon is hours from launch. What do you do?",
    options: [
      {
        text: "Ignore the radio transmission, crack a dry smile, and complete the job anyway because 00-clearance means taking executive responsibility.",
        description: "Sovereign confidence and pragmatic disregard for red tape.",
        scores: { connery: 10, craig: 8, brosnan: 6, dalton: 6, moore: 4, lazenby: 5 }
      },
      {
        text: "Resign your commission immediately on the spot, go completely rogue, and hunt down the target out of personal vengeance and duty.",
        description: "Fierce independence, moral outrage, and uncompromising conviction.",
        scores: { dalton: 10, craig: 9, lazenby: 8, connery: 5, brosnan: 3, moore: 1 }
      },
      {
        text: "Appear to comply diplomatically while using MI6 diplomatic channels to engineer an unavoidable situation where intervention is mandatory.",
        description: "Sophisticated bureaucracy manipulation and graceful cunning.",
        scores: { moore: 10, brosnan: 8, connery: 6, dalton: 3, craig: 2, lazenby: 2 }
      },
      {
        text: "Keep pushing forward relentlessly, absorbing whatever discipline Whitehall hands down afterwards so long as the threat is destroyed.",
        description: "Stubborn resilience and stoic dedication to duty.",
        scores: { craig: 10, dalton: 8, lazenby: 7, connery: 7, brosnan: 5, moore: 3 }
      }
    ]
  },
  {
    id: 5,
    category: "THE 00-MINDSET UNDER TORTURE",
    scenario: "Captured by the mastermind behind the conspiracy, they subject you to intense psychological and physical interrogation. What is your inner state?",
    options: [
      {
        text: "Unshakable, defiant sarcasm and razor-sharp mockery, knowing they cannot kill you without the coordinates.",
        description: "Indomitable charisma, supreme psychological dominance.",
        scores: { connery: 10, craig: 8, brosnan: 6, moore: 5, dalton: 4, lazenby: 4 }
      },
      {
        text: "Polite indifference, arching an eyebrow, and looking for the exact flaw in their elaborate deathtrap.",
        description: "Detached gentlemanly calm and intellectual problem solving.",
        scores: { moore: 10, brosnan: 7, connery: 6, lazenby: 2, dalton: 2, craig: 1 }
      },
      {
        text: "Enduring the physical agony with quiet, stony fury, burning their face into memory so you can return the favor.",
        description: "Relentless endurance, visceral stoicism, and cold retribution.",
        scores: { craig: 10, dalton: 9, lazenby: 7, connery: 6, brosnan: 4, moore: 1 }
      },
      {
        text: "Laser focus on protecting your allies and finding the microsecond opening to turn their own guard against them.",
        description: "Protective chivalry and explosive reactive courage.",
        scores: { lazenby: 10, craig: 7, dalton: 6, brosnan: 5, connery: 4, moore: 2 }
      }
    ]
  }
];

export const BondPersonaProfiler: React.FC<BondPersonaProfilerProps> = ({
  onStartMissionWithDoctrine,
  onNavigateToTab
}) => {
  const [activeView, setActiveView] = useState<"quiz" | "compendium">("quiz");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selectedDoctrineId, setSelectedDoctrineId] = useState<string>("connery");
  const [isSavedPreference, setIsSavedPreference] = useState(false);

  // Preferred doctrine stored in localStorage
  const savedPreferredDoctrine = useMemo(() => {
    try {
      return localStorage.getItem("mi6_preferred_doctrine") || "connery";
    } catch {
      return "connery";
    }
  }, []);

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    soundManager.playClick();
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleResetQuiz = () => {
    soundManager.playPaperRustle();
    setAnswers({});
  };

  // Calculate scores for each actor
  const calculatedResults = useMemo(() => {
    const totals: Record<string, number> = {
      connery: 0,
      lazenby: 0,
      moore: 0,
      dalton: 0,
      brosnan: 0,
      craig: 0
    };

    let answeredCount = 0;

    Object.entries(answers).forEach(([qId, optIdx]) => {
      const q = QUIZ_QUESTIONS.find(item => item.id === Number(qId));
      if (q && q.options[optIdx]) {
        answeredCount++;
        const option = q.options[optIdx];
        Object.entries(option.scores).forEach(([actorId, pts]) => {
          totals[actorId] = (totals[actorId] || 0) + pts;
        });
      }
    });

    const maxPossible = answeredCount > 0 ? answeredCount * 10 : 1;
    const percentages: Record<string, number> = {};
    
    Object.entries(totals).forEach(([actorId, score]) => {
      percentages[actorId] = Math.min(100, Math.round((score / maxPossible) * 100));
    });

    // Find the top match
    const sortedActors = Object.entries(percentages).sort((a, b) => b[1] - a[1]);
    const topMatchId = sortedActors[0] ? sortedActors[0][0] : "connery";
    const topMatchScore = sortedActors[0] ? sortedActors[0][1] : 85;

    return {
      percentages,
      topMatchId,
      topMatchScore,
      answeredCount,
      isComplete: answeredCount === QUIZ_QUESTIONS.length
    };
  }, [answers]);

  const activeDoctrine = BOND_DOCTRINES.find(d => d.id === (activeView === "quiz" && calculatedResults.isComplete ? calculatedResults.topMatchId : selectedDoctrineId)) || BOND_DOCTRINES[0];

  const handleSaveAsPreferred = (doctrineId: string) => {
    soundManager.playTeletype();
    try {
      localStorage.setItem("mi6_preferred_doctrine", doctrineId);
      setIsSavedPreference(true);
      setTimeout(() => setIsSavedPreference(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Sample representative missions for each actor
  const actorSampleMissions: Record<string, { id: string; title: string; year: number }> = {
    connery: { id: "film-goldfinger", title: "Goldfinger", year: 1964 },
    lazenby: { id: "film-on-her-majestys-secret-service", title: "On Her Majesty's Secret Service", year: 1969 },
    moore: { id: "film-the-spy-who-loved-me", title: "The Spy Who Loved Me", year: 1977 },
    dalton: { id: "film-licence-to-kill", title: "Licence to Kill", year: 1989 },
    brosnan: { id: "film-goldeneye", title: "GoldenEye", year: 1995 },
    craig: { id: "film-casino-royale", title: "Casino Royale", year: 2006 }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#12161f] border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] font-bold text-amber-400 tracking-widest uppercase">
                  PSYCHOLOGICAL EVALUATION BRANCH // 00-SECTION
                </span>
                <span className="bg-stone-800 text-stone-300 font-mono text-[9px] px-2 py-0.5 rounded border border-white/10">
                  DOCTRINE PROFILER
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-100 tracking-tight mt-1">
                Which James Bond Do You Feel Most Like?
              </h1>
              <p className="text-stone-400 text-xs mt-1 max-w-2xl leading-relaxed">
                Take the 5-question MI6 tactical alignment quiz to discover your statistical persona match across the six cinematic 007 incarnations, or explore the complete archival doctrine compendium.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveView("quiz");
              }}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all border ${
                activeView === "quiz"
                  ? "bg-amber-500 text-black border-amber-400 shadow-md"
                  : "bg-black/40 text-stone-400 border-white/10 hover:text-stone-200"
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>ALIGNMENT QUIZ</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveView("compendium");
              }}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition-all border ${
                activeView === "compendium"
                  ? "bg-amber-500 text-black border-amber-400 shadow-md"
                  : "bg-black/40 text-stone-400 border-white/10 hover:text-stone-200"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>DOCTRINES COMPENDIUM</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: QUIZ */}
      {activeView === "quiz" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Quiz Questions Column (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between font-mono text-xs border-b border-white/10 pb-2">
              <span className="text-amber-400 font-bold uppercase tracking-wider">
                FIELD ASSESSMENT SCENARIOS ({calculatedResults.answeredCount}/{QUIZ_QUESTIONS.length} ANSWERED)
              </span>
              {calculatedResults.answeredCount > 0 && (
                <button
                  onClick={handleResetQuiz}
                  className="text-stone-400 hover:text-red-400 flex items-center space-x-1 transition-colors text-[11px]"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RESET ANSWERS</span>
                </button>
              )}
            </div>

            {QUIZ_QUESTIONS.map((q, qIndex) => {
              const selectedOpt = answers[q.id];
              const isAnswered = selectedOpt !== undefined;

              return (
                <div
                  key={q.id}
                  className={`bg-[#101319] border rounded-2xl p-5 transition-all space-y-4 ${
                    isAnswered
                      ? "border-amber-500/40 bg-[#121620]"
                      : "border-white/8 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      SCENARIO 0{qIndex + 1} // {q.category}
                    </span>
                    {isAnswered && (
                      <span className="text-emerald-400 font-mono text-[10px] flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>LOGGED</span>
                      </span>
                    )}
                  </div>

                  <p className="text-stone-100 font-semibold text-sm leading-relaxed">
                    {q.scenario}
                  </p>

                  <div className="space-y-2 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isChosen
                              ? "bg-amber-500/20 border-amber-500 text-stone-100 font-medium shadow-sm ring-1 ring-amber-500/40"
                              : "bg-black/30 border-white/6 text-stone-300 hover:bg-black/60 hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                              isChosen ? "border-amber-400 bg-amber-400 text-black" : "border-stone-600"
                            }`}>
                              {isChosen && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                            </div>
                            <div>
                              <p className="leading-snug">{opt.text}</p>
                              <span className="text-[10px] text-stone-400 font-mono block mt-1">
                                {opt.description}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Match Calculation & Top Persona Result (5 Cols Sticky) */}
          <div className="lg:col-span-5 bg-[#12161e] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-5 sticky top-24">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2 text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                <span>REAL-TIME 007 ALIGNMENT ANALYSIS</span>
              </div>
              <h2 className="text-xl font-black text-stone-100 mt-1">
                {calculatedResults.isComplete ? "Your Official Bond Match" : "Projected Persona Alignment"}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {calculatedResults.answeredCount === 0
                  ? "Select scenario choices on the left to calibrate your operative profile."
                  : `Calibrated from ${calculatedResults.answeredCount} field decisions.`}
              </p>
            </div>

            {/* Top Match Spotlight */}
            {activeDoctrine && (
              <div className="bg-gradient-to-br from-amber-500/10 via-black/40 to-black/60 border border-amber-500/50 rounded-2xl p-4 relative overflow-hidden">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-900 border-2 border-amber-500/60 flex items-center justify-center font-mono font-black text-amber-400 text-xl shadow-inner shrink-0">
                    007
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-amber-400 font-bold text-[10px] uppercase">
                        TOP OPERATIVE MATCH
                      </span>
                      <span className="bg-amber-500 text-black font-mono font-black text-[10px] px-1.5 rounded">
                        {calculatedResults.percentages[activeDoctrine.id] || 85}% MATCH
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-stone-100">
                      {activeDoctrine.name}
                    </h3>
                    <span className="text-xs text-stone-400 font-mono">
                      Era: {activeDoctrine.era}
                    </span>
                  </div>
                </div>

                <p className="text-stone-300 text-xs mt-3 leading-relaxed font-sans">
                  {activeDoctrine.description}
                </p>

                {/* Key Strengths Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {activeDoctrine.strengths.map((str, idx) => (
                    <span
                      key={idx}
                      className="bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30"
                    >
                      {str}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Full 6-Actor Percentage Alignment Breakdown */}
            <div className="space-y-2.5 font-mono text-xs">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                FULL 6-ACTOR INCARNATION BREAKDOWN
              </span>

              {BOND_DOCTRINES.map(doctrine => {
                const pct = calculatedResults.percentages[doctrine.id] || 0;
                const isLeader = doctrine.id === calculatedResults.topMatchId && calculatedResults.answeredCount > 0;

                return (
                  <div key={doctrine.id} className="bg-black/30 border border-white/6 p-2.5 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-bold ${isLeader ? "text-amber-400" : "text-stone-200"}`}>
                        {doctrine.name} ({doctrine.era.split("–")[0]})
                      </span>
                      <span className="font-bold text-amber-400">{pct}%</span>
                    </div>
                    <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isLeader ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-stone-500"
                        }`}
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons: Set as Preferred & Launch */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSaveAsPreferred(activeDoctrine.id)}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center space-x-2 border border-white/10 transition-colors"
              >
                {isSavedPreference ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">DOCTRINE SAVED AS DEFAULT</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>SET {activeDoctrine.name.toUpperCase()} AS MY DEFAULT 007</span>
                  </>
                )}
              </button>

              {onStartMissionWithDoctrine && (
                <button
                  onClick={() => {
                    const sample = actorSampleMissions[activeDoctrine.id];
                    soundManager.playTeletype();
                    onStartMissionWithDoctrine(activeDoctrine.id, sample?.id);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>PLAY {actorSampleMissions[activeDoctrine.id]?.title.toUpperCase()} AS {activeDoctrine.name.toUpperCase()}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COMPENDIUM OF ALL 6 DOCTRINES */}
      {activeView === "compendium" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {BOND_DOCTRINES.map(doctrine => {
              const isSelected = selectedDoctrineId === doctrine.id;
              const sampleMission = actorSampleMissions[doctrine.id];

              return (
                <div
                  key={doctrine.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedDoctrineId(doctrine.id);
                  }}
                  className={`bg-[#101319] border rounded-2xl p-5 cursor-pointer transition-all space-y-4 relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? "border-amber-500 bg-[#141822] shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50"
                      : "border-white/8 hover:border-white/20 hover:bg-[#12151c]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          ERA // {doctrine.era}
                        </span>
                        <h3 className="text-lg font-black text-stone-100 mt-0.5">
                          {doctrine.name}
                        </h3>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-amber-400 text-xs">
                        007
                      </div>
                    </div>

                    <p className="text-stone-300 text-xs leading-relaxed font-sans">
                      {doctrine.description}
                    </p>

                    {/* Stat Bars */}
                    <div className="space-y-1.5 font-mono text-[10px] pt-1">
                      <div className="flex justify-between">
                        <span className="text-stone-400">TACTICAL INTEL:</span>
                        <span className="text-amber-300 font-bold">{doctrine.tacticalIntelligence}%</span>
                      </div>
                      <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${doctrine.tacticalIntelligence}%` }} />
                      </div>

                      <div className="flex justify-between pt-1">
                        <span className="text-stone-400">CHARM / SEDUCTION:</span>
                        <span className="text-amber-300 font-bold">{doctrine.charm}%</span>
                      </div>
                      <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${doctrine.charm}%` }} />
                      </div>

                      <div className="flex justify-between pt-1">
                        <span className="text-stone-400">PROFESSIONALISM:</span>
                        <span className="text-amber-300 font-bold">{doctrine.professionalism}%</span>
                      </div>
                      <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full" style={{ width: `${doctrine.professionalism}%` }} />
                      </div>

                      <div className="flex justify-between pt-1">
                        <span className="text-stone-400">RUTHLESSNESS:</span>
                        <span className="text-amber-300 font-bold">{doctrine.ruthlessness}%</span>
                      </div>
                      <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-red-500 h-full" style={{ width: `${doctrine.ruthlessness}%` }} />
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {doctrine.strengths.map((s, idx) => (
                        <span key={idx} className="bg-black/40 text-stone-300 text-[9px] font-mono px-2 py-0.5 rounded border border-white/5">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/6 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveAsPreferred(doctrine.id);
                      }}
                      className="text-[10px] font-mono font-bold bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 px-2.5 py-1.5 rounded border border-white/10 transition-colors"
                    >
                      SET DEFAULT
                    </button>

                    {onStartMissionWithDoctrine && sampleMission && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playTeletype();
                          onStartMissionWithDoctrine(doctrine.id, sampleMission.id);
                        }}
                        className="text-[10px] font-mono font-bold bg-amber-500 hover:bg-amber-400 text-black px-2.5 py-1.5 rounded flex items-center space-x-1 shadow transition-colors"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>PLAY {sampleMission.title.toUpperCase()}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
