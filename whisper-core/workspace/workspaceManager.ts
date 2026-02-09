import { eventBus } from '../core/eventBus'
import { makeTemplate } from './workspaceTemplates'
import type { WorkspaceSnapshot, VfsFile, WorkspaceSummary } from './vfsTypes'
import * as store from './workspaceStore'
import { nanoid } from 'nanoid'

export class WorkspaceManager {
  private current: WorkspaceSnapshot | null = null
  private saveTimer: number | null = null

  async list(): Promise<WorkspaceSummary[]> {
    return store.listWorkspaces()
  }

  getCurrent(): WorkspaceSnapshot | null {
    return this.current
  }

  async load(id: string): Promise<WorkspaceSnapshot | null> {
    const ws = await store.loadWorkspace(id)
    if (!ws) return null
    this.current = ws
    return ws
  }

  async create(templateId: string, name: string): Promise<WorkspaceSnapshot> {
    const ws = makeTemplate(templateId, name)
    await store.saveWorkspace(ws)
    this.current = ws
    return ws
  }

  async remove(id: string) {
    if (this.current?.id === id) this.current = null
    await store.deleteWorkspace(id)
  }

  getFile(path: string): VfsFile | null {
    if (!this.current) return null
    return this.current.files[path] ?? null
  }

  listFiles(): string[] {
    if (!this.current) return []
    return Object.keys(this.current.files).sort()
  }

  upsertFile(path: string, language: VfsFile['language'], content: string) {
    if (!this.current) return
    const now = Date.now()
    const existing = this.current.files[path]
    const next: VfsFile = existing
      ? { ...existing, content, language, updatedAt: now }
      : { id: nanoid(), path, language, content, createdAt: now, updatedAt: now }
    this.current = { ...this.current, files: { ...this.current.files, [path]: next }, updatedAt: now }
    eventBus.publish({ type: 'workspace:changed', payload: { workspaceId: this.current.id, paths: [path] } })
    this.scheduleSave()
  }

  renameFile(oldPath: string, newPath: string) {
    if (!this.current) return
    const f = this.current.files[oldPath]
    if (!f) return
    const now = Date.now()
    const moved: VfsFile = { ...f, path: newPath, updatedAt: now }
    const files = { ...this.current.files }
    delete files[oldPath]
    files[newPath] = moved
    this.current = { ...this.current, files, updatedAt: now }
    eventBus.publish({ type: 'workspace:changed', payload: { workspaceId: this.current.id, paths: [oldPath, newPath] } })
    this.scheduleSave()
  }

  deleteFile(path: string) {
    if (!this.current) return
    if (!this.current.files[path]) return
    const now = Date.now()
    const files = { ...this.current.files }
    delete files[path]
    this.current = { ...this.current, files, updatedAt: now }
    eventBus.publish({ type: 'workspace:changed', payload: { workspaceId: this.current.id, paths: [path] } })
    this.scheduleSave()
  }

  setEntry(path: string) {
    if (!this.current) return
    const now = Date.now()
    const files: Record<string, VfsFile> = {}
    for (const [p, f] of Object.entries(this.current.files)) {
      files[p] = { ...f, metadata: { ...(f.metadata ?? {}), isEntryPoint: p === path }, updatedAt: p === path ? now : f.updatedAt }
    }
    this.current = { ...this.current, files, updatedAt: now }
    eventBus.publish({ type: 'workspace:changed', payload: { workspaceId: this.current.id, paths: [path] } })
    this.scheduleSave()
  }

  private scheduleSave() {
    if (!this.current) return
    if (this.saveTimer) window.clearTimeout(this.saveTimer)
    this.saveTimer = window.setTimeout(async () => {
      if (!this.current) return
      await store.saveWorkspace(this.current)
      eventBus.publish({ type: 'workspace:saved', payload: { workspaceId: this.current.id } })
      this.saveTimer = null
    }, 900)
  }
}

export const workspaceManager = new WorkspaceManager()
