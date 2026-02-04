import { UINode } from "@/nodes/nodeManager";

export interface LayoutHint {
  role: "flow" | "grid" | "leaf" | "stack";
  flow: "flex-row" | "flex-col" | "grid" | "none" | "absolute";
  gapPx: number;
  paddingPx: number;
  cols?: number;
  requiresApproval?: boolean;
  approved?: boolean;
  absoluteReason?: string;
}

export function attachLayoutHints(nodes: UINode[]): UINode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const n of nodes) {
    const kids = (n.children || [])
      .map((id) => byId.get(id))
      .filter(Boolean) as UINode[];

    if (!kids.length) {
      n.hint = { role: "leaf", flow: "none", gapPx: 0, paddingPx: 0 };
      continue;
    }

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
