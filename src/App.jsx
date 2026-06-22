import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { getCached, setCached } from './utils/cache.js'
import { getVerdict } from './utils/verdict.js'
import { isETF } from './utils/etf.js'
import { ALL_SAFE_TICKERS } from './data/safeTier.js'
import Header from './components/Header.jsx'
import DTESettings from './components/DTESettings.jsx'
import TickerInput from './components/TickerInput.jsx'
import SafeTierChips from './components/SafeTierChips.jsx'
import CustomTickerList from './components/CustomTickerList.jsx'
import SummaryBanner from './components/SummaryBanner.jsx'
import ResultCard from './components/ResultCard.jsx'
import ListView from './components/ListView.jsx'
import SortMenu from './components/SortMenu.jsx'

async function scanWithConcurrency(symbols, scanFn, concurrency = 4) {
  let index = 0
  async function worker() {
    while (index < symbols.length) {
      const sym = symbols[index++]
      await scanFn(sym)
      await new Promise((r) => setTimeout(r, 150))
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, symbols.length) }, worker)
  )
}

const VERDICT_ORDER = { KACIN: 0, BILINMIYOR: 1, GUVENLI: 2, GECMIS: 3, HATA: 4 }
const COLOR_ORDER   = { green: 0, blue: 1, red: 2 }

function sortEntries(entries, sortMode, rowColors) {
  if (sortMode === 'added') return entries

  if (sortMode === 'alpha') {
    return [...entries].sort(([a], [b]) => a.localeCompare(b))
  }

  if (sortMode === 'days-asc') {
    return [...entries].sort(([, a], [, b]) => {
      const ad = a.verdict?.daysUntil ?? Infinity
      const bd = b.verdict?.daysUntil ?? Infinity
      return ad - bd
    })
  }

  if (sortMode === 'days-desc') {
    return [...entries].sort(([, a], [, b]) => {
      const ad = a.verdict?.daysUntil ?? -Infinity
      const bd = b.verdict?.daysUntil ?? -Infinity
      return bd - ad
    })
  }

  if (sortMode === 'colors') {
    return [...entries].sort(([as, a], [bs, b]) => {
      const ac = rowColors.get(as)
      const bc = rowColors.get(bs)
      const ao = ac != null ? (COLOR_ORDER[ac] ?? 99) : 99
      const bo = bc != null ? (COLOR_ORDER[bc] ?? 99) : 99
      if (ao !== bo) return ao - bo
      return (VERDICT_ORDER[a.verdict?.verdict] ?? 10) - (VERDICT_ORDER[b.verdict?.verdict] ?? 10)
    })
  }

  return [...entries].sort(([, a], [, b]) => {
    const ao = VERDICT_ORDER[a.verdict?.verdict] ?? 10
    const bo = VERDICT_ORDER[b.verdict?.verdict] ?? 10
    if (ao !== bo) return ao - bo
    if (a.status === 'loading' && b.status !== 'loading') return 1
    if (a.status !== 'loading' && b.status === 'loading') return -1
    return 0
  })
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function loadResults() {
  try {
    const raw = localStorage.getItem('scan_results')
    if (!raw) return { map: new Map(), savedAt: null }
    const { entries, savedAt } = JSON.parse(raw)
    // Restore only terminal states; skip anything still loading
    const map = new Map(
      entries.filter(([, e]) => e.status === 'done' || e.status === 'error')
    )
    return { map, savedAt: savedAt || null }
  } catch { return { map: new Map(), savedAt: null } }
}

function saveResults(resultsMap) {
  try {
    const entries = Array.from(resultsMap.entries())
      .filter(([, e]) => e.status === 'done' || e.status === 'error')
    localStorage.setItem('scan_results', JSON.stringify({ entries, savedAt: Date.now() }))
  } catch {}
}

function loadRowColors() {
  try {
    const raw = localStorage.getItem('row_colors')
    return raw ? new Map(JSON.parse(raw)) : new Map()
  } catch { return new Map() }
}

function timeAgo(ts) {
  if (!ts) return null
  const mins = Math.round((Date.now() - ts) / 60000)
  if (mins < 1)  return 'az önce'
  if (mins < 60) return `${mins} dakika önce`
  const h = Math.round(mins / 60)
  if (h < 24)    return `${h} saat önce`
  return `${Math.round(h / 24)} gün önce`
}

export default function App() {
  const [dte, setDte] = useState(() => {
    const saved = Number(localStorage.getItem('dte'))
    return saved > 0 ? saved : 45
  })
  // Results: loaded from localStorage on first render
  const _initial = useMemo(() => loadResults(), [])
  const [results,     setResults]     = useState(_initial.map)
  const [lastScanAt,  setLastScanAt]  = useState(_initial.savedAt)
  const [scanningAll, setScanningAll] = useState(false)
  // Sort mode + view mode — persisted
  const [sortMode, setSortMode] = useState(() => localStorage.getItem('sort_mode') || 'verdict')
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('view_mode') || 'card')
  // Row colors — persisted
  const [rowColors, setRowColors] = useState(loadRowColors)

  // Manual date overrides — persisted, never overwritten by API scans
  const [manualDates, setManualDates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('manual_dates') || '{}') }
    catch { return {} }
  })

  // Checklist state — { [symbol]: { ivr, premium, sdc, sma, rsi, destek } }
  const [checklist, setChecklist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('checklist_state') || '{}') }
    catch { return {} }
  })

  // Notes — { [symbol]: string }
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notes_state') || '{}') }
    catch { return {} }
  })

  // ── Persist preferences whenever they change ────────────────────────────────
  useEffect(() => { localStorage.setItem('sort_mode', sortMode) }, [sortMode])
  useEffect(() => { localStorage.setItem('view_mode', viewMode) }, [viewMode])
  useEffect(() => { localStorage.setItem('dte', String(dte))    }, [dte])
  useEffect(() => {
    localStorage.setItem('row_colors', JSON.stringify(Array.from(rowColors.entries())))
  }, [rowColors])
  useEffect(() => {
    localStorage.setItem('checklist_state', JSON.stringify(checklist))
  }, [checklist])
  useEffect(() => {
    localStorage.setItem('notes_state', JSON.stringify(notes))
  }, [notes])

  // Persist results whenever they change (skip loading states)
  useEffect(() => {
    const hasDone = Array.from(results.values()).some((e) => e.status === 'done' || e.status === 'error')
    if (!hasDone) return
    saveResults(results)
    setLastScanAt(Date.now())
  }, [results])

  const handleCheckToggle = useCallback((symbol, itemId) => {
    setChecklist((prev) => {
      const cur = prev[symbol] || {}
      return { ...prev, [symbol]: { ...cur, [itemId]: !cur[itemId] } }
    })
  }, [])

  const handleNoteChange = useCallback((symbol, text) => {
    setNotes((prev) => {
      if (!text) {
        const next = { ...prev }
        delete next[symbol]
        return next
      }
      return { ...prev, [symbol]: text }
    })
  }, [])

  // Persist results whenever they change (skip loading states)
  useEffect(() => {
    const hasDone = Array.from(results.values()).some((e) => e.status === 'done' || e.status === 'error')
    if (!hasDone) return
    saveResults(results)
    setLastScanAt(Date.now())
  }, [results])

  // Custom personal ticker list — persisted
  const [customTickers, setCustomTickers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('custom_tickers') || '[]') }
    catch { return [] }
  })
  useEffect(() => {
    localStorage.setItem('custom_tickers', JSON.stringify(customTickers))
  }, [customTickers])

  const addCustomTicker = useCallback((symbol) => {
    const sym = symbol.toUpperCase().trim()
    if (!sym) return
    setCustomTickers((prev) => prev.includes(sym) ? prev : [...prev, sym])
  }, [])
  const removeCustomTicker = useCallback((symbol) => {
    setCustomTickers((prev) => prev.filter((t) => t !== symbol))
  }, [])

  // Manual date: set or clear for a symbol
  const handleManualDateChange = useCallback((symbol, date) => {
    setManualDates((prev) => {
      const next = { ...prev }
      if (date) next[symbol] = date
      else delete next[symbol]
      localStorage.setItem('manual_dates', JSON.stringify(next))
      return next
    })
  }, [])

  // Effective results: merge raw results + manual dates + compute verdict reactively
  const effectiveResults = useMemo(() => {
    const map = new Map()
    for (const [sym, entry] of results) {
      const manualDate = manualDates[sym] || null
      let effectiveData = entry.data
      if (manualDate && entry.data) {
        effectiveData = { ...entry.data, nextEarningsDate: manualDate, isManual: true }
      }
      const verdict = entry.status !== 'loading' ? getVerdict(sym, effectiveData, dte) : null
      map.set(sym, { ...entry, effectiveData, manualDate, verdict })
    }
    return map
  }, [results, manualDates, dte])

  const updateResult = useCallback((symbol, patch) => {
    setResults((prev) => {
      const next = new Map(prev)
      next.set(symbol, { ...(next.get(symbol) || {}), ...patch })
      return next
    })
  }, [])

  // Scan core — stores raw API data only, verdict computed in useMemo
  const scanTicker = useCallback(async (symbol) => {
    const sym = symbol.toUpperCase().trim()
    if (!sym) return

    updateResult(sym, { status: 'loading', data: null })

    if (isETF(sym)) {
      updateResult(sym, { status: 'done', data: null })
      return
    }

    const cached = getCached(sym)
    if (cached) {
      updateResult(sym, { status: 'done', data: cached })
      return
    }

    try {
      const res = await fetch(`/api/earnings?symbol=${encodeURIComponent(sym)}`)
      const data = await res.json()
      if (!res.ok) {
        updateResult(sym, { status: 'error', data: { error: data.error || `HTTP ${res.status}` } })
        return
      }
      setCached(sym, data)
      updateResult(sym, { status: 'done', data })
    } catch (err) {
      updateResult(sym, { status: 'error', data: { error: err.message || 'Ağ hatası' } })
    }
  }, [updateResult])

  const handleScanTicker  = useCallback((symbol) => scanTicker(symbol), [scanTicker])
  const handleScanTickers = useCallback((symbols) => {
    const unique = [...new Set(symbols.map((s) => s.toUpperCase().trim()).filter(Boolean))]
    scanWithConcurrency(unique, scanTicker, 4)
  }, [scanTicker])

  const handleScanAll = useCallback(async () => {
    if (scanningAll) return
    setScanningAll(true)
    try {
      await scanWithConcurrency([...ALL_SAFE_TICKERS], scanTicker, 4)
    } finally {
      setScanningAll(false)
    }
  }, [scanningAll, scanTicker])

  const handleRemove = useCallback((symbol) => {
    setResults((prev) => { const n = new Map(prev); n.delete(symbol); return n })
  }, [])

  const handleColorChange = useCallback((symbol, color) => {
    setRowColors((prev) => {
      const next = new Map(prev)
      if (color) next.set(symbol, color)
      else next.delete(symbol)
      return next
    })
  }, [])

  const sortedEntries = sortEntries(Array.from(effectiveResults.entries()), sortMode, rowColors)
  const hasResults    = effectiveResults.size > 0

  return (
    <div className="min-h-screen bg-radar-bg text-radar-bright">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <DTESettings dte={dte} onDteChange={setDte} />
        <TickerInput onScan={handleScanTickers} />
        <SafeTierChips onScanTicker={handleScanTicker} results={effectiveResults} />
        <CustomTickerList
          tickers={customTickers}
          onAdd={addCustomTicker}
          onRemove={removeCustomTicker}
          onScanTicker={handleScanTicker}
          results={effectiveResults}
        />

        {/* Scan All */}
        <button
          onClick={handleScanAll}
          disabled={scanningAll}
          className={`
            w-full py-3 px-6 rounded-xl border
            font-chakra font-bold text-sm tracking-[0.15em]
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

        {hasResults && <SummaryBanner results={effectiveResults} />}

        {hasResults && (
          <section aria-label="Tarama sonuçları">
            {/* Controls row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-radar-muted/50">
                  {effectiveResults.size} sembol · DTE {dte}G
                </span>
                {lastScanAt && (
                  <span className="text-xs text-radar-muted/35 border-l border-white/10 pl-2">
                    Son tarama: {timeAgo(lastScanAt)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <SortMenu sortMode={sortMode} onSortChange={setSortMode} />
                {/* View toggle */}
                <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('card')}
                    title="Kart görünümü"
                    className={`px-3 py-1.5 text-sm transition-colors duration-150
                      ${viewMode === 'card'
                        ? 'bg-radar-cyan/15 text-radar-cyan'
                        : 'text-radar-muted/50 hover:text-radar-muted'
                      }`}
                  >
                    ⊞
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="Liste görünümü"
                    className={`px-3 py-1.5 text-sm transition-colors duration-150
                      ${viewMode === 'list'
                        ? 'bg-radar-cyan/15 text-radar-cyan'
                        : 'text-radar-muted/50 hover:text-radar-muted'
                      }`}
                  >
                    ≡
                  </button>
                </div>
              </div>
            </div>

            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedEntries.map(([symbol, entry]) => (
                  <ResultCard
                    key={symbol}
                    symbol={symbol}
                    status={entry.status}
                    data={entry.effectiveData}
                    verdict={entry.verdict}
                    dte={dte}
                    manualDate={entry.manualDate}
                    customColor={rowColors.get(symbol) ?? null}
                    onColorChange={(color) => handleColorChange(symbol, color)}
                    onRemove={handleRemove}
                    onManualDateChange={(date) => handleManualDateChange(symbol, date)}
                    checkedItems={checklist[symbol] || {}}
                    onCheckToggle={(itemId) => handleCheckToggle(symbol, itemId)}
                    note={notes[symbol] || ''}
                    onNoteChange={(text) => handleNoteChange(symbol, text)}
                  />
                ))}
              </div>
            ) : (
              <ListView
                sortedEntries={sortedEntries}
                dte={dte}
                rowColors={rowColors}
                onColorChange={handleColorChange}
                onRemove={handleRemove}
                onManualDateChange={handleManualDateChange}
                checklist={checklist}
                onCheckToggle={handleCheckToggle}
                notes={notes}
                onNoteChange={handleNoteChange}
              />
            )}
          </section>
        )}

        {!hasResults && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative w-20 h-20 mb-6 opacity-20">
              <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                <circle cx="32" cy="32" r="28" stroke="#5BD6E6" strokeWidth="1.5" strokeOpacity="0.6" />
                <circle cx="32" cy="32" r="20" stroke="#5BD6E6" strokeWidth="1"   strokeOpacity="0.4" />
                <circle cx="32" cy="32" r="12" stroke="#5BD6E6" strokeWidth="1"   strokeOpacity="0.3" />
                <circle cx="32" cy="32" r="3"  fill="#5BD6E6"   fillOpacity="0.8" />
                <line x1="32" y1="4" x2="32" y2="60" stroke="#5BD6E6" strokeWidth="0.5" strokeOpacity="0.2" />
                <line x1="4"  y1="32" x2="60" y2="32" stroke="#5BD6E6" strokeWidth="0.5" strokeOpacity="0.2" />
                <line x1="32" y1="32" x2="52" y2="12" stroke="#5BD6E6" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.9" />
              </svg>
            </div>
            <p className="font-chakra text-radar-muted/40 text-sm tracking-wider">
              Henüz tarama yapılmadı
            </p>
            <p className="text-xs text-radar-muted/25 mt-2">
              Sembol gir veya Safe Tier chip'ine tıkla · "Tümünü Tara" ile hepsini tara
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 mt-12 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-radar-muted/30">KAZANÇ RADARI · options premium seller tool</p>
          <p className="text-xs text-radar-muted/20">Veriler Finnhub · 12s cache · yatırım tavsiyesi değildir</p>
        </div>
      </footer>
    </div>
  )
}
