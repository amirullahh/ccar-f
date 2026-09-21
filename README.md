# Claude Exam Guide ID

Panduan belajar **Claude Certified Architect (Foundations) — CCAR-F** dalam Bahasa Indonesia santai.
5 domain, 30 modul, 100+ exam traps, kuis interaktif, exam simulator, cheat sheet, dan glossary.

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind CSS**. Nggak ada database, nggak ada
server API — semua halaman di-*prerender* jadi static HTML, dan progress belajar user disimpan
di `localStorage`. Artinya bisa di-hosting di tier gratis mana pun.

## Halaman

| Route | Isi |
|---|---|
| `/` | Landing page + breakdown bobot 5 domain |
| `/learn` | Kurikulum lengkap (5 domain + 30 modul, SSG) |
| `/learn/[domain]` | Overview per domain |
| `/learn/[domain]/[task]` | Materi + exam traps + concept check + build exercise |
| `/drill` | Drill mode per domain |
| `/exam-sim` | Simulator 60 soal / 120 menit, timer per soal |
| `/cheatsheet` | Quick reference semua decision rules & traps |
| `/glossary` | Kamus istilah |
| `/diagnostic` | Tes diagnostik buat nyari domain terlemah |
| `/progress` | Dashboard progress (localStorage) |

## Struktur konten

Konten mentah hasil scraping ada di folder **`materi/`** sebagai `*.md` (5 file domain overview + 30 file task + 5 file domain).
Itu **source of truth** dan wajib ikut ter-commit — jangan dihapus.

`scripts/build-content.mjs` mem-parse file-file itu jadi JSON terstruktur lalu menulis ke dua tempat:

- `content/*.json` — di-`import` langsung sama halaman (type-safe, ikut bundle).
- `public/content/*.json` — di-`fetch` saat runtime sama komponen client (biar `tasks.json` ~490 KB
  nggak ikut ke-bundle ke tiap halaman).

File JSON hasil generate **ikut di-commit** supaya repo bisa di-clone dan langsung di-deploy tanpa
langkah generate manual. Jangan edit manual file di `content/` — edit `.md`-nya atau
`scripts/answer-key.mjs`, terus jalanin ulang generator.

## Development

```bash
npm install
npm run dev        # generate konten + jalanin dev server
```

Script lain:

```bash
npm run content    # cuma regenerate JSON konten
npm run typecheck  # tsc --noEmit
npm run build      # build produksi (generate konten + next build)
```

## Environment variables

Semua opsional — lihat `.env.example`. Lokal: copy ke `.env.local`. Produksi: set di Vercel.

| Variable | Fungsi | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `metadataBase` + `sitemap.xml` | `https://claude-exam-guide.vercel.app` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 | — (nggak dirender) |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager | — (nggak dirender) |

## Deploy ke Vercel

Repo ini udah di-konfigurasi buat **zero-config deploy** — Vercel bakal auto-detect Next.js,
nggak butuh `vercel.json`.

### 1. Push ke GitHub

```bash
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

### 2. Import di Vercel

1. Buka [vercel.com/new](https://vercel.com/new) → pilih repo di atas → **Import**.
2. Biarin semua default:
   - **Framework Preset**: Next.js (auto)
   - **Build Command**: `npm run build` (auto dari `package.json`)
   - **Output Directory**: `.next` (auto)
   - **Install Command**: `npm install` (auto)
3. **Environment Variables** — set minimal satu ini:

   ```
   NEXT_PUBLIC_SITE_URL = https://<nama-project>.vercel.app
   ```

   (Tambahkan `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GTM_ID` kalau mau pakai analytics.)
4. Klik **Deploy**. Build pertama sekitar 1–2 menit (35 halaman lesson di-pre-render).

### 3. Setelah deploy

Kalau URL Vercel hasil deploy beda dari yang lu isi di langkah 2, update
`NEXT_PUBLIC_SITE_URL` lalu **Redeploy** biar OG tag dan sitemap-nya bener.

Kalau pakai custom domain: tambahkan di **Settings → Domains**, terus update
`NEXT_PUBLIC_SITE_URL` ke domain itu.

Setiap push ke branch `main` bakal auto-deploy ke production; branch lain jadi preview deployment.

### Catatan build di Vercel

- File `*.md` di `materi/` **harus ada** saat build, karena `npm run build` jalanin generator konten dulu.
- Nggak ada env var yang wajib — build tetap sukses walau semuanya kosong.
- `images.unoptimized: true` di `next.config.mjs` sengaja diset karena app ini nggak pakai
  image optimization (biar nggak butuh Image Optimization API).

## Lisensi

Konten materi diadaptasi dari [claudecertificationguide.com](https://claudecertificationguide.com/)
untuk keperluan belajar. Bukan afiliasi resmi Anthropic.
