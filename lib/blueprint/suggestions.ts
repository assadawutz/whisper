export interface Suggestion {
  label: string;
  value: string;
}

export class BlueprintExtensionHelper {
  static getGhostHint(type: string, instruction: string): string {
    const hints: Record<string, string[]> = {
      container: [
        "make it centered with glass effect",
        "add vertical spacing",
        "full screen height",
      ],
      hero: [
        "add a dark overlay",
        "centered text with bold typography",
        "parallax background",
      ],
      card: ["floating shadow", "hover lift effect", "rounded borders"],
      button: [
        "pulsing animation",
        "glassmorphism style",
        "gradient background",
      ],
    };

    if (!instruction) return "";
    const typeHints = hints[type] || [];
    return typeHints.find((h) => h.startsWith(instruction.toLowerCase())) || "";
  }

  static suggestTailwind(input: string): Suggestion[] {
    const common = [
      { label: "Glass Effect", value: "glass" },
      { label: "Banner Slider", value: "banner" },
      { label: "Card Float", value: "card-float" },
      { label: "Rounded Premium", value: "rounded-premium" },
      { label: "Shadow Premium", value: "shadow-premium" },
      { label: "Brand Primary", value: "bg-brand-primary" },
      { label: "Brand Secondary", value: "bg-brand-secondary" },
      { label: "Flex Center", value: "flex items-center justify-center" },
      { label: "Grid 3 Cols", value: "grid grid-cols-3" },
    ];

    return common.filter(
      (s) =>
        s.label.toLowerCase().includes(input.toLowerCase()) ||
        s.value.toLowerCase().includes(input.toLowerCase()),
    );
  }
}
