# MI6 Upgrade Pass — Archive Admin + Mission Simulator

## Archive Administration
- Repaired `/api/generate-intel` frontend/backend contract.
- Synthesize Dossier now returns a complete structured archive record instead of orphaned text.
- Supports Operations, Personnel, and Equipment dossier generation.
- Added Gemini JSON generation plus a category-aware local fallback compiler.
- Added visible synthesis status and engine feedback before committing a dossier.
- Generated dossiers can be committed into the correct registry and persist through the archive store.

## Mission Simulator
- Simulator now sends complete mission context to `/api/simulate`: selected operation, agent, vehicle, Q-Branch loadout, current scene, history, action, mission state, scene number and max scenes.
- Procedural fallback engine was rebuilt to remain specific to the selected operation instead of falling into generic repeated scenes.
- Eight fallback stages: insertion, surveillance/contact, access/deception, counter-intelligence pressure, escalation, decisive action, exfiltration, extraction.
- Action style (stealth/diplomatic/tactical/aggressive) now has different consequences for health, cover, suspicion, collateral and political exposure.
- Added persistent extended state tracking: mission progress, cover, suspicion, alert state, intelligence confidence, evidence, collateral damage, political exposure, time pressure, escape readiness, objective status and delayed consequences.
- Scene intelligence now tracks confirmed intel, uncertain intel, threats and available assets.
- Causal tree is updated every turn and displayed in the active cockpit.
- Added manual save vault with up to six local save states, load and delete controls.
- Q-Branch loadout metrics now influence initial mission cover/risk.
- Debrief API now receives operation, agent and full mission history.
- Structured debrief report displays agent performance, political consequences and tactical/discretion/intelligence/exposure ratings.
- Added mission progress telemetry and a Save State control inside the active mission header.
- Added missing React type dependencies to package.json for better TypeScript validation.

## Reliability
- Fixed malformed duplicate brace in the procedural server fallback section.
- Normalized Gemini response typing in server integration.
- Static TypeScript parsing of the modified files passes aside from unavailable external packages in the sandbox.
