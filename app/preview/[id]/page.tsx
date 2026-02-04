"use client";

import React, { useEffect, useState } from "react";
import { BlueprintVisionEngine } from "@/blueprint/vision_engine";
import { TreeNode } from "@/lib/blueprint/layout-tree";
import * as Library from "@/blueprint/nodes/Library";
import { BlueprintRenderer } from "@/blueprint/BlueprintRenderer";
import { BlueprintExporter } from "@/blueprint/core/exporter";
import Link from "next/link";

export default function PreviewPage({ params }: { params: { id: string } }) {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [discoveredNodes, setDiscoveredNodes] = useState<TreeNode[]>([]);
  const [currentJson, setCurrentJson] = useState("");
  const [status, setStatus] = useState("Initializing Core...");

  useEffect(() => {
    async function runSynthesis() {
      const storedImage = localStorage.getItem(`vision_src_${params.id}`);
      setImageSrc(storedImage);

      // Check if we already have a saved session for this ID
      const existingTree = localStorage.getItem(`blueprint_tree_${params.id}`);
      if (existingTree) {
        try {
          const parsed = JSON.parse(existingTree);
          setTree(parsed);
          setDiscoveredNodes(parsed.children || []);
          setStatus("Loaded from Core Memory");
          setLoading(false);
          return; // Skip synthesis if loaded
        } catch (e) {
          console.error("Failed to parse existing tree", e);
        }
      }

      // Phase 1: Initialize
      await new Promise((r) => setTimeout(r, 1000));
      setStatus("Initializing Spatial Matrix...");

      // Phase 2: Discovery Simulation
      const fullStructure =
        await BlueprintVisionEngine.extractStructureFromImage("source-img");
      const nodes = fullStructure.children || [];

      let tempTree = { ...fullStructure, children: [] };
      setTree(tempTree);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Move scanner to node position (if available)
        const targetY = node.meta?.y ?? (i + 1) * (100 / (nodes.length + 1));
        setScanY(targetY);
        setStatus(`Analyzing Region::${targetY}%`);

        await new Promise((r) => setTimeout(r, 600)); // Scan time

        setDiscoveredNodes((prev) => [...prev, node]);

        const partialTree = {
          ...fullStructure,
          children: nodes.slice(0, i + 1),
        };
        setCurrentJson(JSON.stringify(partialTree, null, 2));
        setStatus(`Detected: ${node.type.toUpperCase()}`);
        await new Promise((r) => setTimeout(r, 300)); // Pause after discovery
      }

      await new Promise((r) => setTimeout(r, 1000));
      setTree(fullStructure);
      localStorage.setItem(
        `blueprint_tree_${params.id}`,
        JSON.stringify(fullStructure),
      );
      localStorage.setItem(
        "blueprint_draft_latest",
        JSON.stringify(fullStructure),
      );
      setLoading(false);
    }
    runSynthesis();
  }, [params.id]);

  const [scanY, setScanY] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-brand-primary text-white overflow-hidden font-mono text-[10px]">
        {/* CENTERED SCANNING HUB */}
        <div className="flex-1 relative bg-[#020202] flex items-center justify-center p-20 overflow-hidden">
          {/* BACKGROUND GRID */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[40px_40px]"></div>
          </div>

          {imageSrc && (
            <div className="relative group animate-fadeIn">
              {/* IMAGE WRAPPER - Aspect Ratio Keeper */}
              <div className="relative shadow-[0_50px_100px_rgba(0,0,255,0.1)] border border-white/20 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={imageSrc}
                  className="block w-auto h-auto max-w-[80vw] max-h-[80vh] opacity-30 grayscale blur-[4px]"
                  alt="Source"
                />

                {/* SPATIAL OVERLAY - Bound precisely to image scale */}
                <div className="absolute inset-0 pointer-events-none">
                  {discoveredNodes.map((node, idx) => (
                    <div
                      key={node.id}
                      className="absolute left-[5%] right-[5%] border border-brand-secondary/60 bg-brand-secondary/10 px-6 py-4 rounded-xl animate-fadeIn flex justify-between items-center backdrop-blur-md z-30"
                      style={{
                        top: `${node.meta?.y ?? 0}%`,
                        transform: `translateY(-50%)`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary shadow-[0_0_15px_#00e0ff] animate-ping"></div>
                        <div className="space-y-1">
                          <p className="uppercase tracking-[0.4em] font-black text-white text-[9px]">
                            {node.type}
                          </p>
                          <p className="text-brand-secondary/60 text-[7px] font-mono tracking-widest uppercase italic">
                            Lock_Success::{node.id}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* LASER LINE */}
                  <div
                    className="absolute left-0 right-0 h-[2px] bg-brand-secondary shadow-[0_0_40px_#00e0ff] z-50 transition-all duration-700 ease-in-out"
                    style={{ top: `${scanY}%` }}
                  >
                    <div className="absolute -top-6 left-6 bg-brand-secondary text-brand-primary px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg">
                      SCAN_REGION_{scanY}%
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING STATUS HUD */}
              <div className="absolute -top-12 left-0 right-0 flex justify-between items-end px-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-brand-secondary uppercase tracking-[0.5em]">
                    {status}
                  </p>
                </div>
                <p className="text-[10px] font-mono text-white/40 italic">
                  SYNTHESIS_ACTIVE
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: JSON BUFFER */}
        <div className="w-full max-w-xl lg:max-w-none lg:w-[400px] bg-[#050505] border-l border-white/10 flex flex-col animate-slideLeft">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <span className="text-gray-400 font-black uppercase tracking-widest text-[9px]">
              JSON_Object_Buffer
            </span>
            <span className="text-emerald-500 animate-pulse text-[8px]">
              ACTIVE_SYNC
            </span>
          </div>
          <div className="flex-1 p-8 overflow-hidden font-mono text-[9px] leading-relaxed">
            <pre className="text-emerald-500/70 whitespace-pre-wrap">
              {currentJson || "// Handshaking..."}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] animate-fadeIn flex flex-col">
      {/* DEPLOYMENT HEADER */}
      <nav className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-full bg-brand-primary text-white text-[9px] font-black uppercase tracking-widest">
            Live_Preview
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            BUILD::{params.id.slice(0, 8)}
          </span>
        </div>
        <div className="flex gap-4">
          <Link
            href={`/?id=${params.id}`}
            className="px-4 py-1.5 rounded-full border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
          >
            Edit_Blueprint
          </Link>
          <button
            onClick={() => {
              if (tree) {
                const html = BlueprintExporter.toFullHTML(tree);
                const blob = new Blob([html], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `whisper-build-${params.id.slice(0, 6)}.html`;
                a.click();
              }
            }}
            className="px-6 py-1.5 rounded-full bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest shadow-premium hover:brightness-110 active:scale-95 transition-all"
          >
            Publish_Page (Download)
          </button>
        </div>
      </nav>

      <main className="flex-1 bg-[#fcfdfe] p-4 sm:p-6 lg:p-10 overflow-auto flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* LEFT: SOURCE REFERENCE (Miniaturized) */}
        <div className="w-full max-w-2xl lg:max-w-none lg:w-[320px] shrink-0 flex flex-col gap-6 animate-slideRight mx-auto lg:mx-0">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Analysis_Reference
            </h4>
            <div className="rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-xl bg-black relative group aspect-video">
              <img
                src={imageSrc || ""}
                className="w-full h-full object-cover opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
                alt="Source"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">
                  Input_Layer_Spatial
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-100 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Synthesis_Log
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {discoveredNodes.map((n, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-[9px] font-bold text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 animate-fadeInLow"
                >
                  <span className="text-emerald-500 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="uppercase tracking-widest">{n.type}</span>
                  <span className="ml-auto text-gray-300">OK</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE INTERACTIVE CANVAS (The Actual Result) */}
        <div className="w-full lg:flex-1 flex flex-col gap-4 max-w-5xl mx-auto lg:mx-0">
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-primary">
                Live_Canvas_Output
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 text-[8px] font-bold uppercase tracking-widest">
                Interactive_DOM
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              <div
                className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>

          <div className="flex-1 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)] rounded-[2rem] overflow-hidden border border-gray-100 relative group min-h-[60vh] lg:min-h-[80vh]">
            {/* This is where the magic happens: rendering the tree as it grows */}
            {tree && <BlueprintRenderer tree={tree} />}

            {/* Growth Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                <div className="bg-brand-primary/90 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl animate-bounce">
                  Synthesizing_Architecture...
                </div>
              </div>
            )}

            <div className="absolute top-8 right-8 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/80 backdrop-blur-xl px-5 py-2.5 rounded-full text-[9px] font-black text-brand-secondary uppercase tracking-[0.2em] flex items-center gap-3 border border-white/10 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-brand-secondary shadow-[0_0_10px_#00e0ff] animate-pulse"></div>
                Live_Canvas_Active
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
