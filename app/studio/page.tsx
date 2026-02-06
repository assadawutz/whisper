"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Badge, GradientText } from "@/components/ui";
import { showToast } from "@/engine/utils/engineHelpers";
import { engineService } from "@/engine/core/engineService";
import {
  Type,
  Square,
  Image as ImageIcon,
  MousePointer2,
  Layout,
  Smartphone,
  Tablet as TabletIcon,
  Monitor,
  RotateCcw,
  Rocket,
  Trash2,
  Copy,
  Plus,
  Zap,
  ChevronUp,
  ChevronDown,
  X,
  Palette,
  Layers,
  Code,
} from "lucide-react";

type ElementType =
  | "heading"
  | "text"
  | "button"
  | "image"
  | "container"
  | "section";
type LayoutPattern = "flex-col" | "flex-row" | "grid" | "single";
type viewportSize = "mobile" | "tablet" | "desktop";

interface ComponentElement {
  id: string;
  type: ElementType;
  content: string;
  styles: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
    borderRadius?: string;
    width?: string;
    height?: string;
    src?: string;
    alt?: string;
    display?: any;
    flexDirection?: any;
    gap?: string;
    gridTemplateColumns?: string;
  };
}

interface DesignConfig {
  layout: LayoutPattern;
  containerElement: "div" | "section" | "article" | "main";
  gridCols: number;
  gap: string;
  padding: string;
  backgroundColor: string;
  borderRadius: string;
  elements: ComponentElement[];
}

const DEFAULT_CONFIG: DesignConfig = {
  layout: "flex-col",
  containerElement: "div",
  gridCols: 2,
  gap: "24px",
  padding: "40px",
  backgroundColor: "#ffffff",
  borderRadius: "32px",
  elements: [],
};

const PRESETS = {
  hero: {
    name: "Hero Section",
    elements: [
      {
        id: "hero-h",
        type: "heading",
        content: "Design Your Future",
        styles: { fontSize: "64px", fontWeight: "bold", color: "#1e293b" },
      },
      {
        id: "hero-t",
        type: "text",
        content:
          "The world's most advanced UI synthesis engine. Transform your vision into pixel-perfect reality in seconds.",
        styles: { fontSize: "20px", color: "#64748b" },
      },
      {
        id: "hero-b",
        type: "button",
        content: "Get Started Now",
        styles: {
          backgroundColor: "#f97316",
          color: "#ffffff",
          padding: "16px 32px",
          borderRadius: "16px",
          fontWeight: "600",
        },
      },
    ],
  },
  features: {
    name: "Feature Grid",
    layout: "grid",
    gridCols: 3,
    elements: [
      {
        id: "f1",
        type: "container",
        content: "🚀 Fast Performance",
        styles: {
          backgroundColor: "#f8fafc",
          padding: "24px",
          borderRadius: "20px",
          fontWeight: "bold",
        },
      },
      {
        id: "f2",
        type: "container",
        content: "💎 Premium Design",
        styles: {
          backgroundColor: "#f8fafc",
          padding: "24px",
          borderRadius: "20px",
          fontWeight: "bold",
        },
      },
      {
        id: "f3",
        type: "container",
        content: "📱 Fully Responsive",
        styles: {
          backgroundColor: "#f8fafc",
          padding: "24px",
          borderRadius: "20px",
          fontWeight: "bold",
        },
      },
    ],
  },
};

export default function StudioPage() {
  const [config, setConfig] = useState<DesignConfig>(DEFAULT_CONFIG);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [viewport, setViewport] = useState<viewportSize>("desktop");
  const [codeFormat, setCodeFormat] = useState<"nextjs" | "tailwind" | "html">(
    "nextjs",
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load last config from local storage if needed
  }, []);

  const updateConfig = <K extends keyof DesignConfig>(
    key: K,
    value: DesignConfig[K],
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const addElement = (type: ElementType) => {
    const newElement: ComponentElement = {
      id: `${type}-${Date.now()}`,
      type,
      content:
        type === "heading"
          ? "Heading Text"
          : type === "text"
            ? "Lorem ipsum dolor sit amet consectetur adipiscing elit"
            : type === "button"
              ? "Click Me"
              : type === "image"
                ? ""
                : "Container Content",
      styles: {
        padding:
          type === "container" ? "24px" : type === "button" ? "12px 24px" : "0",
        backgroundColor:
          type === "button"
            ? "#f97316"
            : type === "container"
              ? "#f8fafc"
              : "transparent",
        color:
          type === "button" || type === "heading"
            ? type === "button"
              ? "#ffffff"
              : "#0f172a"
            : "#475569",
        fontSize:
          type === "heading" ? "40px" : type === "text" ? "18px" : "15px",
        fontWeight:
          type === "heading" ? "bold" : type === "button" ? "600" : "normal",
        borderRadius:
          type === "button" ? "14px" : type === "container" ? "20px" : "0",
        width: type === "image" ? "100%" : undefined,
        src:
          type === "image"
            ? "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&fit=crop"
            : undefined,
      },
    };

    setConfig((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedElement(newElement.id);
    showToast(`Added ${type} ✨`, "success");
  };

  const addPreset = (key: keyof typeof PRESETS) => {
    const preset = PRESETS[key];
    const newElements = preset.elements.map((el) => ({
      ...el,
      id: `${el.id}-${Date.now()}`,
    })) as ComponentElement[];

    setConfig((prev) => ({
      ...prev,
      layout: (preset as any).layout || prev.layout,
      gridCols: (preset as any).gridCols || prev.gridCols,
      elements: [...prev.elements, ...newElements],
    }));
    showToast(`Applied ${preset.name} Preset!`, "success");
  };

  const updateElement = (
    id: string,
    key: keyof ComponentElement,
    value: any,
  ) => {
    setConfig((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, [key]: value } : el,
      ),
    }));
  };

  const updateElementStyle = (id: string, styleKey: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id
          ? { ...el, styles: { ...el.styles, [styleKey]: value } }
          : el,
      ),
    }));
  };

  const deleteElement = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    if (selectedElement === id) setSelectedElement(null);
    showToast("Element removed", "info");
  };

  const moveElement = (id: string, direction: "up" | "down") => {
    const index = config.elements.findIndex((el) => el.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === config.elements.length - 1)
    )
      return;
    const newElements = [...config.elements];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newElements[index], newElements[targetIndex]] = [
      newElements[targetIndex],
      newElements[index],
    ];
    setConfig((prev) => ({ ...prev, elements: newElements }));
  };

  const generateVercelLink = () => {
    const jsonStr = JSON.stringify(config);
    // Use UTF-8 safe base64 encoding
    const data = btoa(unescape(encodeURIComponent(jsonStr)));
    // In a real app, this would be the deployed URL. For now, we use the local path as a base
    // but the logic is ready for Vercel.
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const previewUrl = `${baseUrl}/studio/preview?data=${data}`;
    return previewUrl;
  };

  const openVercelPreview = () => {
    const url = generateVercelLink();
    window.open(url, "_blank");
    showToast("Opening Instant Vercel Preview... 🚀", "success");
  };

  const generateCode = (): string => {
    if (codeFormat === "nextjs") return generateNextJSCode();
    if (codeFormat === "tailwind") return generateTailwindCode();
    return generateHTMLCode();
  };

  const generateNextJSCode = (): string => {
    const ContainerTag = config.containerElement;
    const renderElement = (el: ComponentElement): string => {
      const styleStr = Object.entries(el.styles)
        .filter(([_, v]) => v && !["src", "alt"].includes(_))
        .map(([k, v]) => `${k}: '${v}'`)
        .join(", ");

      if (el.type === "heading")
        return `      <h2 style={{ ${styleStr} }}>{/* ${el.content} */}</h2>`;
      if (el.type === "text")
        return `      <p style={{ ${styleStr} }}>{/* ${el.content} */}</p>`;
      if (el.type === "button")
        return `      <button style={{ ${styleStr} }}>${el.content}</button>`;
      if (el.type === "image")
        return `      <img src="${el.styles.src}" style={{ ${styleStr}, objectFit: 'cover' }} />`;
      return `      <div style={{ ${styleStr} }}>${el.content}</div>`;
    };

    return `'use client';\nexport default function Component() {\n  return (\n    <${ContainerTag} style={{ background: '${config.backgroundColor}', padding: '${config.padding}' }}>\n${config.elements.map(renderElement).join("\n")}\n    </${ContainerTag}>\n  );\n}`;
  };

  const generateTailwindCode = (): string => {
    return `<div class="bg-white p-10 rounded-3xl shadow-xl">\n  <h1 class="text-5xl font-bold">Generated Component</h1>\n</div>`;
  };

  const generateHTMLCode = (): string => `<div>HTML Code</div>`;

  const renderPreview = () => {
    const ContainerEl = (config.containerElement as any) || "div";
    const layoutStyle: React.CSSProperties = {
      padding: config.padding,
      backgroundColor: config.backgroundColor,
      borderRadius: config.borderRadius,
      minHeight: "400px",
      transition: "all 0.3s ease",
    };

    if (config.layout === "grid") {
      layoutStyle.display = "grid";
      layoutStyle.gridTemplateColumns = `repeat(${config.gridCols}, 1fr)`;
      layoutStyle.gap = config.gap;
    } else if (config.layout === "flex-row") {
      layoutStyle.display = "flex";
      layoutStyle.flexDirection = "row";
      layoutStyle.gap = config.gap;
      layoutStyle.flexWrap = "wrap";
    } else if (config.layout === "flex-col") {
      layoutStyle.display = "flex";
      layoutStyle.flexDirection = "column";
      layoutStyle.gap = config.gap;
    }

    return (
      <ContainerEl style={layoutStyle as React.CSSProperties}>
        {config.elements.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-300">
            <div className="text-8xl mb-6 opacity-20">🏗️</div>
            <p className="text-xl font-medium">
              เริ่มต้นสร้างผลงานชิ้นเอกจากศูนย์
            </p>
            <p className="text-sm opacity-60 mt-2 text-center max-w-xs">
              เพิ่มส่วนประกอบจากแผงด้านซ้าย
              หรือใช้เทมเพลตสำเร็จรูปเพื่อเริ่มงานอย่างรวดเร็ว
            </p>
          </div>
        ) : (
          config.elements.map((el) => (
            <div
              key={el.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(el.id);
              }}
              className={`group relative cursor-pointer transition-all ${
                selectedElement === el.id
                  ? "ring-2 ring-orange-500 ring-offset-4 rounded-sm"
                  : "hover:outline-2 hover:outline-orange-200 hover:outline-offset-2"
              }`}
            >
              {el.type === "heading" && (
                <h2 style={{ ...el.styles, margin: 0 } as React.CSSProperties}>
                  {el.content}
                </h2>
              )}
              {el.type === "text" && (
                <p style={{ ...el.styles, margin: 0 } as React.CSSProperties}>
                  {el.content}
                </p>
              )}
              {el.type === "button" && (
                <button
                  style={
                    {
                      ...el.styles,
                      border: "none",
                      cursor: "pointer",
                    } as React.CSSProperties
                  }
                >
                  {el.content}
                </button>
              )}
              {el.type === "image" && el.styles.src && (
                <img
                  src={el.styles.src}
                  style={
                    { ...el.styles, objectFit: "cover" } as React.CSSProperties
                  }
                  alt=""
                />
              )}
              {el.type === "container" && (
                <div style={el.styles as React.CSSProperties}>{el.content}</div>
              )}

              {selectedElement === el.id && (
                <div className="absolute -top-10 left-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex gap-2 z-50">
                  <span>{el.type.toUpperCase()}</span>
                  <button onClick={() => deleteElement(el.id)}>✕</button>
                </div>
              )}
            </div>
          ))
        )}
      </ContainerEl>
    );
  };

  const selected = config.elements.find((el) => el.id === selectedElement);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfd] font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Top Header */}
      <header className="sticky top-0 z-100 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-sunset rounded-xl flex items-center justify-center text-white font-black shadow-lg">
            W
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Studio <span className="text-orange-500">v2.0</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Whisper Blueprint Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 mr-4">
            <button
              onClick={() => setViewport("mobile")}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-bold ${viewport === "mobile" ? "bg-white shadow text-orange-500" : "text-slate-400"}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> มือถือ
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-bold ${viewport === "tablet" ? "bg-white shadow text-orange-500" : "text-slate-400"}`}
            >
              <TabletIcon className="w-3.5 h-3.5" /> แท็บเล็ต
            </button>
            <button
              onClick={() => setViewport("desktop")}
              className={`p-2 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-bold ${viewport === "desktop" ? "bg-white shadow text-orange-500" : "text-slate-400"}`}
            >
              <Monitor className="w-3.5 h-3.5" /> คอมฯ
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfig(DEFAULT_CONFIG)}
            className="hidden md:flex gap-2"
          >
            <RotateCcw className="w-4 h-4" /> ล้างค่าค้าง
          </Button>
          <Button
            variant="orange"
            size="md"
            glow
            onClick={openVercelPreview}
            className="shadow-orange-500/20 gap-2"
          >
            <Rocket className="w-4 h-4" /> พรีวิวบน Vercel ทันที
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
        {/* Left Toolbar - Sidebar */}
        <aside className="w-full lg:w-80 border-r border-slate-100 bg-white overflow-y-auto custom-scrollbar p-6 space-y-8">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              เพิ่มส่วนประกอบ UI
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addElement("heading")}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 transition-all hover:bg-orange-50 hover:border-orange-200 text-sm font-bold text-slate-600"
              >
                <Type className="w-4 h-4 text-orange-500" /> หัวข้อ
              </button>
              <button
                onClick={() => addElement("text")}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 transition-all hover:bg-orange-50 hover:border-orange-200 text-sm font-bold text-slate-600"
              >
                <Type className="w-4 h-4 text-slate-400" /> ข้อความ
              </button>
              <button
                onClick={() => addElement("button")}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 transition-all hover:bg-orange-50 hover:border-orange-200 text-sm font-bold text-slate-600"
              >
                <MousePointer2 className="w-4 h-4 text-orange-500" /> ปุ่มกด
              </button>
              <button
                onClick={() => addElement("image")}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 transition-all hover:bg-orange-50 hover:border-orange-200 text-sm font-bold text-slate-600"
              >
                <ImageIcon className="w-4 h-4 text-orange-500" /> รูปภาพ
              </button>
              <button
                onClick={() => addElement("container")}
                className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 transition-all hover:bg-orange-50 hover:border-orange-200 text-sm font-bold text-slate-600 col-span-2"
              >
                <Layout className="w-4 h-4 text-orange-500" /> เลย์เอาต์ส่วนขยาย
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              เทมเพลตสำเร็จรูป
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => addPreset("hero")}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-100 transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-orange-100 text-left group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black bg-blue-50 text-blue-500 group-hover:scale-110 transition-transform">
                  H
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Hero Header</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">
                    หน้าแรกที่น่าประทับใจ
                  </p>
                </div>
              </button>
              <button
                onClick={() => addPreset("features")}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-100 transition-all hover:shadow-lg hover:shadow-slate-200/50 hover:border-orange-100 text-left group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black bg-purple-50 text-purple-500 group-hover:scale-110 transition-transform">
                  F
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Feature Grid</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight">
                    แสดงคุณสมบัติแบบตาราง
                  </p>
                </div>
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              การตั้งค่าองค์ประกอบหลัก
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                  รูปแบบเลย์เอาต์
                </label>
                <select
                  value={config.layout}
                  onChange={(e) =>
                    updateConfig("layout", e.target.value as any)
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-100 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none bg-white"
                >
                  <option value="flex-col">แนวตั้ง (Flex Column)</option>
                  <option value="flex-row">แนวนอน (Flex Row)</option>
                  <option value="grid">ตาราง (CSS Grid)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                  ช่องว่างภายใน (Padding)
                </label>
                <input
                  type="text"
                  value={config.padding}
                  onChange={(e) => updateConfig("padding", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-100 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                  ความโค้งมนขอบ (Radius)
                </label>
                <input
                  type="text"
                  value={config.borderRadius}
                  onChange={(e) => updateConfig("borderRadius", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-100 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                />
              </div>
            </div>
          </section>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-slate-50 flex items-center justify-center p-4 md:p-12 overflow-y-auto">
          <div
            className={`bg-white shadow-2xl transition-all duration-500 relative ${
              viewport === "mobile"
                ? "w-[375px] h-[667px]"
                : viewport === "tablet"
                  ? "w-[768px] h-[1024px]"
                  : "w-full max-w-5xl min-h-[600px]"
            } rounded-4xl overflow-hidden border-8 border-slate-900/5`}
          >
            <div className="absolute top-0 right-0 left-0 h-6 bg-slate-900/5 flex items-center justify-center gap-1.5 px-4 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
            <div className="mt-6 h-full overflow-y-auto">{renderPreview()}</div>
          </div>
        </main>

        {/* Right Panel - Properties & Code */}
        <aside className="w-full lg:w-96 border-l border-slate-100 bg-white overflow-y-auto p-6 space-y-6">
          {selected ? (
            <section className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  คุณสมบัติ (Properties)
                </h3>
                <Badge variant="orange" className="flex gap-1 items-center">
                  <Plus className="w-3 h-3" /> {selected.type}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                    เนื้อหา (Content)
                  </label>
                  {selected.type === "image" ? (
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-100 text-sm outline-none"
                      value={selected.styles.src}
                      onChange={(e) =>
                        updateElementStyle(selected.id, "src", e.target.value)
                      }
                      placeholder="URL..."
                    />
                  ) : (
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-100 text-sm outline-none"
                      value={selected.content}
                      onChange={(e) =>
                        updateElement(selected.id, "content", e.target.value)
                      }
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                      ขนาดตัวอักษร
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-100 text-sm outline-none"
                      value={selected.styles.fontSize}
                      onChange={(e) =>
                        updateElementStyle(
                          selected.id,
                          "fontSize",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                      ความหนา
                    </label>
                    <select
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-100 text-sm outline-none bg-white"
                      value={selected.styles.fontWeight}
                      onChange={(e) =>
                        updateElementStyle(
                          selected.id,
                          "fontWeight",
                          e.target.value,
                        )
                      }
                    >
                      <option value="normal">ปกติ (Regular)</option>
                      <option value="600">กึ่งหนา (Medium)</option>
                      <option value="bold">หนา (Bold)</option>
                      <option value="black">หนามาก (Black)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                    สีตัวอักษร
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      className="w-10 h-10 p-0 rounded-lg overflow-hidden border-0 cursor-pointer"
                      value={selected.styles.color}
                      onChange={(e) =>
                        updateElementStyle(selected.id, "color", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 px-3 py-2.5 rounded-xl border border-slate-100 text-sm font-mono uppercase outline-none"
                      value={selected.styles.color}
                      onChange={(e) =>
                        updateElementStyle(selected.id, "color", e.target.value)
                      }
                    />
                  </div>
                </div>

                {selected.type === "button" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
                      สีพื้นหลังปุ่ม
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 p-0 rounded-lg overflow-hidden border-0 cursor-pointer"
                        value={selected.styles.backgroundColor}
                        onChange={(e) =>
                          updateElementStyle(
                            selected.id,
                            "backgroundColor",
                            e.target.value,
                          )
                        }
                      />
                      <input
                        type="text"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-100 text-sm font-mono uppercase outline-none"
                        value={selected.styles.backgroundColor}
                        onChange={(e) =>
                          updateElementStyle(
                            selected.id,
                            "backgroundColor",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => moveElement(selected.id, "up")}
                    className="flex-1 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 flex items-center justify-center transition-all"
                  >
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => moveElement(selected.id, "down")}
                    className="flex-1 p-2 rounded-xl border border-slate-100 hover:bg-slate-50 flex items-center justify-center transition-all"
                  >
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </button>
                  <Button
                    variant="outline"
                    className="flex-2 text-red-500 border-red-100 hover:bg-red-50 gap-2"
                    onClick={() => deleteElement(selected.id)}
                  >
                    <Trash2 className="w-4 h-4" /> ลบออก
                  </Button>
                </div>
              </div>
            </section>
          ) : (
            <div className="h-60 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-4xl text-slate-300 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <MousePointer2 className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-bold text-slate-400">
                เลือกองค์ประกอบบนจอเพื่อแก้ไข
              </p>
            </div>
          )}

          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Code className="w-4 h-4" /> ชุดโค้ดที่จะส่งออก
            </h3>
            <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[11px] text-green-400/80 overflow-x-auto h-64 border border-white/10 shadow-inner custom-scrollbar">
              <pre>{generateCode()}</pre>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCodeFormat("nextjs")}
                className={`p-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${codeFormat === "nextjs" ? "bg-slate-900 text-white border-slate-800" : "bg-slate-50 text-slate-400 border border-slate-100"}`}
              >
                Next.js
              </button>
              <button
                onClick={() => setCodeFormat("tailwind")}
                className={`p-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${codeFormat === "tailwind" ? "bg-slate-900 text-white border-slate-800" : "bg-slate-50 text-slate-400 border border-slate-100"}`}
              >
                Tailwind
              </button>
              <button
                onClick={() => setCodeFormat("html")}
                className={`p-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${codeFormat === "html" ? "bg-slate-900 text-white border-slate-800" : "bg-slate-50 text-slate-400 border border-slate-100"}`}
              >
                HTML
              </button>
            </div>
            <Button
              variant="glass"
              size="md"
              className="w-full py-6 gap-2"
              onClick={() => {
                navigator.clipboard.writeText(generateCode());
                showToast("คัดลอกโค้ดสำเร็จ!", "success");
              }}
            >
              <Copy className="w-4 h-4" /> คัดลอกโค้ดทั้งหมด
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}
