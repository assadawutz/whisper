"use client";

import { useMemo, useRef, useState } from "react";
import type { BlueprintSession } from "@/types/blueprint";
import { loadImageFileToDataUrl, hashString } from "@/lib/image";
import { drawBlueprint, drawOverlay } from "@/lib/canvas";
import { extractBoxesSimple } from "@/lib/extract";
import { runDiffStrict1to1 } from "@/lib/diff";
import { GeneratedPreview } from "@/components/GeneratedPreview";
import { ExportPanel } from "@/components/ExportPanel";

export default function Page() {
  const [session, setSession] = useState<BlueprintSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blueprintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const diffCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const canRun = useMemo(() => {
    return !!session?.image?.dataUrl && session.locks.pixelSpace === "1:1";
  }, [session]);

  async function onUpload(file: File | null) {
    setError(null);
    if (!file) return;

    try {
      setBusy(true);

      const dataUrl = await loadImageFileToDataUrl(file);
      const imgHash = await hashString(dataUrl);

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej(new Error("Image load failed"));
      });

      const next: BlueprintSession = {
        id: crypto.randomUUID(),
        image: { name: file.name, width: img.naturalWidth, height: img.naturalHeight, dataUrl, hash: imgHash },
        locks: { pixelSpace: "1:1", noNormalize: true, noSemanticOverride: true },
        scan: { path: "serpentine", stepPx: 8, marks: 0, driftPx: 0, transformHash: "lock-1:1" },
        nodes: [],
        diff: { history: [] },
      };

      setSession(next);

      drawBlueprint(blueprintCanvasRef.current, img);

      drawOverlay(overlayCanvasRef.current, img.naturalWidth, img.naturalHeight, []);
      if (diffCanvasRef.current) {
        diffCanvasRef.current.width = img.naturalWidth;
        diffCanvasRef.current.height = img.naturalHeight;
        diffCanvasRef.current.style.width = `${img.naturalWidth}px`;
        diffCanvasRef.current.style.height = `${img.naturalHeight}px`;
        const ctx = diffCanvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);
      }
    } catch (e: any) {
      setError(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onExtract() {
    setError(null);
    if (!session) return;
    if (!canRun) return setError("Blueprint must be locked 1:1");

    try {
      setBusy(true);
      const nodes = await extractBoxesSimple(session.image.dataUrl, {
        stepPx: session.scan.stepPx,
        path: session.scan.path,
      });

      setSession((s) => (s ? { ...s, nodes } : s));
      drawOverlay(overlayCanvasRef.current, session.image.width, session.image.height, nodes);
    } catch (e: any) {
      setError(e?.message ?? "Extract failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDiff() {
    setError(null);
    if (!session) return;
    if (!previewRef.current) return setError("Preview ref missing");
    if (!diffCanvasRef.current) return setError("Diff canvas missing");

    try {
      setBusy(true);
      const metrics = await runDiffStrict1to1({
        blueprintDataUrl: session.image.dataUrl,
        blueprintW: session.image.width,
        blueprintH: session.image.height,
        previewRoot: previewRef.current,
        outCanvas: diffCanvasRef.current,
      });

      setSession((s) =>
        s
          ? { ...s, diff: { last: metrics, history: [...(s.diff?.history ?? []), metrics] } }
          : s
      );
    } catch (e: any) {
      setError(e?.message ?? "Diff failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-lg font-semibold">Image → Tailwind (Truth 1:1 + Overlay + Diff + Export)</div>
              <div className="text-xs text-zinc-400">
                lock={session?.locks.pixelSpace ?? "—"} nodes={session?.nodes?.length ?? 0} pass={String(session?.diff?.last?.pass ?? false)}
                {session?.diff?.last ? ` mismatch=${(session.diff.last.mismatchPct * 100).toFixed(2)}%` : ""}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2 text-sm">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
                  disabled={busy}
                />
                <span>Upload</span>
              </label>

              <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm disabled:opacity-50" onClick={onExtract} disabled={!session || busy}>
                Extract Boxes
              </button>

              <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm disabled:opacity-50" onClick={onDiff} disabled={!session || busy}>
                Run Diff
              </button>
            </div>
          </header>

          {error ? <div className="rounded-lg bg-red-900/40 px-3 py-2 text-sm">{error}</div> : null}

          <ExportPanel session={session} />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <section className="rounded-xl bg-zinc-900/60 p-2">
              <div className="text-xs text-zinc-400">Blueprint (1:1) + Overlay</div>
              <div className="relative mt-2 overflow-auto rounded-lg border border-zinc-800">
                <canvas ref={blueprintCanvasRef} className="block" />
                <canvas ref={overlayCanvasRef} className="absolute left-0 top-0 block pointer-events-none" />
              </div>
            </section>

            <section className="rounded-xl bg-zinc-900/60 p-2">
              <div className="text-xs text-zinc-400">Generated Preview (DOM 1:1)</div>
              <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <GeneratedPreview session={session} previewRef={previewRef} />
              </div>
            </section>
          </div>

          <section className="rounded-xl bg-zinc-900/60 p-2">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-zinc-400">Diff Heatmap (pixelmatch)</div>
              <div className="text-xs text-zinc-400">
                {session?.diff?.last
                  ? `pass=${String(session.diff.last.pass)} mismatch=${(session.diff.last.mismatchPct * 100).toFixed(2)}% iou=${session.diff.last.iou.toFixed(3)}`
                  : "—"}
              </div>
            </div>
            <div className="mt-2 overflow-auto rounded-lg border border-zinc-800">
              <canvas ref={diffCanvasRef} className="block" />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
