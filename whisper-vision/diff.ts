import type { DiffMetrics } from "@/types/blueprint";

type Html2CanvasFn = (
  element: HTMLElement,
  options: {
    backgroundColor?: string;
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
  }
) => Promise<HTMLCanvasElement>;

type PixelmatchFn = (
  img1: Uint8ClampedArray,
  img2: Uint8ClampedArray,
  output: Uint8ClampedArray,
  width: number,
  height: number,
  options?: { threshold?: number; includeAA?: boolean; alpha?: number }
) => number;

export async function runDiffStrict1to1(params: {
  blueprintDataUrl: string;
  blueprintW: number;
  blueprintH: number;
  previewRoot: HTMLElement;
  outCanvas: HTMLCanvasElement;
}): Promise<DiffMetrics> {
  const { blueprintDataUrl, blueprintW, blueprintH, previewRoot, outCanvas } = params;

  if (!blueprintDataUrl) throw new Error("Missing blueprintDataUrl");
  if (!blueprintW || !blueprintH) throw new Error("Invalid blueprint size");
  if (!previewRoot) throw new Error("Missing previewRoot");
  if (!outCanvas) throw new Error("Missing outCanvas");

  const bp = await loadBlueprintImageData(blueprintDataUrl, blueprintW, blueprintH);

  const html2canvas = await loadHtml2Canvas();
  const pixelmatch = await loadPixelmatch();

  const snap = await html2canvas(previewRoot, {
    backgroundColor: "#09090b",
    scale: 1,
    useCORS: true,
    logging: false,
  });

  if (snap.width !== blueprintW || snap.height !== blueprintH) {
    paintFail(outCanvas, blueprintW, blueprintH, `SIZE_MISMATCH: ${snap.width}x${snap.height}`);
    return {
      iou: 0,
      mismatchPct: 1,
      maxOffsetPx: Math.max(Math.abs(snap.width - blueprintW), Math.abs(snap.height - blueprintH)),
      pass: false,
    };
  }

  const sctx = snap.getContext("2d", { willReadFrequently: true });
  if (!sctx) throw new Error("Snapshot ctx missing");
  const prev = sctx.getImageData(0, 0, snap.width, snap.height);

  outCanvas.width = blueprintW;
  outCanvas.height = blueprintH;
  outCanvas.style.width = `${blueprintW}px`;
  outCanvas.style.height = `${blueprintH}px`;

  const octx = outCanvas.getContext("2d", { willReadFrequently: true });
  if (!octx) throw new Error("Out ctx missing");
  const diff = octx.createImageData(blueprintW, blueprintH);

  const mismatched = pixelmatch(
    bp.data,
    prev.data,
    diff.data,
    blueprintW,
    blueprintH,
    { threshold: 0.1, includeAA: true, alpha: 0.7 }
  );

  octx.putImageData(diff, 0, 0);

  const total = blueprintW * blueprintH;
  const mismatchPct = total > 0 ? mismatched / total : 1;
  const pass = mismatchPct < 0.02;

  return { iou: 1 - mismatchPct, mismatchPct, maxOffsetPx: 0, pass };
}

async function loadHtml2Canvas(): Promise<Html2CanvasFn> {
  if (typeof window === "undefined") {
    throw new Error("html2canvas requires a browser environment");
  }
  const existing = (window as any).html2canvas as Html2CanvasFn | undefined;
  if (existing) return existing;
  await loadScript("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js", "html2canvas");
  const loaded = (window as any).html2canvas as Html2CanvasFn | undefined;
  if (!loaded) throw new Error("html2canvas failed to load");
  return loaded;
}

async function loadPixelmatch(): Promise<PixelmatchFn> {
  if (typeof window === "undefined") {
    throw new Error("pixelmatch requires a browser environment");
  }
  const existing = (window as any).pixelmatch as PixelmatchFn | undefined;
  if (existing) return existing;
  await loadScript("https://cdn.jsdelivr.net/npm/pixelmatch@5.3.0/dist/pixelmatch.umd.js", "pixelmatch");
  const loaded = (window as any).pixelmatch as PixelmatchFn | undefined;
  if (!loaded) throw new Error("pixelmatch failed to load");
  return loaded;
}

function loadScript(src: string, globalName: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-vendor="${globalName}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`${globalName} failed to load`)), { once: true });
      if ((window as any)[globalName]) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.vendor = globalName;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`${globalName} failed to load`));
    document.head.appendChild(script);
  });
}

async function loadBlueprintImageData(dataUrl: string, w: number, h: number) {
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Blueprint decode failed"));
  });

  if (img.naturalWidth !== w || img.naturalHeight !== h) {
    throw new Error(`Blueprint meta mismatch. natural=${img.naturalWidth}x${img.naturalHeight} expected=${w}x${h}`);
  }

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Blueprint ctx missing");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);

  const id = ctx.getImageData(0, 0, w, h);
  return { data: id.data };
}

function paintFail(canvas: HTMLCanvasElement, w: number, h: number, msg: string) {
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,0,0,0.18)";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillText(msg, 12, 24);
}
