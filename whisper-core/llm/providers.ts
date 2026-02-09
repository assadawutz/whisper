/**
 * 🔌 WHISPER LLM PROVIDERS
 * Unified interface for Gemini, Ollama, OpenAI/Codex
 */

export type LLMProvider = "gemini" | "ollama" | "openai" | "codex";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey?: string; // Not needed for Ollama
  model: string;
  baseUrl?: string; // For Ollama: http://localhost:11434
  temperature?: number;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  provider: LLMProvider;
  model: string;
  tokens?: {
    prompt: number;
    completion: number;
  };
}

/**
 * Call Gemini API
 */
async function callGemini(
  messages: LLMMessage[],
  config: LLMConfig,
): Promise<LLMResponse> {
  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${encodeURIComponent(config.apiKey || "")}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: config.temperature || 0.7 },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return {
    content,
    provider: "gemini",
    model: config.model,
    tokens: {
      prompt: data.usageMetadata?.promptTokenCount || 0,
      completion: data.usageMetadata?.candidatesTokenCount || 0,
    },
  };
}

/**
 * Call Ollama API (Local)
 */
async function callOllama(
  messages: LLMMessage[],
  config: LLMConfig,
): Promise<LLMResponse> {
  const baseUrl = config.baseUrl || "http://localhost:11434";
  const url = `${baseUrl}/api/chat`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: false,
      options: {
        temperature: config.temperature || 0.7,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();

  return {
    content: data.message?.content || "",
    provider: "ollama",
    model: config.model,
    tokens: {
      prompt: data.prompt_eval_count || 0,
      completion: data.eval_count || 0,
    },
  };
}

/**
 * Call OpenAI/Codex API
 */
async function callOpenAI(
  messages: LLMMessage[],
  config: LLMConfig,
): Promise<LLMResponse> {
  const baseUrl = config.baseUrl || "https://api.openai.com/v1";
  const url = `${baseUrl}/chat/completions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: config.temperature || 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();

  return {
    content: data.choices?.[0]?.message?.content || "",
    provider: config.provider,
    model: config.model,
    tokens: {
      prompt: data.usage?.prompt_tokens || 0,
      completion: data.usage?.completion_tokens || 0,
    },
  };
}

/**
 * Unified LLM call function
 */
export async function callLLM(
  messages: LLMMessage[],
  config: LLMConfig,
): Promise<LLMResponse> {
  switch (config.provider) {
    case "gemini":
      return callGemini(messages, config);
    case "ollama":
      return callOllama(messages, config);
    case "openai":
    case "codex":
      return callOpenAI(messages, config);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

/**
 * Default models for each provider
 */
export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  gemini: "gemini-2.0-flash",
  ollama: "llama3.2",
  openai: "gpt-4o-mini",
  codex: "codex-davinci-002",
};

/**
 * Check if Ollama is available
 */
export async function checkOllamaHealth(
  baseUrl = "http://localhost:11434",
): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Get available Ollama models
 */
export async function getOllamaModels(
  baseUrl = "http://localhost:11434",
): Promise<string[]> {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { method: "GET" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch {
    return [];
  }
}
