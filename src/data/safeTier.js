export const SAFE_TIER = [
  {
    category: 'ETF',
    tickers: ['SPY', 'QQQ', 'IWM', 'DIA', 'XLK', 'XLI', 'XLF', 'XLE', 'XLV', 'XLY', 'XLU', 'XLP', 'XBI', 'SMH', 'SOXX', 'ITA'],
  },
  {
    category: 'Sanayi',
    tickers: ['CAT', 'DE', 'ETN', 'GE', 'GEV', 'LMT', 'NOC', 'RTX', 'UNP'],
  },
  {
    category: 'Tüketici',
    tickers: ['COST', 'DG', 'HD', 'KO', 'LOW', 'MCD', 'PEP', 'PG', 'SBUX', 'WMT'],
  },
  {
    category: 'Finans',
    tickers: ['BAC', 'JPM', 'MA', 'V'],
  },
  {
    category: 'Teknoloji',
    tickers: ['AAPL', 'AMAT', 'AMD', 'AMZN', 'AVGO', 'CLS', 'GOOGL', 'KLAC', 'META', 'MSFT', 'NVDA', 'TSM'],
  },
  {
    category: 'Sağlık',
    tickers: ['DHR', 'HCA', 'JNJ', 'LLY', 'MDT', 'MRK', 'TMO', 'UNH'],
  },
  {
    category: 'Enerji',
    tickers: ['AEP', 'BE', 'CEG', 'COP', 'CVX', 'NEE', 'SLB', 'SO', 'XOM'],
  },
]

export const HIGHER_IV_TIER = ['RKLB', 'ASTS', 'APLD', 'IREN', 'NBIS', 'SNDK', 'VSAT', 'SPCX']

export const ALL_SAFE_TICKERS = [...SAFE_TIER.flatMap((c) => c.tickers), ...HIGHER_IV_TIER]
