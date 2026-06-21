import React from 'react'

export default function SummaryBanner({ results }) {
  if (!results || results.size === 0) return null

  let acik = 0
  let kacin = 0
  let loading = 0
  let other = 0

  for (const [, entry] of results) {
    if (entry.status === 'loading') {
      loading++
    } else if (entry.verdict) {
      const v = entry.verdict.verdict
      if (v === 'ACIK') acik++
      else if (v === 'KACIN') kacin++
      else other++
    }
  }

  const total = acik + kacin + loading + other
  const done = total - loading
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  const hasKacin = kacin > 0
  const allDone = loading === 0

  return (
    <div
      className={`
        border rounded-lg p-4
        ${hasKacin
          ? 'bg-radar-red/5 border-radar-red/20'
          : 'bg-radar-panel border-radar-cyan/10'
        }
        transition-all duration-300
      `}
    >
      <div className="flex flex-wrap items-center gap-4 justify-between">
        {/* Counts */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-radar-green" />
            <span className="font-mono text-sm">
              <span className="text-radar-green font-semibold">{acik}</span>
              <span className="text-radar-muted/70 ml-1">açık</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-radar-red ${kacin > 0 ? 'animate-pulse' : ''}`} />
            <span className="font-mono text-sm">
              <span className="text-radar-red font-semibold">{kacin}</span>
              <span className="text-radar-muted/70 ml-1">kaçın</span>
            </span>
          </div>

          {other > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-radar-amber" />
              <span className="font-mono text-sm">
                <span className="text-radar-amber font-semibold">{other}</span>
                <span className="text-radar-muted/70 ml-1">diğer</span>
              </span>
            </div>
          )}

          {loading > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-radar-muted/50 border-t-transparent animate-spin" />
              <span className="font-mono text-sm">
                <span className="text-radar-muted font-semibold">{loading}</span>
                <span className="text-radar-muted/70 ml-1">taranıyor</span>
              </span>
            </div>
          )}
        </div>

        {/* Progress / warning */}
        <div className="flex items-center gap-3">
          {loading > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-1 bg-radar-muted/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-radar-cyan/60 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-radar-muted/60">{progress}%</span>
            </div>
          )}

          {allDone && hasKacin && (
            <div className="flex items-center gap-2 bg-radar-red/10 border border-radar-red/30 rounded px-3 py-1.5">
              <span className="text-radar-red animate-pulse-slow">⚠</span>
              <span className="font-chakra text-xs text-radar-red font-semibold tracking-wide">
                {kacin} pozisyon riskli!
              </span>
            </div>
          )}

          {allDone && !hasKacin && acik > 0 && (
            <div className="flex items-center gap-2 bg-radar-green/10 border border-radar-green/30 rounded px-3 py-1.5">
              <span className="text-radar-green">✓</span>
              <span className="font-chakra text-xs text-radar-green font-semibold tracking-wide">
                Tüm pozisyonlar temiz
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar (full width) when loading */}
      {loading > 0 && (
        <div className="mt-3 w-full h-px bg-radar-muted/10 rounded overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-radar-cyan/40 to-radar-cyan/20 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
