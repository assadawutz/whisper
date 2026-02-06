import type {
  LlmMessage,
  LlmOptions,
  LlmResponse,
  LlmStreamChunk,
} from "../llmTypes";

export async function callOpenAI(
  messages: LlmMessage[],
  opts: LlmOptions,
): Promise<LlmResponse> {
  const baseUrl = opts.baseUrl || "https://api.openai.com/v1";
  const url = `${baseUrl}/chat/completions`;

  const body: Record<string, unknown> = {
    model: opts.model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.name && { name: m.name }),
      ...(m.functionCall && { function_call: m.functionCall }),
      ...(m.toolCalls && { tool_calls: m.toolCalls }),
    })),
    temperature: opts.temperature ?? 0.7,
    ...(opts.maxTokens && { max_tokens: opts.maxTokens }),
    ...(opts.topP !== undefined && { top_p: opts.topP }),
    ...(opts.frequencyPenalty !== undefined && {
      frequency_penalty: opts.frequencyPenalty,
    }),
    ...(opts.presencePenalty !== undefined && {
      presence_penalty: opts.presencePenalty,
    }),
    ...(opts.stop && { stop: opts.stop }),
    ...(opts.seed !== undefined && { seed: opts.seed }),
    ...(opts.functions && { functions: opts.functions }),
    ...(opts.functionCall && { function_call: opts.functionCall }),
    ...(opts.responseFormat && { response_format: opts.responseFormat }),
  };

  const controller = new AbortController();
  const timeoutId = opts.timeout
    ? setTimeout(() => controller.abort(), opts.timeout)
    : null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `OpenAI API error: ${res.status} ${res.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage += ` - ${errorText.slice(0, 200)}`;
      }

      throw new Error(errorMessage);
    }

    const data = await res.json();
    const choice = data.choices?.[0];

    if (!choice) {
      throw new Error("No response from OpenAI");
    }

    return {
      content: choice.message?.content ?? "",
      finishReason: choice.finish_reason,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      functionCall: choice.message?.function_call
        ? {
            name: choice.message.function_call.name,
            arguments: choice.message.function_call.arguments,
          }
        : undefined,
      toolCalls: choice.message?.tool_calls?.map((tc: any) => ({
        id: tc.id,
        type: tc.type,
        function: {
          name: tc.function.name,
          arguments: tc.function.arguments,
        },
      })),
    };
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error(`OpenAI request timeout after ${opts.timeout}ms`);
      }
    }

    throw err;
  }
}

export async function* streamOpenAI(
  messages: LlmMessage[],
  opts: LlmOptions,
): AsyncGenerator<LlmStreamChunk> {
  const baseUrl = opts.baseUrl || "https://api.openai.com/v1";
  const url = `${baseUrl}/chat/completions`;

  const body: Record<string, unknown> = {
    model: opts.model,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.name && { name: m.name }),
    })),
    temperature: opts.temperature ?? 0.7,
    stream: true,
    ...(opts.maxTokens && { max_tokens: opts.maxTokens }),
    ...(opts.topP !== undefined && { top_p: opts.topP }),
  };

  const controller = new AbortController();
  const timeoutId = opts.timeout
    ? setTimeout(() => controller.abort(), opts.timeout)
    : null;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `OpenAI streaming error: ${res.status} - ${errorText.slice(0, 200)}`,
      );
    }

    if (!res.body) {
      throw new Error("No response body from OpenAI");
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
          if (!trimmed || trimmed === "data: [DONE]") continue;

          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              const finishReason = json.choices?.[0]?.finish_reason;

              if (delta) {
                yield { delta };
              }

              if (finishReason) {
                yield {
                  delta: "",
                  finishReason: finishReason as any,
                  usage: json.usage
                    ? {
                        promptTokens: json.usage.prompt_tokens,
                        completionTokens: json.usage.completion_tokens,
                        totalTokens: json.usage.total_tokens,
                      }
                    : undefined,
                };
              }
            } catch (parseErr) {
              console.warn("[OpenAI Stream] Failed to parse chunk:", trimmed);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);

    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`OpenAI streaming timeout after ${opts.timeout}ms`);
    }

    throw err;
  }
}
