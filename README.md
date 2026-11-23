# AlatDKV — Sistem Peminjaman Alat Laboratorium DKV

Aplikasi web peminjaman alat Laboratorium Desain Komunikasi Visual (DKV) yang dibangun menggunakan **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Supabase**.

## Fitur Utama

- **Katalog Alat Publik (`/`)**: Menampilkan daftar alat aktif beserta stok tersedia saat ini, pencarian kata kunci, filter kategori, serta form pengajuan peminjaman siswa.
- **Autentikasi Admin (`/login` & Logout)**: Sesi admin berbasis cookie `HttpOnly` bertanda tangan HMAC-SHA256 (`SESSION_SECRET`) dan verifikasi kata sandi (`ADMIN_PASSWORD`).
- **Dashboard Admin (`/admin`)**: Rekap metrik (total alat aktif, menunggu, sedang dipinjam, terlambat), kelola inventaris alat (tambah alat baru, ubah stok & keterangan, aktif/nonaktif), serta persetujuan, penolakan, dan pencatatan pengembalian peminjaman.

## Variabel Lingkungan

Salin `.env.example` menjadi `.env.local` dan isi variabel berikut (jangan masukkan nilai rahasia ke repositori):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ADMIN_PASSWORD=
SESSION_SECRET=
```
