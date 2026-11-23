import type { KategoriAlat } from "./peminjaman";

export type StatusPeminjaman =
  | "menunggu"
  | "dipinjam"
  | "dikembalikan"
  | "ditolak";

export type KondisiKembali = "baik" | "rusak ringan" | "rusak berat";

export type AdminAlatRow = {
  id: number;
  nama: string;
  kategori: KategoriAlat;
  stok: number;
  keterangan: string;
  aktif: boolean;
  sedang_dipinjam: number;
  stok_tersedia: number;
};

export type AdminPeminjamanRow = {
  id: number;
  alat_id: number;
  nama_alat: string;
  peminjam: string;
  kelas: string;
  keperluan: string;
  jumlah: number;
  tgl_pinjam: string;
  tgl_kembali: string;
  status: StatusPeminjaman;
  alasan_tolak: string | null;
  kondisi_kembali: KondisiKembali | null;
  tgl_dikembalikan: string | null;
  dibuat: string;
  terlambat: boolean;
};

export type RekapMetrikAdmin = {
  totalAlatAktif: number;
  menunggu: number;
  dipinjam: number;
  terlambat: number;
};

export type AdminActionState = {
  error?: string;
  success?: string;
};

export function getLocalDateIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isKondisiKembaliValid(value: string): value is KondisiKembali {
  return (
    value === "baik" || value === "rusak ringan" || value === "rusak berat"
  );
}
