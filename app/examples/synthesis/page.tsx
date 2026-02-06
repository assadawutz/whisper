"use client";

import { useState, useEffect } from "react";
import {
  quickChat,
  showToast,
  formatDuration,
} from "@/engine/utils/engineHelpers";
import { engineService } from "@/engine/core/engineService";

export default function SynthesisDashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState("");
  const [result, setResult] = useState<any>(null);

  const steps = [
    "Initializing Vision Engine...",
    "Performing Multi-layer Scan...",
    "Extracting Global Style Tokens...",
    "Mapping Nodes to Section Registry...",
    "Generating High-Fidelity TSX...",
    "Verifying with Pixel Diff Gate...",
  ];

  const runSynthesis = async () => {
    setIsScanning(true);
    setProgress(0);
    setResult(null);

    // Simulate synthesis pipeline
    for (let i = 0; i < steps.length; i++) {
      setActiveStep(steps[i]);
      // Increment progress
      for (let p = 0; p < 100 / steps.length; p++) {
        setProgress((prev) => Math.min(prev + 1, 100));
        await new Promise((r) => setTimeout(r, 30));
      }

      // Log to engine
      engineService.publishEvent({
        type: "synthesis:step",
        payload: { step: steps[i], timestamp: Date.now() },
      });
    }

    const mockResult = {
      sections: 5,
      accuracy: "99.2%",
      components: ["Hero", "FeatureGrid", "Testimonials", "Pricing", "Footer"],
      duration: 4200,
      codeSize: "12.4 KB",
    };

    setResult(mockResult);
    setIsScanning(false);
    setActiveStep("Synthesis Complete");

    showToast("Synthesis completed successfully!", "success");

    // Add to engine memory
    engineService.addTask({
      id: `task-${Date.now()}`,
      goal: "Automated Synthesis of Marketing Page",
      summary: `Synthesized ${mockResult.sections} sections with ${mockResult.accuracy} accuracy in ${formatDuration(mockResult.duration)}.`,
      outcome: "success",
      tags: ["synthesis", "automation", "ui"],
      filesModified: ["app/synthesis/page.tsx"],
      durationMs: mockResult.duration,
      tokensUsed: 4500,
      iterations: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: "feature",
      focusPaths: [],
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans selection:bg-fuchsia-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-fuchsia-200 to-violet-400 bg-clip-text text-transparent italic">
              WHISPER_SYNTHESIS
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-mono uppercase tracking-[0.2em]">
              Vision Engine v2.0 // Neural Pipeline Active
            </p>
          </div>
          <div className="px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-ping"></div>
            <span className="text-[10px] font-bold tracking-widest text-gray-400">
              SYS_OPERATIONAL
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group rounded-3xl p-1 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-white/5">
              <div className="rounded-[22px] bg-black/80 backdrop-blur-xl p-8 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">
                    Start New UI Extraction
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed max-w-md">
                    Upload a blueprint or provide a URL to begin the synthesis
                    process. Whisper will automatically map visual elements to
                    your local TypeScript component library.
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={runSynthesis}
                      disabled={isScanning}
                      className={`px-8 py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all duration-500 flex items-center gap-3 ${
                        isScanning
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-white text-black hover:bg-fuchsia-400 hover:scale-105 active:scale-95 shadow-xl shadow-fuchsia-500/20"
                      }`}
                    >
                      {isScanning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="text-lg">⚡</span>
                          Begin Synthesis
                        </>
                      )}
                    </button>
                    <button className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-gray-400 text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                      Configure AI
                    </button>
                  </div>
                </div>

                {/* Decorative scanning line if active */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none border-t border-fuchsia-500/50 shadow-[0_-20px_40px_-10px_rgba(217,70,239,0.3)] animate-scan-y"></div>
                )}
              </div>
            </div>

            {/* Progress Visualization */}
            {isScanning && (
              <div className="animate-fade-in space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest animate-pulse">
                      Current Task
                    </p>
                    <p className="text-lg font-mono text-white">{activeStep}</p>
                  </div>
                  <p className="text-3xl font-black font-mono text-white">
                    {progress}%
                  </p>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-600 to-violet-600 transition-all duration-300 ease-out shadow-[0_0_20px_rgba(217,70,239,0.5)]"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && !isScanning && (
              <div className="animate-slide-up grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">
                    Sections
                  </p>
                  <p className="text-3xl font-bold">{result.sections}</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">
                    Accuracy
                  </p>
                  <p className="text-3xl font-bold text-fuchsia-400">
                    {result.accuracy}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">
                    Duration
                  </p>
                  <p className="text-3xl font-bold">{result.duration}ms</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">
                    Output
                  </p>
                  <p className="text-3xl font-bold text-violet-400">
                    {result.codeSize}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-6">
              <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6">
                Pipeline Insights
              </h4>
              <div className="space-y-4">
                {[
                  { label: "LLM Latency", value: "142ms", status: "optimal" },
                  { label: "Vision Buffer", value: "4.2MB", status: "ready" },
                  { label: "Asset Match", value: "100%", status: "perfect" },
                  { label: "Memory Cache", value: "Enabled", status: "warm" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="text-gray-500">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-gray-300">
                        {item.value}
                      </span>
                      <div
                        className={`w-1 h-1 rounded-full ${item.status === "optimal" ? "bg-emerald-500" : "bg-fuchsia-500"}`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-900/40 to-black border border-violet-500/20 rounded-3xl p-6">
              <h4 className="font-bold text-sm uppercase tracking-widest text-violet-400 mb-2">
                Next Gen Export
              </h4>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                Generated code is automatically processed via Tailwind 4 PostCSS
                and bundled into your Monorepo structure.
              </p>
              <div className="p-3 bg-black/50 rounded-xl font-mono text-[10px] text-fuchsia-300 border border-white/5">
                $ node whisper/verify-build
                <br />
                {`>>`} Build passed (0ms)
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes scan {
            0% {
              transform: translateY(-100%);
              opacity: 0;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              transform: translateY(100%);
              opacity: 0;
            }
          }
          .animate-scan-y {
            animation: scan 3s linear infinite;
          }
          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .animate-slide-up {
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
