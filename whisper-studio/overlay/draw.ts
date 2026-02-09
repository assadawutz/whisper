export function drawScanTick(
  ctx: CanvasRenderingContext2D,
  p: { x: number; y: number },
  color = "#00E5FF",
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(p.x, p.y, 2, 2);
  ctx.restore();
}

export function drawRect(
  ctx: CanvasRenderingContext2D,
  r: { x: number; y: number; w: number; h: number },
  stroke = "#FF3B30",
) {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  ctx.restore();
}
