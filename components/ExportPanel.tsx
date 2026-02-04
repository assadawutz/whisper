"use client";
import type { BlueprintSession } from "@/types/blueprint";
import { buildContainmentTree } from "@/lib/tree";
import { generateTsxFromTree } from "@/lib/generateTsx";
import { downloadTextFile } from "@/lib/download";

export function ExportPanel({ session }: { session: BlueprintSession | null }) {
  const disabled =
    !session ||
    !session.image?.width ||
    !session.image?.height ||
    !Array.isArray(session.nodes) ||
    session.nodes.length === 0;

  function onExport() {
    if (!session) return;
    const w = session.image.width;
    const h = session.image.height;
    if (!w || !h) return;

    const tree = buildContainmentTree(session.nodes, { w, h });
    const tsx = generateTsxFromTree(tree, {
      componentName: "GeneratedFromBlueprint",
      includeDebugIds: true,
    });

    downloadTextFile("GeneratedFromBlueprint.tsx", tsx, "text/plain;charset=utf-8");
    downloadTextFile(
      `session.${session.id}.json`,
      JSON.stringify(session, null, 2),
      "application/json;charset=utf-8"
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <button
        className="rounded-lg bg-indigo-600 px-3 py-2 text-sm disabled:opacity-50"
        disabled={disabled}
        onClick={onExport}
      >
        Export TSX + JSON (Hierarchy)
      </button>
      <div className="text-xs text-zinc-400">
        Export = absolute 1:1 + tree (containment). ใช้ diff ผ่านก่อนค่อย refactor เป็น flex/grid.
      </div>
    </div>
  );
}
