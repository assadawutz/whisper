export type LlmMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export type LlmOptions = {
  provider: 'openai' | 'gemini'
  apiKey: string
  model: string
}

export interface LlmClient {
  call(messages: LlmMessage[], opts: LlmOptions): Promise<string>
}
