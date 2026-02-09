export type VfsFile = {
  id: string
  path: string
  language: 'javascript' | 'typescript' | 'json' | 'markdown' | 'text'
  content: string
  createdAt: number
  updatedAt: number
  metadata?: { isEntryPoint?: boolean }
}

export type WorkspaceSnapshot = {
  id: string
  name: string
  files: Record<string, VfsFile>
  createdAt: number
  updatedAt: number
  templateId: string
}

export type WorkspaceSummary = Pick<WorkspaceSnapshot, 'id' | 'name' | 'createdAt' | 'updatedAt' | 'templateId'>
