import { TreeNode } from "@/lib/blueprint/layout-tree";

/**
 * Mock Vision Engine that simulates structural extraction from UIs.
 */
export class BlueprintVisionEngine {
  static async extractStructureFromImage(imageUrl: string): Promise<TreeNode> {
    console.log("Extracting structure from:", imageUrl);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Return a mock complex structure
    return {
      id: "extracted-root",
      type: "container",
      className: "bg-surface-100 p-20",
      children: [
        {
          id: "vision-nav",
          type: "navbar",
          meta: { y: 5 }, // 5% from top
          props: {
            logo: "WHISPER_AI",
            links: [
              { label: "Architecture", href: "#vision-hero" },
              { label: "Synthesis", href: "#vision-grid" },
              { label: "Documentation", href: "#vision-footer" },
            ],
          },
        },
        {
          id: "vision-hero",
          type: "hero",
          meta: { y: 25 }, // hits here
          instruction: "Modern Digital Experience",
          className: "gradient-bg",
        },
        {
          id: "vision-grid",
          type: "grid",
          meta: { y: 60 },
          children: [
            {
              id: "v-card-1",
              type: "card",
              meta: { y: 60 },
              instruction: "Advanced Analytics",
            },
            {
              id: "v-card-2",
              type: "card",
              meta: { y: 60 },
              instruction: "Cloud Infrastructure",
            },
            {
              id: "v-card-3",
              type: "card",
              meta: { y: 60 },
              instruction: "Vision AI Integration",
            },
          ],
        },
        {
          id: "vision-footer",
          type: "footer",
          meta: { y: 90 },
          className: "bg-brand-primary text-white",
        },
      ],
    };
  }
}
