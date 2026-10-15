# V28 Theme Engine & Visual Pass

Implemented a persistent semantic theme engine and visual cleanup pass without removing the existing MI6 black/gold identity.

## Added

- 8 complete interface themes:
  - MI6 Classified / Original
  - Xbox Series X
  - PS5
  - Windows 11 Dark
  - Cyber Intelligence
  - Night Vision
  - Arctic Command
  - Crimson Operations
- Optional accent overrides: theme default, gold, green, blue, cyan, purple, red, orange and silver.
- Theme persistence through localStorage.
- Theme selector cards with miniature previews in System Workspace Settings.
- Theme selector inside the Mission Simulator settings modal for fast in-mission switching.
- Semantic CSS tokens for backgrounds, surfaces, text, accents, borders, success/warning/danger/info, shadows, ambient lighting and grid treatment.
- Compatibility bridge that maps existing amber interface chrome to the selected semantic accent without rewriting mission logic.
- Windows 11 glass-style treatment for themed panels.
- Improved actor selection cards with large portrait areas, hover treatment, selected states, and graceful image fallback.
- Actor portrait fallback component prevents broken-image icons and preserves card dimensions.
- Wikimedia Commons portrait sources for all six Bond actors, with attribution notes in THIRD_PARTY_PORTRAIT_CREDITS.md.
- Improved film confirmation block with film year and mission location.
- Launch screen now participates in the same theme engine instead of remaining hardcoded black/gold.

## Safety / compatibility

The pass does not remove or alter mission simulation logic, save logic, telemetry calculations, debrief systems, causal trees, archives, AI state, or mission data architecture.

## Validation

A TypeScript/TSX syntax transpilation check was run across the src tree successfully. Full dependency build was not possible in the sandbox because project node_modules were not available locally.
