"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BlueprintDoc, BlueprintNode, BlueprintFileRole } from "@/lib/blueprint/types";

type BBox = { x: number; y: number; w: number; h: number };
type Flat = { id: string; type: BlueprintFileRole; bbox?: BBox; parentId: string | null; detail?: BlueprintNode["detail"] };

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
type DragMode = "draw" | "move" | "resize";
type DragState =
  | null
  | {
      mode: DragMode;
      startX: number;
      startY: number;
      curX: number;
      curY: number;
      targetId?: string;
      startBBox?: BBox;
      handle?: Handle;
      snap: boolean;
    };

function walk(node: BlueprintNode, parentId: string | null, out: Flat[]) {
  const id = String(node.id || "");
  if (id) out.push({ id, type: node.type, bbox: node.bbox, parentId, detail: node.detail });
  const kids = Array.isArray(node.children) ? node.children : [];
  for (const c of kids) walk(c, id || parentId, out);
}

function area(b?: BBox) {
  if (!b) return Number.POSITIVE_INFINITY;
  return Math.max(0, b.w) * Math.max(0, b.h);
}

function containsBox(outer?: BBox, inner?: BBox) {
  if (!outer || !inner) return false;
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}

function rebuildTree(flats: Flat[]): BlueprintNode {
  const rootFlat = flats.find((f) => f.id === "root") || { id: "root", type: "container" as const, parentId: null };
  const byId = new Map<string, BlueprintNode>();

  for (const f of flats) {
    if (!f.id) continue;
    byId.set(f.id, { type: f.type, id: f.id, bbox: f.bbox, detail: f.detail, children: [] });
  }
  if (!byId.has(rootFlat.id)) byId.set(rootFlat.id, { type: rootFlat.type, id: rootFlat.id, children: [] });

  for (const f of flats) {
    if (!f.id || f.id === rootFlat.id) continue;
    const n = byId.get(f.id);
    if (!n) continue;
    const pid = f.parentId;
    const parent = pid && byId.get(pid) ? byId.get(pid) : byId.get(rootFlat.id);
    if (!parent) continue;
    parent.children = Array.isArray(parent.children) ? parent.children : [];
    parent.children.push(n);
  }

  return byId.get(rootFlat.id) as BlueprintNode;
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function safeId(prefix: string) {
  const rnd = Math.random().toString(16).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rnd}`;
}

const ROLE_OPTIONS: BlueprintFileRole[] = ["container", "grid", "row", "column", "stack", "card", "calendar", "layer", "spacer"];

export default function StructureEditor({ doc, onSaved }: { doc: BlueprintDoc; onSaved: (d: BlueprintDoc) => void }) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [drag, setDrag] = useState<DragState>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);
  const [snapGuide, setSnapGuide] = useState<{ x: number | null; y: number | null }>({ x: null, y: null });

  const histRef = useRef<string[]>([]);
  const redoRef = useRef<string[]>([]);
  const lockInitRef = useRef(false);

  const blueprintSrc = doc.blueprint.imageRef || "";

  useEffect(() => {
    const out: Flat[] = [];
    walk(doc.structure, null, out);
    if (!out.find((x) => x.id === "root")) out.unshift({ id: "root", type: "container", parentId: null });
    setFlats(out);
    const first = out.find((x) => x.id !== "root")?.id || "";
    setSelectedId(first);

    histRef.current = [JSON.stringify(out)];
    redoRef.current = [];
    lockInitRef.current = true;
    const t = setTimeout(() => {
      lockInitRef.current = false;
    }, 250);
    return () => clearTimeout(t);
  }, [doc.structure]);

  const selected = useMemo(() => flats.find((f) => f.id === selectedId) || null, [flats, selectedId]);

  const byId = useMemo(() => {
    const m = new Map<string, Flat>();
    for (const f of flats) if (f.id) m.set(f.id, f);
    return m;
  }, [flats]);

  function pushHistory(next: Flat[]) {
    if (lockInitRef.current) return;
    const s = JSON.stringify(next);
    const last = histRef.current[histRef.current.length - 1];
    if (s === last) return;
    histRef.current.push(s);
    if (histRef.current.length > 120) histRef.current = histRef.current.slice(-120);
    redoRef.current = [];
  }

  function undo() {
    if (histRef.current.length <= 1) return;
    const cur = histRef.current.pop();
    if (cur) redoRef.current.push(cur);
    const prev = histRef.current[histRef.current.length - 1];
    try {
      const arr = JSON.parse(prev) as Flat[];
      if (Array.isArray(arr) && arr.length) setFlats(arr);
    } catch {}
  }

  function redo() {
    const nxt = redoRef.current.pop();
    if (!nxt) return;
    histRef.current.push(nxt);
    try {
      const arr = JSON.parse(nxt) as Flat[];
      if (Array.isArray(arr) && arr.length) setFlats(arr);
    } catch {}
  }

  function getScale() {
    const img = imgRef.current;
    const wrap = wrapRef.current;
    if (!img || !wrap) return { sx: 1, sy: 1, ox: 0, oy: 0, w: 1, h: 1, nw: 1, nh: 1 };
    const rect = wrap.getBoundingClientRect();
    const nw = img.naturalWidth || rect.width || 1;
    const nh = img.naturalHeight || rect.height || 1;
    return {
      sx: nw / rect.width,
      sy: nh / rect.height,
      ox: rect.left,
      oy: rect.top,
      w: rect.width,
      h: rect.height,
      nw,
      nh,
    };
  }

  const boxes = useMemo(() => flats.filter((f) => f.id !== "root" && f.bbox), [flats]);

  const parentCandidates = useMemo(() => {
    if (!selected || !selected.bbox) return [];
    const list = boxes
      .filter((b) => b.id !== selected.id && b.bbox && containsBox(b.bbox, selected.bbox))
      .sort((a, b) => area(a.bbox) - area(b.bbox))
      .map((x) => x.id);
    return [...list, "root"];
  }, [selected?.id, selected?.bbox?.x, selected?.bbox?.y, selected?.bbox?.w, selected?.bbox?.h, boxes]);

  function updateFlat(id: string, patch: Partial<Flat>) {
    if (!id) return;
    setFlats((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...patch } : f));
      pushHistory(next);
      return next;
    });
  }

  function deleteNode(id: string) {
    if (!id || id === "root") return;
    setFlats((prev) => {
      const toDelete = new Set<string>();
      const stack = [id];
      while (stack.length) {
        const cur = stack.pop()!;
        toDelete.add(cur);
        for (const f of prev) if (f.parentId === cur) stack.push(f.id);
      }
      const next = prev.filter((f) => !toDelete.has(f.id));
      const ids = new Set(next.map((x) => x.id));
      const repaired = next.map((f) => {
        if (f.id === "root") return f;
        if (f.parentId && !ids.has(f.parentId)) return { ...f, parentId: "root" };
        return f;
      });
      pushHistory(repaired);
      return repaired;
    });
    setSelectedId((prevSel) => (prevSel === id ? "" : prevSel));
  }

  function nudgeSelected(dx: number, dy: number) {
    if (!selected || !selected.bbox) return;
    const b = selected.bbox;
    const { nw, nh } = getScale();
    const nx = clampInt(b.x + dx, 0, nw - 1);
    const ny = clampInt(b.y + dy, 0, nh - 1);
    updateFlat(selected.id, { bbox: { ...b, x: nx, y: ny } });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase() || "";
      const isInput = tag === "input" || tag === "textarea" || (e.target as HTMLElement | null)?.isContentEditable;
      if (isInput) return;

      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (ctrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId && selectedId !== "root") {
          e.preventDefault();
          deleteNode(selectedId);
        }
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        nudgeSelected(-step, 0);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nudgeSelected(step, 0);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        nudgeSelected(0, -step);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        nudgeSelected(0, step);
        return;
      }
      if (e.key === "Escape") {
        setDrag(null);
        setSnapGuide({ x: null, y: null });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, selected?.bbox?.x, selected?.bbox?.y, selected?.bbox?.w, selected?.bbox?.h, flats]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
    };
    const onLeave = () => setMouse(null);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  function pxToBp(clientX: number, clientY: number) {
    const s = getScale();
    const x = (clientX - s.ox) * s.sx;
    const y = (clientY - s.oy) * s.sy;
    return { x, y };
  }

  function buildSnapLines(excludeId?: string) {
    const { nw, nh } = getScale();
    const xs: number[] = [0, nw];
    const ys: number[] = [0, nh];

    for (const b of boxes) {
      if (!b.bbox) continue;
      if (excludeId && b.id === excludeId) continue;
      xs.push(b.bbox.x, b.bbox.x + b.bbox.w, b.bbox.x + b.bbox.w / 2);
      ys.push(b.bbox.y, b.bbox.y + b.bbox.h, b.bbox.y + b.bbox.h / 2);
    }

    const sel = selectedId ? byId.get(selectedId) : null;
    const p = sel?.parentId ? byId.get(sel.parentId)?.bbox : null;
    if (p) {
      xs.push(p.x, p.x + p.w, p.x + p.w / 2);
      ys.push(p.y, p.y + p.h, p.y + p.h / 2);
    }

    const uniq = (arr: number[]) => Array.from(new Set(arr.map((n) => Math.round(n)))).sort((a, b) => a - b);
    return { xs: uniq(xs), ys: uniq(ys) };
  }

  function snapNear(v: number, lines: number[], threshold = 4) {
    let best = v;
    let bestD = threshold + 1;
    for (const l of lines) {
      const d = Math.abs(v - l);
      if (d < bestD) {
        bestD = d;
        best = l;
      }
    }
    return { v: best, snapped: bestD <= threshold };
  }

  function onDown(e: React.MouseEvent) {
    if (!blueprintSrc) return;
    const t = e.target as HTMLElement | null;
    const bid = t?.closest?.("[data-boxid]")?.getAttribute?.("data-boxid") || "";
    const handle = (t?.closest?.("[data-handle]")?.getAttribute?.("data-handle") || "") as Handle;

    const p = pxToBp(e.clientX, e.clientY);
    const snap = snapEnabled && !e.altKey;

    if (bid && handle) {
      setSelectedId(bid);
      const bb = byId.get(bid)?.bbox;
      if (bb) {
        setDrag({ mode: "resize", targetId: bid, handle, startBBox: bb, startX: p.x, startY: p.y, curX: p.x, curY: p.y, snap });
        return;
      }
    }

    if (bid) {
      setSelectedId(bid);
      const bb = byId.get(bid)?.bbox;
      if (bb) {
        setDrag({ mode: "move", targetId: bid, startBBox: bb, startX: p.x, startY: p.y, curX: p.x, curY: p.y, snap });
        return;
      }
      return;
    }

    setDrag({ mode: "draw", startX: p.x, startY: p.y, curX: p.x, curY: p.y, snap });
  }

  function onMove(e: React.MouseEvent) {
    if (!drag) return;
    const p = pxToBp(e.clientX, e.clientY);
    setDrag((prev) => (prev ? { ...prev, curX: p.x, curY: p.y } : prev));

    if (!drag.snap) {
      setSnapGuide({ x: null, y: null });
      return;
    }
    const lines = buildSnapLines(drag.targetId);
    const sx = snapNear(p.x, lines.xs);
    const sy = snapNear(p.y, lines.ys);
    setSnapGuide({ x: sx.snapped ? sx.v : null, y: sy.snapped ? sy.v : null });
  }

  function onUp() {
    if (!drag) return;
    const lines = drag.snap ? buildSnapLines(drag.targetId) : { xs: [], ys: [] };
    setSnapGuide({ x: null, y: null });

    if (drag.mode === "draw") {
      let x1 = Math.min(drag.startX, drag.curX);
      let y1 = Math.min(drag.startY, drag.curY);
      let x2 = Math.max(drag.startX, drag.curX);
      let y2 = Math.max(drag.startY, drag.curY);

      if (drag.snap) {
        const sx2 = snapNear(x2, lines.xs);
        const sy2 = snapNear(y2, lines.ys);
        x2 = sx2.v;
        y2 = sy2.v;
      }

      const w = x2 - x1;
      const h = y2 - y1;
      setDrag(null);
      if (w < 6 || h < 6) return;

      const id = safeId("node");
      const newNode: Flat = { id, type: "layer", bbox: { x: Math.round(x1), y: Math.round(y1), w: Math.round(w), h: Math.round(h) }, parentId: "root" };
      setFlats((prev) => {
        const next = [...prev, newNode];
        pushHistory(next);
        return next;
      });
      setSelectedId(id);
      return;
    }

    if (drag.mode === "move" && drag.targetId && drag.startBBox) {
      const bb = drag.startBBox;
      const dx = drag.curX - drag.startX;
      const dy = drag.curY - drag.startY;
      let nx = bb.x + dx;
      let ny = bb.y + dy;

      if (drag.snap) {
        const candidatesX = [
          { v: nx },
          { v: nx + bb.w / 2 },
          { v: nx + bb.w },
        ];
        let bestShiftX = 0;
        let bestAbsX = 9999;
        for (const c of candidatesX) {
          const s = snapNear(c.v, lines.xs);
          if (!s.snapped) continue;
          const shift = s.v - c.v;
          const abs = Math.abs(shift);
          if (abs < bestAbsX) {
            bestAbsX = abs;
            bestShiftX = shift;
          }
        }
        nx = nx + bestShiftX;

        const candidatesY = [
          { v: ny },
          { v: ny + bb.h / 2 },
          { v: ny + bb.h },
        ];
        let bestShiftY = 0;
        let bestAbsY = 9999;
        for (const c of candidatesY) {
          const s = snapNear(c.v, lines.ys);
          if (!s.snapped) continue;
          const shift = s.v - c.v;
          const abs = Math.abs(shift);
          if (abs < bestAbsY) {
            bestAbsY = abs;
            bestShiftY = shift;
          }
        }
        ny = ny + bestShiftY;
      }

      const { nw, nh } = getScale();
      nx = clampInt(nx, 0, nw - 1);
      ny = clampInt(ny, 0, nh - 1);
      updateFlat(drag.targetId, { bbox: { ...bb, x: nx, y: ny } });
      setDrag(null);
      return;
    }

    if (drag.mode === "resize" && drag.targetId && drag.startBBox && drag.handle) {
      const bb = drag.startBBox;
      let x1 = bb.x;
      let y1 = bb.y;
      let x2 = bb.x + bb.w;
      let y2 = bb.y + bb.h;
      const dx = drag.curX - drag.startX;
      const dy = drag.curY - drag.startY;

      const h = drag.handle;
      if (h.includes("w")) x1 = bb.x + dx;
      if (h.includes("e")) x2 = bb.x + bb.w + dx;
      if (h.includes("n")) y1 = bb.y + dy;
      if (h.includes("s")) y2 = bb.y + bb.h + dy;

      let rx1 = Math.min(x1, x2);
      let rx2 = Math.max(x1, x2);
      let ry1 = Math.min(y1, y2);
      let ry2 = Math.max(y1, y2);

      if (drag.snap) {
        if (h.includes("w") || h.includes("e")) {
          const sx = h.includes("w") ? snapNear(rx1, lines.xs) : snapNear(rx2, lines.xs);
          if (sx.snapped) {
            if (h.includes("w")) rx1 = sx.v;
            else rx2 = sx.v;
          }
        }
        if (h.includes("n") || h.includes("s")) {
          const sy = h.includes("n") ? snapNear(ry1, lines.ys) : snapNear(ry2, lines.ys);
          if (sy.snapped) {
            if (h.includes("n")) ry1 = sy.v;
            else ry2 = sy.v;
          }
        }
      }

      const { nw, nh } = getScale();
      rx1 = clampInt(rx1, 0, nw - 1);
      ry1 = clampInt(ry1, 0, nh - 1);
      rx2 = clampInt(rx2, rx1 + 1, nw);
      ry2 = clampInt(ry2, ry1 + 1, nh);

      const nb: BBox = { x: rx1, y: ry1, w: Math.max(1, rx2 - rx1), h: Math.max(1, ry2 - ry1) };
      updateFlat(drag.targetId, { bbox: nb });
      setDrag(null);
      return;
    }

    setDrag(null);
  }

  async function saveStructure() {
    const tree = rebuildTree(flats);
    const payload: BlueprintDoc = { ...doc, structure: tree };
    try {
      const r = await fetch("/api/structure/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ structure: payload.structure }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.ok) return;
      onSaved(j.doc as BlueprintDoc);
    } catch {
      // fail-closed
    }
  }

  const selectedParent = selected?.parentId ? byId.get(selected.parentId) : null;
  const parentBox = selectedParent?.bbox;

  function bpToPx(b: BBox) {
    const s = getScale();
    const left = b.x / s.sx;
    const top = b.y / s.sy;
    const width = b.w / s.sx;
    const height = b.h / s.sy;
    return { left, top, width, height };
  }

  const drawRect = useMemo(() => {
    if (!drag || drag.mode !== "draw") return null;
    const x1 = Math.min(drag.startX, drag.curX);
    const y1 = Math.min(drag.startY, drag.curY);
    const x2 = Math.max(drag.startX, drag.curX);
    const y2 = Math.max(drag.startY, drag.curY);
    const b: BBox = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    return b;
  }, [drag?.mode, (drag as any)?.startX, (drag as any)?.startY, (drag as any)?.curX, (drag as any)?.curY]);

  const suggestedParentsForDraw = useMemo(() => {
    if (!drawRect) return [];
    const list = boxes
      .filter((b) => b.bbox && containsBox(b.bbox, drawRect))
      .sort((a, b) => area(a.bbox) - area(b.bbox))
      .slice(0, 6)
      .map((x) => x.id);
    return list;
  }, [drawRect?.x, drawRect?.y, drawRect?.w, drawRect?.h, boxes]);

  const selectedPx = selected?.bbox ? bpToPx(selected.bbox) : null;

  function handleStyle(pos: Handle) {
    if (!selectedPx) return { left: 0, top: 0, cursor: "default" as const };
    const s = 8;
    const half = s / 2;
    const left = selectedPx.left;
    const top = selectedPx.top;
    const right = left + selectedPx.width;
    const bottom = top + selectedPx.height;
    const midX = left + selectedPx.width / 2;
    const midY = top + selectedPx.height / 2;

    const map: Record<Handle, { x: number; y: number; cursor: string }> = {
      nw: { x: left - half, y: top - half, cursor: "nwse-resize" },
      n: { x: midX - half, y: top - half, cursor: "ns-resize" },
      ne: { x: right - half, y: top - half, cursor: "nesw-resize" },
      e: { x: right - half, y: midY - half, cursor: "ew-resize" },
      se: { x: right - half, y: bottom - half, cursor: "nwse-resize" },
      s: { x: midX - half, y: bottom - half, cursor: "ns-resize" },
      sw: { x: left - half, y: bottom - half, cursor: "nesw-resize" },
      w: { x: left - half, y: midY - half, cursor: "ew-resize" },
    };
    const p = map[pos];
    return { left: p.x, top: p.y, cursor: p.cursor };
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8">
        <div className="text-xs text-gray-400 mb-2">
          Structure Review: draw/move/resize boxes. Ctrl+Z/Y undo/redo. Arrows nudge (Shift=10px). Del removes. Snap is a tool (manual); hold Alt while dragging to disable.
        </div>

        <div
          className="relative w-full overflow-hidden rounded-lg border border-white/10 bg-black/20"
          ref={wrapRef}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
        >
          {blueprintSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img ref={imgRef} src={blueprintSrc} alt="Blueprint" className="w-full h-auto block select-none" draggable={false} />
          ) : (
            <div className="p-6 text-sm text-gray-300">No blueprint image loaded.</div>
          )}

          {/* crosshair */}
          {mouse ? (
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-0 right-0 h-px bg-white/10" style={{ top: mouse.y }} />
              <div className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: mouse.x }} />
            </div>
          ) : null}

          {/* snap guides */}
          {snapEnabled && (snapGuide.x !== null || snapGuide.y !== null) ? (
            <div className="pointer-events-none absolute inset-0">
              {(() => {
                const s = getScale();
                const gx = snapGuide.x !== null ? snapGuide.x / s.sx : null;
                const gy = snapGuide.y !== null ? snapGuide.y / s.sy : null;
                return (
                  <>
                    {gx !== null ? <div className="absolute top-0 bottom-0 w-px bg-pink-500/50" style={{ left: gx }} /> : null}
                    {gy !== null ? <div className="absolute left-0 right-0 h-px bg-pink-500/50" style={{ top: gy }} /> : null}
                  </>
                );
              })()}
            </div>
          ) : null}

          {/* existing boxes */}
          <div className="absolute inset-0">
            {boxes.map((b) => {
              if (!b.bbox) return null;
              const px = bpToPx(b.bbox);
              const isSel = b.id === selectedId;
              const isSuggested = suggestedParentsForDraw.includes(b.id);
              const cls =
                "absolute border " +
                (isSel ? "border-pink-500 bg-pink-500/10" : isSuggested ? "border-white/40 bg-white/5" : "border-red-500/40 bg-transparent");

              return (
                <div
                  key={b.id}
                  data-boxid={b.id}
                  className={cls}
                  style={{ left: px.left, top: px.top, width: px.width, height: px.height, cursor: isSel ? "move" : "pointer" }}
                  title={`${b.id} • ${b.type}`}
                >
                  {isSel ? (
                    <>
                      {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as Handle[]).map((h) => {
                        const st = handleStyle(h);
                        return (
                          <div
                            key={h}
                            data-boxid={b.id}
                            data-handle={h}
                            className="absolute h-2 w-2 rounded-sm bg-white/80 border border-black/50"
                            style={{ left: st.left, top: st.top, cursor: st.cursor }}
                          />
                        );
                      })}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* draw new */}
          {drawRect ? (
            <div className="pointer-events-none absolute inset-0">
              {(() => {
                const px = bpToPx(drawRect);
                return <div className="absolute border border-white/70 bg-white/5" style={{ left: px.left, top: px.top, width: px.width, height: px.height }} />;
              })()}
            </div>
          ) : null}

          {/* distances to parent */}
          {selected && selected.bbox && parentBox ? (
            <div className="pointer-events-none absolute inset-0">
              {(() => {
                const left = selected.bbox!.x - parentBox.x;
                const top = selected.bbox!.y - parentBox.y;
                const right = parentBox.x + parentBox.w - (selected.bbox!.x + selected.bbox!.w);
                const bottom = parentBox.y + parentBox.h - (selected.bbox!.y + selected.bbox!.h);
                const px = bpToPx(selected.bbox!);
                return (
                  <div className="absolute" style={{ left: px.left, top: Math.max(0, px.top - 18) }}>
                    <div className="rounded bg-black/70 px-2 py-1 text-[11px] text-white">
                      L:{Math.round(left)} T:{Math.round(top)} R:{Math.round(right)} B:{Math.round(bottom)}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : null}
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Layer Inspector</div>
            <div className="flex gap-2">
              <button type="button" className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white hover:bg-black/50" onClick={undo}>
                Undo
              </button>
              <button type="button" className="rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white hover:bg-black/50" onClick={redo}>
                Redo
              </button>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between rounded border border-white/10 bg-black/30 px-2 py-2">
              <div className="text-xs text-gray-300">Snap</div>
              <button
                type="button"
                className={
                  "rounded px-2 py-1 text-xs " +
                  (snapEnabled ? "bg-pink-600/30 text-white border border-pink-500/40" : "bg-black/30 text-gray-200 border border-white/10")
                }
                onClick={() => setSnapEnabled((s) => !s)}
              >
                {snapEnabled ? "ON" : "OFF"}
              </button>
            </div>
            <div className="text-[11px] text-gray-400">Snap is a manual assist while dragging. Hold Alt to temporarily disable snap.</div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Selected</label>
              <select
                className="w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-sm text-white"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">(none)</option>
                {flats
                  .filter((f) => f.id !== "root")
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id} • {f.type}
                    </option>
                  ))}
              </select>
            </div>

            {selected ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Type</label>
                    <select
                      className="w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-sm text-white"
                      value={selected.type}
                      onChange={(e) => updateFlat(selected.id, { type: e.target.value as BlueprintFileRole })}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Parent</label>
                    <select
                      className="w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-sm text-white"
                      value={selected.parentId || "root"}
                      onChange={(e) => updateFlat(selected.id, { parentId: e.target.value })}
                    >
                      {parentCandidates.map((pid) => (
                        <option key={pid} value={pid}>
                          {pid}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">x</label>
                    <input
                      className="w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-sm text-white"
                      value={selected.bbox?.x ?? ""}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!selected.bbox) return;
                        if (!Number.isFinite(v)) return;
                        updateFlat(selected.id, { bbox: { ...selected.bbox, x: clampInt(v, 0, 1000000) } });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">y</label>
                    <input
                      className="w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-sm text-white"
                      value={selected.bbox?.y ?? ""}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!selected.bbox) return;
                        if (!Number.isFinite(v)) return;
                        updateFlat(selected.id, { bbox: { ...selected.bbox, y: clampInt(v, 0, 1000000) } });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">w</label>
                    <input
                      className="w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-sm text-white"
                      value={selected.bbox?.w ?? ""}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!selected.bbox) return;
                        if (!Number.isFinite(v)) return;
                        updateFlat(selected.id, { bbox: { ...selected.bbox, w: clampInt(v, 1, 1000000) } });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">h</label>
                    <input
                      className="w-full rounded border border-white/10 bg-black/30 px-2 py-2 text-sm text-white"
                      value={selected.bbox?.h ?? ""}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!selected.bbox) return;
                        if (!Number.isFinite(v)) return;
                        updateFlat(selected.id, { bbox: { ...selected.bbox, h: clampInt(v, 1, 1000000) } });
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="rounded border border-white/10 bg-red-600/20 px-3 py-2 text-sm text-white hover:bg-red-600/30"
                    onClick={() => deleteNode(selected.id)}
                    disabled={selected.id === "root"}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-white hover:bg-black/50"
                    onClick={() => saveStructure()}
                  >
                    Save JSON
                  </button>
                </div>

                <div className="text-[11px] text-gray-400">Tip: drag edges/corners to resize. Drag inside to move. For pixel-accuracy: adjust x/y/w/h and use arrow keys.</div>
              </>
            ) : (
              <div className="text-sm text-gray-300">Select a node to edit.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
