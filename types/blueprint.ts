export type ScanPath = "serpentine" | "raster";

export interface Rect { x: number; y: number; w: number; h: number; }

export interface UINode {
  id: string;
  rect: Rect;                 // pixel space 1:1
  depth: number;              // containment depth
  parentId?: string;
  role: "container" | "leaf"; // box-only level
  layoutHint?: {
    flow: "flex-row" | "flex-col" | "grid" | "absolute" | "none";
    gapPx?: number;
    paddingPx?: number;
    cols?: number;
  };
  styleHint?: {
    radiusPx?: number;
    shadow?: "none" | "sm" | "md" | "lg";
    stroke?: string;
    fill?: string;
  };
}

export interface DiffMetrics {
  iou: number;
  mismatchPct: number;
  maxOffsetPx: number;
  pass: boolean;
}

export interface BlueprintSession {
  id: string;
  image: { name: string; width: number; height: number; dataUrl: string; hash: string; };
  locks: { pixelSpace: "1:1"; noNormalize: true; noSemanticOverride: true; };
  scan: { path: ScanPath; stepPx: number; marks: number; driftPx: number; transformHash: string; };
  nodes: UINode[];
  diff?: { last?: DiffMetrics; history: DiffMetrics[] };
}
