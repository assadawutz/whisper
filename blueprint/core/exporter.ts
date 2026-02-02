import { TreeNode } from "@/lib/blueprint/layout-tree";

/**
 * ONE-WAY EXPORTER
 * READS document -> EXPORTS artifact.
 * NEVER writes back to the core document.
 */
export class BlueprintExporter {
  /**
   * Export to a raw HTML string with Tailwind classes
   */
  static toFullHTML(tree: TreeNode): string {
    const render = (node: TreeNode): string => {
      const children = node.children?.map(render).join("") || "";
      const tagName =
        node.type === "section" || node.type === "container"
          ? "div"
          : "section";
      return `<${tagName} class="${node.className || ""}" id="${node.id}">${children}</${tagName}>`;
    };

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Whisper Exported Page</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
              body { background: #fafbfc; color: #0a0b0d; font-family: sans-serif; }
          </style>
      </head>
      <body>
          ${render(tree)}
      </body>
      </html>
    `.trim();
  }

  /**
   * Export to a Tailwind-only manifest for external build systems
   */
  static toTailwindManifest(tree: TreeNode) {
    const classes = new Set<string>();
    const extract = (node: TreeNode) => {
      node.className?.split(" ").forEach((c) => classes.add(c));
      node.children?.forEach(extract);
    };
    extract(tree);
    return Array.from(classes);
  }
}
