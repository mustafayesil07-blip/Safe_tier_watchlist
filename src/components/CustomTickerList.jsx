import React, { useState } from 'react'

export default function CustomTickerList({ tickers, onAdd, onRemove, onScanTicker, results }) {
  const [input, setInput] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const symbols = input
      .toUpperCase()
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    symbols.forEach(onAdd)
    setInput('')
  }

  function chipColor(symbol) {
    if (!results?.has(symbol)) return 'idle'
    const entry = results.get(symbol)
    if (entry.status === 'loading') return 'loading'
    return entry.verdict?.color || 'idle'
  }

  const chipStyles = {
    green:   'bg-radar-green/10 border-radar-green/35 text-radar-green',
    red:     'bg-radar-red/10   border-radar-red/35   text-radar-red',
    amber:   'bg-radar-amber/10 border-radar-amber/30 text-radar-amber',
    muted:   'bg-radar-panel2   border-radar-muted/20 text-radar-muted',
    loading: 'bg-radar-amber/5  border-radar-amber/20 text-radar-amber/70',
    idle:    'bg-radar-panel2   border-white/10        text-radar-bright/70',
  }

  return (
    <div className="bg-radar-panel border border-white/8 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="w-2 h-5 bg-radar-cyan rounded-full flex-shrink-0" />
        <span className="font-chakra font-bold text-base text-radar-bright tracking-wide">
          Kişisel Liste
        </span>
        <span className="text-sm text-radar-muted/60">— kalıcı olarak ekle</span>
      </div>

      {/* Add input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="AAPL, TSLA, MSFT..."
          className="
            flex-1 bg-radar-panel2 border border-white/12 rounded-lg
            px-4 py-2.5 text-sm text-radar-bright placeholder-radar-muted/40
            focus:outline-none focus:border-radar-cyan/50 focus:bg-radar-panel2
            transition-colors duration-150
          "
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="
            px-5 py-2.5 rounded-lg text-sm font-semibold
            bg-radar-cyan/15 border border-radar-cyan/35 text-radar-cyan
            hover:bg-radar-cyan/25 hover:border-radar-cyan/55
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          Ekle
        </button>
      </form>

      {/* Ticker list */}
      {tickers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tickers.map((sym) => {
            const status = chipColor(sym)
            return (
              <div
                key={sym}
                className={`
                  inline-flex items-center gap-2 pl-3 pr-1 py-1.5
                  rounded-lg border text-sm font-semibold
                  transition-all duration-150 min-h-[40px]
                  ${chipStyles[status] || chipStyles.idle}
                `}
              >
                <button
                  onClick={() => onScanTicker(sym)}
                  className="hover:underline underline-offset-2"
                  title={`${sym} tara`}
                >
                  {sym}
                </button>
                <button
                  onClick={() => onRemove(sym)}
                  title={`${sym} listeden kaldır`}
                  className="
                    w-6 h-6 rounded-md flex items-center justify-center
                    text-current/50 hover:text-current hover:bg-white/10
                    transition-all duration-150 text-base ml-1
                  "
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-radar-muted/45 italic">
          Henüz ticker eklenmedi. Üstten ekle, uygulamayı kapassan bile kalır.
        </p>
      )}

      {/* Scan all in this list */}
      {tickers.length > 0 && (
        <button
          onClick={() => tickers.forEach(onScanTicker)}
          className="
            w-full py-2.5 rounded-lg border text-sm font-semibold
            bg-radar-cyan/8 border-radar-cyan/25 text-radar-cyan/80
            hover:bg-radar-cyan/15 hover:text-radar-cyan hover:border-radar-cyan/45
            transition-all duration-150
          "
        >
          ↻ Listedeki Tümünü Tara
        </button>
      )}
    </div>
  )
}
