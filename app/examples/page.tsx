"use client";

import { useState } from "react";
import { quickChat, showToast } from "@/engine/utils/engineHelpers";

export default function StarterExample() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const result = await quickChat(input, {
        systemPrompt: "You are a helpful AI assistant",
      });
      setResponse(result);
      showToast("Response received!", "info");
    } catch (error) {
      showToast("Error: " + (error as Error).message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-gray-900 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          Whisper Engine Starter
        </h1>

        <div className="engine-card mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="engine-input mb-4"
            rows={4}
            placeholder="Ask me anything..."
          />

          <button
            onClick={handleChat}
            disabled={loading || !input.trim()}
            className="engine-button-primary w-full"
          >
            {loading ? "Thinking..." : "Send Message"}
          </button>
        </div>

        {response && (
          <div className="engine-panel">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">
              Response:
            </h2>
            <p className="text-gray-300 whitespace-pre-wrap">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
