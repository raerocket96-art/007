# MI6 Mission Simulator — Persistent Scene-State Repair

This build replaces the old film-metadata/fixed-delta simulation fallback with a persistent scene-state engine.

## Core change

Film locations and film-level objectives are now background context only. Active turns persist a dedicated `sceneState` containing:

- currentLocation
- immediateObjective
- completedActions
- activeConsequences
- nearbyThreats
- discoveredIntel
- uncertainIntel
- operativeCondition
- environmentState
- alertState

Completed successful actions are preserved between turns. Both Gemini output and the procedural fallback pass through the same state contract.

## Stat rules

Missing stat deltas are zero. A non-zero Gemini stat delta is rejected unless it includes its own short causal explanation. Health, cover, vigilance, suspicion, intelligence confidence and political exposure therefore do not drift merely because another turn occurred.

## Validation

The response normalizer rejects or replaces:

- a full film location list used as the current scene location
- the film-level objective used as the immediate scene objective
- unexplained stat deltas
- unsupported alert escalation
- generic/empty decision lists
- loss of previously completed actions

## Fallback continuity

The server and client use the same continuity-preserving procedural fallback. The Chimera two-turn regression test verifies:

1. offshore/submerged approach, boarding and guard neutralization
2. entry into the Chimera service corridor and Omega scan
3. health and cover remain unchanged without injury/detection
4. earlier completed actions remain immutable
5. scene-specific choices refer to the corridor, cameras, locks and shipboard communications
6. the Skyfall multi-city location list and film-level objective do not leak into the active scene

## Selection flow

Changing Bond or operation resets the active run to pre-deployment READY state. Changing operation also reloads the operation's agent, equipment, vehicle and briefing data before simulation starts.
