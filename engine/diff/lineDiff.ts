export type LineOp =
  | { kind: 'equal'; line: string }
  | { kind: 'add'; line: string }
  | { kind: 'del'; line: string }

function lcs(a: string[], b: string[]): number[][] {
  const n = a.length
  const m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }
  return dp
}

export function diffLines(oldText: string, newText: string): LineOp[] {
  const a = oldText.split('\n')
  const b = newText.split('\n')
  const dp = lcs(a, b)

  const ops: LineOp[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ kind: 'equal', line: a[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ kind: 'del', line: a[i] })
      i++
    } else {
      ops.push({ kind: 'add', line: b[j] })
      j++
    }
  }
  while (i < a.length) {
    ops.push({ kind: 'del', line: a[i++] })
  }
  while (j < b.length) {
    ops.push({ kind: 'add', line: b[j++] })
  }
  return ops
}
