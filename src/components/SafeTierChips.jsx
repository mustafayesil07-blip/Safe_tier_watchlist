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
  if (status === 'idle') {
    return <span className="w-1.5 h-1.5 rounded-full bg-radar-muted/30 flex-shrink-0" />
  }
  if (status === 'loading') {
    return (
      <span className="w-1.5 h-1.5 rounded-full border border-radar-amber/60 flex-shrink-0 animate-spin" style={{ borderTopColor: 'transparent' }} />
    )
  }
  if (status === 'green') {
    return <span className="w-1.5 h-1.5 rounded-full bg-radar-green flex-shrink-0" />
  }
  if (status === 'red') {
    return <span className="w-1.5 h-1.5 rounded-full bg-radar-red animate-pulse flex-shrink-0" />
  }
  if (status === 'amber') {
    return <span className="w-1.5 h-1.5 rounded-full bg-radar-amber flex-shrink-0" />
  }
  return <span className="w-1.5 h-1.5 rounded-full bg-radar-muted/30 flex-shrink-0" />
}

function TickerChip({ symbol, results, onScanTicker }) {
  const status = getChipStatus(symbol, results)

  const borderColor =
    status === 'green'
      ? 'border-radar-green/30 hover:border-radar-green/60'
      : status === 'red'
      ? 'border-radar-red/40 hover:border-radar-red/70'
      : status === 'amber'
      ? 'border-radar-amber/30 hover:border-radar-amber/60'
      : 'border-radar-muted/20 hover:border-radar-cyan/30'

  const bgColor =
    status === 'green'
      ? 'bg-radar-green/5'
      : status === 'red'
      ? 'bg-radar-red/5'
      : 'bg-radar-panel2'

  return (
    <button
      onClick={() => onScanTicker(symbol)}
      title={`${symbol} için tara`}
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded border
        font-mono text-xs font-medium
        text-radar-bright/80 hover:text-radar-bright
        transition-all duration-150
        ${borderColor} ${bgColor}
        hover:shadow-[0_0_8px_rgba(91,214,230,0.1)]
      `}
    >
      <StatusDot status={status} />
      {symbol}
    </button>
  )
}

export default function SafeTierChips({ onScanTicker, scannedSymbols, results }) {
  const [showHigherIV, setShowHigherIV] = useState(false)

  return (
    <div className="bg-radar-panel border border-radar-cyan/10 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-4 bg-radar-green rounded-full flex-shrink-0" />
        <span className="font-chakra font-semibold text-sm text-radar-bright tracking-wide">
          Safe Tier
        </span>
        <span className="font-mono text-[10px] text-radar-muted/50 ml-1">
          — hızlı seçim için chip'e tıkla
        </span>
      </div>

      {/* Categories */}
      {SAFE_TIER.map((cat) => (
        <div key={cat.category} className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] text-radar-muted/60 tracking-widest uppercase w-16 flex-shrink-0">
            {cat.category}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {cat.tickers.map((t) => (
              <TickerChip
                key={t}
                symbol={t}
                results={results}
                onScanTicker={onScanTicker}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Higher-IV collapsible section */}
      <div className="pt-1 border-t border-radar-muted/10">
        <button
          onClick={() => setShowHigherIV((v) => !v)}
          className="flex items-center gap-2 text-radar-amber/70 hover:text-radar-amber transition-colors duration-150"
        >
          <span className="font-mono text-[10px] tracking-widest uppercase">
            {showHigherIV ? '▾' : '▸'} Higher-IV Tier
          </span>
          <span className="font-mono text-[10px] text-radar-muted/40">
            (yüksek volatilite — dikkatli kullan)
          </span>
        </button>

        {showHigherIV && (
          <div className="flex flex-wrap items-center gap-2 mt-2 pl-0">
            <span className="font-mono text-[10px] text-radar-muted/60 tracking-widest uppercase w-16 flex-shrink-0">
              Yüksek IV
            </span>
            <div className="flex flex-wrap gap-1.5">
              {HIGHER_IV_TIER.map((t) => (
                <TickerChip
                  key={t}
                  symbol={t}
                  results={results}
                  onScanTicker={onScanTicker}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
