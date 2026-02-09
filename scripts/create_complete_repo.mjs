#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = "image-to-ui-monorepo";
const p = (...args) => path.join(process.cwd(), ROOT, ...args);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function write(file, content) {
  const fullPath = p(file);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(
    fullPath,
    typeof content === "string" ? content : JSON.stringify(content, null, 2),
  );
  console.log("✔ Created", file);
}

console.log("🚀 Generating Image-to-UI Monorepo...");

// 1. Root package.json
write("package.json", {
  name: "image-to-ui-monorepo",
  private: true,
  version: "0.1.0",
  type: "module",
  workspaces: ["packages/*", "apps/*"],
  scripts: {
    "verify:assets": "node ./verify-assets.js",
    demo: "npm -L -w @image-to-ui/demo run dev",
  },
});

// 2. packages/core/assets
write("packages/core/assets/document/editor.document.json", {
  version: "0.1.0",
  root: { id: "root", type: "Document", children: [] },
});

write("packages/core/assets/intent/intent.catalog.json", {
  intents: [
    { id: "centered-stack", traits: { flow: "vertical", align: "center" } },
    { id: "card-list-3", traits: { flow: "grid", columns: 3 } },
  ],
});

write("packages/core/assets/section/section.registry.json", {
  sections: [
    {
      id: "section.hero",
      trigger: ["he"],
      intent: "centered-stack",
      node: {
        type: "Section",
        name: "hero",
        children: [
          { type: "H1", content: "Hero Title" },
          { type: "Paragraph", content: "Subtitle text" },
        ],
      },
    },
    {
      id: "section.news",
      trigger: ["ne"],
      intent: "card-list-3",
      node: {
        type: "Section",
        name: "news",
        children: [
          { type: "H2", content: "Latest News" },
          { type: "CardList", count: 3 },
        ],
      },
    },
  ],
});

write("packages/core/assets/grammar/inline.grammar.json", {
  minChars: 2,
  maxChars: 3,
  confirmKey: "Tab",
  rules: { 2: "insert-below", 3: "append" },
});

// 3. packages/core logic
write(
  "packages/core/src/reducer.ts",
  `
export function applyCall(doc, call, registry) {
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
}
`,
);

// 4. apps/demo
write(
  "apps/demo/index.html",
  `<!DOCTYPE html><html><body><input id="cmd" placeholder="type 'ne' then Tab"></body></html>`,
);

// 5. verify-assets.js
write(
  "verify-assets.js",
  `
import fs from "fs";
import path from "path";

const root = process.cwd();
const mustHave = [
  "packages/core/assets/document/editor.document.json",
  "packages/core/assets/intent/intent.catalog.json",
  "packages/core/assets/section/section.registry.json",
  "packages/core/assets/grammar/inline.grammar.json"
];

let ok = true;
for (const rel of mustHave) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.error("MISSING:", rel);
    ok = false;
  }
}
if (ok) console.log("✔ All assets verified.");
else process.exit(1);
`,
);

// 6. Final Pack & Zip (Windows)
try {
  console.log("🔍 Verifying structure...");
  execSync("node ./verify-assets.js", { cwd: p(""), stdio: "inherit" });

  if (process.platform === "win32") {
    console.log("📦 Creating ZIP...");
    // Zip contents of the folder
    execSync(
      `powershell -Command "Compress-Archive -Path ./${ROOT} -DestinationPath ./${ROOT}.zip -Force"`,
    );
    console.log(`✅ Created ${ROOT}.zip`);
  }
} catch (e) {
  console.error("❌ Verification failed.");
}

console.log("\n✨ Setup complete.");
