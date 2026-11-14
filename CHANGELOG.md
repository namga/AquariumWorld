# Changelog

## 2.0.0 — Realistic 3D
- Rebuilt the aquarium scene with Three.js procedural 3D geometry.
- Added animated fish, tail movement, aquatic plants, driftwood, rocks, sand, glass tank and bubbles.
- Added touch-friendly orbit, zoom and camera reset controls.
- Preserved core care/economy/quest/shop/local-save game systems.
- Added JSON progress export/import and updated Capacitor/Vite Android build pipeline.

## v2.0.2 – Android SDK setup stabilization
- Upgrade `android-actions/setup-android` to v4.
- Pin Android command-line tools to revision 13.0 (11479570) instead of the runner's default 16.0.
- Explicitly install Android platform 35, build-tools 35.0.0, and platform-tools.
- Add toolchain verification and export APK with a recognizable versioned filename.

## v2.0.3 – Vite entry point fix
- Configure Vite root as `src/` because the app entry HTML is `src/index.html`.
- Serve static PWA assets from `public/` and emit production assets to `dist/`.
- Use relative base paths so bundled assets work in both browsers and Capacitor Android.
