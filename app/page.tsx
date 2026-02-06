"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { engineService } from "@/engine/core/engineService";

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    try {
      const status = engineService.getStatus();
      const memoryStats = engineService.getMemoryStats();

      setStats({
        version: status.version,
        capabilities: status.capabilities.length,
        tasks: memoryStats.total,
        accuracy: "99.5%",
      });
    } catch (err) {
      console.error("Stats loading error:", err);
    }
  };

  const features = [
    {
      icon: "👁️",
      title: "Vision Synthesis",
      description:
        "เปลี่ยนรูปภาพหรือ Blueprint ให้เป็นโค้ด Next.js ที่ใช้งานได้จริงแถมความแม่นยำสูง",
      gradient: "from-fuchsia-500 via-purple-500 to-indigo-500",
      link: "/examples/synthesis",
    },
    {
      icon: "🏗️",
      title: "Blueprint Orchestration",
      description:
        "จัดการโครงสร้าง UI ด้วยระบบ JSON-first ที่แม่นยำและตรวจสอบได้",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      link: "/engine",
    },
    {
      icon: "🔍",
      title: "Advanced Diff Gate",
      description:
        "ระบบตรวจสอบความถูกต้องระดับ Pixel เพื่อความสมบูรณ์แบบของ UI",
      gradient: "from-emerald-500 via-green-500 to-lime-500",
      link: "/engine",
    },
    {
      icon: "🎨",
      title: "Tailwind 4 Engine",
      description:
        "สร้าง Semantic CSS ด้วย Tailwind 4 พร้อมระบบ Design Tokens อัจฉริยะ",
      gradient: "from-orange-500 via-red-500 to-pink-500",
      link: "/engine",
    },
    {
      icon: "🤖",
      title: "Neural Pipeline",
      description:
        "การทำงานร่วมกันของ AI Agents เพื่อวิเคราะห์ วางแผน และเขียนโค้ด",
      gradient: "from-violet-500 via-fuchsia-500 to-rose-500",
      link: "/engine",
    },
    {
      icon: "🧠",
      title: "Knowledge Bank",
      description:
        "ระบบเรียนรู้ความจำที่ช่วยให้การสังเคราะห์ UI ฉลาดขึ้นในทุกครั้ง",
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
      link: "/engine",
    },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-hidden relative selection:bg-fuchsia-500/30">
      {/* Prime Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-900/20 rounded-full blur-[160px] animate-pulse"></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/20 rounded-full blur-[160px] animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/10 to-transparent rotate-12"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-violet-500/10 to-transparent -rotate-12"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-4 group cursor-pointer"
              onClick={() => router.push("/")}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-600 flex items-center justify-center text-2xl shadow-lg shadow-fuchsia-500/20 group-hover:scale-110 transition-transform">
                W
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent italic">
                  WHISPER_BLUEPRINT
                </h1>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em]">
                  Vision Engine v{stats?.version || "2.1.0"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/examples/synthesis"
                className="hidden md:block px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white"
              >
                Vision Preview
              </Link>
              <Link
                href="/engine"
                className="px-6 py-2.5 rounded-xl bg-white text-black hover:bg-fuchsia-400 transition-all text-xs font-bold uppercase tracking-widest shadow-xl shadow-white/5"
              >
                Engine Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/5 mb-8 animate-fade-in">
          <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse"></div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-fuchsia-400 uppercase">
            Automated UI Synthesis Ready
          </span>
        </div>

        <h2 className="text-7xl md:text-8xl font-black tracking-tighter mb-8 animate-slide-up">
          <span className="text-white block">From Vision To</span>
          <span className="bg-gradient-to-r from-fuchsia-400 via-violet-400 to-blue-400 bg-clip-text text-transparent italic">
            High-Fidelity UI
          </span>
        </h2>

        <p
          className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Whisper Blueprint Engine คือแพลตฟอร์มสังเคราะห์ UI
          อัจฉริยะที่เปลี่ยนภาพลักษณ์ให้เป็นโค้ด Next.js แบบ 1:1
          พร้อมระบบตรวจสอบความแม่นยำระดับ Enterprise
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <button
            onClick={() => router.push("/examples/synthesis")}
            className="group px-10 py-5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 transition-all text-lg font-black shadow-2xl shadow-fuchsia-600/20 hover:scale-105 active:scale-95 flex items-center gap-3 tracking-tighter"
          >
            เริ่มสังเคราะห์ UI
            <span className="text-xl group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
          <button
            onClick={() => router.push("/engine")}
            className="px-10 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 backdrop-blur-md transition-all text-lg font-bold hover:scale-105 active:scale-95 tracking-tighter"
          >
            จัดการ Blueprint
          </button>
        </div>

        {/* Dynamic Display Stat */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 px-4 max-w-4xl mx-auto">
          <MetricBox
            label="Reliability"
            value={stats?.accuracy || "99.5%"}
            sub="Pixel-perfect"
          />
          <MetricBox
            label="Modules"
            value={stats?.capabilities || "6"}
            sub="Active Systems"
          />
          <MetricBox
            label="Synthesis"
            value={stats?.tasks || "28"}
            sub="Recent Runs"
          />
          <MetricBox label="Latency" value="12ms" sub="Response Time" />
        </div>
      </section>

      {/* Features Showcase */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="text-left">
            <h3 className="text-4xl font-bold tracking-tighter mb-2 italic">
              CORE_CAPABILITIES
            </h3>
            <p className="text-gray-500 text-sm font-mono tracking-widest uppercase">
              Whisper Neural Architecture
            </p>
          </div>
          <div className="h-[2px] flex-1 mx-12 hidden md:block bg-gradient-to-r from-white/5 via-white/10 to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative"
            >
              <div
                className={`absolute -inset-1 bg-gradient-to-br ${feature.gradient} rounded-[32px] opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`}
              ></div>
              <div className="relative bg-white/[0.02] border border-white/5 rounded-[30px] p-8 h-full backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br from-white/5 to-transparent">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-fuchsia-400 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
                  {feature.description}
                </p>

                <Link
                  href={feature.link}
                  className="absolute bottom-8 right-8 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                >
                  <span className="text-xl">↗</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="rounded-[40px] p-1 bg-gradient-to-br from-fuchsia-500/20 via-violet-500/10 to-transparent">
          <div className="rounded-[39px] bg-black/60 backdrop-blur-3xl p-12 md:p-24 text-center border border-white/5 overflow-hidden relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent"></div>

            <h3 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 italic">
              READY_TO_SYNTHESIZE?
            </h3>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
              เข้าร่วมกับนักพัฒนาระดับแนวหน้าที่ใช้ Whisper
              เพื่อเร่งความเร็วในการสร้าง UI จาก Vision สู่โค้ดที่สมบูรณ์แบบ
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <button
                onClick={() => router.push("/examples/synthesis")}
                className="w-full md:w-auto px-12 py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-fuchsia-400 transition-all"
              >
                Open Synthesis Lab
              </button>
              <button
                onClick={() => router.push("/engine")}
                className="w-full md:w-auto px-12 py-5 rounded-2xl border border-white/10 bg-white/5 font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                View History
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs uppercase tracking-tighter">
              W
            </div>
            <span className="text-xs font-mono text-gray-600 uppercase tracking-[0.4em]">
              Whisper_Neural_Engine
            </span>
          </div>
          <div className="flex gap-12 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <a href="#" className="hover:text-fuchsia-500 transition-colors">
              Documentation
            </a>
            <a href="#" className="hover:text-fuchsia-500 transition-colors">
              API Reference
            </a>
            <a href="#" className="hover:text-fuchsia-500 transition-colors">
              Enterprise
            </a>
            <a href="#" className="hover:text-fuchsia-500 transition-colors">
              Status
            </a>
          </div>
          <p className="text-[10px] font-mono text-gray-700">
            © 2026 WHISPER_TECH ALL_RIGHTS_RESERVED
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-up {
          animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

function MetricBox({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center backdrop-blur-sm group hover:bg-white/[0.04] transition-all">
      <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform">
        {value}
      </p>
      <p className="text-[9px] text-fuchsia-500/50 uppercase tracking-tighter">
        {sub}
      </p>
    </div>
  );
}
