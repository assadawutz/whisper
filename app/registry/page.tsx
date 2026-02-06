"use client";

import { useState } from "react";
import { Button, Card, Badge, GradientText } from "@/components/ui";
import { showToast } from "@/engine/utils/engineHelpers";
import { engineService } from "@/engine/core/engineService";

interface Blueprint {
  id: string;
  name: string;
  type: "Layout" | "Component" | "Form";
  nodes: number;
  fidelity: string;
  date: string;
  icon: string;
}

const blueprints: Blueprint[] = [
  {
    id: "BP-001",
    name: "Hero Section",
    type: "Layout",
    nodes: 12,
    fidelity: "99.9%",
    date: "26-02-06",
    icon: "✨",
  },
  {
    id: "BP-002",
    name: "Dashboard Grid",
    type: "Component",
    nodes: 24,
    fidelity: "100%",
    date: "26-02-05",
    icon: "📊",
  },
  {
    id: "BP-003",
    name: "Login Form",
    type: "Form",
    nodes: 8,
    fidelity: "99.8%",
    date: "26-02-04",
    icon: "🔐",
  },
  {
    id: "BP-004",
    name: "Pricing Cards",
    type: "Component",
    nodes: 16,
    fidelity: "99.9%",
    date: "26-02-03",
    icon: "💎",
  },
  {
    id: "BP-005",
    name: "Navigation Bar",
    type: "Layout",
    nodes: 10,
    fidelity: "100%",
    date: "26-02-02",
    icon: "🧭",
  },
  {
    id: "BP-006",
    name: "Footer Section",
    type: "Layout",
    nodes: 14,
    fidelity: "99.7%",
    date: "26-02-01",
    icon: "🌍",
  },
];

export default function RegistryPage() {
  const [filter, setFilter] = useState<"All" | Blueprint["type"]>("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBlueprints = blueprints.filter((bp) => {
    const matchesFilter = filter === "All" || bp.type === filter;
    const matchesSearch = bp.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportBlueprint = (bp: Blueprint) => {
    showToast(`กำลัง Export ${bp.name}...`, "info");

    setTimeout(() => {
      const code = `// ${bp.name} - ${bp.id}
// Generated ${bp.date}
// Fidelity: ${bp.fidelity}

import React from 'react';

export function ${bp.name.replace(/\s+/g, "")}() {
  return (
    <div className="glass-card p-8 rounded-3xl">
      <h2 className="text-3xl font-black mb-6">${bp.name}</h2>
      <p>Generated from blueprint ${bp.id}</p>
      <p>Nodes: ${bp.nodes}</p>
    </div>
  );
}`;

      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${bp.id}-${bp.name.replace(/\s+/g, "-")}.tsx`;
      a.click();
      URL.revokeObjectURL(url);

      engineService.addTask({
        id: `export-${bp.id}-${Date.now()}`,
        category: "export",
        goal: `Export Blueprint ${bp.id}`,
        summary: `Exported ${bp.name} to TSX file`,
        outcome: "success",
        tags: ["export", "blueprint", bp.type.toLowerCase()],
      });

      showToast(`Export ${bp.name} สำเร็จ! 📥`, "success");
    }, 800);
  };

  const previewBlueprint = (bp: Blueprint) => {
    showToast(`เปิด Preview ${bp.name}`, "info");
    setTimeout(() => {
      showToast(`Preview พร้อมแล้ว! 👁️`, "success");
    }, 500);
  };

  const exportAll = () => {
    showToast("กำลัง Export ทั้งหมด...", "info");

    setTimeout(() => {
      const allCode = blueprints
        .map(
          (bp) => `// ${bp.id} - ${bp.name}
// Type: ${bp.type}
// Nodes: ${bp.nodes}
// Fidelity: ${bp.fidelity}
`,
        )
        .join("\n");

      const blob = new Blob([allCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `all-blueprints-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      showToast(`Export ${blueprints.length} Blueprints สำเร็จ! 📦`, "success");
    }, 1000);
  };

  const createNewBlueprint = () => {
    showToast("กำลังเปิด Blueprint Creator...", "info");
    setTimeout(() => {
      showToast("ไปที่หน้า Synthesis เพื่อสร้าง Blueprint ใหม่", "info");
    }, 500);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-20 pb-32 lg:pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <Badge variant="cyan">🧬 Component Registry</Badge>
            <h1 className="text-5xl md:text-7xl font-black leading-none">
              <GradientText>UI BLUEPRINTS</GradientText>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              จัดการ Blueprint ทั้งหมดที่สร้างไว้
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button
              variant="outline"
              className="flex-1 md:flex-none"
              onClick={exportAll}
            >
              📤 Export All
            </Button>
            <Button
              variant="orange"
              size="lg"
              glow
              className="flex-1 md:flex-none"
              onClick={createNewBlueprint}
            >
              ➕ New Blueprint
            </Button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 ค้นหา Blueprint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl glass-card text-lg outline-none focus:ring-4 focus:ring-orange-500/20 transition-all"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {(["All", "Layout", "Component", "Form"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                  filter === f
                    ? "bg-gradient-sunset text-white shadow-lg"
                    : "glass-card text-slate-600 hover:bg-orange-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprint Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlueprints.map((bp) => (
            <Card key={bp.id} interactive className="group space-y-6">
              <div className="flex justify-between items-start">
                <div className="text-5xl group-hover:scale-110 transition-transform">
                  {bp.icon}
                </div>
                <Badge variant="glass">{bp.id}</Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black">{bp.name}</h3>
                <p className="text-sm text-slate-500 uppercase tracking-wider">
                  {bp.type} Blueprint
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-orange-100">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Nodes</p>
                  <p className="text-xl font-black text-orange-500">
                    {bp.nodes}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Fidelity</p>
                  <p className="text-xl font-black text-green-500">
                    {bp.fidelity}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400">สร้างเมื่อ {bp.date}</p>

              <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    previewBlueprint(bp);
                  }}
                >
                  👁️ Preview
                </Button>
                <Button
                  variant="orange"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportBlueprint(bp);
                  }}
                >
                  📥 Export
                </Button>
              </div>
            </Card>
          ))}

          {/* Add New Card */}
          <Card
            className="group cursor-pointer hover:border-orange-300 transition-all border-2 border-dashed border-orange-100 flex flex-col items-center justify-center min-h-[350px] space-y-6"
            onClick={createNewBlueprint}
          >
            <div className="text-7xl text-orange-300 group-hover:text-orange-500 group-hover:scale-110 transition-all">
              ➕
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-600 mb-2">
                สร้าง Blueprint ใหม่
              </p>
              <p className="text-sm text-slate-400">
                อัพโหลดภาพหรือเริ่มต้นจากเทมเพลต
              </p>
            </div>
          </Card>
        </div>

        {filteredBlueprints.length === 0 && (
          <Card className="p-20 text-center space-y-6">
            <div className="text-8xl opacity-30">🔍</div>
            <div>
              <p className="text-xl font-bold text-slate-600 mb-2">
                ไม่พบ Blueprint
              </p>
              <p className="text-slate-400">
                ลองค้นหาด้วยคำอื่นหรือเปลี่ยนตัวกรอง
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
