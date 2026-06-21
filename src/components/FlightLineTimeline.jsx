import React from 'react'

export default function FlightLineTimeline({ daysUntil, dte }) {
  // View range extends to dte * 1.45
  const viewMax = dte * 1.45
  const dtePercent = (dte / viewMax) * 100 // where the DTE line sits

  // Null state
  if (daysUntil === null || daysUntil === undefined) {
    return (
      <div className="mt-3 px-1">
        <div className="relative h-10 flex items-center">
          <div className="w-full h-px bg-radar-muted/20" />
          <span className="absolute left-1/2 -translate-x-1/2 text-radar-muted font-mono text-xs">
            — tarih bilinmiyor —
          </span>
        </div>
      </div>
    )
  }

  // Cap the visual position of the airplane at ~92% so it doesn't overflow
  const rawPercent = (daysUntil / viewMax) * 100
  const isVeryFar = rawPercent > 92
  const planePercent = isVeryFar ? 90 : Math.max(0, Math.min(92, rawPercent))

  const isInWindow = daysUntil <= dte && daysUntil >= 0
  const isPast = daysUntil < 0

  return (
    <div className="mt-3 select-none" aria-label={`Kazanç ${daysUntil} gün sonra, DTE penceresi ${dte} gün`}>
      {/* Labels row */}
      <div className="relative flex justify-between items-end mb-1 text-[10px] font-mono text-radar-muted">
        <span className="text-radar-cyan font-semibold">BUGÜN</span>
        {/* DTE label — positioned at dtePercent */}
        <span
          className="absolute text-radar-amber font-semibold"
          style={{ left: `${dtePercent}%`, transform: 'translateX(-50%)' }}
        >
          VADE {dte}G
        </span>
        <span className="text-radar-muted/60">+{Math.round(viewMax)}G</span>
      </div>

      {/* Track */}
      <div className="relative h-8">
        {/* Background track */}
        <div className="absolute inset-y-0 w-full rounded overflow-hidden">
          {/* Danger zone [0, dte] */}
          <div
            className="absolute inset-y-0 left-0 bg-radar-amber/8 border-r border-radar-amber/20"
            style={{ width: `${dtePercent}%` }}
          />
          {/* Safe zone [dte, max] */}
          <div
            className="absolute inset-y-0 bg-radar-green/5"
            style={{ left: `${dtePercent}%`, right: 0 }}
          />
        </div>

        {/* Center track line */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-radar-muted/20" />

        {/* TODAY anchor — cyan dot */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <div className="w-2.5 h-2.5 rounded-full bg-radar-cyan border border-radar-cyan/50 shadow-[0_0_6px_rgba(91,214,230,0.6)]" />
        </div>

        {/* DTE vertical dashed line */}
        <div
          className="absolute top-0 bottom-0 border-l border-dashed border-radar-amber/50"
          style={{ left: `${dtePercent}%` }}
        />

        {/* Airplane emoji at earnings position */}
        {!isPast && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500"
            style={{ left: `${planePercent}%` }}
          >
            <div
              className={`
                text-lg leading-none select-none
                ${isInWindow ? 'animate-pulse-slow' : ''}
              `}
              style={{
                filter: isInWindow
                  ? 'drop-shadow(0 0 6px rgba(255, 92, 92, 0.8))'
                  : 'drop-shadow(0 0 6px rgba(61, 220, 151, 0.6))',
                transform: 'rotate(45deg)',
                display: 'inline-block',
              }}
              title={`Earnings ${daysUntil} gün sonra`}
            >
              ✈
            </div>

            {/* "uzakta →" label if very far */}
            {isVeryFar && (
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-radar-green/70 whitespace-nowrap">
                uzakta →
              </span>
            )}
          </div>
        )}

        {/* Past earnings: show at position 0 greyed out */}
        {isPast && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 ml-3">
            <span
              className="text-base leading-none text-radar-muted/40"
              style={{ transform: 'rotate(45deg)', display: 'inline-block' }}
            >
              ✈
            </span>
          </div>
        )}

        {/* Days count bubble near airplane */}
        {!isPast && (
          <div
            className="absolute -top-0.5 -translate-x-1/2 transition-all duration-500"
            style={{ left: `${planePercent}%` }}
          >
            {/* offset upward from the track center */}
          </div>
        )}
      </div>

      {/* Bottom legend */}
      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono">
        <span className="flex items-center gap-1">
          <span className="w-6 h-px bg-amber-400/40 border-t border-dashed border-radar-amber/40 inline-block" />
          <span className="text-radar-amber/70">tehlike penceresi</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-6 h-px bg-radar-green/30 inline-block" />
          <span className="text-radar-green/70">temiz bölge</span>
        </span>
        {daysUntil !== null && !isPast && (
          <span className="ml-auto text-radar-muted/60">
            <span className={isInWindow ? 'text-radar-red font-semibold' : 'text-radar-bright/60'}>
              {daysUntil}G
            </span>
            {' '}kaldı
          </span>
        )}
      </div>
    </div>
  )
}
