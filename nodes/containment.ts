import { RectTruth, UINode } from "@/nodes/nodeManager";

function contains(a: RectTruth, b: RectTruth, tol = 0): boolean {
  return (
    b.x >= a.x - tol &&
    b.y >= a.y - tol &&
    b.x + b.w <= a.x + a.w + tol &&
    b.y + b.h <= a.y + a.h + tol
  );
}

function area(r: RectTruth) {
  return r.w * r.h;
}

export function buildContainmentTree(
  nodes: UINode[],
  rootRect: { w: number; h: number },
): UINode[] {
  const root: UINode = {
    id: "root",
    rect: { x: 0, y: 0, w: rootRect.w, h: rootRect.h, space: "blueprint" },
    type: "container",
    children: [],
  };

  const all = [root, ...nodes];

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

  const byId = new Map(all.map((x) => [x.id, x]));
  for (const n of all) n.children = [];
  for (const n of all) {
    if (n.id === "root") continue;
    const p = byId.get(n.parent || "root");
    if (p) p.children.push(n.id);
  }

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
