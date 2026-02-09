export type TaskMemoryItem = {
  id: string
  createdAt: number
  goal: string
  focusPaths: string[]
  outcome: 'success' | 'fail' | 'partial'
  lastError?: string
  summary: string
}

const KEY = 'whisper.taskMemory.v1'

export function loadTaskMemory(): TaskMemoryItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveTaskMemory(items: TaskMemoryItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)))
  } catch {
    // ignore
  }
}

export function addTaskMemory(item: TaskMemoryItem) {
  const items = loadTaskMemory()
  saveTaskMemory([item, ...items].slice(0, 50))
}

export function clearTaskMemory() {
  try { localStorage.removeItem(KEY) } catch {}
}
