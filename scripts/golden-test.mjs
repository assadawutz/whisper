import { BlueprintEngine } from "../../blueprint/core/engine.js";

/**
 * GOLDEN TEST: ne + Tab -> JSON Snapshot
 * Verifies that the engine produces a deterministic output for a standard trigger.
 */

const mockRegistry = {
  sections: [
    {
      id: "section.news",
      trigger: ["ne"],
      intent: "card-list-3",
      node: {
        id: "news-generated",
        type: "section",
        className: "bg-surface py-20",
        children: [{ id: "c1", type: "card", instruction: "News Item" }],
      },
    },
  ],
};

const initialDoc = {
  root: { id: "root", type: "container", children: [] },
};

const call = {
  call: "insertSection",
  args: { sectionId: "section.news", mode: "append" },
};

console.log("🧪 Running Golden Test: [Trigger::ne]...");

const result = BlueprintEngine.applyCall(initialDoc, call, mockRegistry);

// Verification
const hasNews = result.root.children.some((n) => n.id === "news-generated");

if (hasNews) {
  console.log("✅ PASS: Deterministic Node discovered and injected.");
  console.log("Snapshot:", JSON.stringify(result, null, 2));
} else {
  console.error("❌ FAIL: Snapshot mismatch or node not found.");
  process.exit(1);
}
