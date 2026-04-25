# Yapivo Landing Page

Modern, responsive landing page. Next.js 14 + TailwindCSS + Vercel.

## Hızlı Kurulum

### 1. Dosyaları İndir
Tüm dosyaları aynı klasöre koy. Yapı:
```
yapivo-landing/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
└── .gitignore
```

### 2. Bağımlılıkları Yükle
```bash
npm install
```

### 3. Yerel Sunucuda Çalıştır
```bash
npm run dev
```
Tarayıcıda açılacak: http://localhost:3000

### 4. Build Al (Production)
```bash
npm run build
npm run start
```

## GitHub'a Yükle

```bash
# Git repo başlat
git init

# İlk commit
git add .
git commit -m "Initial commit - Yapivo landing page"

# GitHub'a yükle (https://github.com/your-username/yapivo-landing)
git remote add origin https://github.com/[SENIN-USERNAME]/yapivo-landing.git
git branch -M main
git push -u origin main
```

## Vercel'e Deploy

1. vercel.com'a git, GitHub hesabınla gir
2. "New Project" → GitHub repo'yu seç
3. Framework: Next.js (otomatik bulunmalı)
4. Deploy'a bas

Deploy tamamlandıktan sonra Vercel URL'ini kopyala.

## Domain Bağlama (Cloudflare'de)

Vercel deployment URL'ini aldıktan sonra:

1. Cloudflare'de domain settings'e git
2. DNS Records bölümüne git
3. Şu CNAME kaydını ekle:
   - Type: CNAME
   - Name: www
   - Content: [Vercel URL]
   - TTL: Auto

4. Root domain (@) için:
   - Type: CNAME
   - Name: @
   - Content: [Vercel URL]

Yayılması 10 dakika ile 24 saat arası sürer.

## Değişiklik Yapma

Landing page'i değiştir, GitHub'a push et:

```bash
git add .
git commit -m "Mesaj yaz"
git push
```

Vercel otomatik deploy edecek.

## Özellikler

✓ Responsive (mobil, tablet, desktop)
✓ Hızlı (optimized images, lazy loading)
✓ SEO-friendly (Next.js metadata)
✓ Modern tasarım (Yapivo branding)
✓ Scroll animations
✓ Dark/Light friendly

## Sonraki Adımlar

- [ ] E-posta address'ini güncelle (hello@yapivo.com.tr)
- [ ] Analytics ekle (Google Analytics)
- [ ] Contact form ekle
- [ ] Blog sayfası
- [ ] Login page
