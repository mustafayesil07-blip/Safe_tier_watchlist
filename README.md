# Kazanç Radarı

Options premium satıcıları için earnings tarama aracı. Seçilen semboller için bir sonraki earnings tarihini çekerek, kullanıcının DTE (days-to-expiry) penceresine düşüp düşmediğini gösterir.

- **AÇIK** (yeşil): Earnings DTE penceresinin dışında — pozisyon açılabilir
- **KAÇIN** (kırmızı): Earnings DTE penceresinin içinde — pozisyon açma
- **BİLİNMİYOR** (amber): Tarih bulunamadı — manuel doğrula

## Kurulum

### 1. Depoyu klonla

```bash
git clone <repo-url>
cd kazanc-radari
```

### 2. Bağımlılıkları yükle

```bash
npm install
```

### 3. Ortam değişkeni

Üretim için Vercel'de `FINNHUB_API_KEY` ortam değişkenini ekle.

Yerel geliştirme için Vercel CLI gereklidir (aşağıya bak).

### 4. Yerel geliştirme

`/api` rotaları Vercel serverless fonksiyonları kullandığından, yerel geliştirmede Vercel CLI önerilir:

```bash
npm install -g vercel
vercel dev
```

`vercel dev` hem Vite dev server'ı hem API fonksiyonlarını çalıştırır.

Sadece UI'ı test etmek istersen (API olmadan):

```bash
npm run dev
```

### 5. Build

```bash
npm run build
npm run preview   # local preview
```

## Vercel'e Deploy

1. [finnhub.io](https://finnhub.io) adresinden ücretsiz API anahtarı al (60 istek/dakika)
2. Vercel'de `FINNHUB_API_KEY` ortam değişkenini ekle
3. Deploy:

```bash
vercel --prod
```

## PWA İkonları

`public/icons/` klasöründe iki ikon dosyası oluşturman gerekiyor:

- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

Koyu arka plan (#070B0F) üzerine radar/kazanç temalı ikon önerilir.

[RealFaviconGenerator](https://realfavicongenerator.net) veya [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) kullanabilirsin.

## Mimari

```
/api/earnings.js    — Vercel serverless: Finnhub'dan earnings tarihi çeker
/src/utils/cache.js — localStorage TTL cache (12 saat)
/src/utils/verdict.js — AÇIK / KAÇIN / BİLİNMİYOR mantığı
/src/components/FlightLineTimeline.jsx — görsel timeline
```

## Notlar

- API anahtarı sadece sunucu tarafında (`process.env.FINNHUB_API_KEY`) kullanılır, client'a açılmaz
- Veriler 12 saat cache'lenir (localStorage)
- Vercel edge'de 6 saat CDN cache (`s-maxage=21600`)
- Tüm UI metni Türkçe
