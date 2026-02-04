import type { TreeNode } from "@/lib/tree";

export function generateTsxFromTree(
  root: TreeNode,
  opts?: { componentName?: string; includeDebugIds?: boolean }
) {
  const name = sanitizeComponentName(opts?.componentName || "GeneratedFromBlueprint");
  const includeIds = !!opts?.includeDebugIds;

  const lines: string[] = [];
  lines.push(`"use client";`);
  lines.push(`import React from "react";`);
  lines.push(``);
  lines.push(`export default function ${name}() {`);
  lines.push(`  return (`);
  lines.push(`    <div className="overflow-auto">`);
  lines.push(
    `      <div className="relative bg-zinc-950" style={{ width: ${root.rect.w}, height: ${root.rect.h} }}>`
  );

  for (const child of root.children) emitNode(lines, child, root, 8, includeIds);

  lines.push(`      </div>`);
  lines.push(`    </div>`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push(``);
  return lines.join("\n");
}

function emitNode(
  lines: string[],
  node: TreeNode,
  parent: TreeNode,
  indent: number,
  includeIds: boolean
) {
  const pad = " ".repeat(indent);

  const left = clampInt(node.rect.x - parent.rect.x);
  const top = clampInt(node.rect.y - parent.rect.y);
  const w = clampInt(node.rect.w);
  const h = clampInt(node.rect.h);

  const cls = `absolute rounded-md border border-zinc-700/60 bg-zinc-800/10`;
  const titleAttr = includeIds ? ` title="${escapeAttr(node.id)}"` : "";
  const dataAttr = includeIds ? ` data-node="${escapeAttr(node.id)}"` : "";

  lines.push(
    `${pad}<div className="${cls}" style={{ left: ${left}, top: ${top}, width: ${w}, height: ${h} }}${titleAttr}${dataAttr}>`
  );

  if (Array.isArray(node.children) && node.children.length) {
    for (const c of node.children) emitNode(lines, c, node, indent + 2, includeIds);
  }

  lines.push(`${pad}</div>`);
}

function clampInt(v: number) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.round(v));
}
function escapeAttr(s: string) {
  return String(s).replace(/"/g, "&quot;");
}
function sanitizeComponentName(s: string) {
  const cleaned = (s || "Generated").replace(/[^a-zA-Z0-9_]/g, "");
  const cap = cleaned ? cleaned[0].toUpperCase() + cleaned.slice(1) : "Generated";
  return /^[A-Z]/.test(cap) ? cap : `C${cap}`;
}
