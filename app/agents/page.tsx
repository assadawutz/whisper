"use client";

import { useState, useEffect } from "react";
import { Button, Card, Badge, GradientText } from "@/components/ui";
import { showToast } from "@/engine/utils/engineHelpers";
import { engineService } from "@/engine/core/engineService";

interface Agent {
  id: string;
  name: string;
  icon: string;
  role: string;
  desc: string;
  status: "active" | "standby" | "offline";
  tasks: number;
  accuracy: string;
}

const agents: Agent[] = [
  {
    id: "architect",
    name: "Architect",
    icon: "🏗️",
    role: "System Designer",
    desc: "วิเคราะห์โครงสร้าง UI และสร้าง Component Tree",
    status: "active",
    tasks: 142,
    accuracy: "99.8%",
  },
  {
    id: "stylist",
    name: "Stylist",
    icon: "🎨",
    role: "Visual Engineer",
    desc: "สกัดสี Typography และ Design Tokens",
    status: "active",
    tasks: 238,
    accuracy: "100%",
  },
  {
    id: "coder",
    name: "Nexus Coder",
    icon: "⚡",
    role: "Code Generator",
    desc: "สร้าง React Components และ TypeScript Types",
    status: "standby",
    tasks: 195,
    accuracy: "99.9%",
  },
  {
    id: "guard",
    name: "Quality Guard",
    icon: "🛡️",
    role: "QA Specialist",
    desc: "ตรวจสอบ Pixel-Perfect และ Performance",
    status: "active",
    tasks: 89,
    accuracy: "100%",
  },
];

interface Activity {
  agent: string;
  icon: string;
  message: string;
  time: string;
}

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[1]);
  const [activities, setActivities] = useState<Activity[]>([
    {
      agent: "Stylist",
      icon: "🎨",
      message: "Extracted 24 color tokens from blueprint #42",
      time: "2s ago",
    },
    {
      agent: "Architect",
      icon: "🏗️",
      message: "Generated component tree with 18 nodes",
      time: "5s ago",
    },
    {
      agent: "Guard",
      icon: "🛡️",
      message: "Pixel diff check passed: 99.9% accuracy",
      time: "12s ago",
    },
  ]);

  const deployAgent = () => {
    showToast(`กำลัง Deploy ${selectedAgent.name}...`, "info");

    setTimeout(() => {
      const newActivity: Activity = {
        agent: selectedAgent.name,
        icon: selectedAgent.icon,
        message: `Deployed to production - Ready for processing`,
        time: "just now",
      };

      setActivities([newActivity, ...activities.slice(0, 9)]);

      engineService.addTask({
        id: `deploy-${selectedAgent.id}-${Date.now()}`,
        category: "agent",
        goal: `Deploy ${selectedAgent.name}`,
        summary: `Successfully deployed ${selectedAgent.name} agent`,
        outcome: "success",
        tags: ["agent", "deploy", selectedAgent.id],
      });

      showToast(`${selectedAgent.name} Deployed! 🚀`, "info");
    }, 1500);
  };

  const configureAgent = () => {
    showToast(`เปิดการตั้งค่า ${selectedAgent.name}`, "info");

    setTimeout(() => {
      const newActivity: Activity = {
        agent: selectedAgent.name,
        icon: selectedAgent.icon,
        message: `Configuration updated - Optimized for ${selectedAgent.role}`,
        time: "just now",
      };

      setActivities([newActivity, ...activities.slice(0, 9)]);
      showToast("การตั้งค่าสำเร็จ! ⚙️", "info");
    }, 1000);
  };

  const testAgent = () => {
    showToast(`กำลังทดสอบ ${selectedAgent.name}...`, "info");

    setTimeout(() => {
      const newActivity: Activity = {
        agent: selectedAgent.name,
        icon: selectedAgent.icon,
        message: `Health check passed - All systems operational`,
        time: "just now",
      };

      setActivities([newActivity, ...activities.slice(0, 9)]);
      showToast(`${selectedAgent.name} ทำงานปกติ! ✅`, "info");
    }, 1200);
  };

  const viewLogs = () => {
    const logData = activities
      .map((a) => `[${a.time}] ${a.agent}: ${a.message}`)
      .join("\n");

    const blob = new Blob([logData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showToast("Export Logs สำเร็จ! 📥", "info");
  };

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-20 pb-32 lg:pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <Badge variant="purple">🤖 AI Squad</Badge>
            <h1 className="text-5xl md:text-7xl font-black leading-none">
              <GradientText>NEURAL AGENTS</GradientText>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              ทีม AI ผู้เชี่ยวชาญที่ทำงานร่วมกันสร้าง UI แบบอัตโนมัติ
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={viewLogs}>
              📋 Export Logs
            </Button>
            <Button variant="orange" size="lg" glow onClick={testAgent}>
              🧪 Test Agent
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Agent List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-2">
              ตัวแทน AI ที่พร้อมใช้งาน
            </h3>
            {agents.map((agent) => (
              <Card
                key={agent.id}
                interactive
                onClick={() => setSelectedAgent(agent)}
                className={`flex items-center gap-5 transition-all ${
                  selectedAgent.id === agent.id
                    ? "ring-4 ring-orange-500/20 scale-105 shadow-2xl"
                    : ""
                }`}
              >
                <div className="text-5xl">{agent.icon}</div>
                <div className="flex-1">
                  <h4 className="text-lg font-black mb-1">{agent.name}</h4>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    {agent.role}
                  </p>
                </div>
                {agent.status === "active" && (
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </Card>
            ))}
          </div>

          {/* Agent Detail View */}
          <div className="lg:col-span-2">
            <Card
              gradient
              className="bg-linear-to-br from-orange-400 via-pink-500 to-purple-500 p-12 text-white min-h-[600px] flex flex-col justify-center"
            >
              <div className="text-center space-y-8">
                <div className="text-9xl animate-float mb-8">
                  {selectedAgent.icon}
                </div>

                <div className="space-y-4">
                  <Badge variant="glass">{selectedAgent.role}</Badge>
                  <h2 className="text-5xl font-black mb-6">
                    {selectedAgent.name}
                  </h2>
                  <p className="text-xl opacity-90 max-w-xl mx-auto leading-relaxed">
                    {selectedAgent.desc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto pt-8">
                  <div className="glass-card p-6 rounded-2xl">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-2">
                      งานที่ทำ
                    </p>
                    <p className="text-3xl font-black">{selectedAgent.tasks}</p>
                  </div>
                  <div className="glass-card p-6 rounded-2xl">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-2">
                      ความแม่นยำ
                    </p>
                    <p className="text-3xl font-black">
                      {selectedAgent.accuracy}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center pt-8">
                  <Button variant="glass" size="lg" onClick={deployAgent}>
                    🚀 Deploy Agent
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-white border-white hover:bg-white/20"
                    onClick={configureAgent}
                  >
                    ⚙️ Configure
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Activity Log */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Live Activity Stream
            </h3>
          </div>

          <div className="space-y-3">
            {activities.map((activity, idx) => (
              <ActivityLog key={idx} {...activity} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

interface ActivityLogProps {
  agent: string;
  icon: string;
  message: string;
  time: string;
}

function ActivityLog({ agent, icon, message, time }: ActivityLogProps) {
  return (
    <Card className="flex items-start gap-5 hover:shadow-lg transition-all">
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-bold text-orange-500">{agent}</span>
          <span className="text-xs text-slate-400">{time}</span>
        </div>
        <p className="text-slate-600">{message}</p>
      </div>
    </Card>
  );
}
