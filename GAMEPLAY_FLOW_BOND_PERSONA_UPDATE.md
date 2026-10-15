# Gameplay Flow + Bond Persona Update

This build adds the requested film-first game flow and debrief behavior.

## Command Centre
- Adds a prominent Film Operation Selector before the rest of the dashboard.
- Lets the player choose from the complete EON film archive plus the two legacy / non-EON scenarios already included in the project.
- Shows the selected film's mission brief and original-film starting situation before launch.
- Launching from Command Centre opens the selected film operation directly.

## Mission Selection / Pre-deployment
- Reorders the simulator flow to: 01 Select Film, 02 Select 007, 03 Mission Brief + Insertion.
- The briefing explicitly separates the primary mission brief from the original-film insertion / starting situation.
- Starting the mission uses that film starting situation as the first current situation.

## Terminate Operation
- Adds a visible TERMINATE OPERATION button to the active Mission Simulator toolbar.
- Also adds it to Mission Menu / Tools.
- Confirmation clears the active autosaved session state and returns to Mission Selection.
- Manual save slots remain intact.

## Debrief / Bond Persona
- AI debrief schema now explicitly requests `bondComparison` and `psychologicalEvaluation`.
- Bond Persona must be based on recorded player choices, not the pre-selected actor.
- Comparison covers all six EON Bond actors: Sean Connery, George Lazenby, Roger Moore, Timothy Dalton, Pierce Brosnan, Daniel Craig.
- Procedural fallback now also compares against all six.
- Debrief UI includes a client-side choice-analysis fallback so Bond Persona still appears even if an older/cached AI report omitted it.

## M's Assessment
- M's feedback is instructed to reference concrete early/middle/late choices from the run.
- Procedural M feedback now analyzes stealth, diplomacy, gadget use, direct force, loyalty/protection and improvisation patterns.
- UI shows M's Choice & Personality Assessment separately from the numerical professional score.
