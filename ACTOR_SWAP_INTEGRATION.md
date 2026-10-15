# MI6 + Actor Swap Integration

This build integrates the strongest reusable systems from the James Bond Actor Swap Simulator into the MI6 Classified Intelligence Database & Mission Simulator.

## Integrated systems

### 1. 007 Operative Doctrine
- Sean Connery
- George Lazenby
- Roger Moore
- Timothy Dalton
- Pierce Brosnan
- Daniel Craig

Doctrine affects the context sent to Gemini and the procedural fallback engine.
It influences tactical, stealth, diplomatic and aggressive resolution without overriding explicit player choices.

### 2. Situation Shift
After each turn the UI now shows concrete before/after changes for:
- health
- cover integrity
- hostile vigilance
- suspicion
- intelligence confidence
- political exposure
- extraction readiness

### 3. Ten-stage mission structure
1. Insertion
2. Recon
3. Access
4. Investigation
5. Counter-Intelligence
6. Escalation
7. Crisis
8. Decisive Action
9. Extraction
10. Debrief

### 4. Expanded Causal Tree
- full-screen causal analysis modal
- decision layers
- parent relationships
- delayed consequence display
- active branch highlighting
- branch history can survive save/load branching during the session

### 5. Mission Save Manager
- named manual save slots
- load
- delete
- JSON export
- JSON import
- up to 12 local save branches
- integrates with existing autosave state

### 6. Original Movie Comparison
For supported Bond-film operations, the simulator can compare the current branch to the original film archive baseline:
- original actor
- initial objective
- opening scene
- villains
- allies
- gadgets
- locations
- recorded player branch
- estimated timeline divergence

Legacy/non-EON scenarios remain playable even if a detailed canonical comparison record is not available.

### 7. Professional debrief doctrine
The enhanced debrief separates:
- Operational Effectiveness
- Strategic Dominance
- Cinematic Intensity

Low action does not reduce professional mission quality. A clean, quiet operation can score highly while cinematic intensity remains low.

## Validation
All TypeScript and TSX files pass syntax transpilation checks.
A semantic TypeScript scan found no project-internal errors after filtering only unavailable dependency/module errors in the isolated container environment.
