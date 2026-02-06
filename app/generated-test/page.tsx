"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function GeneratedFromBlueprint() {
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden">
      {/* Header Toolbar */}
      <header className="h-16 border-b border-white/10 bg-[#0a0a0a]/50 backdrop-blur-md flex items-center justify-between px-6 z-20 relative">
        <div className="flex items-center gap-4">
          <Link
            href="/engine"
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5"
          >
            ←
          </Link>
          <div>
            <h1 className="font-bold text-sm text-gray-200">
              Blueprint viewer
            </h1>
            <p className="text-xs text-gray-500">
              Auto-generated layout • v1.0.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400"
          >
            -
          </button>
          <span className="w-12 text-center text-xs font-mono text-gray-300">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-gray-400"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${showGrid ? "bg-violet-500/10 border-violet-500/50 text-violet-400" : "bg-white/5 border-white/5 text-gray-400"}`}
          >
            Grid
          </button>
          <button className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors">
            Export Code
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-hidden relative bg-[#050505]">
        {/* Background Grid */}
        {showGrid && (
          <div
            className="absolute inset-0 z-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#333 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
        )}

        {/* Scrollable Container */}
        <div className="absolute inset-0 overflow-auto p-20 flex items-center justify-center">
          <div
            className="relative bg-zinc-950 shadow-2xl transition-transform duration-200 ease-out border border-white/10"
            style={{
              width: 1920,
              height: 626,
              transform: `scale(${zoom})`,
              transformOrigin: "center top",
            }}
          >
            {/* Original Content Starts Here */}
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 hover:border-zinc-500 transition-colors"
              style={{ left: 1400, top: 0, width: 88, height: 368 }}
              title="b_1"
              data-node="b_1"
            >
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 40, top: 40, width: 8, height: 48 }}
                title="b_7"
                data-node="b_7"
              ></div>
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 24, top: 96, width: 40, height: 96 }}
                title="b_15"
                data-node="b_15"
              ></div>
            </div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1568, top: 0, width: 56, height: 64 }}
              title="b_2"
              data-node="b_2"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1656, top: 8, width: 32, height: 448 }}
              title="b_3"
              data-node="b_3"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1360, top: 16, width: 16, height: 88 }}
              title="b_4"
              data-node="b_4"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1776, top: 32, width: 40, height: 32 }}
              title="b_5"
              data-node="b_5"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1880, top: 32, width: 32, height: 48 }}
              title="b_6"
              data-node="b_6"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1600, top: 48, width: 40, height: 32 }}
              title="b_8"
              data-node="b_8"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1336, top: 56, width: 8, height: 104 }}
              title="b_9"
              data-node="b_9"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1392, top: 56, width: 32, height: 152 }}
              title="b_10"
              data-node="b_10"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1536, top: 64, width: 32, height: 24 }}
              title="b_11"
              data-node="b_11"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1584, top: 64, width: 48, height: 48 }}
              title="b_12"
              data-node="b_12"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1240, top: 80, width: 24, height: 80 }}
              title="b_13"
              data-node="b_13"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1528, top: 80, width: 64, height: 64 }}
              title="b_14"
              data-node="b_14"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1768, top: 96, width: 32, height: 80 }}
              title="b_16"
              data-node="b_16"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1320, top: 104, width: 72, height: 328 }}
              title="b_17"
              data-node="b_17"
            >
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 0, top: 160, width: 24, height: 64 }}
                title="b_51"
                data-node="b_51"
              ></div>
            </div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1640, top: 112, width: 24, height: 24 }}
              title="b_18"
              data-node="b_18"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1584, top: 120, width: 48, height: 64 }}
              title="b_19"
              data-node="b_19"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1864, top: 128, width: 32, height: 56 }}
              title="b_20"
              data-node="b_20"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1520, top: 144, width: 56, height: 248 }}
              title="b_21"
              data-node="b_21"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 576, top: 152, width: 40, height: 16 }}
              title="b_22"
              data-node="b_22"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1800, top: 160, width: 40, height: 136 }}
              title="b_23"
              data-node="b_23"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1016, top: 168, width: 8, height: 48 }}
              title="b_24"
              data-node="b_24"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1168, top: 168, width: 56, height: 160 }}
              title="b_25"
              data-node="b_25"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 768, top: 176, width: 8, height: 48 }}
              title="b_26"
              data-node="b_26"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 904, top: 176, width: 32, height: 48 }}
              title="b_27"
              data-node="b_27"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 968, top: 176, width: 32, height: 48 }}
              title="b_28"
              data-node="b_28"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1312, top: 176, width: 8, height: 48 }}
              title="b_29"
              data-node="b_29"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1592, top: 176, width: 48, height: 136 }}
              title="b_30"
              data-node="b_30"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 248, top: 184, width: 16, height: 40 }}
              title="b_31"
              data-node="b_31"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1232, top: 184, width: 40, height: 96 }}
              title="b_32"
              data-node="b_32"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1840, top: 184, width: 24, height: 40 }}
              title="b_33"
              data-node="b_33"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1120, top: 192, width: 48, height: 72 }}
              title="b_34"
              data-node="b_34"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 560, top: 208, width: 32, height: 16 }}
              title="b_35"
              data-node="b_35"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 680, top: 208, width: 32, height: 16 }}
              title="b_36"
              data-node="b_36"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 432, top: 240, width: 24, height: 48 }}
              title="b_37"
              data-node="b_37"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1088, top: 240, width: 40, height: 40 }}
              title="b_38"
              data-node="b_38"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 144, top: 248, width: 32, height: 40 }}
              title="b_39"
              data-node="b_39"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 872, top: 248, width: 56, height: 40 }}
              title="b_40"
              data-node="b_40"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1000, top: 248, width: 80, height: 40 }}
              title="b_41"
              data-node="b_41"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1264, top: 248, width: 24, height: 32 }}
              title="b_42"
              data-node="b_42"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1288, top: 248, width: 24, height: 48 }}
              title="b_43"
              data-node="b_43"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 216, top: 256, width: 40, height: 16 }}
              title="b_44"
              data-node="b_44"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 344, top: 256, width: 16, height: 32 }}
              title="b_45"
              data-node="b_45"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 504, top: 256, width: 16, height: 32 }}
              title="b_46"
              data-node="b_46"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 584, top: 256, width: 16, height: 32 }}
              title="b_47"
              data-node="b_47"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 808, top: 256, width: 32, height: 32 }}
              title="b_48"
              data-node="b_48"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 848, top: 256, width: 16, height: 40 }}
              title="b_49"
              data-node="b_49"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 920, top: 256, width: 24, height: 32 }}
              title="b_50"
              data-node="b_50"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1128, top: 272, width: 40, height: 64 }}
              title="b_52"
              data-node="b_52"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1736, top: 272, width: 24, height: 32 }}
              title="b_53"
              data-node="b_53"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1224, top: 280, width: 32, height: 96 }}
              title="b_54"
              data-node="b_54"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1512, top: 280, width: 32, height: 32 }}
              title="b_55"
              data-node="b_55"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1272, top: 304, width: 32, height: 64 }}
              title="b_56"
              data-node="b_56"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1392, top: 304, width: 32, height: 24 }}
              title="b_57"
              data-node="b_57"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1736, top: 304, width: 160, height: 288 }}
              title="b_58"
              data-node="b_58"
            >
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 32, top: 16, width: 40, height: 16 }}
                title="b_60"
                data-node="b_60"
              ></div>
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 64, top: 40, width: 16, height: 72 }}
                title="b_67"
                data-node="b_67"
              ></div>
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 0, top: 48, width: 32, height: 200 }}
                title="b_69"
                data-node="b_69"
              ></div>
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 112, top: 56, width: 16, height: 40 }}
                title="b_71"
                data-node="b_71"
              ></div>
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 136, top: 88, width: 16, height: 48 }}
                title="b_75"
                data-node="b_75"
              ></div>
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 112, top: 128, width: 8, height: 72 }}
                title="b_83"
                data-node="b_83"
              ></div>
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 24, top: 192, width: 32, height: 16 }}
                title="b_99"
                data-node="b_99"
              ></div>
            </div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 184, top: 320, width: 16, height: 32 }}
              title="b_59"
              data-node="b_59"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1432, top: 336, width: 16, height: 72 }}
              title="b_61"
              data-node="b_61"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 488, top: 344, width: 24, height: 32 }}
              title="b_62"
              data-node="b_62"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 640, top: 344, width: 24, height: 48 }}
              title="b_63"
              data-node="b_63"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 728, top: 344, width: 24, height: 32 }}
              title="b_64"
              data-node="b_64"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1128, top: 344, width: 24, height: 32 }}
              title="b_65"
              data-node="b_65"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1600, top: 344, width: 24, height: 32 }}
              title="b_66"
              data-node="b_66"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 416, top: 352, width: 24, height: 24 }}
              title="b_68"
              data-node="b_68"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 120, top: 360, width: 40, height: 16 }}
              title="b_70"
              data-node="b_70"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1040, top: 376, width: 16, height: 56 }}
              title="b_72"
              data-node="b_72"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1600, top: 384, width: 32, height: 96 }}
              title="b_73"
              data-node="b_73"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1576, top: 392, width: 24, height: 40 }}
              title="b_74"
              data-node="b_74"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1288, top: 400, width: 48, height: 16 }}
              title="b_76"
              data-node="b_76"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1504, top: 400, width: 64, height: 152 }}
              title="b_77"
              data-node="b_77"
            >
              <div
                className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
                style={{ left: 24, top: 32, width: 16, height: 72 }}
                title="b_82"
                data-node="b_82"
              ></div>
            </div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1080, top: 408, width: 8, height: 56 }}
              title="b_78"
              data-node="b_78"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1136, top: 416, width: 16, height: 64 }}
              title="b_79"
              data-node="b_79"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1440, top: 416, width: 32, height: 40 }}
              title="b_80"
              data-node="b_80"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1472, top: 424, width: 16, height: 128 }}
              title="b_81"
              data-node="b_81"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1584, top: 440, width: 8, height: 72 }}
              title="b_84"
              data-node="b_84"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1656, top: 440, width: 16, height: 40 }}
              title="b_85"
              data-node="b_85"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 208, top: 448, width: 80, height: 24 }}
              title="b_86"
              data-node="b_86"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 400, top: 448, width: 344, height: 32 }}
              title="b_87"
              data-node="b_87"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1032, top: 448, width: 24, height: 48 }}
              title="b_88"
              data-node="b_88"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 96, top: 456, width: 96, height: 24 }}
              title="b_89"
              data-node="b_89"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 296, top: 456, width: 96, height: 16 }}
              title="b_90"
              data-node="b_90"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1280, top: 472, width: 56, height: 48 }}
              title="b_91"
              data-node="b_91"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1376, top: 472, width: 24, height: 40 }}
              title="b_92"
              data-node="b_92"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1096, top: 480, width: 24, height: 24 }}
              title="b_93"
              data-node="b_93"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1344, top: 480, width: 24, height: 48 }}
              title="b_94"
              data-node="b_94"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 96, top: 488, width: 24, height: 24 }}
              title="b_95"
              data-node="b_95"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 136, top: 488, width: 40, height: 24 }}
              title="b_96"
              data-node="b_96"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 208, top: 488, width: 88, height: 24 }}
              title="b_97"
              data-node="b_97"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1600, top: 488, width: 32, height: 24 }}
              title="b_98"
              data-node="b_98"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1152, top: 528, width: 56, height: 32 }}
              title="b_100"
              data-node="b_100"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1288, top: 528, width: 64, height: 40 }}
              title="b_101"
              data-node="b_101"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1216, top: 536, width: 64, height: 24 }}
              title="b_102"
              data-node="b_102"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1352, top: 544, width: 64, height: 40 }}
              title="b_103"
              data-node="b_103"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1568, top: 544, width: 72, height: 16 }}
              title="b_104"
              data-node="b_104"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1680, top: 544, width: 32, height: 48 }}
              title="b_105"
              data-node="b_105"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1640, top: 552, width: 32, height: 16 }}
              title="b_106"
              data-node="b_106"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1848, top: 560, width: 72, height: 32 }}
              title="b_107"
              data-node="b_107"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1280, top: 568, width: 40, height: 32 }}
              title="b_108"
              data-node="b_108"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1416, top: 568, width: 40, height: 40 }}
              title="b_109"
              data-node="b_109"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1560, top: 576, width: 88, height: 32 }}
              title="b_110"
              data-node="b_110"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1488, top: 592, width: 24, height: 24 }}
              title="b_111"
              data-node="b_111"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1712, top: 592, width: 56, height: 16 }}
              title="b_112"
              data-node="b_112"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1424, top: 600, width: 48, height: 32 }}
              title="b_113"
              data-node="b_113"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1520, top: 600, width: 40, height: 16 }}
              title="b_114"
              data-node="b_114"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1552, top: 600, width: 40, height: 32 }}
              title="b_115"
              data-node="b_115"
            ></div>
            <div
              className="absolute rounded-md border border-zinc-700/60 bg-zinc-800/10 hover:bg-zinc-800/20 transition-colors"
              style={{ left: 1848, top: 608, width: 40, height: 24 }}
              title="b_116"
              data-node="b_116"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
