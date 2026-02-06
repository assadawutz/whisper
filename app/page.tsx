"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { engineService } from "@/engine/core/engineService";
import { Button, Card, Badge, GradientText } from "@/components/ui";

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = () => {
      try {
        setStats({
          tasks: engineService.getMemoryStats().total,
          health: "Optimal",
        });
      } catch (err) {
        console.error(err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-20 pb-32 lg:pb-20">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Hero Section - Energetic & Bold */}
        <section className="relative">
          {/* Floating Orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-orange-400 rounded-full blur-3xl opacity-20 animate-float" />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl opacity-20 animate-float"
            style={{ animationDelay: "1s" }}
          />

          <div className="relative z-10 text-center space-y-10 py-20">
            <Badge variant="orange">⚡ AI-Powered Blueprint Engine v2.1</Badge>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tight">
              WHISPER <br />
              <GradientText>SYNTHESIS</GradientText>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              ระบบสร้างโค้ด UI อัตโนมัติที่ทรงพลังที่สุด แปลงภาพเป็น React
              Components ด้วยความแม่นยำระดับ Pixel-Perfect
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
              <Button
                variant="orange"
                size="xl"
                glow
                onClick={() => router.push("/synthesis")}
              >
                🚀 เริ่มสร้าง UI
              </Button>
              <Button
                variant="glass"
                size="xl"
                onClick={() => router.push("/studio")}
              >
                🎨 เปิด Studio
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Grid - Vibrant Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatsCard
            icon="⚡"
            label="ความแม่นยำ"
            value="99.9%"
            color="orange"
          />
          <StatsCard icon="🎯" label="Diff Gate" value="Pass" color="purple" />
          <StatsCard
            icon="🧬"
            label="Blueprints"
            value={stats?.tasks || "0"}
            color="cyan"
          />
          <StatsCard icon="🚄" label="ความเร็ว" value="12ms" color="pink" />
        </section>

        {/* Modules - Large & Colorful */}
        <section className="space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black">
              <GradientText>โมดูลหลัก</GradientText>
            </h2>
            <p className="text-slate-600 text-lg">
              เครื่องมือที่ทรงพลังสำหรับการสร้าง UI แบบอัตโนมัติ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ModuleCard
              icon="👁️"
              title="Vision Lab"
              desc="แปลงภาพเป็นโค้ดด้วย AI"
              href="/synthesis"
              gradient="from-orange-400 to-pink-500"
            />
            <ModuleCard
              icon="🎨"
              title="Design Studio"
              desc="ปรับแต่ง Design Tokens"
              href="/studio"
              gradient="from-purple-400 to-pink-500"
            />
            <ModuleCard
              icon="🤖"
              title="AI Agents"
              desc="ทีมงาน AI อัจฉริยะ"
              href="/agents"
              gradient="from-cyan-400 to-blue-500"
            />
          </div>
        </section>

        {/* System Status - Clean & Modern */}
        <section>
          <Card className="p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                System Status
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <p className="text-sm text-slate-500 mb-2">Engine Health</p>
                <p className="text-2xl font-black text-green-500">Optimal</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Active Tasks</p>
                <p className="text-2xl font-black text-orange-500">
                  {stats?.tasks || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Uptime</p>
                <p className="text-2xl font-black text-purple-500">99.9%</p>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, color }: any) {
  const colors: any = {
    orange: "from-orange-400 to-pink-500",
    purple: "from-purple-400 to-pink-500",
    cyan: "from-cyan-400 to-blue-500",
    pink: "from-pink-400 to-purple-500",
  };

  return (
    <Card
      gradient
      className={`bg-linear-to-br ${colors[color]} text-center space-y-4`}
    >
      <div className="text-5xl">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-widest opacity-90 mb-2">
          {label}
        </p>
        <p className="text-3xl font-black">{value}</p>
      </div>
    </Card>
  );
}

function ModuleCard({ icon, title, desc, href, gradient }: any) {
  const router = useRouter();

  return (
    <Card
      interactive
      onClick={() => router.push(href)}
      className="group relative overflow-hidden"
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${gradient} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`}
      />

      <div className="relative space-y-6">
        <div className="text-6xl animate-float">{icon}</div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black">{title}</h3>
          <p className="text-slate-600">{desc}</p>
        </div>
        <div className="flex items-center gap-2 text-orange-500 font-bold group-hover:gap-4 transition-all">
          <span>เปิดใช้งาน</span>
          <span className="text-2xl">→</span>
        </div>
      </div>
    </Card>
  );
}
