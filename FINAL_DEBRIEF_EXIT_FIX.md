# Final Debrief + Exit Session Repair

## Fixed interaction
- Replaced the browser `window.confirm()` dependency with an in-app MI6 session-closure dialog.
- `EXIT & FINISH SESSION` now always gives visible feedback when it can be used.
- While a live turn is still executing, the control visibly changes to `TURN EXECUTING` instead of silently ignoring clicks.
- Confirming session closure locks field play immediately and opens the full debrief interface while the report is generated.
- A failed/slow report can be rebuilt without replaying or changing the locked mission state.

## New final report
The final debrief now includes:
- Full-session executive summary
- Primary/objective outcome review
- Chronological session timeline
- Decision-by-decision review with a 0-100 assessment per meaningful choice
- Overall MI6 mission-quality score
- Tactical, discretion, intelligence, political-risk, civilian-protection and objective-achievement scores
- Intelligence, asset, equipment, ethical and political review
- Detailed user-timeline vs original-film comparison
- Selected/simulated Bond vs original film Bond
- A world-outcome matrix covering threat neutralization, lives/assets, intelligence, institutional damage and geopolitical risk
- An explicit finding: `PLAYER TIMELINE`, `ORIGINAL FILM`, or `MIXED / INCONCLUSIVE`

## Reliability
- Debrief generation has its own server timeout and returns a persistent-state procedural assessment if Gemini is unavailable or too slow.
- Gemini receives the complete recorded timeline and final persistent scene state, rather than only the final turn.
- AI output is normalized before being sent to the UI, so missing/malformed fields cannot break the debrief panel.
- Final generated reports are cached in localStorage for the active finished session.
- Manual save slots can now include the final debrief report, so archived finished sessions retain their assessment.
