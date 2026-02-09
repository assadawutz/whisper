export type ScanPoint = { x: number; y: number; i: number };

export function* serpentinePoints(
  w: number,
  h: number,
  step: number,
): Generator<ScanPoint> {
  const S = Math.max(1, Math.round(step));
  let i = 0;

  for (let y = 0; y < h; y += S) {
    const row = Math.floor(y / S);
    const leftToRight = row % 2 === 0;

    if (leftToRight) {
      for (let x = 0; x < w; x += S) {
        yield { x, y, i: i++ };
      }
    } else {
      for (let x = w - 1; x >= 0; x -= S) {
        yield { x, y, i: i++ };
      }
    }
  }
}
