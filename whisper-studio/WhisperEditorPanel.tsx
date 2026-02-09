"use client";

import React, { useState, useEffect } from "react";
import { TreeNode } from "@/lib/blueprint/layout-tree";
import {
  BlueprintExtensionHelper,
  Suggestion,
} from "@/lib/blueprint/suggestions";
import { BlueprintRenderer } from "./BlueprintRenderer";
import { BlueprintExporter } from "@/blueprint/core/exporter";

interface EditorPanelProps {
  initialTree: TreeNode;
  onSave: (tree: TreeNode) => void;
  currentId?: string | null;
}

export default function EditorPanel({
  initialTree,
  onSave,
  currentId,
}: EditorPanelProps) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [instruction, setInstruction] = useState("");
  const [ghostHint, setGhostHint] = useState("");
  const [twInput, setTwInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [tree, setTree] = useState<TreeNode>(initialTree);
  const [latestImage, setLatestImage] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState("");
  const visionInputId = "vision-upload-input";

  useEffect(() => {
    setTree(initialTree);
  }, [initialTree]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLatestImage(localStorage.getItem("vision_src_latest"));
    }
  }, []);

  // Sync state back to tree when inputs change
  useEffect(() => {
    if (selectedNode) {
      const updateNode = (n: TreeNode): TreeNode => {
        if (n.id === selectedNode.id) {
          return { ...n, instruction, className: twInput };
        }
        if (n.children) {
          return { ...n, children: n.children.map(updateNode) };
        }
        return n;
      };
      setTree((prev) => updateNode(prev));

      const hint = BlueprintExtensionHelper.getGhostHint(
        selectedNode.type,
        instruction,
      );
      setGhostHint(hint || "");
    }
  }, [instruction, twInput, selectedNode?.id]);

  const handleTwChange = (val: string) => {
    setTwInput(val);
    if (val.length > 1) {
      setSuggestions(BlueprintExtensionHelper.suggestTailwind(val));
    } else {
      setSuggestions([]);
    }
  };

  const handleVisionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const newPageId = `node_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem(`vision_src_${newPageId}`, base64);
      localStorage.setItem("vision_src_latest", base64);
      localStorage.setItem("blueprint_draft_latest", JSON.stringify(tree));
      setLatestImage(base64);
      window.location.href = `/preview/${newPageId}`;
    };
    reader.readAsDataURL(file);
  };

  const triggerVisionUpload = () =>
    document.getElementById(visionInputId)?.click();

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(tree, null, 2));
      setActionStatus("JSON copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy JSON", error);
      setActionStatus("Unable to copy JSON. Check browser permissions.");
    }
  };

  const handleExportHtml = () => {
    const html = BlueprintExporter.toFullHTML(tree);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whisper-build-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setActionStatus("HTML export generated.");
  };

  const handleResetTree = () => {
    setTree(initialTree);
    setSelectedNode(null);
    setInstruction("");
    setTwInput("");
    setActionStatus("Workspace reset to the initial blueprint.");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-brand-primary text-white overflow-y-auto md:overflow-hidden font-sans selection:bg-brand-secondary/30">
      {/* LEFT: HIERARCHY */}
      <div className="w-full md:w-[320px] md:min-w-[320px] bg-mesh border-b md:border-b-0 md:border-r border-white/5 flex flex-col relative z-20 shadow-2xl">
        <div className="p-10 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-brand-secondary shadow-[0_0_10px_#00E0FF]"></div>
            <h2 className="font-black text-[11px] tracking-[0.3em] uppercase text-gray-500">
              Core_Orchestrator
            </h2>
          </div>
          <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
            Workspace / Whisper_v2.2
          </p>
        </div>
        <div className="px-6 sm:px-8 py-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">
              Vision_Input
            </h3>
            <button
              className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-secondary hover:text-white transition-colors"
              onClick={triggerVisionUpload}
            >
              Import
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            {latestImage ? (
              <img
                src={latestImage}
                className="w-full h-32 object-cover opacity-70"
                alt="Latest upload"
              />
            ) : (
              <div className="h-32 flex flex-col items-center justify-center gap-2 text-[9px] text-gray-500 uppercase tracking-[0.3em]">
                <span>No_Image</span>
                <button
                  className="px-4 py-2 rounded-full bg-white/10 text-white text-[8px] font-black tracking-[0.3em] hover:bg-white/20 transition-colors"
                  onClick={triggerVisionUpload}
                >
                  Upload
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar-dark">
          <TreeNav
            node={tree}
            selectedId={selectedNode?.id}
            onSelect={(n) => {
              setSelectedNode(n);
              setInstruction(n.instruction || "");
              setTwInput(n.className || "");
            }}
          />
        </div>
      </div>

      {/* CENTER: PREVIEW */}
      <div className="flex-1 p-6 sm:p-10 bg-brand-muted relative overflow-hidden flex flex-col">
        {/* TOP TOOLBAR */}
        <div className="mb-6 sm:mb-10 flex flex-wrap gap-4 justify-between items-center bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/5">
          <div className="flex gap-4">
            {["Desktop", "Tablet", "Mobile"].map((device) => (
              <button
                key={device}
                className="text-[9px] font-black uppercase tracking-widest px-4 py-2 hover:bg-white/5 rounded-lg transition-all text-gray-500 hover:text-white"
              >
                {device}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-brand-secondary animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary"></span>
            LIVE_SYNC_ACTIVE
          </div>
          <button
            type="button"
            onClick={() => setIsAssistantOpen((prev) => !prev)}
            className="md:hidden text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-all"
          >
            {isAssistantOpen ? "Hide_Assistant" : "Show_Assistant"}
          </button>
        </div>

        <div className="flex-1 rounded-premium-xl bg-white shadow-2xl p-1 relative overflow-hidden group">
          {/* REAL PREVIEW INSET */}
          <div className="absolute inset-0 overflow-auto">
            <BlueprintRenderer tree={tree} />
          </div>
        </div>
      </div>

      {/* RIGHT: SMART ASSISTANT */}
      <div
        className={`w-full lg:w-[480px] bg-mesh border-t md:border-t-0 md:border-l border-white/5 flex flex-col z-20 ${isAssistantOpen ? "flex" : "hidden"} md:flex`}
      >
        {selectedNode ? (
          <div className="flex-1 flex flex-col">
            <div className="p-6 sm:p-10 border-b border-white/5 bg-white/5 backdrop-blur-md flex flex-wrap justify-between items-start gap-4">
              <div>
                <h2 className="font-black text-[11px] tracking-[0.3em] uppercase text-brand-secondary mb-2">
                  Layer_Attributes
                </h2>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-md bg-white/5 text-[10px] font-black text-gray-400 border border-white/10 uppercase italic">
                    {selectedNode.type}
                  </span>
                  <span className="text-[9px] font-mono text-gray-600">
                    AID: {selectedNode.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssistantOpen(false)}
                className="md:hidden px-3 py-1 rounded-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/20 transition-all"
              >
                Close
              </button>
              {/* Historical Recall */}
              {typeof window !== "undefined" &&
                localStorage.getItem("vision_src_latest") && (
                  <div className="w-16 h-16 rounded-xl border border-white/10 overflow-hidden relative group/recall">
                    <img
                      src={localStorage.getItem("vision_src_latest") || ""}
                      className="w-full h-full object-cover opacity-40 grayscale group-hover/recall:opacity-100 group-hover/recall:grayscale-0 transition-all"
                      alt="Source"
                    />
                    <div className="absolute inset-0 bg-brand-secondary/10 pointer-events-none"></div>
                  </div>
                )}
            </div>

            <div className="flex-1 p-6 sm:p-10 space-y-10 overflow-y-auto custom-scrollbar-dark">
              {/* ASSISTANT */}
              <div className="glass-dark rounded-premium-lg p-8 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-accent/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>

                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-brand-secondary/20 flex items-center justify-center text-xl">
                    ✨
                  </div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">
                    Macro_Composer
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 relative z-10">
                  {["glass", "banner", "mesh", "card-float"].map((macro) => (
                    <button
                      key={macro}
                      onClick={() => setTwInput(macro)}
                      className="text-left p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-secondary hover:bg-white/10 transition-all flex justify-between items-center group/btn"
                    >
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">
                          {macro.replace("-", " ")}
                        </p>
                        <p className="text-[9px] text-gray-500 font-medium italic">
                          Apply semantic {macro} architecture
                        </p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-white/10 group-hover/btn:bg-brand-secondary transition-colors"></div>
                    </button>
                  ))}
                </div>
              </div>

              {/* QUICK FUNCTIONS */}
              <div className="glass-dark rounded-premium-lg p-6 space-y-4 border border-white/5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                  Quick_Functions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    className="w-full bg-white/10 border border-white/10 text-white font-black py-4 rounded-xl hover:bg-white/20 transition-all uppercase text-[9px] tracking-[0.3em]"
                    onClick={handleCopyJson}
                  >
                    Copy_JSON
                  </button>
                  <button
                    className="w-full bg-white/10 border border-white/10 text-white font-black py-4 rounded-xl hover:bg-white/20 transition-all uppercase text-[9px] tracking-[0.3em]"
                    onClick={handleExportHtml}
                  >
                    Export_HTML
                  </button>
                  <button
                    className="w-full bg-white/10 border border-white/10 text-white font-black py-4 rounded-xl hover:bg-white/20 transition-all uppercase text-[9px] tracking-[0.3em]"
                    onClick={() => onSave(tree)}
                  >
                    Save_Draft
                  </button>
                  <button
                    className="w-full bg-white/10 border border-white/10 text-white font-black py-4 rounded-xl hover:bg-white/20 transition-all uppercase text-[9px] tracking-[0.3em]"
                    onClick={handleResetTree}
                  >
                    Reset_All
                  </button>
                </div>
                {actionStatus && (
                  <p className="text-[9px] font-mono text-gray-500">
                    {actionStatus}
                  </p>
                )}
              </div>

              {/* AI PROMPT */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block px-1">
                  Morphological_Instruction
                </label>
                <div className="relative">
                  <textarea
                    className="w-full bg-black/40 border border-white/10 rounded-premium-lg p-8 h-44 text-sm font-bold focus:ring-2 focus:ring-brand-secondary/20 focus:outline-none transition-all placeholder:text-gray-700 leading-relaxed text-brand-secondary"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="Shape your reality..."
                  />
                  {ghostHint && (
                    <div className="absolute top-8 left-8 text-white/10 text-sm font-bold pointer-events-none">
                      <span className="invisible whitespace-pre-wrap">
                        {instruction}
                      </span>
                      {ghostHint}
                    </div>
                  )}
                </div>
              </div>

              {/* TW RESOLVER */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block px-1">
                  Semantic_Utilities
                </label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-6 px-8 text-xs font-mono font-black focus:ring-2 focus:ring-brand-secondary/20 focus:outline-none transition-all text-brand-secondary uppercase tracking-[0.1em]"
                  value={twInput}
                  onChange={(e) => handleTwChange(e.target.value)}
                  placeholder="macro:architecture..."
                />
              </div>

              {/* ACTIONS */}
              <div className="pt-8 space-y-4">
                <button
                  className="w-full bg-brand-secondary text-brand-primary font-black py-6 rounded-2xl shadow-[0_20px_40px_rgba(0,224,255,0.2)] hover:shadow-[0_25px_50px_rgba(0,224,255,0.3)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-500 uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-4 group"
                  onClick={() => onSave(tree)}
                >
                  Commit_Patch
                </button>

                {currentId && (
                  <button
                    className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black py-4 rounded-xl hover:bg-emerald-500/20 transition-all duration-500 uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3"
                    onClick={() =>
                      window.open(`/preview/${currentId}`, "_blank")
                    }
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Launch_Mainframe
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 sm:p-20 text-center animate-fadeIn">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/5 animate-pulse">
              <div className="w-12 h-12 border-t-2 border-brand-secondary rounded-full animate-spin"></div>
            </div>
            <div className="space-y-6">
              <p className="text-gray-500 font-black text-[11px] uppercase tracking-[0.4em] leading-loose max-w-[240px] opacity-40">
                Awaiting_Spatial_Focus
                <br />
                <span className="text-[9px] font-medium lowercase italic tracking-tight text-brand-secondary">
                  establish link to activate architecture loop
                </span>
              </p>

              <div className="pt-4">
                <button
                  onClick={triggerVisionUpload}
                  className="px-10 py-4 bg-brand-secondary text-brand-primary font-black rounded-xl text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(0,224,255,0.2)] hover:scale-105 transition-all cursor-pointer"
                >
                  Start_Vision_Import
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}

function TreeNav({
  node,
  onSelect,
  selectedId,
  depth = 0,
}: {
  node: TreeNode;
  onSelect: (n: TreeNode) => void;
  selectedId?: string | number;
  depth?: number;
}) {
  const isSelected = node.id === selectedId;
  return (
    <div className="mb-3">
      <div
        className={`group cursor-pointer p-4 rounded-xl flex items-center gap-4 transition-all duration-500 ${isSelected ? "bg-white/10 text-brand-secondary shadow-lg translate-x-1 border border-white/10" : "hover:bg-white/5 text-gray-500"}`}
        style={{ marginLeft: `${depth * 16}px` }}
        onClick={() => onSelect(node)}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-brand-secondary shadow-[0_0_10px_#00E0FF]" : "bg-white/10 group-hover:bg-brand-secondary/50"}`}
        ></div>
        <span
          className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isSelected ? "text-white" : "group-hover:text-gray-300"}`}
        >
          {node.type}
        </span>
        <span className="text-[8px] font-mono opacity-20 ml-auto">
          {node.id}
        </span>
      </div>
      {node.children?.map((child: TreeNode) => (
        <TreeNav
          key={child.id}
          node={child}
          onSelect={onSelect}
          selectedId={selectedId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
