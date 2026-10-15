# Swap-exact selection behavior

Mission Simulator selection now mirrors the Actor Swap app:

- Changing 007 immediately resets any active run to PRE-DEPLOYMENT.
- Changing Operation File immediately resets any active run to PRE-DEPLOYMENT.
- No confirmation dialog blocks the selection.
- The persisted active mission is cleared synchronously so stale state cannot rehydrate.
- Operation selection immediately rebuilds title, location, objective, briefing, threat, default agent, equipment, vehicle and pre-deployment intel.
- 007 selection immediately reloads the doctrine briefing for the selected incarnation.
- The next Start Simulation always starts from the currently visible 007 + Operation combination.

This intentionally matches the donor Actor Swap pattern: select actor / select film -> reset simulation -> live preview updates -> Start Simulation.
