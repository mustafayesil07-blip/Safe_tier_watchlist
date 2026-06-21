import React, { useState, useRef, useEffect } from 'react'
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
  blue:  'border-l-radar-cyan',
  red:   'border-l-radar-red',
  amber: 'border-l-radar-amber',
  muted: 'border-l-radar-muted/40',
}

const hoverGlow = {
  green: 'hover:shadow-[0_0_20px_rgba(61,220,151,0.07)]',
  blue:  'hover:shadow-[0_0_20px_rgba(91,214,230,0.1)]',
  red:   'hover:shadow-[0_0_20px_rgba(255,92,92,0.1)]',
  amber: 'hover:shadow-[0_0_20px_rgba(255,183,62,0.07)]',
  muted: 'hover:shadow-[0_0_20px_rgba(125,139,152,0.05)]',
}

// Inline color-picker: green / blue / red / clear
const COLOR_OPTIONS = [
  { id: 'green', hex: '#3DDC97', label: 'Yeşil' },
  { id: 'blue',  hex: '#5BD6E6', label: 'Mavi'  },
  { id: 'red',   hex: '#FF5C5C', label: 'Kırmızı' },
]

function ColorPicker({ customColor, onColorChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const activeHex = COLOR_OPTIONS.find((o) => o.id === customColor)?.hex

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Satır rengini özelleştir"
        aria-label="Renk seç"
        className="
          w-6 h-6 rounded flex items-center justify-center
          transition-all duration-150
          focus:outline-none focus:ring-1 focus:ring-radar-cyan/30
          hover:bg-radar-muted/10
        "
        style={activeHex ? { color: activeHex } : {}}
      >
        {/* Paint bucket icon via unicode */}
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path
            d="M11.5 1L14.5 4L6 12.5H3V9.5L11.5 1Z"
            stroke={activeHex || 'rgba(125,139,152,0.45)'}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle
            cx="13"
            cy="14"
            r="2"
            fill={activeHex || 'rgba(125,139,152,0.3)'}
          />
        </svg>
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-8 z-20
            flex items-center gap-1.5 p-1.5
            bg-radar-panel2 border border-radar-cyan/20 rounded-lg
            shadow-[0_4px_16px_rgba(0,0,0,0.4)]
          "
        >
          {COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              title={opt.label}
              onClick={() => {
                onColorChange(customColor === opt.id ? null : opt.id)
                setOpen(false)
              }}
              className="w-5 h-5 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/20"
              style={{
                background: opt.hex,
                boxShadow: customColor === opt.id ? `0 0 0 2px #0E141B, 0 0 0 3.5px ${opt.hex}` : 'none',
              }}
            />
          ))}
          {/* Clear button */}
          {customColor && (
            <button
              title="Rengi kaldır"
              onClick={() => { onColorChange(null); setOpen(false) }}
              className="
                w-5 h-5 rounded-full border border-radar-muted/30
                flex items-center justify-center
                text-radar-muted/50 hover:text-radar-muted text-xs
                focus:outline-none
              "
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function ResultCard({ symbol, status, data, verdict, dte, customColor, onColorChange, onRemove }) {
  // customColor overrides verdict color for the left border
  const effectiveColor = customColor || verdict?.color || 'muted'
  const borderClass = leftBorderColor[effectiveColor] || leftBorderColor.muted
  const glowClass   = hoverGlow[effectiveColor]       || hoverGlow.muted

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
      {/* Top-right action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        <ColorPicker customColor={customColor} onColorChange={onColorChange} />
        <button
          onClick={() => onRemove(symbol)}
          aria-label={`${symbol} kartını kaldır`}
          className="
            w-6 h-6 rounded flex items-center justify-center
            text-radar-muted/30 hover:text-radar-muted/80
            hover:bg-radar-muted/10
            transition-all duration-150
            font-mono text-sm
          "
        >
          ×
        </button>
      </div>

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
