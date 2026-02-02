import { TreeNode } from "@/lib/blueprint/layout-tree";

export interface SectionDefinition {
  id: string;
  trigger: string[];
  intent: string;
  node: TreeNode;
}

export interface Registry {
  sections: SectionDefinition[];
}

/**
 * DETERMINISTIC ENGINE BRAIN
 * Rules: Insert-only, No overwrite, One-way derivation.
 */
export class BlueprintEngine {
  static applyCall(
    doc: { root: TreeNode },
    call: { call: string; args: any },
    registry: Registry,
  ): { root: TreeNode } {
    if (call.call !== "insertSection") return doc;

    const section = registry.sections.find((s) => s.id === call.args.sectionId);
    if (!section) {
      console.warn(
        `Engine: Section ${call.args.sectionId} not found in registry.`,
      );
      return doc;
    }

    // Deterministic Deep Clone
    const next = JSON.parse(JSON.stringify(doc));

    // Logic: Append if no target, otherwise Insert Below
    if (call.args.mode === "append" || !call.args.targetId) {
      next.root.children = [...(next.root.children || []), section.node];
    } else {
      const parent = next.root;
      const index =
        parent.children?.findIndex((n: any) => n.id === call.args.targetId) ??
        -1;

      if (index >= 0) {
        parent.children.splice(index + 1, 0, section.node);
      } else {
        // Fallback to append
        parent.children = [...(parent.children || []), section.node];
      }
    }

    return next;
  }
}
