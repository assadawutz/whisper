"use client";

import { useState, useEffect } from "react";
import {
  engineService,
  type EngineCapability,
  type EngineStatus,
} from "@/engine/core/engineService";

export default function EngineDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [status, setStatus] = useState<EngineStatus | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [notification, setNotification] = useState<{
    text: string;
    type: "info" | "success";
  } | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Live update every 5s
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setStatus(engineService.getStatus());
    setStats({
      memory: engineService.getMemoryStats(),
      llm: engineService.getLLMStats(),
      cache: engineService.getCacheStats(),
      logs: engineService.getLogs({ limit: 5 }),
    });
  };

  const showNotification = (
    text: string,
    type: "info" | "success" = "info",
  ) => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!status) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 blur-xl mb-4 opacity-50"></div>
          <div className="text-xl font-light tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            INITIALIZING
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView status={status} stats={stats} />;
      case "capabilities":
        return <CapabilitiesView status={status} />;
      case "memory":
        return <MemoryView stats={stats} />;
      case "logs":
        return <LogsView stats={stats} />;
      default:
        return <DashboardView status={status} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-violet-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-fuchsia-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="flex relative z-10 min-h-screen">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          version={status.version}
        />

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto max-h-screen">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-8 right-8 animate-slide-up z-50">
          <div className="px-6 py-3 rounded-xl bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                notification.type === "success" ? "bg-green-500" : "bg-blue-500"
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-200">
              {notification.text}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Components ---

function Sidebar({ activeTab, setActiveTab, version }: any) {
  const menuItems = [
    { id: "dashboard", icon: "⚡", label: "Dashboard" },
    { id: "capabilities", icon: "🧩", label: "Capabilities" },
    { id: "memory", icon: "🧠", label: "Memory Bank" },
    { id: "logs", icon: "📜", label: "System Logs" },
  ];

  return (
    <div className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-xl shadow-lg shadow-violet-500/20">
          W
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">Whisper</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Engine v{version}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeTab === item.id
                ? "bg-white/10 text-white shadow-lg border border-white/5"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-auto px-4 py-4 rounded-xl bg-gradient-to-r from-gray-900 to-black border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-emerald-500 font-medium">
            Operational
          </span>
        </div>
        <p className="text-[10px] text-gray-600">
          System All Green
          <br />
          Latency: 12ms
        </p>
      </div>
    </div>
  );
}

function DashboardView({ status, stats }: any) {
  return (
    <div className="animate-fade-in space-y-8">
      {/* Upgrade Hero */}
      <div className="relative rounded-3xl overflow-hidden p-8 border border-white/10 bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 backdrop-blur-sm">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Welcome to Whisper Engine
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl">
            Your centralized AI development platform is active. All services are
            currently running optimally.
          </p>
          <div className="flex gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border border-black bg-gray-800 flex items-center justify-center text-[10px] text-gray-500"
                >
                  AI
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 self-center pl-2">
              3 Active Agents
            </p>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-violet-500/10 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Memory Usage"
          value={stats?.memory?.total || 0}
          label="Items stored"
          icon="🧠"
          color="violet"
        />
        <StatCard
          title="LLM Calls"
          value={stats?.llm?.total || 0}
          label="Requests made"
          icon="💬"
          color="blue"
        />
        <StatCard
          title="Cache Hit Rate"
          value={`${stats?.cache?.cacheHitRate ? (stats.cache.cacheHitRate * 100).toFixed(0) : 0}%`}
          label={`${stats?.cache?.totalHits || 0} hits`}
          icon="⚡"
          color="emerald"
        />
        <StatCard
          title="Tokens"
          value={`${((stats?.llm?.totalTokens || 0) / 1000).toFixed(1)}k`}
          label="Processed"
          icon="📊"
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-200">
              System Activity
            </h3>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
              Real-time
            </span>
          </div>

          <div className="space-y-4">
            {stats?.logs?.map((log: any, idx: number) => (
              <div
                key={idx}
                className="flex gap-4 items-start p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
              >
                <div
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.level === "error" ? "bg-red-500" : "bg-gray-500"}`}
                ></div>
                <div>
                  <p className="text-sm text-gray-300">{log.message}</p>
                  <p className="text-xs text-gray-600 mt-1 flex gap-2">
                    <span>{log.scope}</span>
                    <span>•</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-6">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <ActionButton label="Clear Memory Cache" icon="🧹" />
            <ActionButton label="Export System Logs" icon="📥" />
            <ActionButton label="Reset Configuration" icon="🔄" danger />
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilitiesView({ status }: any) {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">System Capabilities</h2>
        <p className="text-gray-400">
          Manage and configure active engine modules.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {status.capabilities.map((cap: EngineCapability) => (
          <CapabilityCard key={cap.id} capability={cap} />
        ))}
      </div>
    </div>
  );
}

function MemoryView({ stats }: any) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
      <div className="text-6xl mb-4 opacity-50">🧠</div>
      <h3 className="text-xl font-bold mb-2">Memory Explorer</h3>
      <p className="text-gray-400 mb-6 max-w-sm">
        Deep dive into your task memory, search through past interactions, and
        manage knowledge context.
      </p>
      <div className="flex gap-4 text-sm font-mono text-gray-500 mb-8">
        <div>Total Items: {stats?.memory?.total || 0}</div>
        <div>
          Success Rate:{" "}
          {stats?.memory?.successRate
            ? (stats.memory.successRate * 100).toFixed(1)
            : 0}
          %
        </div>
      </div>

      <a
        href="/memory"
        className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all hover:scale-105 shadow-lg shadow-violet-900/20"
      >
        Open Full Memory Console
      </a>
    </div>
  );
}

function LogsView({ stats }: any) {
  return (
    <div className="bg-[#0c0c0c] rounded-xl border border-white/10 overflow-hidden font-mono text-xs">
      <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex justify-between items-center">
        <span>TERMINAL_OUTPUT</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
        </div>
      </div>
      <div className="p-4 space-y-1 h-[600px] overflow-y-auto">
        {stats?.logs?.map((log: any, i: number) => (
          <div key={i} className="flex gap-4 hover:bg-white/5 p-1">
            <span className="text-gray-600 min-w-[80px]">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span
              className={`uppercase min-w-[60px] ${
                log.level === "error"
                  ? "text-red-400"
                  : log.level === "warn"
                    ? "text-yellow-400"
                    : log.level === "info"
                      ? "text-blue-400"
                      : "text-gray-400"
              }`}
            >
              {log.level}
            </span>
            <span className="text-purple-400 min-w-[100px]">{log.scope}</span>
            <span className="text-gray-300">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Components ---

function StatCard({ title, value, label, icon, color }: any) {
  const gradients: any = {
    violet: "from-violet-500/20 to-purple-500/20 text-violet-400",
    blue: "from-blue-500/20 to-cyan-500/20 text-blue-400",
    emerald: "from-emerald-500/20 to-green-500/20 text-emerald-400",
    orange: "from-orange-500/20 to-red-500/20 text-orange-400",
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:bg-gray-900/60 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-lg bg-gradient-to-r ${gradients[color]} bg-opacity-10`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
        {/* Sparkline placeholder */}
        <div className="h-8 w-16 bg-white/5 rounded mx-auto"></div>
      </div>
      <div>
        <h3 className="text-3xl font-bold tracking-tight text-white mb-1 group-hover:scale-105 transition-transform origin-left">
          {value}
        </h3>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-xs text-gray-600 mt-1">{label}</p>
      </div>
    </div>
  );
}

function CapabilityCard({ capability: cap }: { capability: EngineCapability }) {
  return (
    <div className="relative group p-6 rounded-2xl bg-[#0F0F11] border border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-900/10">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
          {cap.icon}
        </div>
        <span
          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
            cap.status === "available"
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-yellow-500/10 text-yellow-500"
          }`}
        >
          {cap.status}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-2 text-gray-200 group-hover:text-white">
        {cap.name}
      </h3>
      <p className="text-sm text-gray-500 mb-6 min-h-[40px] leading-relaxed">
        {cap.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {cap.features.slice(0, 3).map((f: string) => (
          <span
            key={f}
            className="text-[10px] px-2 py-1 rounded border border-white/5 text-gray-400 bg-white/[0.02]"
          >
            {f}
          </span>
        ))}
      </div>

      <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-gray-300 hover:text-white transition-colors border border-white/5 group-hover:border-violet-500/30">
        Configure
      </button>
    </div>
  );
}

function ActionButton({ label, icon, danger }: any) {
  return (
    <button
      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group ${
        danger
          ? "border-red-900/30 bg-red-900/10 hover:bg-red-900/20 text-red-400"
          : "border-white/5 bg-white/5 hover:bg-white/10 text-gray-300"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="opacity-50 group-hover:opacity-100 transition-opacity">
        {icon}
      </span>
    </button>
  );
}
