import React, { useState } from 'react'
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
  const map = {
    bmo: { text: 'Piyasa Öncesi',      cls: 'text-radar-cyan  bg-radar-cyan/10  border-radar-cyan/25'  },
    amc: { text: 'Piyasa Sonrası',     cls: 'text-radar-green bg-radar-green/10 border-radar-green/25' },
    dmh: { text: 'Piyasa Saatlerinde', cls: 'text-radar-amber bg-radar-amber/10 border-radar-amber/25' },
  }
  const s = map[hour.toLowerCase()] || { text: hour.toUpperCase(), cls: 'text-radar-muted bg-radar-muted/10 border-radar-muted/20' }
  return <span className={`text-xs px-2 py-0.5 border rounded-full font-medium ${s.cls}`}>{s.text}</span>
}

// Verdict-based card background (Tailwind classes)
const VERDICT_CARD = {
  green: { bg: 'bg-radar-green/8 border border-radar-green/25',   glow: 'hover:shadow-[0_0_28px_rgba(61,220,151,0.14)]'  },
  red:   { bg: 'bg-radar-red/10  border border-radar-red/35',    glow: 'hover:shadow-[0_0_28px_rgba(255,92,92,0.18)]'   },
  amber: { bg: 'bg-radar-amber/8 border border-radar-amber/25',  glow: 'hover:shadow-[0_0_28px_rgba(255,183,62,0.12)]'  },
  muted: { bg: 'bg-radar-panel   border border-radar-cyan/10',   glow: 'hover:shadow-[0_0_16px_rgba(91,214,230,0.06)]'  },
}

// Custom color override — inline styles (avoids Tailwind JIT opacity issues)
export const CUSTOM_INLINE = {
  green: { background: 'rgba(61,220,151,0.16)',  border: '2px solid rgba(61,220,151,0.55)',  boxShadow: '0 0 36px rgba(61,220,151,0.18)'  },
  blue:  { background: 'rgba(91,214,230,0.16)',  border: '2px solid rgba(91,214,230,0.55)',  boxShadow: '0 0 36px rgba(91,214,230,0.18)'  },
  red:   { background: 'rgba(255,92,92,0.16)',   border: '2px solid rgba(255,92,92,0.55)',   boxShadow: '0 0 36px rgba(255,92,92,0.18)'   },
}

const COLOR_OPTIONS = [
  { id: 'green', hex: '#3DDC97', label: 'Yeşil'    },
  { id: 'blue',  hex: '#5BD6E6', label: 'Mavi'     },
  { id: 'red',   hex: '#FF5C5C', label: 'Kırmızı'  },
]

const CHECKLIST_ITEMS = [
  { id: 'ivr',     label: 'IVR'     },
  { id: 'premium', label: 'Premium' },
  { id: 'sdc',     label: 'SDC'     },
  { id: 'sma',     label: 'SMA'     },
  { id: 'rsi',     label: 'RSI'     },
  { id: 'destek',  label: 'Destek'  },
]

function Checklist({ checkedItems, onCheckToggle }) {
  const doneCount = CHECKLIST_ITEMS.filter((i) => checkedItems[i.id]).length
  const total     = CHECKLIST_ITEMS.length

  return (
    <div className="mt-4 pt-3 border-t border-white/8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-radar-muted/55 uppercase tracking-wider">Kontrol Listesi</span>
        <span className="text-xs font-mono text-radar-muted/40">{doneCount}/{total}</span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => {
          const checked = !!checkedItems[item.id]
          return (
            <button
              key={item.id}
              onClick={() => onCheckToggle(item.id)}
              className="flex items-center gap-3 w-full text-left group/item"
            >
              {/* Checkbox */}
              <span
                className={`
                  w-5 h-5 rounded border flex items-center justify-center
                  flex-shrink-0 transition-all duration-150
                  ${checked
                    ? 'bg-radar-green/20 border-radar-green/60'
                    : 'border-white/20 group-hover/item:border-white/40'
                  }
                `}
              >
                {checked && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="#3DDC97"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              {/* Label */}
              <span
                className={`text-sm transition-colors duration-150 ${
                  checked
                    ? 'text-radar-bright font-medium'
                    : 'text-radar-muted/65 group-hover/item:text-radar-muted/90'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Date editor ──────────────────────────────────────────────────────────────
function DateEditor({ currentDate, manualDate, onSave, onClear }) {
  const [editing, setEditing] = useState(false)
  const [input, setInput]     = useState('')

  const openEdit = () => {
    setInput(manualDate || currentDate || '')
    setEditing(true)
  }
  const save = () => {
    onSave(input || null)
    setEditing(false)
  }
  const cancel = () => setEditing(false)

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <input
          type="date"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="
            bg-radar-panel2 border border-radar-cyan/40 rounded-lg
            px-3 py-1.5 text-sm text-radar-bright
            focus:outline-none focus:border-radar-cyan/70
          "
        />
        <button
          onClick={save}
          className="px-3 py-1.5 text-sm rounded-lg bg-radar-cyan/15 border border-radar-cyan/35 text-radar-cyan hover:bg-radar-cyan/25 transition-colors"
        >
          Kaydet
        </button>
        <button
          onClick={cancel}
          className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-radar-muted/70 hover:text-radar-muted transition-colors"
        >
          İptal
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Display date */}
      {currentDate && (
        <span className="font-mono text-sm text-radar-bright font-semibold">
          {new Date(currentDate + 'T00:00:00').toLocaleDateString('tr-TR', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </span>
      )}

      {/* Manual indicator */}
      {manualDate && (
        <span className="text-xs bg-radar-amber/15 text-radar-amber border border-radar-amber/30 px-2 py-0.5 rounded-full font-medium">
          ✏ Manuel
        </span>
      )}

      {/* Edit button */}
      {!manualDate && (
        <button
          onClick={openEdit}
          title="Tarihi düzenle"
          className="text-xs text-radar-muted/50 hover:text-radar-cyan border border-white/10 hover:border-radar-cyan/30 px-2 py-0.5 rounded-full transition-colors"
        >
          ✏ Düzenle
        </button>
      )}

      {/* If manual set: edit + clear */}
      {manualDate && (
        <>
          <button
            onClick={openEdit}
            className="text-xs text-radar-amber/70 hover:text-radar-amber border border-radar-amber/20 hover:border-radar-amber/40 px-2 py-0.5 rounded-full transition-colors"
          >
            Değiştir
          </button>
          <button
            onClick={onClear}
            className="text-xs text-radar-muted/50 hover:text-radar-red border border-white/10 hover:border-radar-red/30 px-2 py-0.5 rounded-full transition-colors"
          >
            × Kaldır
          </button>
        </>
      )}
    </div>
  )
}

// ── Note area ─────────────────────────────────────────────────────────────────
function NoteArea({ note, noteDate, onNoteChange }) {
  const formattedDate = noteDate
    ? new Date(noteDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="mt-4 pt-3 border-t border-white/8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-radar-muted/55 uppercase tracking-wider">Not</span>
          {formattedDate && (
            <span className="text-[10px] font-mono text-radar-muted/35">{formattedDate}</span>
          )}
        </div>
        {note && (
          <button
            onClick={() => onNoteChange('')}
            className="text-[10px] text-radar-muted/40 hover:text-radar-red/70 transition-colors"
          >
            × Temizle
          </button>
        )}
      </div>
      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Buraya not ekle..."
        rows={3}
        className="
          w-full bg-black/20 border border-white/10 rounded-lg
          px-3 py-2 text-sm text-radar-bright/80 placeholder-radar-muted/30
          focus:outline-none focus:border-radar-cyan/35
          resize-none transition-colors duration-150 leading-relaxed
        "
      />
    </div>
  )
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function ResultCard({
  symbol, status, data, verdict, dte,
  manualDate, onManualDateChange,
  customColor, onColorChange, onRemove,
  checkedItems = {}, onCheckToggle,
  note = '', noteDate = null, onNoteChange,
}) {
  const verdictColor = verdict?.color || 'muted'
  const baseCard     = VERDICT_CARD[verdictColor] || VERDICT_CARD.muted
  const inlineStyle  = customColor ? CUSTOM_INLINE[customColor] : undefined

  const effectiveDate = data?.nextEarningsDate  // already merged in App useMemo
  const isEstimate    = data?.isEstimate

  return (
    <article
      style={inlineStyle}
      className={`
        relative rounded-xl p-5 transition-all duration-200 group
        ${customColor ? '' : `${baseCard.bg} ${baseCard.glow}`}
      `}
    >
      {/* Remove */}
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

      {/* Symbol */}
      <div className="mb-3">
        <h2 className="font-chakra font-bold text-3xl text-radar-amber tracking-wide leading-none">
          {symbol}
        </h2>
        {status === 'done' && data?.source && (
          <span className="text-xs text-radar-muted/50 mt-0.5 block">via {data.source}</span>
        )}
      </div>

      {status === 'loading' && <LoadingSpinner />}

      {status !== 'loading' && verdict && (
        <>
          {/* Verdict */}
          <div className="mb-3">
            <VerdictBadge verdict={verdict.verdict} label={verdict.label} color={verdict.color} />
          </div>

          {/* Reason */}
          <p className="text-sm text-radar-bright/70 mb-4 leading-relaxed">{verdict.reason}</p>

          {/* Date row with editor */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-radar-muted/60 uppercase tracking-wider flex-shrink-0">Tarih</span>
              <HourBadge hour={data?.hour} />
              {verdict.daysUntil != null && verdict.daysUntil >= 0 && (
                <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded-lg border ${
                  verdict.color === 'red'
                    ? 'text-radar-red   border-radar-red/40   bg-radar-red/10'
                    : 'text-radar-green border-radar-green/40 bg-radar-green/10'
                }`}>
                  +{verdict.daysUntil} gün
                </span>
              )}
            </div>

            {/* Date editor — only for non-ETF with data */}
            {data !== null && !isETF(symbol) && onManualDateChange && (
              <DateEditor
                currentDate={effectiveDate}
                manualDate={manualDate || null}
                onSave={(date) => onManualDateChange(date)}
                onClear={() => onManualDateChange(null)}
              />
            )}
            {!effectiveDate && !manualDate && data !== null && (
              <span className="text-sm text-radar-muted/50">Tarih bulunamadı</span>
            )}
          </div>

          {/* Estimate warning */}
          {isEstimate && !manualDate && (
            <div className="flex items-start gap-2 bg-radar-amber/8 border border-radar-amber/20 rounded-lg p-3 mb-4">
              <span className="text-radar-amber flex-shrink-0">⚠</span>
              <p className="text-xs text-radar-amber/90 leading-relaxed">
                Tahmini tarih — kritik işlemden önce doğrula
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-black/20 rounded-xl p-3 border border-white/5 mb-4">
            <FlightLineTimeline daysUntil={verdict.daysUntil} dte={dte} />
          </div>
        </>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 py-2 mb-4">
          <span className="text-radar-muted/50 flex-shrink-0">⚠</span>
          <div>
            <p className="text-sm text-radar-muted/80">Veri alınamadı</p>
            {data?.error && <p className="text-xs text-radar-muted/50 mt-0.5">{data.error}</p>}
          </div>
        </div>
      )}

      {/* Checklist */}
      {onCheckToggle && (
        <Checklist checkedItems={checkedItems} onCheckToggle={onCheckToggle} />
      )}

      {/* Notes */}
      {onNoteChange && (
        <NoteArea note={note} noteDate={noteDate} onNoteChange={onNoteChange} />
      )}

      {/* Color strip */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/8 flex-wrap mt-4">
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
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: opt.hex }} />
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

// Helper for ListView (avoids re-importing isETF)
function isETF(symbol) {
  return [
    'SPY','QQQ','IWM','DIA','GLD',
    'XLK','XLI','XLF','XLE','XLV','XLY','XLU','XLP',
    'XBI','SMH','SOXX','ITA',
  ].includes(symbol)
}
