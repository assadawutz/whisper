import type { LlmClient, LlmMessage, LlmOptions } from './llmTypes'
import { callOpenAI } from './providers/openai'
import { callGemini } from './providers/gemini'

export const llmClient: LlmClient = {
  async call(messages: LlmMessage[], opts: LlmOptions) {
    if (!opts.apiKey) throw new Error('Missing API key')
    if (opts.provider === 'openai') return callOpenAI(messages, opts)
    return callGemini(messages, opts)
  },
}
