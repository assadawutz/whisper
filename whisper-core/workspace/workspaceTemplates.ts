import { nanoid } from 'nanoid'
import type { WorkspaceSnapshot, VfsFile } from './vfsTypes'

function file(path: string, language: VfsFile['language'], content: string, isEntryPoint?: boolean): VfsFile {
  const now = Date.now()
  return { id: nanoid(), path, language, content, createdAt: now, updatedAt: now, metadata: isEntryPoint ? { isEntryPoint: true } : {} }
}

export function makeTemplate(templateId: string, name: string): WorkspaceSnapshot {
  const now = Date.now()
  const id = nanoid()

  if (templateId === 'vanilla-js') {
    const f = file(
      'main.js',
      'javascript',
      [
        "console.log('Hello from Whisper IDE runner!')",
        "const x = 2 + 3",
        "console.log('x =', x)",
      ].join('\n'),
      true
    )
    return { id, name, files: { [f.path]: f }, createdAt: now, updatedAt: now, templateId }
  }

  // default: minimal multi-file (no imports for MVP runner)
  const a = file(
    'main.js',
    'javascript',
    [
      "console.log('Workspace ready.')",
      "console.log('Tip: keep entry self-contained for MVP runner.')",
    ].join('\n'),
    true
  )
  const readme = file('README.md', 'markdown', `# ${name}\n\nThis workspace was generated in Whisper IDE (Upgraded).\n`)
  return { id, name, files: { [a.path]: a, [readme.path]: readme }, createdAt: now, updatedAt: now, templateId }
}
