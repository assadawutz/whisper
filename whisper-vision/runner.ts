import { serpentinePoints } from "@/scan/serpentine";

export type Rect = { x: number; y: number; w: number; h: number };
export type ScanMark = { i: number; x: number; y: number; refId?: string };

export interface ScanRunResult {
  marks: ScanMark[];
  boxes: Rect[];
}

export async function runScan(params: {
  w: number;
  h: number;
  step: number;
  onTick: (m: ScanMark) => void;
  shouldStop?: () => boolean;
  detectAt?: (x: number, y: number) => Rect | null;
}): Promise<ScanRunResult> {
  const { w, h, step, onTick, shouldStop, detectAt } = params;
  const marks: ScanMark[] = [];
  const boxes: Rect[] = [];

  for (const p of serpentinePoints(w, h, step)) {
    if (shouldStop?.()) break;

    const mark: ScanMark = { i: p.i, x: p.x, y: p.y };
    marks.push(mark);
    onTick(mark);

    if (detectAt) {
      const cand = detectAt(p.x, p.y);
      if (cand && cand.w > 0 && cand.h > 0) {
        // push candidates only when confirmed by a human/solver
      }
    }
  }

  return { marks, boxes };
}
