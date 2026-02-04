import type { UINode, Rect, ScanPath } from "@/types/blueprint";

type ExtractOpts = { stepPx: number; path: ScanPath };

export async function extractBoxesSimple(dataUrl: string, opts: ExtractOpts): Promise<UINode[]> {
  const step = Math.max(2, Math.min(32, Math.floor(opts.stepPx || 8)));

  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Image decode failed"));
  });

  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) throw new Error("Invalid image size");

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas ctx not available");

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  const px = imgData.data;

  const cellW = Math.ceil(w / step);
  const cellH = Math.ceil(h / step);
  const score = new Float32Array(cellW * cellH);

  for (let cy = 0; cy < cellH; cy++) {
    for (let cx = 0; cx < cellW; cx++) {
      const x = cx * step;
      const y = cy * step;
      const idx = cy * cellW + cx;
      score[idx] = sampleEdge(px, w, h, x, y, step);
    }
  }

  const thr = autoThreshold(score);
  const visited = new Uint8Array(score.length);
  const rects: Rect[] = [];

  const neighbors = (i: number) => {
    const cx = i % cellW;
    const cy = Math.floor(i / cellW);
    const out: number[] = [];
    if (cx > 0) out.push(i - 1);
    if (cx < cellW - 1) out.push(i + 1);
    if (cy > 0) out.push(i - cellW);
    if (cy < cellH - 1) out.push(i + cellW);
    return out;
  };

  for (let i = 0; i < score.length; i++) {
    if (visited[i]) continue;
    if (score[i] < thr) continue;

    const stack = [i];
    visited[i] = 1;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let count = 0;

    while (stack.length) {
      const cur = stack.pop()!;
      const cx = cur % cellW;
      const cy = Math.floor(cur / cellW);

      minX = Math.min(minX, cx);
      minY = Math.min(minY, cy);
      maxX = Math.max(maxX, cx);
      maxY = Math.max(maxY, cy);
      count++;

      for (const nb of neighbors(cur)) {
        if (visited[nb]) continue;
        visited[nb] = 1;
        if (score[nb] >= thr) stack.push(nb);
      }
    }

    if (count < 6) continue;

    const r: Rect = {
      x: clamp(minX * step, 0, w - 1),
      y: clamp(minY * step, 0, h - 1),
      w: clamp((maxX - minX + 1) * step, 1, w),
      h: clamp((maxY - minY + 1) * step, 1, h),
    };

    if (r.w > w * 0.98 && r.h > h * 0.98) continue;
    rects.push(r);
  }

  rects.sort((a, b) => a.y - b.y || a.x - b.x);

  const nodes: UINode[] = rects.map((r, idx) => ({
    id: `b_${idx + 1}`,
    rect: r,
    depth: 0,
    role: "leaf",
  }));

  assignContainment(nodes);
  return nodes;
}

function sampleEdge(px: Uint8ClampedArray, w: number, h: number, x0: number, y0: number, step: number) {
  const x1 = Math.min(w - 2, x0 + Math.floor(step / 2));
  const y1 = Math.min(h - 2, y0 + Math.floor(step / 2));

  const i = (y1 * w + x1) * 4;
  const r = px[i];
  const g = px[i + 1];
  const b = px[i + 2];

  const j = (y1 * w + (x1 + 1)) * 4;
  const r2 = px[j];
  const g2 = px[j + 1];
  const b2 = px[j + 2];

  const k = ((y1 + 1) * w + x1) * 4;
  const r3 = px[k];
  const g3 = px[k + 1];
  const b3 = px[k + 2];

  const dx = Math.abs(r - r2) + Math.abs(g - g2) + Math.abs(b - b2);
  const dy = Math.abs(r - r3) + Math.abs(g - g3) + Math.abs(b - b3);
  return dx + dy;
}

function autoThreshold(score: Float32Array) {
  const arr = Array.from(score);
  arr.sort((a, b) => a - b);
  const mid = arr[Math.floor(arr.length * 0.5)] ?? 0;
  const p90 = arr[Math.floor(arr.length * 0.9)] ?? mid;
  return Math.max(30, Math.min(p90 * 0.55, p90 - (p90 - mid) * 0.2));
}

function assignContainment(nodes: UINode[]) {
  for (const n of nodes) {
    let bestParent: UINode | null = null;
    for (const p of nodes) {
      if (p === n) continue;
      if (contains(p.rect, n.rect)) {
        if (!bestParent) bestParent = p;
        else if (area(p.rect) < area(bestParent.rect)) bestParent = p;
      }
    }
    n.parentId = bestParent?.id;
  }

  const map = new Map(nodes.map((n) => [n.id, n]));
  for (const n of nodes) {
    let d = 0;
    let cur = n.parentId ? map.get(n.parentId) : undefined;
    while (cur && d < 64) {
      d++;
      cur = cur.parentId ? map.get(cur.parentId) : undefined;
    }
    n.depth = d;
    n.role = d === 0 ? "container" : "leaf";
  }
}

function contains(a: Rect, b: Rect) {
  return b.x >= a.x && b.y >= a.y && b.x + b.w <= a.x + a.w && b.y + b.h <= a.y + a.h;
}
function area(r: Rect) {
  return r.w * r.h;
}
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
