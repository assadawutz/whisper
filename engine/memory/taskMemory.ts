export type TaskMemoryItem = {
  id: string;
  createdAt: number;
  updatedAt: number;
  goal: string;
  focusPaths: string[];
  outcome: "success" | "fail" | "partial" | "cancelled";
  lastError?: string;
  summary: string;
  tags: string[];
  category?: string;
  durationMs: number;
  iterations: number;
  tokensUsed: number;
  filesModified: string[];
  metadata: Record<string, unknown>;
};

export type MemorySearchFilter = {
  query?: string;
  outcome?: TaskMemoryItem["outcome"];
  tags?: string[];
  category?: string;
  since?: number;
  until?: number;
  minDuration?: number;
  maxDuration?: number;
};

export type MemoryStatistics = {
  total: number;
  byOutcome: Record<string, number>;
  byCategory: Record<string, number>;
  avgDuration: number;
  totalTokens: number;
  mostModifiedFiles: Array<{ path: string; count: number }>;
  commonTags: Array<{ tag: string; count: number }>;
  successRate: number;
};

const KEY = "whisper.taskMemory.v2";
const MAX_ITEMS = 500;
const CATEGORIZATION_KEYWORDS = {
  "bug-fix": ["fix", "bug", "error", "crash", "issue"],
  feature: ["add", "new", "create", "implement", "feature"],
  refactor: ["refactor", "restructure", "reorganize", "cleanup"],
  optimization: ["optimize", "performance", "faster", "improve"],
  documentation: ["doc", "comment", "readme", "guide"],
  testing: ["test", "spec", "coverage"],
  ui: ["ui", "design", "style", "layout", "component"],
};

function autoCategorizer(goal: string, summary: string): string {
  const text = `${goal} ${summary}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORIZATION_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }

  return "other";
}

function extractTags(
  goal: string,
  summary: string,
  focusPaths: string[],
): string[] {
  const tags = new Set<string>();

  // Auto-tag based on file extensions
  focusPaths.forEach((path) => {
    const ext = path.split(".").pop()?.toLowerCase();
    if (ext) {
      if (["ts", "tsx", "js", "jsx"].includes(ext)) tags.add("typescript");
      if (["css", "scss", "sass"].includes(ext)) tags.add("styling");
      if (["json", "yaml", "yml"].includes(ext)) tags.add("config");
      if (["md", "mdx"].includes(ext)) tags.add("documentation");
    }
  });

  // Auto-tag based on keywords
  const text = `${goal} ${summary}`.toLowerCase();
  if (text.includes("api")) tags.add("api");
  if (text.includes("database") || text.includes("db")) tags.add("database");
  if (text.includes("auth")) tags.add("authentication");
  if (text.includes("deploy")) tags.add("deployment");

  return Array.from(tags);
}

// Simple similarity score for search
function calculateSimilarity(text: string, query: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textLower = text.toLowerCase();

  let matches = 0;
  queryWords.forEach((word) => {
    if (textLower.includes(word)) matches++;
  });

  return matches / queryWords.length;
}

export function loadTaskMemory(): TaskMemoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTaskMemory(items: TaskMemoryItem[]) {
  try {
    const toSave = items.slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error("[TaskMemory] Save error:", err);
  }
}

export function addTaskMemory(
  item: Partial<TaskMemoryItem> & Pick<TaskMemoryItem, "id" | "goal">,
) {
  const items = loadTaskMemory();

  const now = Date.now();
  const fullItem: TaskMemoryItem = {
    createdAt: now,
    updatedAt: now,
    outcome: "success",
    summary: "",
    tags: [],
    durationMs: 0,
    iterations: 1,
    tokensUsed: 0,
    filesModified: [],
    focusPaths: [],
    metadata: {},
    ...item,
  };

  // Auto-categorize if not provided
  if (!fullItem.category) {
    fullItem.category = autoCategorizer(fullItem.goal, fullItem.summary);
  }

  // Auto-tag if not provided
  if (fullItem.tags.length === 0) {
    fullItem.tags = extractTags(
      fullItem.goal,
      fullItem.summary,
      fullItem.focusPaths,
    );
  }

  // Check if updating existing item
  const existingIndex = items.findIndex((i) => i.id === fullItem.id);
  if (existingIndex >= 0) {
    items[existingIndex] = {
      ...items[existingIndex],
      ...fullItem,
      updatedAt: now,
    };
  } else {
    items.unshift(fullItem);
  }

  saveTaskMemory(items.slice(0, MAX_ITEMS));
}

export function updateTaskMemory(id: string, updates: Partial<TaskMemoryItem>) {
  const items = loadTaskMemory();
  const index = items.findIndex((i) => i.id === id);

  if (index >= 0) {
    items[index] = { ...items[index], ...updates, updatedAt: Date.now() };
    saveTaskMemory(items);
  }
}

export function deleteTaskMemory(id: string) {
  const items = loadTaskMemory().filter((i) => i.id !== id);
  saveTaskMemory(items);
}

export function searchTaskMemory(filter: MemorySearchFilter): TaskMemoryItem[] {
  let items = loadTaskMemory();

  // Text search
  if (filter.query) {
    items = items
      .map((item) => ({
        item,
        score: calculateSimilarity(
          `${item.goal} ${item.summary}`,
          filter.query!,
        ),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }

  // Filter by outcome
  if (filter.outcome) {
    items = items.filter((i) => i.outcome === filter.outcome);
  }

  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    items = items.filter((i) =>
      filter.tags!.some((tag) => i.tags.includes(tag)),
    );
  }

  // Filter by category
  if (filter.category) {
    items = items.filter((i) => i.category === filter.category);
  }

  // Filter by date range
  if (filter.since !== undefined) {
    items = items.filter((i) => i.createdAt >= filter.since!);
  }

  if (filter.until !== undefined) {
    items = items.filter((i) => i.createdAt <= filter.until!);
  }

  // Filter by duration
  if (filter.minDuration !== undefined) {
    items = items.filter((i) => i.durationMs >= filter.minDuration!);
  }

  if (filter.maxDuration !== undefined) {
    items = items.filter((i) => i.durationMs <= filter.maxDuration!);
  }

  return items;
}

export function getMemoryStatistics(): MemoryStatistics {
  const items = loadTaskMemory();

  if (items.length === 0) {
    return {
      total: 0,
      byOutcome: {},
      byCategory: {},
      avgDuration: 0,
      totalTokens: 0,
      mostModifiedFiles: [],
      commonTags: [],
      successRate: 0,
    };
  }

  // Count by outcome
  const byOutcome: Record<string, number> = {};
  items.forEach((item) => {
    byOutcome[item.outcome] = (byOutcome[item.outcome] || 0) + 1;
  });

  // Count by category
  const byCategory: Record<string, number> = {};
  items.forEach((item) => {
    if (item.category) {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
    }
  });

  // Calculate average duration
  const totalDuration = items.reduce((sum, i) => sum + i.durationMs, 0);
  const avgDuration = totalDuration / items.length;

  // Calculate total tokens
  const totalTokens = items.reduce((sum, i) => sum + i.tokensUsed, 0);

  // Most modified files
  const fileCount = new Map<string, number>();
  items.forEach((item) => {
    item.filesModified.forEach((file) => {
      fileCount.set(file, (fileCount.get(file) || 0) + 1);
    });
  });
  const mostModifiedFiles = Array.from(fileCount.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Common tags
  const tagCount = new Map<string, number>();
  items.forEach((item) => {
    item.tags.forEach((tag) => {
      tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
    });
  });
  const commonTags = Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Success rate
  const successCount = byOutcome["success"] || 0;
  const successRate = successCount / items.length;

  return {
    total: items.length,
    byOutcome,
    byCategory,
    avgDuration,
    totalTokens,
    mostModifiedFiles,
    commonTags,
    successRate,
  };
}

export function getRelatedTasks(taskId: string, limit = 5): TaskMemoryItem[] {
  const items = loadTaskMemory();
  const target = items.find((i) => i.id === taskId);

  if (!target) return [];

  // Find tasks with similar tags, categories, or files
  const scored = items
    .filter((i) => i.id !== taskId)
    .map((item) => {
      let score = 0;

      // Same category
      if (item.category === target.category) score += 2;

      // Common tags
      const commonTags = item.tags.filter((t) => target.tags.includes(t));
      score += commonTags.length;

      // Common files
      const commonFiles = item.filesModified.filter((f) =>
        target.filesModified.includes(f),
      );
      score += commonFiles.length * 1.5;

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ item }) => item);
}

export function clearTaskMemory() {
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    console.error("[TaskMemory] Clear error:", err);
  }
}

export function exportTaskMemory(): string {
  const items = loadTaskMemory();
  return JSON.stringify(items, null, 2);
}

export function importTaskMemory(jsonStr: string): {
  success: boolean;
  imported: number;
  error?: string;
} {
  try {
    const imported = JSON.parse(jsonStr);
    if (!Array.isArray(imported)) {
      return {
        success: false,
        imported: 0,
        error: "Invalid format: expected array",
      };
    }

    const existing = loadTaskMemory();
    const merged = [...imported, ...existing];

    // Remove duplicates by id
    const unique = merged.filter(
      (item, index, self) => index === self.findIndex((i) => i.id === item.id),
    );

    saveTaskMemory(unique);
    return { success: true, imported: imported.length };
  } catch (err) {
    return { success: false, imported: 0, error: "Invalid JSON format" };
  }
}
