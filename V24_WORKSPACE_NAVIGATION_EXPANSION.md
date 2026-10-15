# V24 Operational Workspace Expansion

Expanded the redesigned sidebar into five collapsible workspace groups without removing the existing MI6 modules.

## New navigation
- 00 Section: Command Centre, Mission Simulator, Mission Archive, Debrief Centre, Run Comparison
- Intelligence: Dossier Archive, Intel Network
- 007 Operations: Bond Movies, Bond Persona, Q-Branch, Branch History
- Analysis: Decision Analysis, Operational DNA
- System: Workspace Settings, Archive Admin

## New functional workspace pages
- Mission Archive reads the completed-run archive and manual save vault from localStorage.
- Run Comparison compares two archived branches side-by-side.
- Q-Branch surfaces the current persistent custom field kit and links editing back to mission deployment.
- Debrief Centre, Decision Analysis and Operational DNA act as clean analysis desks tied to the latest archived run and Final Debrief.
- Branch History groups repeated film simulations as alternate timelines.
- Workspace Settings provides focused links into mission settings, Save Vault and Archive Admin.

The new pages inherit Mission Simulator permissions, so existing operative profiles do not need their allowedTabs arrays rewritten.
