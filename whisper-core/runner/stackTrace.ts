export type ParsedStack = {
  message: string
  file?: string
  line?: number
  column?: number
  rawStack?: string
}

export function parseStack(errorText: string): ParsedStack {
  const rawStack = String(errorText || '')
  const lines = rawStack.split('\n').filter(Boolean)
  const message = lines[0] ?? 'Error'

  const m =
    rawStack.match(/<anonymous>:(\d+):(\d+)/) ||
    rawStack.match(/:(\d+):(\d+)\)?\s*$/m)

  if (m) {
    const line = Number(m[1])
    const column = Number(m[2])
    return { message, file: 'entry.js', line: Number.isFinite(line) ? line : undefined, column: Number.isFinite(column) ? column : undefined, rawStack }
  }

  return { message, rawStack }
}
