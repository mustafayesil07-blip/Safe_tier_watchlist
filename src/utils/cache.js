const TTL = 12 * 60 * 60 * 1000 // 12 hours

export function getCached(symbol) {
  try {
    const raw = localStorage.getItem(`earnings_${symbol}`)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > TTL) {
      localStorage.removeItem(`earnings_${symbol}`)
      return null
    }
    return data
  } catch {
    return null
  }
}

export function setCached(symbol, data) {
  try {
    localStorage.setItem(
      `earnings_${symbol}`,
      JSON.stringify({ data, timestamp: Date.now() })
    )
  } catch {
    // Storage full or unavailable — silently fail
  }
}
