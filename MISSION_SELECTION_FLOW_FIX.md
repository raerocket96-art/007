# Mission Selection Flow Fix

This build changes Mission Simulator pre-deployment from loose dropdown settings into a synchronized three-stage launch flow inspired by Actor Swap Simulator:

1. SELECT 007
2. SELECT OPERATION
3. REVIEW LIVE BRIEFING

## Synchronization behavior

Changing an operation now reloads the complete mission-file configuration immediately:
- operation title and codename
- location / theatre
- threat level
- objective
- opening situation
- default assigned agent
- recommended equipment IDs
- recommended vehicle
- starting decisions
- live briefing data

Changing the Bond incarnation immediately refreshes the doctrine briefing and recommended opening actions for the selected mission.

The live briefing is keyed to both `selectedDoctrineId` and `selectedTemplateId`, so it remounts whenever either selection changes.

During an already active mission, changing the operation still requires confirmation because it closes that live run. Existing saves remain available.
