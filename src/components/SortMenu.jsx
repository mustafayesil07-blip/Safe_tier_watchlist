import React from 'react'

const SORT_OPTIONS = [
  { id: 'verdict', label: 'Karar', icon: '⚑', title: 'KAÇIN önce, AÇIK sonra' },
  { id: 'days',    label: 'Yakınlık', icon: '◷', title: 'Earnings tarihine kalan gün (azdan çoğa)' },
  { id: 'alpha',   label: 'Sembol', icon: '↑A', title: 'Alfabetik A→Z' },
  { id: 'added',   label: 'Ekleme', icon: '⊕', title: 'Eklenme sırasına göre' },
]

export default function SortMenu({ sortMode, onSortChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-mono text-[10px] text-radar-muted/50 tracking-widest uppercase flex-shrink-0">
        Sırala:
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {SORT_OPTIONS.map((opt) => {
          const active = sortMode === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => onSortChange(opt.id)}
              title={opt.title}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded border
                font-mono text-xs transition-all duration-150
                focus:outline-none focus:ring-1 focus:ring-radar-cyan/30
                ${
                  active
                    ? 'bg-radar-cyan/10 border-radar-cyan/50 text-radar-cyan'
                    : 'bg-transparent border-radar-muted/20 text-radar-muted/60 hover:border-radar-cyan/30 hover:text-radar-muted'
                }
              `}
            >
              <span className="text-[10px]">{opt.icon}</span>
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
