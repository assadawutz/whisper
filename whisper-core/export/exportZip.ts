import JSZip from 'jszip'
import { workspaceManager } from '../workspace/workspaceManager'
import { eventBus } from '../core/eventBus'

export async function exportCurrentWorkspaceZip() {
  const ws = workspaceManager.getCurrent()
  if (!ws) {
    eventBus.publish({ type: 'ui:toast', payload: { kind: 'error', text: 'No workspace loaded' } })
    return
  }
  const zip = new JSZip()
  for (const [path, f] of Object.entries(ws.files)) {
    zip.file(path, f.content)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${ws.name.replace(/[^a-z0-9-_]+/gi, '_')}.zip`
  a.click()
  URL.revokeObjectURL(a.href)
}
