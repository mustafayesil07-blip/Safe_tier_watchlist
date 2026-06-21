import React, { useState } from 'react'
import VerdictBadge from './VerdictBadge.jsx'
import ResultCard, { CUSTOM_INLINE } from './ResultCard.jsx'

const COLOR_DOT = { green: '#3DDC97', blue: '#5BD6E6', red: '#FF5C5C' }

function ListRow({ symbol, entry, dte, customColor, onColorChange, onRemove, onManualDateChange, expanded, onToggle }) {
  const verdict     = entry.verdict
  const displayDate = entry.effectiveData?.nextEarningsDate
  const formattedDate = displayDate
    ? new Date(displayDate + 'T00:00:00').toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  const daysColor = verdict?.color === 'red' ? '#FF5C5C' : verdict?.color === 'green' ? '#3DDC97' : '#8B9BB0'

  // Row background
  const rowStyle = customColor
    ? { background: CUSTOM_INLINE[customColor]?.background }
    : {}

  return (
    <div>
      {/* Compact row */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => e.key === 'Enter' && onToggle()}
        className="
          flex items-center gap-3 px-4 py-3 cursor-pointer
          hover:bg-white/3 transition-colors duration-150
          border-b border-white/6 last:border-b-0 select-none
        "
        style={rowStyle}
      >
        {/* Custom color strip */}
        {customColor && (
          <span
            className="w-1 h-7 rounded-full flex-shrink-0"
            style={{ background: COLOR_DOT[customColor] }}
          />
        )}

        {/* Symbol */}
        <span className="font-chakra font-bold text-base text-radar-amber w-14 flex-shrink-0">
          {symbol}
        </span>

        {/* Verdict */}
        <div className="w-24 flex-shrink-0">
          {entry.status === 'loading' ? (
            <span className="text-xs text-radar-amber/50 animate-pulse">yükleniyor</span>
          ) : verdict ? (
            <VerdictBadge verdict={verdict.verdict} label={verdict.label} color={verdict.color} />
          ) : null}
        </div>

        {/* Date + manual badge */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-sm text-radar-bright/70 truncate">{formattedDate}</span>
          {entry.manualDate && (
            <span className="text-[10px] bg-radar-amber/15 text-radar-amber border border-radar-amber/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
              ✏
            </span>
          )}
        </div>

        {/* Days */}
        {verdict?.daysUntil != null && verdict.daysUntil >= 0 && (
          <span className="font-mono text-sm font-semibold flex-shrink-0" style={{ color: daysColor }}>
            +{verdict.daysUntil}g
          </span>
        )}

        {/* Expand arrow */}
        <span className="text-radar-muted/35 text-xs flex-shrink-0 w-4 text-right">
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded: full ResultCard */}
      {expanded && (
        <div className="px-3 py-3 bg-black/10 border-b border-white/6">
          <ResultCard
            symbol={symbol}
            status={entry.status}
            data={entry.effectiveData}
            verdict={verdict}
            dte={dte}
            manualDate={entry.manualDate}
            customColor={customColor}
            onColorChange={(color) => onColorChange(symbol, color)}
            onRemove={onRemove}
            onManualDateChange={(date) => onManualDateChange(symbol, date)}
          />
        </div>
      )}
    </div>
  )
}

export default function ListView({ sortedEntries, dte, rowColors, onColorChange, onRemove, onManualDateChange }) {
  const [expanded, setExpanded] = useState(new Set())

  const toggle = (symbol) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(symbol)) next.delete(symbol)
      else next.add(symbol)
      return next
    })
  }

  return (
    <div className="bg-radar-panel border border-white/8 rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-radar-panel2 border-b border-white/8">
        <span className="text-xs text-radar-muted/50 w-14 flex-shrink-0">Sembol</span>
        <span className="text-xs text-radar-muted/50 w-24 flex-shrink-0">Karar</span>
        <span className="text-xs text-radar-muted/50 flex-1">Tarih</span>
        <span className="text-xs text-radar-muted/50">Gün</span>
        <span className="w-4" />
      </div>

      {sortedEntries.map(([symbol, entry]) => (
        <ListRow
          key={symbol}
          symbol={symbol}
          entry={entry}
          dte={dte}
          customColor={rowColors.get(symbol) ?? null}
          onColorChange={onColorChange}
          onRemove={onRemove}
          onManualDateChange={onManualDateChange}
          expanded={expanded.has(symbol)}
          onToggle={() => toggle(symbol)}
        />
      ))}
    </div>
  )
}
