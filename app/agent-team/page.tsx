"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Users,
  Cpu,
  Shield,
  Code2,
  Layers,
  Terminal,
  ArrowRight,
  Loader2,
  Sparkles,
  MessageSquare,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

interface AgentMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  type: "chat" | "task" | "result" | "handoff" | "approval";
  ts: number;
}

interface PipelineStep {
  id: string;
  name: string;
  agent: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  detail?: string;
}

interface Task {
  id: string;
  goal: string;
  status: string;
  currentAgent: string;
  history: AgentMessage[];
  pipeline: PipelineStep[];
  progress: number;
}

const AGENT_ICONS: Record<string, any> = {
  miralyn: Layers,
  penna: Code2,
  safetia: Shield,
  flux: Layers,
  checkka: Terminal,
  system: Cpu,
  user: MessageSquare,
};

const AGENT_COLORS: Record<string, string> = {
  miralyn: "from-violet-500 to-purple-600",
  penna: "from-emerald-500 to-teal-600",
  safetia: "from-rose-500 to-pink-600",
  flux: "from-amber-500 to-orange-600",
  checkka: "from-cyan-500 to-blue-600",
  system: "from-slate-500 to-gray-600",
  user: "from-indigo-500 to-blue-600",
};

const AGENT_NAMES: Record<string, string> = {
  miralyn: "Miralyn (Architect)",
  penna: "Penna (Coder)",
  safetia: "Safetia (Security)",
  flux: "Flux (Weaver)",
  checkka: "Checkka (Runner)",
  system: "System",
  user: "You",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-slate-500",
  in_progress: "text-amber-500",
  running: "text-amber-500",
  waiting_approval: "text-blue-500",
  completed: "text-emerald-500",
  failed: "text-rose-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "รอดำเนินการ",
  in_progress: "กำลังทำงาน",
  running: "กำลังทำงาน",
  waiting_approval: "รอการอนุมัติ",
  completed: "เสร็จสิ้น",
  failed: "ล้มเหลว",
};

export default function AgentTeamPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentTask?.history]);

  // Generate pipeline from goal
  const generatePipeline = (goal: string): PipelineStep[] => {
    return [
      {
        id: "1",
        name: "วิเคราะห์งาน",
        agent: "miralyn",
        status: "pending",
        progress: 0,
        detail: "วิเคราะห์ความต้องการและวางแผน",
      },
      {
        id: "2",
        name: "ออกแบบโครงสร้าง",
        agent: "miralyn",
        status: "pending",
        progress: 0,
        detail: "กำหนด Architecture และ Components",
      },
      {
        id: "3",
        name: "เขียนโค้ด",
        agent: "penna",
        status: "pending",
        progress: 0,
        detail: "สร้าง Code ตามแผน",
      },
      {
        id: "4",
        name: "ตรวจสอบความปลอดภัย",
        agent: "safetia",
        status: "pending",
        progress: 0,
        detail: "Scan หา vulnerabilities",
      },
      {
        id: "5",
        name: "ทดสอบ",
        agent: "checkka",
        status: "pending",
        progress: 0,
        detail: "รัน tests และเก็บ evidence",
      },
      {
        id: "6",
        name: "สรุปผล",
        agent: "miralyn",
        status: "pending",
        progress: 0,
        detail: "รวบรวมผลลัพธ์และรายงาน",
      },
    ];
  };

  const startNewTask = async () => {
    if (!input.trim() || !apiKey) return;

    const pipeline = generatePipeline(input);

    setIsLoading(true);
    try {
      const res = await fetch("/api/agent-team/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: input, apiKey }),
      });

      if (!res.ok) throw new Error("Failed to start task");

      const taskData = await res.json();

      // Enhance task with pipeline
      const task: Task = {
        ...taskData,
        pipeline: pipeline.map((step, i) => ({
          ...step,
          status: i === 0 ? "running" : "pending",
          progress: i === 0 ? 50 : 0,
        })),
        progress: 10,
      };

      setTasks((prev) => [task, ...prev]);
      setCurrentTask(task);
      setInput("");

      // Simulate pipeline progress
      simulatePipeline(task);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  const simulatePipeline = (task: Task) => {
    let stepIndex = 0;
    const interval = setInterval(() => {
      setCurrentTask((prev) => {
        if (!prev) return null;

        const newPipeline = [...prev.pipeline];

        // Complete current step
        if (newPipeline[stepIndex]) {
          newPipeline[stepIndex].status = "completed";
          newPipeline[stepIndex].progress = 100;
        }

        // Start next step
        stepIndex++;
        if (stepIndex < newPipeline.length) {
          newPipeline[stepIndex].status = "running";
          newPipeline[stepIndex].progress = 30;
        } else {
          clearInterval(interval);
        }

        const progress = Math.round((stepIndex / newPipeline.length) * 100);

        return {
          ...prev,
          pipeline: newPipeline,
          progress,
          status: stepIndex >= newPipeline.length ? "completed" : "in_progress",
          currentAgent: newPipeline[stepIndex]?.agent || prev.currentAgent,
        };
      });
    }, 3000);
  };

  const sendMessage = async () => {
    if (!input.trim() || !currentTask || !apiKey) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/agent-team/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: currentTask.id,
          message: input,
          apiKey,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const updatedTask = await res.json();
      const enhanced = {
        ...updatedTask,
        pipeline: currentTask.pipeline,
        progress: currentTask.progress,
      };
      setCurrentTask(enhanced);
      setTasks((prev) =>
        prev.map((t) => (t.id === enhanced.id ? enhanced : t)),
      );
      setInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (msg: AgentMessage) => {
    const Icon = AGENT_ICONS[msg.from] || Cpu;
    const gradient = AGENT_COLORS[msg.from] || "from-slate-500 to-gray-600";
    const name = AGENT_NAMES[msg.from] || msg.from;
    const isHandoff = msg.type === "handoff";

    return (
      <div key={msg.id} className={`flex gap-3 ${isHandoff ? "my-6" : "my-4"}`}>
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}
        >
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold">{name}</span>
            <span className="text-[10px] text-slate-500">
              {new Date(msg.ts).toLocaleTimeString()}
            </span>
            {isHandoff && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ArrowRight size={10} />
                Handoff to {AGENT_NAMES[msg.to]}
              </span>
            )}
          </div>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">
            {msg.content}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-black/30 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black">Agent Team</h1>
              <p className="text-[10px] text-slate-500">
                Whisper AI Collaboration
              </p>
            </div>
          </div>

          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Gemini API Key"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
              เริ่มงานใหม่ด้านล่าง
            </div>
          ) : (
            tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setCurrentTask(task)}
                className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${
                  currentTask?.id === task.id
                    ? "bg-indigo-500/20 border border-indigo-500/30"
                    : "bg-white/5 border border-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium truncate flex-1 pr-2">
                    {task.goal}
                  </p>
                  <span
                    className={`text-[10px] font-bold ${STATUS_COLORS[task.status]}`}
                  >
                    {task.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className={STATUS_COLORS[task.status]}>
                    {STATUS_LABELS[task.status] || task.status}
                  </span>
                  <span>•</span>
                  <span>{AGENT_NAMES[task.currentAgent]?.split(" ")[0]}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col">
        {currentTask ? (
          <>
            {/* Header with Status */}
            <header className="p-4 border-b border-white/5 bg-black/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold">{currentTask.goal}</h2>
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <span
                      className={`font-bold ${STATUS_COLORS[currentTask.status]}`}
                    >
                      {STATUS_LABELS[currentTask.status] || currentTask.status}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">
                      Active: {AGENT_NAMES[currentTask.currentAgent]}
                    </span>
                  </div>
                </div>

                {/* Progress Circle */}
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="url(#gradient)"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${currentTask.progress * 1.76} 176`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-black">
                      {currentTask.progress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Pipeline Steps */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {currentTask.pipeline?.map((step, i) => {
                  const Icon = AGENT_ICONS[step.agent] || Circle;
                  const isActive = step.status === "running";
                  const isDone = step.status === "completed";

                  return (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? "bg-indigo-500/20 border border-indigo-500/30"
                            : isDone
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : "bg-white/5 border border-white/5"
                        }`}
                        title={step.detail}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isDone
                              ? "bg-emerald-500"
                              : isActive
                                ? "bg-indigo-500 animate-pulse"
                                : "bg-white/10"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 size={12} className="text-white" />
                          ) : isActive ? (
                            <Loader2
                              size={12}
                              className="text-white animate-spin"
                            />
                          ) : (
                            <Icon size={12} className="text-slate-500" />
                          )}
                        </div>
                        <div className="hidden lg:block">
                          <p className="text-[10px] font-bold whitespace-nowrap">
                            {step.name}
                          </p>
                          <p className="text-[8px] text-slate-500">
                            {AGENT_NAMES[step.agent]?.split(" ")[0]}
                          </p>
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                          <div className="bg-black/90 border border-white/10 rounded-lg px-3 py-2 text-[10px] whitespace-nowrap">
                            <p className="font-bold">{step.name}</p>
                            <p className="text-slate-400">{step.detail}</p>
                          </div>
                        </div>
                      </div>

                      {i < currentTask.pipeline.length - 1 && (
                        <ArrowRight size={12} className="text-slate-600 mx-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              {currentTask.history.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-slate-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Whisper Agent Team</h2>
              <p className="text-sm text-slate-500 mb-6">
                พิมพ์งานที่ต้องการด้านล่าง ทีม AI Agents
                จะร่วมกันวางแผนและดำเนินการตาม Pipeline อัตโนมัติ
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {["miralyn", "penna", "safetia", "flux", "checkka"].map((a) => {
                  const Icon = AGENT_ICONS[a];
                  return (
                    <div
                      key={a}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br ${AGENT_COLORS[a]} bg-opacity-20`}
                    >
                      <Icon size={14} className="text-white" />
                      <span className="text-xs font-bold">
                        {AGENT_NAMES[a].split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (currentTask ? sendMessage() : startNewTask())
              }
              placeholder={
                currentTask
                  ? "พิมพ์ข้อความถึง Agent..."
                  : "พิมพ์งานที่ต้องการให้ทีม AI ช่วย..."
              }
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-indigo-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={currentTask ? sendMessage : startNewTask}
              disabled={!input.trim() || !apiKey || isLoading}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-500 transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
