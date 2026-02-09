import type { LlmMessage, LlmOptions } from '../llmTypes'

export async function callGemini(messages: LlmMessage[], opts: LlmOptions): Promise<string> {
  // Minimal Gemini REST call (text-only). Users can swap endpoint/model as needed.
  const prompt = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(opts.model)}:generateContent?key=${encodeURIComponent(opts.apiKey)}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2 },
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Gemini error: ${res.status} ${t}`)
  }
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  return text ?? ''
}
