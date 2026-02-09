import type { RunRequest, RunEvent } from './runnerTypes'

function send(e: RunEvent) {
  postMessage(e)
}

self.onmessage = (evt: MessageEvent<RunRequest>) => {
  const { runId, code } = evt.data
  const origLog = console.log
  const origErr = console.error

  console.log = (...args: any[]) => send({ type: 'stdout', runId, text: args.map(String).join(' ') + '\n' })
  console.error = (...args: any[]) => send({ type: 'stderr', runId, text: args.map(String).join(' ') + '\n' })

  try {
    // Execute in a function scope so "return" isn't weird
    const fn = new Function(code)
    fn()
    send({ type: 'exit', runId, code: 0 })
  } catch (e: any) {
    send({ type: 'error', runId, error: e?.stack ? String(e.stack) : String(e) })
  } finally {
    console.log = origLog
    console.error = origErr
  }
}
