import React from 'react'

function RadarGraphic() {
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      {/* Outer ring */}
      <svg
        viewBox="0 0 48 48"
        className="absolute inset-0 w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="24" r="22" stroke="#5BD6E6" strokeWidth="1" strokeOpacity="0.4" />
        <circle cx="24" cy="24" r="15" stroke="#5BD6E6" strokeWidth="0.75" strokeOpacity="0.3" />
        <circle cx="24" cy="24" r="8" stroke="#5BD6E6" strokeWidth="0.75" strokeOpacity="0.25" />
        <circle cx="24" cy="24" r="2.5" fill="#5BD6E6" fillOpacity="0.8" />
        {/* crosshairs */}
        <line x1="24" y1="2" x2="24" y2="46" stroke="#5BD6E6" strokeWidth="0.5" strokeOpacity="0.2" />
        <line x1="2" y1="24" x2="46" y2="24" stroke="#5BD6E6" strokeWidth="0.5" strokeOpacity="0.2" />
        {/* blip */}
        <circle cx="35" cy="13" r="2.5" fill="#3DDC97" fillOpacity="0.9" />
        <circle cx="35" cy="13" r="5" fill="#3DDC97" fillOpacity="0.15" />
      </svg>

      {/* Sweep arm — rotates */}
      <svg
        viewBox="0 0 48 48"
        className="absolute inset-0 w-full h-full radar-sweep"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Sweep line */}
        <line
          x1="24"
          y1="24"
          x2="24"
          y2="2"
          stroke="#5BD6E6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        {/* Sweep glow arc */}
        <path
          d="M24 24 L24 2 A22 22 0 0 1 46 24 Z"
          fill="#5BD6E6"
          fillOpacity="0.05"
        />
      </svg>
    </div>
  )
}

export default function Header() {
  const today = new Date()
  const dateStr = today.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className="relative border-b border-radar-cyan/14 bg-radar-panel/80 backdrop-blur-sm">
      {/* Subtle scanline gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
          backgroundSize: '100% 3px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: logo + title */}
          <div className="flex items-center gap-3">
            <RadarGraphic />

            <div>
              <h1 className="font-chakra font-bold text-xl sm:text-2xl text-radar-bright tracking-[0.15em] uppercase leading-tight">
                KAZANÇ RADARI
              </h1>
              <p className="font-mono text-[10px] text-radar-muted tracking-widest mt-0.5">
                earnings{' '}
                <span className="text-radar-muted/50">·</span>{' '}
                radar{' '}
                <span className="text-radar-muted/50">·</span>{' '}
                <span className="text-radar-cyan animate-pulse-slow">[CANLI]</span>
              </p>
            </div>
          </div>

          {/* Right: date */}
          <div className="text-right">
            <p className="font-mono text-xs text-radar-muted/70 tracking-wider hidden sm:block">
              {dateStr}
            </p>
            <p className="font-mono text-[10px] text-radar-muted/40 tracking-widest mt-0.5 hidden sm:block">
              UTC{today.toTimeString().slice(9, 15)}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
