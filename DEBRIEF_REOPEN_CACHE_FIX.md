# Final Debrief Reopen / Reload Fix

## Fixed

- `OPEN FINAL DEBRIEF` remains available after a session has been closed.
- A persistent bottom-right `OPEN FINAL DEBRIEF` launcher is shown for closed sessions.
- If the full report is missing, `GENERATE / RETRY FULL DEBRIEF` is shown in the toolbar, concluded-session card, and persistent launcher.
- Completed debrief reports are cached per mission ID in localStorage.
- Reloading / recompiling the app restores the cached detailed report instead of returning to `FINAL REPORT PENDING`.
- Old closed sessions that have no cached report can regenerate the report without reopening the mission or losing the archived timeline.
- Turn execution / simulation request flow was not changed by this patch, preserving the improved ~7–10 second choice response behavior.

## Cache key

`mi6_final_debrief_v1:<missionId>`

The cache contains the structured final report, short summary, and cache timestamp.
