<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0ac9ad10-d6e9-4046-8a55-fcdd60659a17

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Mission simulator updates

- Each live turn requests a scene illustration in the background. Gameplay and decisions remain available while it develops.
- The **AUTO IMAGES** switch in the scene card is on by default. Turn it off to skip image requests, or choose **REGENERATE** for another version.
- Generated images are cached in this browser for the most recent 40 scenes. The cache is separate from mission saves and is not included when exporting a save slot.
- Scene images use `GEMINI_API_KEY` and `SCENE_IMAGE_MODEL` (default `gemini-2.5-flash-image`). Image generation can use API quota. If the key or image model is unavailable, the mission continues without an image.
- Live text turns use a 12-second server budget by default, then a continuity-preserving procedural fallback. Override `SIMULATION_TIMEOUT_MS` in the environment if needed.
