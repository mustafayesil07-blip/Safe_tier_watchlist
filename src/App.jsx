import React, { useState, useCallback } from 'react'
import { getCached, setCached } from './utils/cache.js'
import { getVerdict } from './utils/verdict.js'
import { isETF } from './utils/etf.js'
import { ALL_SAFE_TICKERS, HIGHER_IV_TIER } from './data/safeTier.js'
import Header from './components/Header.jsx'
import DTESettings from './components/DTESettings.jsx'
import TickerInput from './components/TickerInput.jsx'
import SafeTierChips from './components/SafeTierChips.jsx'
import SummaryBanner from './components/SummaryBanner.jsx'
import ResultCard from './components/ResultCard.jsx'
import SortMenu from './components/SortMenu.jsx'

// Concurrency-limited batch scanner
async function scanWithConcurrency(symbols, scanFn, concurrency = 4) {
  let index = 0
  async function worker() {
    while (index < symbols.length) {
      const sym = symbols[index++]
      await scanFn(sym)
      // Small delay to respect rate limits
      await new Promise((r) => setTimeout(r, 150))
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, symbols.length) },
    worker
  )
  await Promise.all(workers)
}

const VERDICT_ORDER = { KACIN: 0, BILINMIYOR: 1, ACIK: 2, GECMIS: 3, HATA: 4 }

function sortResults(resultsMap, sortMode) {
  const entries = Array.from(resultsMap.entries())

  if (sortMode === 'added') return entries

  if (sortMode === 'alpha') {
    return [...entries].sort(([a], [b]) => a.localeCompare(b))
  }

  if (sortMode === 'days') {
    return [...entries].sort(([, a], [, b]) => {
      const aDays = a.verdict?.daysUntil ?? Infinity
      const bDays = b.verdict?.daysUntil ?? Infinity
      // loading/null go to the bottom
      return aDays - bDays
    })
  }

  // Default: verdict priority
  return [...entries].sort(([, a], [, b]) => {
    const av = a.verdict?.verdict || 'LOADING'
    const bv = b.verdict?.verdict || 'LOADING'
    const aOrder = VERDICT_ORDER[av] ?? 10
    const bOrder = VERDICT_ORDER[bv] ?? 10
    if (aOrder !== bOrder) return aOrder - bOrder
    if (a.status === 'loading' && b.status !== 'loading') return 1
    if (a.status !== 'loading' && b.status === 'loading') return -1
    return 0
  })
}

export default function App() {
  const [dte, setDte] = useState(45)
  // results: Map<symbol, { status: 'loading'|'done'|'error', data: object|null, verdict: object|null }>
  const [results, setResults] = useState(new Map())
  const [scanningAll, setScanningAll] = useState(false)
  const [sortMode, setSortMode] = useState('verdict')
  // rowColors: Map<symbol, 'green'|'blue'|'red'|null>
  const [rowColors, setRowColors] = useState(new Map())

  // Helper: merge a patch into one symbol's entry
  const updateResult = useCallback((symbol, patch) => {
    setResults((prev) => {
      const next = new Map(prev)
      const existing = next.get(symbol) || {}
      next.set(symbol, { ...existing, ...patch })
      return next
    })
  }, [])

  // Core scan function — accepts explicit dte so async closures stay consistent
  const scanTickerWithDte = useCallback(
    async (symbol, currentDte) => {
      const sym = symbol.toUpperCase().trim()
      if (!sym) return

      // Mark as loading
      updateResult(sym, { status: 'loading', data: null, verdict: null })

      // ETFs have no earnings — fast path
      if (isETF(sym)) {
        const v = getVerdict(sym, null, currentDte)
        updateResult(sym, { status: 'done', data: null, verdict: v })
        return
      }

      // Check localStorage cache (12-hour TTL)
      const cached = getCached(sym)
      if (cached) {
        const v = getVerdict(sym, cached, currentDte)
        updateResult(sym, { status: 'done', data: cached, verdict: v })
        return
      }

      // Fetch from Vercel serverless function
      try {
        const res = await fetch(`/api/earnings?symbol=${encodeURIComponent(sym)}`)
        const data = await res.json()

        if (!res.ok) {
          const errData = { error: data.error || `HTTP ${res.status}` }
          const v = getVerdict(sym, errData, currentDte)
          updateResult(sym, { status: 'error', data: errData, verdict: v })
          return
        }

        setCached(sym, data)
        const v = getVerdict(sym, data, currentDte)
        updateResult(sym, { status: 'done', data, verdict: v })
      } catch (err) {
        const errData = { error: err.message || 'Ağ hatası — bağlantını kontrol et' }
        const v = getVerdict(sym, errData, currentDte)
        updateResult(sym, { status: 'error', data: errData, verdict: v })
      }
    },
    [updateResult]
  )

  // Scan a single ticker using current DTE
  const handleScanTicker = useCallback(
    (symbol) => {
      scanTickerWithDte(symbol, dte)
    },
    [scanTickerWithDte, dte]
  )

  // Scan an array of symbols (from TickerInput)
  const handleScanTickers = useCallback(
    (symbols) => {
      const capturedDte = dte
      const unique = [...new Set(symbols.map((s) => s.toUpperCase().trim()).filter(Boolean))]
      scanWithConcurrency(unique, (sym) => scanTickerWithDte(sym, capturedDte), 4)
    },
    [scanTickerWithDte, dte]
  )

  // Scan all Safe Tier tickers
  const handleScanAll = useCallback(async () => {
    if (scanningAll) return
    setScanningAll(true)
    const capturedDte = dte
    try {
      await scanWithConcurrency(
        [...ALL_SAFE_TICKERS],
        (sym) => scanTickerWithDte(sym, capturedDte),
        4
      )
    } finally {
      setScanningAll(false)
    }
  }, [scanningAll, scanTickerWithDte, dte])

  // Remove a card
  const handleRemove = useCallback((symbol) => {
    setResults((prev) => {
      const next = new Map(prev)
      next.delete(symbol)
      return next
    })
  }, [])

  // When DTE changes: recalculate verdicts for already-fetched data without re-fetching
  const handleDteChange = useCallback((newDte) => {
    setDte(newDte)
    setResults((prev) => {
      const next = new Map()
      for (const [sym, entry] of prev) {
        if (entry.status !== 'loading') {
          const v = getVerdict(sym, entry.data, newDte)
          next.set(sym, { ...entry, verdict: v })
        } else {
          next.set(sym, entry)
        }
      }
      return next
    })
  }, [])

  const handleColorChange = useCallback((symbol, color) => {
    setRowColors((prev) => {
      const next = new Map(prev)
      if (color) next.set(symbol, color)
      else next.delete(symbol)
      return next
    })
  }, [])

  const sortedResults = sortResults(results, sortMode)
  const hasResults = results.size > 0

  return (
    <div className="min-h-screen bg-radar-bg text-radar-bright">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* DTE settings */}
        <DTESettings dte={dte} onDteChange={handleDteChange} />

        {/* Ticker input */}
        <TickerInput onScan={handleScanTickers} />

        {/* Safe Tier chips */}
        <SafeTierChips
          onScanTicker={handleScanTicker}
          scannedSymbols={new Set(results.keys())}
          results={results}
        />

        {/* Scan All button */}
        <button
          onClick={handleScanAll}
          disabled={scanningAll}
          className={`
            w-full py-3 px-6 rounded-lg border
            font-chakra font-bold text-sm tracking-[0.2em] uppercase
            transition-all duration-150
            ${scanningAll
              ? 'bg-radar-amber/5 border-radar-amber/20 text-radar-amber/40 cursor-not-allowed'
              : 'bg-radar-amber/10 border-radar-amber/30 text-radar-amber hover:bg-radar-amber/20 hover:border-radar-amber/60 hover:shadow-[0_0_20px_rgba(255,183,62,0.2)] active:scale-[0.99]'
            }
          `}
        >
          {scanningAll
            ? `↻ Taranıyor... (${ALL_SAFE_TICKERS.length} sembol)`
            : `⬡ Tümünü Tara — Safe Tier (${ALL_SAFE_TICKERS.length} sembol)`
          }
        </button>

        {/* Summary banner */}
        {hasResults && <SummaryBanner results={results} />}

        {/* Results grid */}
        {hasResults && (
          <section aria-label="Tarama sonuçları">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-radar-muted/50 tracking-widest uppercase">
                  Sonuçlar
                </span>
                <span className="font-mono text-[10px] text-radar-muted/30">
                  — {results.size} sembol · DTE {dte}G penceresi
                </span>
              </div>
              <SortMenu sortMode={sortMode} onSortChange={setSortMode} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedResults.map(([symbol, entry]) => (
                <ResultCard
                  key={symbol}
                  symbol={symbol}
                  status={entry.status}
                  data={entry.data}
                  verdict={entry.verdict}
                  dte={dte}
                  customColor={rowColors.get(symbol) ?? null}
                  onColorChange={(color) => handleColorChange(symbol, color)}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!hasResults && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative w-20 h-20 mb-6 opacity-20">
              <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                <circle cx="32" cy="32" r="28" stroke="#5BD6E6" strokeWidth="1.5" strokeOpacity="0.6" />
                <circle cx="32" cy="32" r="20" stroke="#5BD6E6" strokeWidth="1" strokeOpacity="0.4" />
                <circle cx="32" cy="32" r="12" stroke="#5BD6E6" strokeWidth="1" strokeOpacity="0.3" />
                <circle cx="32" cy="32" r="3" fill="#5BD6E6" fillOpacity="0.8" />
                <line x1="32" y1="4" x2="32" y2="60" stroke="#5BD6E6" strokeWidth="0.5" strokeOpacity="0.2" />
                <line x1="4" y1="32" x2="60" y2="32" stroke="#5BD6E6" strokeWidth="0.5" strokeOpacity="0.2" />
                <line x1="32" y1="32" x2="52" y2="12" stroke="#5BD6E6" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.9" />
              </svg>
            </div>
            <p className="font-chakra text-radar-muted/40 text-sm tracking-wider uppercase">
              Henüz tarama yapılmadı
            </p>
            <p className="font-mono text-[11px] text-radar-muted/25 mt-2 tracking-wide">
              Sembol gir veya Safe Tier chip'ine tıkla · "Tümünü Tara" ile hepsini tara
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-radar-cyan/8 mt-12 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[10px] text-radar-muted/30 tracking-wider">
            KAZANÇ RADARI · options premium seller tool
          </p>
          <p className="font-mono text-[10px] text-radar-muted/20 tracking-wider">
            Veriler Finnhub · 12s cache · yatırım tavsiyesi değildir
          </p>
        </div>
      </footer>
    </div>
  )
}
