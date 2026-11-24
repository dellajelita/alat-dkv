# Lembar Perencanaan Waktu & Daftar Periksa Mandiri — AlatDKV

## 1. Rencana & Progres Waktu Pengerjaan

- **Tahap 1 — Basis Data & Keamanan:** Merancang tabel `alat` dan `peminjaman_alat` sesuai ERD dan kamus data, menerapkan Row Level Security (RLS) serta pembatasan hak akses kunci publik vs kunci rahasia, dan mengisi data contoh fiktif di Supabase (8 alat termasuk minimal 1 nonaktif; minimal 8 peminjaman termasuk yang terlambat). Status: **Selesai**.
- **Tahap 2 — Halaman & Fitur Aplikasi:** Membangun halaman katalog, detail alat, formulir pengajuan, pengecekan status, login/logout admin, serta pengelolaan peminjaman dan alat menggunakan Next.js (App Router), TypeScript, dan Tailwind CSS. Status: **Selesai**.
- **Tahap 3 — Aturan Bisnis, Build & Deploy:** Menerapkan validasi di server dan batasan di basis data dengan pesan ramah serta mempertahankan isian formulir saat galat, memastikan `npm run lint` dan `npm run build` lulus, serta menayangkan aplikasi di Vercel (`https://alat-dkv.vercel.app/`). Status: **Selesai**.
- **Tahap 4 — Dokumentasi, Riwayat Commit & Persiapan Presentasi:** Melengkapi `README.md` (7 butir tanpa nilai rahasia), menyimpan `database.sql` dan lembar perencanaan waktu, memastikan minimal 12 commit bermakna tanpa berkas `.env*`, menguji ulang di Vercel, serta menyiapkan demo (~3 menit) dan tanya jawab lisan (~2 menit). Status: **Sedang diperbarui**.

## 2. Daftar Periksa Mandiri Sebelum Dikumpulkan (Bagian H)

- [ ] Situs tayang di Vercel dan data berasal dari Supabase milik sendiri.
- [ ] Tabel sesuai ERD dan kamus data, dengan data contoh minimal sesuai ketentuan.
- [ ] Semua halaman dan aturan wajib pada spesifikasi berfungsi, termasuk saat sengaja dilanggar.
- [ ] Formulir menampilkan galat per kolom dan isian tidak hilang saat galat.
- [ ] Login dan logout berfungsi; setelah logout, `/admin` tidak dapat dibuka lagi.
- [ ] Hak akses tiap peran sesuai aturan; `/admin` tanpa login masuk ke halaman login, dan aksi admin tidak dapat dijalankan tanpa login.
- [ ] RLS aktif pada semua tabel dan kunci publik tidak dapat membaca tabel pribadi.
- [ ] Tidak ada kunci rahasia di GitHub, HTML situs, atau layar demo.
- [ ] `npm run lint` dan `npm run build` lulus.
- [ ] `README.md` lengkap dan repositori memiliki minimal 12 commit bermakna.
