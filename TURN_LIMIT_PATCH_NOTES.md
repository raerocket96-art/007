# Open-Ended Mission Session Patch

## Changed
- Removed automatic `nextTurn >= maxTurns => VICTORY` behavior.
- Mission sessions now continue beyond Turn 10 indefinitely until the operator explicitly finishes the session.
- Removed `/10` from live turn displays and autosave status messages.
- Turn 10+ is displayed as `OPEN OPS` / `Open Operations`, not `Debrief`.
- AI simulation prompt now treats sessions as open-ended and receives no automatic final-turn framing.
- Mission progress is no longer calculated from `turn / maxTurns`; it advances from concrete state changes and caps at 99 during live play.
- Added `EXIT & FINISH SESSION` control.
- `Final MI6 Assessment` and `Professional performance separated from cinematic intensity` appear only after explicit session finish.
- Debrief generation is told not to infer victory simply because the user finished the session.

## Save compatibility
Legacy saves from the old hard limit are migrated on load when they match:
- `maxTurns === 10`
- `currentTurn >= 10`
- `outcome === VICTORY`
- no explicit `sessionFinished` flag

Those saves reopen as `IN_PROGRESS` at the same turn and preserve scene state, history, telemetry, causal tree, doctrine and equipment state. A legacy 100% progress value is reduced to 95% so live play can continue naturally.

## Validation
- Modified TypeScript/TSX files parse successfully with the TypeScript compiler API.
- Synthetic legacy Turn 10 save test successfully migrated and advanced to Turn 11 with `IN_PROGRESS` retained.
- Full Vite build could not be executed in the patch environment because the uploaded ZIP did not contain `node_modules` and dependency installation was unavailable in the environment.
