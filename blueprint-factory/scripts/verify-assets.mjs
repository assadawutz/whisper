import fs from "fs";
import path from "path";

/**
 * FAIL-FAST ASSET VERIFIER
 * Checks existence and schema of Core Artifacts.
 */
const BASE_PATH =
  "./blueprint-factory/output/image-to-ui-monorepo/packages/core/assets";

const mustHave = [
  {
    file: "document/editor.document.json",
    desc: "Main UI State (Canonical Truth)",
    schema: ["version", "root"],
  },
  {
    file: "intent/intent.catalog.json",
    desc: "Layout Intents and Semantic Traits",
    schema: ["intents"],
  },
  {
    file: "section/section.registry.json",
    desc: "Trigger mapping (he, ne, etc.)",
    schema: ["sections"],
  },
];

console.log("🔍 [Whisper Engine] Health Check Starting...");

let failed = false;

mustHave.forEach(({ file, desc, schema }) => {
  const fullPath = path.join(process.cwd(), BASE_PATH, file);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ MISSING: ${file}`);
    console.error(`   -> ${desc}`);
    failed = true;
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    const missingKeys = schema.filter((key) => !(key in data));

    if (missingKeys.length > 0) {
      console.error(`⚠️  SCHEMA ERROR: ${file}`);
      console.error(`   -> Missing required keys: ${missingKeys.join(", ")}`);
      failed = true;
    } else {
      console.log(`✅ VERIFIED: ${file}`);
    }
  } catch (e) {
    console.error(`🔥 CORRUPT JSON: ${file}`);
    failed = true;
  }
});

if (failed) {
  console.log("\n🆘 REMEDIATION:");
  console.log(
    "1. Run: node blueprint-factory/scripts/create_complete_repo.mjs",
  );
  console.log("2. Check if blueprint-factory/output is correctly generated.");
  process.exit(1);
} else {
  console.log("\n🚀 ENGINE READY: All systems nominal.");
}
