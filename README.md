# SMK Prima Unggul - Sistem Manajemen Akademik Terpadu

Aplikasi manajemen sekolah modern dengan fitur Absensi (QR/Lokasi) dan Ujian Kejuruan online.

## Teknologi Utama
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Framer Motion
- **Backend/Database:** Supabase (PostgreSQL, Auth, RLS)
- **Deployment:** Vercel (Recomended)

## Cara Setup (PENTING)

### 1. Konfigurasi Database (Supabase)
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com).
2. Pergi ke **SQL Editor**.
3. Salin dan tempel isi dari file `supabase_schema.sql` (ada di root folder ini).
4. Klik **Run**. Ini akan membuat tabel, trigger profil otomatis, dan aturan keamanan (RLS).

### 2. Pengaturan Authentication
1. Di dashboard Supabase, masuk ke **Authentication** -> **Providers**.
2. Cari **Email**.
3. Matikan **"Confirm Email"** agar akun demo bisa langsung login tanpa verifikasi email.

### 3. Environment Variables
Buat file `.env` (atau isi di Secrets Vercel/AI Studio):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Instalasi Lokal
```bash
npm install
npm run dev
```

## Fitur Unggulan
- **Dashboard Multi-Role:** Admin, Guru, dan Siswa.
- **Sistem Absensi:** Pencatatan kehadiran real-time.
- **Ujian Kejuruan:** 30 soal per jurusan (TKJ, DKV, AK, BC, MPLB, BD).
- **Bootstrap Data:** Klik tombol "SIAPKAN DATA & AKUN DEMO" di halaman login untuk mengisi data awal.

## Pengguna Demo Bawaan
- **Admin:** `admin` / `password123`
- **Guru:** `guru_tkj` / `password123`
- **Siswa (TKJ):** `siswa_tkj` / `password123` (NISN: 1122334455 / Jurusan: TKJ)
