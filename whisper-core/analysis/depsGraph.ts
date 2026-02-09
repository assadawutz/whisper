export type DepEdge = { from: string; to: string; kind: 'import' | 'require' }
export type DepGraph = { nodes: string[]; edges: DepEdge[]; adjacency: Record<string, string[]> }

const IMPORT_RE = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g
const REQUIRE_RE = /require\(\s*['"]([^'"]+)['"]\s*\)/g

function isRelative(spec: string) {
  return spec.startsWith('./') || spec.startsWith('../')
}

function normalize(fromPath: string, spec: string) {
  // naive resolver for workspace paths
  const base = fromPath.split('/').slice(0, -1).join('/')
  const raw = (base ? base + '/' : '') + spec
  const parts: string[] = []
  for (const p of raw.split('/')) {
    if (!p || p === '.') continue
    if (p === '..') parts.pop()
    else parts.push(p)
  }
  let out = parts.join('/')
  if (!out.endsWith('.js') && !out.endsWith('.ts') && !out.endsWith('.json')) {
    // guess common extensions (best-effort)
    out = out + '.js'
  }
  return out
}

export function buildDepGraph(files: Record<string, { content: string }>): DepGraph {
  const nodes = Object.keys(files).sort()
  const edges: DepEdge[] = []
  const adjacency: Record<string, string[]> = {}

  for (const from of nodes) {
    const content = files[from]?.content ?? ''
    const tos: string[] = []
    for (const re of [IMPORT_RE, REQUIRE_RE]) {
      re.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(content))) {
        const spec = m[1]
        if (!spec || !isRelative(spec)) continue
        const to = normalize(from, spec)
        tos.push(to)
        edges.push({ from, to, kind: re === IMPORT_RE ? 'import' : 'require' })
      }
    }
    adjacency[from] = Array.from(new Set(tos)).sort()
  }

  return { nodes, edges, adjacency }
}
