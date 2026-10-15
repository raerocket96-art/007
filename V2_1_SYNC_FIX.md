# MI6 Simulator Command Dashboard V2.1 — Operation / Bond Synchronization Fix

This patch fixes the configuration synchronization problem in V2.

## Operation switching
- Selecting another operation now resets the live mission cleanly after confirmation.
- Objective, threat picture, recommended agent/equipment/vehicle and pre-deployment intelligence are refreshed for the newly selected operation.
- Debrief and situation-shift data from the closed live run are cleared from the active dashboard.
- Autosaves/manual saves remain available.
- A visible `STATE SYNCHRONIZED` notice confirms the change.

## Bond incarnation / doctrine switching
- Selecting Connery, Lazenby, Moore, Dalton, Brosnan or Craig updates the active mission's `doctrineId` immediately.
- A mission-log event records the doctrine reprofile without rewriting historical turns.
- All subsequent Gemini turns receive the new doctrine profile.
- The local fallback engine now also applies doctrine-specific skill modifiers when Gemini is unavailable.
- A visible status notice confirms that the next action uses the new Bond doctrine.

## Historical-state rule
Changing Bond during a live mission does not rewrite text or consequences that already happened under the previous profile. That would corrupt mission history. Instead, the new incarnation becomes active immediately for all future decisions and consequences.
