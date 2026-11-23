export type KategoriAlat =
  | "kamera"
  | "pencahayaan"
  | "audio"
  | "tablet"
  | "aksesori";

export type AlatItem = {
  id: number;
  nama: string;
  kategori: KategoriAlat;
  stok: number;
  keterangan: string;
  aktif: boolean;
  stok_tersedia: number;
};

export type AjukanPeminjamanState = {
  error?: string;
  success?: string;
};

const KATEGORI_VALID: KategoriAlat[] = [
  "kamera",
  "pencahayaan",
  "audio",
  "tablet",
  "aksesori",
];

export function isKategoriValid(value: string): value is KategoriAlat {
  return (KATEGORI_VALID as string[]).includes(value);
}

export function validasiInputPeminjaman(input: {
  alatId: number;
  peminjam: string;
  kelas: string;
  keperluan: string;
  jumlah: number;
  tglPinjam: string;
  tglKembali: string;
}): string | null {
  if (!Number.isInteger(input.alatId) || input.alatId <= 0) {
    return "Silakan pilih alat yang ingin dipinjam.";
  }

  const peminjamTrim = input.peminjam.trim();
  if (peminjamTrim.length < 3 || peminjamTrim.length > 40) {
    return "Nama peminjam harus terdiri dari 3 sampai 40 karakter.";
  }

  const kelasTrim = input.kelas.trim();
  if (kelasTrim.length < 3 || kelasTrim.length > 20) {
    return "Kelas harus terdiri dari 3 sampai 20 karakter.";
  }

  const keperluanTrim = input.keperluan.trim();
  if (keperluanTrim.length < 5 || keperluanTrim.length > 120) {
    return "Keperluan harus terdiri dari 5 sampai 120 karakter.";
  }

  if (!Number.isInteger(input.jumlah) || input.jumlah < 1 || input.jumlah > 5) {
    return "Jumlah unit yang dipinjam harus antara 1 sampai 5.";
  }

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (
    !isoDateRegex.test(input.tglPinjam) ||
    !isoDateRegex.test(input.tglKembali)
  ) {
    return "Format tanggal pinjam dan tanggal kembali tidak valid.";
  }

  if (input.tglKembali < input.tglPinjam) {
    return "Tanggal kembali tidak boleh lebih awal dari tanggal pinjam.";
  }

  return null;
}
