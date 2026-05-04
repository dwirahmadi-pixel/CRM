# 🐔 AYAM.CRM — Panduan Deploy

Dashboard manajemen bisnis broker ayam: supplier, buyer, harga, pipeline, dan aktivitas.

---

## ⚡ Setup dalam 4 langkah (±15 menit)

### LANGKAH 1 — Setup Database di Supabase

1. Buka [supabase.com](https://supabase.com) → login
2. Klik **"New Project"** → isi nama project (misal: `ayam-crm`) → pilih region **Southeast Asia (Singapore)** → buat password database → klik **Create new project**
3. Tunggu project siap (~1 menit)
4. Di sidebar kiri, klik **SQL Editor**
5. Klik **"New query"**
6. Copy-paste seluruh isi file `supabase-schema.sql` → klik **Run**
7. Selesai! Database sudah siap dengan tabel dan data awal

### LANGKAH 2 — Ambil API Keys Supabase

1. Di Supabase dashboard, klik **Settings** (icon gear) di sidebar kiri
2. Klik **API**
3. Copy dua nilai ini:
   - **Project URL** (contoh: `https://abcdefgh.supabase.co`)
   - **anon public** key (string panjang)

### LANGKAH 3 — Upload Code ke GitHub

1. Buka [github.com](https://github.com) → login
2. Klik **"New repository"** → nama: `ayam-crm` → klik **Create repository**
3. Di komputer kamu, buka terminal/command prompt di folder project ini, lalu jalankan:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/USERNAME/ayam-crm.git
git push -u origin main
```

*(Ganti `USERNAME` dengan username GitHub kamu)*

### LANGKAH 4 — Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → login dengan GitHub
2. Klik **"Add New Project"**
3. Pilih repository `ayam-crm` → klik **Import**
4. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste Project URL dari langkah 2
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste anon key dari langkah 2
5. Klik **Deploy**
6. Tunggu ~2 menit → app kamu live! 🎉

---

## 💻 Menjalankan di komputer lokal (opsional)

```bash
# Install dependencies
npm install

# Buat file .env.local
cp .env.example .env.local
# Edit .env.local dan isi dengan API keys Supabase kamu

# Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Project

```
ayam-crm/
├── app/
│   ├── layout.tsx        # Layout utama
│   ├── page.tsx          # Halaman utama (routing tabs)
│   └── globals.css       # Styling global
├── components/
│   ├── Sidebar.tsx       # Navigasi sidebar
│   ├── Overview.tsx      # Tab overview & metrics
│   ├── Suppliers.tsx     # Tab supplier + update harga
│   ├── Buyers.tsx        # Tab buyer
│   ├── Pipeline.tsx      # Tab kanban pipeline
│   ├── Aktivitas.tsx     # Tab log aktivitas
│   ├── Modal.tsx         # Komponen modal reusable
│   └── Badge.tsx         # Komponen badge status
├── lib/
│   └── supabase.ts       # Supabase client
├── supabase-schema.sql   # SQL schema database
└── .env.example          # Template environment variables
```

---

## ❓ Troubleshooting

**Data tidak muncul?**
- Pastikan `.env.local` sudah diisi dengan benar
- Cek di Supabase > Table Editor apakah tabel sudah ada

**Error saat deploy Vercel?**
- Pastikan environment variables sudah ditambahkan di Vercel dashboard
- Cek build log untuk pesan error spesifik

**Ingin reset data?**
- Buka Supabase > SQL Editor → jalankan ulang `supabase-schema.sql`
