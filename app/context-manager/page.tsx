"use client";

import { useState, useEffect } from "react";
import {
  Keyboard,
  Zap,
  Lightbulb,
  Ghost,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Download,
  Upload,
  RotateCcw,
  Activity,
  Brain,
  TrendingUp,
} from "lucide-react";

// Types
interface Shortcut {
  id: string;
  trigger: string;
  action: string;
  description: string;
  category: string;
  usageCount: number;
}

interface Combo {
  id: string;
  sequence: string;
  expansion: string;
  description: string;
  category: string;
  usageCount: number;
}

interface Hint {
  id: string;
  pattern: string;
  message: string;
  type: "info" | "warning" | "tip" | "error";
  priority: number;
}

type TabType = "shortcuts" | "combos" | "hints" | "learnings";

const TABS = [
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "combos", label: "Combos", icon: Zap },
  { id: "hints", label: "Hints", icon: Lightbulb },
  { id: "learnings", label: "Learnings", icon: Brain },
];

const STORAGE_KEY = "whisper_context_engine";

export default function ContextManagerPage() {
  const [activeTab, setActiveTab] = useState<TabType>("shortcuts");
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [hints, setHints] = useState<Hint[]>([]);
  const [learnings, setLearnings] = useState<Record<string, number>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<any>({});

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setShortcuts(data.shortcuts || []);
      setCombos(data.combos || []);
      setHints(data.hints || []);
      setLearnings(data.learnings || {});
    } else {
      // Initialize defaults
      setShortcuts([
        {
          id: "s1",
          trigger: "ctrl+shift+p",
          action: "command_palette",
          description: "Command Palette",
          category: "navigation",
          usageCount: 0,
        },
        {
          id: "s2",
          trigger: "ctrl+/",
          action: "toggle_comment",
          description: "Toggle Comment",
          category: "editing",
          usageCount: 0,
        },
      ]);
      setCombos([
        {
          id: "c1",
          sequence: "..btn",
          expansion:
            '<button className="px-4 py-2 rounded-lg bg-indigo-600">Button</button>',
          description: "Tailwind Button",
          category: "components",
          usageCount: 0,
        },
        {
          id: "c2",
          sequence: "..card",
          expansion:
            '<div className="p-6 rounded-2xl bg-white/5 border border-white/10">Card</div>',
          description: "Tailwind Card",
          category: "components",
          usageCount: 0,
        },
      ]);
      setHints([
        {
          id: "h1",
          pattern: "console.log",
          message: "ลบ console.log ก่อน production",
          type: "warning",
          priority: 8,
        },
      ]);
    }
  };

  const saveData = () => {
    const data = { shortcuts, combos, hints, learnings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    saveData();
  }, [shortcuts, combos, hints]);

  // Add item
  const addItem = () => {
    const id = `${activeTab.charAt(0)}_${Date.now()}`;

    if (activeTab === "shortcuts") {
      setShortcuts([...shortcuts, { ...newItem, id, usageCount: 0 }]);
    } else if (activeTab === "combos") {
      setCombos([...combos, { ...newItem, id, usageCount: 0 }]);
    } else if (activeTab === "hints") {
      setHints([...hints, { ...newItem, id }]);
    }

    setShowAddModal(false);
    setNewItem({});
  };

  // Delete item
  const deleteItem = (id: string) => {
    if (activeTab === "shortcuts") {
      setShortcuts(shortcuts.filter((s) => s.id !== id));
    } else if (activeTab === "combos") {
      setCombos(combos.filter((c) => c.id !== id));
    } else if (activeTab === "hints") {
      setHints(hints.filter((h) => h.id !== id));
    }
  };

  // Export data
  const exportData = () => {
    const data = { shortcuts, combos, hints, learnings };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whisper-context-${Date.now()}.json`;
    a.click();
  };

  // Import data
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.shortcuts) setShortcuts(data.shortcuts);
        if (data.combos) setCombos(data.combos);
        if (data.hints) setHints(data.hints);
        if (data.learnings) setLearnings(data.learnings);
        alert("Import สำเร็จ!");
      } catch {
        alert("ไฟล์ไม่ถูกต้อง");
      }
    };
    reader.readAsText(file);
  };

  // Clear learnings
  const clearLearnings = () => {
    if (confirm("ล้างข้อมูล Self-Learning ทั้งหมด?")) {
      setLearnings({});
      saveData();
    }
  };

  // Stats
  const stats = {
    shortcuts: shortcuts.length,
    combos: combos.length,
    hints: hints.length,
    learnings: Object.keys(learnings).length,
    topUsed: [...shortcuts, ...combos]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5),
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Context Manager</h1>
              <p className="text-sm text-slate-500">
                จัดการ Shortcuts, Combos, Hints + Self-Learning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
              <Upload size={18} />
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
            <button
              onClick={exportData}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10"
            >
              <Download size={18} />
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Shortcuts",
              value: stats.shortcuts,
              icon: Keyboard,
              color: "indigo",
            },
            {
              label: "Combos",
              value: stats.combos,
              icon: Zap,
              color: "emerald",
            },
            {
              label: "Hints",
              value: stats.hints,
              icon: Lightbulb,
              color: "amber",
            },
            {
              label: "Learnings",
              value: stats.learnings,
              icon: Brain,
              color: "purple",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}
                >
                  <stat.icon size={18} className={`text-${stat.color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold capitalize">{activeTab}</h2>
            {activeTab !== "learnings" && (
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setNewItem({});
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-bold"
              >
                <Plus size={16} />
                เพิ่มใหม่
              </button>
            )}
            {activeTab === "learnings" && (
              <button
                onClick={clearLearnings}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 text-sm"
              >
                <RotateCcw size={16} />
                Clear All
              </button>
            )}
          </div>

          {/* Table */}
          <div className="divide-y divide-white/5">
            {activeTab === "shortcuts" &&
              shortcuts.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-4">
                    <kbd className="px-2 py-1 rounded bg-black/30 border border-white/10 text-xs font-mono">
                      {item.trigger}
                    </kbd>
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-xs text-slate-500">
                        {item.action} • {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">
                      {item.usageCount} uses
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Trash2 size={14} className="text-rose-400" />
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "combos" &&
              combos.map((item) => (
                <div key={item.id} className="p-4 hover:bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <code className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-sm font-mono">
                        {item.sequence}
                      </code>
                      <span className="text-sm">{item.description}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">
                        {item.usageCount} uses
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <pre className="p-3 rounded-lg bg-black/30 text-xs text-slate-400 overflow-x-auto">
                    {item.expansion}
                  </pre>
                </div>
              ))}

            {activeTab === "hints" &&
              hints.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        item.type === "error"
                          ? "bg-rose-500/20 text-rose-400"
                          : item.type === "warning"
                            ? "bg-amber-500/20 text-amber-400"
                            : item.type === "tip"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      {item.type}
                    </span>
                    <div>
                      <code className="text-sm font-mono text-slate-400">
                        {item.pattern}
                      </code>
                      <p className="text-sm mt-1">{item.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500">
                      Priority: {item.priority}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Trash2 size={14} className="text-rose-400" />
                    </button>
                  </div>
                </div>
              ))}

            {activeTab === "learnings" && (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(learnings)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 20)
                    .map(([pattern, count]) => (
                      <div
                        key={pattern}
                        className="flex items-center justify-between p-3 rounded-lg bg-black/30"
                      >
                        <code className="text-sm text-slate-400 truncate flex-1">
                          {pattern}
                        </code>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full ml-2">
                          {count}x
                        </span>
                      </div>
                    ))}
                </div>
                {Object.keys(learnings).length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Brain size={48} className="mx-auto mb-4 opacity-30" />
                    <p>ยังไม่มี Learnings</p>
                    <p className="text-xs mt-1">
                      ระบบจะเรียนรู้จากการใช้งานของคุณ
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#0a0b0d] border border-white/10 rounded-2xl p-6 w-[500px] max-w-[90vw]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">
                  เพิ่ม {activeTab.slice(0, -1)}
                </h3>
                <button onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {activeTab === "shortcuts" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Trigger (เช่น ctrl+k)
                      </label>
                      <input
                        value={newItem.trigger || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, trigger: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                        placeholder="ctrl+shift+x"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Action
                      </label>
                      <input
                        value={newItem.action || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, action: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                        placeholder="my_action"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Description
                      </label>
                      <input
                        value={newItem.description || ""}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Category
                      </label>
                      <input
                        value={newItem.category || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, category: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                        placeholder="navigation"
                      />
                    </div>
                  </>
                )}

                {activeTab === "combos" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Sequence (เช่น ..btn)
                      </label>
                      <input
                        value={newItem.sequence || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, sequence: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                        placeholder="..mycombo"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Expansion (Code)
                      </label>
                      <textarea
                        value={newItem.expansion || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, expansion: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 h-32 font-mono text-sm"
                        placeholder="<div>...</div>"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Description
                      </label>
                      <input
                        value={newItem.description || ""}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                      />
                    </div>
                  </>
                )}

                {activeTab === "hints" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Pattern
                      </label>
                      <input
                        value={newItem.pattern || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, pattern: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                        placeholder="console.log"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Message
                      </label>
                      <input
                        value={newItem.message || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, message: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Type
                      </label>
                      <select
                        value={newItem.type || "info"}
                        onChange={(e) =>
                          setNewItem({ ...newItem, type: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                      >
                        <option value="info">Info</option>
                        <option value="tip">Tip</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">
                        Priority (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newItem.priority || 5}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            priority: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={addItem}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
