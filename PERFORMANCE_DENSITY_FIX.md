# Mission Simulator Performance + Density Fix

## What changed

- Live turns now use `gemini-3.1-flash-lite` by default, configurable through `SIMULATION_MODEL`.
- Gemini live-turn generation has a 12 second server-side latency budget (`SIMULATION_TIMEOUT_MS`). If the model misses that budget, the persistent procedural scene engine returns a continuity-safe turn instead of leaving the UI waiting for 30+ seconds.
- Simulation retries are limited inside the live-turn budget rather than compounding long waits.
- The browser also aborts a stalled live-turn request after 14 seconds and applies the local continuity-preserving fallback.
- Per-turn request payloads are reduced to current scene state, mission telemetry, relevant loadout, doctrine, and only the last three history entries.
- While a turn is running, the previous scene remains visible and an immediate `SIMULATION CORE // EXECUTING DIRECTIVE` status appears with elapsed seconds.
- The UI shows whether the completed turn used the AI core or fast fallback.

## Dashboard density

- Decision options become a 2x2 grid on large screens.
- Situation Shift cards are substantially more compact and limited to the four most important changed metrics.
- Live telemetry is condensed into a compact 2-column status grid.
- Intel Picture is collapsed by default and expands on demand.
- Bond Profile is collapsed into a small active-doctrine strip and expands on demand.
- Operational History is collapsed by default with only the latest action visible in the summary.
- The primary flow remains Current Situation -> Immediate Objective -> Situation Shift -> Decision Board.

## Validation

All TypeScript/TSX source files were syntax-checked with the TypeScript compiler parser. A full Vite production build could not be run in the repair container because project npm dependencies were not available locally.
