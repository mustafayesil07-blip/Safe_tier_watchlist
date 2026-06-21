import React from 'react'
import VerdictBadge from './VerdictBadge.jsx'
import FlightLineTimeline from './FlightLineTimeline.jsx'

function LoadingSpinner() {
  return (
    <div className="flex items-center gap-2 py-3">
      <div className="relative w-5 h-5 flex-shrink-0">
        <div className="absolute inset-0 rounded-full border border-radar-amber/20" />
        <div className="absolute inset-0 rounded-full border border-t-radar-amber border-transparent animate-spin" />
      </div>
      <span className="text-sm text-radar-amber/70 animate-pulse-slow">veri çekiliyor...</span>
    </div>
  )
}

function HourBadge({ hour }) {
  if (!hour) return null
  const labels = {
    bmo: { text: 'Piyasa Öncesi', color: 'text-radar-cyan bg-radar-cyan/10 border-radar-cyan/25' },
    amc: { text: 'Piyasa Sonrası', color: 'text-radar-green bg-radar-green/10 border-radar-green/25' },
    dmh: { text: 'Piyasa Saatlerinde', color: 'text-radar-amber bg-radar-amber/10 border-radar-amber/25' },
  }
  const style = labels[hour.toLowerCase()] || {
    text: hour.toUpperCase(),
    color: 'text-radar-muted bg-radar-muted/10 border-radar-muted/20',
  }
  return (
    <span className={`text-xs px-2 py-0.5 border rounded-full font-medium ${style.color}`}>
      {style.text}
    </span>
  )
}

// Card styles by verdict color (full background tint)
const verdictCardStyle = {
  green: {
    bg: 'bg-radar-green/8 border border-radar-green/25',
    glow: 'hover:shadow-[0_0_28px_rgba(61,220,151,0.14)]',
  },
  red: {
    bg: 'bg-radar-red/10 border border-radar-red/35',
    glow: 'hover:shadow-[0_0_28px_rgba(255,92,92,0.18)]',
  },
  amber: {
    bg: 'bg-radar-amber/8 border border-radar-amber/25',
    glow: 'hover:shadow-[0_0_28px_rgba(255,183,62,0.12)]',
  },
  muted: {
    bg: 'bg-radar-panel border border-radar-cyan/10',
    glow: 'hover:shadow-[0_0_16px_rgba(91,214,230,0.06)]',
  },
}

// Custom color inline styles — bypass Tailwind class generation for consistent behavior
const CUSTOM_STYLE = {
  green: {
    background: 'rgba(61, 220, 151, 0.16)',
    border:     '2px solid rgba(61, 220, 151, 0.55)',
    boxShadow:  '0 0 36px rgba(61, 220, 151, 0.18)',
  },
  blue: {
    background: 'rgba(91, 214, 230, 0.16)',
    border:     '2px solid rgba(91, 214, 230, 0.55)',
    boxShadow:  '0 0 36px rgba(91, 214, 230, 0.18)',
  },
  red: {
    background: 'rgba(255, 92, 92, 0.16)',
    border:     '2px solid rgba(255, 92, 92, 0.55)',
    boxShadow:  '0 0 36px rgba(255, 92, 92, 0.18)',
  },
}

const COLOR_OPTIONS = [
  { id: 'green', hex: '#3DDC97', label: 'Yeşil' },
  { id: 'blue',  hex: '#5BD6E6', label: 'Mavi'  },
  { id: 'red',   hex: '#FF5C5C', label: 'Kırmızı' },
]

export default function ResultCard({ symbol, status, data, verdict, dte, customColor, onColorChange, onRemove }) {
  const verdictColor  = verdict?.color || 'muted'
  const baseStyle     = verdictCardStyle[verdictColor] || verdictCardStyle.muted
  const inlineStyle   = customColor ? CUSTOM_STYLE[customColor] : undefined

  const isEstimate   = data?.isEstimate
  const earningsDate = data?.nextEarningsDate
  const formattedDate = earningsDate
    ? new Date(earningsDate + 'T00:00:00').toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <article
      style={inlineStyle}
      className={`
        relative rounded-xl p-5 transition-all duration-200 group
        ${customColor ? '' : `${baseStyle.bg} ${baseStyle.glow}`}
      `}
    >
      {/* Remove button */}
      <button
        onClick={() => onRemove(symbol)}
        aria-label={`${symbol} kartını kaldır`}
        className="
          absolute top-3 right-3 w-7 h-7 rounded-full
          flex items-center justify-center text-base
          text-radar-muted/30 hover:text-radar-bright hover:bg-white/10
          transition-all duration-150
        "
      >
        ×
      </button>

      {/* Symbol + source */}
      <div className="mb-4">
        <h2 className="font-chakra font-bold text-3xl text-radar-amber tracking-wide leading-none">
          {symbol}
        </h2>
        {status === 'done' && data?.source && (
          <span className="text-xs text-radar-muted/50 mt-0.5 block">
            via {data.source}
          </span>
        )}
      </div>

      {/* Verdict badge */}
      {status === 'loading' ? (
        <LoadingSpinner />
      ) : verdict ? (
        <>
          <div className="mb-3">
            <VerdictBadge verdict={verdict.verdict} label={verdict.label} color={verdict.color} />
          </div>

          {/* Reason */}
          <p className="text-sm text-radar-bright/70 mb-4 leading-relaxed">
            {verdict.reason}
          </p>

          {/* Earnings details */}
          {earningsDate && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-radar-muted/60 uppercase tracking-wider">Tarih</span>
                <span className="font-mono text-sm text-radar-bright font-semibold">{formattedDate}</span>
              </div>
              {verdict.daysUntil !== null && verdict.daysUntil >= 0 && (
                <span
                  className={`
                    font-mono text-sm font-bold px-2.5 py-1 rounded-lg border
                    ${verdict.color === 'red'
                      ? 'text-radar-red border-radar-red/40 bg-radar-red/10'
                      : 'text-radar-green border-radar-green/40 bg-radar-green/10'
                    }
                  `}
                >
                  +{verdict.daysUntil} gün
                </span>
              )}
              <HourBadge hour={data?.hour} />
            </div>
          )}

          {/* Estimate warning */}
          {isEstimate && (
            <div className="flex items-start gap-2 bg-radar-amber/8 border border-radar-amber/20 rounded-lg p-3 mb-4">
              <span className="text-radar-amber flex-shrink-0">⚠</span>
              <p className="text-xs text-radar-amber/90 leading-relaxed">
                Tahmini tarih — kritik işlemden önce doğrula
              </p>
            </div>
          )}

          {/* Flight Line Timeline */}
          <div className="bg-black/20 rounded-xl p-3 border border-white/5 mb-4">
            <FlightLineTimeline daysUntil={verdict.daysUntil} dte={dte} />
          </div>
        </>
      ) : null}

      {/* Error state */}
      {status === 'error' && (
        <div className="flex items-start gap-2 py-2 mb-4">
          <span className="text-radar-muted/50 flex-shrink-0">⚠</span>
          <div>
            <p className="text-sm text-radar-muted/80">Veri alınamadı</p>
            {data?.error && <p className="text-xs text-radar-muted/50 mt-0.5">{data.error}</p>}
          </div>
        </div>
      )}

      {/* Color strip — always visible, large tap targets */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/8 flex-wrap">
        <span className="text-xs text-radar-muted/50 flex-shrink-0">Renk:</span>
        {COLOR_OPTIONS.map((opt) => {
          const active = customColor === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => onColorChange(active ? null : opt.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                border transition-all duration-150 min-h-[36px]
                ${active ? 'text-white scale-105' : 'text-radar-muted/60 hover:text-white/80'}
              `}
              style={
                active
                  ? { background: opt.hex + '30', borderColor: opt.hex + 'AA' }
                  : { borderColor: 'rgba(255,255,255,0.1)' }
              }
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: opt.hex }}
              />
              {opt.label}
            </button>
          )
        })}
        {customColor && (
          <button
            onClick={() => onColorChange(null)}
            className="ml-auto text-xs text-radar-muted/50 hover:text-radar-muted/90 transition-colors px-2"
          >
            × Temizle
          </button>
        )}
      </div>
    </article>
  )
}
