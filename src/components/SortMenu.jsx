import React from 'react'

const SORT_OPTIONS = [
  { id: 'verdict',   label: 'Karar',          title: 'KAÇIN önce, GÜVENLİ sonra' },
  { id: 'days-asc',  label: 'Yakından uzağa',  title: 'En yakın earnings tarihi önce' },
  { id: 'days-desc', label: 'Uzaktan yakına',  title: 'En uzak earnings tarihi önce' },
  { id: 'colors',    label: 'Renk sırası',     title: 'Yeşil → Mavi → Kırmızı (manuel renklere göre)' },
  { id: 'alpha',     label: 'A → Z',           title: 'Sembol adına göre alfabetik' },
  { id: 'added',     label: 'Ekleme sırası',   title: 'Tarandığı sıraya göre' },
]

export default function SortMenu({ sortMode, onSortChange }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-radar-muted/50 flex-shrink-0">Sırala:</span>
      <div className="flex items-center gap-1 flex-wrap">
        {SORT_OPTIONS.map((opt) => {
          const active = sortMode === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => onSortChange(opt.id)}
              title={opt.title}
              className={`
                px-3 py-1 rounded-lg border text-sm transition-all duration-150
                focus:outline-none focus:ring-1 focus:ring-radar-cyan/30
                ${active
                  ? 'bg-radar-cyan/12 border-radar-cyan/45 text-radar-cyan'
                  : 'border-white/10 text-radar-muted/60 hover:border-radar-cyan/25 hover:text-radar-muted'
                }
              `}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
