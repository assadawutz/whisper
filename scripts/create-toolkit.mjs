#!/usr/bin/env node
/**
 * create-toolkit.mjs
 * Robust Everything UI Toolkit & Core Generator
 *
 * Creates:
 * 1. everything-ui-toolkit/ - The library structure
 * 2. image-to-ui-core/ - The JSON-first core module
 * 3. everything-ui-toolkit.zip - Zipped bundle of the above
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";

const ROOT = process.cwd();
const TOOLKIT_ROOT = path.join(ROOT, "everything-ui-toolkit");
const CORE_ROOT = path.join(ROOT, "image-to-ui-core");

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function write(base, relPath, content) {
  const fullPath = path.join(base, relPath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, "utf8");
  console.log(`✔ Created ${path.relative(ROOT, fullPath)}`);
}

// --- Toolkit Files ---
const toolkitFiles = {
  "package.json": `{
  "name": "everything-ui-toolkit",
  "version": "1.0.0",
  "type": "module",
  "scripts": { "build": "tsc" },
  "devDependencies": { "typescript": "^5.4.0", "tailwindcss": "^4.0.0" }
}`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020", "module": "ESNext", "strict": true, "outDir": "dist", "esModuleInterop": true
  },
  "include": ["src"]
}`,
  "tailwind.config.ts": `import type { Config } from "tailwindcss";
export default {
  darkMode: ["class"],
  theme: { extend: {
    fontFamily: { sans: ["var(--font-sans)"], th: ["var(--font-th)"] },
    colors: {
      bg: "rgb(var(--bg)/<alpha-value>)",
      surface: "rgb(var(--surface)/<alpha-value>)",
      muted: "rgb(var(--muted)/<alpha-value>)",
      border: "rgb(var(--border)/<alpha-value>)",
      title: "rgb(var(--title)/<alpha-value>)",
      subtitle: "rgb(var(--subtitle)/<alpha-value>)",
      detail: "rgb(var(--detail)/<alpha-value>)",
      primary: { DEFAULT: "rgb(var(--primary)/<alpha-value>)", fg: "rgb(var(--primary-fg)/<alpha-value>)" }
    },
    borderRadius: { md: "var(--radius-md)", lg: "var(--radius-lg)" },
    boxShadow: { sm: "var(--shadow-sm)", md: "var(--shadow-md)", lg: "var(--shadow-lg)" }
  }}
} satisfies Config;`,
  "src/presets/tokens.css": `:root {
  --font-sans: "SF Pro Display","SF Pro Text",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  --font-th: "Kanit","SF Pro Display",system-ui,sans-serif;
  --bg: 248 250 252; --surface: 255 255 255; --muted: 241 245 249; --border: 229 231 235;
  --title: 27 29 32; --subtitle: 107 114 128; --detail: 107 114 128;
  --primary: 22 167 203; --primary-fg: 255 255 255;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --radius-md: .5rem; --radius-lg: .75rem;
}`,
  "src/presets/components.preset.ts": `export const PRESET = {
  AppRoot: "min-h-screen bg-bg text-detail font-sans antialiased",
  Container: "w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1260px] xl:max-w-[1440px]",
  Section: "py-10 sm:py-12 lg:py-16",
  Stack: "flex flex-col gap-4 sm:gap-6",
  Row: "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4",
  Grid1: "grid grid-cols-1 gap-4",
  Grid2: "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6",
  Grid3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
  H1: "font-th text-title font-semibold text-2xl sm:text-3xl lg:text-4xl",
  Paragraph: "text-detail text-sm sm:text-base",
  Image: "w-full h-40 sm:h-48 lg:h-56 object-cover rounded-md bg-muted",
  Image16x9: "w-full aspect-video object-cover rounded-md bg-muted",
  Card: "bg-surface border border-border rounded-lg shadow-sm p-4 sm:p-5 lg:p-6",
  CardClickable: "bg-surface border border-border rounded-lg shadow-sm p-4 sm:p-5 lg:p-6 transition-shadow hover:shadow-md",
  ButtonPrimary: "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-fg hover:bg-primary/90",
  Table: "w-full bg-surface border border-border rounded-lg overflow-hidden",
  Badge: "inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-detail",
  ChartContainer: "bg-surface border border-border rounded-lg shadow-sm p-4",
  Calendar: "bg-surface border border-border rounded-lg shadow-sm overflow-hidden"
} as const;
export type ComponentKey = keyof typeof PRESET;`,
  "src/core/types.ts": `import type { ComponentKey } from "../presets/components.preset";
export type Substyle = { shape?: "square"|"rounded"|"circle"; aspect?: "1:1"|"4:3"|"16:9"; orientation?: "vertical"|"horizontal"; grid?: 1|2|3 };
export type UINode = { id: string; type: ComponentKey; layer: "base"|"common"|"advanced"|"fancy"|"data"|"time"; interactive?: boolean; substyle?: Substyle; children?: UINode[] };`,
  "src/core/emit.ts": `import { PRESET } from "../presets/components.preset";
import { resolveSubstyle } from "./substyle";
import { guard } from "./interaction";
import { UINode } from "./types";
export function emitClass(n: UINode) {
  const cls = [PRESET[n.type] ?? "", resolveSubstyle(n.substyle)].filter(Boolean).join(" ");
  return guard(cls);
}`,
  "src/core/substyle.ts": `export const SUBSTYLE = {
  shape: { square: "", rounded: "rounded-lg", circle: "rounded-full" },
  aspect: { "1:1": "aspect-square", "4:3": "aspect-[4/3]", "16:9": "aspect-video" },
  orientation: { vertical: "flex flex-col", horizontal: "flex flex-col sm:flex-row" },
  grid: { 1: "grid grid-cols-1", 2: "grid grid-cols-1 sm:grid-cols-2", 3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" }
};
export function resolveSubstyle(s?: any) {
  if (!s) return "";
  return [s.shape && SUBSTYLE.shape[s.shape], s.aspect && SUBSTYLE.aspect[s.aspect], s.orientation && SUBSTYLE.orientation[s.orientation], s.grid && SUBSTYLE.grid[s.grid]].filter(Boolean).join(" ");
}`,
  "src/core/interaction.ts": `const BANNED = ["hover:scale-", "hover:-translate-", "group-hover:scale-"];
export function guard(cls: string) { BANNED.forEach(b => { if (cls.includes(b)) throw new Error("Banned: " + b); }); return cls; }`,
  "src/core/suggest.ts": `import { PRESET } from "../presets/components.preset";
export function suggest(prefix: string) { return Object.keys(PRESET).filter(k => k.toLowerCase().startsWith(prefix.toLowerCase())).slice(0, 8); }`,
  "src/exporters/export-html.ts": `import { emitClass } from "../core/emit"; import { UINode } from "../core/types";
export function exportHTML(n: UINode): string { const c = emitClass(n); const ch = n.children?.map(exportHTML).join("") ?? ""; return \`<div class="\${c}">\${ch}</div>\`; }`,
  "README.md": `Everything UI Toolkit
- image → UI → presets → autocomplete/ghost → export
- mobile-first, layered, deterministic
`,
};

// --- Core Files ---
const coreFiles = {
  "package.json": `{
  "name": "image-to-ui-core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "JSON-first image → UI core (deterministic, no overwrite)"
}`,
  "document/editor.document.json": `{
  "version": "0.1.0",
  "root": {
    "id": "root",
    "type": "Document",
    "children": []
  }
}`,
  "intent/intent.catalog.json": `{
  "intents": [
    { "id": "centered-stack", "traits": { "flow": "vertical", "align": "center" } },
    { "id": "card-list-3", "traits": { "flow": "grid", "columns": 3 } },
    { "id": "media-left", "traits": { "flow": "horizontal", "media": "left" } }
  ]
}`,
  "section/section.registry.json": `{
  "sections": [
    {
      "id": "section.hero",
      "trigger": ["he"],
      "intent": "centered-stack",
      "node": {
        "type": "Section",
        "name": "hero",
        "children": [
          { "type": "H1", "content": "Hero title" },
          { "type": "Paragraph", "content": "Subtitle text" },
          { "type": "Button", "content": "Get started" }
        ]
      }
    }
  ]
}`,
  "engine/insert.reducer.ts": `export function applyCall(doc, call, registry) {
  if (call.call !== "insertSection") return doc;
  const section = registry.sections.find(s => s.id === call.args.sectionId);
  if (!section) return doc;
  const next = structuredClone(doc);
  if (call.args.mode === "append") {
    next.root.children.push(section.node);
    return next;
  }
  const parent = next.root;
  const i = parent.children.findIndex(n => n.id === call.args.targetId);
  if (i >= 0) parent.children.splice(i + 1, 0, section.node);
  return next;
}`,
};

// 1. Generate Directory Structure
console.log("🚀 Initializing Toolkit Generation...");
Object.entries(toolkitFiles).forEach(([p, c]) => write(TOOLKIT_ROOT, p, c));
Object.entries(coreFiles).forEach(([p, c]) => write(CORE_ROOT, p, c));

// 2. Generate JSON Mockup
const mockup = {
  version: "0.1.0",
  root: {
    id: "root",
    type: "Document",
    children: [
      {
        id: "hero-1",
        type: "Section",
        name: "hero",
        intent: "centered-stack",
        children: [
          { type: "H1", content: "Hero title" },
          { type: "Paragraph", content: "Subtitle text" },
          { type: "Button", content: "Get started" },
        ],
      },
      {
        id: "news-1",
        type: "Section",
        name: "news",
        intent: "card-list-3",
        children: [
          { type: "H2", content: "Latest News" },
          {
            type: "CardList",
            count: 3,
            items: [
              { type: "Card", title: "News A" },
              { type: "Card", title: "News B" },
              { type: "Card", title: "News C" },
            ],
          },
        ],
      },
    ],
  },
};
write(
  CORE_ROOT,
  "document/example.result.json",
  JSON.stringify(mockup, null, 2),
);

// 3. Create ZIP (Manual approach with zlib for maximum compatibility)
const outZip = path.join(ROOT, "everything-ui-toolkit.zip");
const zipChunks = [];

function addToZip(name, content) {
  zipChunks.push(`FILE:${name}\n${content}\nEND\n`);
}

Object.entries(toolkitFiles).forEach(([p, c]) => addToZip(`toolkit/${p}`, c));
Object.entries(coreFiles).forEach(([p, c]) => addToZip(`core/${p}`, c));

const buffer = Buffer.from(zipChunks.join(""));
const gz = zlib.gzipSync(buffer);
fs.writeFileSync(outZip, gz);

console.log(`\n✅ Created everything-ui-toolkit.zip (Gzipped format)`);
console.log("✅ All structures initialized successfully.");
