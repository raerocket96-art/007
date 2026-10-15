# V27 // Phase 1–3 Gameplay Systems Pass

This build implements the three requested development phases on top of the uploaded V27 source.

## Phase 1 — Core integration

### Full Q-Branch configuration reaches the simulation engine
`MissionSimulator.tsx` now sends structured equipment data instead of only item names. The simulation receives selected attachments, tactical unlocks, live status and remaining uses.

### Film / Bond doctrine independence verified
The current V27 selection handlers already keep film selection and Bond doctrine selection independent. The operation selector does not rewrite the doctrine, and the doctrine selector does not reset the film. No destructive rewrite was applied here.

### Tactical Command Drawer
Added `src/components/TacticalCommandDrawer.tsx` with:
- Telemetry
- Q-Branch Bag
- Causal Timeline access
- Canonical Delta access
- Field Asset / HUMINT calls
- 00 Career / prototype requisitions

The existing full telemetry, causal tree and canonical comparison systems remain intact and are opened from this consolidated cockpit drawer.

## Phase 2 — Gameplay depth

### Active Risk Resolution
Added `src/utils/riskResolution.ts`.

The existing Success Probability Engine now feeds an actual deterministic action-resolution check. Results include:
- CRITICAL_SUCCESS
- SUCCESS
- PARTIAL_SUCCESS
- TACTICAL_SETBACK
- CATASTROPHIC_EXPOSURE

Risk checks are seeded by mission ID, turn and directive so reload/replay behavior is stable instead of relying on arbitrary Math.random results.

The resolved outcome is sent to Gemini and is also mechanically applied to the turn state, so a 15% situation no longer behaves exactly like a 95% situation.

### Q-Gadget use and equipment wear
Added runtime equipment state:
- READY
- DEPLOYED
- EXHAUSTED
- DAMAGED
- LOST

Single-use / limited-use gadgets can be consumed. Repeated firearm/suppressor and watch-laser use can create wear. Runtime status persists because it lives in MissionState and therefore follows autosaves and manual saves.

### Vehicle tactics
Procedural choices can now include a vehicle tactic when the current physical scene is compatible with vehicle access. The Gemini prompt is also instructed to offer vehicle choices only when physically plausible.

### HUMINT / Field Asset calling
The Tactical Command Drawer exposes active SIS/allied personnel as callable field assets. Calls:
- create persistent mission state
- add time pressure / small exposure cost
- insert a scene-relevant support directive
- are passed into Gemini context

Support is explicitly treated as a request rather than a magical guaranteed solution.

## Phase 3 — Deeper simulation / meta-game

### Adversary counter-strategy profiles
Added `src/data/adversaryProfiles.ts`.

Dedicated profiles currently cover key operations including:
- Goldfinger
- OHMSS / Blofeld
- GoldenEye / Trevelyan
- Casino Royale / Le Chiffre
- Skyfall / Silva
- Die Another Day / Graves
- Octopussy / Khan + Orlov
- The Spy Who Loved Me / Stromberg

All other missions use a safe generic adaptive profile.

Gemini receives counter-strategy, vulnerabilities and escalation behavior. The local procedural fallback can also inject an adversary-specific counterplay choice.

### Persistent 00 career
Added `src/utils/careerProgression.ts` using `mi6_career_profile_v1`.

Completed debriefs can award Requisition Points based on assessment score and political exposure. Career rank advances with unique completed operations.

Current rank ladder:
- Field Operative
- 00 Field Operative
- Senior 00 Operative
- Chief Field Operative

### Q-Branch prototype unlocks
Requisition Points can unlock:
- EMP Cufflink Mk II
- Micro-Rocket Cigarette
- Adaptive Cover ID

Unlocked prototypes enter live mission inventory as one-use prototype items and can be deployed from the tactical drawer.

### Campaign groundwork
Career state now tracks unique completed operations and rewarded run IDs, creating a stable persistent foundation for future multi-mission campaign progression without changing the existing standalone film-simulation model.

## Backward compatibility
All new MissionState fields are optional. Legacy saves without runtime inventory, risk resolution, field asset calls or vehicle runtime state fall back to safe defaults.

Existing localStorage save keys are preserved. New career data uses a separate key.

## Validation
A TypeScript parse/type pass was run. The environment does not contain the project's npm dependencies, so the complete build cannot run here. After excluding expected missing-package errors (`react`, `express`, `lucide-react`, Node typings, etc.), the modified/new files produced no additional TypeScript errors.
