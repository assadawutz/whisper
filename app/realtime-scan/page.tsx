"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { quickChat, showToast } from "@/engine/utils/engineHelpers";

type ScanPoint = { x: number; y: number };

const OPENCV_URL = "https://docs.opencv.org/4.x/opencv.js";

function loadOpenCV(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject();
    const w = window as typeof window & { cv?: any };
    if (w.cv && w.cv.imread) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src=\"${OPENCV_URL}\"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
      return;
    }
    const script = document.createElement("script");
    script.src = OPENCV_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}

function buildBorderPath(width: number, height: number, step: number) {
  const points: ScanPoint[] = [];
  for (let x = 0; x <= width; x += step) points.push({ x, y: 0 });
  for (let y = step; y <= height; y += step) points.push({ x: width, y });
  for (let x = width - step; x >= 0; x -= step) points.push({ x, y: height });
  for (let y = height - step; y > 0; y -= step) points.push({ x: 0, y });
  return points;
}

function buildGridSerpentine(width: number, height: number, cells = 12) {
  const points: ScanPoint[] = [];
  const cellW = width / cells;
  const cellH = height / cells;
  for (let row = 0; row < cells; row += 1) {
    const leftToRight = row % 2 === 0;
    if (leftToRight) {
      for (let col = 0; col < cells; col += 1) {
        points.push({ x: (col + 0.5) * cellW, y: (row + 0.5) * cellH });
      }
    } else {
      for (let col = cells - 1; col >= 0; col -= 1) {
        points.push({ x: (col + 0.5) * cellW, y: (row + 0.5) * cellH });
      }
    }
  }
  return points;
}

function buildLocalLoop(center: ScanPoint, radius: number, steps = 24) {
  const points: ScanPoint[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = (Math.PI * 2 * i) / steps;
    points.push({
      x: center.x + Math.cos(t) * radius,
      y: center.y + Math.sin(t) * radius,
    });
  }
  return points;
}

export default function RealtimeScanPage() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const [status, setStatus] = useState("Waiting for upload...");
  const [edgeMap, setEdgeMap] = useState<Uint8Array | null>(null);
  const [scanPath, setScanPath] = useState<ScanPoint[]>([]);
  const [scanIndex, setScanIndex] = useState(0);
  const [code, setCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const inspectedRef = useRef(new Set<number>());

  const imageRef = useRef<HTMLImageElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const diffRef = useRef<HTMLCanvasElement | null>(null);

  const handleUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.files?.[0];
      if (!next) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        setFileUrl(e.target?.result as string);
        setStatus("Decoding image...");
      };
      reader.readAsDataURL(next);
    },
    [],
  );

  useEffect(() => {
    if (!fileUrl || !imageRef.current) return;
    const img = imageRef.current;

    // Check if OpenCV is ready first to prevent premature access
    const processImage = () => {
      const w = window as typeof window & { cv?: any };
      if (!w.cv) {
        setStatus("OpenCV failed to load.");
        return;
      }

      try {
        const src = w.cv.imread(img);
        const gray = new w.cv.Mat();
        const edges = new w.cv.Mat();
        w.cv.cvtColor(src, gray, w.cv.COLOR_RGBA2GRAY, 0);
        w.cv.Canny(gray, edges, 80, 160, 3, false);

        const edgeData = new Uint8Array(edges.data);
        setEdgeMap(edgeData);
        setImageSize({ w: img.naturalWidth, h: img.naturalHeight });

        src.delete();
        gray.delete();
        edges.delete();

        setStatus("Locked 1:1. Ready to scan.");
      } catch (e) {
        console.error("OpenCV error", e);
        setStatus("Error processing image");
      }
    };

    const onLoad = async () => {
      setStatus("Loading OpenCV...");
      await loadOpenCV();
      setStatus("Building edge map...");
      // Add short delay to ensure image is painted
      setTimeout(processImage, 100);
    };

    if (img.complete) {
      onLoad();
    } else {
      img.addEventListener("load", onLoad);
      return () => img.removeEventListener("load", onLoad);
    }
  }, [fileUrl]);

  useEffect(() => {
    if (!imageSize.w || !imageSize.h) return;
    const border = buildBorderPath(
      imageSize.w,
      imageSize.h,
      Math.max(2, Math.round(Math.min(imageSize.w, imageSize.h) / 300)),
    );
    const grid = buildGridSerpentine(imageSize.w, imageSize.h, 12);
    setScanPath([...border, ...grid]);
    setScanIndex(0);
    inspectedRef.current.clear();
  }, [imageSize]);

  const edgeAt = useCallback(
    (point: ScanPoint) => {
      if (!edgeMap) return false;
      const x = Math.max(0, Math.min(imageSize.w - 1, Math.round(point.x)));
      const y = Math.max(0, Math.min(imageSize.h - 1, Math.round(point.y)));
      const idx = y * imageSize.w + x;
      return edgeMap[idx] > 0;
    },
    [edgeMap, imageSize],
  );

  const drawFrame = useCallback(() => {
    const overlay = overlayRef.current;
    const diff = diffRef.current;
    const img = imageRef.current;
    if (!overlay || !diff || !img) return;

    const ctx = overlay.getContext("2d");
    const diffCtx = diff.getContext("2d");
    if (!ctx || !diffCtx) return;

    ctx.clearRect(0, 0, overlay.width, overlay.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#00E5FF";
    ctx.beginPath();

    const endIndex = Math.min(scanIndex, scanPath.length - 1);
    for (let i = 0; i <= endIndex; i += 1) {
      const p = scanPath[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    if (scanPath[endIndex]) {
      const p = scanPath[endIndex];
      ctx.fillStyle = "#FF3B30";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    diffCtx.clearRect(0, 0, diff.width, diff.height);
    diffCtx.drawImage(img, 0, 0, diff.width, diff.height);
    diffCtx.globalCompositeOperation = "difference";
    diffCtx.drawImage(overlay, 0, 0);
    diffCtx.globalCompositeOperation = "source-over";
  }, [scanIndex, scanPath]);

  useEffect(() => {
    if (!scanPath.length) return;
    let raf = 0;
    let last = performance.now();

    const tick = (time: number) => {
      const delta = time - last;
      if (delta > 30) {
        last = time;
        setScanIndex((prev) => {
          if (prev >= scanPath.length - 1) return prev;
          const next = Math.min(prev + 1, scanPath.length - 1);
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scanPath]);

  useEffect(() => {
    if (!scanPath.length) return;
    const current = scanPath[scanIndex];
    if (!current) return;
    drawFrame();
    if (!edgeAt(current)) return;
    if (inspectedRef.current.has(scanIndex)) return;
    inspectedRef.current.add(scanIndex);

    const radius = Math.max(
      6,
      Math.round(Math.min(imageSize.w, imageSize.h) / 80),
    );
    const loop = buildLocalLoop(current, radius, 24);
    setScanPath((prev) => {
      const next = [...prev];
      // Only insert if not too many points to avoid overflowing memory/performance
      if (next.length < 5000) {
        next.splice(scanIndex + 1, 0, ...loop);
      }
      return next;
    });
  }, [scanIndex, scanPath, drawFrame, edgeAt, imageSize]);

  const ready = useMemo(() => imageSize.w > 0 && imageSize.h > 0, [imageSize]);

  const handleGenerate = async () => {
    if (!fileUrl) {
      showToast("Please upload an image first", "error");
      return;
    }

    setIsGenerating(true);
    try {
      // Construct message manually to support image part
      const message = {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: "Convert this UI screenshot into a modern, responsive React/Tailwind component. Return ONLY the code.",
          },
          { type: "image_url" as const, image_url: { url: fileUrl } },
        ],
      };

      // We use engineService via helper wrapper or direct call?
      // quickChat doesn't support array content yet, so we need to enhance quickChat or use engineService directly.
      // Let's use quickChat but we need to bypass it or update it.
      // Checking quickChat signature... only takes string.
      // So we will use engineService import.

      // Dynamic import to avoid SSR issues if any, but standard import is fine.
      const { engineService } = await import("@/engine/core/engineService");
      const response = await engineService.callLLM([message], {
        temperature: 0.2,
      });

      setCode(response.content);
      showToast("Code generation complete", "success");
    } catch (e) {
      showToast("Generation failed: " + (e as Error).message, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-3rem)]">
        {/* Left Sidebar: Controls & Info */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <h1 className="text-2xl font-bold bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Vision Studio
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              Real-time edge scanning and structural analysis.
            </p>

            <div className="space-y-4">
              <label className="block w-full cursor-pointer group">
                <div className="flex items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-white/20 group-hover:border-cyan-500/50 bg-black/20 transition-all">
                  <div className="text-center">
                    <div className="text-2xl mb-2 opacity-50">📤</div>
                    <span className="text-sm text-gray-400 group-hover:text-cyan-400">
                      Upload Image
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center justify-between text-xs text-mono bg-black/40 p-3 rounded-lg border border-white/5">
                <span className="text-gray-500">STATUS</span>
                <span
                  className={
                    status.includes("Error") ? "text-red-400" : "text-cyan-400"
                  }
                >
                  {status}
                </span>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!ready || isGenerating}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  !ready || isGenerating
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-linear-to-r from-cyan-600 to-blue-600 hover:scale-[1.02] shadow-lg shadow-cyan-900/20"
                }`}
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin">⚡</span> Generating...
                  </>
                ) : (
                  <>
                    <span>✨</span> Generate Code
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
              Analysis Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="text-xs text-gray-500 mb-1">Dimensions</div>
                <div className="font-mono text-cyan-400">
                  {imageSize.w} x {imageSize.h}
                </div>
              </div>
              <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="text-xs text-gray-500 mb-1">Scan Points</div>
                <div className="font-mono text-purple-400">
                  {scanPath.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Visualization */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex-1 rounded-2xl bg-black/50 border border-white/10 overflow-hidden relative group">
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-cyan-300 backdrop-blur-md">
              LIVE SCAN PREVIEW
            </div>

            <div className="w-full h-full flex items-center justify-center bg-[url('/grid-pattern.svg')] bg-repeat opacity-20 absolute inset-0 pointer-events-none" />

            <div className="relative w-full h-full flex items-center justify-center p-8">
              {fileUrl ? (
                <div className="relative shadow-2xl shadow-cyan-900/10">
                  {/* Base Image */}
                  <img
                    ref={imageRef}
                    src={fileUrl || ""}
                    alt="Analysis"
                    className={`max-w-full max-h-[70vh] rounded-lg ${
                      ready ? "opacity-50" : "opacity-100"
                    }`}
                  />
                  {/* Overlay Canvas */}
                  {ready && (
                    <canvas
                      ref={overlayRef}
                      width={imageSize.w}
                      height={imageSize.h}
                      className="absolute inset-0 w-full h-full mix-blend-screen pointer-events-none"
                    />
                  )}
                  {/* Diff Canvas (Hidden but used for calculation) */}
                  {ready && (
                    <canvas
                      ref={diffRef}
                      width={imageSize.w}
                      height={imageSize.h}
                      className="hidden"
                    />
                  )}
                </div>
              ) : (
                <div className="text-center text-white/20">
                  <div className="text-6xl mb-4">👁️</div>
                  <p>Upload UI image to begin structural analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Code Output */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <div className="flex-1 rounded-2xl bg-[#0F0F12] border border-white/10 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">
                GENERATED_COMPONENT.tsx
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(code)}
                className="text-xs hover:text-white text-gray-500 transition-colors"
              >
                COPY
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              {code ? (
                <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                  {code}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/10">
                  <div className="text-4xl mb-4">⚡</div>
                  <p className="text-sm">Ready to generate code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
