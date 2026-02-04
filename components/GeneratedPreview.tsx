"use client";
import type { RefObject } from "react";
import type { BlueprintSession } from "@/types/blueprint";

export function GeneratedPreview({
  session,
  previewRef,
}: {
  session: BlueprintSession | null;
  previewRef: RefObject<HTMLDivElement>;
}) {
  if (!session) return <div className="text-sm text-zinc-400">Upload an image.</div>;
  const { width, height } = session.image;

  return (
    <div className="overflow-auto rounded-lg border border-zinc-800 bg-zinc-950">
      <div
        ref={previewRef}
        className="relative bg-zinc-950"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {Array.isArray(session.nodes) &&
          session.nodes.map((n) => {
            const r = n?.rect;
            if (!r || r.w <= 0 || r.h <= 0) return null;
            return (
              <div
                key={n.id}
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10"
                style={{ left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` }}
                title={n.id}
              />
            );
          })}
      </div>
    </div>
  );
}
