import { NextRequest, NextResponse } from "next/server";

type LLMProvider = "gemini" | "ollama" | "openai" | "codex";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

async function callLLM(
  messages: ChatMessage[],
  config: {
    provider: LLMProvider;
    apiKey?: string;
    model: string;
    ollamaUrl?: string;
  },
): Promise<string> {
  const { provider, apiKey, model, ollamaUrl } = config;

  // Build prompt from messages
  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");
  const lastMessage = messages[messages.length - 1];
  const hasImage = lastMessage?.image;

  if (provider === "ollama") {
    const baseUrl = ollamaUrl || "http://localhost:11434";

    const ollamaMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.image && {
        images: [m.image.replace(/^data:image\/\w+;base64,/, "")],
      }),
    }));

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: ollamaMessages,
        stream: false,
      }),
    });

    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json();
    return data.message?.content || "";
  }

  if (provider === "openai" || provider === "codex") {
    const openaiMessages = messages.map((m) => {
      if (m.image) {
        return {
          role: m.role,
          content: [
            { type: "text", text: m.content },
            { type: "image_url", image_url: { url: m.image } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: 0.7,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  // Gemini (default)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey || "")}`;

  const parts: any[] = [{ text: prompt }];

  // Add image if present
  if (hasImage && lastMessage.image) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: lastMessage.image.replace(/^data:image\/\w+;base64,/, ""),
      },
    });
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function POST(req: NextRequest) {
  try {
    const { messages, provider, model, apiKey, ollamaUrl } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    if (provider !== "ollama" && !apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 400 });
    }

    const content = await callLLM(messages, {
      provider: provider as LLMProvider,
      apiKey,
      model,
      ollamaUrl,
    });

    return NextResponse.json({ content, provider, model });
  } catch (err: any) {
    console.error("Chat Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
