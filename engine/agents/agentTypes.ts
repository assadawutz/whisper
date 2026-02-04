import type { WorkspaceSnapshot } from '../workspace/vfsTypes'

export type EditInstruction = {
  path: string
  language: 'javascript' | 'typescript' | 'json' | 'markdown' | 'text'
  newContent: string
}

export type ProposedChange = {
  path: string
  language: EditInstruction['language']
  oldContent: string
  newContent: string
}

export type AgentResult = {
  notes: string
  edits: EditInstruction[]
}

export type ReviewResult = {
  notes: string
  edits: EditInstruction[]
  riskNotes?: string
}

export type AgentContext = {
  goal: string
  workspace: WorkspaceSnapshot
  focusPaths: string[]
}
