"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Upload,
  Save,
  Copy,
  Check,
  Loader2,
  Image as ImageIcon,
  X,
  Settings,
  Download,
  Trash2,
  MessageSquare,
  Bot,
  User,
  Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
  ts: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  provider: string;
  createdAt: number;
}

const PROVIDERS = [
  {
    id: "gemini",
    name: "Gemini",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    models: ["llama3.2", "codellama", "mistral", "phi3"],
  },
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
  },
  { id: "codex", name: "Codex", models: ["gpt-4o", "gpt-4-turbo"] },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("gemini-2.0-flash");
  const [apiKey, setApiKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("whisper_chat_sessions");
    if (saved) {
      setSessions(JSON.parse(saved));
    }
    const savedKey = localStorage.getItem("whisper_api_key");
    if (savedKey) setApiKey(savedKey);
  }, []);

  const availableModels =
    PROVIDERS.find((p) => p.id === provider)?.models || [];

  useEffect(() => {
    setModel(availableModels[0] || "");
  }, [provider]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async () => {
    if (!input.trim() && !uploadedImage) return;
    if (provider !== "ollama" && !apiKey) {
      alert("กรุณาใส่ API Key");
      setShowSettings(true);
      return;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: input,
      image: uploadedImage || undefined,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setUploadedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          })),
          provider,
          model,
          apiKey,
          ollamaUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();

      const assistantMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: data.content,
        ts: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: "❌ เกิดข้อผิดพลาด กรุณาลองใหม่",
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (msg: Message) => {
    navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveSession = () => {
    if (messages.length === 0) return;

    const title = messages[0]?.content.slice(0, 50) || "New Chat";
    const session: ChatSession = {
      id: currentSessionId || `session_${Date.now()}`,
      title,
      messages,
      model,
      provider,
      createdAt: Date.now(),
    };

    const updated = sessions.filter((s) => s.id !== session.id);
    updated.unshift(session);
    setSessions(updated);
    setCurrentSessionId(session.id);
    localStorage.setItem("whisper_chat_sessions", JSON.stringify(updated));
    localStorage.setItem("whisper_api_key", apiKey);
    alert("บันทึกแล้ว!");
  };

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setProvider(session.provider);
    setModel(session.model);
    setCurrentSessionId(session.id);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    localStorage.setItem("whisper_chat_sessions", JSON.stringify(updated));
    if (currentSessionId === id) {
      setMessages([]);
      setCurrentSessionId(null);
    }
  };

  const exportChat = () => {
    const text = messages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whisper-chat-${Date.now()}.txt`;
    a.click();
  };

  const newChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setInput("");
    setUploadedImage(null);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 flex">
      {/* Sidebar - Sessions */}
      <aside className="w-72 border-r border-white/5 bg-black/30 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <button
            onClick={newChat}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center justify-between p-3 rounded-xl mb-2 cursor-pointer transition-all ${
                currentSessionId === session.id
                  ? "bg-indigo-500/20 border border-indigo-500/30"
                  : "bg-white/5 border border-white/5 hover:bg-white/10"
              }`}
              onClick={() => loadSession(session)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.title}</p>
                <p className="text-[10px] text-slate-500">
                  {session.provider}/{session.model.split("-")[0]}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded"
              >
                <Trash2 size={14} className="text-rose-400" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black">Whisper Chat</h1>
              <p className="text-[10px] text-slate-500">
                {provider} / {model}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={saveSession}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              title="Save"
            >
              <Save size={18} />
            </button>
            <button
              onClick={exportChat}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              title="Export"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b border-white/5 bg-black/40 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">
                  Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">
                  Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                >
                  {availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {provider !== "ollama" ? (
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-... หรือ AIzaSy..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">
                  Ollama URL
                </label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Bot size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-500">เริ่มพิมพ์เพื่อสนทนา</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] ${msg.role === "user" ? "order-first" : ""}`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="Uploaded"
                      className="max-w-xs rounded-xl mb-2 border border-white/10"
                    />
                  )}
                  <div
                    className={`p-4 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-2">
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.ts).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => copyMessage(msg)}
                      className="p-1 hover:bg-white/10 rounded transition-all"
                    >
                      {copiedId === msg.id ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Copy size={12} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Uploaded Image Preview */}
        {uploadedImage && (
          <div className="px-4 pb-2">
            <div className="relative inline-block">
              <img
                src={uploadedImage}
                alt="Preview"
                className="h-20 rounded-lg border border-white/10"
              />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
              title="Upload Image"
            >
              <ImageIcon size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && sendMessage()
              }
              placeholder="พิมพ์ข้อความ..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:border-indigo-500 focus:outline-none"
              disabled={isLoading}
            />

            <button
              onClick={sendMessage}
              disabled={(!input.trim() && !uploadedImage) || isLoading}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-slate-500 transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
