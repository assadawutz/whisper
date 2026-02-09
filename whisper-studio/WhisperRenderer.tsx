import React from "react";
import { TreeNode } from "@/lib/blueprint/layout-tree";
import * as Library from "@/blueprint/nodes/Library";

/**
 * THE ASSEMBLER (Blueprint Renderer)
 * Converts Blueprint JSON nodes into live React components.
 * Follows the "One-way derivation" rule.
 */
export function BlueprintRenderer({ tree }: { tree: TreeNode }) {
  return <RenderNode node={tree} />;
}

function RenderNode({ node }: { node: TreeNode }) {
  // Resolve component from Library. Search by Type (Capitalized) or exact name.
  const Component =
    (Library as any)[node.type.charAt(0).toUpperCase() + node.type.slice(1)] ||
    (Library as any)[node.type];

  // Fallback Mapping for Core Primitives
  let FinalComponent = Component;
  if (!FinalComponent) {
    if (node.type === "container")
      FinalComponent = ({ children, className }: any) => (
        <div className={className}>{children}</div>
      );
    if (node.type === "section")
      FinalComponent = ({ children, className }: any) => (
        <section className={className}>{children}</section>
      );
    if (node.type === "grid") FinalComponent = Library.Grid3;
  }

  const children =
    node.children?.map((child) => <RenderNode key={child.id} node={child} />) ||
    [];

  if (!FinalComponent) {
    return (
      <div className="p-4 border border-dashed border-red-500/20 text-[10px] text-red-500 font-mono">
        Missing_Entity::{node.type}
      </div>
    );
  }

  // Inject props and styling
  const props: any = { ...node.props, className: node.className, id: node.id };

  // Dynamic Content Resolution (Heuristics)
  if (node.type === "hero" && node.instruction) {
    props.title = node.instruction;
    props.subtitle = "Engineered via Whisper Vision Synthesis.";
    props.ctaText = "Explore Workspace";
  }
  if (node.type === "card" && node.instruction) {
    props.title = node.instruction;
    props.description = "Atomic component generated from spatial analysis.";
  }

  return <FinalComponent {...props}>{children}</FinalComponent>;
}
