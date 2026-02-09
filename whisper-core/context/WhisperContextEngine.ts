/**
 * 🎯 WHISPER CONTEXT ENGINE
 * Tracks cursor position, text context, and provides intelligent suggestions
 */

export interface CursorContext {
  line: number;
  column: number;
  lineText: string;
  wordAtCursor: string;
  textBefore: string;
  textAfter: string;
  selection?: string;
  fileType?: string;
  timestamp: number;
}

export interface Shortcut {
  id: string;
  trigger: string; // e.g., "ctrl+shift+p"
  action: string;
  description: string;
  category: string;
  usageCount: number;
  lastUsed: number;
}

export interface Combo {
  id: string;
  sequence: string; // e.g., "div>ul>li" or "..btn"
  expansion: string;
  description: string;
  category: string;
  usageCount: number;
}

export interface Hint {
  id: string;
  pattern: string; // Regex or keyword
  message: string;
  type: "info" | "warning" | "tip" | "error";
  priority: number;
}

export interface GhostText {
  id: string;
  trigger: string;
  preview: string;
  fullText: string;
  confidence: number;
}

export interface InlineSuggestion {
  id: string;
  context: string; // Context pattern
  suggestions: string[];
  priority: number;
  learned: boolean;
}

export interface ContextEngineState {
  shortcuts: Shortcut[];
  combos: Combo[];
  hints: Hint[];
  ghostTexts: GhostText[];
  suggestions: InlineSuggestion[];
  recentContexts: CursorContext[];
  learnings: Map<string, number>; // pattern -> frequency
}

const STORAGE_KEY = "whisper_context_engine";

class WhisperContextEngine {
  private state: ContextEngineState = {
    shortcuts: [],
    combos: [],
    hints: [],
    ghostTexts: [],
    suggestions: [],
    recentContexts: [],
    learnings: new Map(),
  };

  constructor() {
    this.load();
    this.initDefaults();
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.state = {
          ...this.state,
          ...data,
          learnings: new Map(Object.entries(data.learnings || {})),
        };
      }
    } catch (err) {
      console.warn("Failed to load context engine:", err);
    }
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      const data = {
        ...this.state,
        learnings: Object.fromEntries(this.state.learnings),
        recentContexts: this.state.recentContexts.slice(-100),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to save context engine:", err);
    }
  }

  private initDefaults() {
    if (this.state.shortcuts.length === 0) {
      this.state.shortcuts = [
        {
          id: "s1",
          trigger: "ctrl+shift+p",
          action: "command_palette",
          description: "เปิด Command Palette",
          category: "navigation",
          usageCount: 0,
          lastUsed: 0,
        },
        {
          id: "s2",
          trigger: "ctrl+/",
          action: "toggle_comment",
          description: "Toggle Comment",
          category: "editing",
          usageCount: 0,
          lastUsed: 0,
        },
        {
          id: "s3",
          trigger: "ctrl+d",
          action: "select_next",
          description: "Select Next Occurrence",
          category: "selection",
          usageCount: 0,
          lastUsed: 0,
        },
        {
          id: "s4",
          trigger: "alt+up",
          action: "move_line_up",
          description: "Move Line Up",
          category: "editing",
          usageCount: 0,
          lastUsed: 0,
        },
        {
          id: "s5",
          trigger: "ctrl+shift+k",
          action: "delete_line",
          description: "Delete Line",
          category: "editing",
          usageCount: 0,
          lastUsed: 0,
        },
      ];
    }

    if (this.state.combos.length === 0) {
      this.state.combos = [
        // ===== COMPONENTS =====
        {
          id: "c1",
          sequence: "..btn",
          expansion:
            '<button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all">Button</button>',
          description: "Primary Button",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c2",
          sequence: "..btn-outline",
          expansion:
            '<button className="px-4 py-2 rounded-lg border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 transition-all">Button</button>',
          description: "Outline Button",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c3",
          sequence: "..btn-ghost",
          expansion:
            '<button className="px-4 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all">Button</button>',
          description: "Ghost Button",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c4",
          sequence: "..btn-icon",
          expansion:
            '<button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"><Icon size={18} /></button>',
          description: "Icon Button",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c5",
          sequence: "..card",
          expansion:
            '<div className="p-6 rounded-2xl bg-white/5 border border-white/10">\n  <h3 className="text-lg font-bold">Title</h3>\n  <p className="text-sm text-slate-400">Content</p>\n</div>',
          description: "Card Component",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c6",
          sequence: "..card-glass",
          expansion:
            '<div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">\n  Content\n</div>',
          description: "Glassmorphism Card",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c7",
          sequence: "..input",
          expansion:
            '<input type="text" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-all" placeholder="" />',
          description: "Text Input",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c8",
          sequence: "..textarea",
          expansion:
            '<textarea className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none transition-all" rows={4} placeholder="" />',
          description: "Textarea",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c9",
          sequence: "..select",
          expansion:
            '<select className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none">\n  <option value="">Select...</option>\n</select>',
          description: "Select Dropdown",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c10",
          sequence: "..badge",
          expansion:
            '<span className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">Badge</span>',
          description: "Badge",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c11",
          sequence: "..avatar",
          expansion:
            '<div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">A</div>',
          description: "Avatar",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c12",
          sequence: "..modal",
          expansion:
            '<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">\n  <div className="bg-[#0a0b0d] border border-white/10 rounded-2xl p-6 w-[500px] max-w-[90vw]">\n    Content\n  </div>\n</div>',
          description: "Modal",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c13",
          sequence: "..tooltip",
          expansion:
            '<div className="relative group">\n  <span>Hover me</span>\n  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-lg bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">\n    Tooltip\n  </div>\n</div>',
          description: "Tooltip",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c14",
          sequence: "..dropdown",
          expansion:
            '<div className="relative">\n  <button className="px-4 py-2 rounded-lg bg-white/5">Dropdown</button>\n  <div className="absolute top-full mt-2 w-48 rounded-xl bg-[#0a0b0d] border border-white/10 shadow-xl py-2">\n    <button className="w-full px-4 py-2 text-left hover:bg-white/5">Item 1</button>\n    <button className="w-full px-4 py-2 text-left hover:bg-white/5">Item 2</button>\n  </div>\n</div>',
          description: "Dropdown Menu",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c15",
          sequence: "..tabs",
          expansion:
            '<div className="flex gap-2">\n  <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Tab 1</button>\n  <button className="px-4 py-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10">Tab 2</button>\n</div>',
          description: "Tabs",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c16",
          sequence: "..progress",
          expansion:
            '<div className="h-2 bg-white/10 rounded-full overflow-hidden">\n  <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: "50%" }} />\n</div>',
          description: "Progress Bar",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c17",
          sequence: "..spinner",
          expansion:
            '<div className="w-6 h-6 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />',
          description: "Loading Spinner",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c18",
          sequence: "..skeleton",
          expansion:
            '<div className="h-4 bg-white/10 rounded animate-pulse" />',
          description: "Skeleton Loader",
          category: "components",
          usageCount: 0,
        },

        // ===== LAYOUT =====
        {
          id: "c20",
          sequence: "..flex-center",
          expansion: 'className="flex items-center justify-center"',
          description: "Flex Center",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c21",
          sequence: "..flex-between",
          expansion: 'className="flex items-center justify-between"',
          description: "Flex Space Between",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c22",
          sequence: "..flex-col",
          expansion: 'className="flex flex-col"',
          description: "Flex Column",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c23",
          sequence: "..flex-wrap",
          expansion: 'className="flex flex-wrap gap-4"',
          description: "Flex Wrap",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c24",
          sequence: "..grid-2",
          expansion: 'className="grid grid-cols-2 gap-4"',
          description: "2-Column Grid",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c25",
          sequence: "..grid-3",
          expansion: 'className="grid grid-cols-3 gap-4"',
          description: "3-Column Grid",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c26",
          sequence: "..grid-4",
          expansion: 'className="grid grid-cols-4 gap-4"',
          description: "4-Column Grid",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c27",
          sequence: "..grid-auto",
          expansion:
            'className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4"',
          description: "Auto Grid",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c28",
          sequence: "..container",
          expansion: 'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"',
          description: "Container",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c29",
          sequence: "..section",
          expansion:
            '<section className="py-16 md:py-24">\n  <div className="max-w-7xl mx-auto px-6">\n    Content\n  </div>\n</section>',
          description: "Page Section",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c30",
          sequence: "..stack",
          expansion: 'className="flex flex-col gap-4"',
          description: "Stack",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c31",
          sequence: "..absolute-center",
          expansion:
            'className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"',
          description: "Absolute Center",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c32",
          sequence: "..fixed-bottom",
          expansion: 'className="fixed bottom-0 left-0 right-0"',
          description: "Fixed Bottom",
          category: "layout",
          usageCount: 0,
        },
        {
          id: "c33",
          sequence: "..sticky-top",
          expansion: 'className="sticky top-0 z-50"',
          description: "Sticky Top",
          category: "layout",
          usageCount: 0,
        },

        // ===== TYPOGRAPHY =====
        {
          id: "c40",
          sequence: "..h1",
          expansion:
            '<h1 className="text-4xl md:text-5xl font-black">Heading</h1>',
          description: "Heading 1",
          category: "typography",
          usageCount: 0,
        },
        {
          id: "c41",
          sequence: "..h2",
          expansion:
            '<h2 className="text-3xl md:text-4xl font-bold">Heading</h2>',
          description: "Heading 2",
          category: "typography",
          usageCount: 0,
        },
        {
          id: "c42",
          sequence: "..h3",
          expansion:
            '<h3 className="text-xl md:text-2xl font-bold">Heading</h3>',
          description: "Heading 3",
          category: "typography",
          usageCount: 0,
        },
        {
          id: "c43",
          sequence: "..text-gradient",
          expansion:
            'className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"',
          description: "Gradient Text",
          category: "typography",
          usageCount: 0,
        },
        {
          id: "c44",
          sequence: "..text-muted",
          expansion: 'className="text-sm text-slate-400"',
          description: "Muted Text",
          category: "typography",
          usageCount: 0,
        },
        {
          id: "c45",
          sequence: "..text-xs",
          expansion: 'className="text-xs text-slate-500"',
          description: "Extra Small Text",
          category: "typography",
          usageCount: 0,
        },
        {
          id: "c46",
          sequence: "..truncate",
          expansion: 'className="truncate"',
          description: "Truncate Text",
          category: "typography",
          usageCount: 0,
        },
        {
          id: "c47",
          sequence: "..line-clamp-2",
          expansion: 'className="line-clamp-2"',
          description: "Line Clamp 2",
          category: "typography",
          usageCount: 0,
        },

        // ===== EFFECTS =====
        {
          id: "c50",
          sequence: "..shadow",
          expansion: 'className="shadow-xl"',
          description: "Shadow",
          category: "effects",
          usageCount: 0,
        },
        {
          id: "c51",
          sequence: "..shadow-glow",
          expansion: 'className="shadow-[0_0_30px_rgba(99,102,241,0.3)]"',
          description: "Glow Shadow",
          category: "effects",
          usageCount: 0,
        },
        {
          id: "c52",
          sequence: "..blur",
          expansion: 'className="backdrop-blur-xl"',
          description: "Backdrop Blur",
          category: "effects",
          usageCount: 0,
        },
        {
          id: "c53",
          sequence: "..gradient-bg",
          expansion:
            'className="bg-gradient-to-br from-indigo-600 to-purple-700"',
          description: "Gradient Background",
          category: "effects",
          usageCount: 0,
        },
        {
          id: "c54",
          sequence: "..hover-scale",
          expansion: 'className="transition-transform hover:scale-105"',
          description: "Hover Scale",
          category: "effects",
          usageCount: 0,
        },
        {
          id: "c55",
          sequence: "..hover-lift",
          expansion:
            'className="transition-all hover:-translate-y-1 hover:shadow-xl"',
          description: "Hover Lift",
          category: "effects",
          usageCount: 0,
        },
        {
          id: "c56",
          sequence: "..animate-fade",
          expansion: 'className="animate-[fadeIn_0.3s_ease-out]"',
          description: "Fade Animation",
          category: "effects",
          usageCount: 0,
        },
        {
          id: "c57",
          sequence: "..animate-slide",
          expansion: 'className="animate-[slideUp_0.3s_ease-out]"',
          description: "Slide Animation",
          category: "effects",
          usageCount: 0,
        },
        {
          id: "c58",
          sequence: "..ring",
          expansion:
            'className="ring-2 ring-indigo-500 ring-offset-2 ring-offset-black"',
          description: "Focus Ring",
          category: "effects",
          usageCount: 0,
        },
        {
          id: "c59",
          sequence: "..border-gradient",
          expansion:
            'className="relative before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-r before:from-indigo-500 before:to-purple-500 before:-z-10"',
          description: "Gradient Border",
          category: "effects",
          usageCount: 0,
        },

        // ===== SPACING =====
        {
          id: "c60",
          sequence: "..p-4",
          expansion: 'className="p-4"',
          description: "Padding 4",
          category: "spacing",
          usageCount: 0,
        },
        {
          id: "c61",
          sequence: "..p-6",
          expansion: 'className="p-6"',
          description: "Padding 6",
          category: "spacing",
          usageCount: 0,
        },
        {
          id: "c62",
          sequence: "..px-4",
          expansion: 'className="px-4"',
          description: "Padding X 4",
          category: "spacing",
          usageCount: 0,
        },
        {
          id: "c63",
          sequence: "..py-2",
          expansion: 'className="py-2"',
          description: "Padding Y 2",
          category: "spacing",
          usageCount: 0,
        },
        {
          id: "c64",
          sequence: "..m-auto",
          expansion: 'className="mx-auto"',
          description: "Margin Auto",
          category: "spacing",
          usageCount: 0,
        },
        {
          id: "c65",
          sequence: "..gap-4",
          expansion: 'className="gap-4"',
          description: "Gap 4",
          category: "spacing",
          usageCount: 0,
        },
        {
          id: "c66",
          sequence: "..space-y-4",
          expansion: 'className="space-y-4"',
          description: "Space Y 4",
          category: "spacing",
          usageCount: 0,
        },

        // ===== COLORS =====
        {
          id: "c70",
          sequence: "..bg-dark",
          expansion: 'className="bg-[#050608]"',
          description: "Dark Background",
          category: "colors",
          usageCount: 0,
        },
        {
          id: "c71",
          sequence: "..bg-card",
          expansion: 'className="bg-white/5"',
          description: "Card Background",
          category: "colors",
          usageCount: 0,
        },
        {
          id: "c72",
          sequence: "..bg-hover",
          expansion: 'className="bg-white/5 hover:bg-white/10"',
          description: "Hover Background",
          category: "colors",
          usageCount: 0,
        },
        {
          id: "c73",
          sequence: "..text-white",
          expansion: 'className="text-white"',
          description: "White Text",
          category: "colors",
          usageCount: 0,
        },
        {
          id: "c74",
          sequence: "..text-slate",
          expansion: 'className="text-slate-400"',
          description: "Slate Text",
          category: "colors",
          usageCount: 0,
        },
        {
          id: "c75",
          sequence: "..border-subtle",
          expansion: 'className="border border-white/10"',
          description: "Subtle Border",
          category: "colors",
          usageCount: 0,
        },
        {
          id: "c76",
          sequence: "..divide",
          expansion: 'className="divide-y divide-white/5"',
          description: "Divider",
          category: "colors",
          usageCount: 0,
        },

        // ===== RESPONSIVE =====
        {
          id: "c80",
          sequence: "..hide-mobile",
          expansion: 'className="hidden md:block"',
          description: "Hide on Mobile",
          category: "responsive",
          usageCount: 0,
        },
        {
          id: "c81",
          sequence: "..show-mobile",
          expansion: 'className="block md:hidden"',
          description: "Show on Mobile Only",
          category: "responsive",
          usageCount: 0,
        },
        {
          id: "c82",
          sequence: "..cols-responsive",
          expansion:
            'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"',
          description: "Responsive Columns",
          category: "responsive",
          usageCount: 0,
        },

        // ===== FULL COMPONENTS =====
        {
          id: "c90",
          sequence: "..nav",
          expansion:
            '<nav className="sticky top-0 z-50 px-6 py-4 bg-black/80 backdrop-blur-xl border-b border-white/5">\n  <div className="max-w-7xl mx-auto flex items-center justify-between">\n    <a href="/" className="text-xl font-black">Logo</a>\n    <div className="flex items-center gap-4">\n      <a href="#" className="text-sm text-slate-400 hover:text-white">Link</a>\n    </div>\n  </div>\n</nav>',
          description: "Navigation Bar",
          category: "full",
          usageCount: 0,
        },
        {
          id: "c91",
          sequence: "..hero",
          expansion:
            '<section className="min-h-screen flex items-center justify-center px-6">\n  <div className="text-center max-w-3xl">\n    <h1 className="text-5xl md:text-7xl font-black mb-6">Hero Title</h1>\n    <p className="text-xl text-slate-400 mb-8">Subtitle text goes here</p>\n    <button className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold">Get Started</button>\n  </div>\n</section>',
          description: "Hero Section",
          category: "full",
          usageCount: 0,
        },
        {
          id: "c92",
          sequence: "..footer",
          expansion:
            '<footer className="py-12 border-t border-white/5">\n  <div className="max-w-7xl mx-auto px-6">\n    <div className="flex items-center justify-between">\n      <span className="text-sm text-slate-500">© 2024 Company</span>\n      <div className="flex gap-4">\n        <a href="#" className="text-slate-400 hover:text-white">Link</a>\n      </div>\n    </div>\n  </div>\n</footer>',
          description: "Footer",
          category: "full",
          usageCount: 0,
        },
        {
          id: "c93",
          sequence: "..form",
          expansion:
            '<form className="space-y-4">\n  <div>\n    <label className="text-xs font-bold text-slate-400 block mb-1">Label</label>\n    <input type="text" className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none" />\n  </div>\n  <button type="submit" className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold">Submit</button>\n</form>',
          description: "Form",
          category: "full",
          usageCount: 0,
        },
        {
          id: "c94",
          sequence: "..sidebar",
          expansion:
            '<aside className="w-64 h-screen bg-black/30 border-r border-white/5 flex flex-col">\n  <div className="p-4 border-b border-white/5">\n    <span className="font-bold">Sidebar</span>\n  </div>\n  <nav className="flex-1 p-2">\n    <a href="#" className="block px-4 py-2 rounded-lg hover:bg-white/5">Item 1</a>\n    <a href="#" className="block px-4 py-2 rounded-lg hover:bg-white/5">Item 2</a>\n  </nav>\n</aside>',
          description: "Sidebar",
          category: "full",
          usageCount: 0,
        },
        {
          id: "c95",
          sequence: "..table",
          expansion:
            '<table className="w-full">\n  <thead>\n    <tr className="border-b border-white/10">\n      <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase">Column</th>\n    </tr>\n  </thead>\n  <tbody className="divide-y divide-white/5">\n    <tr className="hover:bg-white/[0.02]">\n      <td className="py-3 px-4">Data</td>\n    </tr>\n  </tbody>\n</table>',
          description: "Table",
          category: "full",
          usageCount: 0,
        },
      ];
    }

    if (this.state.hints.length === 0) {
      this.state.hints = [
        {
          id: "h1",
          pattern: "console.log",
          message: "💡 ลบ console.log ก่อน production",
          type: "warning",
          priority: 8,
        },
        {
          id: "h2",
          pattern: "TODO",
          message: "📝 มี TODO ที่ต้องทำ",
          type: "info",
          priority: 5,
        },
        {
          id: "h3",
          pattern: "FIXME",
          message: "⚠️ มี Bug ที่ต้องแก้",
          type: "error",
          priority: 9,
        },
        {
          id: "h4",
          pattern: "any",
          message: "💡 หลีกเลี่ยง any ใช้ Type ที่เฉพาะเจาะจง",
          type: "tip",
          priority: 6,
        },
      ];
    }
  }

  // ========== CURSOR TRACKING ==========

  updateCursorContext(context: Partial<CursorContext>) {
    const fullContext: CursorContext = {
      line: context.line || 0,
      column: context.column || 0,
      lineText: context.lineText || "",
      wordAtCursor: context.wordAtCursor || "",
      textBefore: context.textBefore || "",
      textAfter: context.textAfter || "",
      selection: context.selection,
      fileType: context.fileType,
      timestamp: Date.now(),
    };

    this.state.recentContexts.push(fullContext);
    this.learnFromContext(fullContext);
    this.save();

    return fullContext;
  }

  // ========== SELF-LEARNING ==========

  private learnFromContext(context: CursorContext) {
    // Learn word patterns
    if (context.wordAtCursor.length > 2) {
      const key = `word:${context.wordAtCursor}`;
      this.state.learnings.set(key, (this.state.learnings.get(key) || 0) + 1);
    }

    // Learn line patterns
    const linePattern = context.lineText.trim().slice(0, 30);
    if (linePattern.length > 5) {
      const key = `line:${linePattern}`;
      this.state.learnings.set(key, (this.state.learnings.get(key) || 0) + 1);
    }
  }

  recordUsage(type: "shortcut" | "combo" | "suggestion", id: string) {
    if (type === "shortcut") {
      const item = this.state.shortcuts.find((s) => s.id === id);
      if (item) {
        item.usageCount++;
        item.lastUsed = Date.now();
      }
    } else if (type === "combo") {
      const item = this.state.combos.find((c) => c.id === id);
      if (item) item.usageCount++;
    }
    this.save();
  }

  // ========== SUGGESTIONS ==========

  getSuggestions(context: CursorContext): InlineSuggestion[] {
    const results: InlineSuggestion[] = [];

    // Match combos
    for (const combo of this.state.combos) {
      if (
        context.textBefore.endsWith(combo.sequence) ||
        context.wordAtCursor.includes(combo.sequence.slice(2))
      ) {
        results.push({
          id: combo.id,
          context: combo.sequence,
          suggestions: [combo.expansion],
          priority: combo.usageCount + 10,
          learned: false,
        });
      }
    }

    // Match learned patterns
    const frequentPatterns = Array.from(this.state.learnings.entries())
      .filter(([key]) => key.startsWith("word:"))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    for (const [pattern, freq] of frequentPatterns) {
      const word = pattern.replace("word:", "");
      if (
        word.startsWith(context.wordAtCursor) &&
        word !== context.wordAtCursor
      ) {
        results.push({
          id: `learned_${word}`,
          context: context.wordAtCursor,
          suggestions: [word],
          priority: freq,
          learned: true,
        });
      }
    }

    return results.sort((a, b) => b.priority - a.priority);
  }

  getGhostText(context: CursorContext): GhostText | null {
    // Check combos
    for (const combo of this.state.combos) {
      if (context.textBefore.endsWith(combo.sequence.slice(0, -1))) {
        return {
          id: combo.id,
          trigger: combo.sequence,
          preview: combo.expansion.slice(0, 50) + "...",
          fullText: combo.expansion,
          confidence: 0.9,
        };
      }
    }
    return null;
  }

  getHints(context: CursorContext): Hint[] {
    return this.state.hints
      .filter((hint) => context.lineText.includes(hint.pattern))
      .sort((a, b) => b.priority - a.priority);
  }

  // ========== CRUD OPERATIONS ==========

  addShortcut(shortcut: Omit<Shortcut, "id" | "usageCount" | "lastUsed">) {
    const newShortcut: Shortcut = {
      ...shortcut,
      id: `s_${Date.now()}`,
      usageCount: 0,
      lastUsed: 0,
    };
    this.state.shortcuts.push(newShortcut);
    this.save();
    return newShortcut;
  }

  addCombo(combo: Omit<Combo, "id" | "usageCount">) {
    const newCombo: Combo = {
      ...combo,
      id: `c_${Date.now()}`,
      usageCount: 0,
    };
    this.state.combos.push(newCombo);
    this.save();
    return newCombo;
  }

  addHint(hint: Omit<Hint, "id">) {
    const newHint: Hint = {
      ...hint,
      id: `h_${Date.now()}`,
    };
    this.state.hints.push(newHint);
    this.save();
    return newHint;
  }

  deleteItem(type: "shortcut" | "combo" | "hint", id: string) {
    if (type === "shortcut") {
      this.state.shortcuts = this.state.shortcuts.filter((s) => s.id !== id);
    } else if (type === "combo") {
      this.state.combos = this.state.combos.filter((c) => c.id !== id);
    } else if (type === "hint") {
      this.state.hints = this.state.hints.filter((h) => h.id !== id);
    }
    this.save();
  }

  updateItem(type: "shortcut" | "combo" | "hint", id: string, data: any) {
    if (type === "shortcut") {
      const idx = this.state.shortcuts.findIndex((s) => s.id === id);
      if (idx >= 0)
        this.state.shortcuts[idx] = { ...this.state.shortcuts[idx], ...data };
    } else if (type === "combo") {
      const idx = this.state.combos.findIndex((c) => c.id === id);
      if (idx >= 0)
        this.state.combos[idx] = { ...this.state.combos[idx], ...data };
    } else if (type === "hint") {
      const idx = this.state.hints.findIndex((h) => h.id === id);
      if (idx >= 0)
        this.state.hints[idx] = { ...this.state.hints[idx], ...data };
    }
    this.save();
  }

  // ========== GETTERS ==========

  getShortcuts() {
    return this.state.shortcuts;
  }
  getCombos() {
    return this.state.combos;
  }
  getHintsAll() {
    return this.state.hints;
  }
  getLearnings() {
    return Object.fromEntries(this.state.learnings);
  }
  getRecentContexts() {
    return this.state.recentContexts.slice(-20);
  }

  getStats() {
    return {
      shortcuts: this.state.shortcuts.length,
      combos: this.state.combos.length,
      hints: this.state.hints.length,
      learnings: this.state.learnings.size,
      topShortcuts: this.state.shortcuts
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5),
      topCombos: this.state.combos
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5),
    };
  }

  exportData() {
    return {
      shortcuts: this.state.shortcuts,
      combos: this.state.combos,
      hints: this.state.hints,
      learnings: Object.fromEntries(this.state.learnings),
    };
  }

  importData(data: any) {
    if (data.shortcuts) this.state.shortcuts = data.shortcuts;
    if (data.combos) this.state.combos = data.combos;
    if (data.hints) this.state.hints = data.hints;
    if (data.learnings)
      this.state.learnings = new Map(Object.entries(data.learnings));
    this.save();
  }

  clearLearnings() {
    this.state.learnings.clear();
    this.state.recentContexts = [];
    this.save();
  }
}

export const contextEngine = new WhisperContextEngine();
