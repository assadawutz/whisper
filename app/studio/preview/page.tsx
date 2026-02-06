"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PreviewContent() {
  const searchParams = useSearchParams();
  const data = searchParams.get("data");

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-400">
        <p>No preview data provided.</p>
      </div>
    );
  }

  try {
    // Use UTF-8 safe base64 decoding
    const decodedData = decodeURIComponent(escape(atob(data)));
    const config = JSON.parse(decodedData);

    const ContainerEl = config.containerElement || "div";
    const layoutStyle: React.CSSProperties = {
      padding: config.padding,
      backgroundColor: config.backgroundColor,
      borderRadius: config.borderRadius,
      minHeight: "100vh",
    };

    if (config.layout === "grid") {
      layoutStyle.display = "grid";
      layoutStyle.gridTemplateColumns = `repeat(${config.gridCols}, 1fr)`;
      layoutStyle.gap = config.gap;
    } else if (config.layout === "flex-row") {
      layoutStyle.display = "flex";
      layoutStyle.flexDirection = "row";
      layoutStyle.gap = config.gap;
      layoutStyle.flexWrap = "wrap";
    } else if (config.layout === "flex-col") {
      layoutStyle.display = "flex";
      layoutStyle.flexDirection = "column";
      layoutStyle.gap = config.gap;
    }

    return (
      <div className="min-h-screen bg-white">
        <ContainerEl style={layoutStyle}>
          {config.elements.map((el: any) => (
            <div key={el.id}>
              {el.type === "heading" && (
                <h2 style={{ ...el.styles, margin: 0 }}>{el.content}</h2>
              )}
              {el.type === "text" && (
                <p style={{ ...el.styles, margin: 0 }}>{el.content}</p>
              )}
              {el.type === "button" && (
                <button
                  style={{ ...el.styles, border: "none", cursor: "pointer" }}
                >
                  {el.content}
                </button>
              )}
              {el.type === "image" && el.styles.src && (
                <img
                  src={el.styles.src}
                  alt={el.styles.alt || ""}
                  style={{
                    width: el.styles.width,
                    height: el.styles.height,
                    borderRadius: el.styles.borderRadius,
                    objectFit: "cover",
                  }}
                />
              )}
              {el.type === "container" && (
                <div style={el.styles}>{el.content}</div>
              )}
            </div>
          ))}
        </ContainerEl>
      </div>
    );
  } catch (e) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-500 p-8 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Error Rendering Preview</h2>
          <p className="opacity-70">Invalid or corrupted preview data.</p>
        </div>
      </div>
    );
  }
}

export default function LivePreviewPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-center">Loading preview...</div>}
    >
      <PreviewContent />
    </Suspense>
  );
}
