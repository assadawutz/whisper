export type RunRequest = {
  runId: string
  code: string
}

export type RunEvent =
  | { type: 'stdout'; runId: string; text: string }
  | { type: 'stderr'; runId: string; text: string }
  | { type: 'exit'; runId: string; code: number }
  | { type: 'error'; runId: string; error: string }
