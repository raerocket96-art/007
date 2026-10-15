# Bond Preference + AI Verdict Update

- Mission selection now labels Step 02 as **Preferred Bond** and explains that the selection is a pre-deployment preference/prediction.
- The selected Bond name is stored on the active mission as `preferredBondActor`, so it survives saves and final debrief generation.
- Final debrief `bondComparison` now supports `preferredActor`, `verdict` (`AGREES` / `DISAGREES`) and `verdictRationale`.
- Gemini is explicitly instructed to judge the behavioral match independently from the preferred Bond, then state whether it agrees with the player's preference.
- The procedural fallback performs the same preference-vs-behavior comparison.
- The debrief UI shows **Your Preferred Bond**, **AI Behavioral Match**, and a clear **AI Verdict on Your Pick**.
