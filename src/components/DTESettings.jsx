import React, { useState } from 'react'

const QUICK_DTE = [30, 45, 60]

export default function DTESettings({ dte, onDteChange }) {
  const [inputVal, setInputVal] = useState('')

  const handleQuick = (val) => {
    setInputVal('')
    onDteChange(val)
  }

  const handleInput = (e) => {
    const raw = e.target.value
    setInputVal(raw)
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 180) {
      onDteChange(parsed)
    }
  }

  return (
    <div className="bg-radar-panel border border-radar-cyan/10 rounded-lg p-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Label */}
        <div className="flex items-center gap-2 min-w-max">
          <span className="w-1.5 h-4 bg-radar-amber rounded-full flex-shrink-0" />
          <span className="font-chakra font-semibold text-sm text-radar-bright tracking-wide">
            DTE Penceresi
          </span>
        </div>

        {/* Quick buttons */}
        <div className="flex items-center gap-2">
          {QUICK_DTE.map((d) => (
            <button
              key={d}
              onClick={() => handleQuick(d)}
              className={`
                px-3 py-1.5 rounded border font-mono text-sm font-medium
                transition-all duration-150
                ${
                  dte === d && !QUICK_DTE.filter((x) => x !== d).includes(dte)
                    ? 'bg-radar-amber/15 border-radar-amber/50 text-radar-amber shadow-[0_0_8px_rgba(255,183,62,0.2)]'
                    : 'bg-radar-panel2 border-radar-muted/20 text-radar-muted hover:border-radar-amber/30 hover:text-radar-bright'
                }
                ${dte === d ? 'bg-radar-amber/15 border-radar-amber/50 text-radar-amber shadow-[0_0_8px_rgba(255,183,62,0.2)]' : ''}
              `}
            >
              {d}G
            </button>
          ))}
        </div>

        {/* Manual input */}
        <div className="flex items-center gap-2 ml-auto">
          <label
            htmlFor="dte-custom"
            className="font-mono text-xs text-radar-muted tracking-wider whitespace-nowrap"
          >
            Özel:
          </label>
          <input
            id="dte-custom"
            type="number"
            min={1}
            max={180}
            value={inputVal}
            onChange={handleInput}
            placeholder={String(dte)}
            className="
              w-20 px-2 py-1.5 rounded border
              bg-radar-panel2 border-radar-muted/20
              text-radar-bright font-mono text-sm text-center
              focus:outline-none focus:border-radar-cyan/40 focus:shadow-[0_0_8px_rgba(91,214,230,0.1)]
              placeholder:text-radar-muted/40
              transition-all duration-150
            "
          />
          <span className="font-mono text-xs text-radar-muted">gün</span>
        </div>

        {/* Current DTE indicator */}
        <div className="flex items-center gap-1.5 bg-radar-amber/8 border border-radar-amber/20 rounded px-3 py-1.5">
          <span className="font-mono text-xs text-radar-amber/70">aktif:</span>
          <span className="font-chakra font-bold text-radar-amber text-sm">{dte}</span>
          <span className="font-mono text-xs text-radar-amber/70">gün</span>
        </div>
      </div>

      {/* Info text */}
      <p className="font-mono text-[10px] text-radar-muted/50 mt-2.5 tracking-wide">
        Seçtiğin DTE içinde earnings varsa kart{' '}
        <span className="text-radar-red">KAÇIN</span> gösterir. Earnings DTE sonrasındaysa{' '}
        <span className="text-radar-green">AÇIK</span>.
      </p>
    </div>
  )
}
