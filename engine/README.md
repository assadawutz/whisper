# Whisper Engine - Enterprise AI Development Platform

Version 2.0.0

## 🚀 Overview

Whisper Engine is a comprehensive, enterprise-grade AI development platform that provides a complete suite of tools for AI-powered development workflows. Built with TypeScript and designed for maximum flexibility and extensibility.

## ✨ Core Features

### 1. **Multi-Provider LLM Support** 🤖

- OpenAI (GPT-4, GPT-4 Turbo, GPT-3.5)
- Google Gemini (Gemini Pro, Gemini 2.0)
- Anthropic Claude (ready for integration)
- Azure OpenAI
- Custom provider support

**Capabilities:**

- Streaming responses
- Function calling / Tool use
- Response caching with TTL management
- Automatic retry with exponential backoff
- Token counting and usage tracking
- Performance metrics and analytics

### 2. **Advanced Task Memory** 🧠

- Intelligent task categorization
- Auto-tagging based on context
- Full-text search across tasks
- Related task suggestions
- Statistics and analytics
- Import/Export capabilities

**Features:**

- Search by keywords, tags, categories
- Filter by date range, duration, outcome
- Track success rates and patterns
- Learn from past experiences

### 3. **Enterprise Configuration** ⚙️

- Multiple provider profiles
- Profile management (save/load/switch)
- Configuration validation
- Encrypted API key storage
- Import/Export configuration
- Preference management

### 4. **Event-Driven Architecture** 📡

- Pub/Sub event system
- Event history with replay
- Middleware support
- Real-time event streaming
- Event filtering and search

### 5. **Advanced Logging** 📝

- Multiple log levels (debug, info, warn, error, perf)
- Performance timing utilities
- Log filtering and export
- Structured logging
- Log history management

### 6. **Developer Tools** 🛠️

- Line-by-line diff viewer
- Code bundler with dependency analysis
- Virtual file system
- Workspace management
- Code execution environment

## 📦 Installation

```bash
# Already installed in your project
npm install
```

## 🎯 Quick Start

### 1. Initialize the Engine

```typescript
import { engineService } from "@/engine/core/engineService";

// Engine auto-initializes, but you can manually initialize
await engineService.initialize();
```

### 2. Configure LLM Provider

```typescript
// Get current config
const config = engineService.getConfig();

// Update config
await engineService.updateConfig({
  ...config,
  llmProvider: "openai",
  providers: {
    ...config.providers,
    openai: {
      apiKey: "your-api-key",
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 4000,
    },
  },
});
```

### 3. Call LLM

```typescript
// Simple call
const response = await engineService.callLLM(
  [
    { role: "system", content: "You are a helpful assistant" },
    { role: "user", content: "Hello!" },
  ],
  {},
);

console.log(response.content);

// Streaming call
for await (const chunk of engineService.streamLLM(messages, {})) {
  process.stdout.write(chunk.delta);
}
```

### 4. Use Task Memory

```typescript
// Add a task
engineService.addTask({
  id: "task-1",
  goal: "Implement user authentication",
  summary: "Added JWT-based auth with refresh tokens",
  outcome: "success",
  focusPaths: ["src/auth/*"],
  durationMs: 45000,
  tokensUsed: 1200,
});

// Search tasks
const results = engineService.searchTaskMemory({
  query: "authentication",
  outcome: "success",
});

// Get statistics
const stats = engineService.getMemoryStats();
console.log(`Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
```

### 5. Subscribe to Events

```typescript
// Subscribe to events
const unsubscribe = engineService.subscribeToEvent("ui:toast", (payload) => {
  console.log("Toast:", payload.text);
});

// Publish events
engineService.publishEvent({
  type: "ui:toast",
  payload: { kind: "info", text: "Task completed!" },
});

// Cleanup
unsubscribe();
```

## 🎨 UI Integration

### Access the Dashboard

Navigate to `/engine` in your browser to access the full Engine Dashboard with:

- Real-time statistics
- All capability cards
- Interactive feature exploration
- Configuration management
- Analytics and insights

### Use in Components

```tsx
"use client";

import { useState, useEffect } from "react";
import { engineService } from "@/engine/core/engineService";

export default function MyComponent() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const status = engineService.getStatus();
    setStatus(status);
  }, []);

  return (
    <div>
      <h1>Engine Version: {status?.version}</h1>
      <p>Capabilities: {status?.capabilities.length}</p>
    </div>
  );
}
```

## 🔧 Advanced Usage

### Custom LLM Provider

```typescript
// Add custom provider configuration
const config = engineService.getConfig();
config.providers.custom = {
  apiKey: "custom-key",
  model: "custom-model",
  baseUrl: "https://api.custom-provider.com",
  temperature: 0.7,
};
await engineService.updateConfig(config);
```

### Performance Monitoring

```typescript
// Get LLM stats
const stats = engineService.getLLMStats("openai");
console.log({
  totalCalls: stats.total,
  errorRate: stats.errorRate,
  avgDuration: stats.avgDurationMs,
  cacheHitRate: stats.cacheHitRate,
});

// Get detailed metrics
const metrics = engineService.getLLMMetrics({
  provider: "openai",
  since: Date.now() - 86400000, // Last 24h
});
```

### Logger Usage

```typescript
import { logger } from "@/engine/core/logger";

// Log with different levels
logger.debug("MyModule", "Debug message", { data: "value" });
logger.info("MyModule", "Info message");
logger.warn("MyModule", "Warning message");
logger.error("MyModule", "Error occurred", error);

// Performance timing
const endTimer = logger.time("MyModule", "Complex operation");
// ... do work ...
endTimer(); // Logs: "⚡ Complex operation (123.45ms)"

// Get logs
const logs = logger.getLogs({
  scope: "MyModule",
  level: "error",
  since: Date.now() - 3600000,
});

// Export logs
const logsJson = logger.exportLogs();
```

## 📊 Available Capabilities

1. **AI Chat** - Multi-provider AI chat with streaming
2. **Smart Caching** - Response caching for performance
3. **Task Memory** - Learn from past tasks
4. **Workspace Management** - Virtual file system
5. **Code Runner** - Execute code safely
6. **Advanced Diff** - Code comparison
7. **Analytics Dashboard** - Usage insights
8. **Event Bus** - Real-time messaging
9. **Multi-Agent System** - Coordinate agents (Beta)
10. **Export Tools** - Export projects

## 🔐 Security

- API keys encrypted in localStorage
- Separate storage for sensitive data
- Validation on all configuration changes
- No API keys in exports
- Safe defaults

## 🧪 Testing

```bash
# The engine is integrated into your Next.js app
npm run dev

# Navigate to http://localhost:3000/engine
```

## 📈 Performance

- Response caching reduces API calls by 30-50%
- Automatic cache eviction with LRU
- Configurable TTL per use case
- Token usage tracking
- Performance metrics for all operations

## 🤝 Contributing

The engine is designed to be extensible:

1. Add new LLM providers in `engine/llm/providers/`
2. Extend event types in `engine/core/eventBus.ts`
3. Add new agent types in `engine/agents/`
4. Create new tools and utilities as needed

## 📄 License

Private project - All rights reserved

## 🆘 Support

For issues or questions:

1. Check the inline documentation
2. Review the TypeScript types
3. Explore the Engine Dashboard
4. Check console logs with debug level

---

**Built with ❤️ for enterprise AI development**
