import React, { useMemo } from "react";
import { jsPDF } from "jspdf";
import { MissionDebriefReport, MissionState } from "../types";
import {
  Award,
  ShieldCheck,
  Target,
  Film,
  TrendingUp,
  BrainCircuit,
  HeartPulse,
  Crosshair,
  Scale,
  Lightbulb,
  Route,
  GitCompareArrows,
  ClipboardCheck,
  ShieldAlert,
  Download,
} from "lucide-react";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const scoreOr = (value: number | undefined, fallback: number) => typeof value === "number" ? clamp(value) : clamp(fallback);

export const EnhancedDebriefPanel: React.FC<{ state: MissionState; report: MissionDebriefReport | null }> = ({ state, report }) => {
  const localMetrics = useMemo(() => {
    const evidence = state.evidence?.length || 0;
    const casualties = state.casualties?.length || 0;
    const aggressive = state.timeline.filter(t => /shoot|attack|assault|kill|explos|aggress|breach|strike|eliminat|human shield/i.test(t.action)).length;
    const operational = clamp((state.missionProgress ?? 0) * 0.30 + state.agentHealth * 0.18 + (state.intelligenceConfidence ?? 0) * 0.22 + (state.escapeReadiness ?? 0) * 0.18 + (100 - (state.collateralDamage ?? 0)) * 0.12);
    const strategic = clamp((state.intelligenceConfidence ?? 0) * 0.32 + state.stealthRating * 0.14 + (100 - (state.suspicion ?? state.alarmLevel)) * 0.14 + (state.escapeReadiness ?? 0) * 0.18 + Math.min(22, evidence * 5));
    const cinematic = clamp(state.alarmLevel * 0.30 + (100 - state.agentHealth) * 0.18 + aggressive * 11 + casualties * 7 + Math.min(20, state.timeline.length));
    const intel = clamp((state.intelligenceConfidence ?? 0) * 0.78 + Math.min(22, evidence * 5));
    const assetProtection = clamp(100 - (state.collateralDamage ?? 0) * 0.65 - casualties * 8);
    const discipline = clamp(100 - (state.suspicion ?? 0) * 0.20 - (state.politicalExposure ?? 0) * 0.35 - (state.collateralDamage ?? 0) * 0.25 + (state.escapeReadiness ?? 0) * 0.15);
    const resourcefulness = clamp(55 + Math.min(35, state.timeline.length * 1.5) + Math.min(10, evidence * 2));
    const overall = clamp((operational + strategic + intel + assetProtection + state.agentHealth + discipline + resourcefulness) / 7);
    return { operational, strategic, cinematic, intel, assetProtection, discipline, resourcefulness, overall };
  }, [state]);


  const localChoiceAnalysis = useMemo(() => {
    const entries = state.timeline.filter(t => (t.turn ?? 0) > 0);
    const actions = entries.map(t => String(t.action || ""));
    const count = (re: RegExp) => actions.filter(a => re.test(a)).length;
    const stealth = count(/stealth|covert|conceal|surveillance|discreet|quiet|tail|observe|listen|cover|without exposing/i);
    const diplomacy = count(/talk|ask|reassur|thank|negot|rapport|calm|kindness|social|cigarette/i);
    const gadgets = count(/q-branch|gadget|watch|camera|decoder|rebreather|grapple|equipment|device|sensor|technical/i);
    const aggression = count(/shoot|kill|attack|assault|execute|hostage|breach|force|violent|threat/i);
    const loyalty = count(/protect|save|stabiliz|medical|care|humane|keep .*alive|free to leave|help|extract .*safe/i);
    const improvisation = count(/improv|distraction|wait|adapt|flank|reposition|peripheral|shoe|unusual|creative/i);

    const scores = [
      { actor: "Sean Connery", score: stealth * 2 + diplomacy * 1.2 + aggression * 1.1 + localMetrics.strategic / 18, style: "controlled classic spycraft, social confidence and decisive pressure" },
      { actor: "George Lazenby", score: loyalty * 2.5 + diplomacy * 1.3 + stealth + localMetrics.assetProtection / 18, style: "protective loyalty, personal commitment and physical courage" },
      { actor: "Roger Moore", score: improvisation * 2.4 + diplomacy * 1.7 + gadgets * 1.8 + localMetrics.resourcefulness / 16, style: "improvisation, charm, gadgets and unconventional problem-solving" },
      { actor: "Timothy Dalton", score: aggression * 1.4 + loyalty * 1.8 + localMetrics.discipline / 18 + localMetrics.operational / 22, style: "mission seriousness, intensity, loyalty and duty-first focus" },
      { actor: "Pierce Brosnan", score: localMetrics.intel / 13 + localMetrics.strategic / 14 + gadgets * 1.5 + diplomacy * 1.1 + localMetrics.resourcefulness / 20, style: "balanced modern tradecraft, intelligence, technology, charm and tempo control" },
      { actor: "Daniel Craig", score: localMetrics.operational / 14 + state.agentHealth / 18 + aggression * 2 + localMetrics.cinematic / 25, style: "direct tactical resolution, endurance and high personal risk tolerance" },
    ].sort((a, b) => b.score - a.score);

    const top = scores[0];
    const sample = entries.length
      ? [entries[0], entries[Math.floor(entries.length / 2)], entries[entries.length - 1]]
          .filter(Boolean)
          .map(e => `T${e.turn}: ${String(e.action || "").slice(0, 90)}`)
          .filter((v, i, a) => a.indexOf(v) === i)
      : [];

    return {
      persona: {
        actor: top.actor,
        rationale: `Closest behavioral match: ${top.style}. This is calculated from the recorded choices, not the selected actor: ${stealth} covert/surveillance, ${diplomacy} interpersonal, ${gadgets} technical/gadget, ${aggression} direct-force, ${loyalty} protective/loyalty and ${improvisation} improvisational choice(s).`,
        preferredActor: state.preferredBondActor,
        verdict: state.preferredBondActor && state.preferredBondActor === top.actor ? "AGREES" as const : "DISAGREES" as const,
        verdictRationale: state.preferredBondActor
          ? (state.preferredBondActor === top.actor
              ? `The recorded choices support your pre-deployment preference for ${state.preferredBondActor}.`
              : `You selected ${state.preferredBondActor}, but the recorded choices aligned more closely with ${top.actor}.`)
          : "No pre-deployment Bond preference was recorded for this session."
      },
      mAssessment: `M's choice-based assessment: your run shows ${stealth >= aggression ? "a preference for information and control before commitment" : "a preference for decisive direct action once a target is identified"}. ${loyalty > 0 ? "You repeatedly showed protective loyalty toward people under your control or responsibility. " : ""}${diplomacy > 0 ? "You also used conversation, reassurance or negotiation as operational tools rather than treating every problem as a firefight. " : ""}${aggression > 0 ? `There were ${aggression} direct-force or coercive choice(s), so M would weigh necessity and proportionality rather than hide them inside an overall score. ` : ""}${sample.length ? `Representative choices: ${sample.join(" • ")}.` : "The archived run contains too little choice data for a deeper personality read."}`
    };
  }, [state, localMetrics]);

  const bondPersona = useMemo(() => {
    const base = report?.bondComparison?.actor ? report.bondComparison : localChoiceAnalysis.persona;
    const preferredActor = base.preferredActor || state.preferredBondActor;
    const verdict = base.verdict || (preferredActor ? (preferredActor === base.actor ? "AGREES" : "DISAGREES") : undefined);
    const verdictRationale = base.verdictRationale || (preferredActor
      ? (verdict === "AGREES"
          ? `The recorded mission choices support your pre-deployment preference for ${preferredActor}.`
          : `You selected ${preferredActor}, while the choice-based analysis aligns more closely with ${base.actor}.`)
      : "No pre-deployment Bond preference was recorded for this session.");
    return { ...base, preferredActor, verdict, verdictRationale };
  }, [report, localChoiceAnalysis, state.preferredBondActor]);
  const mChoiceAssessment = report?.mThoughts?.trim() || localChoiceAnalysis.mAssessment;
  const decisionExtremes = useMemo(() => {
    const assessed = (report?.decisionAssessment || []).filter(d => typeof d.score === "number");
    const best = [...assessed].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 3);
    const worst = [...assessed].sort((a, b) => (a.score ?? 100) - (b.score ?? 100)).slice(0, 3);
    return { best, worst };
  }, [report?.decisionAssessment]);

  const operationDNA = useMemo(() => {
    const assessed = report?.decisionAssessment || [];
    const avg = (key: "objectiveValue" | "intelligenceValue" | "discretion" | "assetProtection" | "proportionality", fallback: number) => {
      const vals = assessed.map(d => d.dimensions?.[key]).filter((v): v is number => typeof v === "number");
      return vals.length ? clamp(vals.reduce((a,b)=>a+b,0) / vals.length) : fallback;
    };
    return [
      ["Objective focus", avg("objectiveValue", localMetrics.operational)],
      ["Intelligence instinct", avg("intelligenceValue", localMetrics.intel)],
      ["Discretion", avg("discretion", localMetrics.discipline)],
      ["Asset protection", avg("assetProtection", localMetrics.assetProtection)],
      ["Proportionality", avg("proportionality", localMetrics.discipline)],
      ["Improvisation", localMetrics.resourcefulness],
    ] as Array<[string, number]>;
  }, [report?.decisionAssessment, localMetrics]);

  const generatePDF = () => {
    if (!report) return;
    const doc = new jsPDF();
    doc.setFont("courier");
    doc.setFontSize(14);
    doc.text("MI6 // CLASSIFIED OPERATIONAL DOSSIER", 20, 20);
    doc.setFontSize(10);
    doc.text(`MISSION: ${state.operationTitle || "Classified"}`, 20, 30);
    doc.text("STATUS: FINAL DEBRIEF", 20, 35);
    doc.line(20, 40, 190, 40);
    
    doc.setFontSize(12);
    doc.text("EXECUTIVE SUMMARY", 20, 50);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(report.operationSummary, 170), 20, 58);
    
    doc.setFontSize(12);
    doc.text("M'S THOUGHTS", 20, 85);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(report.mThoughts, 170), 20, 93);

    doc.setFontSize(12);
    doc.text("PSYCHOLOGICAL EVALUATION", 20, 120);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(report.psychologicalEvaluation, 170), 20, 128);

    doc.setFontSize(12);
    doc.text("BOND PERSONA // AI VERDICT", 20, 158);
    doc.setFontSize(10);
    doc.text(`PREFERRED: ${bondPersona.preferredActor || state.preferredBondActor || "NOT RECORDED"}`, 20, 166);
    doc.text(`AI MATCH: ${bondPersona.actor}`, 20, 172);
    doc.text(`VERDICT: ${bondPersona.verdict || "UNRESOLVED"}`, 20, 178);
    doc.text(doc.splitTextToSize(bondPersona.verdictRationale || bondPersona.rationale, 170), 20, 186);

    doc.setFontSize(8);
    doc.text("REDACTED // FOR INTERNAL USE ONLY", 20, 280);
    
    doc.save(`MI6_Dossier_${state.operationTitle || "Mission"}.pdf`);
  };

  const scores = report?.scores;
  const metricCards = [
    { label: "Operational Effectiveness", value: scoreOr(scores?.operationalEffectiveness, localMetrics.operational), hint: "Objective delivery, survival, intelligence and extraction.", icon: ShieldCheck, cls: "text-emerald-300" },
    { label: "Strategic Dominance", value: scoreOr(scores?.strategicDominance, localMetrics.strategic), hint: "Control of tempo, information and hostile options.", icon: Target, cls: "text-sky-300" },
    { label: "Intelligence Exploitation", value: scoreOr(scores?.intelligenceExploitation, localMetrics.intel), hint: "How effectively discovered intelligence was converted into advantage.", icon: BrainCircuit, cls: "text-violet-300" },
    { label: "Asset Protection", value: scoreOr(scores?.assetProtection, localMetrics.assetProtection), hint: "Protection of friendly assets and limitation of collateral losses.", icon: HeartPulse, cls: "text-rose-300" },
    { label: "Agent Survival", value: scoreOr(scores?.agentSurvival, state.agentHealth), hint: "Operative condition at session closure.", icon: Crosshair, cls: "text-emerald-300" },
    { label: "Mission Discipline", value: scoreOr(scores?.missionDiscipline, localMetrics.discipline), hint: "Restraint, proportionality and adherence to operational purpose.", icon: Scale, cls: "text-amber-300" },
    { label: "Resourcefulness", value: scoreOr(scores?.resourcefulness, localMetrics.resourcefulness), hint: "Adaptation, deception and use of available assets.", icon: Lightbulb, cls: "text-yellow-300" },
    { label: "Cinematic Intensity", value: scoreOr(scores?.cinematicIntensity, localMetrics.cinematic), hint: "Danger and spectacle only. This does not determine professional quality.", icon: Film, cls: "text-orange-300" },
  ];
  const overall = scoreOr(scores?.overallAssessment, localMetrics.overall);

  const betterOutcomeLabel = report?.worldOutcomeComparison?.betterOutcome === "SIMULATION"
    ? "SIMULATED BRANCH"
    : report?.worldOutcomeComparison?.betterOutcome === "ORIGINAL"
      ? "ORIGINAL FILM"
      : report?.worldOutcomeComparison?.betterOutcome === "MIXED"
        ? "MIXED OUTCOME"
        : "UNRESOLVED";

  const comparison = report?.worldOutcomeComparison;

  return (
    <section className="mi6-swap-panel rounded-[24px] p-4 font-mono text-stone-200 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-amber-400 font-bold">Final MI6 Assessment</div>
            <div className="text-xs font-bold">Professional performance separated from cinematic intensity</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {report && (
            <button onClick={generatePDF} className="flex items-center gap-1.5 rounded-lg bg-amber-900/40 border border-amber-700/50 px-3 py-1.5 text-[10px] text-amber-300 hover:bg-amber-900/60 font-bold transition-colors">
              <Download className="w-3.5 h-3.5" /> GENERATE DOSSIER
            </button>
          )}
          <div className="rounded-xl border border-amber-700/50 bg-amber-950/20 px-4 py-2 text-right">
            <div className="text-[8px] uppercase tracking-[0.16em] text-stone-500">Overall assessment</div>
            <div className="text-2xl font-black text-amber-300">{overall}<span className="text-[10px] text-stone-600">/100</span></div>
            {report?.classificationRating && <div className="text-[8px] text-amber-200 mt-0.5">{report.classificationRating}</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {metricCards.map(({ label, value, hint, icon: Icon, cls }) => (
          <div key={label} className="rounded-xl border border-white/8 bg-black/15 p-3">
            <div className={`flex items-center gap-2 text-[8px] uppercase font-bold ${cls}`}><Icon className="w-3.5 h-3.5" /> {label}</div>
            <div className={`text-2xl font-black mt-1.5 ${cls}`}>{value}<span className="text-[9px] text-stone-600">/100</span></div>
            <div className="text-[8px] text-stone-600 mt-1.5 leading-relaxed">{hint}</div>
          </div>
        ))}
      </div>

      {!report ? (
        <div className="mt-4 rounded-xl border border-dashed border-amber-700/40 bg-amber-950/10 p-5 text-center">
          <div className="text-[10px] text-amber-300 font-black">FINAL REPORT PENDING</div>
          <div className="text-[9px] text-stone-500 mt-1">The session is locked. Detailed chronology, decision analysis and film comparison will populate here when the debrief engine returns.</div>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          <article className="rounded-xl mi6-swap-panel-soft p-4">
            <div className="text-[9px] text-stone-500 uppercase font-bold flex items-center gap-2"><Lightbulb className="w-3.5 h-3.5 text-amber-400" /> M's Thoughts & Opinion</div>
            <div className="mt-2 text-[11px] leading-relaxed text-stone-200 font-sans italic whitespace-pre-line">"{mChoiceAssessment}"</div>
          </article>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <article className="rounded-xl mi6-swap-panel-soft p-4">
              <div className="text-[9px] text-stone-500 uppercase font-bold flex items-center gap-2"><ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> Executive Summary</div>
              <div className="mt-2 text-[11px] leading-relaxed text-stone-300 font-sans">{report.operationSummary}</div>
            </article>
            <article className="rounded-xl mi6-swap-panel-soft p-4">
              <div className="text-[9px] text-stone-500 uppercase font-bold flex items-center gap-2"><Target className="w-3.5 h-3.5 text-sky-400" /> Objective Results</div>
              <div className="mt-2 text-[11px] leading-relaxed text-stone-300 font-sans">{report.objectiveResults}</div>
            </article>
          </div>

          <article className="rounded-xl mi6-swap-panel-soft p-4">
            <div className="text-[9px] text-stone-500 uppercase font-bold flex items-center gap-2"><Route className="w-3.5 h-3.5 text-amber-400" /> Detailed Session Summary</div>
            <div className="mt-2 text-[11px] leading-relaxed text-stone-300 font-sans whitespace-pre-line">{report.detailedSessionSummary || report.operationSummary}</div>
          </article>

          <details className="rounded-xl mi6-swap-panel-soft p-4 group" open>
            <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
              <div className="text-[9px] text-stone-500 uppercase font-bold">Complete Operational Timeline</div>
              <div className="text-[8px] text-amber-400">{report.timeline?.length || 0} MILESTONES</div>
            </summary>
            <div className="mt-3 max-h-[34rem] overflow-y-auto pr-1 space-y-2">
              {(report.timeline || []).map((entry, idx) => (
                <div key={idx} className="border-l-2 border-amber-600/70 pl-3 py-1 text-[10px] leading-relaxed text-stone-300 font-sans">{entry}</div>
              ))}
            </div>
          </details>

          <article className="rounded-xl mi6-swap-panel-soft p-4">
            <div className="text-[9px] text-stone-500 uppercase font-bold flex items-center gap-2"><BrainCircuit className="w-3.5 h-3.5 text-violet-400" /> Decision Assessment</div>
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {(report.decisionAssessment?.length ? report.decisionAssessment : (report.keyDecisions || []).map((decision, idx) => ({ decision, assessment: "Recorded as a key decision in the final debrief.", consequence: "See complete operational timeline.", turn: idx + 1, score: undefined as number | undefined }))).map((item, idx) => (
                <div key={idx} className="rounded-lg border border-white/7 bg-black/15 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[8px] text-amber-400 font-black">{item.turn ? `TURN ${item.turn}` : `DECISION ${idx + 1}`}</div>
                    {typeof item.score === "number" && <div className="text-[9px] text-stone-400">{item.score}/100</div>}
                  </div>
                  <div className="text-[10px] text-stone-100 font-bold mt-1.5 font-sans">{item.decision}</div>
                  <div className="text-[9px] text-stone-300 mt-1.5 font-sans leading-relaxed">{item.assessment}</div>
                  {item.dimensions && (
                    <div className="grid grid-cols-5 gap-1 mt-2">
                      {[
                        ["OBJ", item.dimensions.objectiveValue],
                        ["INT", item.dimensions.intelligenceValue],
                        ["DISC", item.dimensions.discretion],
                        ["ASSET", item.dimensions.assetProtection],
                        ["PROP", item.dimensions.proportionality],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="rounded border border-white/6 bg-black/20 px-1.5 py-1 text-center">
                          <div className="text-[6px] text-stone-600 font-black">{label}</div>
                          <div className="text-[8px] text-stone-300 font-black">{typeof value === "number" ? value : "—"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!!item.strengths?.length && <div className="mt-2 text-[8px] text-emerald-300 font-sans">STRENGTHS // {item.strengths.join(" • ")}</div>}
                  {!!item.concerns?.length && <div className="mt-1 text-[8px] text-rose-300 font-sans">CONCERNS // {item.concerns.join(" • ")}</div>}
                  <div className="text-[9px] text-stone-600 mt-2 font-sans">CONSEQUENCE: {item.consequence}</div>
                </div>
              ))}
            </div>
          </article>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <article className="rounded-xl mi6-swap-panel-soft p-4">
              <div className="text-[9px] text-emerald-300 uppercase font-bold flex items-center gap-2"><Award className="w-3.5 h-3.5" /> Best Decisions</div>
              <div className="mt-3 space-y-2">{decisionExtremes.best.length ? decisionExtremes.best.map((d, i) => <div key={i} className="rounded-lg border border-emerald-900/30 bg-emerald-950/10 p-2.5"><div className="flex justify-between gap-2 text-[8px] font-black"><span className="text-stone-500">TURN {d.turn ?? "?"}</span><span className="text-emerald-300">{d.score}/100</span></div><div className="text-[9px] text-stone-200 mt-1 font-sans">{d.decision}</div></div>) : <div className="text-[9px] text-stone-600">No scored decisions available.</div>}</div>
            </article>
            <article className="rounded-xl mi6-swap-panel-soft p-4">
              <div className="text-[9px] text-rose-300 uppercase font-bold flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5" /> Worst Decisions</div>
              <div className="mt-3 space-y-2">{decisionExtremes.worst.length ? decisionExtremes.worst.map((d, i) => <div key={i} className="rounded-lg border border-rose-900/30 bg-rose-950/10 p-2.5"><div className="flex justify-between gap-2 text-[8px] font-black"><span className="text-stone-500">TURN {d.turn ?? "?"}</span><span className="text-rose-300">{d.score}/100</span></div><div className="text-[9px] text-stone-200 mt-1 font-sans">{d.decision}</div></div>) : <div className="text-[9px] text-stone-600">No scored decisions available.</div>}</div>
            </article>
          </div>

          <article className="rounded-xl mi6-swap-panel-soft p-4">
            <div className="text-[9px] text-sky-300 uppercase font-bold flex items-center gap-2"><BrainCircuit className="w-3.5 h-3.5" /> Operation DNA</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">{operationDNA.map(([label, value]) => <div key={label} className="rounded-lg border border-white/6 bg-black/20 p-2.5"><div className="flex items-center justify-between gap-2"><span className="text-[8px] text-stone-500 uppercase font-black">{label}</span><span className="text-[9px] text-sky-300 font-black">{value}%</span></div><div className="h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden"><div className="h-full bg-sky-500/70" style={{width:`${value}%`}} /></div></div>)}</div>
          </article>

          <article className="rounded-xl border border-emerald-800/35 bg-emerald-950/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[9px] text-emerald-300 uppercase font-bold flex items-center gap-2"><GitCompareArrows className="w-4 h-4" /> Your Run vs Original Film</div>
              <div className="rounded-lg border border-emerald-800/50 bg-black/20 px-3 py-1.5">
                <div className="text-[7px] text-stone-600 uppercase">Better world outcome</div>
                <div className="text-[10px] font-black text-emerald-300">{betterOutcomeLabel}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
              <div className="rounded-lg bg-black/15 border border-white/6 p-3"><div className="text-[8px] uppercase text-sky-300 font-black">Simulated branch</div><div className="text-[10px] text-stone-300 mt-1.5 leading-relaxed font-sans">{comparison?.simulatedOutcome || report.operationSummary}</div></div>
              <div className="rounded-lg bg-black/15 border border-white/6 p-3"><div className="text-[8px] uppercase text-amber-300 font-black">Original film</div><div className="text-[10px] text-stone-300 mt-1.5 leading-relaxed font-sans">{comparison?.originalOutcome || report.filmComparison}</div></div>
            </div>
            {comparison?.rows?.length ? (
              <div className="overflow-x-auto mt-3">
                <table className="w-full min-w-[720px] text-left border-collapse">
                  <thead><tr className="text-[8px] uppercase text-stone-600 border-b border-white/8"><th className="py-2 pr-3">Category</th><th className="py-2 pr-3">Your Run</th><th className="py-2 pr-3">Original Film</th><th className="py-2">Edge</th></tr></thead>
                  <tbody>
                    {comparison.rows.map((row, idx) => (
                      <tr key={idx} className="border-b border-white/5 align-top">
                        <td className="py-2.5 pr-3 text-[9px] font-black text-stone-200">{row.category}</td>
                        <td className="py-2.5 pr-3 text-[9px] text-stone-400 font-sans">{row.simulatedVersion}</td>
                        <td className="py-2.5 pr-3 text-[9px] text-stone-400 font-sans">{row.originalFilm}</td>
                        <td className={`py-2.5 text-[8px] font-black ${row.advantage === "SIMULATION" ? "text-emerald-300" : row.advantage === "ORIGINAL" ? "text-amber-300" : "text-stone-500"}`}>{row.advantage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div className="mt-3 rounded-lg border border-white/6 bg-black/15 p-3">
              <div className="text-[8px] uppercase text-stone-600 font-bold">Outcome rationale</div>
              <div className="text-[10px] leading-relaxed text-stone-300 mt-1.5 font-sans">{comparison?.rationale || report.filmComparison}</div>
            </div>
          </article>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="rounded-xl mi6-swap-panel-soft p-4">
              <div className="text-[11px] text-stone-200 uppercase font-black tracking-widest border-b border-white/10 pb-2 mb-2">Intelligence Recovered</div>
              <div className="mt-2 space-y-1.5">{(report.intelligenceRecovered || []).map((x, i) => <div key={i} className="text-[9px] text-stone-300 font-sans">• {x}</div>)}</div>
            </div>
            <div className="rounded-xl mi6-swap-panel-soft p-4">
              <div className="text-[11px] text-stone-200 uppercase font-black tracking-widest border-b border-white/10 pb-2 mb-2">Assets / Equipment</div>
              <div className="mt-2 text-[9px] text-stone-300 font-sans">{report.assetsStatus}</div>
              <div className="mt-2 text-[9px] text-stone-500 font-sans">{report.equipmentPerformance}</div>
            </div>
            <div className="rounded-xl mi6-swap-panel-soft p-4">
              <div className="text-[11px] text-stone-200 uppercase font-black tracking-widest border-b border-white/10 pb-2 mb-2 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Follow-up</div>
              <div className="mt-2 text-[9px] text-stone-300 font-sans">{report.recommendedFollowUp || report.unresolvedThreats || "Archive review only."}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-xl mi6-swap-panel-soft p-4">
              <div className="text-[11px] text-stone-200 uppercase font-black tracking-widest border-b border-white/10 pb-2 mb-2">M's Choice & Personality Assessment</div>
              <div className="mt-2 text-[11px] leading-relaxed text-stone-300 font-sans whitespace-pre-line">{mChoiceAssessment}</div>
              <div className="mt-3 pt-3 border-t border-white/8 text-[9px] leading-relaxed text-stone-500 font-sans">{report.agentPerformance}</div>
            </div>
            <div className="rounded-xl mi6-swap-panel-soft p-4">
              <div className="text-[11px] text-stone-200 uppercase font-black tracking-widest border-b border-white/10 pb-2 mb-2">Psychological Evaluation</div>
              <div className="mt-2 text-[11px] leading-relaxed text-stone-300 font-sans italic">"{report.psychologicalEvaluation}"</div>
            </div>
          </div>
          
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[9px] text-amber-400 uppercase font-mono font-black tracking-[0.18em]">Bond Persona // AI Choice Analysis</div>
                <div className="mt-1 text-xl text-stone-100 font-black flex items-center gap-2"><Film className="w-4 h-4 text-amber-400" /> {bondPersona.actor}</div>
              </div>
              <div className={`rounded-lg border px-3 py-2 text-right ${bondPersona.verdict === "AGREES" ? "border-emerald-500/30 bg-emerald-500/10" : bondPersona.verdict === "DISAGREES" ? "border-rose-500/30 bg-rose-500/10" : "border-white/10 bg-white/[0.03]"}`}>
                <div className="text-[7px] uppercase tracking-[0.16em] text-stone-500 font-mono">AI verdict on your pick</div>
                <div className={`mt-0.5 text-[11px] font-black ${bondPersona.verdict === "AGREES" ? "text-emerald-300" : bondPersona.verdict === "DISAGREES" ? "text-rose-300" : "text-stone-300"}`}>{bondPersona.verdict || "UNRESOLVED"}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <div className="rounded-lg border border-white/7 bg-black/20 p-3">
                <div className="text-[7px] uppercase tracking-[0.14em] text-stone-600 font-mono">Your preferred Bond</div>
                <div className="mt-1 text-[11px] font-black text-violet-200">{bondPersona.preferredActor || state.preferredBondActor || "Not recorded"}</div>
              </div>
              <div className="rounded-lg border border-white/7 bg-black/20 p-3">
                <div className="text-[7px] uppercase tracking-[0.14em] text-stone-600 font-mono">AI behavioral match</div>
                <div className="mt-1 text-[11px] font-black text-amber-200">{bondPersona.actor}</div>
              </div>
            </div>
            <div className="mt-3 text-[11px] leading-relaxed text-stone-300 font-sans">{bondPersona.rationale}</div>
            {bondPersona.verdictRationale && <div className="mt-2 rounded-lg border border-white/6 bg-black/15 px-3 py-2 text-[10px] leading-relaxed text-stone-400 font-sans">{bondPersona.verdictRationale}</div>}
            <div className="mt-2 text-[8px] text-stone-600 font-mono">THE AI MATCH IS DERIVED FROM RECORDED MISSION CHOICES. YOUR PRE-DEPLOYMENT BOND IS TREATED AS A PREFERENCE / PREDICTION, NOT AS THE ANSWER.</div>
          </div>

          <div className="rounded-xl mi6-swap-panel-soft p-4">
              <div className="text-[11px] text-stone-200 uppercase font-black tracking-widest border-b border-white/10 pb-2 mb-2 flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Political Review</div>
              <div className="mt-2 text-[10px] leading-relaxed text-stone-300 font-sans">{report.politicalConsequences}</div>
          </div>
        </div>
      )}
    </section>
  );
};
