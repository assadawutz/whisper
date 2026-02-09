"use client";

import { useState, useRef } from "react";
import {
  Eye,
  Upload,
  Scan,
  Layers,
  Palette,
  Type,
  Lightbulb,
  Copy,
  Check,
  Loader2,
} from "lucide-react";

interface VisionAnalysisResult {
  description: string;
  components: {
    type: string;
    count: number;
    examples: string[];
  }[];
  layout: {
    type: string;
    sections: string[];
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    headings: string;
    body: string;
  };
  suggestions: string[];
}

export default function VisionLabPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image || !apiKey) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/vision-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: image,
          apiKey,
        }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setResult(data.analysis);
    } catch (err) {
      console.error(err);
      alert("การวิเคราะห์ล้มเหลว กรุณาลองใหม่");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Eye className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black">Whisper Vision Lab</h1>
              <p className="text-xs text-slate-500">
                AI-Powered UI Structure Analysis
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Upload & Image */}
          <div className="col-span-12 lg:col-span-5 space-y-4">
            {/* API Key Input */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                Gemini API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                image
                  ? "border-violet-500/50"
                  : "border-white/10 hover:border-white/20"
              }`}
              style={{ minHeight: 300 }}
            >
              {image ? (
                <img
                  src={image}
                  alt="Uploaded UI"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <Upload size={48} className="mb-4 opacity-50" />
                  <p className="text-sm font-medium">คลิกหรือลากภาพ UI มาวาง</p>
                  <p className="text-xs text-slate-600 mt-1">PNG, JPG, WebP</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeImage}
              disabled={!image || !apiKey || isAnalyzing}
              className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                image && apiKey && !isAnalyzing
                  ? "bg-violet-600 hover:bg-violet-500 text-white"
                  : "bg-white/5 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  กำลังวิเคราะห์...
                </>
              ) : (
                <>
                  <Scan size={18} />
                  วิเคราะห์โครงสร้าง
                </>
              )}
            </button>
          </div>

          {/* Right: Results */}
          <div className="col-span-12 lg:col-span-7 space-y-4">
            {result ? (
              <>
                {/* Description */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                  <h3 className="text-lg font-bold mb-2">
                    {result.description}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Layers size={14} />
                    <span>Layout: {result.layout.type}</span>
                  </div>
                </div>

                {/* Components */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">
                      Components พบ
                    </h4>
                    <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-1 rounded-full">
                      {result.components.reduce((a, c) => a + c.count, 0)} ชิ้น
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {result.components.map((comp, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-black/30 border border-white/5"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold capitalize">
                            {comp.type}
                          </span>
                          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                            {comp.count}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {comp.examples.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layout Sections */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Layers size={14} />
                    Layout Sections
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.layout.sections.map((section, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-xs rounded-full bg-white/5 border border-white/10"
                      >
                        {section}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Palette size={14} />
                    Color Palette
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(result.colors).map(([name, color]) => (
                      <div key={name} className="text-center">
                        <div
                          className="w-full aspect-square rounded-xl border border-white/10 mb-2"
                          style={{ backgroundColor: color }}
                        />
                        <p className="text-[10px] text-slate-500 capitalize">
                          {name}
                        </p>
                        <p className="text-xs font-mono">{color}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Type size={14} />
                    Typography
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-slate-500">Headings:</span>{" "}
                      {result.typography.headings}
                    </p>
                    <p>
                      <span className="text-slate-500">Body:</span>{" "}
                      {result.typography.body}
                    </p>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <Lightbulb size={14} />
                    Tailwind Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {result.suggestions.map((sug, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <span className="text-violet-400">•</span>
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Copy JSON */}
                <button
                  onClick={copyToClipboard}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : (
                    <Copy size={16} />
                  )}
                  {copied ? "คัดลอกแล้ว!" : "คัดลอก JSON"}
                </button>
              </>
            ) : (
              <div className="h-full flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 border-dashed p-12">
                <div className="text-center text-slate-500">
                  <Eye size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm">อัปโหลดภาพและกดวิเคราะห์</p>
                  <p className="text-xs mt-1">เพื่อดูโครงสร้าง UI อัตโนมัติ</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
