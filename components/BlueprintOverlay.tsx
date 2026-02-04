"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

function computeScale(containerWidth: number, bpW: number) {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) return 1;
  if (!Number.isFinite(bpW) || bpW <= 0) return 1;
  const s = containerWidth / bpW;
  return Math.round(s * 10000) / 10000;
}

export interface BlueprintOverlayProps {
  src: string;
  width: number;
  height: number;
  onCanvasReady?: (ctx: CanvasRenderingContext2D) => void;
}

export default function BlueprintOverlay({
  src,
  width,
  height,
  onCanvasReady,
}: BlueprintOverlayProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!hostRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, []);

  const scale = useMemo(() => computeScale(containerWidth, width), [
    containerWidth,
    width,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    onCanvasReady?.(ctx);
  }, [onCanvasReady]);

  return (
    <div
      ref={hostRef}
      style={{
        width: "100%",
        aspectRatio: `${width}/${height}`,
        position: "relative",
      }}
    >
      <div
        style={{
          width,
          height,
          position: "absolute",
          left: 0,
          top: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <img
          src={src}
          width={width}
          height={height}
          style={{ position: "absolute", left: 0, top: 0 }}
          draggable={false}
          alt="Blueprint"
        />
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ position: "absolute", left: 0, top: 0 }}
        />
      </div>
    </div>
  );
}
