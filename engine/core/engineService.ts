/**
 * Whisper Engine API Service
 * Centralized interface for all engine capabilities
 * This service exposes all engine features to the UI layer
 */

import { llmClient } from "../llm/llmClient";
import { eventBus } from "./eventBus";
import { logger } from "./logger";
import {
  loadConfig,
  saveConfig,
  validateConfig,
  loadProfiles,
  saveProfile,
  deleteProfile,
  exportConfig,
  importConfig,
  resetConfig,
  type WhisperConfig,
  type ConfigProfile,
} from "./configStore";
import {
  loadTaskMemory,
  searchTaskMemory,
  getMemoryStatistics,
  getRelatedTasks,
  addTaskMemory,
  updateTaskMemory,
  deleteTaskMemory,
  clearTaskMemory,
  exportTaskMemory,
  importTaskMemory,
  type TaskMemoryItem,
  type MemorySearchFilter,
  type MemoryStatistics,
} from "../memory/taskMemory";

export type EngineCapability = {
  id: string;
  name: string;
  description: string;
  category: "ai" | "workspace" | "developer" | "analytics" | "utility";
  status: "available" | "experimental" | "coming_soon";
  icon: string;
  features: string[];
};

export type EngineStatus = {
  version: string;
  initialized: boolean;
  capabilities: EngineCapability[];
  activeServices: string[];
  health: {
    llm: boolean;
    workspace: boolean;
    memory: boolean;
    eventBus: boolean;
  };
};

// Engine Service Class
class WhisperEngineService {
  private initialized = false;
  private version = "2.0.0";

  async initialize(): Promise<void> {
    if (this.initialized) return;

    logger.info(
      "EngineService",
      "Initializing Whisper Engine v" + this.version,
    );

    // Initialize components
    try {
      // Load configuration
      const config = loadConfig();
      logger.debug("EngineService", "Configuration loaded", {
        provider: config.llmProvider,
      });

      // Setup event listeners
      this.setupEventListeners();

      this.initialized = true;
      logger.info("EngineService", "Engine initialized successfully");

      eventBus.publish({
        type: "ui:toast",
        payload: { kind: "info", text: "Whisper Engine initialized" },
      });
    } catch (err) {
      logger.error("EngineService", "Initialization failed", err);
      throw err;
    }
  }

  private setupEventListeners() {
    // Log all events in debug mode
    eventBus.use((event, next) => {
      logger.debug("EventBus", `Event: ${event.type}`, event.payload);
      next();
    });
  }

  // Configuration Management
  getConfig(): WhisperConfig {
    return loadConfig();
  }

  async updateConfig(
    config: WhisperConfig,
  ): Promise<{ success: boolean; errors?: string[] }> {
    const validation = validateConfig(config);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    saveConfig(config);
    logger.info("EngineService", "Configuration updated", {
      provider: config.llmProvider,
    });

    eventBus.publish({
      type: "ui:toast",
      payload: { kind: "info", text: "Configuration saved" },
    });

    return { success: true };
  }

  getConfigProfiles(): ConfigProfile[] {
    return loadProfiles();
  }

  saveConfigProfile(profile: ConfigProfile): void {
    saveProfile(profile);
    logger.info("EngineService", "Profile saved", { profileId: profile.id });
  }

  deleteConfigProfile(profileId: string): void {
    deleteProfile(profileId);
    logger.info("EngineService", "Profile deleted", { profileId });
  }

  exportConfiguration(): string {
    const config = loadConfig();
    return exportConfig(config);
  }

  importConfiguration(jsonStr: string): {
    success: boolean;
    config?: WhisperConfig;
    error?: string;
  } {
    return importConfig(jsonStr);
  }

  resetConfiguration(): void {
    resetConfig();
    logger.info("EngineService", "Configuration reset to defaults");
  }

  // LLM Operations
  async callLLM(messages: any[], options: any): Promise<any> {
    const config = loadConfig();
    const providerConfig = config.providers[config.llmProvider];

    if (!providerConfig?.apiKey) {
      throw new Error("API key not configured");
    }

    return await llmClient.call(messages, {
      provider: config.llmProvider,
      apiKey: providerConfig.apiKey,
      model: providerConfig.model || "gpt-4o-mini",
      ...options,
    });
  }

  async *streamLLM(messages: any[], options: any): AsyncGenerator<any> {
    const config = loadConfig();
    const providerConfig = config.providers[config.llmProvider];

    if (!providerConfig?.apiKey) {
      throw new Error("API key not configured");
    }

    yield* llmClient.stream(messages, {
      provider: config.llmProvider,
      apiKey: providerConfig.apiKey!,
      model: providerConfig.model || "gpt-4o-mini",
      ...options,
    });
  }

  getLLMStats(provider?: string) {
    return llmClient.getStats(provider);
  }

  getLLMMetrics(filter?: { provider?: string; since?: number }) {
    return llmClient.getMetrics(filter);
  }

  getCacheStats() {
    return llmClient.getCacheStats();
  }

  clearLLMCache() {
    llmClient.clearCache();
    logger.info("EngineService", "LLM cache cleared");
  }

  // Memory Management
  getTaskMemory(): TaskMemoryItem[] {
    return loadTaskMemory();
  }

  searchTaskMemory(filter: MemorySearchFilter): TaskMemoryItem[] {
    return searchTaskMemory(filter);
  }

  getMemoryStats(): MemoryStatistics {
    return getMemoryStatistics();
  }

  getRelatedTasks(taskId: string, limit?: number): TaskMemoryItem[] {
    return getRelatedTasks(taskId, limit);
  }

  addTask(
    task: Partial<TaskMemoryItem> & Pick<TaskMemoryItem, "id" | "goal">,
  ): void {
    addTaskMemory(task);
    logger.info("EngineService", "Task added to memory", { taskId: task.id });
  }

  updateTask(taskId: string, updates: Partial<TaskMemoryItem>): void {
    updateTaskMemory(taskId, updates);
    logger.info("EngineService", "Task updated", { taskId });
  }

  deleteTask(taskId: string): void {
    deleteTaskMemory(taskId);
    logger.info("EngineService", "Task deleted", { taskId });
  }

  clearAllTasks(): void {
    clearTaskMemory();
    logger.info("EngineService", "All tasks cleared");
  }

  exportTasks(): string {
    return exportTaskMemory();
  }

  importTasks(jsonStr: string): {
    success: boolean;
    imported: number;
    error?: string;
  } {
    return importTaskMemory(jsonStr);
  }

  // Event System
  subscribeToEvent(type: any, handler: any) {
    return eventBus.subscribe(type, handler);
  }

  publishEvent(event: any) {
    eventBus.publish(event);
  }

  getEventHistory(filter?: any) {
    return eventBus.getHistory(filter);
  }

  clearEventHistory() {
    eventBus.clearHistory();
  }

  // Logger
  getLogs(filter?: any) {
    return logger.getLogs(filter);
  }

  exportLogs(): string {
    return logger.exportLogs();
  }

  clearLogs() {
    logger.clearLogs();
  }

  setLogLevel(level: any) {
    logger.setMinLevel(level);
  }

  // Engine Status
  getStatus(): EngineStatus {
    const config = loadConfig();
    const providerConfig = config.providers[config.llmProvider];
    const hasApiKey = !!providerConfig?.apiKey;

    return {
      version: this.version,
      initialized: this.initialized,
      capabilities: this.getCapabilities(),
      activeServices: this.getActiveServices(),
      health: {
        llm: hasApiKey,
        workspace: true,
        memory: true,
        eventBus: true,
      },
    };
  }

  getCapabilities(): EngineCapability[] {
    return [
      {
        id: "vision-synthesis",
        name: "Vision Synthesis",
        description: "Transform visual blueprints into functional Next.js code",
        category: "ai",
        status: "available",
        icon: "👁️",
        features: [
          "1:1 Pixel Mapping",
          "Automated Component Selection",
          "Next.js App Router Support",
        ],
      },
      {
        id: "blueprint-orchestration",
        name: "Blueprint Engine",
        description: "Manage the deterministic JSON-first UI core",
        category: "workspace",
        status: "available",
        icon: "🏗️",
        features: ["Section Registry", "Node Hierarchy", "JSON State Machine"],
      },
      {
        id: "pixel-diff",
        name: "Advanced Diff Gate",
        description: "Verify UI fidelity with pixel-perfect comparison",
        category: "developer",
        status: "available",
        icon: "🔍",
        features: ["Visual Diffing", "Threshold Management", "CI Integration"],
      },
      {
        id: "tailwind-synthesis",
        name: "Tailwind 4 Engine",
        description: "Generate semantic Tailwind 4 code automatically",
        category: "developer",
        status: "available",
        icon: "🎨",
        features: ["OKLCH Colors", "Design Tokens", "Plugin Integration"],
      },
      {
        id: "multi-agent-synthesis",
        name: "Multi-Agent Pipeline",
        description: "Coordinate Architect, Coder, and Quality Guard agents",
        category: "ai",
        status: "available",
        icon: "🤖",
        features: ["Auto-planning", "Self-correction", "Quality Review"],
      },
      {
        id: "knowledge-bank",
        name: "Knowledge bank",
        description: "Remember and learn from past synthesis results",
        category: "analytics",
        status: "available",
        icon: "🧠",
        features: ["Synthesis History", "Fix Suggestions", "Trend Analytics"],
      },
    ];
  }

  private getActiveServices(): string[] {
    const services: string[] = [];

    if (this.initialized) services.push("core");

    const config = loadConfig();
    if (config.providers[config.llmProvider]?.apiKey) services.push("llm");

    services.push("memory", "eventBus", "logger");

    return services;
  }

  getVersion(): string {
    return this.version;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const engineService = new WhisperEngineService();

// Auto-initialize
if (typeof window !== "undefined") {
  engineService.initialize().catch((err) => {
    console.error("[EngineService] Auto-init failed:", err);
  });
}
