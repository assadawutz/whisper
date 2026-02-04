import * as Babel from '@babel/standalone'
import { buildDepGraph } from '../analysis/depsGraph'

export type WorkspaceFile = { language: 'javascript'|'typescript'|'json'|'markdown'|'text'; content: string }

function isCodeFile(path: string) {
  return /\.(js|ts|jsx|tsx)$/i.test(path)
}

function normalizePath(path: string) {
  const parts: string[] = []
  for (const p of path.replace(/\\/g, '/').split('/')) {
    if (!p || p === '.') continue
    if (p === '..') parts.pop()
    else parts.push(p)
  }
  return parts.join('/')
}

function resolveSpec(from: string, spec: string) {
  const base = from.split('/').slice(0, -1).join('/')
  const raw = (base ? base + '/' : '') + spec
  const norm = normalizePath(raw)

  // Try exact and common extensions
  const candidates = [norm, norm + '.ts', norm + '.tsx', norm + '.js', norm + '.jsx']
  // Handle index.* when spec points to a folder
  const idx = [norm + '/index.ts', norm + '/index.tsx', norm + '/index.js', norm + '/index.jsx']
  return [...candidates, ...idx]
}

function stripNonCodeForRun(content: string) {
  // very light hygiene — do NOT attempt heavy TS stripping (Babel handles TS)
  return content
}

function transpileToCjs(code: string, filename: string) {
  const res = Babel.transform(code, {
    filename,
    sourceMaps: false,
    presets: [
      ['env', { targets: { esmodules: true } }],
      'typescript',
      'react',
    ],
    plugins: [
      // ensure CJS output so our require() works
      ['transform-modules-commonjs', { allowTopLevelThis: true }],
    ],
  })
  return String(res.code || '')
}

export function bundleInMemory(files: Record<string, WorkspaceFile>, entryPath: string) {
  const entry = normalizePath(entryPath)
  if (!files[entry]) throw new Error(`Entry not found: ${entry}`)

  // Build graph for traversal (best-effort regex)
  const graph = buildDepGraph(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, { content: v.content }])))

  const included = new Set<string>()
  const stack = [entry]

  const exists = (p: string) => Boolean(files[p])

  while (stack.length) {
    const cur = stack.pop()!
    if (included.has(cur)) continue
    included.add(cur)

    const deps = graph.adjacency[cur] || []
    for (const depGuess of deps) {
      // depsGraph normalizes to .js; fix it by trying candidates
      const from = cur
      const spec = depGuess.includes('/') ? './' + depGuess.split('/').pop() : './' + depGuess
      // We cannot recover spec reliably from regex output, so do a second pass with actual imports
      // We'll parse imports again here for better resolution:
    }

    // parse imports from source for accurate resolution
    const src = files[cur]?.content ?? ''
    const IMPORT_RE = /import\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g
    const REQUIRE_RE = /require\(\s*['"]([^'"]+)['"]\s*\)/g
    for (const re of [IMPORT_RE, REQUIRE_RE]) {
      re.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(src))) {
        const spec = m[1]
        if (!spec || !(spec.startsWith('./') || spec.startsWith('../'))) continue
        const cands = resolveSpec(cur, spec)
        const hit = cands.find(exists)
        if (hit && !included.has(hit) && isCodeFile(hit)) stack.push(hit)
      }
    }
  }

  // Deterministic order: entry last? Better: define modules in stable topological-ish order by path
  const moduleIds = Array.from(included).sort()

  const modules: string[] = []

  for (const id of moduleIds) {
    const file = files[id]
    if (!file) continue
    if (!isCodeFile(id)) continue

    const raw = stripNonCodeForRun(file.content)
    const cjs = transpileToCjs(raw, id)

    // sourceURL helps stacks point to real module ids
    const wrapped =
      `modules[${JSON.stringify(id)}] = function(require, module, exports){\n` +
      `// #sourceURL=${id}\n` +
      `${cjs}\n` +
      `};\n`
    modules.push(wrapped)
  }

  const runtime = textwrapRuntime(entry)

  return runtime.replace('__MODULES__', modules.join('\n'))
}

function textwrapRuntime(entry: string) {
  return `;(function(){\n` +
    `  const modules = Object.create(null);\n` +
    `  const cache = Object.create(null);\n` +
    `  function dirname(p){ const a=p.split('/'); a.pop(); return a.join('/'); }\n` +
    `  function normalize(path){\n` +
    `    const parts=[];\n` +
    `    for(const seg of path.split('/')){\n` +
    `      if(!seg||seg==='.') continue;\n` +
    `      if(seg==='..') parts.pop(); else parts.push(seg);\n` +
    `    }\n` +
    `    return parts.join('/');\n` +
    `  }\n` +
    `  function resolve(from, spec){\n` +
    `    if(!spec.startsWith('./') && !spec.startsWith('../')) return spec;\n` +
    `    const base = dirname(from);\n` +
    `    const raw = (base?base+'/':'') + spec;\n` +
    `    const norm = normalize(raw);\n` +
    `    const tries = [norm, norm+'.ts', norm+'.tsx', norm+'.js', norm+'.jsx', norm+'/index.ts', norm+'/index.tsx', norm+'/index.js', norm+'/index.jsx'];\n` +
    `    for(const t of tries){ if(modules[t]) return t; }\n` +
    `    return norm;\n` +
    `  }\n` +
    `  function localRequire(from){\n` +
    `    return function(spec){\n` +
    `      const id = resolve(from, spec);\n` +
    `      return require(id);\n` +
    `    }\n` +
    `  }\n` +
    `  function require(id){\n` +
    `    if(cache[id]) return cache[id].exports;\n` +
    `    if(!modules[id]) throw new Error('Module not found: '+id);\n` +
    `    const module = { exports: {} };\n` +
    `    cache[id] = module;\n` +
    `    modules[id](localRequire(id), module, module.exports);\n` +
    `    return module.exports;\n` +
    `  }\n` +
    `  __MODULES__\n` +
    `  require(${JSON.stringify(entry)});\n` +
    `})();\n`
}
