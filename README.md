# 🪨 Stone Layout Tool

A standalone 3D layout configurator that generates precise stone cladding or wall layout patterns based on preset parameters — rebuilt from the original "Oob Layouts" SketchUp extension, but with a modern web interface and fully local deployment.

This app is designed for architects, interior designers, and facade engineers who need fast and editable layout previews with control over height, length, joint spacing, randomness, and layout direction.

---

## 📁 Folder Structure

- `src/logic/layoutEngine.ts` — core layout generation logic (WIP)
- `src/logic/oobParser.ts` — parses legacy `.oob` preset files into usable JS objects
- `src/components/ControlsPanel.tsx` — user input form (e.g. row heights, spacing)
- `src/components/ViewerCanvas.tsx` — Three.js layout visualizer (canvas)
- `public/assets/presets/` — .oob preset files extracted from original plugin
- `public/assets/images/`, `fonts/`, `icons/` — original UI/branding elements (optional use)

---

## 🧠 What this app does

- Loads `.oob` preset files used by Oob Layouts plugin (via src/logic/oobParser.ts)
- Parses layout parameters like stone sizes, spacers, randomness
- Lets user edit parameters via a side panel (src/components/ControlsPanel.tsx)
- (Planned) Displays a 3D layout preview of the pattern (via Three.js in ViewerCanvas.tsx)
- (Planned) Allows export of generated layout geometry or pattern maps

---

## 🚀 Usage

1. Install dependencies:
   ```bash
   npm install
