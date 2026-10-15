# Final Debrief Engine V2

This patch upgrades the mission debrief from a mostly generic score dump into a more forensic MI6 after-action review.

## Changes

- Decision assessments now use differentiated scoring instead of repeatedly returning the same generic sentence.
- Important decisions can expose five sub-scores: objective value, intelligence value, discretion, asset protection and proportionality.
- Decision cards now show strengths, concerns and the concrete downstream consequence.
- Ethical review is split into civilian/collateral harm, hostile-force use, detainee treatment, source protection and proportionality.
- A zero-collateral state no longer hides coercive or harmful detainee treatment elsewhere in the run.
- Later medical aid and humane treatment are recorded as mitigating conduct without erasing earlier conduct concerns.
- Mission classification no longer treats 95-99% progress as automatically complete when the primary objective is still unresolved.
- The Spy Who Loved Me now has a dedicated canonical film baseline for debrief comparison.
- Canonical comparison includes microfilm intelligence, low-level source survival, network exploitation, strategic-threat resolution, friendly survival and collateral/infrastructure effects.
- MissionSimulator falls back to the film debrief baseline when no matching archive operation record exists.
- Procedural debriefs now include canonical benchmark values expected by the legacy radar/debrief UI.
- Gemini debrief instructions were strengthened to demand specific decision rationales and a full conduct review.

## Validation

The modified TypeScript/TSX files were syntax-transpiled successfully with TypeScript 5.8.3. A complete dependency build was not run because the supplied archive did not include node_modules/package-lock and dependency installation did not complete in the sandbox.
