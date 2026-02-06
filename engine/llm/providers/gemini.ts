import type {
  LlmMessage,
  LlmOptions,
  LlmResponse,
  LlmStreamChunk,
} from "../llmTypes";

export async function callGemini(
  messages: LlmMessage[],
  opts: LlmOptions,
): Promise<LlmResponse> {
  const baseUrl =
    opts.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
  const url = `${baseUrl}/models/${encodeURIComponent(opts.model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`;

  // Convert messages to Gemini format
  const contents = messages
    .filter((m) => m.role !== "system") // Gemini handles system prompts differently
    // Convert messages to Gemini format
    .map((m) => {
      let parts: any[] = [];
      if (typeof m.content === "string") {
        parts = [{ text: m.content }];
      } else {
        parts = m.content.map((part) => {
          if (part.type === "text") {
            return { text: part.text };
          } else if (part.type === "image_url") {
            // Assume base64 data url for now: "data:image/png;base64,..."
            const [mime, data] = part.image_url.url.split(";base64,");
            return {
              inlineData: {
                mimeType: mime.replace("data:", ""),
                data: data,
              },
            };
          }
          return { text: "" };
        });
      }
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts,
      };
    });

  // Include system instruction if present
  const systemMessage = messages.find((m) => m.role === "system");

  const body: Record<string, unknown> = {
    contents,
    ...(systemMessage && {
      systemInstruction: {
        parts: [{ text: systemMessage.content }],
      },
    }),
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      ...(opts.maxTokens && { maxOutputTokens: opts.maxTokens }),
      ...(opts.topP !== undefined && { topP: opts.topP }),
      ...(opts.topK !== undefined && { topK: opts.topK }),
      ...(opts.stop && { stopSequences: opts.stop }),
      ...(opts.responseFormat?.type === "json_object" && {
        responseMimeType: "application/json",
      }),
    },
    ...(opts.safetySettings && { safetySettings: opts.safetySettings }),
  };

  const controller = new AbortController();
  const timeoutId = opts.timeout
    ? setTimeout(() => controller.abort(), opts.timeout)
    : null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `Gemini API error: ${res.status} ${res.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage += ` - ${errorText.slice(0, 200)}`;
      }

      throw new Error(errorMessage);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];

    if (!candidate) {
      throw new Error("No response from Gemini");
    }

    const text =
      candidate.content?.parts?.map((p: any) => p.text).join("") ?? "";

    return {
      content: text,
      finishReason: candidate.finishReason?.toLowerCase(),
      usage: data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount || 0,
            completionTokens: data.usageMetadata.candidatesTokenCount || 0,
            totalTokens: data.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
    };
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);

    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Gemini request timeout after ${opts.timeout}ms`);
    }

    throw err;
  }
}

export async function* streamGemini(
  messages: LlmMessage[],
  opts: LlmOptions,
): AsyncGenerator<LlmStreamChunk> {
  const baseUrl =
    opts.baseUrl || "https://generativelanguage.googleapis.com/v1beta";
  const url = `${baseUrl}/models/${encodeURIComponent(opts.model)}:streamGenerateContent?key=${encodeURIComponent(opts.apiKey)}&alt=sse`;

  // Convert messages to Gemini format
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemMessage = messages.find((m) => m.role === "system");

  const body: Record<string, unknown> = {
    contents,
    ...(systemMessage && {
      systemInstruction: {
        parts: [{ text: systemMessage.content }],
      },
    }),
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      ...(opts.maxTokens && { maxOutputTokens: opts.maxTokens }),
      ...(opts.topP !== undefined && { topP: opts.topP }),
      ...(opts.topK !== undefined && { topK: opts.topK }),
    },
    ...(opts.safetySettings && { safetySettings: opts.safetySettings }),
  };

  const controller = new AbortController();
  const timeoutId = opts.timeout
    ? setTimeout(() => controller.abort(), opts.timeout)
    : null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Gemini streaming error: ${res.status} - ${errorText.slice(0, 200)}`,
      );
    }

    if (!res.body) {
      throw new Error("No response body from Gemini");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const candidate = json.candidates?.[0];

            if (!candidate) continue;

            const delta =
              candidate.content?.parts?.map((p: any) => p.text).join("") ?? "";
            const finishReason = candidate.finishReason?.toLowerCase();

            if (delta) {
              yield { delta };
            }

            if (finishReason && finishReason !== "stop") {
              yield {
                delta: "",
                finishReason: finishReason as any,
                usage: json.usageMetadata
                  ? {
                      promptTokens: json.usageMetadata.promptTokenCount || 0,
                      completionTokens:
                        json.usageMetadata.candidatesTokenCount || 0,
                      totalTokens: json.usageMetadata.totalTokenCount || 0,
                    }
                  : undefined,
              };
            }
          } catch (parseErr) {
            console.warn("[Gemini Stream] Failed to parse chunk:", trimmed);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);

    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Gemini streaming timeout after ${opts.timeout}ms`);
    }

    throw err;
  }
}
