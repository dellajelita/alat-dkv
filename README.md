# AlatDKV — Sistem Peminjaman Alat Laboratorium DKV

Aplikasi web peminjaman alat Laboratorium Desain Komunikasi Visual (DKV) menggunakan Next.js (App Router), TypeScript, Tailwind CSS, dan Supabase[cite: 5].

## 1. Nama Aplikasi dan Alamat Vercel

- Nama Aplikasi: AlatDKV (Aplikasi Peminjaman Alat Laboratorium DKV)[cite: 5]
- Alamat Vercel: https://alat-dkv.vercel.app/

## 2. Cara Menjalankan di Laptop dan Nama Variabel Lingkungan

1. Pasang dependensi:
   npm install
2. Buat berkas `.env.local` (jangan di-commit ke Git) dengan nama variabel berikut (tanpa nilainya)[cite: 2, 4]:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   - SUPABASE_SECRET_KEY
   - ADMIN_PASSWORD
   - SESSION_SECRET
3. Jalankan skrip `database.sql` di Supabase untuk membuat tabel dan data contoh[cite: 2, 3, 4].
4. Jalankan aplikasi:
   npm run dev

## 3. Daftar Halaman dan Fungsinya

- `/` — Beranda: menampilkan alat yang aktif[cite: 3].
- `/alat` — Daftar alat aktif, jumlah tersedia, dan saring kategori (`kamera`, `pencahayaan`, `audio`, `tablet`, `aksesori`) lewat URL[cite: 3, 4].
- `/alat/[id]` — Detail alat, stok tersedia, dan tombol ajukan[cite: 3].
- `/ajukan` — Formulir peminjaman (alat, tanggal pinjam, tanggal kembali, jumlah, peminjam, kelas, keperluan) dengan galat per kolom dan isian tidak hilang saat galat[cite: 1, 3].
- `/cek` — Cek status dengan nomor + nama peminjam (keduanya harus cocok), termasuk status terlambat dan alasan penolakan[cite: 2, 3].
- `/login` — Login admin dengan kata sandi; yang sudah masuk dialihkan ke `/admin`, sandi salah tampil pesan galat[cite: 3].
- `/admin` — Daftar permohonan, saring status (termasuk terlambat), serta aksi Serahkan, Tolak (alasan), dan Kembalikan (kondisi)[cite: 3].
- `/admin/alat` — Kelola alat oleh admin: tambah alat, ubah stok, aktifkan/nonaktifkan, dan hapus[cite: 3].
- Tombol Keluar (Logout Admin) — Mengakhiri sesi dan kembali ke halaman login agar `/admin` tidak bisa dibuka lagi tanpa login[cite: 1, 3].

## 4. Aturan Bisnis dan Lapisan Penerapannya

- Jumlah 1–5 unit dan tidak melebihi stok alat; nama peminjam 3–40 huruf, kelas 3–20 huruf, keperluan 5–120 huruf (diperiksa di server dan batasan basis data)[cite: 1, 2, 3, 4].
- Satu peminjam paling banyak 2 permohonan aktif (`menunggu` atau `dipinjam`), nama tidak peka huruf besar/kecil (diperiksa di server)[cite: 1, 2, 4].
- Alat harus aktif; tanggal pinjam wajib, bukan tanggal lampau, paling jauh 14 hari ke depan, dan bukan Sabtu/Minggu; tanggal kembali tidak boleh sebelum tanggal pinjam dan paling lama 3 hari (diperiksa di server, serta rentang tanggal dasar di basis data)[cite: 1, 3, 4].
- Stok tersedia = stok dikurangi unit yang sedang dipinjam; permohonan `menunggu` tidak mengunci stok; penyerahan hanya bisa bila stok tersedia mencukupi (dijaga di server dan basis data)[cite: 1, 2, 4].
- Menolak wajib disertai alasan (minimal 5 huruf); mengembalikan wajib mencatat kondisi (`baik`, `rusak ringan`, `rusak berat`) dan tanggal pengembalian terisi otomatis hari ini (WIB); status terlambat bila masih `dipinjam` dan tanggal kembali sudah lewat[cite: 1, 2, 3, 4].
- Admin tidak boleh menurunkan stok di bawah unit yang sedang dipinjam, dan alat yang punya riwayat peminjaman tidak bisa dihapus dengan pesan ramah (dijaga di server dan basis data)[cite: 1, 2, 4].

## 5. Keamanan: Kunci yang Dipakai dan Penutupan RLS

- Kunci publik (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`): hanya bisa membaca (`SELECT`) tabel `alat`, tidak ada akses ke tabel `peminjaman_alat`[cite: 2, 3].
- Kunci rahasia (`SUPABASE_SECRET_KEY`): hanya dipakai di server untuk operasi data sesuai aturan dan sesi admin[cite: 1, 2, 3, 4].
- RLS (Row Level Security): aktif pada semua tabel untuk membatasi akses langsung dengan kunci publik[cite: 1, 2, 3, 4].

## 6. Satu Masalah yang Ditemui (Gejala, Penyebab, dan Perbaikan)

- Gejala: Galat ESLint (`react-hooks/set-state-in-effect`) pada `CekStatusClient.tsx` dan sinkronisasi state saat parameter pencarian di `/cek` berubah.
- Penyebab: Memanggil setter state secara sinkron di dalam `useEffect` dan mengisi state melalui effect.
- Perbaikan: Memindahkan pembaruan state ke dalam callback `.then(...)` di `useEffect` dan memakai `key` berdasarkan parameter pencarian di `/cek`.

## 7. Bagian yang Belum Selesai

- Seluruh fitur utama pada spesifikasi sudah diterapkan; sisa pengecekan akhir sebelum pengumpulan adalah memastikan minimal 12 commit bermakna di GitHub, verifikasi data contoh di Supabase, dan latihan demo/lisan[cite: 1, 2, 3, 4].
