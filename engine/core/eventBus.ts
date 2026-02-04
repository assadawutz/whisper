type Handler<T = any> = (payload: T) => void

export type WhisperEvent =
  | { type: 'workspace:changed'; payload: { workspaceId: string; paths: string[] } }
  | { type: 'workspace:saved'; payload: { workspaceId: string } }
  | { type: 'runner:started'; payload: { runId: string; workspaceId: string; entryFile: string } }
  | { type: 'runner:output'; payload: { runId: string; kind: 'stdout' | 'stderr'; text: string } }
  | { type: 'runner:exited'; payload: { runId: string; code: number } }
  | { type: 'runner:error'; payload: { runId: string; error: string } }
  | { type: 'agents:taskUpdated'; payload: { taskId: string } }
  | { type: 'ui:toast'; payload: { kind: 'info' | 'error'; text: string } }

class EventBus {
  private handlers = new Map<string, Set<Handler>>()

  subscribe<T = any>(type: WhisperEvent['type'], handler: Handler<T>) {
    const set = this.handlers.get(type) ?? new Set()
    set.add(handler as Handler)
    this.handlers.set(type, set)
    return () => {
      const cur = this.handlers.get(type)
      if (!cur) return
      cur.delete(handler as Handler)
      if (cur.size === 0) this.handlers.delete(type)
    }
  }

  publish(event: WhisperEvent) {
    const set = this.handlers.get(event.type)
    if (!set) return
    for (const h of set) h(event.payload)
  }
}

export const eventBus = new EventBus()
