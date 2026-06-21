export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const symbol = (req.query.symbol || '').toUpperCase().trim()

  if (!symbol) {
    return res.status(400).json({ error: 'symbol query parameter is required' })
  }

  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) {
    return res.status(500).json({ symbol, error: 'API key not configured' })
  }

  // Date range: today to today + 150 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().slice(0, 10)

  const future = new Date(today)
  future.setDate(future.getDate() + 150)
  const futureStr = future.toISOString().slice(0, 10)

  const url = `https://finnhub.io/api/v1/calendar/earnings?from=${todayStr}&to=${futureStr}&symbol=${symbol}&token=${apiKey}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Finnhub error for ${symbol}: ${response.status} ${errorText}`)
      return res.status(502).json({ symbol, error: `Finnhub API error: ${response.status}` })
    }

    const json = await response.json()
    const calendar = json.earningsCalendar || []

    // Filter to dates >= today, sort ascending, take first
    const upcoming = calendar
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => (a.date < b.date ? -1 : 1))

    if (upcoming.length === 0) {
      res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate')
      return res.status(200).json({
        symbol,
        nextEarningsDate: null,
        hour: null,
        isEstimate: false,
        source: 'finnhub',
      })
    }

    const next = upcoming[0]

    // Normalize hour field: bmo (before market open), amc (after market close), dmh (during market hours)
    let hour = null
    if (next.hour) {
      const h = next.hour.toLowerCase()
      if (h === 'bmo' || h === 'before market open') hour = 'bmo'
      else if (h === 'amc' || h === 'after market close') hour = 'amc'
      else if (h === 'dmh' || h === 'during market hours') hour = 'dmh'
      else hour = next.hour
    }

    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate')
    return res.status(200).json({
      symbol,
      nextEarningsDate: next.date,
      hour,
      isEstimate: false,
      source: 'finnhub',
    })
  } catch (err) {
    console.error(`Fetch error for ${symbol}:`, err)
    return res.status(500).json({ symbol, error: err.message || 'Internal server error' })
  }
}
