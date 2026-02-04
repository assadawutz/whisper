import { UINode } from "@/nodes/nodeManager";

export function exportAbsoluteReact(
  nodes: UINode[],
  bpW: number,
  bpH: number,
): string {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const root = byId.get("root");
  if (!root) throw new Error("Missing root");

  const children = root.children
    .map((id) => byId.get(id))
    .filter(Boolean) as UINode[];

  const lines: string[] = [];
  lines.push(`import React from "react";`);
  lines.push("");
  lines.push("export default function PixelTruth(){");
  lines.push(`  const W=${bpW}, H=${bpH};`);
  lines.push("  return (");
  lines.push(
    `    <div className=\"relative w-full overflow-hidden bg-white\" style={{ aspectRatio: \\`\\${W}/\\${H}\\` }}>`,
  );
  lines.push(
    `      <div className=\"absolute left-0 top-0\" style={{ width: W, height: H }}>`,
  );

  for (const n of children) {
    const r = n.rect;
    lines.push(
      `        <div data-id=\"${n.id}\" style={{ position:\"absolute\", left:${r.x}, top:${r.y}, width:${r.w}, height:${r.h} }} />`,
    );
  }

  lines.push("      </div>");
  lines.push("    </div>");
  lines.push("  );");
  lines.push("}");
  return lines.join("\n");
}
