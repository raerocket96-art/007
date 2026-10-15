# Mission Simulator Dashboard Rework

This revision addresses the usability problems reported in the live Mission Simulator.

## Fixed interaction issues
- Bond incarnation / doctrine selector is now permanently visible in the simulator command bar.
- Bond selection remains available during active missions and updates the doctrine used on the next simulation turn.
- Operation selector is permanently available. Changing operation during an active mission asks for confirmation before resetting the live state; existing autosaves/manual saves remain available.

## Actor Swap integration verification
The integration is functional, not cosmetic:
- `MissionSimulator.tsx` sends `agentDoctrine` with simulation and debrief requests.
- `server.ts` includes the selected doctrine in Gemini mission context.
- Procedural fallback calculates doctrine advantages from charm, manipulation/deception, patience, professionalism, risk tolerance, ruthlessness, and tactical intelligence.

## Dashboard/UI changes
- Rebuilt simulator shell around a warmer dark SIS operations-room palette.
- Removed the bright paper-like live gameplay surface.
- Darkened narrative, objective, telemetry and decision cards.
- Moved operation and Bond incarnation controls into a persistent command dashboard.
- Reduced visual duplication in the pre-deployment sidebar.
- Compact Q-Branch package summary replaces the large equipment list in pre-mission setup.
- Compact Field Package replaces the oversized live inventory list.

## Removed from live decision board
- Removed `DEPLOY CUSTOMIZED Q-BRANCH ORDNANCE` quick-deploy grid.
- Q-Branch configuration still influences mission starting metrics and is passed to the AI as context, but it no longer consumes a large section of the choice UI.

## Validation
TypeScript parsing reaches dependency resolution successfully. The local container does not include project npm dependencies and dependency installation was unavailable during validation, so a full Vite production build could not be completed here.
