import type { Rect, UINode } from "@/types/blueprint";

export interface TreeNode extends UINode {
  children: TreeNode[];
}

export function buildContainmentTree(nodes: UINode[], rootSize: { w: number; h: number }) {
  const safe = Array.isArray(nodes) ? nodes.filter(isValidNode) : [];
  const map = new Map<string, TreeNode>();
  for (const n of safe) map.set(n.id, { ...n, children: [] });

  const root: TreeNode = {
    id: "root",
    rect: { x: 0, y: 0, w: rootSize.w, h: rootSize.h },
    depth: 0,
    role: "container",
    children: [],
  };

  for (const n of safe) {
    const tn = map.get(n.id);
    if (!tn) continue;

    let parent: TreeNode | null = null;

    if (n.parentId && map.has(n.parentId) && n.parentId !== n.id) {
      const p = map.get(n.parentId)!;
      if (contains(p.rect, n.rect)) parent = p;
    }
    if (!parent) parent = findBestParent(tn, map);

    if (!parent || parent.id === tn.id || !contains(parent.rect, tn.rect)) parent = root;
    if (parent.id !== "root" && wouldCycle(tn.id, parent.id, map)) parent = root;

    tn.parentId = parent.id;
  }

  for (const tn of map.values()) tn.children = [];
  for (const tn of map.values()) {
    const pid = tn.parentId;
    if (!pid || pid === "root") root.children.push(tn);
    else {
      const p = map.get(pid);
      if (!p) root.children.push(tn);
      else p.children.push(tn);
    }
  }

  sortTree(root);
  return root;
}

function isValidNode(n: any): n is UINode {
  const r = n?.rect;
  return (
    n &&
    typeof n.id === "string" &&
    r &&
    isFinite(r.x) &&
    isFinite(r.y) &&
    isFinite(r.w) &&
    isFinite(r.h) &&
    r.w > 0 &&
    r.h > 0
  );
}

function findBestParent(child: TreeNode, map: Map<string, TreeNode>) {
  let best: TreeNode | null = null;
  for (const cand of map.values()) {
    if (cand.id === child.id) continue;
    if (!contains(cand.rect, child.rect)) continue;
    if (!best || area(cand.rect) < area(best.rect)) best = cand;
  }
  return best;
}

function wouldCycle(childId: string, parentId: string, map: Map<string, TreeNode>) {
  let cur = map.get(parentId);
  let guard = 0;
  while (cur && guard++ < 64) {
    if (cur.parentId === childId) return true;
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return false;
}

function sortTree(node: TreeNode) {
  node.children.sort((a, b) => {
    const dy = a.rect.y - b.rect.y;
    if (dy) return dy;
    const dx = a.rect.x - b.rect.x;
    if (dx) return dx;
    return area(a.rect) - area(b.rect);
  });
  for (const c of node.children) sortTree(c);
}

function contains(a: Rect, b: Rect) {
  return b.x >= a.x && b.y >= a.y && b.x + b.w <= a.x + a.w && b.y + b.h <= a.y + a.h;
}
function area(r: Rect) {
  return r.w * r.h;
}
