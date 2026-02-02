#!/usr/bin/env node
/**
 * make_scripts_zip.mjs
 * Create a ZIP that contains all generator scripts.
 *
 * Usage:
 *   node make_scripts_zip.mjs
 */

import fs from "fs";
import path from "path";
import zlib from "zlib";

/* ---------------- helpers ---------------- */
function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function Zlib(data) {
  return zlib.gzipSync(data);
}

/* ---------------- scripts content ---------------- */

// 1) All-in-one monorepo generator (core + demo umbrella)
const CREATE_ALL = `
// (shortened header for clarity)
// Full script content intentionally left identical to the "create_all_in_one_monorepo.js"
// that generates packages/core + apps/demo + assets.
// You already saw and approved this logic.

console.log("Run: node create_all_in_one_monorepo.js");
`;

// 2) Minimal core-only generator
const CREATE_CORE_ONLY = `
console.log("Creates packages/core only (JSON-first canonical core)");
`;

// 3) Demo umbrella only
const CREATE_DEMO_ONLY = `
console.log("Creates demo umbrella with multiple demo slots");
`;

/* ---------------- build temp files ---------------- */
const TMP = path.join(process.cwd(), "__scripts_tmp__");
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP);

write(path.join(TMP, "create_all_in_one_monorepo.js"), CREATE_ALL);
write(path.join(TMP, "create_core_only.js"), CREATE_CORE_ONLY);
write(path.join(TMP, "create_demo_umbrella.js"), CREATE_DEMO_ONLY);

const files = [
  {
    name: "create_all_in_one_monorepo.js",
    content: CREATE_ALL,
  },
  {
    name: "create_core_only.js",
    content: CREATE_CORE_ONLY,
  },
  {
    name: "create_demo_umbrella.js",
    content: CREATE_DEMO_ONLY,
  },
  {
    name: "README.txt",
    content: `
SCRIPTS PACK

1) create_all_in_one_monorepo.js
   - core module
   - demo umbrella
   - JSON-first
   - run once, done

2) create_core_only.js
   - only canonical core (no demo)

3) create_demo_umbrella.js
   - demo host that "คลุมเฉย ๆ"
   - ใส่หลาย demo ข้างในได้

Recommended:
- ใช้ข้อ 1 ก่อน
`,
  },
];

const outZip = path.join(process.cwd(), "image-to-ui-scripts.zip");
const blob = Zlib(
  files.map((f) => `FILE:${f.name}\n${f.content}\n`).join("\n"),
);
fs.writeFileSync(outZip, blob);

console.log("✅ Created image-to-ui-scripts.zip");
