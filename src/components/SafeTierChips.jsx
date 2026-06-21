import React, { useState } from 'react'
import { SAFE_TIER, HIGHER_IV_TIER } from '../data/safeTier.js'

function getChipStatus(symbol, results) {
  if (!results || !results.has(symbol)) return 'idle'
  const entry = results.get(symbol)
  if (entry.status === 'loading') return 'loading'
  if (!entry.verdict) return 'idle'
  return entry.verdict.color
}

function StatusDot({ status }) {
  if (status === 'loading') {
    return (
      <span className="w-2 h-2 rounded-full border border-radar-amber/60 flex-shrink-0 animate-spin" style={{ borderTopColor: 'transparent' }} />
    )
  }
  const colorMap = {
    green: 'bg-radar-green',
    red:   'bg-radar-red animate-pulse',
    amber: 'bg-radar-amber',
    muted: 'bg-radar-muted/40',
    idle:  'bg-radar-muted/25',
  }
  return (
    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colorMap[status] || colorMap.idle}`} />
  )
}

function TickerChip({ symbol, results, onScanTicker }) {
  const status = getChipStatus(symbol, results)

  const styles = {
    green: 'bg-radar-green/10 border-radar-green/35 text-radar-green hover:bg-radar-green/18',
    red:   'bg-radar-red/10   border-radar-red/35   text-radar-red   hover:bg-radar-red/18',
    amber: 'bg-radar-amber/10 border-radar-amber/30 text-radar-amber hover:bg-radar-amber/18',
    muted: 'bg-radar-panel2   border-radar-muted/20 text-radar-muted hover:text-radar-bright hover:border-radar-muted/40',
    idle:  'bg-radar-panel2   border-white/10        text-radar-bright/70 hover:text-radar-bright hover:border-radar-cyan/30',
    loading:'bg-radar-amber/5 border-radar-amber/20 text-radar-amber/70',
  }

  const cls = styles[status] || styles.idle

  return (
    <button
      onClick={() => onScanTicker(symbol)}
      title={`${symbol} tara`}
      className={`
        inline-flex items-center gap-2
        px-3 py-2 rounded-lg border
        text-sm font-semibold
        transition-all duration-150 min-h-[40px]
        focus:outline-none focus:ring-2 focus:ring-radar-cyan/25
        ${cls}
      `}
    >
      <StatusDot status={status} />
      {symbol}
    </button>
  )
}

export default function SafeTierChips({ onScanTicker, results }) {
  const [showHigherIV, setShowHigherIV] = useState(false)

  return (
    <div className="bg-radar-panel border border-white/8 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="w-2 h-5 bg-radar-green rounded-full flex-shrink-0" />
        <span className="font-chakra font-bold text-base text-radar-bright tracking-wide">
          Safe Tier
        </span>
        <span className="text-sm text-radar-muted/60 ml-1">
          — chip'e tıklayarak tara
        </span>
      </div>

      {/* Categories */}
      {SAFE_TIER.map((cat) => (
        <div key={cat.category} className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-radar-muted/55 tracking-wider w-20 flex-shrink-0 font-medium">
            {cat.category}
          </span>
          <div className="flex flex-wrap gap-2">
            {cat.tickers.map((t) => (
              <TickerChip key={t} symbol={t} results={results} onScanTicker={onScanTicker} />
            ))}
          </div>
        </div>
      ))}

      {/* Higher-IV collapsible */}
      <div className="pt-2 border-t border-white/6">
        <button
          onClick={() => setShowHigherIV((v) => !v)}
          className="flex items-center gap-2 text-radar-amber/70 hover:text-radar-amber transition-colors duration-150"
        >
          <span className="text-sm font-medium">
            {showHigherIV ? '▾' : '▸'}
          </span>
          {/* Use explicit string, not CSS uppercase, to avoid Turkish i→İ problem */}
          <span className="text-sm font-semibold">Yüksek-IV Tier</span>
          <span className="text-xs text-radar-muted/45 ml-1">(yüksek volatilite — dikkatli kullan)</span>
        </button>

        {showHigherIV && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-radar-muted/55 tracking-wider w-20 flex-shrink-0 font-medium">
              Yüksek IV
            </span>
            <div className="flex flex-wrap gap-2">
              {HIGHER_IV_TIER.map((t) => (
                <TickerChip key={t} symbol={t} results={results} onScanTicker={onScanTicker} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
