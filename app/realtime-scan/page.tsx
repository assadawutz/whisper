"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  for (let x = width - step; x >= 0; x -= step)
    points.push({ x, y: height });
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
  const inspectedRef = useRef(new Set<number>());

  const imageRef = useRef<HTMLImageElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const diffRef = useRef<HTMLCanvasElement | null>(null);

  const handleUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.files?.[0];
      if (!next) return;
      const url = URL.createObjectURL(next);
      setFileUrl(url);
      setStatus("Decoding image...");
    },
    [],
  );

  useEffect(() => {
    if (!fileUrl || !imageRef.current) return;
    const img = imageRef.current;
    const onLoad = async () => {
      setImageSize({ w: img.naturalWidth, h: img.naturalHeight });
      setStatus("Loading OpenCV...");
      await loadOpenCV();
      setStatus("Building edge map...");

      const w = window as typeof window & { cv?: any };
      if (!w.cv) {
        setStatus("OpenCV failed to load.");
        return;
      }

      const src = w.cv.imread(img);
      const gray = new w.cv.Mat();
      const edges = new w.cv.Mat();
      w.cv.cvtColor(src, gray, w.cv.COLOR_RGBA2GRAY, 0);
      w.cv.Canny(gray, edges, 80, 160, 3, false);

      const edgeData = new Uint8Array(edges.data);
      setEdgeMap(edgeData);

      src.delete();
      gray.delete();
      edges.delete();

      setStatus("Locked 1:1. Ready to scan.");
    };
    img.addEventListener("load", onLoad);
    return () => img.removeEventListener("load", onLoad);
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
      if (delta > 60) {
        last = time;
        setScanIndex((prev) => {
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

    const radius = Math.max(6, Math.round(Math.min(imageSize.w, imageSize.h) / 80));
    const loop = buildLocalLoop(current, radius, 24);
    setScanPath((prev) => {
      const next = [...prev];
      next.splice(scanIndex + 1, 0, ...loop);
      return next;
    });
  }, [scanIndex, scanPath, drawFrame, edgeAt, imageSize]);

  const ready = useMemo(() => imageSize.w > 0 && imageSize.h > 0, [imageSize]);

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-xl font-semibold">Realtime Scan Overlay (OpenCV)</h1>
          <p className="text-sm text-white/60">
            Upload an image to lock 1:1, render the overlay path, and preview the
            diff in realtime.
          </p>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="text-sm"
            />
            <span className="text-xs text-white/70">{status}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-2">
              Source (Locked 1:1)
            </p>
            <div className="relative">
              {fileUrl && (
                <img
                  ref={imageRef}
                  src={fileUrl}
                  alt="Uploaded"
                  className="w-full h-auto rounded-lg"
                />
              )}
              {!fileUrl && (
                <div className="h-64 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-xs text-white/50">
                  Upload an image to begin
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-2">
              Overlay Scan Path
            </p>
            <div className="relative">
              {ready && (
                <canvas
                  ref={overlayRef}
                  width={imageSize.w}
                  height={imageSize.h}
                  className="w-full h-auto rounded-lg bg-black"
                />
              )}
              {!ready && (
                <div className="h-64 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-xs text-white/50">
                  Waiting for lock
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-2">
              Diff Overlay Preview
            </p>
            <div className="relative">
              {ready && (
                <canvas
                  ref={diffRef}
                  width={imageSize.w}
                  height={imageSize.h}
                  className="w-full h-auto rounded-lg bg-black"
                />
              )}
              {!ready && (
                <div className="h-64 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-xs text-white/50">
                  Waiting for scan
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
