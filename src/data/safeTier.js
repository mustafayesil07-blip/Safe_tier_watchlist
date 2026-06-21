export const SAFE_TIER = [
  { category: 'ETF', tickers: ['SPY', 'QQQ', 'XLI', 'XBI'] },
  { category: 'Sanayi', tickers: ['CAT', 'DE', 'LMT'] },
  { category: 'Tüketici', tickers: ['COST', 'MCD'] },
  { category: 'Finans', tickers: ['MA', 'V', 'JPM'] },
  { category: 'Teknoloji', tickers: ['META', 'NVDA', 'TSM'] },
  { category: 'Sağlık', tickers: ['LLY', 'UNH'] },
  { category: 'Enerji', tickers: ['XOM'] },
]

export const HIGHER_IV_TIER = ['RKLB', 'ASTS', 'APLD']

export const ALL_SAFE_TICKERS = SAFE_TIER.flatMap((c) => c.tickers)
