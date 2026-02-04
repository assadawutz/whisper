export type RectTruth = {
  x: number;
  y: number;
  w: number;
  h: number;
  space: "blueprint";
};

export type NodeType =
  | "container"
  | "card"
  | "layer"
  | "button"
  | "input"
  | "text"
  | "image"
  | "icon"
  | "nav-item"
  | "heading"
  | "section"
  | "div";

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
  return `n_${String(i).padStart(4, "0")}`;
}

export function boxesToLeafNodes(
  boxes: { x: number; y: number; w: number; h: number }[],
): UINode[] {
  return (boxes || [])
    .filter(
      (b) =>
        Number.isFinite(b.x) &&
        Number.isFinite(b.y) &&
        Number.isFinite(b.w) &&
        Number.isFinite(b.h),
    )
    .filter((b) => b.w > 0 && b.h > 0)
    .map((b, i) => ({
      id: stableId(i + 1),
      rect: { ...b, space: "blueprint" as const },
      type: "div" as const,
      children: [],
    }));
}
