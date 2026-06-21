import React, { useState } from 'react'

function parseSymbols(raw) {
  return raw
    .toUpperCase()
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => /^[A-Z]{1,5}$/.test(s))
}

export default function TickerInput({ onScan }) {
  const [value, setValue] = useState('')

  const handleChange = (e) => {
    setValue(e.target.value.toUpperCase())
  }

  const handleSubmit = () => {
    const symbols = parseSymbols(value)
    if (symbols.length > 0) {
      onScan(symbols)
      setValue('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="bg-radar-panel border border-radar-cyan/10 rounded-lg p-4">
      <label
        htmlFor="ticker-input"
        className="flex items-center gap-2 mb-3"
      >
        <span className="w-1.5 h-4 bg-radar-cyan rounded-full flex-shrink-0" />
        <span className="font-chakra font-semibold text-sm text-radar-bright tracking-wide">
          Sembol Tara
        </span>
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          {/* Terminal prompt decoration */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-radar-cyan/50 text-sm pointer-events-none select-none">
            $
          </span>
          <input
            id="ticker-input"
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="AAPL, MSFT, TSLA..."
            autoCapitalize="characters"
            spellCheck={false}
            className="
              w-full pl-8 pr-4 py-2.5 rounded border
              bg-radar-panel2 border-radar-muted/20
              text-radar-bright font-mono text-sm tracking-wider
              focus:outline-none focus:border-radar-cyan/40
              focus:shadow-[0_0_12px_rgba(91,214,230,0.08)]
              placeholder:text-radar-muted/30 placeholder:tracking-normal
              transition-all duration-150
            "
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="
            px-5 py-2.5 rounded border
            bg-radar-cyan/10 border-radar-cyan/30
            text-radar-cyan font-chakra font-semibold text-sm tracking-wider
            hover:bg-radar-cyan/20 hover:border-radar-cyan/50
            hover:shadow-[0_0_12px_rgba(91,214,230,0.2)]
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-all duration-150 whitespace-nowrap
          "
        >
          Tara ›
        </button>
      </div>

      <p className="font-mono text-[10px] text-radar-muted/40 mt-2 tracking-wide">
        Virgülle veya boşlukla ayırarak birden fazla sembol gir · Enter ile tara
      </p>
    </div>
  )
}
