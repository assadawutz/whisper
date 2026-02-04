import { nanoid } from 'nanoid'
import { eventBus } from '../core/eventBus'
import { workspaceManager } from '../workspace/workspaceManager'
import { bundleInMemory, type WorkspaceFile } from '../bundler/inMemoryBundler'
import type { RunEvent } from './runnerTypes'
import WorkerUrl from './workerHost?worker&url'

type RunSession = { runId: string; worker: Worker; createdAt: number }

export type RunResult = {
  runId: string
  stdout: string
  stderr: string
  exitCode?: number
  error?: string
}

class RunnerService {
  private sessions = new Map<string, RunSession>()

  run(entryFile: string) {
    // legacy: run a single file without bundling

    const ws = workspaceManager.getCurrent()
    if (!ws) {
      eventBus.publish({ type: 'ui:toast', payload: { kind: 'error', text: 'No workspace loaded' } })
      return
    }
    const f = workspaceManager.getFile(entryFile)
    if (!f) {
      eventBus.publish({ type: 'ui:toast', payload: { kind: 'error', text: 'Entry file not found' } })
      return
    }
    return this.runCode(f.content, { workspaceId: ws.id, entryFile })
  }


runProject(entryFile: string) {
  const ws = workspaceManager.getCurrent()
  if (!ws) {
    eventBus.publish({ type: 'ui:toast', payload: { kind: 'error', text: 'No workspace loaded' } })
    return
  }
  const files = ws.files as any as Record<string, WorkspaceFile & { path: string }>
  if (!files[entryFile]) {
    eventBus.publish({ type: 'ui:toast', payload: { kind: 'error', text: 'Entry file not found' } })
    return
  }
  try {
    const bundle = bundleInMemory(files as any, entryFile)
    return this.runCode(bundle, { workspaceId: ws.id, entryFile, silent: false })
  } catch (e: any) {
    eventBus.publish({ type: 'ui:toast', payload: { kind: 'error', text: e?.message ? String(e.message) : String(e) } })
    return
  }
}

async runProjectAndCapture(files: Record<string, WorkspaceFile>, entryFile: string, timeoutMs = 2500) {
  const bundle = bundleInMemory(files, entryFile)
  return await this.runCodeAndCapture(bundle, timeoutMs)
}


  runCode(code: string, meta?: { workspaceId?: string; entryFile?: string; silent?: boolean }): string {
    const wsId = meta?.workspaceId ?? (workspaceManager.getCurrent()?.id ?? 'unknown')
    const entry = meta?.entryFile ?? 'entry.js'

    const runId = nanoid()
    const worker = new Worker(WorkerUrl, { type: 'module' })
    const session: RunSession = { runId, worker, createdAt: Date.now() }
    this.sessions.set(runId, session)

    if (!meta?.silent) {
      eventBus.publish({ type: 'runner:started', payload: { runId, workspaceId: wsId, entryFile: entry } })
    }

    worker.onmessage = (evt: MessageEvent<RunEvent>) => {
      const e = evt.data
      if (e.type === 'stdout' || e.type === 'stderr') {
        if (!meta?.silent) eventBus.publish({ type: 'runner:output', payload: { runId: e.runId, kind: e.type, text: e.text } })
      } else if (e.type === 'exit') {
        if (!meta?.silent) eventBus.publish({ type: 'runner:exited', payload: { runId: e.runId, code: e.code } })
        this.stop(runId)
      } else if (e.type === 'error') {
        if (!meta?.silent) eventBus.publish({ type: 'runner:error', payload: { runId: e.runId, error: e.error } })
        this.stop(runId)
      }
    }

    worker.postMessage({ runId, code })
    return runId
  }

  async runCodeAndCapture(code: string, timeoutMs = 2500): Promise<RunResult> {
    const runId = nanoid()
    const worker = new Worker(WorkerUrl, { type: 'module' })
    const session: RunSession = { runId, worker, createdAt: Date.now() }
    this.sessions.set(runId, session)

    let stdout = ''
    let stderr = ''
    let done = false

    const finish = (res: Partial<RunResult>) => {
      if (done) return
      done = true
      this.stop(runId)
      return { runId, stdout, stderr, ...res } as RunResult
    }

    const timer = window.setTimeout(() => {
      // hard stop
      finish({ error: `Timeout after ${timeoutMs}ms` })
    }, timeoutMs)

    return await new Promise<RunResult>((resolve) => {
      worker.onmessage = (evt: MessageEvent<RunEvent>) => {
        const e = evt.data
        if (e.type === 'stdout') stdout += e.text
        else if (e.type === 'stderr') stderr += e.text
        else if (e.type === 'exit') {
          window.clearTimeout(timer)
          resolve(finish({ exitCode: e.code })!)
        } else if (e.type === 'error') {
          window.clearTimeout(timer)
          resolve(finish({ error: e.error })!)
        }
      }
      worker.postMessage({ runId, code })
    })
  }

  stop(runId: string) {
    const s = this.sessions.get(runId)
    if (!s) return
    s.worker.terminate()
    this.sessions.delete(runId)
  }

  stopAll() {
    for (const id of this.sessions.keys()) this.stop(id)
  }
}

export const runnerService = new RunnerService()
