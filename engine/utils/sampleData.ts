/**
 * Whisper Engine Sample Data Seed
 * Populate the engine with realistic sample data for demonstration
 */

import { engineService } from "../core/engineService";
import { createTask, setupProvider } from "../utils/engineHelpers";

export const SampleTasks = [
  {
    goal: "Synthesize complete Landing Page from Blueprint",
    summary:
      "Successfully extracted 12 sections from visual blueprint, mapped to high-fidelity Tailwind 4 components, and generated functional Next.js page with 98.5% visual accuracy.",
    outcome: "success" as const,
    tags: ["synthesis", "blueprint", "vision", "nextjs"],
    category: "feature",
    filesModified: [
      "app/synthesis/page.tsx",
      "blueprint/SectionRegistry.ts",
      "lib/generateTsx.ts",
    ],
    durationMs: 312000,
    tokensUsed: 8400,
    iterations: 4,
  },
  {
    goal: "Fix Pixel Diff in Hero Section",
    summary:
      "Adjusted Z-index stacking and gradient overlays in the Hero component to achieve perfect 1:1 match with source image. Resolved 15px misalignment in CTA button.",
    outcome: "success" as const,
    tags: ["vision", "diff", "css", "fix"],
    category: "bug-fix",
    filesModified: ["blueprint/nodes/Hero.tsx", "lib/diff.ts"],
    durationMs: 84000,
    tokensUsed: 2100,
    iterations: 2,
  },
  {
    goal: "Optimize Vision Engine extraction speed",
    summary:
      "Implemented selective scanning for static regions and parallelized box detection using Web Workers. Reduced extraction time by 45%.",
    outcome: "success" as const,
    tags: ["performance", "vision", "optimization"],
    category: "optimization",
    filesModified: ["blueprint/vision_engine.ts", "lib/extract.ts"],
    durationMs: 156000,
    tokensUsed: 3100,
    iterations: 1,
  },
  {
    goal: "Integrate Tailwind 4 Design Tokens",
    summary:
      "Migrated Section Registry to use new Tailwind 4 color system (OKLCH) and dynamic spacing variables. Verified all components use brand-approved tokens.",
    outcome: "success" as const,
    tags: ["tailwind", "design-system", "refactor"],
    category: "ui",
    filesModified: [
      "tailwind.config.js",
      "app/globals.css",
      "blueprint/core/theme.ts",
    ],
    durationMs: 198000,
    tokensUsed: 4500,
    iterations: 3,
  },
  {
    goal: "Implement Multi-layer Box Detection",
    summary:
      "Added support for detecting overlaying elements and nested children in the vision pipeline. Enabled complex grid-within-section extraction.",
    outcome: "partial" as const,
    tags: ["vision", "extraction", "feature"],
    category: "feature",
    filesModified: ["lib/extract.ts", "lib/tree.ts"],
    durationMs: 245000,
    tokensUsed: 12000,
    iterations: 5,
    lastError:
      "Deeply nested flex layouts occasionally fail to resolve z-index correctly",
  },
  {
    goal: "Add Automated Diff Gate for CI",
    summary:
      "Created a standalone verification script that runs pixel comparison between snapshots and generated UI. Fails build if diff > 5%.",
    outcome: "success" as const,
    tags: ["testing", "ci", "diff", "validation"],
    category: "testing",
    filesModified: ["verify/diff-gate.js", ".github/workflows/verify.yml"],
    durationMs: 128000,
    tokensUsed: 3800,
    iterations: 2,
  },
  {
    goal: "Refactor Component Registry to Dynamic Imports",
    summary:
      "Reduced main bundle size by 800KB by lazy-loading heavy UI components during the synthesis preview phase.",
    outcome: "success" as const,
    tags: ["refactor", "performance", "nextjs"],
    category: "refactor",
    filesModified: [
      "blueprint/BlueprintRenderer.tsx",
      "blueprint/core/loader.ts",
    ],
    durationMs: 112000,
    tokensUsed: 2400,
    iterations: 2,
  },
  {
    goal: "Enhance OCR Accuracy for Hero Text",
    summary:
      "Improved text detection for slanted and artistic fonts in hero sections using specialized vision preprocessing.",
    outcome: "success" as const,
    tags: ["vision", "ocr", "ai"],
    category: "feature",
    filesModified: ["lib/extract.ts", "blueprint/vision_engine.ts"],
    durationMs: 89000,
    tokensUsed: 5200,
    iterations: 2,
  },
];

export const SampleConfigurations = {
  openai: {
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 4000,
  },
  gemini: {
    model: "gemini-2.0-flash-exp",
    temperature: 0.7,
    maxTokens: 4000,
  },
  anthropic: {
    model: "claude-3-5-sonnet-20241022",
    temperature: 0.7,
    maxTokens: 4000,
  },
};

/**
 * Seed the engine with sample data
 */
export function seedSampleData() {
  console.log("🌱 Seeding Whisper Engine with sample data...");

  // Add sample tasks with staggered timestamps
  const baseTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago

  SampleTasks.forEach((task, index) => {
    const timestamp = baseTime + index * 2 * 24 * 60 * 60 * 1000; // 2 days apart

    createTask(task.goal, {
      ...task,
      // Override timestamps to create a history
    });

    // Manually update timestamps for realistic data
    const tasks = engineService.getTaskMemory();
    const addedTask = tasks[0]; // Most recent
    if (addedTask) {
      engineService.updateTask(addedTask.id, {
        createdAt: timestamp,
        updatedAt: timestamp + task.durationMs,
      });
    }
  });

  console.log(`✅ Added ${SampleTasks.length} sample tasks to memory`);

  // Log statistics
  const stats = engineService.getMemoryStats();
  console.log("📊 Memory Statistics:");
  console.log(`  - Total tasks: ${stats.total}`);
  console.log(`  - Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
  console.log(`  - Total tokens: ${stats.totalTokens.toLocaleString()}`);
  console.log(`  - Categories:`, stats.byCategory);
  console.log(`  - Top tags:`, stats.commonTags.slice(0, 5));

  return stats;
}

/**
 * Clear all sample data
 */
export function clearSampleData() {
  console.log("🗑️  Clearing all sample data...");
  engineService.clearAllTasks();
  console.log("✅ Sample data cleared");
}

/**
 * Reset and reseed
 */
export function resetWithSampleData() {
  clearSampleData();
  return seedSampleData();
}

/**
 * Quick setup for development
 */
export async function quickDevSetup(
  provider: "openai" | "gemini" = "openai",
  apiKey?: string,
) {
  console.log("🚀 Quick development setup...");

  if (apiKey) {
    await setupProvider(provider, apiKey);
    console.log(`✅ Configured ${provider} provider`);
  }

  seedSampleData();

  console.log("✅ Development environment ready!");
  console.log("💡 Navigate to /engine to view the dashboard");

  return engineService.getStatus();
}

// Sample conversation history for chat examples
export const SampleConversations = [
  {
    id: "conv-1",
    title: "Code Review Session",
    messages: [
      {
        role: "user" as const,
        content: "Can you review this authentication code?",
      },
      {
        role: "assistant" as const,
        content:
          "I'll review the authentication code. Please share it with me.",
      },
      {
        role: "user" as const,
        content:
          "async function authenticate(token) { return jwt.verify(token, SECRET); }",
      },
      {
        role: "assistant" as const,
        content:
          "This code has a few issues:\n1. Missing error handling for invalid tokens\n2. SECRET should not be hardcoded\n3. No token expiration check\n\nHere's an improved version:\n\n```typescript\nasync function authenticate(token: string) {\n  try {\n    const secret = process.env.JWT_SECRET\n    if (!secret) throw new Error('JWT_SECRET not configured')\n    \n    const payload = jwt.verify(token, secret) as JWTPayload\n    \n    if (payload.exp && payload.exp < Date.now() / 1000) {\n      throw new Error('Token expired')\n    }\n    \n    return payload\n  } catch (error) {\n    throw new AuthenticationError('Invalid token')\n  }\n}\n```",
      },
    ],
  },
  {
    id: "conv-2",
    title: "Performance Optimization",
    messages: [
      {
        role: "user" as const,
        content: "My API is slow. How can I optimize it?",
      },
      {
        role: "assistant" as const,
        content:
          "Here are key optimization strategies:\n\n1. **Caching**: Implement Redis/memory caching\n2. **Database**: Add indexes, use connection pooling\n3. **Code**: Use pagination, lazy loading\n4. **Infrastructure**: Enable CDN, use load balancing\n\nWhat specific bottleneck are you facing?",
      },
      {
        role: "user" as const,
        content: "Database queries are taking 2-3 seconds",
      },
      {
        role: "assistant" as const,
        content:
          "For slow queries, try:\n\n1. **Add indexes** on frequently queried columns\n2. **Use EXPLAIN** to analyze query plans\n3. **Implement query caching** with Redis\n4. **Optimize joins** - consider denormalization\n5. **Use pagination** instead of loading all records\n\nExample:\n```sql\n-- Add composite index\nCREATE INDEX idx_user_created ON users(created_at, status);\n\n-- Use LIMIT for pagination\nSELECT * FROM users \nWHERE status = 'active' \nORDER BY created_at DESC \nLIMIT 20 OFFSET 0;\n```",
      },
    ],
  },
];

// Export for use in development
if (typeof window !== "undefined") {
  (window as any).whisperSeed = {
    seed: seedSampleData,
    clear: clearSampleData,
    reset: resetWithSampleData,
    quickSetup: quickDevSetup,
    tasks: SampleTasks,
    conversations: SampleConversations,
  };

  console.log(
    "💡 Whisper Engine seed functions available at window.whisperSeed",
  );
  console.log("   - whisperSeed.seed() - Add sample data");
  console.log("   - whisperSeed.clear() - Remove all data");
  console.log("   - whisperSeed.reset() - Clear and reseed");
  console.log(
    "   - whisperSeed.quickSetup(provider, apiKey) - Quick dev setup",
  );
}
