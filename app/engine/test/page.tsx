"use client";

import { useState, useEffect } from "react";
import { engineService } from "@/engine/core/engineService";
import {
  formatDuration,
  validateApiKey,
  formatTimestamp,
} from "@/engine/utils/engineHelpers";
import { Badge, Card, Button } from "@/components/ui"; // Assuming these exist or strictly use standard Tailwind

type TestResult = {
  id: string;
  name: string;
  category: "core" | "memory" | "events" | "llm" | "utils";
  status: "pending" | "running" | "success" | "fail";
  message?: string;
  duration?: number;
};

export default function EngineValidationPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const tests: Array<{
    id: string;
    name: string;
    category: TestResult["category"];
    fn: () => Promise<void>;
  }> = [
    // --- Core Configuration ---
    {
      id: "config-load",
      name: "Load Configuration",
      category: "core",
      fn: async () => {
        const config = engineService.getConfig();
        if (!config.version) throw new Error("Config version missing");
        if (!config.providers) throw new Error("Providers map missing");
      },
    },
    {
      id: "config-update",
      name: "Update Configuration",
      category: "core",
      fn: async () => {
        const original = engineService.getConfig();
        await engineService.updateConfig({
          ...original,
          preferences: { ...original.preferences, enableTelemetry: true },
        });
        const updated = engineService.getConfig();
        if (updated.preferences.enableTelemetry !== true)
          throw new Error("Update failed");
        // Revert
        await engineService.updateConfig(original);
      },
    },
    {
      id: "profile-crud",
      name: "Profile Management (CRUD)",
      category: "core",
      fn: async () => {
        const testProfile = {
          id: "test-profile-1",
          name: "Test Profile",
          config: engineService.getConfig(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        engineService.saveConfigProfile(testProfile);
        const profiles = engineService.getConfigProfiles();
        if (!profiles.find((p) => p.id === "test-profile-1"))
          throw new Error("Profile not saved");

        engineService.deleteConfigProfile("test-profile-1");
        const afterDelete = engineService.getConfigProfiles();
        if (afterDelete.find((p) => p.id === "test-profile-1"))
          throw new Error("Profile not deleted");
      },
    },

    // --- Memory System ---
    {
      id: "memory-add",
      name: "Add Task to Memory",
      category: "memory",
      fn: async () => {
        engineService.addTask({
          id: "test-task-1",
          goal: "Test Task",
          summary: "Testing memory",
          outcome: "success",
        });
        const tasks = engineService.getTaskMemory();
        if (!tasks.find((t) => t.id === "test-task-1"))
          throw new Error("Task not added");
      },
    },
    {
      id: "memory-search",
      name: "Search Task Memory",
      category: "memory",
      fn: async () => {
        const results = engineService.searchTaskMemory({ query: "Test Task" });
        if (results.length === 0) throw new Error("Search returned no results");
        if (results[0].goal !== "Test Task")
          throw new Error("Search result mismatch");
      },
    },
    {
      id: "memory-stats",
      name: "Memory Statistics",
      category: "memory",
      fn: async () => {
        const stats = engineService.getMemoryStats();
        if (typeof stats.total !== "number") throw new Error("Invalid stats");
      },
    },
    {
      id: "memory-delete",
      name: "Delete Task",
      category: "memory",
      fn: async () => {
        engineService.deleteTask("test-task-1");
        const tasks = engineService.getTaskMemory();
        if (tasks.find((t) => t.id === "test-task-1"))
          throw new Error("Task not deleted");
      },
    },

    // --- Event System ---
    {
      id: "event-pubsub",
      name: "Pub/Sub Messaging",
      category: "events",
      fn: async () => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("Event timeout")),
            1000,
          );
          const unsub = engineService.subscribeToEvent(
            "test:ping",
            (payload: any) => {
              clearTimeout(timeout);
              if (payload.message === "pong") {
                unsub();
                resolve();
              } else {
                reject(new Error("Wrong payload"));
              }
            },
          );
          engineService.publishEvent({
            type: "test:ping",
            payload: { message: "pong" },
          });
        });
      },
    },
    {
      id: "event-history",
      name: "Event History",
      category: "events",
      fn: async () => {
        const history = engineService.getEventHistory();
        if (!Array.isArray(history)) throw new Error("History is not array");
        // We just fired an event, so it should be there
        const lastEvent = history[history.length - 1];
        if (!lastEvent) throw new Error("History empty");
      },
    },

    // --- Utils & Helpers ---
    {
      id: "util-format",
      name: "Format Utilities",
      category: "utils",
      fn: async () => {
        if (formatDuration(1500) !== "1.5s")
          throw new Error("formatDuration failed");
        if (!formatTimestamp(Date.now()).includes("now"))
          throw new Error("formatTimestamp failed");
      },
    },
    {
      id: "util-validation",
      name: "Validation Utilities",
      category: "utils",
      fn: async () => {
        if (!validateApiKey("openai", "sk-" + "a".repeat(48)))
          throw new Error("API Key validation failed");
      },
    },

    // --- LLM (Mock) ---
    {
      id: "llm-init",
      name: "LLM Service Initialization",
      category: "llm",
      fn: async () => {
        const stats = engineService.getLLMStats();
        if (!stats || typeof stats.total !== "number")
          throw new Error("LLM Stats invalid");
      },
    },
  ];

  const runTests = async () => {
    setIsRunning(true);
    setResults(
      tests.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        status: "pending",
      })),
    );

    let completed = 0;

    for (const test of tests) {
      setResults((prev) =>
        prev.map((r) => (r.id === test.id ? { ...r, status: "running" } : r)),
      );

      const start = performance.now();
      try {
        await test.fn();
        const duration = performance.now() - start;
        setResults((prev) =>
          prev.map((r) =>
            r.id === test.id ? { ...r, status: "success", duration } : r,
          ),
        );
      } catch (err) {
        setResults((prev) =>
          prev.map((r) =>
            r.id === test.id
              ? {
                  ...r,
                  status: "fail",
                  message: (err as Error).message,
                }
              : r,
          ),
        );
      }
      completed++;
      setProgress((completed / tests.length) * 100);
      await new Promise((r) => setTimeout(r, 100)); // Visual delay
    }

    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
              Engine Diagnostics
            </h1>
            <p className="text-gray-400">
              Comprehensive Full-System Validation
            </p>
          </div>
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              isRunning
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 hover:scale-105"
            }`}
          >
            {isRunning ? "Running Diagnostics..." : "RUN SYSTEM CHECK"}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 gap-4">
          {results.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
              <div className="text-6xl mb-4 opacity-30">🛡️</div>
              <p className="text-gray-500">Ready to verify system integrity</p>
            </div>
          ) : (
            results.map((res) => (
              <div
                key={res.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  res.status === "running"
                    ? "bg-blue-900/10 border-blue-500/30 animate-pulse"
                    : res.status === "success"
                      ? "bg-emerald-900/10 border-emerald-500/30"
                      : res.status === "fail"
                        ? "bg-red-900/10 border-red-500/30"
                        : "bg-gray-900/50 border-white/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      res.status === "running"
                        ? "bg-blue-500"
                        : res.status === "success"
                          ? "bg-emerald-500"
                          : res.status === "fail"
                            ? "bg-red-500"
                            : "bg-gray-600"
                    }`}
                  />
                  <div>
                    <h3 className="font-medium text-gray-200">{res.name}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">
                      {res.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {res.message && (
                    <span className="text-sm text-red-400 font-mono bg-red-950/50 px-3 py-1 rounded">
                      {res.message}
                    </span>
                  )}
                  {res.duration !== undefined && (
                    <span className="text-xs font-mono text-gray-600 bg-black/20 px-2 py-1 rounded">
                      {res.duration.toFixed(1)}ms
                    </span>
                  )}
                  <div
                    className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                      res.status === "success"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : res.status === "fail"
                          ? "bg-red-500/20 text-red-400"
                          : res.status === "running"
                            ? "bg-blue-500/20 text-blue-400"
                            : "text-gray-600"
                    }`}
                  >
                    {res.status}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
