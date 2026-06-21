import { isETF } from './etf.js'

export function getVerdict(symbol, earningsData, dte) {
  if (isETF(symbol)) {
    return {
      verdict: 'ACIK',
      label: 'AÇIK',
      reason: 'ETF — earnings yok, her zaman temiz',
      color: 'green',
      daysUntil: null,
    }
  }

  if (!earningsData || earningsData.error) {
    return {
      verdict: 'HATA',
      label: 'HATA',
      reason: earningsData?.error || 'Veri alınamadı',
      color: 'muted',
      daysUntil: null,
    }
  }

  const { nextEarningsDate } = earningsData

  if (!nextEarningsDate) {
    return {
      verdict: 'BILINMIYOR',
      label: 'BİLİNMİYOR',
      reason: 'Earnings tarihi bulunamadı — manuel doğrula',
      color: 'amber',
      daysUntil: null,
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const earningsDay = new Date(nextEarningsDate + 'T00:00:00')
  const daysUntil = Math.round((earningsDay - today) / (1000 * 60 * 60 * 24))

  if (daysUntil < 0) {
    return {
      verdict: 'GECMIS',
      label: 'GEÇMİŞ',
      reason: 'Earnings geçti — yeni tarih bekleniyor',
      color: 'muted',
      daysUntil,
    }
  }

  if (daysUntil <= dte) {
    return {
      verdict: 'KACIN',
      label: 'KAÇIN',
      reason: `Earnings ${daysUntil} gün sonra — DTE pencerende`,
      color: 'red',
      daysUntil,
    }
  }

  return {
    verdict: 'ACIK',
    label: 'AÇIK',
    reason: `Earnings ${daysUntil} gün sonra — pencereden sonra`,
    color: 'green',
    daysUntil,
  }
}
