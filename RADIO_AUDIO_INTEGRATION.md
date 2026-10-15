# MI6 Timepiece Radio audio integration

Integrated the two supplied Bond theme songs into the project:

- `public/assets/audio/for-your-eyes-only.mp3` — Sheena Easton, *For Your Eyes Only* (1981)
- `public/assets/audio/all-time-high.mp3` — Rita Coolidge, *Octopussy* (1983)

`src/components/BondRadio.tsx` now references these actual files, shows the real title / artist / film name, and reports playback/file errors instead of silently failing.

The original placeholder paths (`song1.mp3`, `song2.mp3`) are no longer used.
