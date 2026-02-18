export function logInfo(message: string, data?: unknown) {
  console.info(`[snewy] ${message}`, data ?? '')
}

export function logError(message: string, error?: unknown) {
  console.error(`[snewy] ${message}`, error ?? '')
}
