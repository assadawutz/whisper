type Handler<T = any> = (payload: T) => void;
type Middleware = (event: WhisperEvent, next: () => void) => void;

export type WhisperEvent =
  | {
      type: "workspace:changed";
      payload: { workspaceId: string; paths: string[] };
    }
  | { type: "workspace:saved"; payload: { workspaceId: string } }
  | {
      type: "runner:started";
      payload: { runId: string; workspaceId: string; entryFile: string };
    }
  | {
      type: "runner:output";
      payload: { runId: string; kind: "stdout" | "stderr"; text: string };
    }
  | { type: "runner:exited"; payload: { runId: string; code: number } }
  | { type: "runner:error"; payload: { runId: string; error: string } }
  | { type: "agents:taskUpdated"; payload: { taskId: string } }
  | { type: "ui:toast"; payload: { kind: "info" | "error"; text: string } }
  | { type: "export:started"; payload: { workspaceId: string; format: string } }
  | {
      type: "export:completed";
      payload: { workspaceId: string; success: boolean };
    }
  | {
      type: "diff:computed";
      payload: { path: string; additions: number; deletions: number };
    };

type EventHistoryEntry = {
  event: WhisperEvent;
  timestamp: number;
  id: string;
};

class EventBus {
  private handlers = new Map<string, Set<Handler>>();
  private middlewares: Middleware[] = [];
  private history: EventHistoryEntry[] = [];
  private maxHistory = 200;
  private recordHistory = true;
  private paused = false;

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
    return () => {
      const idx = this.middlewares.indexOf(middleware);
      if (idx !== -1) this.middlewares.splice(idx, 1);
    };
  }

  subscribe<T = any>(type: WhisperEvent["type"], handler: Handler<T>) {
    const set = this.handlers.get(type) ?? new Set();
    set.add(handler as Handler);
    this.handlers.set(type, set);
    return () => {
      const cur = this.handlers.get(type);
      if (!cur) return;
      cur.delete(handler as Handler);
      if (cur.size === 0) this.handlers.delete(type);
    };
  }

  subscribeOnce<T = any>(type: WhisperEvent["type"], handler: Handler<T>) {
    const unsub = this.subscribe(type, (payload: T) => {
      unsub();
      handler(payload);
    });
    return unsub;
  }

  private executeMiddleware(
    event: WhisperEvent,
    index: number,
    done: () => void,
  ) {
    if (index >= this.middlewares.length) {
      done();
      return;
    }
    const middleware = this.middlewares[index];
    middleware(event, () => this.executeMiddleware(event, index + 1, done));
  }

  publish(event: WhisperEvent) {
    if (this.paused) return;

    // Record in history
    if (this.recordHistory) {
      this.history.push({
        event,
        timestamp: Date.now(),
        id: crypto.randomUUID(),
      });
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }

    // Execute middlewares then handlers
    this.executeMiddleware(event, 0, () => {
      const set = this.handlers.get(event.type);
      if (!set) return;
      Array.from(set).forEach((h) => {
        try {
          h(event.payload);
        } catch (err) {
          console.error(`[EventBus] Handler error for ${event.type}:`, err);
        }
      });
    });
  }

  // Batch publish multiple events
  publishMany(events: WhisperEvent[]) {
    events.forEach((event) => this.publish(event));
  }

  // Wait for specific event
  waitFor<T = any>(type: WhisperEvent["type"], timeout = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        unsub();
        reject(new Error(`Timeout waiting for event: ${type}`));
      }, timeout);

      const unsub = this.subscribeOnce(type, (payload: T) => {
        clearTimeout(timer);
        resolve(payload);
      });
    });
  }

  // History management
  getHistory(filter?: {
    type?: string;
    since?: number;
    limit?: number;
  }): EventHistoryEntry[] {
    let filtered = [...this.history];

    if (filter?.type) {
      filtered = filtered.filter((entry) => entry.event.type === filter.type);
    }

    if (filter?.since !== undefined) {
      filtered = filtered.filter((entry) => entry.timestamp >= filter.since!);
    }

    if (filter?.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  clearHistory() {
    this.history = [];
  }

  setRecordHistory(record: boolean) {
    this.recordHistory = record;
  }

  // Replay events from history
  replay(filter?: { type?: string; since?: number }) {
    const events = this.getHistory(filter).map((entry) => entry.event);
    this.publishMany(events);
  }

  // Pause/Resume
  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  isPaused(): boolean {
    return this.paused;
  }

  // Debug helpers
  getSubscriberCount(type?: string): number {
    if (type) {
      return this.handlers.get(type)?.size ?? 0;
    }
    let total = 0;
    Array.from(this.handlers.values()).forEach((set) => {
      total += set.size;
    });
    return total;
  }

  getAllEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const eventBus = new EventBus();
