# Whisper Blueprint Engine 🌌

Automated UI synthesis system. This project merges a high-fidelity Next.js interface with a deterministic JSON-first UI core.

---

## 🏗️ Project Architecture

### 1. **Next.js Application** (The Interface)

Main application logic and live-sync engine.

- **`/app`**: Next.js App Router (Pages, CSS, Layouts).
  - `globals.css`: **Tailwind v4** configuration (using `@theme`).
  - `preview/[id]`: Premium "Synthesis" scanning experience.
- **`/blueprint`**: Internal editor components & Vision Engine logic.
- **`/lib`**: Shared types and suggestion helpers.

### 2. **Blueprint Factory** 🏭 (The Machines)

Isolated environment for generator scripts and portable builds.

- **`/blueprint-factory/scripts`**:
  - `create_complete_repo.mjs`: Generates the full Monorepo + Verify logic.
  - `make_scripts_zip.mjs`: Bundles scripts for distribution.
- **`/blueprint-factory/output`**:
  - `image-to-ui-monorepo.zip`: Portable core (JSON Assets + Reducer).
  - `everything-ui-toolkit.zip`: Design System (Tailwind 4 Presets).

---

## 🧠 Core Specifications

### **Image-to-UI Core**

Deterministic manipulation of UI structures via JSON.

- **Location**: `blueprint-factory/output/image-to-ui-monorepo`
- **Logic**: No-overwrite, `insert-below` or `append` only.
- **Assets**:
  - `Section Registry`: Maps triggers (e.g., `he`, `ne`) to schema nodes.
  - `Intent Catalog`: Semantic traits for layout orchestration.

### **Everything UI Toolkit**

A system-agnostic Tailwind CSS v4 library.

- **Location**: `blueprint-factory/output/everything-ui-toolkit`
- **Features**:
  - `Presets`: Multi-layered UI components (Card, Grid, AppRoot).
  - `Tokens`: Unified CSS variables for brand consistency.
  - `Interaction Guard`: Prevents accidental layout-breaking styles.

---

## 🛠️ Usage Commands

| Task                  | Command                                                               |
| :-------------------- | :-------------------------------------------------------------------- |
| **Start Dev Server**  | `npm run dev`                                                         |
| **Verify Assets**     | `node blueprint-factory/output/image-to-ui-monorepo/verify-assets.js` |
| **Regenerate Builds** | `node blueprint-factory/scripts/create_complete_repo.mjs`             |

---

## 🚀 Status: Engine Ready

- [x] **Tailwind 4** Migrated
- [x] **Premium UI** Components
- [x] **Deterministic Core** Validated
- [x] **Monorepo Structure** Organized
