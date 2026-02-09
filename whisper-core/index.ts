// Whisper Core Exports
// Context Engine
export { contextEngine } from "./context/WhisperContextEngine";
export type {
  CursorContext,
  Shortcut,
  Combo,
  Hint,
  GhostText,
  InlineSuggestion,
} from "./context/WhisperContextEngine";

// Cursor Tracker
export { cursorTracker } from "./context/WhisperCursorTracker";
export type {
  CursorPosition,
  TextSelectionInfo,
} from "./context/WhisperCursorTracker";

// Design Pipeline
export { designPipeline } from "./pipeline/WhisperDesignPipeline";
export type {
  DesignElement,
  TailwindOutput,
  PipelineStep,
  PipelineResult,
} from "./pipeline/WhisperDesignPipeline";

// LLM Providers
export {
  callLLM,
  checkOllamaHealth,
  getOllamaModels,
  DEFAULT_MODELS,
} from "./llm/providers";
export type {
  LLMProvider,
  LLMConfig,
  LLMMessage,
  LLMResponse,
} from "./llm/providers";
