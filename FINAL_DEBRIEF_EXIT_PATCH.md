# Final Debrief + Exit Session Patch

## Fixed: EXIT & FINISH SESSION did nothing
- Removed the browser `window.confirm()` dependency from the finish flow.
- `EXIT & FINISH SESSION` now opens an in-app MI6 confirmation overlay.
- Confirming immediately locks the current run with `sessionFinished: true`.
- A full-screen DEBRIEF / FINAL MI6 ASSESSMENT opens immediately.
- The report remains reopenable with `OPEN FINAL ASSESSMENT` after session closure.
- Save data is preserved; finishing the session does not delete the run.

## Full-session debrief
- The server now receives and reads the COMPLETE mission timeline instead of only the final 8 entries.
- The causal tree, final scene state, telemetry, objective status and unresolved consequences are included.
- Final scoring is explicitly separated from cinematic intensity.

## Expanded Final MI6 Assessment
- Executive summary
- Detailed complete-session narrative
- Full operational timeline
- Decision-by-decision assessment
- Operational Effectiveness
- Strategic Dominance
- Intelligence Exploitation
- Asset Protection
- Agent Survival
- Mission Discipline
- Resourcefulness
- Cinematic Intensity
- Overall Assessment
- M's professional assessment
- Ethical / political review
- Intelligence recovered
- Asset / equipment review
- Follow-up / unresolved threats

## Your Run vs Original Film
- The current film's canonical operation archive is supplied to the debrief engine when available.
- Comparison rows cover concrete outcomes instead of artistic preference.
- World outcome verdict is one of: SIMULATION / ORIGINAL / MIXED / UNRESOLVED.
- Comparison is grounded in recorded session facts and canonical archive facts, with no invented casualties or outcomes.

## Fallback behavior
- If Gemini debrief generation is unavailable, the procedural debrief now still uses the complete run and canonical baseline.
- It produces a full timeline, key decision assessments, expanded scores and a grounded outcome comparison where enough data exists.
