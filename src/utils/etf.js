export const ETF_SET = new Set(['SPY', 'QQQ', 'XLI', 'XBI', 'GLD', 'IWM', 'DIA', 'SMH', 'XLE', 'XLF', 'XLK'])

export const isETF = (symbol) => ETF_SET.has(symbol.toUpperCase())
