import type { LlmMessage, LlmOptions } from '../llmTypes'

export async function callOpenAI(messages: LlmMessage[], opts: LlmOptions): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages,
      temperature: 0.2,
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`OpenAI error: ${res.status} ${t}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
