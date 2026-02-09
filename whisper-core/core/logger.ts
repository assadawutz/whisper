export function logInfo(scope: string, msg: string, extra?: unknown) {
  console.info(`[${scope}] ${msg}`, extra ?? '')
}
export function logError(scope: string, msg: string, extra?: unknown) {
  console.error(`[${scope}] ${msg}`, extra ?? '')
}
