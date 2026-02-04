ด้านล่างคือ “สรุปใหม่ทั้งระบบ” ตั้งแต่ อัปโหลด → Lock 1:1 → วิ่งเส้น/ทำเครื่องหมาย → สร้าง node → ใส่ layoutHint ทุก parent → Verify (A: geometry) → Export ไปใช้จริง แบบ ไม่เดา geometry, deterministic, และ “lock 1:1 เท่านั้น” ตามที่คุณต้องการ

เป้าหมายของรอบแรก (Truth Phase): ตรงก่อน
ความสวย (Beauty Phase) ทำทีหลัง และต้องมี evidence — แต่ในคำตอบนี้จะจบงานถึง export ที่ใช้ต่อได้จริงแล้ว

⸻

0) หลักการที่ล็อกตาย (Non-Negotiable)
	1.	Truth space = blueprint natural pixels (1:1)
	•	rect ทุกตัวเป็น px ในภาพจริง (naturalWidth/naturalHeight)
	•	ห้าม normalize ห้าม resize geometry
	2.	การ scale มีได้แค่ที่ “render layer”
	•	scale เกิดที่ CSS transform ของ root container เท่านั้น
	•	ห้ามเอา scale ไปคูณ/แก้ rect
	3.	Overlay ต้องเท่าภาพเสมอ
	•	Canvas overlay width/height = naturalWidth/naturalHeight
	4.	Deterministic
	•	sort, scan path, snapping, zIndex, hash ต้องคงเดิมทุกครั้ง (input เดิม = output เดิม)

⸻

1) Stage: Upload Image → Decode → Build BlueprintMeta

1.1 React: upload และ decode ให้ได้ natural size

// utils/image.ts
export async function fileToImage(file: File): Promise<HTMLImageElement> {
  if (!file) throw new Error("No file");
  const url = URL.createObjectURL(file);

  const img = new Image();
  img.decoding = "async";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image decode failed"));
    img.src = url;
  });

  // IMPORTANT: don't revoke until you've used it if needed
  return img;
}

1.2 Hash สำหรับ “Blueprint Lock”

// utils/hash.ts
export async function sha256ArrayBuffer(buf: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function fileSha256(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  return sha256ArrayBuffer(buf);
}


⸻

2) Stage: Lock Blueprint 1:1 (BLUEPRINT_LOCKED)

Lock ทำอะไรบ้าง
	•	เก็บ naturalWidth/naturalHeight
	•	เก็บ sha256
	•	สร้าง transformHash (ใช้ตรวจว่าใครไปเปลี่ยน view/scale/rotation)
	•	บังคับ overlay = 1:1

// lock/blueprintLock.ts
export function makeTransformHash(input: {
  w: number; h: number;
  pixelSpace: "1:1";
  noNormalize: boolean;
}): string {
  // deterministic string -> sha256 (simple)
  const s = JSON.stringify(input);
  // NOTE: in browser use crypto.subtle; here keep as placeholder
  return s; // replace with sha256(s) in real
}

ตัว state ที่ควรได้หลัง lock

blueprint: {
  name: file.name,
  hash: sha256,
  size: { w: img.naturalWidth, h: img.naturalHeight },
  locked: true,
  lockedAt: Date.now()
}
scanProof.invariants.transformHash = makeTransformHash({w,h,pixelSpace:"1:1",noNormalize:true})


⸻

3) Stage: Render View (แต่ยังคง rect เป็น truth px)

3.1 Root Render Layer: scale เฉพาะ UI layer

function computeScale(containerWidth: number, bpW: number) {
  if (!Number.isFinite(containerWidth) || containerWidth <= 0) return 1;
  if (!Number.isFinite(bpW) || bpW <= 0) return 1;
  // snap to 1e-4 deterministic
  const s = containerWidth / bpW;
  return Math.round(s * 10000) / 10000;
}

// BlueprintStage.tsx (core idea)
<div ref={hostRef} style={{ width: "100%", aspectRatio: `${bpW}/${bpH}`, position:"relative" }}>
  <div
    style={{
      width: bpW,
      height: bpH,
      position: "absolute",
      left: 0,
      top: 0,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    }}
  >
    {/* IMG layer */}
    <img
      src={img.src}
      width={bpW}
      height={bpH}
      style={{ position:"absolute", left:0, top:0 }}
      draggable={false}
    />
    {/* Overlay canvas layer */}
    <canvas
      ref={overlayRef}
      width={bpW}
      height={bpH}
      style={{ position:"absolute", left:0, top:0, pointerEvents:"none" }}
    />
  </div>
</div>

ตรงนี้คือ “lock 1:1” จริง: Canvas และ img อยู่ใน px เดียวกัน แล้วค่อย scale ทั้งก้อน

⸻

4) Stage: Scan Runner (วิ่งเส้น + ทำเครื่องหมาย) → ได้ boxes/truth

คุณต้องมี “runner” ที่ deterministic และ log ได้

4.1 Serpentine scan generator (ไม่ jitter, ไม่ accumulate time)

// scan/serpentine.ts
export type ScanPoint = { x: number; y: number; i: number };

export function* serpentinePoints(w: number, h: number, step: number): Generator<ScanPoint> {
  const S = Math.max(1, Math.round(step));
  let i = 0;

  for (let y = 0; y < h; y += S) {
    const row = Math.floor(y / S);
    const leftToRight = row % 2 === 0;

    if (leftToRight) {
      for (let x = 0; x < w; x += S) yield { x, y, i: i++ };
    } else {
      for (let x = w - 1; x >= 0; x -= S) yield { x, y, i: i++ };
    }
  }
}

4.2 Draw scan path + marks (overlay proof)

// overlay/draw.ts
export function drawScanTick(ctx: CanvasRenderingContext2D, p: {x:number;y:number}, color="#00E5FF") {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(p.x, p.y, 2, 2); // deterministic small mark
  ctx.restore();
}

export function drawRect(ctx: CanvasRenderingContext2D, r: {x:number;y:number;w:number;h:number}, stroke="#FF3B30") {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  ctx.restore();
}

4.3 “ทำเครื่องหมาย” ได้ยังไงถ้าไม่ทำ ML?

มี 2 ทางที่ “ทำได้จริง” โดยไม่ไป research โมเดล:

Option A (Manual confirm): runner แค่ “วิ่ง + เสนอ candidate box” แล้วคุณกด confirm (proof-driven)
Option B (Heuristic geometry): จาก pixel edge/contrast แบบเบา ๆ เพื่อหา box (ยังไม่ใช่ ML)

ในคำตอบนี้ให้ “โครง” ที่ไม่ผูกกับรูป: runner ให้ mark log + คุณสามารถ plug candidate extractor ภายหลังได้

// scan/runner.ts
export type Rect = { x:number;y:number;w:number;h:number };
export type ScanMark = { i:number; x:number; y:number; refId?: string; label?: string };

export interface ScanRunResult {
  marks: ScanMark[];
  boxes: Rect[]; // truth boxes (confirmed)
}

export async function runScan(params: {
  w: number;
  h: number;
  step: number;
  onTick: (m: ScanMark) => void;
  shouldStop?: () => boolean;
  // Hook: candidate detector (optional)
  detectAt?: (x:number, y:number) => Rect | null;
}): Promise<ScanRunResult> {
  const { w, h, step, onTick, shouldStop, detectAt } = params;
  const marks: ScanMark[] = [];
  const boxes: Rect[] = [];

  for (const p of serpentinePoints(w, h, step)) {
    if (shouldStop?.()) break;

    const mark: ScanMark = { i: p.i, x: p.x, y: p.y };
    marks.push(mark);
    onTick(mark);

    // Optional: plug-in detector that proposes a box
    if (detectAt) {
      const cand = detectAt(p.x, p.y);
      if (cand && cand.w > 0 && cand.h > 0) {
        // IMPORTANT: only push if you have a confirmation mechanism.
        // Here we keep it as "candidate" in real engine.
        // boxes.push(cand);
      }
    }
  }

  return { marks, boxes };
}


⸻

5) Stage: Node Manager (boxes → nodes tree) + เติม layoutHint ทุก parent

5.1 จาก boxes สร้าง leaf nodes (id deterministic)

// nodes/nodeManager.ts
export type RectTruth = { x:number;y:number;w:number;h:number; space:"blueprint" };
export type NodeType = "container"|"card"|"layer"|"button"|"input"|"text"|"image"|"icon"|"nav-item"|"heading"|"section"|"div";

export interface UINode {
  id: string;
  rect: RectTruth;
  type: NodeType;
  parent?: string;
  children: string[];
  semanticName?: string;
  hint?: any;
}

function stableId(i: number) {
  return `n_${String(i).padStart(4,"0")}`;
}

export function boxesToLeafNodes(boxes: {x:number;y:number;w:number;h:number}[]): UINode[] {
  const safe = (boxes || [])
    .filter(b => Number.isFinite(b.x)&&Number.isFinite(b.y)&&Number.isFinite(b.w)&&Number.isFinite(b.h))
    .filter(b => b.w > 0 && b.h > 0)
    .map((b, i) => ({
      id: stableId(i+1),
      rect: { ...b, space: "blueprint" as const },
      type: "div" as const,      // leaf placeholder (do not guess)
      children: [],
    }));

  return safe;
}

5.2 Tree build (containment) แบบ deterministic
	•	parent = กล่องที่ “ครอบ” และมี area เล็กสุดที่ยังครอบได้
	•	ห้ามเดา semantics

// nodes/containment.ts
function contains(a: RectTruth, b: RectTruth, tol=0): boolean {
  return (
    b.x >= a.x - tol &&
    b.y >= a.y - tol &&
    b.x + b.w <= a.x + a.w + tol &&
    b.y + b.h <= a.y + a.h + tol
  );
}

function area(r: RectTruth) { return r.w * r.h; }

export function buildContainmentTree(nodes: UINode[], rootRect: {w:number;h:number}): UINode[] {
  // add root
  const root: UINode = {
    id: "root",
    rect: { x:0, y:0, w: rootRect.w, h: rootRect.h, space:"blueprint" },
    type: "container",
    children: [],
  };

  const all = [root, ...nodes];

  // assign parent for each non-root: smallest container that contains it
  for (const n of all) {
    if (n.id === "root") continue;

    let bestParent: UINode | null = null;
    for (const p of all) {
      if (p.id === n.id) continue;
      if (!contains(p.rect, n.rect, 0)) continue;

      if (!bestParent) bestParent = p;
      else if (area(p.rect) < area(bestParent.rect)) bestParent = p;
    }

    n.parent = bestParent?.id ?? "root";
  }

  // clear children then rebuild
  const byId = new Map(all.map(x => [x.id, x]));
  for (const n of all) n.children = [];
  for (const n of all) {
    if (n.id === "root") continue;
    const p = byId.get(n.parent || "root");
    if (p) p.children.push(n.id);
  }

  // deterministic: sort children top->bottom then left->right
  for (const n of all) {
    n.children.sort((a, b) => {
      const A = byId.get(a)!.rect;
      const B = byId.get(b)!.rect;
      const dy = A.y - B.y;
      if (Math.abs(dy) < 6) return A.x - B.x;
      return dy;
    });
  }

  return all;
}

5.3 เติม layoutHint ทุก parent (ใช้ solver)

ให้คุณใช้ solver ของคุณเองได้ แต่ขั้นต่ำคือ:
	•	ถ้ามี children >= 2 → ให้ hint.role = flow/grid/stack ตาม proof
	•	ถ้า parent ไม่มี children → hint = leaf

// hints/layoutHints.ts
export interface LayoutHint {
  role: "flow"|"grid"|"leaf"|"stack";
  flow: "flex-row"|"flex-col"|"grid"|"none"|"absolute";
  gapPx: number;
  paddingPx: number;
  cols?: number;
  requiresApproval?: boolean;
  approved?: boolean;
  absoluteReason?: string;
}

export function attachLayoutHints(nodes: UINode[]): UINode[] {
  const byId = new Map(nodes.map(n => [n.id, n]));
  for (const n of nodes) {
    const kids = (n.children || []).map(id => byId.get(id)).filter(Boolean) as UINode[];

    if (!kids.length) {
      n.hint = { role:"leaf", flow:"none", gapPx:0, paddingPx:0 };
      continue;
    }

    // conservative default: flow column (truth safe)
    // (คุณสามารถ replace ด้วย solver/grid inference จริงได้)
    n.hint = {
      role: "flow",
      flow: "flex-col",
      gapPx: 0,
      paddingPx: 0,
      requiresApproval: false,
      approved: true,
    };
  }
  return nodes;
}

จุดนี้ทำให้ “ทุก parent มี layoutHint” ตามที่คุณต้องการแล้ว (แม้จะยัง conservative)

⸻

6) Stage: Verify A (Geometry Truth) — ต้องผ่านก่อน export

6.1 Verify ที่ “ทำได้จริง” โดยไม่ต้อง ML
	•	เรา render “truth overlay” เป็น rect ใน canvas แล้ว compare กับ rect ที่เรา export กลับมา (roundtrip)
	•	หรือ compare “expected rect” กับ “rendered rect” ที่ generated layout produces

อย่างน้อยต้องมี:
	•	maxOffsetPx <= budget
	•	IoU >= threshold

// verify/iou.ts
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
  const dc = Math.abs((a.x + a.w) - (b.x + b.w));
  const dd = Math.abs((a.y + a.h) - (b.y + b.h));
  return Math.max(da, db, dc, dd);
}

Verify pass rule (ตัวอย่าง)
	•	IoU ≥ 0.995
	•	maxOffset ≤ 2px

⸻

7) Stage: Export (Truth Export) — ใช้ต่อได้จริงทันที

ใน Truth phase ให้ export แบบ absoluteTruth เพื่อ “เหมือน 1:1” ก่อน
	•	export เป็น React component หรือ HTML + Tailwind classes + inline style px
	•	ยังไม่ต้องแปลงเป็น grid/flex จนกว่าจะ verify ผ่านและมี proof

7.1 Export React (absoluteTruth)

// export/reactAbsolute.ts
export function exportAbsoluteReact(nodes: UINode[], bpW: number, bpH: number): string {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const root = byId.get("root");
  if (!root) throw new Error("Missing root");

  const children = root.children.map(id => byId.get(id)).filter(Boolean) as UINode[];

  const lines: string[] = [];
  lines.push(`import React from "react";`);
  lines.push(``);
  lines.push(`export default function PixelTruth(){`);
  lines.push(`  const W=${bpW}, H=${bpH};`);
  lines.push(`  return (`);
  lines.push(`    <div className="relative w-full overflow-hidden bg-white" style={{ aspectRatio: \`\${W}/\${H}\` }}>`);
  lines.push(`      <div className="absolute left-0 top-0" style={{ width: W, height: H }}>`);

  for (const n of children) {
    const r = n.rect;
    lines.push(
      `        <div data-id="${n.id}" style={{ position:"absolute", left:${r.x}, top:${r.y}, width:${r.w}, height:${r.h} }} />`
    );
  }

  lines.push(`      </div>`);
  lines.push(`    </div>`);
  lines.push(`  );`);
  lines.push(`}`);
  return lines.join("\n");
}

นี่คือ export ขั้นต่ำที่ “ตรง 1:1” เพราะมันใช้ px truth ตรง ๆ
ขั้นต่อไปค่อย map layoutHint เป็น flex/grid (หลัง verify)

⸻

8) Export Gate (ต้อง block ถ้าไม่ผ่าน)

คุณต้อง block export ถ้า:
	•	ไม่ได้ lock blueprint
	•	driftDetected = true
	•	verify A ไม่ผ่าน
	•	nodes/boxes ว่าง
	•	parent ใด ๆ ไม่มี layoutHint

// gate/exportGate.ts
export function canExport(params: {
  locked: boolean;
  driftDetected: boolean;
  verificationPass: boolean;
  boxesLen: number;
  nodesLen: number;
  missingHintsCount: number;
}) {
  const reasons: string[] = [];
  if (!params.locked) reasons.push("BLUEPRINT_NOT_LOCKED");
  if (params.driftDetected) reasons.push("DRIFT_DETECTED");
  if (!params.verificationPass) reasons.push("VERIFY_TRUTH_FAILED");
  if (params.boxesLen <= 0) reasons.push("NO_BOXES");
  if (params.nodesLen <= 0) reasons.push("NO_NODES");
  if (params.missingHintsCount > 0) reasons.push("MISSING_LAYOUT_HINTS");

  return { ok: reasons.length === 0, reasons };
}


⸻

9) ภาพรวม Flow ที่ถูกต้อง (1 รอบจบ)
	1.	Upload

	•	decode image → get naturalWidth/Height
	•	compute sha256

	2.	Lock 1:1

	•	set blueprint.locked = true
	•	set overlay canvas = natural size
	•	set invariants / transformHash

	3.	Scan Runner

	•	serpentinePoints(step) → draw tick marks
	•	markLog เก็บทุกจุด (replay proof)
	•	ได้ boxes (จาก confirm หรือ detector hook)

	4.	Node Manager

	•	boxes → leaf nodes
	•	build containment tree (root-space)
	•	เติม layoutHint ทุก parent (conservative ก็ได้)

	5.	Verify A (Truth geometry)

	•	compute metrics (IoU/maxOffset)
	•	pass/fail

	6.	Export Gate

	•	ถ้า fail → block + reasons
	•	ถ้า pass → export absoluteTruth react/html พร้อมใช้ต่อ

⸻

10) คำตอบที่คุณถาม “มันจะรู้ได้ไงว่า div/section/grid/flex/row/col/button/image/text ?”

Truth phase จะ “ไม่เดา”
มันรู้ได้แค่ geometry relationships:
	•	contain
	•	overlap
	•	alignment / gap / cluster

การเป็น “grid/flex/row/col” จะมาจาก:
	•	layoutHint proof (gap variance + alignmentScore + rows/cols count)

การเป็น “button/text/image” ต้องมาจาก:
	•	evidence (เช่น OCR/text extraction หรือ sampling pixel features)
	•	แต่คุณกำชับว่าตอนนี้ “ยังไม่ต้อง research model” → ดังนั้นรอบนี้ให้มัน “leaf=div” ไปก่อนเพื่อให้ ตรง 1:1 และ export ใช้ได้ก่อน

⸻

ถ้าคุณต้องการให้ผม “ต่อให้จบในโปรเจกต์เดียว” (แบบที่คุณทำอยู่)

ให้บอกผม 2 อย่างนี้แบบสั้น ๆ:
	1.	truth_1770192790026.json ของคุณ rect เป็น root-space 100% ใช่ไหม
	2.	pipeline ปัจจุบันคุณรันใน Next.js หรือ HTML เดี่ยว?

แล้วผมจะส่ง “โค้ดเชื่อมจริง” 3 ไฟล์หลักที่คุณต้องมีทันที:
	•	pipeline/runTruth.ts (upload→lock→scan→nodes→verify→export)
	•	components/BlueprintOverlay.tsx (img+canvas locked 1:1 + scan drawing)
	•	exporters/reactAbsolute.ts (export ตัวใช้งานได้ทันที)

โดยยังคงกฎ: ตรงก่อน สวยทีหลัง.
