"use client";

import EditorPanel from "@/blueprint/EditorPanel";
import { TreeNode } from "@/lib/blueprint/layout-tree";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

const initialData: TreeNode = {
  id: "root",
  type: "container",
  className: "bg-gray-50",
  children: [
    {
      id: "hero-1",
      type: "hero",
      instruction: "Welcome to Whisper Engine",
      className: "premium-hero",
    },
  ],
};

function PageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [tree, setTree] = useState<TreeNode>(initialData);

  useEffect(() => {
    // Priority: 1. ID in URL, 2. Global Draft, 3. Initial Data
    if (id) {
      const saved = localStorage.getItem(`blueprint_tree_${id}`);
      if (saved) {
        try {
          setTree(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load ID-based blueprint");
        }
      }
    } else {
      const draft = localStorage.getItem("blueprint_draft_latest");
      if (draft) {
        try {
          setTree(JSON.parse(draft));
        } catch (e) {
          console.error("Failed to load recent draft");
        }
      }
    }
  }, [id]);

  const handleSave = (newTree: TreeNode) => {
    setTree({ ...newTree });
    if (id) {
      localStorage.setItem(`blueprint_tree_${id}`, JSON.stringify(newTree));
      localStorage.setItem("blueprint_draft_latest", JSON.stringify(newTree));
      alert(`Architecture Committed to Core [${id}]`);
    } else {
      localStorage.setItem("blueprint_draft_latest", JSON.stringify(newTree));
      alert("Draft captured. Work will persist even after refresh.");
    }
  };

  return (
    <main className="min-h-screen">
      <EditorPanel initialTree={tree} onSave={handleSave} currentId={id} />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading Editor Engine...</div>}>
      <PageContent />
    </Suspense>
  );
}
