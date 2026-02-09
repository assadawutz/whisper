import localforage from 'localforage'
import type { WorkspaceSnapshot, WorkspaceSummary } from './vfsTypes'

const store = localforage.createInstance({ name: 'whisper-ide', storeName: 'workspaces_v1' })

type Index = Record<string, WorkspaceSummary>
const INDEX_KEY = '__index__'

async function loadIndex(): Promise<Index> {
  const cur = await store.getItem<Index>(INDEX_KEY)
  return cur ?? {}
}
async function saveIndex(idx: Index) {
  await store.setItem(INDEX_KEY, idx)
}

export async function listWorkspaces(): Promise<WorkspaceSummary[]> {
  const idx = await loadIndex()
  return Object.values(idx).sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function loadWorkspace(id: string): Promise<WorkspaceSnapshot | null> {
  const ws = await store.getItem<WorkspaceSnapshot>(id)
  return ws ?? null
}

export async function saveWorkspace(snapshot: WorkspaceSnapshot): Promise<void> {
  await store.setItem(snapshot.id, snapshot)
  const idx = await loadIndex()
  idx[snapshot.id] = { id: snapshot.id, name: snapshot.name, createdAt: snapshot.createdAt, updatedAt: snapshot.updatedAt, templateId: snapshot.templateId }
  await saveIndex(idx)
}

export async function deleteWorkspace(id: string): Promise<void> {
  await store.removeItem(id)
  const idx = await loadIndex()
  delete idx[id]
  await saveIndex(idx)
}
