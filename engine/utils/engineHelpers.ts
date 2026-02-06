/**
 * Engine Helper Utilities
 * Common utility functions for working with Whisper Engine
 */

import { engineService } from "../core/engineService";
import type { LlmMessage, LlmOptions } from "../llm/llmTypes";
import type { TaskMemoryItem } from "../memory/taskMemory";

// ==================== LLM Helpers ====================

/**
 * Quick chat with AI - simplified interface
 */
export async function quickChat(
  userMessage: string,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  },
): Promise<string> {
  const messages: LlmMessage[] = [];

  if (options?.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }

  messages.push({ role: "user", content: userMessage });

  const response = await engineService.callLLM(messages, {
    temperature: options?.temperature ?? 0.7,
    maxTokens: options?.maxTokens ?? 2000,
  });

  return response.content;
}

/**
 * Chat with conversation history
 */
export async function chatWithHistory(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  systemPrompt?: string,
): Promise<string> {
  const llmMessages: LlmMessage[] = systemPrompt
    ? [{ role: "system", content: systemPrompt }]
    : [];

  llmMessages.push(
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  );

  const response = await engineService.callLLM(llmMessages, {});
  return response.content;
}

/**
 * Generate code with AI
 */
export async function generateCode(
  description: string,
  language: string = "typescript",
  context?: string,
): Promise<string> {
  const prompt = context
    ? `Generate ${language} code for: ${description}\n\nContext:\n${context}`
    : `Generate ${language} code for: ${description}`;

  const systemPrompt = `You are an expert ${language} developer. Generate clean, production-ready code. Return ONLY the code without explanations or markdown.`;

  return await quickChat(prompt, { systemPrompt, temperature: 0.3 });
}

/**
 * Explain code with AI
 */
export async function explainCode(code: string): Promise<string> {
  return await quickChat(`Explain this code in simple terms:\n\n${code}`, {
    systemPrompt:
      "You are a helpful coding tutor. Explain code clearly and concisely.",
  });
}

/**
 * Review code for issues
 */
export async function reviewCode(
  code: string,
  language: string = "typescript",
): Promise<string> {
  return await quickChat(
    `Review this ${language} code for bugs, security issues, and improvements:\n\n${code}`,
    {
      systemPrompt:
        "You are a senior code reviewer. Identify issues and suggest improvements.",
      temperature: 0.4,
    },
  );
}

/**
 * Streaming chat iterator
 */
export async function* streamChat(
  userMessage: string,
  systemPrompt?: string,
): AsyncGenerator<string> {
  const messages: LlmMessage[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userMessage });

  for await (const chunk of engineService.streamLLM(messages, {})) {
    yield chunk.delta;
  }
}

// ==================== Memory Helpers ====================

/**
 * Quick task creation
 */
export function createTask(
  goal: string,
  options?: {
    summary?: string;
    outcome?: "success" | "fail" | "partial" | "cancelled";
    tags?: string[];
    filesModified?: string[];
  },
): void {
  engineService.addTask({
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    goal,
    summary: options?.summary || "",
    outcome: options?.outcome || "success",
    tags: options?.tags || [],
    filesModified: options?.filesModified || [],
    durationMs: 0,
    tokensUsed: 0,
    iterations: 1,
    focusPaths: [],
    metadata: {},
  });
}

/**
 * Search tasks easily
 */
export function findTasks(searchText: string): TaskMemoryItem[] {
  return engineService.searchTaskMemory({ query: searchText });
}

/**
 * Get recent successful tasks
 */
export function getRecentSuccesses(limit: number = 10): TaskMemoryItem[] {
  const allTasks = engineService.getTaskMemory();
  return allTasks
    .filter((t) => t.outcome === "success")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

/**
 * Get tasks by category
 */
export function getTasksByCategory(category: string): TaskMemoryItem[] {
  return engineService.searchTaskMemory({ category });
}

/**
 * Get task insights
 */
export function getTaskInsights() {
  const stats = engineService.getMemoryStats();
  const tasks = engineService.getTaskMemory();

  return {
    total: stats.total,
    successRate: (stats.successRate * 100).toFixed(1) + "%",
    avgDuration: (stats.avgDuration / 1000).toFixed(1) + "s",
    totalTokens: stats.totalTokens.toLocaleString(),
    topCategories: Object.entries(stats.byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5),
    topTags: stats.commonTags.slice(0, 5),
    recentTasks: tasks.slice(0, 5),
  };
}

// ==================== Config Helpers ====================

/**
 * Quick provider setup
 */
export async function setupProvider(
  provider: "openai" | "gemini" | "anthropic",
  apiKey: string,
  model?: string,
): Promise<void> {
  const config = engineService.getConfig();

  const models = {
    openai: model || "gpt-4o-mini",
    gemini: model || "gemini-2.0-flash-exp",
    anthropic: model || "claude-3-5-sonnet-20241022",
  };

  config.llmProvider = provider;
  config.providers[provider] = {
    ...config.providers[provider],
    apiKey,
    model: models[provider],
    temperature: 0.7,
    maxTokens: 4000,
  };

  await engineService.updateConfig(config);
}

/**
 * Get current provider info
 */
export function getCurrentProvider() {
  const config = engineService.getConfig();
  const provider = config.llmProvider;
  const providerConfig = config.providers[provider];

  return {
    provider,
    model: providerConfig?.model,
    hasApiKey: !!providerConfig?.apiKey,
    temperature: providerConfig?.temperature,
  };
}

/**
 * Switch provider
 */
export async function switchProvider(
  provider: "openai" | "gemini" | "anthropic",
): Promise<void> {
  const config = engineService.getConfig();
  config.llmProvider = provider;
  await engineService.updateConfig(config);
}

// ==================== Event Helpers ====================

/**
 * Show toast notification
 */
export function showToast(
  message: string,
  kind: "info" | "error" = "info",
): void {
  engineService.publishEvent({
    type: "ui:toast",
    payload: { kind, text: message },
  });
}

/**
 * Wait for specific event
 */
export async function waitForEvent(
  eventType: string,
  timeout: number = 5000,
): Promise<any> {
  return await engineService.subscribeToEvent(eventType, () => {});
}

/**
 * Subscribe to events with automatic cleanup
 */
export function onEvent(
  eventType: any,
  handler: (payload: any) => void,
): () => void {
  return engineService.subscribeToEvent(eventType, handler);
}

// ==================== Format Helpers ====================

/**
 * Format duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Format timestamp
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

  return date.toLocaleDateString();
}

/**
 * Format tokens
 */
export function formatTokens(tokens: number): string {
  if (tokens < 1000) return tokens.toString();
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(1)}M`;
}

/**
 * Estimate cost (approximate)
 */
export function estimateCost(tokens: number, model: string): string {
  const costPer1K: Record<string, number> = {
    "gpt-4o": 0.005,
    "gpt-4o-mini": 0.00015,
    "gpt-3.5-turbo": 0.0005,
    "gemini-2.0-flash-exp": 0, // Free tier
    "gemini-pro": 0.0005,
    "claude-3-5-sonnet-20241022": 0.003,
  };

  const cost = (tokens / 1000) * (costPer1K[model] || 0.001);
  return `$${cost.toFixed(4)}`;
}

// ==================== Validation Helpers ====================

/**
 * Validate API key format
 */
export function validateApiKey(provider: string, apiKey: string): boolean {
  const patterns: Record<string, RegExp> = {
    openai: /^sk-[a-zA-Z0-9]{48,}$/,
    gemini: /^[a-zA-Z0-9_-]{39}$/,
    anthropic: /^sk-ant-[a-zA-Z0-9_-]{95,}$/,
  };

  return patterns[provider]?.test(apiKey) ?? apiKey.length > 10;
}

/**
 * Check engine health
 */
export function checkEngineHealth() {
  const status = engineService.getStatus();

  const issues: string[] = [];
  if (!status.health.llm) issues.push("LLM provider not configured");
  if (!status.health.workspace) issues.push("Workspace error");
  if (!status.health.memory) issues.push("Memory error");
  if (!status.health.eventBus) issues.push("Event bus error");

  return {
    healthy: issues.length === 0,
    issues,
    services: status.activeServices,
    version: status.version,
  };
}

// ==================== Export/Import Helpers ====================

/**
 * Export everything
 */
export function exportAll(): {
  config: string;
  tasks: string;
  logs: string;
} {
  return {
    config: engineService.exportConfiguration(),
    tasks: engineService.exportTasks(),
    logs: engineService.exportLogs(),
  };
}

/**
 * Download as file
 */
export function downloadAsFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
    return true;
  } catch {
    return false;
  }
}

// ==================== Performance Helpers ====================

/**
 * Measure async function performance
 */
export async function measurePerf<T>(
  fn: () => Promise<T>,
  label: string,
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  console.log(`⚡ ${label}: ${formatDuration(duration)}`);

  return { result, duration };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
