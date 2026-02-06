export type ContentPart =
  | { type: "text"; text: string }
  | {
      type: "image_url";
      image_url: { url: string; detail?: "auto" | "low" | "high" };
    };

export type LlmMessage = {
  role: "system" | "user" | "assistant" | "function" | "tool";
  content: string | ContentPart[];
  name?: string;
  functionCall?: { name: string; arguments: string };
  toolCalls?: Array<{
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }>;
};

export type LlmFunction = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

export type LlmToolChoice =
  | "auto"
  | "none"
  | { type: "function"; function: { name: string } };

export type LlmOptions = {
  provider: "openai" | "gemini" | "anthropic" | "azure" | "custom";
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  seed?: number;
  baseUrl?: string;
  timeout?: number;
  stream?: boolean;
  functions?: LlmFunction[];
  functionCall?: LlmToolChoice;
  safetySettings?: Array<{ category: string; threshold: string }>;
  responseFormat?: { type: "text" | "json_object" };
};

export type LlmStreamChunk = {
  delta: string;
  finishReason?: "stop" | "length" | "function_call" | "content_filter";
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type LlmResponse = {
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  functionCall?: { name: string; arguments: string };
  toolCalls?: Array<{
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }>;
  cached?: boolean;
  fromCache?: boolean;
};

export type RetryPolicy = {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
};

export type CacheConfig = {
  enabled: boolean;
  ttlMs: number;
  maxEntries: number;
  includeSystemPrompt: boolean;
};

export interface LlmClient {
  call(messages: LlmMessage[], opts: LlmOptions): Promise<LlmResponse>;
  stream?(
    messages: LlmMessage[],
    opts: LlmOptions,
  ): AsyncGenerator<LlmStreamChunk>;
  countTokens?(text: string, model: string): Promise<number>;
}

export type LlmCallMetrics = {
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  cached: boolean;
  error?: string;
  timestamp: number;
};
