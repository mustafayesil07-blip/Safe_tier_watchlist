import React from 'react'
import VerdictBadge from './VerdictBadge.jsx'
import FlightLineTimeline from './FlightLineTimeline.jsx'

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="relative w-4 h-4 flex-shrink-0">
        <div className="absolute inset-0 rounded-full border border-radar-amber/20" />
        <div className="absolute inset-0 rounded-full border border-t-radar-amber border-transparent animate-spin" />
      </div>
      <span className="font-mono text-xs text-radar-amber/70 animate-pulse-slow tracking-wider">
        veri çekiliyor...
      </span>
    </div>
  )
}

function HourBadge({ hour }) {
  if (!hour) return null
  const labels = {
    bmo: { text: 'BMO', title: 'Piyasa açılmadan önce', color: 'text-radar-cyan border-radar-cyan/30 bg-radar-cyan/8' },
    amc: { text: 'AMC', title: 'Piyasa kapandıktan sonra', color: 'text-radar-green border-radar-green/30 bg-radar-green/8' },
    dmh: { text: 'DMH', title: 'Piyasa saatlerinde', color: 'text-radar-amber border-radar-amber/30 bg-radar-amber/8' },
  }
  const style = labels[hour.toLowerCase()] || {
    text: hour.toUpperCase(),
    title: '',
    color: 'text-radar-muted border-radar-muted/20 bg-radar-muted/8',
  }
  return (
    <span
      title={style.title}
      className={`font-mono text-[10px] px-1.5 py-0.5 border rounded tracking-widest ${style.color}`}
    >
      {style.text}
    </span>
  )
}

const leftBorderColor = {
  green: 'border-l-radar-green',
  red: 'border-l-radar-red',
  amber: 'border-l-radar-amber',
  muted: 'border-l-radar-muted/40',
}

const hoverGlow = {
  green: 'hover:shadow-[0_0_20px_rgba(61,220,151,0.07)]',
  red: 'hover:shadow-[0_0_20px_rgba(255,92,92,0.1)]',
  amber: 'hover:shadow-[0_0_20px_rgba(255,183,62,0.07)]',
  muted: 'hover:shadow-[0_0_20px_rgba(125,139,152,0.05)]',
}

export default function ResultCard({ symbol, status, data, verdict, dte, onRemove }) {
  const color = verdict?.color || 'muted'
  const borderClass = leftBorderColor[color] || leftBorderColor.muted
  const glowClass = hoverGlow[color] || hoverGlow.muted

  const isEstimate = data?.isEstimate
  const earningsDate = data?.nextEarningsDate
  const formattedDate = earningsDate
    ? new Date(earningsDate + 'T00:00:00').toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <article
      className={`
        relative bg-radar-panel rounded-lg border border-radar-cyan/8
        border-l-2 ${borderClass}
        p-4 transition-all duration-200
        ${glowClass}
        group
      `}
    >
      {/* Remove button */}
      <button
        onClick={() => onRemove(symbol)}
        aria-label={`${symbol} kartını kaldır`}
        className="
          absolute top-3 right-3
          w-6 h-6 rounded flex items-center justify-center
          text-radar-muted/30 hover:text-radar-muted/80
          hover:bg-radar-muted/10
          transition-all duration-150
          font-mono text-sm
        "
      >
        ×
      </button>

      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        {/* Symbol */}
        <div>
          <h2 className="font-chakra font-bold text-2xl text-radar-amber tracking-[0.1em] leading-none">
            {symbol}
          </h2>
          {status === 'done' && data?.source && (
            <span className="font-mono text-[9px] text-radar-muted/40 tracking-widest">
              via {data.source}
            </span>
          )}
        </div>

        {/* Verdict badge */}
        <div className="ml-auto mr-8 flex-shrink-0">
          {status === 'loading' ? (
            <span className="font-mono text-[10px] text-radar-amber/50 border border-radar-amber/20 rounded px-2 py-1 bg-radar-amber/5">
              TARANIYOR
            </span>
          ) : verdict ? (
            <VerdictBadge
              verdict={verdict.verdict}
              label={verdict.label}
              color={verdict.color}
            />
          ) : null}
        </div>
      </div>

      {/* Body */}
      {status === 'loading' && <LoadingSpinner />}

      {status === 'done' && verdict && (
        <>
          {/* Reason text */}
          <p className="font-mono text-xs text-radar-muted/80 mb-3 tracking-wide leading-relaxed">
            {verdict.reason}
          </p>

          {/* Earnings details */}
          {earningsDate && (
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-radar-muted/50 tracking-widest">TARİH</span>
                <span className="font-mono text-xs text-radar-bright font-medium">{formattedDate}</span>
              </div>

              <HourBadge hour={data?.hour} />

              {verdict.daysUntil !== null && verdict.daysUntil >= 0 && (
                <div
                  className={`
                    font-mono text-[10px] px-2 py-0.5 rounded border
                    ${verdict.color === 'red'
                      ? 'text-radar-red border-radar-red/30 bg-radar-red/8'
                      : 'text-radar-green border-radar-green/30 bg-radar-green/8'
                    }
                    tracking-widest
                  `}
                >
                  +{verdict.daysUntil}G
                </div>
              )}
            </div>
          )}

          {/* Estimate warning */}
          {isEstimate && (
            <div className="flex items-start gap-2 bg-radar-amber/8 border border-radar-amber/20 rounded p-2 mb-3">
              <span className="text-radar-amber text-xs flex-shrink-0">⚠</span>
              <p className="font-mono text-[10px] text-radar-amber/80 leading-relaxed">
                Tahmini tarih — kritik işlemden önce doğrula
              </p>
            </div>
          )}

          {/* Flight Line Timeline */}
          <div className="bg-radar-panel2/60 rounded p-3 border border-radar-muted/10">
            <FlightLineTimeline daysUntil={verdict.daysUntil} dte={dte} />
          </div>
        </>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="flex items-start gap-2 text-radar-muted/80">
          <span className="text-radar-muted/50 flex-shrink-0">⚠</span>
          <div>
            <p className="font-mono text-xs text-radar-muted/80">Veri alınamadı</p>
            {data?.error && (
              <p className="font-mono text-[10px] text-radar-muted/40 mt-0.5">{data.error}</p>
            )}
          </div>
        </div>
      )}

      {/* Subtle corner decoration */}
      <div
        className="absolute bottom-2 right-3 font-mono text-[8px] text-radar-muted/15 select-none pointer-events-none"
        aria-hidden="true"
      >
        [{symbol}]
      </div>
    </article>
  )
}
