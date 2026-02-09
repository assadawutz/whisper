"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Brain,
  Send,
  Layers,
  Code2,
  Shield,
  Terminal,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Settings,
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  status: "idle" | "active" | "busy";
  actionsCount: number;
  successRate: number;
}

interface AgentAction {
  id: string;
  agentId: string;
  action: string;
  success: boolean;
  ts: number;
}

const AGENT_ICONS: Record<string, any> = {
  memoria: Brain,
  nexus: Send,
  swift: Activity,
  artisan: Code2,
  seeker: Eye,
  guardian: Shield,
};

const AGENT_COLORS: Record<string, string> = {
  memoria: "from-purple-500 to-violet-600",
  nexus: "from-blue-500 to-cyan-600",
  swift: "from-amber-500 to-orange-600",
  artisan: "from-emerald-500 to-teal-600",
  seeker: "from-pink-500 to-rose-600",
  guardian: "from-indigo-500 to-blue-600",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<AgentAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testInput, setTestInput] = useState("");

  useEffect(() => {
    loadAgentData();
  }, []);

  const loadAgentData = () => {
    // Initialize agents
    const defaultAgents: Agent[] = [
      {
        id: "memoria",
        name: "Memoria",
        role: "Self-Learning Manager",
        description:
          "จัดการระบบ Self-Learning ทั้งหมด เก็บความทรงจำ, วิเคราะห์ Pattern",
        capabilities: [
          "store_memory",
          "analyze_patterns",
          "optimize_behavior",
          "export_learnings",
        ],
        status: "idle",
        actionsCount: 0,
        successRate: 100,
      },
      {
        id: "nexus",
        name: "Nexus",
        role: "Message Router",
        description: "รับ-ส่งข้อความระหว่าง Agents, ประสานงานการทำงานร่วมกัน",
        capabilities: [
          "route_message",
          "coordinate_agents",
          "load_balance",
          "queue_management",
        ],
        status: "idle",
        actionsCount: 0,
        successRate: 100,
      },
      {
        id: "swift",
        name: "Swift",
        role: "Context Controller",
        description:
          "ควบคุม Shortcuts, Combos, Hints, Ghost Text, Autocomplete",
        capabilities: [
          "manage_shortcuts",
          "expand_combos",
          "show_hints",
          "ghost_text",
          "autocomplete",
        ],
        status: "idle",
        actionsCount: 0,
        successRate: 100,
      },
      {
        id: "artisan",
        name: "Artisan",
        role: "Design-to-Code Specialist",
        description: "แปลง UI Design เป็น Tailwind CSS, จัดการ Pipeline",
        capabilities: [
          "analyze_design",
          "generate_tailwind",
          "optimize_css",
          "component_builder",
        ],
        status: "idle",
        actionsCount: 0,
        successRate: 100,
      },
      {
        id: "seeker",
        name: "Seeker",
        role: "Cursor & Context Tracker",
        description: "ติดตามตำแหน่ง Cursor, วิเคราะห์บริบท, ให้ Suggestions",
        capabilities: [
          "track_cursor",
          "analyze_context",
          "find_nearby",
          "position_aware_suggest",
        ],
        status: "idle",
        actionsCount: 0,
        successRate: 100,
      },
      {
        id: "guardian",
        name: "Guardian",
        role: "Pipeline Orchestrator",
        description: "ควบคุม Pipeline ทั้งหมด, Quality Gates",
        capabilities: [
          "manage_pipeline",
          "sequence_tasks",
          "quality_check",
          "error_recovery",
        ],
        status: "idle",
        actionsCount: 0,
        successRate: 100,
      },
    ];

    // Load saved state
    const saved = localStorage.getItem("whisper_agents_state");
    if (saved) {
      const data = JSON.parse(saved);
      for (const agent of defaultAgents) {
        const savedAgent = data.agents?.[agent.id];
        if (savedAgent) {
          agent.actionsCount = savedAgent.memory?.length || 0;
          const successActions =
            savedAgent.memory?.filter((a: any) => a.success).length || 0;
          agent.successRate =
            agent.actionsCount > 0
              ? Math.round((successActions / agent.actionsCount) * 100)
              : 100;
        }
      }
      setActionLog(data.actionLog || []);
    }

    setAgents(defaultAgents);
  };

  const invokeAgent = async (agentId: string, action: string) => {
    setIsLoading(true);

    // Simulate agent action
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newAction: AgentAction = {
      id: `action_${Date.now()}`,
      agentId,
      action,
      success: Math.random() > 0.1, // 90% success rate
      ts: Date.now(),
    };

    setActionLog((prev) => [newAction, ...prev].slice(0, 100));

    // Update agent stats
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          const newCount = a.actionsCount + 1;
          const successCount =
            Math.round((a.successRate / 100) * a.actionsCount) +
            (newAction.success ? 1 : 0);
          return {
            ...a,
            actionsCount: newCount,
            successRate: Math.round((successCount / newCount) * 100),
            status: "idle",
          };
        }
        return a;
      }),
    );

    // Save to localStorage
    const savedData = {
      actionLog: [newAction, ...actionLog].slice(0, 100),
      agents: agents.reduce(
        (acc, a) => ({
          ...acc,
          [a.id]: { memory: [newAction] },
        }),
        {},
      ),
    };
    localStorage.setItem("whisper_agents_state", JSON.stringify(savedData));

    setIsLoading(false);
  };

  const selectedAgentData = agents.find((a) => a.id === selectedAgent);

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Specialized Agents</h1>
              <p className="text-sm text-slate-500">
                ทีม AI ที่ทำงานเฉพาะทาง + Self-Learning
              </p>
            </div>
          </div>
        </header>

        {/* Agents Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {agents.map((agent) => {
            const Icon = AGENT_ICONS[agent.id] || Bot;
            const gradient =
              AGENT_COLORS[agent.id] || "from-slate-500 to-gray-600";
            const isSelected = selectedAgent === agent.id;

            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`p-6 rounded-2xl text-left transition-all ${
                  isSelected
                    ? "bg-white/10 border-2 border-white/20 scale-[1.02]"
                    : "bg-white/5 border border-white/10 hover:bg-white/[0.07]"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      agent.status === "active"
                        ? "bg-emerald-500 animate-pulse"
                        : agent.status === "busy"
                          ? "bg-amber-500 animate-pulse"
                          : "bg-slate-600"
                    }`}
                  />
                </div>

                <h3 className="text-lg font-bold mb-1">{agent.name}</h3>
                <p className="text-xs text-slate-400 mb-4">{agent.role}</p>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Activity size={12} className="text-slate-500" />
                    <span>{agent.actionsCount} actions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp
                      size={12}
                      className={
                        agent.successRate >= 90
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }
                    />
                    <span>{agent.successRate}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Agent Detail */}
        {selectedAgentData && (
          <div className="grid grid-cols-2 gap-6">
            {/* Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">
                {selectedAgentData.name}
                <span className="text-sm font-normal text-slate-400 ml-2">
                  - {selectedAgentData.role}
                </span>
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                {selectedAgentData.description}
              </p>

              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">
                Capabilities
              </h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedAgentData.capabilities.map((cap) => (
                  <button
                    key={cap}
                    onClick={() => invokeAgent(selectedAgentData.id, cap)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                  >
                    {cap}
                  </button>
                ))}
              </div>

              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">
                Test Action
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter custom action..."
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                />
                <button
                  onClick={() =>
                    testInput && invokeAgent(selectedAgentData.id, testInput)
                  }
                  disabled={!testInput || isLoading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:text-slate-500"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Run"
                  )}
                </button>
              </div>
            </div>

            {/* Action Log */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">Recent Actions</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {actionLog
                  .filter((a) => a.agentId === selectedAgentData.id)
                  .slice(0, 20)
                  .map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-black/30"
                    >
                      <div className="flex items-center gap-3">
                        {action.success ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-500"
                          />
                        ) : (
                          <XCircle size={16} className="text-rose-500" />
                        )}
                        <span className="text-sm font-mono">
                          {action.action}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(action.ts).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}

                {actionLog.filter((a) => a.agentId === selectedAgentData.id)
                  .length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Activity size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No actions yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!selectedAgent && (
          <div className="text-center py-16 text-slate-500">
            <Bot size={48} className="mx-auto mb-4 opacity-30" />
            <p>เลือก Agent เพื่อดูรายละเอียดและทดสอบ</p>
          </div>
        )}
      </div>
    </div>
  );
}
