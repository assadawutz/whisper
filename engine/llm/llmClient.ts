import type {
  LlmClient,
  LlmMessage,
  LlmOptions,
  LlmResponse,
  LlmStreamChunk,
  RetryPolicy,
  CacheConfig,
  LlmCallMetrics,
} from "./llmTypes";
import { callOpenAI, streamOpenAI } from "./providers/openai";
import { callGemini, streamGemini } from "./providers/gemini";
import { logger } from "../core/logger";

// Response cache
type CacheEntry = {
  response: LlmResponse;
  timestamp: number;
  hits: number;
};

class LlmCache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig = {
    enabled: true,
    ttlMs: 3600000, // 1 hour
    maxEntries: 500,
    includeSystemPrompt: true,
  };

  configure(config: Partial<CacheConfig>) {
    this.config = { ...this.config, ...config };
  }

  private createKey(messages: LlmMessage[], opts: LlmOptions): string {
    const messagesToHash = this.config.includeSystemPrompt
      ? messages
      : messages.filter((m) => m.role !== "system");

    const data = JSON.stringify({
      messages: messagesToHash,
      model: opts.model,
      temperature: opts.temperature,
      maxTokens: opts.maxTokens,
    });

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  get(messages: LlmMessage[], opts: LlmOptions): LlmResponse | null {
    if (!this.config.enabled) return null;

    const key = this.createKey(messages, opts);
    const entry = this.cache.get(key);

    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.config.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    logger.debug("LlmCache", `Cache hit for key ${key}`, { hits: entry.hits });
    return { ...entry.response, fromCache: true, cached: true };
  }

  set(messages: LlmMessage[], opts: LlmOptions, response: LlmResponse) {
    if (!this.config.enabled) return;

    const key = this.createKey(messages, opts);

    // Evict oldest if at capacity
    if (this.cache.size >= this.config.maxEntries) {
      const oldest = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp,
      )[0];
      if (oldest) this.cache.delete(oldest[0]);
    }

    this.cache.set(key, {
      response: { ...response, cached: true },
      timestamp: Date.now(),
      hits: 0,
    });

    logger.debug("LlmCache", `Cached response for key ${key}`);
  }

  clear() {
    this.cache.clear();
    logger.info("LlmCache", "Cache cleared");
  }

  getStats() {
    return {
      size: this.cache.size,
      maxEntries: this.config.maxEntries,
      totalHits: Array.from(this.cache.values()).reduce(
        (sum, e) => sum + e.hits,
        0,
      ),
    };
  }
}

// Retry logic with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy,
  context: string,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= policy.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;

      if (attempt === policy.maxRetries) break;

      // Check if error is retryable
      const isRetryable = policy.retryableErrors.some((pattern) =>
        lastError!.message.toLowerCase().includes(pattern.toLowerCase()),
      );

      if (!isRetryable) {
        logger.warn("LlmClient", `Non-retryable error in ${context}`, {
          error: lastError.message,
        });
        throw lastError;
      }

      const delay = Math.min(
        policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attempt),
        policy.maxDelayMs,
      );

      logger.info(
        "LlmClient",
        `Retrying ${context} after ${delay}ms (attempt ${attempt + 1}/${policy.maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  logger.error("LlmClient", `All retries exhausted for ${context}`, {
    error: lastError?.message,
  });
  throw lastError;
}

// Metrics tracking
class MetricsCollector {
  private metrics: LlmCallMetrics[] = [];
  private maxMetrics = 1000;

  add(metric: LlmCallMetrics) {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getMetrics(filter?: { provider?: string; since?: number }): LlmCallMetrics[] {
    let filtered = this.metrics;

    if (filter?.provider) {
      filtered = filtered.filter((m) => m.provider === filter.provider);
    }

    if (filter?.since !== undefined) {
      filtered = filtered.filter((m) => m.timestamp >= filter.since!);
    }

    return filtered;
  }

  getStats(provider?: string) {
    const metrics = provider
      ? this.metrics.filter((m) => m.provider === provider)
      : this.metrics;

    if (metrics.length === 0) return null;

    const total = metrics.length;
    const errors = metrics.filter((m) => m.error).length;
    const cached = metrics.filter((m) => m.cached).length;
    const totalTokens = metrics.reduce((sum, m) => sum + m.totalTokens, 0);
    const totalDuration = metrics.reduce((sum, m) => sum + m.durationMs, 0);

    return {
      total,
      errors,
      errorRate: errors / total,
      cached,
      cacheHitRate: cached / total,
      totalTokens,
      avgTokensPerCall: totalTokens / total,
      totalDurationMs: totalDuration,
      avgDurationMs: totalDuration / total,
    };
  }

  clear() {
    this.metrics = [];
  }
}

// Enhanced LLM Client
class EnhancedLlmClient implements LlmClient {
  private cache = new LlmCache();
  private metrics = new MetricsCollector();
  private defaultRetryPolicy: RetryPolicy = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
      "rate limit",
      "timeout",
      "network",
      "ECONNRESET",
      "429",
      "503",
      "500",
    ],
  };

  configureCache(config: Partial<CacheConfig>) {
    this.cache.configure(config);
  }

  setRetryPolicy(policy: Partial<RetryPolicy>) {
    this.defaultRetryPolicy = { ...this.defaultRetryPolicy, ...policy };
  }

  async call(messages: LlmMessage[], opts: LlmOptions): Promise<LlmResponse> {
    if (!opts.apiKey) throw new Error("Missing API key");

    // Check cache first
    const cached = this.cache.get(messages, opts);
    if (cached) {
      this.recordMetric(opts.provider, opts.model, cached, 0, true);
      return cached;
    }

    const endTimer = logger.time("LlmClient", `${opts.provider}/${opts.model}`);
    const startTime = performance.now();

    try {
      const response = await withRetry(
        async () => {
          if (opts.provider === "openai")
            return await callOpenAI(messages, opts);
          if (opts.provider === "gemini")
            return await callGemini(messages, opts);
          // if (opts.provider === 'anthropic') return await callAnthropic(messages, opts)
          throw new Error(`Unsupported provider: ${opts.provider}`);
        },
        this.defaultRetryPolicy,
        `${opts.provider}/${opts.model}`,
      );

      const duration = performance.now() - startTime;
      endTimer();

      // Cache successful response
      this.cache.set(messages, opts, response);
      this.recordMetric(opts.provider, opts.model, response, duration, false);

      return response;
    } catch (err) {
      const duration = performance.now() - startTime;
      endTimer();

      this.recordMetric(
        opts.provider,
        opts.model,
        { content: "", finishReason: "error" },
        duration,
        false,
        (err as Error).message,
      );
      throw err;
    }
  }

  async *stream(
    messages: LlmMessage[],
    opts: LlmOptions,
  ): AsyncGenerator<LlmStreamChunk> {
    if (!opts.apiKey) throw new Error("Missing API key");

    const endTimer = logger.time(
      "LlmClient",
      `${opts.provider}/${opts.model} (stream)`,
    );

    try {
      if (opts.provider === "openai") {
        yield* streamOpenAI(messages, opts);
      } else if (opts.provider === "gemini") {
        yield* streamGemini(messages, opts);
      } else {
        throw new Error(
          `Streaming not supported for provider: ${opts.provider}`,
        );
      }
    } finally {
      endTimer();
    }
  }

  async countTokens(text: string, model: string): Promise<number> {
    // Simple estimation: ~4 chars per token for English
    // For production, use proper tokenizer libraries
    return Math.ceil(text.length / 4);
  }

  private recordMetric(
    provider: string,
    model: string,
    response: LlmResponse,
    durationMs: number,
    cached: boolean,
    error?: string,
  ) {
    this.metrics.add({
      provider,
      model,
      promptTokens: response.usage?.promptTokens ?? 0,
      completionTokens: response.usage?.completionTokens ?? 0,
      totalTokens: response.usage?.totalTokens ?? 0,
      durationMs,
      cached,
      error,
      timestamp: Date.now(),
    });
  }

  getCacheStats() {
    return this.cache.getStats();
  }

  getMetrics(filter?: { provider?: string; since?: number }) {
    return this.metrics.getMetrics(filter);
  }

  getStats(provider?: string) {
    return this.metrics.getStats(provider);
  }

  clearCache() {
    this.cache.clear();
  }

  clearMetrics() {
    this.metrics.clear();
  }
}

export const llmClient = new EnhancedLlmClient();
