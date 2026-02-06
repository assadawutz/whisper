export type LogLevel = "debug" | "info" | "warn" | "error" | "perf";

export type LogEntry = {
  timestamp: number;
  level: LogLevel;
  scope: string;
  message: string;
  data?: unknown;
  duration?: number;
};

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 500;
  private enabled = true;
  private minLevel: LogLevel = "debug";
  private levelOrder: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    perf: 4,
  };

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setMinLevel(level: LogLevel) {
    this.minLevel = level;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private shouldLog(level: LogLevel): boolean {
    return (
      this.enabled && this.levelOrder[level] >= this.levelOrder[this.minLevel]
    );
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(scope: string, message: string, data?: unknown) {
    if (!this.shouldLog("debug")) return;
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: "debug",
      scope,
      message,
      data,
    };
    this.addLog(entry);
    console.debug(`[${scope}] ${message}`, data ?? "");
  }

  info(scope: string, message: string, data?: unknown) {
    if (!this.shouldLog("info")) return;
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: "info",
      scope,
      message,
      data,
    };
    this.addLog(entry);
    console.info(`[${scope}] ${message}`, data ?? "");
  }

  warn(scope: string, message: string, data?: unknown) {
    if (!this.shouldLog("warn")) return;
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: "warn",
      scope,
      message,
      data,
    };
    this.addLog(entry);
    console.warn(`[${scope}] ${message}`, data ?? "");
  }

  error(scope: string, message: string, data?: unknown) {
    if (!this.shouldLog("error")) return;
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: "error",
      scope,
      message,
      data,
    };
    this.addLog(entry);
    console.error(`[${scope}] ${message}`, data ?? "");
  }

  perf(scope: string, message: string, duration: number, data?: unknown) {
    if (!this.shouldLog("perf")) return;
    const entry: LogEntry = {
      timestamp: Date.now(),
      level: "perf",
      scope,
      message,
      data,
      duration,
    };
    this.addLog(entry);
    console.log(
      `[${scope}] ⚡ ${message} (${duration.toFixed(2)}ms)`,
      data ?? "",
    );
  }

  // Performance timer
  time(scope: string, label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.perf(scope, label, duration);
    };
  }

  getLogs(filter?: {
    scope?: string;
    level?: LogLevel;
    since?: number;
  }): LogEntry[] {
    let filtered = [...this.logs];
    if (filter?.scope) {
      filtered = filtered.filter((log) => log.scope === filter.scope);
    }
    if (filter?.level) {
      filtered = filtered.filter((log) => log.level === filter.level);
    }
    if (filter?.since !== undefined) {
      filtered = filtered.filter((log) => log.timestamp >= filter.since!);
    }
    return filtered;
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = Logger.getInstance();

// Backward compatibility
export function logInfo(scope: string, msg: string, extra?: unknown) {
  logger.info(scope, msg, extra);
}

export function logError(scope: string, msg: string, extra?: unknown) {
  logger.error(scope, msg, extra);
}
