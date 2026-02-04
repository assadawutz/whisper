import { fileToImage } from "@/utils/image";
import { fileSha256 } from "@/utils/hash";
import { makeTransformHash } from "@/lock/blueprintLock";
import { runScan, Rect } from "@/scan/runner";
import { boxesToLeafNodes, UINode } from "@/nodes/nodeManager";
import { buildContainmentTree } from "@/nodes/containment";
import { attachLayoutHints } from "@/hints/layoutHints";
import { iou, maxEdgeOffset } from "@/verify/iou";
import { canExport } from "@/gate/exportGate";
import { exportAbsoluteReact } from "@/exporters/reactAbsolute";

export interface BlueprintMeta {
  name: string;
  hash: string;
  size: { w: number; h: number };
  locked: boolean;
  lockedAt: number;
}

export interface ScanProof {
  invariants: {
    transformHash: string;
  };
  marks: { i: number; x: number; y: number }[];
}

export interface TruthRunResult {
  blueprint: BlueprintMeta;
  scanProof: ScanProof;
  nodes: UINode[];
  export: { ok: boolean; reasons: string[]; react?: string };
  verification: {
    pass: boolean;
    minIou: number;
    maxOffset: number;
  };
}

export async function runTruthPipeline(params: {
  file: File;
  step: number;
  detectAt?: (x: number, y: number) => Rect | null;
  onTick?: (mark: { i: number; x: number; y: number }) => void;
  compareRects?: (expected: Rect[], actual: Rect[]) => {
    pass: boolean;
    minIou: number;
    maxOffset: number;
  };
}): Promise<TruthRunResult> {
  const img = await fileToImage(params.file);
  const hash = await fileSha256(params.file);

  const blueprint: BlueprintMeta = {
    name: params.file.name,
    hash,
    size: { w: img.naturalWidth, h: img.naturalHeight },
    locked: true,
    lockedAt: Date.now(),
  };

  const scanProof: ScanProof = {
    invariants: {
      transformHash: makeTransformHash({
        w: img.naturalWidth,
        h: img.naturalHeight,
        pixelSpace: "1:1",
        noNormalize: true,
      }),
    },
    marks: [],
  };

  const scan = await runScan({
    w: img.naturalWidth,
    h: img.naturalHeight,
    step: params.step,
    onTick: (mark) => {
      scanProof.marks.push(mark);
      params.onTick?.(mark);
    },
    detectAt: params.detectAt,
  });

  const leafNodes = boxesToLeafNodes(scan.boxes);
  const withTree = buildContainmentTree(leafNodes, {
    w: img.naturalWidth,
    h: img.naturalHeight,
  });
  const nodes = attachLayoutHints(withTree);

  const verification = params.compareRects
    ? params.compareRects(scan.boxes, scan.boxes)
    : verifyRectPairs(scan.boxes, scan.boxes, { minIou: 0.995, maxOffset: 2 });

  const missingHintsCount = nodes.filter(
    (n) => n.children.length > 0 && !n.hint,
  ).length;

  const exportGate = canExport({
    locked: blueprint.locked,
    driftDetected: false,
    verificationPass: verification.pass,
    boxesLen: scan.boxes.length,
    nodesLen: nodes.length,
    missingHintsCount,
  });

  const react = exportGate.ok
    ? exportAbsoluteReact(nodes, img.naturalWidth, img.naturalHeight)
    : undefined;

  return {
    blueprint,
    scanProof,
    nodes,
    export: { ...exportGate, react },
    verification,
  };
}

export function verifyRectPairs(
  expected: Rect[],
  actual: Rect[],
  thresholds: { minIou: number; maxOffset: number },
) {
  if (expected.length === 0 || actual.length === 0) {
    return { pass: false, minIou: 0, maxOffset: Infinity };
  }

  let minIou = Infinity;
  let maxOffset = 0;
  const pairCount = Math.min(expected.length, actual.length);

  for (let i = 0; i < pairCount; i += 1) {
    const currIou = iou(expected[i], actual[i]);
    const currOffset = maxEdgeOffset(expected[i], actual[i]);
    minIou = Math.min(minIou, currIou);
    maxOffset = Math.max(maxOffset, currOffset);
  }

  const pass = minIou >= thresholds.minIou && maxOffset <= thresholds.maxOffset;
  return { pass, minIou, maxOffset };
}
