# AetheriusGraph

Interactive 3D celestial lore graph of The Elder Scrolls universe, built with Three.js, React, and TypeScript.

AetheriusGraph maps gods, daedric princes, dragons, heroes, factions, and artifacts as an interconnected firmament of stars. Every entity connects through history, mythic patronage, alliances, and wars, based on data verified from the Unofficial Elder Scrolls Pages (UESP).

## Key Features

* **Procedural Celestial Shader**: Custom GLSL shader rendering dynamic cosmic nebulae, atmospheric haze, and analytical starlight without pre-rendered background images.
* **Spectral Star Classification**: Stars render with distinct diffraction spikes and colors according to their nature:
  * Deities: Radiant Solar Gold (`#facc15`)
  * Daedric Princes: Abyssal Purple (`#c084fc`)
  * Dragons: Dragonflame Orange (`#f97316`)
  * Artifacts: Enchanted Ruby (`#f43f5e`)
  * Heroes: Mythic Starlight Cyan (`#38bdf8`)
  * Mortals and Characters: Living Emerald (`#34d399`)
  * Factions and Guilds: Royal Indigo (`#818cf8`)
  * Sacred Locations: Realm Turquoise (`#2dd4bf`)
* **Dynamic Level of Detail (LOD)**: Zoomed out views display primary sector headings and major anchors. Zooming into clusters reveals local star labels and connection beams.
* **Camera Physics**: Damped camera movement with smooth inertia panning, focal wheel zoom, and target tracking.
* **Lore Dossier Drawer**: Inspecting a star reveals full chronicler lore summaries, official portraits, verified relationship links, and direct links to canonical UESP articles.
* **Spectral Filtering and Autocomplete**: Filter by entity classification or search by name across the entire universe.

## Controls

* **Left Click + Drag**: Rotate celestial sphere
* **Right Click + Drag**: Pan across realms
* **Mouse Wheel**: Zoom in and out with focal inertia
* **Click on a Star**: Inspect character dossier and illuminate active lore beams
* **Sector Chips (Top Bar)**: Fly directly to a constellation cluster
* **Spectral Filter (Bottom Bar)**: Filter visible stars by entity classification
* **Escape**: Close the active lore drawer

## Tech Stack

* **Frontend**: React 19, TypeScript, Vite
* **3D Graphics**: Three.js, WebGL, custom GLSL vertex and fragment shaders
* **Data**: Over 200 nodes and 1,500 canonical relationships parsed from UESP wikitext

## Getting Started

### Prerequisites

* Node.js 18 or higher
* npm

### Installation

```bash
git clone https://github.com/your-username/AetheriusGraph.git
cd AetheriusGraph
npm install
```

### Running Locally

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
```

The production output will be generated in the `dist` directory.

## Data Pipeline

The dataset in `src/data/tes_lore_graph.json` contains validated entities, positions, and connections. To refresh or query the live UESP MediaWiki API:

```bash
python scripts/harvest_lore.py
```

## License

MIT
