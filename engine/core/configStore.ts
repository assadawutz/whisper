export type LlmProvider = 'openai' | 'gemini'

export type WhisperConfig = {
  llmProvider: LlmProvider
  apiKey: string
  model: string
}

const KEY = 'whisper.ide.config.v1'

export function loadConfig(): WhisperConfig {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { llmProvider: 'openai', apiKey: '', model: 'gpt-4o-mini' }
    const parsed = JSON.parse(raw) as WhisperConfig
    return {
      llmProvider: parsed.llmProvider ?? 'openai',
      apiKey: parsed.apiKey ?? '',
      model: parsed.model ?? 'gpt-4o-mini',
    }
  } catch {
    return { llmProvider: 'openai', apiKey: '', model: 'gpt-4o-mini' }
  }
}

export function saveConfig(cfg: WhisperConfig) {
  localStorage.setItem(KEY, JSON.stringify(cfg))
}
