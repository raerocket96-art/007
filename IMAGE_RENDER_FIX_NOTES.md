# Scene illustration repair

- Updated the default image model from `gemini-2.5-flash-image` to `gemini-3.1-flash-image`.
- Added API-key aliases (`GEMINI_API_KEY`, `GOOGLE_API_KEY`, `API_KEY`) so AI Studio / deployment environments are less brittle.
- Added model fallback for scene rendering and more robust image-part extraction.
- Stopped auto-disabling images on a single quota error.
- The scene panel now shows the real server error instead of only `VISUAL UNAVAILABLE`, plus the model used after a successful render.
- Gameplay remains non-blocking while an image renders.
