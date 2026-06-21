import React from 'react'

const colorMap = {
  green: {
    wrapper: 'bg-radar-green/10 text-radar-green border-radar-green/30',
    pulse: false,
  },
  red: {
    wrapper: 'bg-radar-red/10 text-radar-red border-radar-red/30',
    pulse: true,
  },
  amber: {
    wrapper: 'bg-radar-amber/10 text-radar-amber border-radar-amber/30',
    pulse: false,
  },
  muted: {
    wrapper: 'bg-radar-muted/10 text-radar-muted border-radar-muted/30',
    pulse: false,
  },
}

export default function VerdictBadge({ verdict, label, color }) {
  const style = colorMap[color] || colorMap.muted

  return (
    <span
      className={`
        relative inline-flex items-center gap-1.5
        px-3 py-1
        border rounded
        font-chakra font-semibold text-sm tracking-widest uppercase
        ${style.wrapper}
      `}
    >
      {/* Pulse ring for KACIN */}
      {style.pulse && (
        <span className="absolute inset-0 rounded border border-radar-red/50 animate-pulse-ring" />
      )}

      {/* Status dot */}
      <span
        className={`
          w-1.5 h-1.5 rounded-full flex-shrink-0
          ${color === 'green' ? 'bg-radar-green' : ''}
          ${color === 'red' ? 'bg-radar-red animate-pulse' : ''}
          ${color === 'amber' ? 'bg-radar-amber' : ''}
          ${color === 'muted' ? 'bg-radar-muted' : ''}
        `}
      />

      {label || verdict}
    </span>
  )
}
