import { engineService } from "../engine/core/engineService";
import { formatDuration, formatTimestamp } from "../engine/utils/engineHelpers";

// Mock Browser Environment
global.localStorage = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  },
  removeItem(key: string) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  },
  key(index: number) {
    return Object.keys(this.store)[index] || null;
  },
  length: 0,
} as Storage;

// Mock window/performance
if (typeof window === "undefined") {
  (global as any).window = {};
}
if (typeof performance === "undefined") {
  (global as any).performance = {
    now: () => Date.now(),
  } as unknown as Performance;
}

async function runTests() {
  console.log("🚀 STARTING SYSTEM SELF-CHECK...");
  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, msg: string) => {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      throw new Error(msg);
    }
    console.log(`✅ PASS: ${msg}`);
    passed++;
  };

  try {
    // 1. Config Test
    const config = engineService.getConfig();
    assert(!!config.version, "Config has version");
    assert(Object.keys(config.providers).length > 0, "Providers initialized");

    // 2. Memory Test
    const testId = `test-${Date.now()}`;
    engineService.addTask({
      id: testId,
      goal: "Self Check",
      summary: "Automated test",
      outcome: "success",
      tags: ["test"],
      filesModified: [],
      durationMs: 100,
    });

    let tasks = engineService.getTaskMemory();
    assert(
      tasks.some((t) => t.id === testId),
      "Task added to memory",
    );

    const results = engineService.searchTaskMemory({ query: "Self Check" });
    assert(
      results.length > 0 && results[0].goal === "Self Check",
      "Search works",
    );

    // 3. Stats Test
    const stats = engineService.getMemoryStats();
    assert(typeof stats.total === "number", "Stats total is number");
    assert(typeof stats.successRate === "number", "Success rate calculated");

    // 4. Utils Test
    assert(formatDuration(1500) === "1.5s", "formatDuration correct");
    assert(
      typeof formatTimestamp(Date.now()) === "string",
      "formatTimestamp returns string",
    );

    console.log("\n==========================================");
    console.log(`🎉 SYSTEM CHECK COMPLETE: ${passed}/${total} Tests Passed`);
    console.log("==========================================\n");
  } catch (err) {
    console.error("\n💥 SYSTEM CHECK FAILED");
    console.error(err);
    process.exit(1);
  }
}

// Run
runTests();
