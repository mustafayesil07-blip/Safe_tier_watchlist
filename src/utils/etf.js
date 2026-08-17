export const ETF_SET = new Set([
  // Broad market
  'SPY', 'QQQ', 'IWM', 'DIA', 'GLD',
  // Sector XL-family
  'XLK', 'XLI', 'XLF', 'XLE', 'XLV', 'XLY', 'XLU', 'XLP',
  // Thematic/specialty
  'XBI', 'SMH', 'SOXX', 'ITA',
])

export const isETF = (symbol) => ETF_SET.has(symbol.toUpperCase())
