export type Rect = { x: number; y: number; w: number; h: number };

export function iou(a: Rect, b: Rect): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const iw = Math.max(0, x2 - x1);
  const ih = Math.max(0, y2 - y1);
  const inter = iw * ih;
  const ua = a.w * a.h + b.w * b.h - inter;
  if (ua <= 0) return 0;
  return inter / ua;
}

export function maxEdgeOffset(a: Rect, b: Rect): number {
  const da = Math.abs(a.x - b.x);
  const db = Math.abs(a.y - b.y);
  const dc = Math.abs(a.x + a.w - (b.x + b.w));
  const dd = Math.abs(a.y + a.h - (b.y + b.h));
  return Math.max(da, db, dc, dd);
}
