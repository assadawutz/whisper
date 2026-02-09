/**
 * 🎨 WHISPER DESIGN-TO-TAILWIND PIPELINE
 * Converts UI designs to Tailwind CSS with self-learning optimization
 */

import { nanoid } from "nanoid";

export interface DesignElement {
  id: string;
  type:
    | "container"
    | "text"
    | "button"
    | "input"
    | "image"
    | "icon"
    | "list"
    | "card"
    | "nav"
    | "unknown";
  bounds: { x: number; y: number; width: number; height: number };
  style: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontWeight?: string;
    borderRadius?: number;
    border?: string;
    shadow?: string;
    padding?: { top: number; right: number; bottom: number; left: number };
    margin?: { top: number; right: number; bottom: number; left: number };
  };
  content?: string;
  children?: DesignElement[];
}

export interface TailwindOutput {
  className: string;
  jsx: string;
  componentName?: string;
}

export interface PipelineStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  result?: any;
  error?: string;
  duration?: number;
}

export interface PipelineResult {
  success: boolean;
  elements: DesignElement[];
  tailwindCode: string;
  steps: PipelineStep[];
  learnings: string[];
  totalDuration: number;
}

// Color conversion helpers
const rgbToTailwind = (color: string): string => {
  const colorMap: Record<string, string> = {
    "#ffffff": "white",
    "#000000": "black",
    "#f8fafc": "slate-50",
    "#f1f5f9": "slate-100",
    "#e2e8f0": "slate-200",
    "#1e293b": "slate-800",
    "#0f172a": "slate-900",
    "#6366f1": "indigo-500",
    "#4f46e5": "indigo-600",
    "#8b5cf6": "violet-500",
    "#a855f7": "purple-500",
    "#10b981": "emerald-500",
    "#f59e0b": "amber-500",
    "#ef4444": "rose-500",
  };

  const normalized = color.toLowerCase();
  return colorMap[normalized] || `[${color}]`;
};

const sizeToPadding = (size: number): string => {
  if (size <= 2) return "0.5";
  if (size <= 4) return "1";
  if (size <= 8) return "2";
  if (size <= 12) return "3";
  if (size <= 16) return "4";
  if (size <= 20) return "5";
  if (size <= 24) return "6";
  if (size <= 32) return "8";
  if (size <= 48) return "12";
  return "16";
};

const sizeToRounded = (radius: number): string => {
  if (radius <= 0) return "none";
  if (radius <= 2) return "sm";
  if (radius <= 4) return "";
  if (radius <= 8) return "lg";
  if (radius <= 12) return "xl";
  if (radius <= 16) return "2xl";
  if (radius <= 24) return "3xl";
  return "full";
};

class WhisperDesignPipeline {
  private learnings: Map<string, any> = new Map();
  private history: PipelineResult[] = [];

  constructor() {
    this.loadLearnings();
  }

  private loadLearnings() {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("whisper_design_pipeline");
      if (saved) {
        const data = JSON.parse(saved);
        this.learnings = new Map(Object.entries(data.learnings || {}));
        this.history = data.history || [];
      }
    } catch (err) {
      console.warn("Failed to load pipeline learnings:", err);
    }
  }

  private saveLearnings() {
    if (typeof window === "undefined") return;
    try {
      const data = {
        learnings: Object.fromEntries(this.learnings),
        history: this.history.slice(-50),
      };
      localStorage.setItem("whisper_design_pipeline", JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to save pipeline learnings:", err);
    }
  }

  /**
   * Run the full design-to-Tailwind pipeline
   */
  async runPipeline(elements: DesignElement[]): Promise<PipelineResult> {
    const steps: PipelineStep[] = [
      { id: "1", name: "Analyze Structure", status: "pending", progress: 0 },
      { id: "2", name: "Extract Styles", status: "pending", progress: 0 },
      { id: "3", name: "Map to Tailwind", status: "pending", progress: 0 },
      { id: "4", name: "Generate JSX", status: "pending", progress: 0 },
      { id: "5", name: "Optimize Output", status: "pending", progress: 0 },
    ];

    const startTime = Date.now();
    const learnings: string[] = [];

    try {
      // Step 1: Analyze Structure
      steps[0].status = "running";
      const analyzed = await this.analyzeStructure(elements);
      steps[0].status = "completed";
      steps[0].progress = 100;
      steps[0].result = analyzed;

      // Step 2: Extract Styles
      steps[1].status = "running";
      const styles = await this.extractStyles(analyzed);
      steps[1].status = "completed";
      steps[1].progress = 100;
      steps[1].result = styles;

      // Step 3: Map to Tailwind
      steps[2].status = "running";
      const tailwindClasses = await this.mapToTailwind(analyzed, styles);
      steps[2].status = "completed";
      steps[2].progress = 100;
      steps[2].result = tailwindClasses;

      // Step 4: Generate JSX
      steps[3].status = "running";
      const jsx = await this.generateJSX(analyzed, tailwindClasses);
      steps[3].status = "completed";
      steps[3].progress = 100;
      steps[3].result = jsx;

      // Step 5: Optimize
      steps[4].status = "running";
      const optimized = await this.optimizeOutput(jsx);
      steps[4].status = "completed";
      steps[4].progress = 100;
      steps[4].result = optimized;

      // Record learnings
      learnings.push(`Processed ${elements.length} elements`);
      learnings.push(`Generated ${optimized.split("\n").length} lines of code`);

      const result: PipelineResult = {
        success: true,
        elements: analyzed,
        tailwindCode: optimized,
        steps,
        learnings,
        totalDuration: Date.now() - startTime,
      };

      this.recordSuccess(result);
      return result;
    } catch (err: any) {
      const failedStep = steps.find((s) => s.status === "running");
      if (failedStep) {
        failedStep.status = "failed";
        failedStep.error = err.message;
      }

      this.recordFailure(err.message);

      return {
        success: false,
        elements,
        tailwindCode: "",
        steps,
        learnings: [`❌ Failed: ${err.message}`],
        totalDuration: Date.now() - startTime,
      };
    }
  }

  private async analyzeStructure(
    elements: DesignElement[],
  ): Promise<DesignElement[]> {
    // Enhance elements with learned patterns
    return elements.map((el) => {
      const learned = this.learnings.get(`type:${el.type}`);
      if (learned) {
        // Apply learned improvements
        return { ...el, ...learned };
      }
      return el;
    });
  }

  private async extractStyles(
    elements: DesignElement[],
  ): Promise<Map<string, any>> {
    const styles = new Map<string, any>();

    for (const el of elements) {
      styles.set(el.id, {
        ...el.style,
        type: el.type,
      });
    }

    return styles;
  }

  private async mapToTailwind(
    elements: DesignElement[],
    styles: Map<string, any>,
  ): Promise<Map<string, string>> {
    const classes = new Map<string, string>();

    for (const el of elements) {
      const style = styles.get(el.id) || {};
      const classList: string[] = [];

      // Background color
      if (style.backgroundColor) {
        classList.push(`bg-${rgbToTailwind(style.backgroundColor)}`);
      }

      // Text color
      if (style.textColor) {
        classList.push(`text-${rgbToTailwind(style.textColor)}`);
      }

      // Font size
      if (style.fontSize) {
        if (style.fontSize <= 12) classList.push("text-xs");
        else if (style.fontSize <= 14) classList.push("text-sm");
        else if (style.fontSize <= 16) classList.push("text-base");
        else if (style.fontSize <= 18) classList.push("text-lg");
        else if (style.fontSize <= 20) classList.push("text-xl");
        else if (style.fontSize <= 24) classList.push("text-2xl");
        else classList.push("text-3xl");
      }

      // Font weight
      if (style.fontWeight === "bold") classList.push("font-bold");
      else if (style.fontWeight === "medium") classList.push("font-medium");

      // Border radius
      if (style.borderRadius) {
        const rounded = sizeToRounded(style.borderRadius);
        classList.push(rounded ? `rounded-${rounded}` : "rounded");
      }

      // Padding
      if (style.padding) {
        const p = style.padding;
        if (p.top === p.bottom && p.left === p.right && p.top === p.left) {
          classList.push(`p-${sizeToPadding(p.top)}`);
        } else {
          if (p.top === p.bottom) classList.push(`py-${sizeToPadding(p.top)}`);
          if (p.left === p.right) classList.push(`px-${sizeToPadding(p.left)}`);
        }
      }

      // Type-specific classes
      switch (el.type) {
        case "button":
          classList.push("cursor-pointer", "transition-all");
          break;
        case "input":
          classList.push("focus:outline-none", "focus:ring-2");
          break;
        case "card":
          classList.push("border", "border-white/10");
          break;
        case "container":
          classList.push("flex", "flex-col");
          break;
      }

      classes.set(el.id, classList.join(" "));
    }

    return classes;
  }

  private async generateJSX(
    elements: DesignElement[],
    classes: Map<string, string>,
  ): Promise<string> {
    const lines: string[] = [];

    const renderElement = (el: DesignElement, indent = 0): string => {
      const pad = "  ".repeat(indent);
      const className = classes.get(el.id) || "";
      const tag = this.getTag(el.type);

      let jsx = `${pad}<${tag} className="${className}"`;

      if (el.type === "input") {
        jsx += ` placeholder="${el.content || ""}"`;
      }

      if (el.children && el.children.length > 0) {
        jsx += ">\n";
        for (const child of el.children) {
          jsx += renderElement(child, indent + 1) + "\n";
        }
        jsx += `${pad}</${tag}>`;
      } else if (el.content) {
        jsx += `>${el.content}</${tag}>`;
      } else {
        jsx += " />";
      }

      return jsx;
    };

    for (const el of elements) {
      lines.push(renderElement(el));
    }

    return lines.join("\n");
  }

  private getTag(type: DesignElement["type"]): string {
    switch (type) {
      case "button":
        return "button";
      case "input":
        return "input";
      case "image":
        return "img";
      case "text":
        return "p";
      case "nav":
        return "nav";
      case "list":
        return "ul";
      default:
        return "div";
    }
  }

  private async optimizeOutput(code: string): Promise<string> {
    // Apply learned optimizations
    let optimized = code;

    // Remove duplicate classes
    optimized = optimized.replace(/className="([^"]+)"/g, (match, classes) => {
      const unique = [...new Set(classes.split(" "))];
      return `className="${unique.join(" ")}"`;
    });

    return optimized;
  }

  private recordSuccess(result: PipelineResult) {
    // Update learnings
    for (const el of result.elements) {
      const key = `type:${el.type}`;
      const current = this.learnings.get(key) || { successCount: 0 };
      current.successCount++;
      this.learnings.set(key, current);
    }

    this.history.push(result);
    this.saveLearnings();
  }

  private recordFailure(error: string) {
    const key = `error:${error.slice(0, 50)}`;
    const current = this.learnings.get(key) || { count: 0 };
    current.count++;
    this.learnings.set(key, current);
    this.saveLearnings();
  }

  /**
   * Get pipeline stats
   */
  getStats() {
    const successCount = this.history.filter((h) => h.success).length;
    const totalCount = this.history.length;

    return {
      totalRuns: totalCount,
      successRate:
        totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0,
      avgDuration:
        totalCount > 0
          ? Math.round(
              this.history.reduce((sum, h) => sum + h.totalDuration, 0) /
                totalCount,
            )
          : 0,
      learningsCount: this.learnings.size,
    };
  }

  /**
   * Export learnings
   */
  exportLearnings() {
    return Object.fromEntries(this.learnings);
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
    this.saveLearnings();
  }
}

export const designPipeline = new WhisperDesignPipeline();
