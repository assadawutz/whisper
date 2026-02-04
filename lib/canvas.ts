import type { UINode } from "@/types/blueprint";

export function drawBlueprint(canvas: HTMLCanvasElement | null, img: HTMLImageElement) {
  if (!canvas) return;

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  canvas.style.width = `${img.naturalWidth}px`;
  canvas.style.height = `${img.naturalHeight}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
}

export function drawOverlay(
  canvas: HTMLCanvasElement | null,
  w: number,
  h: number,
  nodes: UINode[]
) {
  if (!canvas) return;

  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  ctx.lineWidth = 2;
  for (const n of nodes) {
    const r = n?.rect;
    if (!r || r.w <= 0 || r.h <= 0) continue;

    ctx.strokeStyle = n.depth === 0 ? "rgba(99,102,241,0.9)" : "rgba(34,197,94,0.85)";
    ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w, r.h);

    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(r.x, Math.max(0, r.y - 16), Math.min(180, r.w), 16);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(n.id, r.x + 6, Math.max(12, r.y - 4));
  }
}
