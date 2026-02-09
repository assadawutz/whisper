"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Zap,
  Cpu,
  Eye,
  Layers,
  Activity,
  Code,
  Terminal,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Whisper Modules
import { whisperOrchestrator } from "@whisper/soul/WhisperOrchestrator";
import { AGENT_REGISTRY } from "@whisper/soul/agentRegistry";

/**
 * 🏛️ WHISPER STUDIO: COMMAND CENTER
 * Premium UI for orchestrating the Whisper Omni Engine.
 */
export default function WhisperStudio() {
  const [systemStatus, setSystemStatus] = useState("OPTIMAL");
  const [activeTab, setActiveTab] = useState("vision");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    addLog("Whisper Core initialized.");
    addLog("Awaiting Pilot input...");
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) =>
      [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10),
    );
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-[#050608]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              WHISPER STUDIO
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              Autonomous AI-OS v2.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 tracking-wider">
              SYSTEM {systemStatus}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
        </div>
      </nav>

      <main className="relative z-10 container mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Left Sidebar - Agent & Task Control */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <section className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black tracking-widest uppercase text-slate-400">
                Whisper Soul Registry
              </h2>
              <Shield size={16} className="text-indigo-400" />
            </div>

            <div className="space-y-3">
              {Object.values(AGENT_REGISTRY).map((agent) => (
                <div
                  key={agent.id}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Cpu size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{agent.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                        {agent.role}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 size={14} className="text-emerald-500/40" />
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black tracking-widest uppercase text-slate-400">
                Whisper Terminal Log
              </h2>
              <Terminal size={16} className="text-slate-500" />
            </div>
            <div className="space-y-2 font-mono text-[10px]">
              {logs.map((log, i) => (
                <p
                  key={i}
                  className="text-slate-400 border-l border-white/5 pl-3"
                >
                  {log}
                </p>
              ))}
            </div>
          </section>
        </aside>

        {/* Center/Right - Workspace */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <header className="flex p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-max">
            {[
              { id: "vision", label: "Whisper Vision Lab", icon: Eye },
              { id: "synthesis", label: "Whisper Synthesis", icon: Zap },
              { id: "studio", label: "Whisper Design Studio", icon: Layers },
              { id: "diff", label: "Whisper Diff Engine", icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon size={14} />
                <span className="text-xs font-black tracking-wide uppercase">
                  {tab.label}
                </span>
              </button>
            ))}
          </header>

          <div className="min-h-[600px] rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center overflow-hidden border-dashed relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_100%)]" />

            <div className="relative z-10 space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 animate-pulse text-slate-500">
                <Code size={32} />
              </div>
              <h3 className="text-xl font-bold">Awaiting Whisper Source</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Upload a UI image or provide a project path to begin the 1:1
                Whisper Synthesis process.
              </p>
              <button className="px-8 py-3 rounded-2xl bg-white text-black font-black text-xs hover:bg-slate-200 transition-colors uppercase tracking-widest shadow-xl shadow-white/5">
                Load Whisper Project
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
