
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
