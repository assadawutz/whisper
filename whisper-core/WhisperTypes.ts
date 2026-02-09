/**
 * 🌌 WHISPER CORE: OMNI TYPES (v2.0)
 * Root definition for 1:1 Pixel-Perfect UI Synthesis.
 */

export type WhisperFileRole =
  | "root"
  | "section"
  | "card"
  | "button"
  | "input"
  | "text"
  | "image"
  | "icon"
  | "container"
  | "grid"
  | "list"
  | "unknown";

export interface WhisperBBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WhisperNode {
  id: string;
  role: WhisperFileRole;
  bbox: WhisperBBox;
  parentId: string | null;
  children: string[];
  layer: number;
  order: number;
  confidence: number;

  // Semantic Intelligence
  detail?: {
    text?: string;
    alt?: string;
    variant?: string;
    classes?: string[];
    css?: Record<string, string>;
    attributes?: Record<string, any>;
  };

  // Omni Metadata (v12)
  metadata?: {
    scanPhase: "Boundary" | "Strata" | "Grid" | "Probe" | "Corner";
    evidence: string[]; // e.g. ["edge-cluster", "symmetry-match"]
    locked: boolean;
    pixelHash?: string;
  };
}

export interface WhisperDoc {
  id: string;
  name: string;
  w: number;
  h: number;
  url: string; // Source image URL
  hash: string;
  createdAt: number;

  nodes: Record<string, WhisperNode>;
  order: string[]; // Flat render order
}

export interface WhisperScanResult {
  blueprint: WhisperDoc;
  workflow: {
    stage:
      | "UPLOADED"
      | "SIGNALS_ANALYZED"
      | "SCANNED"
      | "QA_PASSED"
      | "COMPILED";
    mode: "dense" | "sparse" | "grid" | "mixed";
    history: Array<{ ts: number; action: string; payload?: any }>;
  };
  output: {
    tailwindTsx?: string;
    warnings: string[];
  };
}

// Soul Layer Types
export interface WhisperAgentTask {
  id: string;
  objective: string;
  status: "idle" | "planning" | "running" | "healing" | "done" | "failed";
  plan?: {
    planA: string;
    planB: string;
    verifySteps: string[];
  };
  outcomes: Array<{
    ts: number;
    agentId: string;
    action: string;
    evidence: string;
    ok: boolean;
  }>;
}
